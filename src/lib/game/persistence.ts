/**
 * TriOrbit — Lunar Survival Simulator
 * Local Storage Persistence & State Recovery
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-024 (Optional Local Saved Progress)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 *
 * Rules:
 * - Browser-only localStorage with SSR guard (typeof window === 'undefined')
 * - Versioned schema with strict GameState invariant validation
 * - Safe recovery: malformed/incompatible saves safely clear and fallback to null
 * - Zero personal information / telemetry collection
 * - Deterministic, non-mutating
 */

import type { GameState, ResourceKey } from './types';
import {
  RESOURCE_MAX,
  RESOURCE_MIN,
  TOTAL_MISSION_DAYS,
} from './contracts';

export const STORAGE_KEY = 'triorbit_mission_save_v1';
export const SCHEMA_VERSION = 1;

export interface SavedMissionPayload {
  version: number;
  savedAt: string;
  state: GameState;
}

export interface SavedMissionSummary {
  day: number;
  phase: GameState['phase'];
  outcome: GameState['outcome'];
  savedAt: string;
}

const VALID_PHASES = new Set<GameState['phase']>(['briefing', 'choose', 'event', 'result']);
const VALID_OUTCOMES = new Set<GameState['outcome']>(['active', 'success', 'failure']);
const RESOURCE_KEYS: ResourceKey[] = ['oxygen', 'power', 'water', 'food', 'radiationRisk'];

/**
 * Validates that an untrusted object strictly conforms to canonical GameState invariants.
 */
export function isValidGameState(obj: unknown): obj is GameState {
  if (!obj || typeof obj !== 'object') return false;

  const candidate = obj as Record<string, unknown>;

  // 1. Day boundary [1, TOTAL_MISSION_DAYS]
  if (
    typeof candidate.day !== 'number' ||
    !Number.isInteger(candidate.day) ||
    candidate.day < 1 ||
    candidate.day > TOTAL_MISSION_DAYS
  ) {
    return false;
  }

  // 2. Valid Phase
  if (
    typeof candidate.phase !== 'string' ||
    !VALID_PHASES.has(candidate.phase as GameState['phase'])
  ) {
    return false;
  }

  // 3. Actions Remaining [0, 2]
  if (
    typeof candidate.actionsRemaining !== 'number' ||
    !Number.isInteger(candidate.actionsRemaining) ||
    candidate.actionsRemaining < 0 ||
    candidate.actionsRemaining > 2
  ) {
    return false;
  }

  // 4. Resources validation [RESOURCE_MIN, RESOURCE_MAX]
  if (!candidate.resources || typeof candidate.resources !== 'object') {
    return false;
  }
  const res = candidate.resources as Record<string, unknown>;
  for (const key of RESOURCE_KEYS) {
    const val = res[key];
    if (
      typeof val !== 'number' ||
      !Number.isFinite(val) ||
      val < RESOURCE_MIN ||
      val > RESOURCE_MAX
    ) {
      return false;
    }
  }

  // 5. Emergency Mistakes non-negative integer
  if (
    typeof candidate.emergencyMistakes !== 'number' ||
    !Number.isInteger(candidate.emergencyMistakes) ||
    candidate.emergencyMistakes < 0
  ) {
    return false;
  }

  // 6. Outcome validation
  if (
    typeof candidate.outcome !== 'string' ||
    !VALID_OUTCOMES.has(candidate.outcome as GameState['outcome'])
  ) {
    return false;
  }

  // 7. If terminal failure, verify failure condition consistency
  if (candidate.outcome === 'failure' && candidate.phase !== 'result') {
    return false;
  }

  // 8. History must be an array
  if (!Array.isArray(candidate.history)) {
    return false;
  }

  return true;
}

/**
 * Validates that an untrusted storage payload matches the versioned persistence schema.
 */
export function isValidSavedPayload(obj: unknown): obj is SavedMissionPayload {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;

  if (candidate.version !== SCHEMA_VERSION) {
    return false;
  }

  if (typeof candidate.savedAt !== 'string' || !candidate.savedAt) {
    return false;
  }

  return isValidGameState(candidate.state);
}

type StorageListener = () => void;
const storageListeners = new Set<StorageListener>();

export function subscribeToSaveStorage(listener: StorageListener): () => void {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}

function notifyStorageChange(): void {
  storageListeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore listener errors
    }
  });
}

/**
 * Safely persists active GameState to browser localStorage.
 * Returns true if successfully saved, false otherwise.
 */
export function saveMission(state: GameState): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    if (!isValidGameState(state)) {
      return false;
    }

    const payload: SavedMissionPayload = {
      version: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notifyStorageChange();
    return true;
  } catch {
    // QuotaExceededError or private browsing storage restriction
    return false;
  }
}

/**
 * Loads and restores a previously saved GameState from browser localStorage.
 * Automatically clears corrupted or schema-incompatible payloads and returns null.
 */
export function loadSavedMission(): GameState | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSavedPayload(parsed)) {
      // Corrupt or outdated schema: reset safely
      clearSavedMission();
      return null;
    }

    return parsed.state;
  } catch {
    // JSON parse error or security exception
    clearSavedMission();
    return null;
  }
}

/**
 * Safely removes any saved mission progress from browser localStorage.
 */
export function clearSavedMission(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notifyStorageChange();
  } catch {
    // Ignore storage clear failure
  }
}

/**
 * Checks if a valid, uncompleted (active) saved mission exists in storage.
 */
export function hasSavedMission(): boolean {
  const state = loadSavedMission();
  return Boolean(state && state.outcome === 'active');
}

/**
 * Retrieves high-level metadata about the saved mission without loading full state.
 */
export function getSavedMissionSummary(): SavedMissionSummary | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSavedPayload(parsed)) {
      return null;
    }

    return {
      day: parsed.state.day,
      phase: parsed.state.phase,
      outcome: parsed.state.outcome,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}
