import React from 'react';

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'dark' | 'interactive';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  variant = 'standard',
  rounded = '2xl',
  ...props
}) => {
  const baseVariant = variant === 'dark' ? 'liquid-glass-dark' : 'liquid-glass';
  const interactiveStyles =
    variant === 'interactive'
      ? 'hover:bg-white/[0.04] transition-all duration-300 cursor-pointer active:scale-[0.99]'
      : '';

  return (
    <div
      className={`${baseVariant} ${roundedMap[rounded]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
