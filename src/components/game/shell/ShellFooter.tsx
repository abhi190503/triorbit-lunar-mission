'use client';

import React from 'react';

export interface ShellFooterProps {
  className?: string;
  showAiDisclosure?: boolean;
}

export function ShellFooter({
  className = '',
  showAiDisclosure = true,
}: ShellFooterProps) {
  return (
    <footer
      role="contentinfo"
      className={`
        w-full border-t border-[#1F3352]/70 bg-[#080F20]/90 backdrop-blur-sm
        px-4 sm:px-6 py-3 sm:py-4 text-xs text-[#A8B8D0] select-none
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Mission challenge notice */}
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#F4F7FC] font-semibold text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60E5F4]" aria-hidden="true" />
            <span>TriOrbit Lunar Survival Simulator</span>
            <span className="text-[#5A6E85]">•</span>
            <span className="text-[#60E5F4]">NASA Space Apps Challenge 2026</span>
          </div>
          <p className="text-[11px] text-[#A8B8D0] max-w-xl">
            Educational simulator with authentic NASA DONKI space weather telemetry. Vitals are normalized 0–100 game points for classroom learning.
          </p>
          {showAiDisclosure && (
            <p className="text-[10px] text-[#5A6E85]">
              Concept illustrations prepared with AI assistance specifically for TriOrbit. Contains zero official NASA logos or agency seals.
            </p>
          )}
        </div>

        {/* Tech stack badge list */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#5A6E85] shrink-0">
          <span className="hover:text-[#A8B8D0] transition-colors">Next.js 16</span>
          <span>•</span>
          <span className="hover:text-[#A8B8D0] transition-colors">TypeScript</span>
          <span>•</span>
          <span className="hover:text-[#A8B8D0] transition-colors">Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
