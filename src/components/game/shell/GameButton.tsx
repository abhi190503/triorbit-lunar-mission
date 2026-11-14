'use client';

import React, { forwardRef } from 'react';

export type GameButtonVariant =
  | 'primary'
  | 'secondary'
  | 'amber'
  | 'danger'
  | 'outline'
  | 'ghost';

export type GameButtonSize = 'sm' | 'md' | 'lg';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const VARIANT_STYLES: Record<GameButtonVariant, string> = {
  primary:
    'bg-[#60E5F4] text-[#080F20] font-bold shadow-[0_0_12px_rgba(96,229,244,0.25)] hover:bg-[#88EEF8] hover:shadow-[0_0_20px_rgba(96,229,244,0.5)] active:bg-[#38BDF8] active:scale-[0.98]',
  secondary:
    'bg-[#162640] text-[#F4F7FC] border border-[#1F3352] font-semibold hover:border-[#60E5F4] hover:bg-[#203653] hover:text-[#60E5F4] active:scale-[0.98]',
  amber:
    'bg-[#FFCA72] text-[#080F20] font-bold shadow-[0_0_12px_rgba(255,202,114,0.25)] hover:bg-[#FFD68F] hover:shadow-[0_0_20px_rgba(255,202,114,0.5)] active:bg-[#F59E0B] active:scale-[0.98]',
  danger:
    'bg-[#FF6B73] text-[#080F20] font-bold shadow-[0_0_12px_rgba(255,107,115,0.25)] hover:bg-[#FF888E] hover:shadow-[0_0_20px_rgba(255,107,115,0.5)] active:bg-[#EF4444] active:scale-[0.98]',
  outline:
    'bg-transparent text-[#F4F7FC] border border-[#1F3352] font-semibold hover:border-[#60E5F4] hover:text-[#60E5F4] hover:bg-[#162640]/50 active:scale-[0.98]',
  ghost:
    'bg-transparent text-[#A8B8D0] font-medium hover:text-[#F4F7FC] hover:bg-[#162640]/60 active:scale-[0.98]',
};

const SIZE_STYLES: Record<GameButtonSize, string> = {
  sm: 'text-xs py-1.5 px-3 rounded min-h-[36px] gap-1.5',
  md: 'text-sm py-2.5 px-4 rounded-lg min-h-[44px] gap-2',
  lg: 'text-base py-3.5 px-6 rounded-xl min-h-[48px] gap-2.5',
};

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      iconLeft,
      iconRight,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center select-none tracking-wide transition-all duration-150 cursor-pointer motion-reduce:transition-none motion-reduce:transform-none
          focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080F20] focus-visible:outline-none
          ${fullWidth ? 'w-full' : ''}
          ${SIZE_STYLES[size]}
          ${isDisabled
            ? 'bg-[#162640] text-[#5A6E85] border border-[#1F3352] opacity-50 cursor-not-allowed shadow-none hover:scale-100 hover:shadow-none hover:border-[#1F3352] active:scale-100'
            : VARIANT_STYLES[variant]
          }
          ${className}
        `}
        {...rest}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2" role="status">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          <>
            {iconLeft && <span className="inline-flex shrink-0" aria-hidden="true">{iconLeft}</span>}
            <span>{children}</span>
            {iconRight && <span className="inline-flex shrink-0" aria-hidden="true">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

GameButton.displayName = 'GameButton';
