'use client';

/**
 * TriOrbit — Lunar Survival Simulator
 * React Hook for Mission State Management & Persistence
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-024 (Optional Local Saved Progress)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import type { ActionId, GameState } from '@/lib/game/types';
import {
  createInitialMission,
  executeAction,
  executeFinishDay,
  applyEventChoice,
  scoreMission,
  isEventPending,
  type ActionResult,
  type FinishDayResult,
} from '@/lib/game/controller';
import {
  saveMission,
  loadSavedMission,
  clearSavedMission,
  isValidSavedPayload,
  subscribeToSaveStorage,
  STORAGE_KEY,
  type SavedMissionSummary,
} from '@/lib/game/persistence';
import { DEFAULT_SCENARIOS } from '@/lib/game/constants';

export interface UseMissionOptions {
  initialState?: GameState;
  autoSave?: boolean;
  onMissionComplete?: (finalState: GameState) => void;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const unsubscribeInternal = subscribeToSaveStorage(callback);
  window.addEventListener('storage', callback);
  return () => {
    unsubscribeInternal();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
}

function getClientSnapshot(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * Checks whether a mission state represents an untouched pristine Day 1 mission.
 * Pristine missions should not trigger auto-save until the player performs an action.
 */
function isPristineMission(state: GameState): boolean {
  return (
    state.day === 1 &&
    state.actionsRemaining === 2 &&
    state.history.length === 0 &&
    state.outcome === 'active'
  );
}

export function useMission({
  initialState,
  autoSave = true,
  onMissionComplete,
}: UseMissionOptions = {}) {
  // Authoritative simulation state:
  // SSR & initial client render ALWAYS use initialState ?? createInitialMission().
  // This guarantees that server-rendered HTML and client initial render produce 100% matching output.
  const [gameState, setGameState] = useState<GameState>(() => initialState ?? createInitialMission());
  const [isRestored, setIsRestored] = useState(false);

  // Keep a mutable ref to the freshest state to guarantee synchronous execution
  // and prevent stale closures across batched updates without accessing refs during render
  const stateRef = useRef<GameState>(gameState);

  // Synchronize state ref outside render body
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Adjust state if initialState prop changes externally
  const [prevInitialState, setPrevInitialState] = useState(initialState);
  if (initialState !== prevInitialState) {
    setPrevInitialState(initialState);
    if (initialState) {
      setGameState(initialState);
    }
  }

  // Restore saved mission on client after hydration boundary has committed
  // Guarantees:
  // 1. Zero SSR hydration mismatches
  // 2. Initial mount can NEVER overwrite existing saved progress
  // 3. React Strict Mode double-invocations remain idempotent and safe
  useEffect(() => {
    if (!initialState) {
      const saved = loadSavedMission();
      if (saved && saved.outcome === 'active') {
        stateRef.current = saved;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameState(saved);
      }
    }
    setIsRestored(true);
  }, [initialState]);

  // Sync external storage state for cross-tab or external changes
  const rawSaveString = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const savedSummary: SavedMissionSummary | null = useMemo(() => {
    if (!rawSaveString) return null;
    try {
      const parsed: unknown = JSON.parse(rawSaveString);
      if (!isValidSavedPayload(parsed)) return null;
      return {
        day: parsed.state.day,
        phase: parsed.state.phase,
        outcome: parsed.state.outcome,
        savedAt: parsed.savedAt,
      };
    } catch {
      return null;
    }
  }, [rawSaveString]);

  // Auto-save whenever gameState changes and mission is active:
  // - Skips saving until after client hydration and restore check have committed (isRestored === true).
  // - Never auto-saves an untouched pristine Day 1 mission, avoiding overwriting saves on mount or repopulating storage on replay.
  // - Clears storage when the mission finishes (outcome !== 'active').
  useEffect(() => {
    if (!isRestored) return;
    if (!autoSave) return;

    if (gameState.outcome === 'active') {
      if (!isPristineMission(gameState)) {
        saveMission(gameState);
      }
    } else {
      // Mission reached terminal result (success or failure)
      clearSavedMission();
    }
  }, [gameState, autoSave, isRestored]);

  // Notify parent on completion
  useEffect(() => {
    if (gameState.phase === 'result' && onMissionComplete) {
      onMissionComplete(gameState);
    }
  }, [gameState, onMissionComplete]);

  // Execute maintenance action via canonical controller
  // Guarantees synchronous return values, batched update safety, and no stale closures
  const handleExecuteAction = useCallback((actionId: ActionId): ActionResult => {
    const current = stateRef.current;
    const result = executeAction(current, actionId);
    if (result.success) {
      stateRef.current = result.state;
      setGameState(result.state);
    }
    return result;
  }, []);

  // Apply dilemma choice via canonical controller
  const handleApplyEventChoice = useCallback(
    (scenarioId: string, choiceId: string): GameState => {
      const current = stateRef.current;
      const next = applyEventChoice(current, scenarioId, choiceId, DEFAULT_SCENARIOS);
      stateRef.current = next;
      setGameState(next);
      return next;
    },
    []
  );

  // Conclude mission day and apply nightly baseline drain
  const handleExecuteFinishDay = useCallback((): FinishDayResult => {
    const current = stateRef.current;
    const result = executeFinishDay(current);
    if (result.success) {
      stateRef.current = result.state;
      setGameState(result.state);
    }
    return result;
  }, []);

  // Replay mission: clear save and reset to fresh Day 1 baseline
  const handleReplayMission = useCallback((): GameState => {
    clearSavedMission();
    const fresh = createInitialMission();
    stateRef.current = fresh;
    setGameState(fresh);
    return fresh;
  }, []);

  // Resume saved mission if present in storage
  const handleResumeSavedMission = useCallback((): boolean => {
    const saved = loadSavedMission();
    if (saved && saved.outcome === 'active') {
      stateRef.current = saved;
      setGameState(saved);
      return true;
    }
    return false;
  }, []);

  return {
    gameState,
    setGameState,
    hasSavedProgress: Boolean(savedSummary && savedSummary.outcome === 'active'),
    savedSummary,
    executeAction: handleExecuteAction,
    applyEventChoice: handleApplyEventChoice,
    finishDay: handleExecuteFinishDay,
    replayMission: handleReplayMission,
    resumeSavedMission: handleResumeSavedMission,
    clearSave: clearSavedMission,
    score: scoreMission(gameState),
    isEventPending: isEventPending(gameState),
    isRestored,
  };
}
