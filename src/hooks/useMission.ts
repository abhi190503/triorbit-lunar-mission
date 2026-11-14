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

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
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
    window.removeEventListener('storage', callback);
  };
}

function getClientSnapshot(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function useMission({
  initialState,
  autoSave = true,
  onMissionComplete,
}: UseMissionOptions = {}) {
  // Authoritative simulation state initialized from prop or saved progress
  const [gameState, setGameState] = useState<GameState>(() => {
    if (initialState) return initialState;
    const saved = loadSavedMission();
    if (saved && saved.outcome === 'active') {
      return saved;
    }
    return createInitialMission();
  });

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

  // Auto-save whenever gameState changes and mission is active
  useEffect(() => {
    if (!autoSave) return;
    if (gameState.outcome === 'active') {
      saveMission(gameState);
    } else {
      // Mission reached terminal result (success or failure)
      clearSavedMission();
    }
  }, [gameState, autoSave]);

  // Notify parent on completion
  useEffect(() => {
    if (gameState.phase === 'result' && onMissionComplete) {
      onMissionComplete(gameState);
    }
  }, [gameState, onMissionComplete]);

  // Execute maintenance action via canonical controller
  const handleExecuteAction = useCallback((actionId: ActionId): ActionResult => {
    let result: ActionResult = {
      success: false,
      state: gameState,
      reason: 'Action execution failed',
    };

    setGameState((prev) => {
      const res = executeAction(prev, actionId);
      result = res;
      return res.success ? res.state : prev;
    });

    return result;
  }, [gameState]);

  // Apply dilemma choice via canonical controller
  const handleApplyEventChoice = useCallback(
    (scenarioId: string, choiceId: string): GameState => {
      let outcome = gameState;
      setGameState((prev) => {
        const next = applyEventChoice(prev, scenarioId, choiceId, DEFAULT_SCENARIOS);
        outcome = next;
        return next;
      });
      return outcome;
    },
    [gameState]
  );

  // Conclude mission day and apply nightly baseline drain
  const handleExecuteFinishDay = useCallback((): FinishDayResult => {
    let result: FinishDayResult = {
      success: false,
      state: gameState,
      reason: 'Finish day failed',
    };

    setGameState((prev) => {
      const res = executeFinishDay(prev);
      result = res;
      return res.success ? res.state : prev;
    });

    return result;
  }, [gameState]);

  // Replay mission: clear save and reset to fresh Day 1 baseline
  const handleReplayMission = useCallback((): GameState => {
    clearSavedMission();
    const fresh = createInitialMission();
    setGameState(fresh);
    return fresh;
  }, []);

  // Resume saved mission if present in storage
  const handleResumeSavedMission = useCallback((): boolean => {
    const saved = loadSavedMission();
    if (saved && saved.outcome === 'active') {
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
  };
}
