/**
 * TriOrbit — Lunar Survival Simulator
 * Comprehensive Five-Day Progression, Scoring & Outcome Unit Tests
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-009 Test Matrix
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialMission,
  applyAction,
  applyEventChoice,
  finishDay,
} from './engine';
import {
  isMissionActive,
  isMissionVictorious,
  isMissionFailed,
  isEventPending,
  canExecuteAction,
  canFinishDay,
  getFailureReason,
  getMissionSummary,
  getHistoryByDay,
  getActionHistory,
  getEventHistory,
  getNASAScenarioReference,
  resetMission,
  validateMissionInvariants,
} from './progression';
import {
  calculateMissionScore,
  getScoreBreakdown,
  computeScoreFromResources,
} from './scoring';
import type { GameState, ResourceState } from './types';

// ============================================================================
// 1. FIVE-DAY PROGRESSION & DAY-6 BOUNDARY PREVENTION
// ============================================================================

test('progression: day 1 starts in briefing with 2 action points', () => {
  const state = createInitialMission();
  assert.equal(state.day, 1);
  assert.equal(state.phase, 'briefing');
  assert.equal(state.actionsRemaining, 2);
  assert.equal(isMissionActive(state), true);
  assert.equal(isEventPending(state), false);
  assert.equal(canFinishDay(state), true);
});

test('progression: days 2, 3, and 4 enter event phase before maintenance actions', () => {
  let state = createInitialMission();

  // Day 1 -> Finish Day
  state = finishDay(state);
  assert.equal(state.day, 2);
  assert.equal(state.phase, 'event');
  assert.equal(state.currentScenarioId, 'solar-activity');
  assert.equal(isEventPending(state), true);
  assert.equal(canExecuteAction(state), false, 'Actions blocked during event');
  assert.equal(canFinishDay(state), false, 'Finish day blocked during event');

  // Resolve Day 2 Event
  state = applyEventChoice(state, 'solar-activity', 'shelter-in-bunker');
  assert.equal(state.phase, 'choose');
  assert.equal(isEventPending(state), false);
  assert.equal(canExecuteAction(state), true);

  // Day 2 -> Finish Day
  state = finishDay(state);
  assert.equal(state.day, 3);
  assert.equal(state.phase, 'event');
  assert.equal(state.currentScenarioId, 'power-outage');
  assert.equal(isEventPending(state), true);

  // Resolve Day 3 Event
  state = applyEventChoice(state, 'power-outage', 'reroute-aux-power');
  assert.equal(state.phase, 'choose');

  // Day 3 -> Finish Day
  state = finishDay(state);
  assert.equal(state.day, 4);
  assert.equal(state.phase, 'event');
  assert.equal(state.currentScenarioId, 'greenhouse-water');
  assert.equal(isEventPending(state), true);
});

test('progression: day 5 has choose phase and strictly prevents advancing to day 6', () => {
  let state = createInitialMission();
  // Simulate surviving up to morning of Day 5
  state = {
    ...state,
    day: 4,
    phase: 'choose',
    resources: { oxygen: 60, power: 60, water: 60, food: 60, radiationRisk: 10 },
  };

  // Day 4 settlement -> Day 5
  state = finishDay(state);
  assert.equal(state.day, 5);
  assert.equal(state.phase, 'choose', 'Day 5 has no scheduled dilemma');
  assert.equal(state.actionsRemaining, 2);
  assert.equal(isMissionActive(state), true);
  assert.equal(isMissionVictorious(state), false, 'Victory not declared before Day 5 completes');

  // Day 5 settlement -> Victory! (NOT Day 6)
  state = finishDay(state);
  assert.equal(state.day, 5, 'Day must remain 5, never advance to 6');
  assert.equal(state.phase, 'result');
  assert.equal(state.outcome, 'success');
  assert.equal(isMissionVictorious(state), true);
  assert.equal(isMissionActive(state), false);

  // Repeated finishDay calls cannot bypass victory or create Day 6
  const repeated = finishDay(state);
  assert.equal(repeated.day, 5);
  assert.equal(repeated.outcome, 'success');
});

// ============================================================================
// 2. CRITICAL THRESHOLD FAILURES & DIAGNOSTICS
// ============================================================================

test('failure: oxygen <= 0 causes immediate mission abort with diagnostic', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 0, power: 50, water: 50, food: 50, radiationRisk: 10 },
  };

  assert.equal(isMissionFailed(state), true);
  const reason = getFailureReason(state);
  assert.ok(reason);
  assert.equal(reason.resource, 'oxygen');
  assert.equal(reason.value, 0);
  assert.ok(reason.explanation.includes('oxygen'));
});

test('failure: power <= 0 causes immediate mission abort with diagnostic', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 50, power: 0, water: 50, food: 50, radiationRisk: 10 },
  };

  assert.equal(isMissionFailed(state), true);
  const reason = getFailureReason(state);
  assert.ok(reason);
  assert.equal(reason.resource, 'power');
  assert.ok(reason.explanation.includes('blackout'));
});

test('failure: water <= 0 causes immediate mission abort with diagnostic', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 50, power: 50, water: 0, food: 50, radiationRisk: 10 },
  };

  assert.equal(isMissionFailed(state), true);
  const reason = getFailureReason(state);
  assert.ok(reason);
  assert.equal(reason.resource, 'water');
});

test('failure: food <= 0 causes immediate mission abort with diagnostic', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 50, power: 50, water: 50, food: 0, radiationRisk: 10 },
  };

  assert.equal(isMissionFailed(state), true);
  const reason = getFailureReason(state);
  assert.ok(reason);
  assert.equal(reason.resource, 'food');
});

test('failure: radiationRisk >= 100 causes immediate mission abort with diagnostic', () => {
  const state: GameState = {
    ...createInitialMission(),
    resources: { oxygen: 50, power: 50, water: 50, food: 50, radiationRisk: 100 },
  };

  assert.equal(isMissionFailed(state), true);
  const reason = getFailureReason(state);
  assert.ok(reason);
  assert.equal(reason.resource, 'radiationRisk');
  assert.equal(reason.value, 100);
});

test('failure: no further actions or transitions allowed after mission failure', () => {
  const failedState: GameState = {
    ...createInitialMission(),
    phase: 'result',
    outcome: 'failure',
    resources: { oxygen: 0, power: 50, water: 50, food: 50, radiationRisk: 10 },
  };

  assert.equal(applyAction(failedState, 'maintain-solar'), failedState);
  assert.equal(applyEventChoice(failedState, 'solar-activity', 'shelter-in-bunker'), failedState);
  assert.equal(finishDay(failedState), failedState);
});

// ============================================================================
// 3. FULL SUCCESSFUL & FAILING PLAYTHROUGHS
// ============================================================================

test('playthrough: complete 5-day winning walkthrough matches frozen arithmetic', () => {
  let s = createInitialMission();
  assert.equal(s.day, 1);

  // Day 1 Actions: maintain-solar, generate-oxygen
  s = applyAction(s, 'maintain-solar'); // Pwr +20 -> 90
  s = applyAction(s, 'generate-oxygen'); // O2 +20, Pwr -8, Water -6 -> (95, 82, 69, 70, 10)
  s = finishDay(s); // Daily Drain -> (79, 68, 55, 56, 10)
  assert.equal(s.day, 2);
  assert.deepEqual(s.resources, { oxygen: 79, power: 68, water: 55, food: 56, radiationRisk: 10 });

  // Day 2 Dilemma: Solar Alert -> shelter-in-bunker (Pwr -5, Risk +5)
  s = applyEventChoice(s, 'solar-activity', 'shelter-in-bunker');
  s = applyAction(s, 'maintain-solar'); // Pwr +20 -> 83
  s = applyAction(s, 'recycle-water'); // Water +18, Pwr -7 -> (79, 76, 73, 56, 15)
  s = finishDay(s); // Daily Drain -> (63, 62, 59, 42, 15)
  assert.equal(s.day, 3);
  assert.deepEqual(s.resources, { oxygen: 63, power: 62, water: 59, food: 42, radiationRisk: 15 });

  // Day 3 Dilemma: Grid Anomaly -> reroute-aux-power (Pwr -8)
  s = applyEventChoice(s, 'power-outage', 'reroute-aux-power');
  s = applyAction(s, 'maintain-solar'); // Pwr +20 -> 74
  s = applyAction(s, 'operate-greenhouse'); // Food +17, Water -9, Pwr -6 -> (63, 68, 50, 59, 15)
  s = finishDay(s); // Daily Drain -> (47, 54, 36, 45, 15)
  assert.equal(s.day, 4);
  assert.deepEqual(s.resources, { oxygen: 47, power: 54, water: 36, food: 45, radiationRisk: 15 });

  // Day 4 Dilemma: Hydroponics Leak -> flush-irrigation-manifold (Water -6)
  s = applyEventChoice(s, 'greenhouse-water', 'flush-irrigation-manifold');
  s = applyAction(s, 'maintain-solar'); // Pwr +20 -> 74
  s = applyAction(s, 'recycle-water'); // Water +18, Pwr -7 -> (47, 67, 48, 45, 15)
  s = finishDay(s); // Daily Drain -> (31, 53, 34, 31, 15)
  assert.equal(s.day, 5);
  assert.deepEqual(s.resources, { oxygen: 31, power: 53, water: 34, food: 31, radiationRisk: 15 });

  // Day 5: Final maintenance
  s = applyAction(s, 'operate-greenhouse'); // Food +17, Water -9, Pwr -6 -> (31, 47, 25, 48, 15)
  s = applyAction(s, 'reinforce-shelter'); // Risk -18 (to 0), Pwr -7 -> (31, 40, 25, 48, 0)
  s = finishDay(s); // Final Daily Drain -> (15, 26, 11, 34, 0)

  // Outcome Verification
  assert.equal(s.day, 5);
  assert.equal(s.outcome, 'success');
  assert.equal(s.phase, 'result');
  assert.equal(isMissionVictorious(s), true);
  assert.deepEqual(s.resources, { oxygen: 15, power: 26, water: 11, food: 34, radiationRisk: 0 });

  // Score Verification: 500 + (15+26+11+34)/4 - 0 - 0 = 500 + 21.5 = 521.5 -> 522
  const score = calculateMissionScore(s);
  assert.equal(score, 522);

  const breakdown = getScoreBreakdown(s);
  assert.equal(breakdown.baseSurvivalBonus, 500);
  assert.equal(breakdown.essentialsAverage, 21.5);
  assert.equal(breakdown.radiationPenalty, 0);
  assert.equal(breakdown.emergencyMistakePenalty, 0);
  assert.equal(breakdown.finalScore, 522);
  assert.equal(breakdown.rating, 'Acceptable Survival');

  // Invariants check
  const invariantCheck = validateMissionInvariants(s);
  assert.equal(invariantCheck.valid, true);
});

test('playthrough: failing walkthrough when neglecting solar leads to blackout', () => {
  let s = createInitialMission();

  // Day 1: Ignore solar, take 2 oxygen generations
  s = applyAction(s, 'generate-oxygen');
  s = applyAction(s, 'generate-oxygen');
  s = finishDay(s); // Power drops from 70 to: 70 - 16 - 14 = 40
  assert.equal(s.day, 2);

  // Day 2: Take risky EVA (Mistake +1, Risk +15)
  s = applyEventChoice(s, 'solar-activity', 'delay-shelter');
  assert.equal(s.emergencyMistakes, 1);
  s = applyAction(s, 'generate-oxygen'); // Power 40 - 8 = 32
  s = applyAction(s, 'recycle-water'); // Power 32 - 7 = 25
  s = finishDay(s); // Power 25 - 14 = 11
  assert.equal(s.day, 3);
  assert.equal(s.resources.power, 11);

  // Day 3: Force breaker reset (Mistake +1, Power -15) -> 11 - 15 = -4 -> 0!
  s = applyEventChoice(s, 'power-outage', 'bypass-safety-breaker');
  assert.equal(s.resources.power, 0);
  assert.equal(s.outcome, 'failure');
  assert.equal(s.phase, 'result');
  assert.equal(isMissionFailed(s), true);

  const summary = getMissionSummary(s);
  assert.equal(summary.isFailed, true);
  assert.equal(summary.failureReason?.resource, 'power');
});

// ============================================================================
// 4. DETERMINISTIC SCORING CONTRACT TESTS
// ============================================================================

test('scoring: formula adheres strictly to approved specification', () => {
  // Max hypothetical score: O2:100, Pwr:100, Water:100, Food:100, Risk:0, Mistakes:0
  // Score = 500 + 100 - 0 - 0 = 600
  const maxRes: ResourceState = { oxygen: 100, power: 100, water: 100, food: 100, radiationRisk: 0 };
  assert.equal(computeScoreFromResources(maxRes, 0, true), 600);

  // Mistake deductions: 3 mistakes = -75 points
  assert.equal(computeScoreFromResources(maxRes, 3, true), 525);

  // Radiation risk deduction: Risk 40 = -40 points
  const highRiskRes: ResourceState = { ...maxRes, radiationRisk: 40 };
  assert.equal(computeScoreFromResources(highRiskRes, 0, true), 560);

  // Clamping at lower bound 0
  const abysmalRes: ResourceState = { oxygen: 5, power: 5, water: 5, food: 5, radiationRisk: 95 };
  // Without base bonus (lost mission): 0 + 5 - 95 - 25*10 = -340 -> clamped to 0
  assert.equal(computeScoreFromResources(abysmalRes, 10, false), 0);
});

test('scoring: repeated calculations yield identical results', () => {
  const state: GameState = {
    ...createInitialMission(),
    day: 5,
    outcome: 'success',
    resources: { oxygen: 20, power: 30, water: 20, food: 30, radiationRisk: 5 },
    emergencyMistakes: 1,
  };

  const s1 = calculateMissionScore(state);
  const s2 = calculateMissionScore(state);
  const b1 = getScoreBreakdown(state);
  const b2 = getScoreBreakdown(state);

  assert.equal(s1, s2);
  assert.deepEqual(b1, b2);
});

// ============================================================================
// 5. MISSION HISTORY & NASA REFERENCE INTEGRITY
// ============================================================================

test('history: logs all decisions deterministically with accurate types and deltas', () => {
  let s = createInitialMission();
  s = applyAction(s, 'maintain-solar');
  s = finishDay(s);
  s = applyEventChoice(s, 'solar-activity', 'shelter-in-bunker');

  assert.equal(s.history.length, 3);
  assert.equal(s.history[0].type, 'action');
  assert.equal(s.history[0].actionId, 'maintain-solar');
  assert.equal(s.history[1].type, 'drain');
  assert.equal(s.history[2].type, 'event');
  assert.equal(s.history[2].scenarioId, 'solar-activity');

  const day1Records = getHistoryByDay(s.history, 1);
  assert.equal(day1Records.length, 2); // action + drain

  const actionRecords = getActionHistory(s.history);
  assert.equal(actionRecords.length, 1);

  const eventRecords = getEventHistory(s.history);
  assert.equal(eventRecords.length, 1);
});

test('history: preserves NASA observation provenance reference', () => {
  const nasaEvent = getNASAScenarioReference('solar-activity');
  assert.ok(nasaEvent);
  assert.equal(nasaEvent.id, '2024-05-11T04:07:00-SEP-001');
  assert.equal(nasaEvent.type, 'SEP');
  assert.equal(nasaEvent.source, 'NASA DONKI');

  // Fictional educational scenarios return null for NASA source
  const fictional = getNASAScenarioReference('power-outage');
  assert.equal(fictional, null);
});

// ============================================================================
// 6. REPLAY & RESTART INTEGRITY
// ============================================================================

test('restart: resetMission completely wipes previous mission state without leakage', () => {
  // Simulate a completed mission with dirty state
  const completedState: GameState = {
    ...createInitialMission(),
    day: 5,
    phase: 'result',
    outcome: 'success',
    actionsRemaining: 0,
    emergencyMistakes: 3,
    resources: { oxygen: 15, power: 26, water: 11, food: 34, radiationRisk: 0 },
    history: [
      { day: 1, type: 'action', actionId: 'maintain-solar', after: { ...createInitialMission().resources } },
    ],
  };

  const freshMission = resetMission();

  assert.equal(freshMission.day, 1);
  assert.equal(freshMission.phase, 'briefing');
  assert.equal(freshMission.actionsRemaining, 2);
  assert.equal(freshMission.emergencyMistakes, 0);
  assert.equal(freshMission.outcome, 'active');
  assert.equal(freshMission.currentScenarioId, undefined);
  assert.deepEqual(freshMission.history, []);
  assert.deepEqual(freshMission.resources, { oxygen: 75, power: 70, water: 75, food: 70, radiationRisk: 10 });

  // Verify deep object independence
  assert.notEqual(freshMission.resources, completedState.resources);
  assert.notEqual(freshMission.history, completedState.history);
});
