/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-020: End-to-End Five-Day Mission Integration Verification Suite
 *
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  createInitialMission,
  executeAction,
  executeFinishDay,
  applyEventChoice,
  scoreMission,
  isMissionActive,
  isMissionVictorious,
  isMissionFailed,
  isEventPending,
  getFailureReason,
} from './controller';
import { DAILY_DRAIN, INITIAL_RESOURCES } from './contracts';
import { DEFAULT_SCENARIOS } from './constants';
import { MissionScreen } from '@/components/game/MissionScreen';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { EventModal } from '@/components/events/EventModal';
import { ScienceDrawer } from '@/components/learn/ScienceDrawer';
import { fetchNASAEvents, NASA_SCIENTIFIC_CAUTION } from '@/lib/nasa/donki';

describe('TRI-020: End-to-End Mission Integration & Lifecycle', () => {
  // --------------------------------------------------------------------------
  // TEST 1: Full 5-Day Playable Winning Walkthrough
  // --------------------------------------------------------------------------
  it('executes the full five-day winning mission loop with three events and replay reset', () => {
    // === DAY 1: Orientation & Baseline Operations ===
    let state = createInitialMission();
    assert.equal(state.day, 1);
    assert.equal(state.phase, 'briefing');
    assert.equal(state.actionsRemaining, 2);
    assert.equal(state.outcome, 'active');
    assert.equal(isMissionActive(state), true);
    assert.equal(isEventPending(state), false);

    // Initial vitals: O2: 75, Power: 70, Water: 75, Food: 70, Risk: 10
    assert.deepEqual(state.resources, INITIAL_RESOURCES);

    // Day 1 Action 1: Maintain Solar Array (+20 Power, 0 Cost) -> Power: 90
    let res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, true);
    state = res.state;
    assert.equal(state.actionsRemaining, 1);
    assert.equal(state.resources.power, 90);

    // Day 1 Action 2: Generate Oxygen (+20 O2, -8 Power, -6 Water) -> (95, 82, 69, 70, 10)
    res = executeAction(state, 'generate-oxygen');
    assert.equal(res.success, true);
    state = res.state;
    assert.equal(state.actionsRemaining, 0);
    assert.equal(state.resources.oxygen, 95);
    assert.equal(state.resources.power, 82);
    assert.equal(state.resources.water, 69);

    // Third action must be rejected (action budget limit)
    res = executeAction(state, 'recycle-water');
    assert.equal(res.success, false);
    assert.ok(res.reason?.includes('Daily action limit reached'));

    // Conclude Day 1 -> Baseline drain: -16 O2, -14 Power, -14 Water, -14 Food, 0 Risk
    let finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    // === DAY 2: NASA-Linked Solar Energetic Particle Event ===
    assert.equal(state.day, 2);
    assert.equal(state.phase, 'event');
    assert.equal(state.currentScenarioId, 'solar-activity');
    assert.equal(isEventPending(state), true);
    assert.equal(state.actionsRemaining, 2);

    // Expected vitals after Day 1 drain: (79, 68, 55, 56, 10)
    assert.deepEqual(state.resources, { oxygen: 79, power: 68, water: 55, food: 56, radiationRisk: 10 });

    // Maintenance actions and finish day are locked while event is pending
    res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, false);
    assert.ok(res.reason?.includes('Space weather dilemma pending'));

    finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, false);

    // Resolve Day 2 Event: Shelter in Bunker (-5 Power, +5 Risk, 0 Mistakes) -> (79, 63, 55, 56, 15)
    state = applyEventChoice(state, 'solar-activity', 'shelter-in-bunker');
    assert.equal(state.phase, 'choose');
    assert.equal(isEventPending(state), false);
    assert.equal(state.emergencyMistakes, 0);
    assert.equal(state.resources.power, 63);
    assert.equal(state.resources.radiationRisk, 15);

    // Day 2 Action 1: Maintain Solar (+20 Power) -> Power: 83
    res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, true);
    state = res.state;

    // Day 2 Action 2: Recycle Water (+18 Water, -7 Power) -> (79, 76, 73, 56, 15)
    res = executeAction(state, 'recycle-water');
    assert.equal(res.success, true);
    state = res.state;
    assert.deepEqual(state.resources, { oxygen: 79, power: 76, water: 73, food: 56, radiationRisk: 15 });

    // Conclude Day 2 -> Drain -> (63, 62, 59, 42, 15)
    finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    // === DAY 3: Electrical Grid Fluctuation Dilemma ===
    assert.equal(state.day, 3);
    assert.equal(state.phase, 'event');
    assert.equal(state.currentScenarioId, 'power-outage');
    assert.equal(isEventPending(state), true);
    assert.deepEqual(state.resources, { oxygen: 63, power: 62, water: 59, food: 42, radiationRisk: 15 });

    // Resolve Day 3 Event: Reroute aux power (-8 Power, 0 Mistakes) -> (63, 54, 59, 42, 15)
    state = applyEventChoice(state, 'power-outage', 'reroute-aux-power');
    assert.equal(state.phase, 'choose');

    // Day 3 Action 1: Maintain Solar (+20 Power) -> Power: 74
    res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, true);
    state = res.state;

    // Day 3 Action 2: Operate Greenhouse (+17 Food, -6 Power, -9 Water) -> (63, 68, 50, 59, 15)
    res = executeAction(state, 'operate-greenhouse');
    assert.equal(res.success, true);
    state = res.state;
    assert.deepEqual(state.resources, { oxygen: 63, power: 68, water: 50, food: 59, radiationRisk: 15 });

    // Conclude Day 3 -> Drain -> (47, 54, 36, 45, 15)
    finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    // === DAY 4: Hydroponic Irrigation Anomaly Dilemma ===
    assert.equal(state.day, 4);
    assert.equal(state.phase, 'event');
    assert.equal(state.currentScenarioId, 'greenhouse-water');
    assert.deepEqual(state.resources, { oxygen: 47, power: 54, water: 36, food: 45, radiationRisk: 15 });

    // Resolve Day 4 Event: Flush irrigation manifold (-6 Water, 0 Mistakes) -> (47, 54, 30, 45, 15)
    state = applyEventChoice(state, 'greenhouse-water', 'flush-irrigation-manifold');
    assert.equal(state.phase, 'choose');

    // Day 4 Action 1: Maintain Solar (+20 Power) -> Power: 74
    res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, true);
    state = res.state;

    // Day 4 Action 2: Recycle Water (+18 Water, -7 Power) -> (47, 67, 48, 45, 15)
    res = executeAction(state, 'recycle-water');
    assert.equal(res.success, true);
    state = res.state;
    assert.deepEqual(state.resources, { oxygen: 47, power: 67, water: 48, food: 45, radiationRisk: 15 });

    // Conclude Day 4 -> Drain -> (31, 53, 34, 31, 15)
    finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    // === DAY 5: Final Survival Rotation (No Dilemma) ===
    assert.equal(state.day, 5);
    assert.equal(state.phase, 'choose');
    assert.equal(state.currentScenarioId, undefined);
    assert.equal(isEventPending(state), false);
    assert.deepEqual(state.resources, { oxygen: 31, power: 53, water: 34, food: 31, radiationRisk: 15 });

    // Day 5 Action 1: Operate Greenhouse (+17 Food, -6 Power, -9 Water) -> (31, 47, 25, 48, 15)
    res = executeAction(state, 'operate-greenhouse');
    assert.equal(res.success, true);
    state = res.state;

    // Day 5 Action 2: Reinforce Shelter (-18 Risk to 0, -7 Power) -> (31, 40, 25, 48, 0)
    res = executeAction(state, 'reinforce-shelter');
    assert.equal(res.success, true);
    state = res.state;
    assert.deepEqual(state.resources, { oxygen: 31, power: 40, water: 25, food: 48, radiationRisk: 0 });

    // Conclude Day 5 -> Final Baseline Drain -> (15, 26, 11, 34, 0) & Expedition Victory
    finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    assert.equal(state.day, 5);
    assert.equal(state.outcome, 'success');
    assert.equal(state.phase, 'result');
    assert.equal(isMissionVictorious(state), true);
    assert.equal(isMissionFailed(state), false);
    assert.deepEqual(state.resources, { oxygen: 15, power: 26, water: 11, food: 34, radiationRisk: 0 });

    // Verify deterministic score calculation: 500 + (15+26+11+34)/4 - 0 - 0 = 522
    const score = scoreMission(state);
    assert.equal(score, 522);

    // All actions must now be locked
    res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, false);

    // Reset mission cleanly -> Fresh Day 1 state
    const reset = createInitialMission();
    assert.equal(reset.day, 1);
    assert.equal(reset.phase, 'briefing');
    assert.equal(reset.actionsRemaining, 2);
    assert.equal(reset.emergencyMistakes, 0);
    assert.deepEqual(reset.history, []);
    assert.deepEqual(reset.resources, INITIAL_RESOURCES);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Failure Case — Power Depletion Blackout
  // --------------------------------------------------------------------------
  it('detects vital depletion failure, locks commands, and diagnoses failure reason', () => {
    let state = createInitialMission();

    // Force power to a depleted state that will hit 0 upon night drain
    state = {
      ...state,
      resources: {
        ...state.resources,
        power: 10, // Daily drain is -14 Power -> 10 - 14 = -4 -> clamps to 0
      },
    };

    // Conclude Day 1 with exhausted power
    const finishRes = executeFinishDay(state);
    assert.equal(finishRes.success, true);
    state = finishRes.state;

    assert.equal(state.outcome, 'failure');
    assert.equal(state.phase, 'result');
    assert.equal(state.resources.power, 0);
    assert.equal(isMissionFailed(state), true);
    assert.equal(isMissionVictorious(state), false);

    // Diagnostic must identify power blackout
    const failureReason = getFailureReason(state);
    assert.ok(failureReason);
    assert.equal(failureReason.resource, 'power');
    assert.equal(failureReason.value, 0);
    assert.ok(failureReason.explanation.includes('blackout'));

    // Actions locked on failed mission
    const res = executeAction(state, 'maintain-solar');
    assert.equal(res.success, false);
    assert.ok(res.reason?.includes('Mission aborted'));
  });

  // --------------------------------------------------------------------------
  // TEST 3: Frozen Rule Verification — DAILY_DRAIN.radiationRisk === 0
  // --------------------------------------------------------------------------
  it('verifies canonical rule that radiation risk has NO passive daily drain', () => {
    assert.equal(DAILY_DRAIN.radiationRisk, 0);

    const initial = createInitialMission();
    assert.equal(initial.resources.radiationRisk, 10);

    // Finish Day 1 without any radiation-changing actions
    const afterDay1 = executeFinishDay(initial);
    assert.equal(
      afterDay1.state.resources.radiationRisk,
      10,
      'Radiation Risk must remain exactly 10 after Day 1 drain with zero passive increase'
    );
  });

  // --------------------------------------------------------------------------
  // TEST 4: NASA Route & Verified Fallback Contract
  // --------------------------------------------------------------------------
  it('verifies NASA offline fallback returns authentic observations and disclaimer', async () => {
    const response = await fetchNASAEvents({ timeoutMs: 0 }); // Force fallback path
    assert.ok(response);
    assert.equal(response.provenance, 'verified-fallback');
    assert.ok(Array.isArray(response.events));
    assert.ok(response.events.length > 0);
    assert.equal(response.caution, NASA_SCIENTIFIC_CAUTION);

    const firstEvent = response.events[0];
    assert.ok(firstEvent.id);
    assert.ok(firstEvent.title);
    assert.equal(firstEvent.source, 'NASA DONKI');
    assert.ok(firstEvent.sourceUrl.startsWith('https://'));
  });

  // --------------------------------------------------------------------------
  // TEST 5: Component SSR Rendering Verification
  // --------------------------------------------------------------------------
  it('renders MissionScreen cleanly in SSR without errors', () => {
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(html.includes('TriOrbit'));
    assert.ok(html.includes('Mission Telemetry and Resources HUD'));
    assert.ok(html.includes('Interactive Lunar Base Station'));
    assert.ok(html.includes('Facility Maintenance Controls'));
  });

  it('renders ResultsScreen with victory debrief and score', () => {
    const html = renderToString(
      React.createElement(ResultsScreen, {
        outcome: 'success',
        day: 5,
        resources: { oxygen: 60, power: 55, water: 50, food: 65, radiationRisk: 15 },
        score: 545,
        history: [],
        onRestart: () => {},
      })
    );

    assert.ok(html.includes('Mission Accomplished'));
    assert.ok(html.includes('545'));
    assert.ok(html.includes('Replay Mission') || html.includes('Restart Mission'));
  });

  it('renders EventModal for Day 2 solar scenario', () => {
    const scenario = DEFAULT_SCENARIOS[0]; // solar-activity
    const html = renderToString(
      React.createElement(EventModal, {
        open: true,
        scenario,
        onSelectChoice: () => {},
      })
    );

    assert.ok(html.includes('Solar Energetic Particle Warning'));
    assert.ok(html.includes('Shelter crew in shielded regolith bunker'));
    assert.ok(html.includes('Delay shelter to maintain external operations'));
    assert.ok(html.includes('NASA Observation'));
  });

  it('renders ScienceDrawer with verified NASA facts', () => {
    const html = renderToString(
      React.createElement(ScienceDrawer, {
        open: true,
        onClose: () => {},
      })
    );

    assert.ok(html.includes('Mission Science Briefing'));
    assert.ok(html.includes('NASA DONKI records authentic'));
  });
});
