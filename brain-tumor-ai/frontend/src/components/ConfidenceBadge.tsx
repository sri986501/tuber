import React from 'react';
import { ConfidenceStatus } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfidenceBadgeProps {
  status: ConfidenceStatus | string;
  confidence?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  status,
  confidence,
  showText = true,
  size = 'md',
}) => {
  const normStatus = (status || '').toUpperCase();
  const isHigh = normStatus.includes('HIGH');
  const isUncertain = normStatus.includes('UNCERTAIN') || normStatus.includes('LOW');

  let bgClass = 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20';
  let Icon = ShieldCheck;
  let label = 'HIGH CONFIDENCE';
  let description = 'Model confidence is high.';

  if (isUncertain) {
    bgClass = 'bg-rose-500/10 text-rose-300 border-rose-400/20';
    Icon = ShieldAlert;
    label = 'UNCERTAIN';
    description =
      'The model does not have sufficient confidence for a reliable automated classification.';
  } else if (!isHigh) {
    bgClass = 'bg-amber-500/10 text-amber-300 border-amber-400/20';
    Icon = AlertTriangle;
    label = 'MODERATE CONFIDENCE';
    description = 'Prediction should be interpreted with caution.';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3.5 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2.5',
  }[size];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${bgClass}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="tracking-wide uppercase font-semibold">{label}</span>
        {confidence !== undefined && (
          <span className="text-white/80 font-normal pl-1 border-l border-white/10">
            {(confidence * 100).toFixed(1)}%
          </span>
        )}
      </div>
      {showText && (
        <p className="text-[11px] text-slate-400 font-light max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
