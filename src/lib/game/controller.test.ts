/**
 * TriOrbit — Lunar Survival Simulator
 * Controller Integration & Action View State Tests
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-016
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ACTION_IDS,
  MODULE_TO_ACTIONS,
  ACTION_TO_MODULE,
  formatActionCostSummary,
  formatActionYieldSummary,
  getDisabledActionReason,
  getActionViewState,
  getModuleActionViewStates,
  executeAction,
  executeFinishDay,
  createInitialMission,
} from './controller';
import { ACTION_EFFECTS, DAILY_DRAIN } from './contracts';
import type { LunarModuleId } from '@/components/game/ModuleHotspot';

// ============================================================================
// 1. CANONICAL MODULE AND ACTION MAPPINGS
// ============================================================================

test('controller: all five maintenance actions have valid definitions and mappings', () => {
  assert.equal(ALL_ACTION_IDS.length, 5);

  for (const actionId of ALL_ACTION_IDS) {
    const actionDef = ACTION_EFFECTS[actionId];
    assert.ok(actionDef, `Action definition must exist for ${actionId}`);
    assert.equal(actionDef.id, actionId);

    const targetModule = ACTION_TO_MODULE[actionId];
    assert.ok(targetModule, `Target module must be mapped for ${actionId}`);
    assert.ok(
      MODULE_TO_ACTIONS[targetModule].includes(actionId),
      `Module ${targetModule} must include ${actionId}`
    );
  }
});

test('controller: module to action mappings map exactly to four base facilities', () => {
  const modules: LunarModuleId[] = ['solar', 'habitat', 'greenhouse', 'bunker'];
  for (const mod of modules) {
    const actions = MODULE_TO_ACTIONS[mod];
    assert.ok(actions.length > 0, `Module ${mod} must have at least one action`);
  }

  assert.deepEqual(MODULE_TO_ACTIONS.solar, ['maintain-solar']);
  assert.deepEqual(MODULE_TO_ACTIONS.habitat, ['generate-oxygen']);
  assert.deepEqual(MODULE_TO_ACTIONS.greenhouse, ['operate-greenhouse', 'recycle-water']);
  assert.deepEqual(MODULE_TO_ACTIONS.bunker, ['reinforce-shelter']);
});

// ============================================================================
// 2. SUMMARY AND FORMATTING HELPERS
// ============================================================================

test('controller: formatActionCostSummary formats costs accurately', () => {
  assert.equal(formatActionCostSummary(ACTION_EFFECTS['maintain-solar']), '0 Cost');
  assert.equal(formatActionCostSummary(ACTION_EFFECTS['generate-oxygen']), '-8 Power, -6 Water');
  assert.equal(formatActionCostSummary(ACTION_EFFECTS['recycle-water']), '-7 Power');
  assert.equal(formatActionCostSummary(ACTION_EFFECTS['operate-greenhouse']), '-6 Power, -9 Water');
  assert.equal(formatActionCostSummary(ACTION_EFFECTS['reinforce-shelter']), '-7 Power');
});

test('controller: formatActionYieldSummary formats yields accurately', () => {
  assert.equal(formatActionYieldSummary(ACTION_EFFECTS['maintain-solar']), '+20 Power');
  assert.equal(formatActionYieldSummary(ACTION_EFFECTS['generate-oxygen']), '+20 Oxygen');
  assert.equal(formatActionYieldSummary(ACTION_EFFECTS['recycle-water']), '+18 Water');
  assert.equal(formatActionYieldSummary(ACTION_EFFECTS['operate-greenhouse']), '+17 Food');
  assert.equal(formatActionYieldSummary(ACTION_EFFECTS['reinforce-shelter']), '-18 Radiation Risk');
});

// ============================================================================
// 3. ACTION VIEW STATE AND DISABLED REASONS
// ============================================================================

test('controller: getActionViewState derives correct availability on initial mission', () => {
  const state = createInitialMission(); // Day 1, briefing, 2 actions left, resources 75/70/75/70/10

  for (const actionId of ALL_ACTION_IDS) {
    const viewState = getActionViewState(state, actionId);
    assert.equal(viewState.id, actionId);
    assert.equal(viewState.isAvailable, true);
    assert.equal(viewState.disabledReason, null);
    assert.ok(viewState.name.length > 0);
    assert.ok(viewState.subsystem.length > 0);
  }
});

test('controller: getDisabledActionReason reports insufficient power when power is low', () => {
  let state = createInitialMission();
  state = {
    ...state,
    resources: {
      ...state.resources,
      power: 5, // Oxygen requires 8, Greenhouse requires 6, Water requires 7, Shelter requires 7
    },
  };

  // maintain-solar has 0 cost -> available
  assert.equal(getDisabledActionReason(state, 'maintain-solar'), null);

  // generate-oxygen requires 8 power -> disabled
  const o2Reason = getDisabledActionReason(state, 'generate-oxygen');
  assert.ok(o2Reason?.includes('Insufficient Power'));
  assert.ok(o2Reason?.includes('requires 8, have 5'));

  // recycle-water requires 7 power -> disabled
  const waterReason = getDisabledActionReason(state, 'recycle-water');
  assert.ok(waterReason?.includes('Insufficient Power'));
  assert.ok(waterReason?.includes('requires 7, have 5'));
});

test('controller: getDisabledActionReason reports insufficient water for greenhouse and oxygen', () => {
  let state = createInitialMission();
  state = {
    ...state,
    resources: {
      ...state.resources,
      water: 4, // Oxygen requires 6 water, Greenhouse requires 9 water
    },
  };

  const o2Reason = getDisabledActionReason(state, 'generate-oxygen');
  assert.ok(o2Reason?.includes('Insufficient Water'));
  assert.ok(o2Reason?.includes('requires 6, have 4'));

  const ghReason = getDisabledActionReason(state, 'operate-greenhouse');
  assert.ok(ghReason?.includes('Insufficient Water'));
  assert.ok(ghReason?.includes('requires 9, have 4'));
});

test('controller: action limit enforcement disables all actions when 0 actions remain', () => {
  let state = createInitialMission();
  state = {
    ...state,
    actionsRemaining: 0,
  };

  for (const actionId of ALL_ACTION_IDS) {
    const reason = getDisabledActionReason(state, actionId);
    assert.ok(reason?.includes('Daily action limit reached'));
  }
});

test('controller: mandatory event phase blocks maintenance actions and finish day', () => {
  let state = createInitialMission();
  state = {
    ...state,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };

  for (const actionId of ALL_ACTION_IDS) {
    const reason = getDisabledActionReason(state, actionId);
    assert.ok(reason?.includes('Space weather dilemma pending'));
  }

  const finishRes = executeFinishDay(state);
  assert.equal(finishRes.success, false);
  assert.ok(finishRes.reason?.includes('dilemma is pending'));
});

test('controller: terminal failure and success states lock further actions', () => {
  let failedState = createInitialMission();
  failedState = {
    ...failedState,
    outcome: 'failure',
    phase: 'result',
  };

  for (const actionId of ALL_ACTION_IDS) {
    const reason = getDisabledActionReason(failedState, actionId);
    assert.ok(reason?.includes('Mission aborted'));
  }

  let victoryState = createInitialMission();
  victoryState = {
    ...victoryState,
    outcome: 'success',
    phase: 'result',
  };

  for (const actionId of ALL_ACTION_IDS) {
    const reason = getDisabledActionReason(victoryState, actionId);
    assert.ok(reason?.includes('Mission accomplished'));
  }
});

// ============================================================================
// 4. MODULE ACTION VIEW STATES
// ============================================================================

test('controller: getModuleActionViewStates returns correct actions for each module', () => {
  const state = createInitialMission();

  const solarViews = getModuleActionViewStates(state, 'solar');
  assert.equal(solarViews.length, 1);
  assert.equal(solarViews[0].id, 'maintain-solar');

  const ghViews = getModuleActionViewStates(state, 'greenhouse');
  assert.equal(ghViews.length, 2);
  assert.equal(ghViews[0].id, 'operate-greenhouse');
  assert.equal(ghViews[1].id, 'recycle-water');
});

// ============================================================================
// 5. COMMAND EXECUTION & ENGINE DELEGATION
// ============================================================================

test('controller: executeAction succeeds on valid action and delegates to engine', () => {
  const initial = createInitialMission();
  const result = executeAction(initial, 'maintain-solar');

  assert.equal(result.success, true);
  assert.equal(result.state.actionsRemaining, 1);
  assert.equal(result.state.resources.power, 90); // 70 + 20
  assert.equal(result.state.phase, 'choose');
  // Initial state was not mutated
  assert.equal(initial.actionsRemaining, 2);
  assert.equal(initial.resources.power, 70);
});

test('controller: executeAction safely rejects invalid or unaffordable actions without side effects', () => {
  let state = createInitialMission();
  state = {
    ...state,
    resources: {
      ...state.resources,
      power: 2, // Cannot afford oxygen (needs 8)
    },
  };

  const result = executeAction(state, 'generate-oxygen');
  assert.equal(result.success, false);
  assert.ok(result.reason?.includes('Insufficient Power'));
  // State remains untouched
  assert.equal(result.state.actionsRemaining, 2);
  assert.equal(result.state.resources.oxygen, 75);
  assert.equal(result.state.resources.power, 2);
});

test('controller: action budget strictly limits commander to 2 actions per day', () => {
  let state = createInitialMission();
  assert.equal(state.actionsRemaining, 2);

  // Action 1
  const r1 = executeAction(state, 'maintain-solar');
  assert.equal(r1.success, true);
  state = r1.state;
  assert.equal(state.actionsRemaining, 1);

  // Action 2
  const r2 = executeAction(state, 'recycle-water');
  assert.equal(r2.success, true);
  state = r2.state;
  assert.equal(state.actionsRemaining, 0);

  // Action 3 (Must fail)
  const r3 = executeAction(state, 'reinforce-shelter');
  assert.equal(r3.success, false);
  assert.ok(r3.reason?.includes('Daily action limit reached'));
  assert.equal(r3.state.actionsRemaining, 0);
  assert.equal(state.resources.radiationRisk, 10); // unchanged
});

test('controller: executeFinishDay transitions mission day and applies baseline drain', () => {
  const initial = createInitialMission();
  const res = executeFinishDay(initial);

  assert.equal(res.success, true);
  assert.equal(res.state.day, 2);
  assert.equal(res.state.actionsRemaining, 2);
  // Baseline drain applied: O2: 75-16=59, Pwr: 70-14=56, H2O: 75-14=61, Food: 70-14=56, Risk: 10+12=22
  assert.equal(res.state.resources.oxygen, 75 + DAILY_DRAIN.oxygen);
  assert.equal(res.state.resources.power, 70 + DAILY_DRAIN.power);
  assert.equal(res.state.resources.water, 75 + DAILY_DRAIN.water);
  assert.equal(res.state.resources.food, 70 + DAILY_DRAIN.food);
  assert.equal(res.state.resources.radiationRisk, 10 + DAILY_DRAIN.radiationRisk);

  // Initial state not mutated
  assert.equal(initial.day, 1);
});

test('controller: repeated finish day on terminated mission is safely rejected', () => {
  let state = createInitialMission();
  state = {
    ...state,
    outcome: 'failure',
    phase: 'result',
  };

  const res = executeFinishDay(state);
  assert.equal(res.success, false);
  assert.ok(res.reason?.includes('Mission is already completed'));
});
