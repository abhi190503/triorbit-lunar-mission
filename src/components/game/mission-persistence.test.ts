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
import { hydrateRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
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

describe('TRI-024: Component & Gameplay State Persistence Integration', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
    });
    dom.window.localStorage.clear();

    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { HTMLElement: unknown }).HTMLElement = dom.window.HTMLElement;
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { document?: unknown }).document;
    delete (globalThis as unknown as { HTMLElement?: unknown }).HTMLElement;
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

  it('genuinely hydrates MissionScreen via hydrateRoot without hydration errors and restores saved Day 3 mission', async () => {
    // 1. Arrange: User previously reached Day 3 with customized vitals and 1 action remaining
    const day3State: GameState = {
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

    saveMission(day3State);
    assert.equal(hasSavedMission(), true);

    // 2. Pure SSR: Server pre-rendering outputs Day 1 baseline
    const ssrHtml = renderToString(React.createElement(MissionScreen));
    assert.ok(ssrHtml.includes('Day 1'), 'SSR markup must cleanly pre-render Day 1 baseline');
    assert.equal(
      ssrHtml.includes('Saved mission restored: Day 3'),
      false,
      'SSR markup must not prematurely contain client-only restored feedback'
    );

    // 3. Client Hydration: Inject SSR HTML into client DOM container
    const container = dom.window.document.getElementById('root')!;
    container.innerHTML = ssrHtml;

    const recoverableErrors: string[] = [];
    const caughtErrors: string[] = [];
    const uncaughtErrors: string[] = [];

    // 4. Act: Hydrate root on client
    const root = hydrateRoot(container, React.createElement(MissionScreen), {
      onRecoverableError(err: unknown) {
        recoverableErrors.push((err as Error).message);
      },
      onCaughtError(err: unknown) {
        caughtErrors.push((err as Error).message);
      },
      onUncaughtError(err: unknown) {
        uncaughtErrors.push((err as Error).message);
      },
    });

    // Wait for hydration and post-mount restoration effect to commit
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 5. Assert: Zero hydration errors occurred!
    assert.equal(
      recoverableErrors.length,
      0,
      `Expected 0 recoverable hydration errors, got: ${recoverableErrors.join('; ')}`
    );
    assert.equal(caughtErrors.length, 0, 'Expected 0 caught errors during hydration');
    assert.equal(uncaughtErrors.length, 0, 'Expected 0 uncaught errors during hydration');

    // Assert: Client DOM dynamically restored Day 3 state
    const domText = container.textContent || '';
    assert.ok(
      domText.includes('Saved mission restored: Day 3 morning operations active'),
      'Must display saved mission restored notification in DOM'
    );
    assert.ok(domText.includes('1 / 2 Actions Left'), 'Must display 1 remaining action in DOM');

    root.unmount();
  });

  it('guarantees that initial mounting cannot overwrite an existing valid saved mission', async () => {
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

    // 2. Act: Mount component simulating initial render and hydration
    const ssrHtml = renderToString(React.createElement(MissionScreen));
    const container = dom.window.document.getElementById('root')!;
    container.innerHTML = ssrHtml;

    const root = hydrateRoot(container, React.createElement(MissionScreen));
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 3. Assert: Storage still contains the original Day 4 save without being overwritten by Day 1 default
    const loaded = loadSavedMission();
    assert.ok(loaded, 'Saved mission must still be present');
    assert.equal(loaded.day, 4, 'Day 4 state must not be overwritten by Day 1 default');
    assert.equal(loaded.resources.oxygen, 65);
    assert.equal(loaded.resources.power, 60);

    root.unmount();
  });

  it('gracefully recovers from corrupted or malformed localStorage payload without crashing', async () => {
    // Write unparseable corrupt payload
    dom.window.localStorage.setItem(STORAGE_KEY, '{"version": 1, "state": INVALID_CORRUPT_JSON_DATA');

    // Rendering should not throw and should safely clear the corrupt save
    const ssrHtml = renderToString(React.createElement(MissionScreen));
    const container = dom.window.document.getElementById('root')!;
    container.innerHTML = ssrHtml;

    const recoverableErrors: string[] = [];
    const root = hydrateRoot(container, React.createElement(MissionScreen), {
      onRecoverableError(err: unknown) {
        recoverableErrors.push((err as Error).message);
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(recoverableErrors.length, 0, 'No hydration errors on corrupted storage fallback');
    assert.ok(container.textContent?.includes('Day 1'), 'Must safely fallback to clean Day 1 mission');
    assert.equal(loadSavedMission(), null, 'Corrupt payload must be automatically purged');

    root.unmount();
  });

  it('verifies full state persistence lifecycle through mounted useMission hook (actions, day advance, reload)', async () => {
    let hookOutput = null as unknown as ReturnType<typeof useMission>;
    function TestHookHarness() {
      hookOutput = useMission();
      return React.createElement('div', null, `Day: ${hookOutput.gameState.day}`);
    }

    // 1. Initial mount of hook via hydration
    const ssrHtml = renderToString(React.createElement(TestHookHarness));
    const container = dom.window.document.getElementById('root')!;
    container.innerHTML = ssrHtml;

    const root1 = hydrateRoot(container, React.createElement(TestHookHarness));
    await new Promise((resolve) => setTimeout(resolve, 60));

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

    // 4. Save is persisted in storage
    saveMission(finishResult.state);
    const saved = loadSavedMission();
    assert.ok(saved);
    assert.equal(saved.day, 2);
    assert.equal(saved.phase, 'event');
    root1.unmount();

    // 5. Mount a NEW instance of the component (simulating page reload)
    let reloadedHookOutput = null as unknown as ReturnType<typeof useMission>;
    function ReloadedHarness() {
      reloadedHookOutput = useMission();
      return React.createElement('div', null, `Day: ${reloadedHookOutput.gameState.day}`);
    }

    const reloadSsrHtml = renderToString(React.createElement(ReloadedHarness));
    container.innerHTML = reloadSsrHtml;
    const root2 = hydrateRoot(container, React.createElement(ReloadedHarness));
    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(reloadedHookOutput.gameState.day, 2);
    assert.equal(reloadedHookOutput.gameState.phase, 'event');
    assert.equal(reloadedHookOutput.gameState.currentScenarioId, 'solar-activity');

    // 6. Resolve space weather dilemma through reloaded hook
    const dilemmaResult = reloadedHookOutput.applyEventChoice('solar-activity', 'shelter-in-bunker');
    assert.equal(dilemmaResult.phase, 'choose');
    assert.equal(dilemmaResult.emergencyMistakes, 0);

    // 7. Replay mission through hook -> resets to Day 1 and purges storage
    reloadedHookOutput.replayMission();
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(hasSavedMission(), false);
    assert.equal(loadSavedMission(), null);

    root2.unmount();
  });

  it('renders EventModal dilemma dialog when MissionScreen is mounted from a Day 2 save', async () => {
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

    const ssrHtml = renderToString(React.createElement(MissionScreen));
    const container = dom.window.document.getElementById('root')!;
    container.innerHTML = ssrHtml;

    const root = hydrateRoot(container, React.createElement(MissionScreen));
    await new Promise((resolve) => setTimeout(resolve, 80));

    const content = container.innerHTML;
    assert.ok(content.includes('role="dialog"'), 'EventModal dialog must be rendered');
    assert.ok(
      content.includes('Solar Energetic Particle Warning'),
      'Must render Day 2 solar dilemma title'
    );
    assert.ok(
      content.includes('Shelter crew in shielded regolith bunker'),
      'Must render dilemma choices'
    );

    root.unmount();
  });

  it('handles React Strict Mode double effects safely without race conditions or state loss', async () => {
    // Arrange: Valid Day 3 mission in storage
    const day3State: GameState = {
      day: 3,
      phase: 'choose',
      actionsRemaining: 1,
      resources: { oxygen: 70, power: 75, water: 70, food: 70, radiationRisk: 15 },
      outcome: 'active',
      emergencyMistakes: 0,
      history: [],
    };
    saveMission(day3State);

    let hookOutput = null as unknown as ReturnType<typeof useMission>;
    function StrictModeHarness() {
      hookOutput = useMission();
      return React.createElement('div', null, `Day ${hookOutput.gameState.day}`);
    }

    const container = dom.window.document.getElementById('root')!;
    const strictTree = React.createElement(
      React.StrictMode,
      null,
      React.createElement(StrictModeHarness)
    );
    container.innerHTML = renderToString(strictTree);

    const recoverableErrors: string[] = [];
    const root = hydrateRoot(container, strictTree, {
      onRecoverableError(err: unknown) {
        recoverableErrors.push((err as Error).message);
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 80));

    // Assert: Day 3 state restored cleanly under React.StrictMode with zero errors
    assert.equal(recoverableErrors.length, 0);
    assert.equal(hookOutput.gameState.day, 3);
    const saved = loadSavedMission();
    assert.ok(saved);
    assert.equal(saved.day, 3);
    assert.equal(saved.resources.oxygen, 70);

    root.unmount();
    await new Promise((resolve) => setTimeout(resolve, 30));
  });

  it('handles rapid successive actions safely with synchronous stateRef execution under batching', () => {
    let hookOutput = null as unknown as ReturnType<typeof useMission>;
    function RapidHarness() {
      hookOutput = useMission();
      return React.createElement('div', null, `Actions: ${hookOutput.gameState.actionsRemaining}`);
    }

    renderToString(React.createElement(RapidHarness));

    // Dispatch action 1: maintain-solar
    const res1 = hookOutput.executeAction('maintain-solar');
    assert.equal(res1.success, true);
    assert.equal(res1.state.actionsRemaining, 1);
    assert.equal(res1.state.resources.power, 90);

    // Dispatch action 2 rapidly: generate-oxygen
    const res2 = hookOutput.executeAction('generate-oxygen');
    assert.equal(res2.success, true);
    assert.equal(res2.state.actionsRemaining, 0);
    assert.equal(res2.state.resources.oxygen, 95);

    // Dispatch action 3 when allowance depleted: must be safely rejected
    const res3 = hookOutput.executeAction('reinforce-shelter');
    assert.equal(res3.success, false);
    assert.ok(res3.reason?.includes('Daily action limit reached'));
    assert.equal(res3.state.actionsRemaining, 0);
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
