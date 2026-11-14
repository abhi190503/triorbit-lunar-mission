/**
 * TriOrbit — Lunar Survival Simulator
 * Canonical Mission State Controller & View Adapter
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-016 (Derived from frozen docs/GAME_RULES.md, docs/INTERFACES.md, and contracts.ts)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 *
 * Provides pure controller validation, command delegation to the canonical engine,
 * deterministic view-state projections, and accessible disabled-action explanations
 * without duplicating core simulation physics.
 */

import type {
  ActionId,
  GameState,
  ResourceKey,
} from './types';
import type { LunarModuleId } from '@/components/game/ModuleHotspot';
import {
  ActionEffectDefinition,
  MAX_ACTIONS_PER_DAY,
  TOTAL_MISSION_DAYS,
} from './contracts';
import {
  createInitialMission,
  applyAction,
  applyEventChoice,
  finishDay,
  scoreMission,
} from './engine';
import {
  canExecuteAction,
  canFinishDay,
  isEventPending,
  isMissionActive,
  isMissionFailed,
  isMissionVictorious,
  getFailureReason,
} from './progression';
import {
  computeActionDelta,
  getActionDefinition,
} from './actions';

// ============================================================================
// CANONICAL BUILDING-TO-ACTION MAPPINGS
// ============================================================================

export const MODULE_TO_ACTIONS: Readonly<Record<LunarModuleId, readonly ActionId[]>> = {
  solar: ['maintain-solar'],
  habitat: ['generate-oxygen'],
  greenhouse: ['operate-greenhouse', 'recycle-water'],
  bunker: ['reinforce-shelter'],
} as const;

export const ACTION_TO_MODULE: Readonly<Record<ActionId, LunarModuleId>> = {
  'maintain-solar': 'solar',
  'generate-oxygen': 'habitat',
  'operate-greenhouse': 'greenhouse',
  'recycle-water': 'greenhouse',
  'reinforce-shelter': 'bunker',
} as const;

export const ALL_ACTION_IDS: readonly ActionId[] = [
  'generate-oxygen',
  'maintain-solar',
  'recycle-water',
  'operate-greenhouse',
  'reinforce-shelter',
] as const;

// ============================================================================
// VIEW STATE INTERFACES
// ============================================================================

export interface ActionViewState {
  id: ActionId;
  name: string;
  subsystem: string;
  description: string;
  targetModuleId: LunarModuleId;
  costs: Record<ResourceKey, number>;
  yields: Record<ResourceKey, number>;
  costSummary: string;
  yieldSummary: string;
  isAvailable: boolean;
  disabledReason: string | null;
  predictedDeltas: Partial<Record<ResourceKey, number>>;
}

export interface ActionResult {
  success: boolean;
  state: GameState;
  reason?: string;
  actionId?: ActionId;
}

export interface FinishDayResult {
  success: boolean;
  state: GameState;
  reason?: string;
}

// ============================================================================
// PURE EXPLANATION & SUMMARY HELPERS
// ============================================================================

const RESOURCE_ORDER: readonly ResourceKey[] = [
  'oxygen',
  'power',
  'water',
  'food',
  'radiationRisk',
] as const;

/**
 * Formats a human-readable cost summary (e.g. "-8 Power, -6 Water" or "0 Cost").
 * Formats deterministically in canonical resource order.
 */
