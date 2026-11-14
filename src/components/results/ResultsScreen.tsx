'use client';

import React from 'react';
import type {
  ResultsScreenProps,
  Outcome,
  ResourceKey,
  ResourceState,
  HistoryRecord,
} from '@/lib/game/types';
import { ReplayInsights } from './ReplayInsights';

interface ResourceMeta {
  key: ResourceKey;
  label: string;
  unitLabel: string;
  isHazard: boolean;
  barColor: string;
  bgColor: string;
  textColor: string;
}

const RESOURCE_CONFIGS: ResourceMeta[] = [
  {
    key: 'oxygen',
    label: 'Oxygen Reserves',
    unitLabel: 'pts',
    isHazard: false,
    barColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-950/40 border-cyan-800/60',
    textColor: 'text-cyan-300',
  },
  {
    key: 'power',
    label: 'Power Grid',
    unitLabel: 'pts',
    isHazard: false,
    barColor: 'bg-amber-500',
    bgColor: 'bg-amber-950/40 border-amber-800/60',
    textColor: 'text-amber-300',
  },
  {
    key: 'water',
    label: 'Water Supply',
    unitLabel: 'pts',
    isHazard: false,
    barColor: 'bg-blue-500',
    bgColor: 'bg-blue-950/40 border-blue-800/60',
    textColor: 'text-blue-300',
  },
  {
    key: 'food',
    label: 'Food Rations',
    unitLabel: 'pts',
    isHazard: false,
    barColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-950/40 border-emerald-800/60',
    textColor: 'text-emerald-300',
  },
  {
    key: 'radiationRisk',
    label: 'Radiation Risk',
    unitLabel: 'hazard',
    isHazard: true,
    barColor: 'bg-rose-500',
    bgColor: 'bg-rose-950/40 border-rose-800/60',
    textColor: 'text-rose-300',
  },
];

/**
 * Identify verified failure causes from supplied terminal resource points.
 */
function getFailureDetails(resources: ResourceState): { title: string; explanation: string } {
  const causes: string[] = [];
  if (resources.oxygen <= 0) causes.push('Oxygen levels reached zero (0/100)');
  if (resources.power <= 0) causes.push('Power reserves depleted completely (0/100)');
  if (resources.water <= 0) causes.push('Water stores reached zero (0/100)');
  if (resources.food <= 0) causes.push('Food rations were exhausted (0/100)');
  if (resources.radiationRisk >= 100) causes.push('Radiation Risk hit critical threshold (100/100)');

  if (causes.length === 1) {
    return {
      title: 'Critical Vital Depleted',
      explanation: `Mission aborted because ${causes[0]}. Life support systems require all vital resources to stay above zero and radiation hazard below 100.`,
    };
  }

  if (causes.length > 1) {
    return {
      title: 'Multiple Habitat Vitals Compromised',
      explanation: `Mission aborted due to compounding emergencies: ${causes.join('; ')}.`,
    };
  }

  return {
    title: 'Mission Terminated Early',
    explanation:
      'The simulated lunar habitat entered an emergency shutdown state. In real lunar operations, crew safety always takes priority over mission duration.',
  };
}

/**
 * Determine one relevant, scientifically grounded educational takeaway based on outcome and telemetry.
 */
