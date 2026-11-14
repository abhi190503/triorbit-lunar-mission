'use client';

import React from 'react';

export type GameBadgeVariant =
  | 'nominal'
  | 'warning'
  | 'critical'
  | 'cyan'
  | 'amber'
  | 'blue'
  | 'muted';

export type GameBadgeSize = 'sm' | 'md';

export interface GameBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: GameBadgeVariant;
  size?: GameBadgeSize;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const BADGE_STYLES: Record<
  GameBadgeVariant,
  { container: string; dot: string }
> = {
  nominal: {
    container: 'bg-[#59DDA5]/12 text-[#59DDA5] border-[#59DDA5]/30',
    dot: 'bg-[#59DDA5]',
  },
  warning: {
    container: 'bg-[#FF9F5A]/12 text-[#FF9F5A] border-[#FF9F5A]/30',
    dot: 'bg-[#FF9F5A]',
  },
  critical: {
    container: 'bg-[#FF6B73]/12 text-[#FF6B73] border-[#FF6B73]/30',
    dot: 'bg-[#FF6B73]',
  },
  cyan: {
    container: 'bg-[#60E5F4]/12 text-[#60E5F4] border-[#60E5F4]/30',
    dot: 'bg-[#60E5F4]',
  },
  amber: {
    container: 'bg-[#FFCA72]/12 text-[#FFCA72] border-[#FFCA72]/30',
    dot: 'bg-[#FFCA72]',
  },
  blue: {
    container: 'bg-[#5C9CFF]/12 text-[#5C9CFF] border-[#5C9CFF]/30',
    dot: 'bg-[#5C9CFF]',
  },
  muted: {
    container: 'bg-[#162640]/50 text-[#A8B8D0] border-[#1F3352]',
    dot: 'bg-[#A8B8D0]',
  },
};

const SIZE_STYLES: Record<GameBadgeSize, string> = {
  sm: 'text-[10px] leading-3 px-2 py-0.5 gap-1 rounded',
  md: 'text-xs leading-4 px-2.5 py-1 gap-1.5 rounded-md',
};

export function GameBadge({
  children,
  variant = 'cyan',
  size = 'md',
  pulse = false,
  icon,
  className = '',
  ...rest
}: GameBadgeProps) {
  const styles = BADGE_STYLES[variant];

  return (
    <span
      className={`
        inline-flex items-center font-mono font-medium tracking-wide uppercase border select-none
        ${styles.container}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...rest}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