export function formatActionCostSummary(actionDef: ActionEffectDefinition): string {
  const parts: string[] = [];
  for (const key of RESOURCE_ORDER) {
    const cost = actionDef.costs[key];
    if (cost && cost > 0) {
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
      parts.push(`-${cost} ${capitalized}`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : '0 Cost';
}

/**
 * Formats a human-readable yield summary (e.g. "+20 Oxygen" or "-18 Radiation Risk").
 * Formats deterministically in canonical resource order.
 */
export function formatActionYieldSummary(actionDef: ActionEffectDefinition): string {
  const parts: string[] = [];
  for (const key of RESOURCE_ORDER) {
    const yieldAmount = actionDef.yields[key];
    if (yieldAmount !== undefined && yieldAmount !== 0) {
      const sign = yieldAmount > 0 ? '+' : '';
      const capitalized =
        key === 'radiationRisk'
          ? 'Radiation Risk'
          : key.charAt(0).toUpperCase() + key.slice(1);
      parts.push(`${sign}${yieldAmount} ${capitalized}`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'No direct yield';
}

/**
 * Produces a precise, child-friendly explanation for why an action is disabled.
 * Returns null if the action can be executed immediately.
 */
export function getDisabledActionReason(state: GameState, actionId: ActionId): string | null {
  if (state.outcome === 'failure') {
    return 'Mission aborted: Life support vitals reached emergency threshold.';
  }

  if (state.outcome === 'success') {
    return 'Mission accomplished: Expedition successfully completed.';
  }

  if (state.phase === 'result') {
    return 'Mission debrief: Simulation has concluded.';
  }

  if (state.phase === 'event') {
    return 'Space weather dilemma pending: Make a commander decision before maintenance.';
  }

  if (state.actionsRemaining <= 0) {
    return 'Daily action limit reached (0 remaining). Conclude the day to advance.';
  }

  const actionDef = getActionDefinition(actionId);
  if (!actionDef) {
    return `Unknown action: ${actionId}`;
  }

  // Check specific resource shortfalls
  const shortages: string[] = [];
  for (const [key, cost] of Object.entries(actionDef.costs) as [ResourceKey, number][]) {
    const current = state.resources[key] ?? 0;
    if ((cost ?? 0) > current) {
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
      shortages.push(`Insufficient ${capitalized} (requires ${cost}, have ${current})`);
    }
  }

  if (shortages.length > 0) {
    return shortages.join('; ');
  }

  return null;
}

/**
 * Derives full view metadata for a specific action in the context of current GameState.
 */
export function getActionViewState(state: GameState, actionId: ActionId): ActionViewState {
  const actionDef = getActionDefinition(actionId);
  if (!actionDef) {
    throw new Error(`Invalid action ID: ${actionId}`);
  }

  const disabledReason = getDisabledActionReason(state, actionId);
  const isAvailable = disabledReason === null;
  const predictedDeltas = computeActionDelta(actionId);

  return {
    id: actionId,
    name: actionDef.name,
    subsystem: actionDef.subsystem,
    description: actionDef.description,
    targetModuleId: ACTION_TO_MODULE[actionId],
    costs: { ...actionDef.costs } as Record<ResourceKey, number>,
    yields: { ...actionDef.yields } as Record<ResourceKey, number>,
    costSummary: formatActionCostSummary(actionDef),
    yieldSummary: formatActionYieldSummary(actionDef),
    isAvailable,
    disabledReason,
    predictedDeltas,
  };
}

/**
 * Retrieves all ActionViewStates for a selected lunar module.
 */
export function getModuleActionViewStates(
  state: GameState,
  moduleId: LunarModuleId
): ActionViewState[] {
  const actionIds = MODULE_TO_ACTIONS[moduleId] || [];
  return actionIds.map((id) => getActionViewState(state, id));
}

// ============================================================================
// CANONICAL CONTROLLER COMMAND DELEGATORS
// ============================================================================

/**
 * Safely executes a maintenance action against the canonical simulation engine.
 * - Validates state and preconditions.
 * - Returns a failure result with reason if invalid, preserving existing state immutably.
 * - Invokes canonical applyAction on valid requests.
 */
export function executeAction(state: GameState, actionId: ActionId): ActionResult {
  const disabledReason = getDisabledActionReason(state, actionId);
  if (disabledReason !== null) {
    return {
      success: false,
      state,
      reason: disabledReason,
      actionId,
    };
  }

  const nextState = applyAction(state, actionId);
  return {
    success: true,
    state: nextState,
    actionId,
  };
}

/**
 * Safely executes day conclusion through the canonical simulation engine.
 * - Enforces canFinishDay preconditions (e.g. no pending event dilemma).
 * - Applies daily baseline drain and transitions day or evaluates victory/failure.
 */
export function executeFinishDay(state: GameState): FinishDayResult {
  if (state.outcome !== 'active') {
    return {
      success: false,
      state,
      reason: 'Mission is already completed.',
    };
  }

  if (state.phase === 'event') {
    return {
      success: false,
      state,
      reason: 'Cannot conclude day while a space weather dilemma is pending.',
    };
  }

  const nextState = finishDay(state);
  return {
    success: true,
    state: nextState,
  };
}

// Re-export core engine utilities for convenient consumer integration
export {
  createInitialMission,
  applyAction,
  applyEventChoice,
  finishDay,
  scoreMission,
  canExecuteAction,
  canFinishDay,
  isEventPending,
  isMissionActive,
  isMissionFailed,
  isMissionVictorious,
  getFailureReason,
  MAX_ACTIONS_PER_DAY,
  TOTAL_MISSION_DAYS,
};