function getEducationalTakeaway(
  outcome: Outcome,
  resources: ResourceState,
  day: number,
  history: HistoryRecord[]
): { topic: string; takeaway: string } {
  const hasEventHistory = history.some((h) => h.type === 'event');

  if (outcome === 'success') {
    if (resources.radiationRisk < 30) {
      return {
        topic: 'Space Weather Shielding',
        takeaway:
          'Excellent command decisions! By reinforcing shelter regolith and acting early during solar storms, you minimized radiation exposure while keeping your crew safe throughout all 5 days.',
      };
    }

    if (resources.food >= 60 && resources.water >= 60) {
      return {
        topic: 'Closed-Loop Bio-Regeneration',
        takeaway:
          'Outstanding life-support stewardship! Balancing hydroponic greenhouse growth with water recycling allowed your base to produce fresh food and breathable oxygen throughout the full 5-day rotation.',
      };
    }

    return {
      topic: 'Integrated Life Support Management',
      takeaway:
        'Survival on the lunar surface requires careful trade-offs. Every maintenance action consumes resources, so planning daily tasks ahead helps keep the entire habitat in equilibrium.',
    };
  }

  if (outcome === 'failure') {
    if (resources.radiationRisk >= 100) {
      return {
        topic: 'Solar Particle Events (SEP)',
        takeaway:
          'Intense solar particle storms travel through space at nearly the speed of light. Prioritizing bunker shelter and regolith protection when NASA DONKI space weather alerts occur is vital to avoid critical radiation hazards.',
      };
    }

    if (resources.power <= 0) {
      return {
        topic: 'Habitat Energy Conservation',
        takeaway:
          'Electrical power operates life-support recycling, heaters, and communications. Keeping solar arrays maintained and avoiding high-drain tasks when reserves are low prevents catastrophic power blackouts.',
      };
    }

    if (resources.oxygen <= 0) {
      return {
        topic: 'Oxygen Atmosphere Recycling',
        takeaway:
          'On the Moon, breathable air must be continually manufactured and recycled from lunar regolith or electrolysis. Allocating daily actions to oxygen generation protects your crew from critical shortages.',
      };
    }

    if (resources.water <= 0) {
      return {
        topic: 'Water Recycling & Filtration',
        takeaway:
          'Water is the most precious liquid on the Moon. It supplies drinking water, hydroponics, and oxygen generation. Prioritizing water reclamation avoids rapid compound failure.',
      };
    }

    if (resources.food <= 0) {
      return {
        topic: 'Hydroponics & Nutrition',
        takeaway:
          'Astronauts require balanced nutrition to sustain daily operations. Maintaining the greenhouse module ensures a reliable crop cycle across multi-day expeditions.',
      };
    }

    if (day <= 2 && hasEventHistory) {
      return {
        topic: 'Early Mission Resilience',
        takeaway:
          `Emergency evacuation occurred early on Day ${day} following space weather dilemmas. In the initial phase of a lunar mission, establishing life-support buffers before taking high-risk decisions is essential.`,
      };
    }

    return {
      topic: 'Proactive Resource Balancing',
      takeaway:
        `Habitat operations concluded on Day ${day}. Every resource on the Moon drains each simulated night, so anticipating overnight drain before spending your daily actions is essential to surviving unexpected dilemmas.`,
    };
  }

  // Active or non-terminal
  return {
    topic: 'Continuous Mission Monitoring',
    takeaway:
      `The mission is currently underway on Day ${day}. Maintain balance across all five life-support vitals to successfully reach the Day 5 objective.`,
  };
}

/**
 * ResultsScreen
 *
 * Standalone presentation component displaying the final outcome of the 5-day lunar survival simulation.
 * Conforms strictly to docs/INTERFACES.md:
 * - Displays supplied outcome, day, score, and resources without local score recomputation
 * - Clearly distinguishes successful completion from mission abort
 * - Provides verified educational takeaway calibrated for ages 7–12
 * - Replay button invokes supplied onRestart callback
 * - Fully accessible (keyboard, focus ring, screen reader semantics, high contrast)
 * - Decoupled from unfinished GameState, engine, and HUD systems
 */
