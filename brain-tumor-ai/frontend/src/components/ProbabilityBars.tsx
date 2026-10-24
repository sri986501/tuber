import React from 'react';

interface ProbabilityBarsProps {
  probabilities: Record<string, number>;
  predictedClass?: string;
  className?: string;
}

export const ProbabilityBars: React.FC<ProbabilityBarsProps> = ({
  probabilities,
  predictedClass,
  className = '',
}) => {
  const entries = Object.entries(probabilities || {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="text-xs text-slate-500 font-light py-4 text-center">
        No class distribution data available.
      </div>
    );
  }

  const maxVal = Math.max(...entries.map(([, v]) => v), 0.001);

  // Clinical color helper based on pathology
  const getColorScheme = (clsName: string, isLeading: boolean) => {
    const lower = clsName.toLowerCase();
    if (lower.includes('bleed') || lower.includes('hemorrhag')) {
      return {
        bar: isLeading
          ? 'bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
          : 'bg-rose-500/40',
        text: isLeading ? 'text-rose-300 font-semibold' : 'text-slate-400',
        dot: 'bg-rose-400',
      };
    }
    if (lower.includes('ischem') || lower.includes('infarct')) {
      return {
        bar: isLeading
          ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
          : 'bg-amber-500/40',
        text: isLeading ? 'text-amber-300 font-semibold' : 'text-slate-400',
        dot: 'bg-amber-400',
      };
    }
    if (lower.includes('normal') || lower.includes('healthy') || lower.includes('no_tumor')) {
      return {
        bar: isLeading
          ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
          : 'bg-emerald-500/40',
        text: isLeading ? 'text-emerald-300 font-semibold' : 'text-slate-400',
        dot: 'bg-emerald-400',
      };
    }
    // Default cyan
    return {
      bar: isLeading
        ? 'bg-gradient-to-r from-cyan-400 to-teal-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
        : 'bg-cyan-500/40',
      text: isLeading ? 'text-cyan-300 font-semibold' : 'text-slate-400',
      dot: 'bg-cyan-400',
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {entries.map(([cls, prob], idx) => {
        const isLeading = idx === 0 || cls === predictedClass;
        const pct = (prob * 100).toFixed(1);
        const widthPct = Math.min(100, Math.max(4, (prob / maxVal) * 100));
        const colors = getColorScheme(cls, isLeading);

        return (
          <div key={cls} className="group">
            <div className="flex items-center justify-between text-xs mb-1.5 font-light">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                <span
                  className={`transition-colors capitalize ${
                    isLeading ? 'text-white font-medium' : 'text-slate-300'
                  }`}
                >
                  {cls.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={`font-mono text-xs ${colors.text}`}>{pct}%</span>
            </div>

            <div className="h-2.5 w-full bg-white/[0.05] rounded-full overflow-hidden p-[1px] border border-white/[0.04]">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
