'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { SCIENCE_FACTS, type ScienceFact } from '@/data/science-facts';

export interface ScienceDrawerProps {
  open: boolean;
  onClose: () => void;
  facts?: ScienceFact[];
}

/**
 * ScienceDrawer
 *
 * Standalone, accessible NASA learning panel for the TriOrbit Lunar Survival Simulator.
 * Conforms strictly to docs/INTERFACES.md, docs/SCIENCE_SOURCES.md, and docs/ASSUMPTIONS.md:
 * - Displays verified NASA space science facts calibrated for young learners (ages 7–12)
 * - Links authentic NASA space weather observations to in-game decision making
 * - Explains that NASA DONKI records interplanetary space weather, NOT measured lunar dose
 * - Labels all resource metrics as educational game assumptions (0–100)
 * - Provides keyboard accessibility (focus trap, Tab/Shift+Tab wrapping, Escape to close)
 * - Features verified, traceable external links to official NASA and CCMC resources
 */
export function ScienceDrawer({ open, onClose, facts = SCIENCE_FACTS }: ScienceDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Manage focus capture, focus restoration, and focus trap
  useEffect(() => {
    if (!open) {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
      return;
    }

    // Capture currently focused element to restore upon close
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Focus close button on open
    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  // Trap keyboard focus inside the drawer and handle Escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose]
  );

  if (!open) {
    return null;
  }

  const validFacts = facts && facts.length > 0 ? facts : SCIENCE_FACTS;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity"
      role="presentation"
      onClick={(e) => {
        // Dismiss when clicking on the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="science-drawer-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <header className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
              NASA Science & Space Weather
            </div>
            <h2 id="science-drawer-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mission Science Briefing
            </h2>
            <p className="text-xs text-slate-400">
              Real space exploration facts and NASA observations behind your survival mission.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close NASA Science Facts Drawer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          >
            <span className="text-xl leading-none" aria-hidden="true">✕</span>
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Scientific Honesty Notice Banner */}
          <aside
            aria-label="Scientific Honesty Notice"
            className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-1.5"
          >
            <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-[11px] text-blue-300">
              <span aria-hidden="true">🔬</span>
              <span>Scientific Honesty Notice:</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              NASA DONKI records authentic interplanetary space weather observations recorded by
              spacecraft detectors. These records <strong className="text-blue-200">do not</strong> represent
              measured biological radiation doses on the Moon&apos;s surface. All resource units in TriOrbit
              are simplified educational game points (0–100) calibrated for junior astronauts aged 7–12.
            </p>
          </aside>

          {/* Facts List */}
          <section aria-label="Curated Science Facts" className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Verified Scientific Knowledge Cards:
            </h3>

            <div className="space-y-4">
              {validFacts.map((fact) => {
                const isNASA = fact.category === 'NASA-observation';

                return (
                  <article
                    key={fact.id}
                    className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition space-y-3"
                  >
                    {/* Card Header & Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-slate-100 tracking-tight">
                        {fact.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                          isNASA
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}
                      >
                        {isNASA ? 'NASA Observation' : 'Science Concept'}
                      </span>
                    </div>

                    {/* Summary Headline */}
                    <p className="text-xs font-medium text-cyan-300 font-sans">
                      {fact.summary}
                    </p>

                    {/* Factual Explanation */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {fact.explanation}
                    </p>

                    {/* Gameplay Connection */}
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      <div className="font-mono text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                        <span aria-hidden="true">🎮</span>
                        <span>In Your Mission:</span>
                      </div>
                      <p className="text-slate-300 leading-normal">
                        {fact.gameplayConnection}
                      </p>
                    </div>

                    {/* Scientific Caveat if present */}
                    {fact.caution && (
                      <p className="text-[11px] text-amber-300/90 italic leading-normal border-l-2 border-amber-500/60 pl-2.5">
                        <strong>Science Boundary:</strong> {fact.caution}
                      </p>
                    )}

                    {/* Source Attribution & Link */}
                    <footer className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <span>Source: {fact.sourceName}</span>
                      {fact.sourceUrl && (
                        <a
                          href={fact.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1"
                          aria-label={`View NASA Reference for ${fact.title} (opens in new tab)`}
                        >
                          View Official Source ↗
                        </a>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 text-xs text-slate-400 font-mono shrink-0">
          <div>TriOrbit • NASA Space Apps 2026</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-sans font-semibold text-xs tracking-wider uppercase transition focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
          >
            Return to Mission
          </button>
        </footer>
      </div>
    </div>
  );
}