export function ResultsScreen({
  outcome,
  day,
  resources,
  score,
  history,
  onRestart,
}: ResultsScreenProps) {
  const isSuccess = outcome === 'success';
  const isFailure = outcome === 'failure';
  const isActive = outcome === 'active';

  const failureDetails = isFailure ? getFailureDetails(resources) : null;
  const takeaway = getEducationalTakeaway(outcome, resources, day, history);

  // If component is mounted while mission is still active, show a safe nonterminal notice
  if (isActive) {
    return (
      <main
        className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 space-y-6"
        aria-label="Mission Status Screen"
      >
        <header className="space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            Mission Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Simulation In Progress: Day {day}
          </h1>
          <p className="text-sm text-slate-300">
            Final mission debrief will unlock when Day 5 concludes or if emergency abort conditions are reached.
          </p>
        </header>

        <section aria-label="Current Telemetry Summary" className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Current Telemetry Snapshot:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {RESOURCE_CONFIGS.map((config) => {
              const val = resources[config.key] ?? 0;
              return (
                <div
                  key={config.key}
                  className={`p-3 rounded-xl border ${config.bgColor} space-y-1`}
                >
                  <div className="text-[11px] font-mono text-slate-400 truncate">{config.label}</div>
                  <div className={`text-xl font-bold font-mono ${config.textColor}`}>
                    {val}
                    <span className="text-[10px] text-slate-400 ml-1 font-normal">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-mono">
            TriOrbit • Educational Lunar Survival Simulator
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs uppercase tracking-wider transition focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
          >
            Restart Mission
          </button>
        </footer>
      </main>
    );
  }

  return (
    <main
      className="w-full max-w-3xl mx-auto p-5 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 space-y-6 animate-in fade-in duration-200"
      aria-label="Mission Results Screen"
    >
      {/* Outcome Banner & Primary Header */}
      <header
        className={`p-6 rounded-2xl border ${
          isSuccess
            ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border-emerald-700/80 shadow-emerald-950/50'
            : 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border-rose-700/80 shadow-rose-950/50'
        } shadow-lg space-y-3`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
              isSuccess
                ? 'bg-emerald-900/80 text-emerald-300 border-emerald-600'
                : 'bg-rose-900/80 text-rose-300 border-rose-600'
            }`}
          >
            <span aria-hidden="true">{isSuccess ? '🏆' : '⚠️'}</span>
            <span>{isSuccess ? 'Mission Accomplished' : 'Mission Aborted'}</span>
          </div>

          <div className="font-mono text-xs text-slate-400">
            {isSuccess ? '5 of 5 Days Completed' : `Concluded on Day ${day} of 5`}
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSuccess ? 'Lunar Habitat Rotation Completed!' : 'Habitat Evacuation Initiated'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isSuccess
              ? 'Congratulations Commander! Your crew safely completed the 5-day lunar surface rotation with habitat integrity and life-support vitals sustained.'
              : failureDetails?.explanation ||
                'Life support systems breached acceptable operating parameters, requiring emergency mission abort.'}
          </p>
        </div>
      </header>

      {/* Score & Mission Metrics Card */}
      <section
        aria-label="Mission Performance Score"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Supplied Game Score Card */}
        <article className="sm:col-span-2 p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Final Game Score
            </span>
            <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Simulation Points
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {score}
            </span>
            <span className="text-sm font-mono text-slate-400">/ 1000 max</span>
          </div>

          <p className="text-xs text-slate-400 leading-normal">
            Score is computed by the simulation engine based on remaining life-support reserves, radiation mitigation, and emergency discipline.
          </p>
        </article>

        {/* Days Survived Card */}
        <article className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Mission Duration
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {day}
            </span>
            <span className="text-sm font-mono text-slate-400">/ 5 Days</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {isSuccess ? 'Full rotation completed' : 'Emergency extraction'}
          </span>
        </article>
      </section>

      {/* Final Life-Support Telemetry Summary */}
      <section aria-label="Final Resource Telemetry" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Final Resource Telemetry (0–100 Game Points):
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            Normalized Educational Values
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {RESOURCE_CONFIGS.map((config) => {
            const rawVal = resources[config.key] ?? 0;
            const val = Math.max(0, Math.min(100, rawVal));
            const isCritical = config.isHazard ? val >= 80 : val <= 20;

            return (
              <div
                key={config.key}
                className={`p-3.5 rounded-xl border ${config.bgColor} flex flex-col justify-between space-y-2.5`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {config.label}
                  </span>
                  {isCritical && (
                    <span
                      className="text-[9px] font-mono uppercase font-bold text-rose-400 px-1 py-0.2 rounded bg-rose-950/80 border border-rose-800"
                      title={config.isHazard ? 'High Hazard' : 'Critical Depletion'}
                    >
                      {config.isHazard ? 'HIGH' : 'LOW'}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between font-mono">
                  <span className={`text-2xl font-bold ${config.textColor}`}>
                    {val}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {config.isHazard ? '/100 risk' : '/100 pts'}
                  </span>
                </div>

                {/* Accessible Visual Bar */}
                <div
                  className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={val}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${config.label}: ${val} out of 100`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${config.barColor}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Educational Lesson Learned */}
      <section
        aria-label="Educational Takeaway"
        className="p-5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2 text-cyan-200"
      >
        <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider text-cyan-300">
          <span aria-hidden="true">💡</span>
          <span>Mission Debrief Lesson: {takeaway.topic}</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {takeaway.takeaway}
        </p>
      </section>

      {/* TRI-031: Educational Replay Insights */}
      <ReplayInsights
        state={{
          day,
          phase: 'result',
          actionsRemaining: 0,
          resources,
          outcome,
          emergencyMistakes: 0,
          history: history || [],
        }}
      />

      {/* History Debrief Summary (if supplied) */}
      {history && history.length > 0 && (
        <section aria-label="Mission History Summary" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Mission Log Activity Summary:
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 font-mono flex flex-wrap items-center justify-between gap-3">
            <span>Total logged actions and events: {history.length}</span>
            <span>
              Recorded across {Math.max(...history.map((h) => h.day), day)} mission days
            </span>
          </div>
        </section>
      )}

      {/* Scientific Honesty Notice */}
      <aside
        aria-label="Scientific Honesty Disclaimer"
        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1"
      >
        <div className="font-mono text-[11px] font-semibold text-slate-300 uppercase">
          Scientific Honesty Notice:
        </div>
        <p className="leading-relaxed">
          TriOrbit is an educational game designed for students aged 7–12. All resource levels, Radiation Risk metrics, and scores represent simplified educational simulation points (0–100), not physical SI units or measured biological radiation absorption. NASA space weather telemetry is drawn from authentic satellite observations to introduce space science concepts.
        </p>
      </aside>

      {/* Primary Action Footer with Replay Button */}
      <footer className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono text-center sm:text-left">
          Ready for another command rotation?
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold font-sans text-sm tracking-wider uppercase transition shadow-lg shadow-cyan-950/50 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer min-h-[44px]"
        >
          Replay Mission
        </button>
      </footer>
    </main>
  );
}
