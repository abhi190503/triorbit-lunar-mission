'use client';

/**
 * TriOrbit — Lunar Survival Simulator
 * Educational Replay Insights Component
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-031 (Optional Expanded Replay Insights & Scenarios)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Nirsanth A. (@nirsanth23)
 */

import React from 'react';
import type { GameState } from '@/lib/game/types';
import { generateReplayInsights } from '@/lib/game/insights';

export interface ReplayInsightsProps {
  state: GameState;
  className?: string;
}

export function ReplayInsights({ state, className = '' }: ReplayInsightsProps) {
  const insights = generateReplayInsights(state);

  return (
    <section
      aria-labelledby="replay-insights-heading"
      className={`rounded-2xl border border-[#38BDF8]/30 bg-[#0E1A2E]/90 p-5 sm:p-6 backdrop-blur-md text-left shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F3352] pb-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#60E5F4]">
            Mission Analysis & Telemetry Debrief
          </span>
          <h3
            id="replay-insights-heading"
            className="text-base sm:text-lg font-bold font-mono text-[#F4F7FC]"
          >
            Commander Strategy Insights
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#60E5F4]/40 bg-[#162640] px-3 py-1 text-xs font-mono font-bold text-[#60E5F4]">
          <span>🎖️</span>
          <span>{insights.commanderTitle}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Strength */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <span>✓</span>
            <span>Demonstrated Strength</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
            {insights.keyStrength}
          </p>
        </div>

        {/* Growth Recommendation */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <span>💡</span>
            <span>Flight Director Recommendation</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
            {insights.growthRecommendation}
          </p>
        </div>
      </div>

      {/* Action Breakdown Summary */}
      <div className="mt-5 rounded-xl border border-[#1F3352] bg-[#0A1220] p-4">
        <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8B8D0] mb-3">
          Habitat Subsystem Service Allocation ({insights.actionBreakdown.totalActions} total actions)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
          <div className="rounded-lg bg-[#162640] p-2 border border-[#1F3352]">
            <span className="block text-amber-400 font-bold text-sm">
              {insights.actionBreakdown['maintain-solar']}
            </span>
            <span className="text-[10px] text-[#A8B8D0]">Solar Arrays</span>
          </div>
          <div className="rounded-lg bg-[#162640] p-2 border border-[#1F3352]">
            <span className="block text-cyan-400 font-bold text-sm">
              {insights.actionBreakdown['generate-oxygen']}
            </span>
            <span className="text-[10px] text-[#A8B8D0]">Oxygen Pod</span>
          </div>
          <div className="rounded-lg bg-[#162640] p-2 border border-[#1F3352]">
            <span className="block text-blue-400 font-bold text-sm">
              {insights.actionBreakdown['recycle-water']}
            </span>
            <span className="text-[10px] text-[#A8B8D0]">Water Loop</span>
          </div>
          <div className="rounded-lg bg-[#162640] p-2 border border-[#1F3352]">
            <span className="block text-emerald-400 font-bold text-sm">
              {insights.actionBreakdown['operate-greenhouse']}
            </span>
            <span className="text-[10px] text-[#A8B8D0]">Greenhouse</span>
          </div>
          <div className="rounded-lg bg-[#162640] p-2 border border-[#1F3352] col-span-2 sm:col-span-1">
            <span className="block text-rose-400 font-bold text-sm">
              {insights.actionBreakdown['reinforce-shelter']}
            </span>
            <span className="text-[10px] text-[#A8B8D0]">Regolith Bunker</span>
          </div>
        </div>
      </div>

      {/* Educational Closed-Loop Takeaway */}
      <div className="mt-4 rounded-xl border border-[#38BDF8]/20 bg-[#101D35]/60 p-4 text-xs text-slate-300 leading-relaxed font-sans">
        <span className="font-mono font-bold text-[#60E5F4] uppercase tracking-wide mr-1.5">
          Educational Takeaway:
        </span>
        {insights.educationalTakeaway}
      </div>
    </section>
  );
}
