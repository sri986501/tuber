import React, { useState, useEffect } from 'react';
import { ModelInfo, ModelMetrics } from '../types';
import { fetchActiveMetrics } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { BarChart2, ShieldCheck, Activity, Cpu, Sparkles, RefreshCw } from 'lucide-react';

interface ModelPerformanceProps {
  modelInfo: ModelInfo | null;
  onModelChanged?: () => void;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({
  modelInfo,
  onModelChanged,
}) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [externalMetrics, setExternalMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const m = await fetchActiveMetrics();
      setMetrics(m);

      // Also try fetching external metrics
      const extRes = await fetch('/api/external-metrics');
      if (extRes.ok) {
        const extData = await extRes.json();
        if (!extData.message) setExternalMetrics(extData);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelInfo?.checkpoint_path]);

  const hasMetrics = metrics && metrics.accuracy !== undefined && metrics.accuracy > 0;

  return (
    <div className="relative min-h-[90vh] pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 liquid-glass rounded-full text-xs font-mono text-cyan-300 mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>TEST SET EVALUATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Model Performance
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Objective benchmark metrics evaluated on strictly held-out test partitions.
            </p>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh Metrics
          </GlassButton>
        </div>

        {!hasMetrics ? (
          /* Empty State */
          <GlassCard className="text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-2xl liquid-glass mx-auto flex items-center justify-center text-slate-400">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-normal text-white">No trained model metrics available yet</h3>
            <p className="text-xs text-slate-400 font-light max-w-md mx-auto">
              Execute <code>train.py</code> or evaluate a model checkpoint to populate test accuracy,
              confusion matrix, and calibration results.
            </p>
          </GlassCard>
        ) : (
          /* Metrics Grid & Visualizations */
          <div className="space-y-8">
            {/* Primary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <MetricCard
                label="Accuracy"
                value={metrics.accuracy}
                suffix="%"
                subtext="Overall test accuracy"
                accent="cyan"
              />
              <MetricCard
                label="Macro F1"
                value={metrics.f1_macro}
                suffix="%"
                subtext="Unweighted class F1"
                accent="emerald"
              />
              <MetricCard
                label="ROC-AUC"
                value={metrics.roc_auc_macro?.toFixed(3) || '—'}
                subtext="Multi-class discrimination"
                accent="indigo"
              />
              <MetricCard
                label="Sensitivity"
                value={metrics.recall_macro || metrics.sensitivity}
                suffix="%"
                subtext="Macro recall rate"
                accent="amber"
              />
              <MetricCard
                label="Specificity"
                value={metrics.specificity_macro}
                suffix="%"
                subtext="Macro specificity"
                accent="cyan"
              />
              <MetricCard
                label="Calib Error"
                value={metrics.ece_calibrated?.toFixed(4) || '—'}
                subtext="Post-hoc ECE score"
                accent="rose"
              />
            </div>

            {/* Main Visualizations: Confusion Matrix & Per-Class Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Confusion Matrix (8 cols) */}
              <div className="lg:col-span-8">
                <ConfusionMatrix
                  matrix={metrics.confusion_matrix}
                  classNames={metrics.class_names}
                />
              </div>

              {/* Per-Class Metrics Table (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <GlassCard title="Per-Class Metrics" subtitle="Performance across pathology classes">
                  <div className="space-y-4">
                    {metrics.class_names.map((cls) => {
                      const perf = metrics.per_class?.[cls];
                      return (
                        <div
                          key={cls}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white capitalize">
                              {cls.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-mono text-cyan-300">
                              {perf ? `${(perf.f1_score * 100).toFixed(1)}% F1` : '—'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">Prec</span>
                              <span>{perf ? `${(perf.precision * 100).toFixed(0)}%` : '—'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">Recall</span>
                              <span>{perf ? `${(perf.recall * 100).toFixed(0)}%` : '—'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">Spec</span>
                              <span>{perf ? `${(perf.specificity * 100).toFixed(0)}%` : '—'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* External Clinical Validation (if available) */}
                {externalMetrics && (
                  <GlassCard
                    title="External Test Cohort"
                    subtitle="Generalization benchmark on unseen clinical scans"
                  >
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <span className="text-slate-400">External Scans</span>
                        <span className="font-mono text-white">
                          {externalMetrics.external_test_samples}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <span className="text-slate-400">Stroke Detection Accuracy</span>
                        <span className="font-mono text-cyan-300 font-medium">
                          {(externalMetrics.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <span className="text-slate-400">Stroke Sensitivity (Recall)</span>
                        <span className="font-mono text-white">
                          {(externalMetrics.sensitivity_recall * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <span className="text-slate-400">Normal Specificity</span>
                        <span className="font-mono text-white">
                          {(externalMetrics.specificity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">External ROC-AUC</span>
                        <span className="font-mono text-white">
                          {externalMetrics.roc_auc?.toFixed(3) || '—'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
