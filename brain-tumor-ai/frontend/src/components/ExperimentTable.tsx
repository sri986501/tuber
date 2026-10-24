import React from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { ExperimentSummary } from '../types';
import { Check, CheckCircle2, Clock } from 'lucide-react';

interface ExperimentTableProps {
  experiments: ExperimentSummary[];
  onSelectModel: (runId: string) => Promise<void>;
  isSwitching?: boolean;
  className?: string;
}

export const ExperimentTable: React.FC<ExperimentTableProps> = ({
  experiments,
  onSelectModel,
  isSwitching,
  className = '',
}) => {
  if (experiments.length === 0) {
    return (
      <GlassCard title="Experiment Runs" className={className}>
        <div className="py-12 text-center text-xs text-slate-500 font-light">
          No training runs logged yet. Execute <code>train.py</code> to register benchmark runs.
        </div>
      </GlassCard>
    );
  }

  // Identify best run by F1
  const bestRunId = experiments.reduce((best, cur) => {
    return cur.f1_macro > (best?.f1_macro || 0) ? cur : best;
  }, experiments[0])?.run_id;

  return (
    <GlassCard
      title="Experiment Benchmarks"
      subtitle="Evaluated architectures & multi-model ablation results"
      className={className}
    >
      <div className="overflow-x-auto -mx-6 md:-mx-8">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-6 md:px-8">Model</th>
              <th className="py-3 px-4">Accuracy</th>
              <th className="py-3 px-4">Macro F1</th>
              <th className="py-3 px-4">ROC-AUC</th>
              <th className="py-3 px-4">Parameters</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6 md:px-8 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {experiments.map((exp) => {
              const isBest = exp.run_id === bestRunId && exp.f1_macro > 0;
              const isActive = exp.is_active;

              return (
                <tr
                  key={exp.run_id}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    isActive ? 'bg-cyan-500/[0.04]' : ''
                  }`}
                >
                  <td className="py-4 px-6 md:px-8">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white capitalize">
                        {exp.model_name.replace(/_/g, ' ')}
                      </span>
                      {isBest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                          Best validation result
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      {exp.run_id}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-300">
                    {exp.accuracy > 0 ? `${(exp.accuracy * 100).toFixed(1)}%` : '—'}
                  </td>

                  <td className="py-4 px-4 font-mono font-medium text-white">
                    {exp.f1_macro > 0 ? `${(exp.f1_macro * 100).toFixed(1)}%` : '—'}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-300">
                    {exp.roc_auc_macro > 0 ? exp.roc_auc_macro.toFixed(3) : '—'}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-400">
                    {exp.total_parameters > 0
                      ? `${(exp.total_parameters / 1e6).toFixed(1)}M`
                      : '—'}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-400">
                    {exp.mean_inference_time_ms > 0
                      ? `${exp.mean_inference_time_ms} ms`
                      : '—'}
                  </td>

                  <td className="py-4 px-4">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3 h-3" /> Standby
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 md:px-8 text-right">
                    {!isActive && (
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        disabled={isSwitching}
                        onClick={() => onSelectModel(exp.run_id)}
                      >
                        Activate
                      </GlassButton>
                    )}
                    {isActive && (
                      <span className="text-[11px] font-mono text-slate-500 pr-2">
                        Loaded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
