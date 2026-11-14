'use client';

import React, { useEffect, useRef } from 'react';

export interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
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

    // Save previous active element before opening so focus returns to the trigger on dismissal
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Lock body scrolling while dialog is active
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Helper to query all keyboard-focusable interactive elements inside the modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!dialogRef.current) return [];
      const selector =
        'button:not([disabled]):not([aria-hidden="true"]), [href]:not([aria-hidden="true"]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(dialogRef.current.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Modal focus containment (Tab / Shift+Tab trapping)
      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Backward tab: wrap from first (or modal card itself) to last
          if (document.activeElement === first || document.activeElement === dialogRef.current) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Forward tab: wrap from last to first
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on dialog container
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;

      // Restore focus smoothly to the original triggering element
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-[#040812]/85 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal Dialog Card with responsive viewport max-height and internal scrolling */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative w-full ${MAX_WIDTH_STYLES[maxWidth]} z-10 my-auto flex flex-col
          max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]
          bg-[#101D35] border border-[#38BDF8]/40 rounded-2xl
          shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_24px_rgba(96,229,244,0.18)]
          overflow-hidden focus:outline-none animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header (pinned to top) */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-[#1F3352] bg-[#162640]/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span className="text-[#60E5F4] p-2 rounded-lg bg-[#60E5F4]/10 border border-[#60E5F4]/20 shrink-0" aria-hidden="true">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-base sm:text-xl font-bold text-[#F4F7FC] tracking-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#A8B8D0] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#A8B8D0] hover:text-[#60E5F4] hover:bg-[#162640] p-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 cursor-pointer"
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

        {/* Content Body (scrolls smoothly when taller than viewport) */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 text-sm sm:text-base text-[#F4F7FC] overscroll-contain">
          {children}
        </div>

        {/* Footer Actions (pinned to bottom) */}
        {footerActions && (
          <div className="flex items-center justify-end gap-3 p-3.5 sm:p-5 border-t border-[#1F3352] bg-[#080F20]/50 shrink-0">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
