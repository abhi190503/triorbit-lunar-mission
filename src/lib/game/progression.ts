/**
 * TriOrbit — Lunar Survival Simulator
 * Five-Day Mission Progression & State Diagnostics
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-009 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Nirsanth A. (@nirsanth23)
 *
 * Provides pure state-query helpers, failure diagnostics, NASA event reference
 * lookup, and clean restart orchestration without duplicating core engine mechanics.
 */

import type {
  GameScenario,
  GameState,
  HistoryRecord,
  NASAEvent,
  ResourceKey,
} from './types';
import {
  RESOURCE_MAX,
  RESOURCE_MIN,
  TOTAL_MISSION_DAYS,
  isMissionFailed as checkFailureThresholds,
} from './contracts';
import {
  createInitialMission,
  getScheduledScenarioId,
} from './engine';
import { DEFAULT_SCENARIOS, SCHEDULED_SCENARIO_DAYS } from './constants';

/**
 * Diagnostic record explaining the exact vital threshold that caused mission failure.
 */
export interface FailureReason {
  resource: ResourceKey;
  value: number;
  explanation: string;
}

/**
 * Comprehensive mission performance and progression summary.
 */
export interface MissionSummary {
  day: number;
  phase: GameState['phase'];
  outcome: GameState['outcome'];
  totalActionsTaken: number;
  totalEventsResolved: number;
  emergencyMistakes: number;
  isVictorious: boolean;
  isFailed: boolean;
  failureReason: FailureReason | null;
  historyCount: number;
}

/**
 * Returns true if the mission is actively in progress (Days 1–5, outcome 'active').
 */
export function isMissionActive(state: GameState): boolean {
  return state.outcome === 'active' && state.phase !== 'result';
}

/**
 * Returns true if the commander safely completed Day 5 without failure.
 */
export function isMissionVictorious(state: GameState): boolean {
  return state.outcome === 'success' && state.day === TOTAL_MISSION_DAYS;
}

/**
 * Returns true if any life vital reached 0 or Radiation Risk reached 100.
 */
export function isMissionFailed(state: GameState): boolean {
  return state.outcome === 'failure' || checkFailureThresholds(state.resources);
}

/**
 * Returns true if a mandatory daily dilemma is awaiting decision.
 * Maintenance actions and day-finish are blocked while an event is pending.
 */
export function isEventPending(state: GameState): boolean {
  return state.phase === 'event' && Boolean(state.currentScenarioId);
}

/**
 * Returns true if the commander can legally execute maintenance actions.
 */
export function canExecuteAction(state: GameState): boolean {
  return (
    state.outcome === 'active' &&
    state.phase === 'choose' &&
    state.actionsRemaining > 0
  );
}

/**
 * Returns true if the commander can legally finish the current day.
 * Finish Day is blocked if a mandatory dilemma is pending.
 */
export function canFinishDay(state: GameState): boolean {
  return state.outcome === 'active' && state.phase !== 'event';
}

/**
 * Identifies the specific vital failure threshold that triggered mission abort.
 * Returns null if all resources remain within safe operational bounds.
 */
export function getFailureReason(state: GameState): FailureReason | null {
  const { resources } = state;

  if (resources.oxygen <= RESOURCE_MIN) {
    return {
      resource: 'oxygen',
      value: resources.oxygen,
      explanation: 'Atmospheric oxygen depleted. Habitat life-support scrubbers failed to maintain breathable air.',
    };
  }

  if (resources.power <= RESOURCE_MIN) {
    return {
      resource: 'power',
      value: resources.power,
      explanation: 'Electrical grid blackout. Main bus voltage dropped to zero, shutting down all habitat life support.',
    };
  }

  if (resources.water <= RESOURCE_MIN) {
    return {
      resource: 'water',
      value: resources.water,
      explanation: 'Potable water stores exhausted. Hydroponics and crew hydration loops starved.',
    };
  }

  if (resources.food <= RESOURCE_MIN) {
    return {
      resource: 'food',
      value: resources.food,
      explanation: 'Nutrition stores depleted. Crew caloric supplies were completely exhausted.',
    };
  }

  if (resources.radiationRisk >= RESOURCE_MAX) {
    return {
      resource: 'radiationRisk',
      value: resources.radiationRisk,
      explanation: 'Radiation risk threshold exceeded (100%). Solar particle exposure forced an emergency mission abort.',
    };
  }

  return null;
}

/**
 * Compiles a structured progression and status summary from the current GameState.
 */
export function getMissionSummary(state: GameState): MissionSummary {
  const actionsCount = state.history.filter((h) => h.type === 'action').length;
  const eventsCount = state.history.filter((h) => h.type === 'event').length;
  const failureReason = getFailureReason(state);

  return {
    day: state.day,
    phase: state.phase,
    outcome: state.outcome,
    totalActionsTaken: actionsCount,
    totalEventsResolved: eventsCount,
    emergencyMistakes: state.emergencyMistakes,
    isVictorious: isMissionVictorious(state),
    isFailed: isMissionFailed(state),
    failureReason,
    historyCount: state.history.length,
  };
}

/**
 * Filters the immutable history log for records matching a specific mission day.
 */
export function getHistoryByDay(history: readonly HistoryRecord[], day: number): HistoryRecord[] {
  return history.filter((record) => record.day === day);
}

/**
 * Filters the immutable history log for action decisions.
 */
export function getActionHistory(history: readonly HistoryRecord[]): HistoryRecord[] {
  return history.filter((record) => record.type === 'action');
}

/**
 * Filters the immutable history log for dilemma event choices.
 */
export function getEventHistory(history: readonly HistoryRecord[]): HistoryRecord[] {
  return history.filter((record) => record.type === 'event');
}

/**
 * Extracts NASA observation provenance metadata associated with an event scenario.
 * Returns authentic NASA DONKI observation details without altering shared schemas.
 */
export function getNASAScenarioReference(
  scenarioId: string,
  customScenarios?: readonly GameScenario[]
): NASAEvent | null {
  const scenarios = customScenarios ?? DEFAULT_SCENARIOS;
  const scenario = scenarios.find((s) => s.id === scenarioId);
  return scenario?.source ?? null;
}

/**
 * Initiates a clean, independent mission replay.
 * Completely resets simulation state; no memory or history persists across playthroughs.
 */
export function resetMission(): GameState {
  return createInitialMission();
}

/**
 * Validates structural and mathematical invariants of a GameState object.
 * Useful for automated boundary checks and integration verification.
 */
export function validateMissionInvariants(state: GameState): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (state.day < 1 || state.day > TOTAL_MISSION_DAYS) {
    violations.push(`Day ${state.day} out of range [1, ${TOTAL_MISSION_DAYS}]`);
  }

  if (state.actionsRemaining < 0 || state.actionsRemaining > 2) {
    violations.push(`Actions remaining ${state.actionsRemaining} out of bounds [0, 2]`);
  }

  for (const [key, val] of Object.entries(state.resources)) {
    if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
      violations.push(`Resource ${key} is non-finite: ${val}`);
    } else if (val < RESOURCE_MIN || val > RESOURCE_MAX) {
      violations.push(`Resource ${key} value ${val} out of bounds [${RESOURCE_MIN}, ${RESOURCE_MAX}]`);
    }
  }

  if (state.emergencyMistakes < 0) {
    violations.push(`Negative emergency mistakes: ${state.emergencyMistakes}`);
  }

  if (!Array.isArray(state.history)) {
    violations.push('History is not an array');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export { getScheduledScenarioId, SCHEDULED_SCENARIO_DAYS };
