import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

interface ConfusionMatrixProps {
  matrix?: number[][];
  classNames?: string[];
  className?: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  matrix,
  classNames = ['Bleeding', 'Ischemia', 'Normal'],
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  if (!matrix || matrix.length === 0) {
    return (
      <GlassCard title="Confusion Matrix" className={className}>
        <div className="py-12 text-center text-xs text-slate-500 font-light">
          Train or evaluate a model checkpoint to view the held-out test confusion matrix.
        </div>
      </GlassCard>
    );
  }

  // Calculate totals and max value for normalization
  const maxVal = Math.max(...matrix.flat(), 1);
  const totalSamples = matrix.flat().reduce((a, b) => a + b, 0);

  return (
    <GlassCard
      title="Confusion Matrix"
      subtitle="Held-out test set predictions vs ground-truth labels"
      className={className}
    >
      <div className="overflow-x-auto py-2">
        <div className="min-w-[420px] max-w-lg mx-auto">
          {/* Header Axis Label */}
          <div className="text-center text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">
            Predicted Class →
          </div>

          <div className="flex">
            {/* Y-Axis Label */}
            <div className="w-8 flex items-center justify-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 -rotate-90 whitespace-nowrap">
                ← Actual Ground Truth
              </span>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1">
              {/* Column Headers */}
              <div
                className="grid gap-2 mb-2"
                style={{
                  gridTemplateColumns: `repeat(${classNames.length}, minmax(0, 1fr))`,
                }}
              >
                {classNames.map((name) => (
                  <div
                    key={name}
                    className="text-center text-[11px] font-mono uppercase text-slate-300 truncate px-1"
                    title={name}
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {matrix.map((row, rIdx) => {
                  const actualClass = classNames[rIdx] || `Class ${rIdx}`;
                  return (
                    <div
                      key={rIdx}
                      className="grid gap-2 items-center"
                      style={{
                        gridTemplateColumns: `repeat(${classNames.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        const intensity = val / maxVal;
                        const isHovered =
                          hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;

                        return (
                          <div
                            key={cIdx}
                            onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative border ${
                              isHovered
                                ? 'scale-105 z-10 border-cyan-400/80 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                                : isDiagonal
                                ? 'border-cyan-500/20 bg-cyan-500/[0.12]'
                                : 'border-white/[0.04] bg-white/[0.02]'
                            }`}
                            style={{
                              backgroundColor: isDiagonal
                                ? `rgba(6, 182, 212, ${Math.max(0.08, intensity * 0.4)})`
                                : `rgba(255, 255, 255, ${Math.max(0.01, intensity * 0.08)})`,
                            }}
                          >
                            <span
                              className={`text-lg md:text-xl font-normal font-mono ${
                                isDiagonal ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {val}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {((val / totalSamples) * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive detail on hover */}
          {hoveredCell && (
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 font-light flex items-center justify-between">
              <span>
                Actual <strong className="text-white">{classNames[hoveredCell.row]}</strong> predicted as{' '}
                <strong className="text-cyan-300">{classNames[hoveredCell.col]}</strong>:
              </span>
              <span className="font-mono text-white text-sm">
                {matrix[hoveredCell.row][hoveredCell.col]} scans
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
