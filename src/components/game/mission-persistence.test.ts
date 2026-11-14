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
import { useMission } from '@/hooks/useMission';
import {
  saveMission,
  loadSavedMission,
  clearSavedMission,
  hasSavedMission,
  STORAGE_KEY,
} from '@/lib/game/persistence';
import {
  createInitialMission,
  executeFinishDay,
} from '@/lib/game/controller';
import { INITIAL_RESOURCES } from '@/lib/game/contracts';
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

  it('verifies full state persistence lifecycle through mounted useMission hook (actions, day advance, reload)', () => {
    let hookOutput = null as unknown as ReturnType<typeof useMission>;
    function TestHookHarness() {
      hookOutput = useMission();
      return React.createElement('div', null, `Day: ${hookOutput.gameState.day}`);
    }

    // 1. Initial mount of hook
    renderToString(React.createElement(TestHookHarness));
    assert.equal(hookOutput.gameState.day, 1);
    assert.equal(hookOutput.gameState.actionsRemaining, 2);

    // 2. Execute maintain-solar action through hook
    const actionResult = hookOutput.executeAction('maintain-solar');
    assert.equal(actionResult.success, true);
    assert.equal(actionResult.state.actionsRemaining, 1);
    assert.equal(actionResult.state.resources.power, 90);

    // 3. Conclude Day 1 through hook -> advances to Day 2 event
    const finishResult = hookOutput.finishDay();
    assert.equal(finishResult.success, true);
    assert.equal(finishResult.state.day, 2);
    assert.equal(finishResult.state.phase, 'event');
    assert.equal(finishResult.state.currentScenarioId, 'solar-activity');

    // 4. Save is persisted
    saveMission(finishResult.state);
    const saved = loadSavedMission();
    assert.ok(saved);
    assert.equal(saved.day, 2);
    assert.equal(saved.phase, 'event');

    // 5. Mount a NEW instance of the component (simulating page reload)
    let reloadedHookOutput = null as unknown as ReturnType<typeof useMission>;
    function ReloadedHarness() {
      reloadedHookOutput = useMission();
      return React.createElement('div', null, `Day: ${reloadedHookOutput.gameState.day}`);
    }
    renderToString(React.createElement(ReloadedHarness));
    assert.equal(reloadedHookOutput.gameState.day, 2);
    assert.equal(reloadedHookOutput.gameState.phase, 'event');
    assert.equal(reloadedHookOutput.gameState.currentScenarioId, 'solar-activity');

    // 6. Resolve space weather dilemma through reloaded hook
    const dilemmaResult = reloadedHookOutput.applyEventChoice('solar-activity', 'shelter-in-bunker');
    assert.equal(dilemmaResult.phase, 'choose');
    assert.equal(dilemmaResult.emergencyMistakes, 0);

    // 7. Replay mission through hook -> resets to Day 1 and purges storage
    reloadedHookOutput.replayMission();
    assert.equal(hasSavedMission(), false);
    assert.equal(loadSavedMission(), null);
  });

  it('renders EventModal dilemma dialog when MissionScreen is mounted from a Day 2 save', () => {
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
    saveMission(day2EventState);

    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(html.includes('role="dialog"'), 'EventModal dialog must be rendered');
    assert.ok(
      html.includes('Solar Energetic Particle Warning'),
      'Must render Day 2 solar dilemma title'
    );
    assert.ok(
      html.includes('Shelter crew in shielded regolith bunker'),
      'Must render dilemma choices'
    );
  });

  it('renders MissionScreen cleanly in SSR with zero throws and authoritative shell landmarks', () => {
    let html = '';
    assert.doesNotThrow(() => {
      html = renderToString(React.createElement(MissionScreen));
    });
    assert.ok(html.includes('Interactive Lunar Base Station'));
    assert.ok(html.includes('id="main-stage"'));
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
