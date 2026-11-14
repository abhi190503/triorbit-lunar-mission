'use client';

import React, { useEffect, useRef } from 'react';

export interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}

const MAX_WIDTH_STYLES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function GameModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footerActions,
  maxWidth = 'md',
  closeOnBackdropClick = true,
}: GameModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Save previous active element to restore upon close
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Focus inside modal
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-[#040812]/85 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative w-full ${MAX_WIDTH_STYLES[maxWidth]} z-10 my-8
          bg-[#101D35] border border-[#38BDF8]/40 rounded-2xl
          shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_24px_rgba(96,229,244,0.18)]
          overflow-hidden focus:outline-none animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[#1F3352] bg-[#162640]/50">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-[#60E5F4] p-2 rounded-lg bg-[#60E5F4]/10 border border-[#60E5F4]/20 shrink-0" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              <h2 id={titleId} className="text-lg sm:text-xl font-bold text-[#F4F7FC] tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#A8B8D0] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#A8B8D0] hover:text-[#60E5F4] hover:bg-[#162640] p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto text-sm sm:text-base text-[#F4F7FC]">
          {children}
        </div>

        {/* Footer Actions */}
        {footerActions && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-[#1F3352] bg-[#080F20]/50">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
