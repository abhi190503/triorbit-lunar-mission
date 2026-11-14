'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { EventModalProps, GameEventChoice } from '@/lib/game/types';
import { ConsequencePanel } from './ConsequencePanel';

/**
 * EventModal
 *
 * Standalone, accessible, and responsive mission event modal.
 * Conforms strictly to docs/INTERFACES.md:
 * - Displays mission scenario information and authentic NASA provenance before choices
 * - Requires the commander to resolve the event before proceeding (no backdrop/Escape bypass)
 * - Emits onSelectChoice(choiceId) typed callback upon selection
 * - Renders ConsequencePanel displaying educational explanations and resource trade-offs
 * - Provides full keyboard accessibility (focus trap, Tab/Shift+Tab wrapping, Enter/Space activation)
 * - Operates independently of unfinished GameState, engine, or HUD components
 */
export function EventModal({ scenario, onSelectChoice, open }: EventModalProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const selectedChoiceId = scenario?.id ? selectedMap[scenario.id] || null : null;

  // Manage focus capture, focus restoration, and focus trap
  useEffect(() => {
    if (!open) {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
      return;
    }

    // Capture currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Focus first interactive element inside modal upon opening
    const timer = setTimeout(() => {
      if (!modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  // Trap keyboard focus and prevent Escape from dismissing unresolved events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Prevent Escape from dismissing an unresolved modal
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }

      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    []
  );

  if (!open || !scenario) {
    return null;
  }

  const selectedChoice: GameEventChoice | undefined = scenario.choices.find(
    (c) => c.id === selectedChoiceId
  );

  const handleSelect = (choiceId: string) => {
    if (selectedChoiceId) return; // Prevent double submission
    if (scenario?.id) {
      setSelectedMap((prev) => ({ ...prev, [scenario.id]: choiceId }));
    }
    onSelectChoice(choiceId);
  };

  const isNASA = scenario.sourceKind === 'NASA-observation';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="presentation"
      // Backdrop click intentionally does NOT dismiss unresolved events
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        aria-describedby="event-modal-desc"
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl my-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-cyan-950/40 p-5 sm:p-7 text-slate-100 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header / Day Badge */}
        <header className="space-y-2 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" aria-hidden="true" />
              Day {scenario.day} / 5 • Mission Anomaly Alert
            </span>

            {isNASA ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/90 text-blue-300 border border-blue-800/80">
                NASA Observation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-800/80">
                Educational Simulation
              </span>
            )}
          </div>

          <h2 id="event-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
            {scenario.title}
          </h2>
        </header>

        {/* NASA Telemetry & Scientific Caution Card */}
        {isNASA && scenario.source && (
          <aside
            aria-label="NASA Space Weather Bulletin"
            className="p-3.5 sm:p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 font-mono uppercase tracking-wider text-[11px] text-blue-300 font-semibold border-b border-blue-900/60 pb-1.5">
              <span>Telemetry: {scenario.source.source}</span>
              <span>Observed: {new Date(scenario.source.occurredAt).toUTCString()}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-slate-100">{scenario.source.title}</span>
              {scenario.source.sourceUrl && (
                <a
                  href={scenario.source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-[11px] self-start sm:self-auto focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1"
                >
                  View NASA Event Catalog ↗
                </a>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-normal border-t border-blue-900/40 pt-1.5">
              <strong className="text-blue-200">Scientific Caution:</strong> NASA DONKI records
              interplanetary space weather observations; they do not represent biological radiation
              absorption on the lunar surface.
            </p>
          </aside>
        )}

        {/* Educational Simulation Notice */}
        {!isNASA && (
          <aside className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400 font-mono">
            <strong>Training Simulation:</strong> Fictional lunar outpost dilemma. Manage life-support
            systems and tactical resource consumption.
          </aside>
        )}

        {/* Mission Briefing / Event Description */}
        <div id="event-modal-desc" className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {scenario.description}
        </div>

        {/* Decision Area */}
        <section aria-label="Available Orders" className="space-y-3 pt-1">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Commander Orders (Select One to Resolve):
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {scenario.choices.map((choice, index) => {
              const isSelected = selectedChoiceId === choice.id;
              const isOtherSelected = selectedChoiceId !== null && !isSelected;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelect(choice.id)}
                  disabled={selectedChoiceId !== null}
                  aria-pressed={isSelected}
                  className={`min-h-[50px] p-3.5 sm:p-4 text-left rounded-xl font-medium text-sm transition-all flex items-start gap-3 border focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400'
                      : isOtherSelected
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60 cursor-not-allowed'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-cyan-500 cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950'
                        : isOtherSelected
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="block leading-snug">{choice.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Consequence Presentation after Selection */}
        {selectedChoice && (
          <ConsequencePanel choice={selectedChoice} sourceKind={scenario.sourceKind} />
        )}

        {/* Integration Handoff Notice */}
        {selectedChoiceId && (
          <div className="text-center text-xs font-mono text-cyan-400 animate-pulse pt-2" aria-live="polite">
            ✓ Orders confirmed. Transmitting to Habitat Life Support...
          </div>
        )}
      </div>
    </div>
  );
}
