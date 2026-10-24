import React from 'react';
import { LiquidGlass } from './LiquidGlass';

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'dark' | 'interactive';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  className = '',
  variant = 'standard',
  ...props
}) => {
  return (
    <LiquidGlass variant={variant} className={`p-6 md:p-8 ${className}`} {...props}>
      {(title || subtitle || badge) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && (
              <h3 className="text-lg md:text-xl font-normal text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-400 font-light mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
      {children}
    </LiquidGlass>
  );
};
