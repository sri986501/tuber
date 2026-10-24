import React from 'react';
import { LiquidGlass } from './LiquidGlass';

interface MetricCardProps {
  label: string;
  value?: string | number | null;
  suffix?: string;
  subtext?: string;
  icon?: React.ReactNode;
  accent?: 'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  suffix = '',
  subtext,
  icon,
  accent = 'cyan',
  className = '',
}) => {
  const hasValue = value !== undefined && value !== null && value !== '';

  const accentStyles = {
    cyan: {
      border: 'hover:border-cyan-400/40',
      value: 'text-cyan-200',
      suffix: 'text-cyan-300',
      glow: 'shadow-[0_4px_24px_rgba(6,182,212,0.12)]',
    },
    emerald: {
      border: 'hover:border-emerald-400/40',
      value: 'text-emerald-200',
      suffix: 'text-emerald-300',
      glow: 'shadow-[0_4px_24px_rgba(16,185,129,0.12)]',
    },
    amber: {
      border: 'hover:border-amber-400/40',
      value: 'text-amber-200',
      suffix: 'text-amber-300',
      glow: 'shadow-[0_4px_24px_rgba(245,158,11,0.12)]',
    },
    indigo: {
      border: 'hover:border-indigo-400/40',
      value: 'text-indigo-200',
      suffix: 'text-indigo-300',
      glow: 'shadow-[0_4px_24px_rgba(99,102,241,0.12)]',
    },
    rose: {
      border: 'hover:border-rose-400/40',
      value: 'text-rose-200',
      suffix: 'text-rose-300',
      glow: 'shadow-[0_4px_24px_rgba(244,63,94,0.12)]',
    },
    slate: {
      border: 'hover:border-white/20',
      value: 'text-white',
      suffix: 'text-slate-300',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    },
  }[accent];

  return (
    <LiquidGlass
      rounded="2xl"
      className={`p-5 flex flex-col justify-between transition-all duration-300 ${accentStyles.border} ${accentStyles.glow} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
          {label}
        </span>
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
      </div>

      <div>
        <div className="text-2xl md:text-3xl font-normal tracking-tight flex items-baseline gap-1 font-sans">
          {hasValue ? (
            <>
              <span className={`text-white`}>
                {typeof value === 'number' && suffix === '%'
                  ? (value <= 1.0 ? value * 100 : value).toFixed(1)
                  : value}
              </span>
              {suffix && <span className={`text-sm font-mono font-medium ${accentStyles.suffix}`}>{suffix}</span>}
            </>
          ) : (
            <span className="text-xs text-slate-500 font-light">Awaiting data</span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-slate-400 font-light mt-1.5 leading-snug">
            {subtext}
          </p>
        )}
      </div>
    </LiquidGlass>
  );
};
