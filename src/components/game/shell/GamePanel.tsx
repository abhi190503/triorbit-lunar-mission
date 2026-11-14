'use client';

import React from 'react';

export type GamePanelVariant =
  | 'default'
  | 'surface'
  | 'elevated'
  | 'hud'
  | 'interactive'
  | 'alert';

export type GamePanelPadding = 'none' | 'sm' | 'md' | 'lg';

export interface GamePanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  as?: 'div' | 'section' | 'article' | 'aside';
  variant?: GamePanelVariant;
  padding?: GamePanelPadding;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerBadge?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_STYLES: Record<GamePanelVariant, string> = {
  default:
    'bg-[#101D35] border border-[#1F3352] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.6),0_0_1px_1px_rgba(96,229,244,0.08)]',
  surface:
    'bg-[#162640] border border-[#1F3352] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.6)]',
  elevated:
    'bg-[#203653] border border-[#38BDF8]/30 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),0_0_12px_rgba(96,229,244,0.15)]',
  hud:
    'bg-[#101D35]/90 backdrop-blur-md border border-[#1F3352] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
  interactive:
    'bg-[#162640] border border-[#1F3352] cursor-pointer hover:border-[#38BDF8] hover:shadow-[0_0_16px_rgba(96,229,244,0.25)] transition-all duration-200 active:scale-[0.99]',
  alert:
    'bg-[#162640] border-2 border-[#FF6B73] shadow-[0_0_20px_rgba(255,107,115,0.35)]',
};

const PADDING_STYLES: Record<GamePanelPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6 sm:p-8',
};

export function GamePanel({
  as: Component = 'div',
  variant = 'default',
  padding = 'md',
  title,
  subtitle,
  icon,
  headerBadge,
  headerActions,
  footer,
  children,
  className = '',
  ...rest
}: GamePanelProps) {
  const hasHeader = title || subtitle || icon || headerBadge || headerActions;

  return (
    <Component
      className={`
        rounded-xl text-[#F4F7FC] relative overflow-hidden
        ${VARIANT_STYLES[variant]}
        ${PADDING_STYLES[padding]}
        ${className}
      `}
      {...rest}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-[#1F3352]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="text-[#60E5F4] shrink-0" aria-hidden="true">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-bold tracking-tight text-[#F4F7FC] truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#A8B8D0] truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {(headerBadge || headerActions) && (
            <div className="flex items-center gap-2 shrink-0">
              {headerBadge}
              {headerActions}
            </div>
          )}
        </header>
      )}

      <div>{children}</div>

      {footer && (
        <footer className="pt-3 mt-3 border-t border-[#1F3352]/80 text-xs text-[#A8B8D0]">
          {footer}
        </footer>
      )}
    </Component>
  );
}

