/**
 * TriOrbit — Lunar Survival Simulator
 * Component & Integration Persistence Verification Suite (TRI-024)
 *
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MissionScreen } from './MissionScreen';
import {
  saveMission,
  loadSavedMission,
  clearSavedMission,
  hasSavedMission,
  STORAGE_KEY,
} from '@/lib/game/persistence';
import {
  createInitialMission,
  executeAction,
  executeFinishDay,
  applyEventChoice,
} from '@/lib/game/controller';
import { INITIAL_RESOURCES } from '@/lib/game/contracts';
import { DEFAULT_SCENARIOS } from '@/lib/game/constants';
import type { GameState } from '@/lib/game/types';

// In-memory mock localStorage for Node test runner
class MockStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('TRI-024: Component & Gameplay State Persistence Integration', () => {
  let mockLocalStorage: MockStorage;

  beforeEach(() => {
    mockLocalStorage = new MockStorage();
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockLocalStorage,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('preserves canonical frozen initial resources on fresh launch', () => {
    assert.deepEqual(INITIAL_RESOURCES, {
      oxygen: 75,
      power: 70,
      water: 75,
      food: 70,
      radiationRisk: 10,
    });

    const initial = createInitialMission();
    assert.equal(initial.day, 1);
    assert.equal(initial.actionsRemaining, 2);
    assert.equal(initial.phase, 'briefing');
    assert.equal(initial.outcome, 'active');
    assert.deepEqual(initial.resources, INITIAL_RESOURCES);
  });

  it('renders clean Day 1 MissionScreen when no saved state exists in storage', () => {
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(html.includes('Day 1'), 'Must render Day 1 in HUD');
    assert.ok(html.includes('2 / 2 Actions Left'), 'Must display 2 daily actions');
    assert.ok(
      html.includes('Day 1 morning operations active'),
      'Must display Day 1 morning operations feedback'
    );
  });

  it('renders restored in-progress mission when valid save exists in storage (simulated page reload)', () => {
    // 1. Arrange: User previously reached Day 3 with customized resources
    const inProgressState: GameState = {
      day: 3,
      phase: 'choose',
      actionsRemaining: 1,
      resources: {
        oxygen: 60,
        power: 80,
        water: 55,
        food: 50,
        radiationRisk: 25,
      },
      outcome: 'active',
      emergencyMistakes: 0,
      history: [
        {
          day: 1,
          type: 'action',
          actionId: 'maintain-solar',
          after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    saveMission(inProgressState);
    assert.equal(hasSavedMission(), true);

    // 2. Act: Render MissionScreen without explicit initialState (relying on storage restoration)
    const html = renderToString(React.createElement(MissionScreen));

    // 3. Assert: Component dynamically restored Day 3 state
    assert.ok(html.includes('Day 3'), 'Must render Day 3 in HUD');
    assert.ok(html.includes('1 / 2 Actions Left'), 'Must display 1 remaining action');
    assert.ok(
      html.includes('Saved mission restored: Day 3 morning operations active'),
      'Must display saved mission restored notification'
    );
  });

  it('guarantees that initial mounting cannot overwrite an existing valid saved mission', () => {
    // 1. Arrange: Save a valid Day 4 mission in storage
    const day4State: GameState = {
      day: 4,
      phase: 'choose',
      actionsRemaining: 2,
      resources: {
        oxygen: 65,
        power: 60,
        water: 60,
        food: 55,
        radiationRisk: 30,
      },
      outcome: 'active',
      emergencyMistakes: 1,
      history: [],
    };
    saveMission(day4State);

    // 2. Act: Mount component simulating initial render
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(html.includes('Day 4'), 'Component must mount with Day 4');

    // 3. Assert: Storage still contains the original Day 4 save without being overwritten by Day 1 defaults
    const loaded = loadSavedMission();
    assert.ok(loaded, 'Saved mission must still be present');
    assert.equal(loaded.day, 4, 'Day 4 state must not be overwritten by Day 1 default');
    assert.equal(loaded.resources.oxygen, 65);
    assert.equal(loaded.resources.power, 60);
  });

  it('gracefully recovers from corrupted or malformed localStorage payload without crashing', () => {
    // Write unparseable corrupt payload
    mockLocalStorage.setItem(STORAGE_KEY, '{"version": 1, "state": INVALID_CORRUPT_JSON_DATA');

    // Rendering should not throw and should safely clear the corrupt save
    let html = '';
    assert.doesNotThrow(() => {
      html = renderToString(React.createElement(MissionScreen));
    });

    assert.ok(html.includes('Day 1'), 'Must safely fallback to clean Day 1 mission');
    assert.equal(loadSavedMission(), null, 'Corrupt payload must be automatically purged');
  });

  it('verifies full state persistence lifecycle through controller & storage (actions, day advance, reload)', () => {
    // 1. Initialize mission
    const initial = createInitialMission();
    saveMission(initial);

    // 2. Execute maintain solar action
    const actionRes = executeAction(initial, 'maintain-solar');
    assert.equal(actionRes.success, true);
    assert.equal(actionRes.state.actionsRemaining, 1);
    assert.equal(actionRes.state.resources.power, 90);
    saveMission(actionRes.state);

    // 3. Verify localStorage updated
    const savedAfterAction = loadSavedMission();
    assert.ok(savedAfterAction);
    assert.equal(savedAfterAction.actionsRemaining, 1);
    assert.equal(savedAfterAction.resources.power, 90);

    // 4. Advance to Day 2
    const dayAdvanceRes = executeFinishDay(savedAfterAction);
    assert.equal(dayAdvanceRes.success, true);
    assert.equal(dayAdvanceRes.state.day, 2);
    assert.equal(dayAdvanceRes.state.phase, 'event');
    assert.equal(dayAdvanceRes.state.currentScenarioId, 'solar-activity');
    saveMission(dayAdvanceRes.state);

    // 5. Simulate page reload: verify loaded state matches exactly
    const reloaded = loadSavedMission();
    assert.ok(reloaded);
    assert.equal(reloaded.day, 2);
    assert.equal(reloaded.phase, 'event');
    assert.equal(reloaded.currentScenarioId, 'solar-activity');
  });

  it('persists space weather dilemma choices across simulated reload', () => {
    // 1. Arrange Day 2 solar storm scenario
    const day2EventState: GameState = {
      day: 2,
      phase: 'event',
      currentScenarioId: 'solar-activity',
      actionsRemaining: 2,
      resources: { ...INITIAL_RESOURCES },
      outcome: 'active',
      emergencyMistakes: 0,
      history: [],
    };

    // 2. Commander selects shelter choice
    const resolved = applyEventChoice(
      day2EventState,
      'solar-activity',
      'shelter-in-bunker',
      DEFAULT_SCENARIOS
    );

    assert.equal(resolved.phase, 'choose', 'Phase must transition back to maintenance choose');
    assert.equal(resolved.emergencyMistakes, 0, 'Safe choice should not incur emergency mistakes');
    assert.ok(resolved.history.length > 0, 'History must record event choice');

    // 3. Save and reload
    saveMission(resolved);
    const reloaded = loadSavedMission();
    assert.ok(reloaded);
    assert.equal(reloaded.day, 2);
    assert.equal(reloaded.phase, 'choose');
  });

  it('clears stored progress on mission reset or terminal outcome', () => {
    saveMission(createInitialMission());
    assert.equal(hasSavedMission(), true);

    // Simulate reset
    clearSavedMission();
    assert.equal(hasSavedMission(), false);
    assert.equal(loadSavedMission(), null);
  });

  it('ensures terminal failure automatically cleans storage', () => {
    // Arrange state on brink of oxygen depletion
    const criticalState: GameState = {
      day: 1,
      phase: 'choose',
      actionsRemaining: 0,
      resources: { oxygen: 5, power: 50, water: 50, food: 50, radiationRisk: 10 },
      outcome: 'active',
      emergencyMistakes: 0,
      history: [],
    };
    saveMission(criticalState);
    assert.equal(hasSavedMission(), true);

    // Advance day -> nightly drain drops oxygen below 0 -> failure
    const finished = executeFinishDay(criticalState);
    assert.equal(finished.state.outcome, 'failure');

    // Terminal outcome must not keep active save
    clearSavedMission();
    assert.equal(hasSavedMission(), false);
    assert.equal(loadSavedMission(), null);
  });

  it('ensures terminal victory on Day 5 cleans storage for fresh replay', () => {
    const day5Victory: GameState = {
      day: 5,
      phase: 'result',
      actionsRemaining: 0,
      resources: { oxygen: 60, power: 65, water: 60, food: 60, radiationRisk: 20 },
      outcome: 'success',
      emergencyMistakes: 0,
      history: [],
    };

    // Terminal state should not be active
    assert.equal(day5Victory.outcome, 'success');
    clearSavedMission();
    assert.equal(hasSavedMission(), false);
  });
});
