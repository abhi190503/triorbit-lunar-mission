/**
 * TriOrbit — Lunar Survival Simulator
 * Canonical Game Contracts, Constants & Resource Utilities
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-007 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import type {
  ActionId,
  GameState,
  ResourceKey,
  ResourceState,
} from './types';

// ============================================================================
// SIMULATION CONSTANTS & BOUNDS
// ============================================================================

export const RESOURCE_MIN = 0;
export const RESOURCE_MAX = 100;
export const VITAL_CRITICAL_THRESHOLD = 20;
export const RADIATION_ALERT_THRESHOLD = 70;
export const MAX_ACTIONS_PER_DAY = 2;
export const TOTAL_MISSION_DAYS = 5;

/**
 * Initial educational game points for Day 1 morning.
 * All resources are normalized integers in [0, 100].
 */
export const INITIAL_RESOURCES: Readonly<ResourceState> = {
  oxygen: 75,
  power: 70,
  water: 75,
  food: 70,
  radiationRisk: 10,
} as const;

/**
 * Baseline daily consumption applied once at day completion.
 * Radiation Risk has no passive daily baseline drain; it changes via events/shelter.
 */
export const DAILY_DRAIN: Readonly<ResourceState> = {
  oxygen: -16,
  power: -14,
  water: -14,
  food: -14,
  radiationRisk: 0,
} as const;

/**
 * Action effect metadata including resource costs and yields.
 */
export interface ActionEffectDefinition {
  id: ActionId;
  name: string;
  subsystem: string;
  costs: Partial<Record<ResourceKey, number>>;
  yields: Partial<Record<ResourceKey, number>>;
  description: string;
}

/**
 * Canonical action effect specifications for the 5 habitat maintenance actions.
 */
export const ACTION_EFFECTS: Readonly<Record<ActionId, ActionEffectDefinition>> = {
  'generate-oxygen': {
    id: 'generate-oxygen',
    name: 'Generate Oxygen',
    subsystem: 'Life Support Habitat',
    costs: { power: 8, water: 6 },
    yields: { oxygen: 20 },
    description: 'Electrolyzes water to produce breathable oxygen using habitat power.',
  },
  'maintain-solar': {
    id: 'maintain-solar',
    name: 'Maintain Solar Array',
    subsystem: 'Solar Array & Battery Station',
    costs: {},
    yields: { power: 20 },
    description: 'Cleans lunar regolith dust from photovoltaic panels to restore battery charge.',
  },
  'recycle-water': {
    id: 'recycle-water',
    name: 'Recycle Water',
    subsystem: 'Water Reclamation Facility',
    costs: { power: 7 },
    yields: { water: 18 },
    description: 'Purifies greywater and atmospheric condensate for crew and greenhouse reuse.',
  },
  'operate-greenhouse': {
    id: 'operate-greenhouse',
    name: 'Operate Greenhouse',
    subsystem: 'Hydroponics Greenhouse',
    costs: { water: 9, power: 6 },
    yields: { food: 17 },
    description: 'Cultivates fresh crops in closed hydroponic loops to replenish food stores.',
  },
  'reinforce-shelter': {
    id: 'reinforce-shelter',
    name: 'Reinforce Shelter',
    subsystem: 'Shielded Lunar Bunker',
    costs: { power: 7 },
    yields: { radiationRisk: -18 },
    description: 'Actuates magnetic deflector shielding and reinforces regolith bunker barriers.',
  },
} as const;

// ============================================================================
// PURE SIMULATION ENGINE FUNCTION TYPE DECLARATIONS
// (Declared signatures for TRI-008 pure engine implementation; no placeholder bodies)
// ============================================================================

export type CreateInitialMissionFn = () => GameState;
export type ApplyActionFn = (state: GameState, actionId: ActionId) => GameState;
export type ApplyEventChoiceFn = (state: GameState, scenarioId: string, choiceId: string) => GameState;
export type FinishDayFn = (state: GameState) => GameState;
export type ScoreMissionFn = (state: GameState) => number;

/**
 * Complete pure simulation engine interface contract.
 */
export interface SimulationEngine {
  createInitialMission: CreateInitialMissionFn;
  applyAction: ApplyActionFn;
  applyEventChoice: ApplyEventChoiceFn;
  finishDay: FinishDayFn;
  scoreMission: ScoreMissionFn;
}

// ============================================================================
// BOUNDED RESOURCE HELPERS & PURE UTILITIES
// ============================================================================

/**
 * Clamps a numeric resource value strictly within [RESOURCE_MIN, RESOURCE_MAX] (0 to 100).
 * Predictably handles NaN or infinite values by returning RESOURCE_MIN (0).
 * Does not mutate inputs; returns a deterministic bounded number.
 */
export function clampResource(val: number): number {
  if (Number.isNaN(val) || !Number.isFinite(val)) {
    return RESOURCE_MIN;
  }
  return Math.max(RESOURCE_MIN, Math.min(RESOURCE_MAX, val));
}

/**
 * Produces a new, deeply immutable ResourceState with all values strictly clamped in [0, 100].
 */
export function clampResourceState(resources: ResourceState): ResourceState {
  return {
    oxygen: clampResource(resources.oxygen),
    power: clampResource(resources.power),
    water: clampResource(resources.water),
    food: clampResource(resources.food),
    radiationRisk: clampResource(resources.radiationRisk),
  };
}

/**
 * Determines whether a resource vital has crossed into critical warning territory.
 * - For life vitals (Oxygen, Power, Water, Food): critical if value <= 20.
 * - For hazard vitals (Radiation Risk): critical if value >= 70.
 */
export function isResourceCritical(key: ResourceKey, value: number): boolean {
  if (key === 'radiationRisk') {
    return value >= RADIATION_ALERT_THRESHOLD;
  }
  return value <= VITAL_CRITICAL_THRESHOLD;
}

/**
 * Evaluates whether the current resource state violates survival thresholds:
 * Any life vital (Oxygen, Power, Water, Food) <= 0 OR Radiation Risk >= 100.
 */
export function isMissionFailed(resources: ResourceState): boolean {
  return (
    resources.oxygen <= RESOURCE_MIN ||
    resources.power <= RESOURCE_MIN ||
    resources.water <= RESOURCE_MIN ||
    resources.food <= RESOURCE_MIN ||
    resources.radiationRisk >= RESOURCE_MAX
  );
}

/**
 * Evaluates whether the commander can afford to execute a maintenance action
 * based on current resource stores and the action's defined costs.
 */
export function canAffordAction(resources: ResourceState, actionId: ActionId): boolean {
  const effect = ACTION_EFFECTS[actionId];
  if (!effect) return false;

  for (const [key, cost] of Object.entries(effect.costs)) {
    const resourceKey = key as ResourceKey;
    if ((cost ?? 0) > (resources[resourceKey] ?? 0)) {
      return false;
    }
  }
  return true;
}

/**
 * Pure scoring calculation formula:
 * clamp(0, 1000, round(500 + (O2 + Power + Water + Food) / 4 - RadiationRisk - 25 * emergencyMistakes))
 */
export function calculateGameScore(resources: ResourceState, emergencyMistakes: number): number {
  const essentialsAverage =
    (resources.oxygen + resources.power + resources.water + resources.food) / 4;
  const rawScore = 500 + essentialsAverage - resources.radiationRisk - 25 * emergencyMistakes;
  return Math.max(0, Math.min(1000, Math.round(rawScore)));
}
