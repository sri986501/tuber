import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'emerald' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  glow = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[38px] px-4 py-1.5 text-xs gap-2',
    md: 'min-h-[44px] px-6 py-2.5 text-sm gap-2.5',
    lg: 'min-h-[50px] px-8 py-3.5 text-base gap-3',
  }[size];

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-secondary border-cyan-400/40 text-cyan-200',
    emerald: 'btn-secondary border-emerald-400/40 text-emerald-300',
    ghost: 'btn-ghost',
  }[variant];

  const glowEffect = glow ? 'animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.5)]' : '';

  return (
    <button
      disabled={disabled}
      className={`${variantClass} ${sizeClasses} ${glowEffect} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
      <span className="tracking-tight">{children}</span>
    </button>
  );
};
