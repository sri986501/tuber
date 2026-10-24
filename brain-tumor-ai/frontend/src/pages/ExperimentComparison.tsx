import React, { useState, useEffect } from 'react';
import { ExperimentSummary } from '../types';
import { fetchExperiments, selectActiveModel } from '../services/api';
import { ExperimentTable } from '../components/ExperimentTable';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Layers, RefreshCw, AlertCircle } from 'lucide-react';

interface ExperimentComparisonProps {
  onModelChanged?: () => void;
}

export const ExperimentComparison: React.FC<ExperimentComparisonProps> = ({
  onModelChanged,
}) => {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadExperiments = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchExperiments();
      setExperiments(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load experiment tracking logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  const handleSelectModel = async (runId: string) => {
    setIsSwitching(true);
    setErrorMsg(null);
    try {
      await selectActiveModel(runId);
      await loadExperiments();
      if (onModelChanged) onModelChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch active model');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 liquid-glass rounded-full text-xs font-mono text-cyan-300 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>EXPERIMENT REGISTRY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Experiments
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Multi-architecture ablation studies and benchmark validation logs.
            </p>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadExperiments}
          >
            Refresh Runs
          </GlassButton>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm font-light flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Table View */}
        <ExperimentTable
          experiments={experiments}
          onSelectModel={handleSelectModel}
          isSwitching={isSwitching}
        />
      </div>
    </div>
  );
};
