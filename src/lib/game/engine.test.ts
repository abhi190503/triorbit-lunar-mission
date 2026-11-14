/**
 * TriOrbit — Lunar Survival Simulator
 * Comprehensive Pure Simulation Engine Unit Tests
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-008 Test Matrix
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialMission,
  applyAction,
  applyEventChoice,
  finishDay,
  scoreMission,
} from './engine';
import { MAX_ACTIONS_PER_DAY } from './constants';
import { clampResource } from './contracts';
import type { GameState } from './types';

// ============================================================================
// 1. INITIAL STATE TESTS
// ============================================================================

test('initial state: initializes fresh mission with correct baseline values', () => {
  const mission = createInitialMission();

  assert.equal(mission.day, 1);
  assert.equal(mission.phase, 'briefing');
  assert.equal(mission.actionsRemaining, MAX_ACTIONS_PER_DAY);
  assert.equal(mission.emergencyMistakes, 0);
  assert.equal(mission.outcome, 'active');
  assert.equal(mission.currentScenarioId, undefined);
  assert.deepEqual(mission.history, []);

  assert.equal(mission.resources.oxygen, 75);
  assert.equal(mission.resources.power, 70);
  assert.equal(mission.resources.water, 75);
  assert.equal(mission.resources.food, 70);
  assert.equal(mission.resources.radiationRisk, 10);
});

test('initial state: produces deeply independent object references', () => {
  const m1 = createInitialMission();
  const m2 = createInitialMission();

  assert.notEqual(m1, m2);
  assert.notEqual(m1.resources, m2.resources);
  assert.notEqual(m1.history, m2.history);

  m1.resources.oxygen = 99;
  assert.equal(m2.resources.oxygen, 75);
});

// ============================================================================
// 2. MAINTENANCE ACTION TESTS & RESOURCE TRADE-OFFS
// ============================================================================

test('actions: maintain-solar yields +20 power with 0 resource costs', () => {
  const state = createInitialMission();
  const next = applyAction(state, 'maintain-solar');

  assert.equal(next.actionsRemaining, 1);
  assert.equal(next.resources.power, 90); // 70 + 20
  assert.equal(next.resources.oxygen, 75);
  assert.equal(next.resources.water, 75);
  assert.equal(next.resources.food, 70);
  assert.equal(next.resources.radiationRisk, 10);

  assert.equal(next.history.length, 1);
  assert.equal(next.history[0].type, 'action');
  assert.equal(next.history[0].actionId, 'maintain-solar');
});

test('actions: generate-oxygen yields +20 oxygen, costs -8 power and -6 water', () => {
  const state = createInitialMission();
  const next = applyAction(state, 'generate-oxygen');

  assert.equal(next.actionsRemaining, 1);
  assert.equal(next.resources.oxygen, 95); // 75 + 20
  assert.equal(next.resources.power, 62); // 70 - 8
  assert.equal(next.resources.water, 69); // 75 - 6
  assert.equal(next.resources.food, 70);
});

test('actions: recycle-water yields +18 water, costs -7 power', () => {
  const state = createInitialMission();
  const next = applyAction(state, 'recycle-water');

  assert.equal(next.actionsRemaining, 1);
  assert.equal(next.resources.water, 93); // 75 + 18
  assert.equal(next.resources.power, 63); // 70 - 7
});

test('actions: operate-greenhouse yields +17 food, costs -9 water and -6 power', () => {
  const state = createInitialMission();
  const next = applyAction(state, 'operate-greenhouse');

  assert.equal(next.actionsRemaining, 1);
  assert.equal(next.resources.food, 87); // 70 + 17
  assert.equal(next.resources.water, 66); // 75 - 9
  assert.equal(next.resources.power, 64); // 70 - 6
});

test('actions: reinforce-shelter reduces radiation risk by -18, costs -7 power', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 75, power: 70, water: 75, food: 70, radiationRisk: 30 },
  };
  const next = applyAction(state, 'reinforce-shelter');

  assert.equal(next.actionsRemaining, 1);
  assert.equal(next.resources.radiationRisk, 12); // 30 - 18
  assert.equal(next.resources.power, 63); // 70 - 7
});

test('actions: enforce exactly two actions per day limit', () => {
  let state = createInitialMission();
  assert.equal(state.actionsRemaining, 2);

  state = applyAction(state, 'maintain-solar');
  assert.equal(state.actionsRemaining, 1);

  state = applyAction(state, 'recycle-water');
  assert.equal(state.actionsRemaining, 0);

  // Attempting 3rd action must be rejected idempotently
  const thirdAttempt = applyAction(state, 'generate-oxygen');
  assert.equal(thirdAttempt, state, 'State must remain identical when actions are exhausted');
  assert.equal(thirdAttempt.actionsRemaining, 0);
  assert.equal(thirdAttempt.history.length, 2);
});

test('actions: reject unaffordable actions without deducting resources or action points', () => {
  const poorState: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 50, power: 4, water: 2, food: 50, radiationRisk: 10 },
  };

  // generate-oxygen requires 8 power and 6 water
  const rejected = applyAction(poorState, 'generate-oxygen');
  assert.equal(rejected, poorState, 'Must return state unchanged when costs cannot be paid');
  assert.equal(rejected.actionsRemaining, 2, 'Action slot must not be decremented');
  assert.deepEqual(rejected.resources, poorState.resources);
});

test('actions: reject actions while in event phase until dilemma is resolved', () => {
  const eventState: GameState = {
    ...createInitialMission(),
    day: 2,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };

  const rejected = applyAction(eventState, 'maintain-solar');
  assert.equal(rejected, eventState, 'Action must be blocked during event phase');
});

test('actions: reject actions when mission is failed or finished', () => {
  const failedState: GameState = {
    ...createInitialMission(),
    phase: 'result',
    outcome: 'failure',
  };
  assert.equal(applyAction(failedState, 'maintain-solar'), failedState);

  const successState: GameState = {
    ...createInitialMission(),
    phase: 'result',
    outcome: 'success',
  };
  assert.equal(applyAction(successState, 'maintain-solar'), successState);
});

// ============================================================================
// 3. BOUNDARY CLAMPING & NUMERIC INTEGRITY
// ============================================================================

test('bounds: clampResource strictly enforces [0, 100]', () => {
  assert.equal(clampResource(-10), 0);
  assert.equal(clampResource(0), 0);
  assert.equal(clampResource(55), 55);
  assert.equal(clampResource(100), 100);
  assert.equal(clampResource(120), 100);
  assert.equal(clampResource(NaN), 0);
  assert.equal(clampResource(Infinity), 0);
  assert.equal(clampResource(-Infinity), 0);
});

test('bounds: resource points exceeding 100 are discarded without overflow', () => {
  const highPowerState: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 75, power: 95, water: 75, food: 70, radiationRisk: 10 },
  };

  // maintain-solar yields +20 -> 95 + 20 = 115 -> clamped to 100
  const next = applyAction(highPowerState, 'maintain-solar');
  assert.equal(next.resources.power, 100);
});

test('bounds: radiation risk cannot drop below 0', () => {
  const lowRiskState: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 75, power: 70, water: 75, food: 70, radiationRisk: 5 },
  };

  // reinforce-shelter yields -18 -> 5 - 18 = -13 -> clamped to 0
  const next = applyAction(lowRiskState, 'reinforce-shelter');
  assert.equal(next.resources.radiationRisk, 0);
});

// ============================================================================
// 4. EVENT-CHOICE TRANSITIONS
// ============================================================================

test('events: applyEventChoice applies resource deltas and transitions phase to choose', () => {
  const state: GameState = {
    ...createInitialMission(),
    day: 2,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };

  const next = applyEventChoice(state, 'solar-activity', 'shelter-in-bunker');

  assert.equal(next.phase, 'choose');
  assert.equal(next.outcome, 'active');
  assert.equal(next.actionsRemaining, 2, 'Event choices must not consume maintenance actions');
  assert.equal(next.resources.power, 65); // 70 - 5
  assert.equal(next.resources.radiationRisk, 15); // 10 + 5
  assert.equal(next.emergencyMistakes, 0);

  assert.equal(next.history.length, 1);
  assert.equal(next.history[0].type, 'event');
  assert.equal(next.history[0].choiceId, 'shelter-in-bunker');
});

test('events: hazardous mistake choice increments emergencyMistakes counter', () => {
  const state: GameState = {
    ...createInitialMission(),
    day: 2,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };

  const next = applyEventChoice(state, 'solar-activity', 'delay-shelter');

  assert.equal(next.emergencyMistakes, 1);
  assert.equal(next.resources.radiationRisk, 25); // 10 + 15
});

test('events: reject event choice if phase is not event or IDs are invalid', () => {
  const normalState = createInitialMission(); // phase is 'briefing'
  const r1 = applyEventChoice(normalState, 'solar-activity', 'shelter-in-bunker');
  assert.equal(r1, normalState, 'Must reject choice outside event phase');

  const eventState: GameState = {
    ...normalState,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };
  const r2 = applyEventChoice(eventState, 'solar-activity', 'non-existent-choice');
  assert.equal(r2, eventState, 'Must reject non-existent choice ID');

  const r3 = applyEventChoice(eventState, 'wrong-scenario-id', 'shelter-in-bunker');
  assert.equal(r3, eventState, 'Must reject mismatched scenario ID');
});

test('events: lethal event choice immediately aborts mission', () => {
  const criticalState: GameState = {
    ...createInitialMission(),
    day: 3,
    phase: 'event',
    currentScenarioId: 'power-outage',
    resources: { oxygen: 75, power: 10, water: 75, food: 70, radiationRisk: 10 },
  };

  // bypass-safety-breaker causes power -15 -> 10 - 15 = -5 -> 0 (Fail!)
  const next = applyEventChoice(criticalState, 'power-outage', 'bypass-safety-breaker');
  assert.equal(next.resources.power, 0);
  assert.equal(next.outcome, 'failure');
  assert.equal(next.phase, 'result');
});

// ============================================================================
// 5. DAILY CONSUMPTION (BASELINE DRAIN) & FINISH DAY
// ============================================================================

test('finishDay: applies baseline daily drain exactly once', () => {
  const state = createInitialMission();
  const next = finishDay(state);

  // Initial: O2: 75, Pwr: 70, Water: 75, Food: 70, Risk: 10
  // Drain:   -16,     -14,       -14,       -14,       0
  assert.equal(next.resources.oxygen, 59);
  assert.equal(next.resources.power, 56);
  assert.equal(next.resources.water, 61);
  assert.equal(next.resources.food, 56);
  assert.equal(next.resources.radiationRisk, 10);

  // Day advances to 2, actions reset to 2, dilemma is active
  assert.equal(next.day, 2);
  assert.equal(next.actionsRemaining, 2);
  assert.equal(next.phase, 'event');
  assert.equal(next.currentScenarioId, 'solar-activity');
});

test('finishDay: blocked if mandatory daily dilemma is unresolved', () => {
  const eventState: GameState = {
    ...createInitialMission(),
    day: 2,
    phase: 'event',
    currentScenarioId: 'solar-activity',
  };

  const rejected = finishDay(eventState);
  assert.equal(rejected, eventState, 'Cannot skip mandatory dilemma via finishDay');
});

test('finishDay: triggers mission abort when vital reaches zero after drain', () => {
  const depletedState: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 10, power: 70, water: 75, food: 70, radiationRisk: 10 },
  };

  // Oxygen: 10 - 16 = -6 -> clamped to 0 -> Mission Failure!
  const next = finishDay(depletedState);
  assert.equal(next.resources.oxygen, 0);
  assert.equal(next.outcome, 'failure');
  assert.equal(next.phase, 'result');
});

test('finishDay: declares victory when Day 5 completes safely', () => {
  const day5State: GameState = {
    ...createInitialMission(),
    day: 5,
    phase: 'choose',
    actionsRemaining: 0,
    resources: { oxygen: 31, power: 40, water: 25, food: 48, radiationRisk: 0 },
  };

  const victory = finishDay(day5State);
  assert.equal(victory.outcome, 'success');
  assert.equal(victory.phase, 'result');
  assert.equal(victory.resources.oxygen, 15); // 31 - 16
  assert.equal(victory.resources.power, 26); // 40 - 14
  assert.equal(victory.resources.water, 11); // 25 - 14
  assert.equal(victory.resources.food, 34); // 48 - 14
  assert.equal(victory.resources.radiationRisk, 0);
});

test('finishDay: duplicate calls on concluded mission are idempotent no-ops', () => {
  const victoryState: GameState = {
    ...createInitialMission(),
    day: 5,
    phase: 'result',
    outcome: 'success',
  };

  assert.equal(finishDay(victoryState), victoryState);
});

// ============================================================================
// 6. FULL REPRESENTATIVE WALKTHROUGHS
// ============================================================================

test('walkthrough: complete balanced 5-day winning mission', () => {
  // Day 1: Start (75, 70, 75, 70, 10)
  let s = createInitialMission();
  s = applyAction(s, 'maintain-solar'); // Power +20 -> 90
  s = applyAction(s, 'generate-oxygen'); // O2 +20, Pwr -8, Water -6 -> (95, 82, 69, 70, 10)
  s = finishDay(s); // Drain -> (79, 68, 55, 56, 10)
  assert.equal(s.day, 2);
  assert.equal(s.outcome, 'active');

  // Day 2: Solar Event -> Shelter in bunker (Power -5, Risk +5) -> (79, 63, 55, 56, 15)
  s = applyEventChoice(s, 'solar-activity', 'shelter-in-bunker');
  s = applyAction(s, 'maintain-solar'); // Power +20 -> 83
  s = applyAction(s, 'recycle-water'); // Water +18, Power -7 -> (79, 76, 73, 56, 15)
  s = finishDay(s); // Drain -> (63, 62, 59, 42, 15)
  assert.equal(s.day, 3);
  assert.equal(s.outcome, 'active');

  // Day 3: Power Outage -> Reroute Aux (Power -8) -> (63, 54, 59, 42, 15)
  s = applyEventChoice(s, 'power-outage', 'reroute-aux-power');
  s = applyAction(s, 'maintain-solar'); // Power +20 -> 74
  s = applyAction(s, 'operate-greenhouse'); // Food +17, Water -9, Power -6 -> (63, 68, 50, 59, 15)
  s = finishDay(s); // Drain -> (47, 54, 36, 45, 15)
  assert.equal(s.day, 4);
  assert.equal(s.outcome, 'active');

  // Day 4: Water leak -> Flush manifold (Water -6) -> (47, 54, 30, 45, 15)
  s = applyEventChoice(s, 'greenhouse-water', 'flush-irrigation-manifold');
  s = applyAction(s, 'maintain-solar'); // Power +20 -> 74
  s = applyAction(s, 'recycle-water'); // Water +18, Power -7 -> (47, 67, 48, 45, 15)
  s = finishDay(s); // Drain -> (31, 53, 34, 31, 15)
  assert.equal(s.day, 5);
  assert.equal(s.outcome, 'active');

  // Day 5: Final Push (No event)
  s = applyAction(s, 'operate-greenhouse'); // Food +17, Water -9, Power -6 -> (31, 47, 25, 48, 15)
  s = applyAction(s, 'reinforce-shelter'); // Risk -18 (clamped 0), Power -7 -> (31, 40, 25, 48, 0)
  s = finishDay(s); // Drain -> (15, 26, 11, 34, 0)

  assert.equal(s.outcome, 'success');
  assert.equal(s.phase, 'result');
  assert.deepEqual(s.resources, {
    oxygen: 15,
    power: 26,
    water: 11,
    food: 34,
    radiationRisk: 0,
  });

  const finalScore = scoreMission(s);
  assert.equal(finalScore, 522);
});

// ============================================================================
// 7. IMMUTABILITY & DETERMINISM TESTS
// ============================================================================

test('immutability: functions never mutate input state or nested properties', () => {
  const initial = createInitialMission();
  const frozenInitial = Object.freeze({
    ...initial,
    resources: Object.freeze({ ...initial.resources }),
    history: Object.freeze([...initial.history]),
  }) as GameState;

  const next = applyAction(frozenInitial, 'maintain-solar');

  assert.notEqual(next, frozenInitial);
  assert.notEqual(next.resources, frozenInitial.resources);
  assert.notEqual(next.history, frozenInitial.history);
  assert.equal(frozenInitial.resources.power, 70);
  assert.equal(next.resources.power, 90);
});

test('determinism: identical actions produce byte-identical reproducible outputs', () => {
  const s1 = createInitialMission();
  const s2 = createInitialMission();

  const r1 = applyAction(s1, 'generate-oxygen');
  const r2 = applyAction(s2, 'generate-oxygen');

  assert.deepEqual(r1, r2);
});
