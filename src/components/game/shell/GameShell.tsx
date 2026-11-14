'use client';

import React from 'react';
import { ShellHeader, ShellHeaderProps } from './ShellHeader';
import { ShellFooter, ShellFooterProps } from './ShellFooter';

export type GameShellLayoutMode = 'stage' | 'contained' | 'full';

export interface GameShellProps {
  children: React.ReactNode;
  headerProps?: ShellHeaderProps;
  customHeader?: React.ReactNode;
  showHeader?: boolean;
  footerProps?: ShellFooterProps;
  customFooter?: React.ReactNode;
  showFooter?: boolean;
  layoutMode?: GameShellLayoutMode;
  overlaySlot?: React.ReactNode;
  className?: string;
  stageClassName?: string;
}

export function GameShell({
  children,
  headerProps,
  customHeader,
  showHeader = true,
  footerProps,
  customFooter,
  showFooter = true,
  layoutMode = 'contained',
  overlaySlot,
  className = '',
  stageClassName = '',
}: GameShellProps) {
  return (
    <div
      className={`
        min-h-screen w-full flex flex-col bg-[#080F20] text-[#F4F7FC] relative overflow-x-hidden
        bg-space-mesh
        ${className}
      `}
    >
      {/* Accessible Skip Link */}
      <a
        href="#main-stage"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#60E5F4] focus:text-[#080F20] focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header Landmark */}
      {showHeader && (
        customHeader || <ShellHeader {...headerProps} />
      )}

      {/* Main Game Stage Landmark */}
      <main
        id="main-stage"
        tabIndex={-1}
        className={`
          flex-1 flex flex-col w-full relative outline-none
          ${layoutMode === 'contained' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6' : ''}
          ${layoutMode === 'stage' ? 'w-full h-full max-w-full p-2 sm:p-4' : ''}
          ${layoutMode === 'full' ? 'w-full p-0' : ''}
          ${stageClassName}
        `}
      >
        {children}
      </main>

      {/* Footer Landmark */}
      {showFooter && (
        customFooter || <ShellFooter {...footerProps} />
      )}

      {/* Floating Modals / Drawers / Toasts Portal Container */}
      {overlaySlot && (
        <div id="game-overlay-root" className="relative z-40">
          {overlaySlot}
        </div>
      )}
    </div>
  );
}
