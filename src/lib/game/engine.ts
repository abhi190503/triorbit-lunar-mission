/**
 * TriOrbit — Lunar Survival Simulator
 * Canonical Pure Resource Simulation Engine
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-008 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 *
 * All functions are pure, immutable, side-effect free, and deterministic.
 * Numerical units represent educational game-point assumptions for ages 7–12,
 * NOT measured lunar astronaut dosimetry or physical life-support rates.
 */

import type {
  ActionId,
  GameScenario,
  GameState,
  HistoryRecord,
  ResourceState,
} from './types';
import {
  calculateGameScore,
  clampResource,
  DAILY_DRAIN,
  INITIAL_RESOURCES,
  isMissionFailed,
  MAX_ACTIONS_PER_DAY,
  TOTAL_MISSION_DAYS,
} from './contracts';
import { processAction } from './actions';
import { DEFAULT_SCENARIOS, SCHEDULED_SCENARIO_DAYS } from './constants';

/**
 * Returns the scheduled scenario ID for a given day, if one exists.
 * - Day 2: 'solar-activity'
 * - Day 3: 'power-outage'
 * - Day 4: 'greenhouse-water'
 */
export function getScheduledScenarioId(day: number): string | undefined {
  return SCHEDULED_SCENARIO_DAYS[day];
}

/**
 * Creates a fresh, fully isolated initial mission state for Day 1 morning.
 * Pure and non-mutating; every call creates fresh object references.
 */
export function createInitialMission(): GameState {
  return {
    day: 1,
    phase: 'briefing',
    actionsRemaining: MAX_ACTIONS_PER_DAY,
    resources: {
      oxygen: INITIAL_RESOURCES.oxygen,
      power: INITIAL_RESOURCES.power,
      water: INITIAL_RESOURCES.water,
      food: INITIAL_RESOURCES.food,
      radiationRisk: INITIAL_RESOURCES.radiationRisk,
    },
    currentScenarioId: undefined,
    emergencyMistakes: 0,
    outcome: 'active',
    history: [],
  };
}

/**
 * Pure state reducer executing a maintenance action.
 * Enforces the two-actions-per-day budget, affordability, and [0, 100] clamping.
 * Idempotently returns unchanged state on invalid or unaffordable actions.
 */
export function applyAction(state: GameState, actionId: ActionId): GameState {
  return processAction(state, actionId);
}

/**
 * Pure state reducer applying the effects of an event decision.
 * - Verifies the mission is active and currently in the 'event' phase.
 * - Matches scenarioId and choiceId against provided or default scenarios.
 * - Applies resource deltas with strict [0, 100] clamping.
 * - Increments emergencyMistakes if the choice is marked as hazardous.
 * - Transitions phase from 'event' to 'choose' (or 'result' on failure).
 * - Does NOT consume any daily maintenance action allowance.
 * - Returns unchanged state if preconditions are violated.
 */
export function applyEventChoice(
  state: GameState,
  scenarioId: string,
  choiceId: string,
  customScenarios?: readonly GameScenario[]
): GameState {
  if (state.outcome !== 'active') {
    return state;
  }

  if (state.phase !== 'event') {
    return state;
  }

  if (state.currentScenarioId && state.currentScenarioId !== scenarioId) {
    return state;
  }

  const scenarios = customScenarios ?? DEFAULT_SCENARIOS;
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    return state;
  }

  const choice = scenario.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return state;
  }

  const nextResources: ResourceState = {
    oxygen: clampResource(state.resources.oxygen + (choice.effect.oxygen ?? 0)),
    power: clampResource(state.resources.power + (choice.effect.power ?? 0)),
    water: clampResource(state.resources.water + (choice.effect.water ?? 0)),
    food: clampResource(state.resources.food + (choice.effect.food ?? 0)),
    radiationRisk: clampResource(state.resources.radiationRisk + (choice.effect.radiationRisk ?? 0)),
  };

  const nextMistakes = state.emergencyMistakes + (choice.isMistake ? 1 : 0);
  const failed = isMissionFailed(nextResources);

  const historyRecord: HistoryRecord = {
    day: state.day,
    type: 'event',
    scenarioId,
    choiceId,
    delta: { ...choice.effect },
    after: nextResources,
  };

  return {
    ...state,
    phase: failed ? 'result' : 'choose',
    outcome: failed ? 'failure' : 'active',
    resources: nextResources,
    emergencyMistakes: nextMistakes,
    history: [...state.history, historyRecord],
  };
}

/**
 * Pure state reducer concluding the current simulated day.
 * - Settles baseline daily life-support consumption exactly once.
 * - Blocks execution if a mandatory daily dilemma is unresolved.
 * - Evaluates mission failure (any vital <= 0 or Radiation Risk >= 100).
 * - Declares victory upon safely completing Day 5.
 * - Otherwise advances to the next day, resets action allowance to 2,
 *   and transitions to 'event' if a dilemma is scheduled.
 * - Idempotently returns unchanged state on inactive/concluded missions.
 */
export function finishDay(state: GameState): GameState {
  if (state.outcome !== 'active') {
    return state;
  }

  if (state.phase === 'event') {
    return state; // Mandatory daily dilemma cannot be skipped
  }

  if (state.phase === 'result') {
    return state;
  }

  const drainedResources: ResourceState = {
    oxygen: clampResource(state.resources.oxygen + DAILY_DRAIN.oxygen),
    power: clampResource(state.resources.power + DAILY_DRAIN.power),
    water: clampResource(state.resources.water + DAILY_DRAIN.water),
    food: clampResource(state.resources.food + DAILY_DRAIN.food),
    radiationRisk: clampResource(state.resources.radiationRisk + DAILY_DRAIN.radiationRisk),
  };

  const drainRecord: HistoryRecord = {
    day: state.day,
    type: 'drain',
    delta: { ...DAILY_DRAIN },
    after: drainedResources,
  };

  const nextHistory = [...state.history, drainRecord];
  const failed = isMissionFailed(drainedResources);

  if (failed) {
    return {
      ...state,
      actionsRemaining: 0,
      phase: 'result',
      outcome: 'failure',
      resources: drainedResources,
      history: nextHistory,
    };
  }

  if (state.day >= TOTAL_MISSION_DAYS) {
    return {
      ...state,
      actionsRemaining: 0,
      phase: 'result',
      outcome: 'success',
      resources: drainedResources,
      history: nextHistory,
    };
  }

  const nextDay = state.day + 1;
  const scheduledScenarioId = getScheduledScenarioId(nextDay);

  return {
    ...state,
    day: nextDay,
    actionsRemaining: MAX_ACTIONS_PER_DAY,
    phase: scheduledScenarioId ? 'event' : 'choose',
    currentScenarioId: scheduledScenarioId,
    outcome: 'active',
    resources: drainedResources,
    history: nextHistory,
  };
}

/**
 * Pure scoring calculation returning the final mission performance score [0, 1000].
 */
export function scoreMission(state: GameState): number {
  return calculateGameScore(state.resources, state.emergencyMistakes);
}
