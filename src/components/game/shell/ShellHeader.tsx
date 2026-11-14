'use client';

import React from 'react';
import { GameBadge } from './GameBadge';

export interface ShellHeaderProps {
  day?: number;
  maxDays?: number;
  crewCount?: number;
  crewStatus?: string;
  actionsRemaining?: number;
  maxActions?: number;
  onOpenHelp?: () => void;
  onToggleSound?: () => void;
  isMuted?: boolean;
  onOpenScience?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function ShellHeader({
  day,
  maxDays = 5,
  crewCount = 3,
  crewStatus = 'NOMINAL',
  actionsRemaining,
  maxActions = 2,
  onOpenHelp,
  onToggleSound,
  isMuted = false,
  onOpenScience,
  rightSlot,
  className = '',
}: ShellHeaderProps) {
  return (
    <header
      role="banner"
      className={`
        w-full bg-[#101D35]/95 backdrop-blur-md border-b border-[#1F3352]
        px-3 sm:px-6 py-2.5 sm:py-3 z-30 select-none
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mission Branding & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#60E5F4]/15 border border-[#60E5F4]/40 text-[#60E5F4] font-mono font-bold text-xs sm:text-sm shadow-[0_0_10px_rgba(96,229,244,0.3)] shrink-0"
              aria-hidden="true"
            >
              ▲
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-xs sm:text-sm text-[#F4F7FC] uppercase font-mono">
                  TriOrbit
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#162640] text-[#60E5F4] border border-[#1F3352]">
                  LUNAR COMMAND
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-[#A8B8D0] uppercase tracking-wider font-mono truncate">
                Junior Astronaut Mission Trainer
              </p>
            </div>
          </div>

          {/* Telemetry Status Pills (Desktop & Tablet) */}
          {day !== undefined && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1F3352]">
              <GameBadge variant="cyan" size="sm">
                Day {day} / {maxDays}
              </GameBadge>
              <GameBadge variant="nominal" size="sm" pulse>
                Crew: {crewCount} {crewStatus}
              </GameBadge>
              {actionsRemaining !== undefined && (
                <GameBadge
                  variant={actionsRemaining > 0 ? 'amber' : 'muted'}
                  size="sm"
                >
                  Actions: {actionsRemaining} / {maxActions}
                </GameBadge>
              )}
            </div>
          )}
        </div>

        {/* Center: Mobile Day Indicator (< 640px) */}
        {day !== undefined && (
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <GameBadge variant="cyan" size="sm">
              Day {day}/{maxDays}
            </GameBadge>
            {actionsRemaining !== undefined && (
              <GameBadge
                variant={actionsRemaining > 0 ? 'amber' : 'muted'}
                size="sm"
                className="hidden sm:inline-flex max-[380px]:hidden"
              >
                {actionsRemaining}/{maxActions}
              </GameBadge>
            )}
          </div>
        )}

        {/* Right: Controls & Navigation Slots */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenScience && (
            <button
              type="button"
              onClick={onOpenScience}
              aria-label="Open NASA Science Drawer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#162640] text-[#60E5F4] border border-[#1F3352] hover:border-[#60E5F4] hover:bg-[#203653] transition-colors focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[44px] cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">NASA Science</span>
            </button>
          )}

          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-lg text-[#A8B8D0] bg-[#162640] border border-[#1F3352] hover:text-[#F4F7FC] hover:border-[#60E5F4] transition-colors focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              {isMuted ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
          )}

          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              aria-label="How to play mission guide"
              className="p-2 rounded-lg text-[#A8B8D0] bg-[#162640] border border-[#1F3352] hover:text-[#60E5F4] hover:border-[#60E5F4] transition-colors focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center font-mono font-bold text-xs cursor-pointer"
            >
              ?
            </button>
          )}

          {rightSlot}
        </div>
      </div>
    </header>
  );
}
