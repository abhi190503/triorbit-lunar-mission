/**
 * TriOrbit — Lunar Survival Simulator
 * Pure Maintenance Action Processing Logic
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-008 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import type {
  ActionId,
  GameState,
  HistoryRecord,
  ResourceKey,
  ResourceState,
} from './types';
import {
  ACTION_EFFECTS,
  ActionEffectDefinition,
  clampResource,
  isMissionFailed,
} from './contracts';

/**
 * Result of validating an action attempt before execution.
 */
export interface ActionValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Retrieves the metadata and effect definition for a given action ID.
 */
export function getActionDefinition(actionId: ActionId): ActionEffectDefinition | undefined {
  return ACTION_EFFECTS[actionId];
}

/**
 * Validates whether the commander can afford an action's resource costs.
 */
export function canAffordActionCosts(
  resources: ResourceState,
  actionDef: ActionEffectDefinition
): boolean {
  for (const [key, cost] of Object.entries(actionDef.costs)) {
    const resourceKey = key as ResourceKey;
    if ((cost ?? 0) > (resources[resourceKey] ?? 0)) {
      return false;
    }
  }
  return true;
}

/**
 * Validates whether an action can be legally performed in the current GameState.
 */
export function validateAction(state: GameState, actionId: ActionId): ActionValidationResult {
  if (state.outcome !== 'active') {
    return { valid: false, reason: 'Mission is not active.' };
  }

  if (state.phase === 'event') {
    return {
      valid: false,
      reason: 'Mandatory daily dilemma must be resolved before maintenance actions.',
    };
  }

  if (state.phase === 'result') {
    return { valid: false, reason: 'Mission has concluded.' };
  }

  if (state.actionsRemaining <= 0) {
    return { valid: false, reason: 'No maintenance action points remaining today.' };
  }

  const actionDef = getActionDefinition(actionId);
  if (!actionDef) {
    return { valid: false, reason: `Unknown action ID: ${actionId}` };
  }

  if (!canAffordActionCosts(state.resources, actionDef)) {
    return { valid: false, reason: 'Insufficient resources to perform this action.' };
  }

  return { valid: true };
}

/**
 * Computes net resource deltas (costs subtracted, yields added) for an action.
 */
export function computeActionDelta(actionId: ActionId): Partial<Record<ResourceKey, number>> {
  const actionDef = getActionDefinition(actionId);
  if (!actionDef) return {};

  const delta: Partial<Record<ResourceKey, number>> = {};

  for (const [key, cost] of Object.entries(actionDef.costs)) {
    const resourceKey = key as ResourceKey;
    delta[resourceKey] = -(cost ?? 0);
  }

  for (const [key, yieldAmount] of Object.entries(actionDef.yields)) {
    const resourceKey = key as ResourceKey;
    delta[resourceKey] = (delta[resourceKey] ?? 0) + (yieldAmount ?? 0);
  }

  return delta;
}

/**
 * Pure state reducer executing a maintenance action.
 * - Enforces the two-actions-per-day budget.
 * - Deducts costs and adds yields with strict [0, 100] clamping.
 * - Never mutates input state.
 * - Idempotently returns existing state on invalid action attempts.
 */
export function processAction(state: GameState, actionId: ActionId): GameState {
  const validation = validateAction(state, actionId);
  if (!validation.valid) {
    return state;
  }

  const delta = computeActionDelta(actionId);

  // Compute new resource vitals with strict boundary clamping
  const nextResources: ResourceState = {
    oxygen: clampResource(state.resources.oxygen + (delta.oxygen ?? 0)),
    power: clampResource(state.resources.power + (delta.power ?? 0)),
    water: clampResource(state.resources.water + (delta.water ?? 0)),
    food: clampResource(state.resources.food + (delta.food ?? 0)),
    radiationRisk: clampResource(state.resources.radiationRisk + (delta.radiationRisk ?? 0)),
  };

  const nextActionsRemaining = state.actionsRemaining - 1;
  const failed = isMissionFailed(nextResources);

  const historyEntry: HistoryRecord = {
    day: state.day,
    type: 'action',
    actionId,
    delta,
    after: nextResources,
  };

  return {
    ...state,
    phase: failed ? 'result' : 'choose',
    outcome: failed ? 'failure' : 'active',
    actionsRemaining: nextActionsRemaining,
    resources: nextResources,
    history: [...state.history, historyEntry],
  };
}
