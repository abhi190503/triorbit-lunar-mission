import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialMission } from './engine';
import {
  saveMission,
  loadSavedMission,
  clearSavedMission,
  hasSavedMission,
  getSavedMissionSummary,
  isValidGameState,
  isValidSavedPayload,
  STORAGE_KEY,
  SCHEMA_VERSION,
} from './persistence';

// Mock in-memory localStorage for Node test environment
class MemoryStorage {
  private store: Map<string, string> = new Map();

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

describe('TRI-024: Local Saved Progress & State Persistence', () => {
  beforeEach(() => {
    // Setup window.localStorage mock
    const mockStorage = new MemoryStorage();
    (globalThis as unknown as { window?: { localStorage: MemoryStorage } }).window = {
      localStorage: mockStorage,
    };
  });

  it('correctly validates a pristine canonical GameState', () => {
    const state = createInitialMission();
    assert.equal(isValidGameState(state), true);
  });

  it('rejects GameState with missing, non-numeric, or out-of-bound resources', () => {
    const state = createInitialMission();
    assert.equal(isValidGameState({ ...state, resources: null }), false);
    assert.equal(
      isValidGameState({
        ...state,
        resources: { ...state.resources, oxygen: -5 },
      }),
      false
    );
    assert.equal(
      isValidGameState({
        ...state,
        resources: { ...state.resources, power: 150 },
      }),
      false
    );
    assert.equal(
      isValidGameState({
        ...state,
        resources: { ...state.resources, water: NaN },
      }),
      false
    );
  });

  it('rejects GameState with invalid day, actionsRemaining, or phase', () => {
    const state = createInitialMission();
    assert.equal(isValidGameState({ ...state, day: 0 }), false);
    assert.equal(isValidGameState({ ...state, day: 6 }), false);
    assert.equal(isValidGameState({ ...state, actionsRemaining: 3 }), false);
    assert.equal(isValidGameState({ ...state, actionsRemaining: -1 }), false);
    assert.equal(isValidGameState({ ...state, phase: 'invalid-phase' }), false);
    assert.equal(isValidGameState({ ...state, outcome: 'invalid-outcome' }), false);
  });

  it('saves and restores an active GameState accurately', () => {
    const state = createInitialMission();
    state.day = 2;
    state.phase = 'choose';
    state.actionsRemaining = 1;
    state.resources.power = 85;

    const saved = saveMission(state);
    assert.equal(saved, true);

    const loaded = loadSavedMission();
    assert.ok(loaded);
    assert.equal(loaded.day, 2);
    assert.equal(loaded.phase, 'choose');
    assert.equal(loaded.actionsRemaining, 1);
    assert.equal(loaded.resources.power, 85);
    assert.equal(hasSavedMission(), true);
  });

  it('returns valid metadata via getSavedMissionSummary', () => {
    const state = createInitialMission();
    state.day = 3;
    state.phase = 'event';
    saveMission(state);

    const summary = getSavedMissionSummary();
    assert.ok(summary);
    assert.equal(summary.day, 3);
    assert.equal(summary.phase, 'event');
    assert.equal(summary.outcome, 'active');
    assert.ok(summary.savedAt);
  });

  it('safely handles and clears corrupted or non-JSON localStorage entries', () => {
    window.localStorage.setItem(STORAGE_KEY, '{invalid-json: malformed');
    const loaded = loadSavedMission();
    assert.equal(loaded, null);
    // Should have cleared the malformed entry
    assert.equal(window.localStorage.getItem(STORAGE_KEY), null);
    assert.equal(hasSavedMission(), false);
  });

  it('rejects and clears schema version mismatch', () => {
    const payload = {
      version: 999, // Incompatible future schema
      savedAt: new Date().toISOString(),
      state: createInitialMission(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    const loaded = loadSavedMission();
    assert.equal(loaded, null);
    assert.equal(window.localStorage.getItem(STORAGE_KEY), null);
  });

  it('rejects payload with missing keys or invalid structure', () => {
    assert.equal(isValidSavedPayload({ version: SCHEMA_VERSION }), false);
    assert.equal(isValidSavedPayload(null), false);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION }));
    assert.equal(loadSavedMission(), null);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, savedAt: '', state: {} })
    );
    assert.equal(loadSavedMission(), null);
  });

  it('clears saved mission on clearSavedMission', () => {
    saveMission(createInitialMission());
    assert.equal(hasSavedMission(), true);

    clearSavedMission();
    assert.equal(hasSavedMission(), false);
    assert.equal(loadSavedMission(), null);
    assert.equal(getSavedMissionSummary(), null);
  });

  it('functions safely without throwing when window or localStorage is undefined (SSR)', () => {
    // Simulate SSR environment
    delete (globalThis as { window?: unknown }).window;

    assert.equal(saveMission(createInitialMission()), false);
    assert.equal(loadSavedMission(), null);
    assert.equal(hasSavedMission(), false);
    assert.equal(getSavedMissionSummary(), null);
    assert.doesNotThrow(() => clearSavedMission());
  });
});
