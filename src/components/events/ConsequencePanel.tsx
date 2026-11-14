'use client';

import React from 'react';
import type { GameEventChoice, ResourceKey } from '@/lib/game/types';

export interface ConsequencePanelProps {
  choice: GameEventChoice;
  sourceKind?: 'NASA-observation' | 'educational-simulation';
}

const RESOURCE_LABELS: Record<ResourceKey, string> = {
  oxygen: 'Oxygen (O₂)',
  power: 'Habitat Power',
  water: 'Potable Water',
  food: 'Food Stores',
  radiationRisk: 'Radiation Risk Alert',
};

/**
 * ConsequencePanel
 *
 * Presentation-only panel displaying the educational consequence and resource
 * trade-offs of the commander's selected event choice.
 * Conforms strictly to docs/INTERFACES.md and docs/ASSUMPTIONS.md:
 * - Displays exact educational explanation from the scenario record
 * - Breaks down game-point deltas (clamped to educational units, not SI/dosimetry)
 * - Highlights tactical mistakes and scoring penalties when isMistake is true
 */
export function ConsequencePanel({ choice, sourceKind }: ConsequencePanelProps) {
  const effects = Object.entries(choice.effect) as [ResourceKey, number][];

  return (
    <section
      aria-label="Decision Outcome"
      className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-inner space-y-4"
    >
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
            Orders Confirmed: {choice.label}
          </h3>
        </div>
        {choice.isMistake && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-800/80">
            Hazardous Decision (+1 Emergency Mistake)
          </span>
        )}
      </div>

      {/* Educational Explanation */}
      <div className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/70">
        <p className="font-medium text-slate-300 mb-1 text-xs uppercase tracking-wider">
          Mission Control Debrief:
        </p>
        <p>{choice.explanation}</p>
      </div>

      {/* Resource Trade-Offs Breakdown */}
      <div>
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          Simulated Resource Impact (Educational Game Points):
        </h4>
        {effects.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No immediate vital resource changes.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {effects.map(([key, val]) => {
              const label = RESOURCE_LABELS[key] || key;
              // For radiationRisk, a positive increase is a hazard increase (undesirable)
              const isRadiation = key === 'radiationRisk';
              const isBad = isRadiation ? val > 0 : val < 0;
              const formattedVal = val > 0 ? `+${val}` : `${val}`;

              return (
                <li
                  key={key}
                  className={`flex items-center justify-between px-3 py-2 rounded-md border ${
                    isBad
                      ? 'bg-rose-950/30 text-rose-300 border-rose-900/50'
                      : 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50'
                  }`}
                >
                  <span className="text-slate-300">{label}</span>
                  <span className="font-bold">
                    {formattedVal} {isRadiation ? '%' : 'pts'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Scientific & Educational Disclaimer */}
      <footer className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 font-sans leading-normal">
        {sourceKind === 'NASA-observation' ? (
          <p>
            <strong className="text-slate-300">Science Note:</strong> Resource values reflect
            calibrated gameplay points for young astronauts (ages 7–12). NASA spacecraft observations
            inform space weather context but do not represent biological radiation doses absorbed on
            the Moon.
          </p>
        ) : (
          <p>
            <strong className="text-slate-300">Simulation Note:</strong> This event is a training
            exercise demonstrating critical cause-and-effect resource trade-offs in extreme space
            environments.
          </p>
        )}
      </footer>
    </section>
  );
}
