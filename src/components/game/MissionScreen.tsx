'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ActionId, GameScenario, GameState } from '@/lib/game/types';
import type { LunarModuleId } from './ModuleHotspot';
import {
  createInitialMission,
  executeAction,
  executeFinishDay,
  applyEventChoice,
  scoreMission,
  isEventPending,
} from '@/lib/game/controller';
import { DEFAULT_SCENARIOS } from '@/lib/game/constants';
import {
  GameShell,
  MissionHUD,
  LunarBaseScene,
  ActionControls,
  MissionTutorial,
} from '@/components/game';
import { EventModal } from '@/components/events/EventModal';
import { ScienceDrawer } from '@/components/learn/ScienceDrawer';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import type { NASAEventsResponse } from '@/lib/nasa/donki';

interface FeedbackMessage {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface MissionScreenProps {
  initialState?: GameState;
  onMissionComplete?: (finalState: GameState) => void;
  className?: string;
}

export function MissionScreen({
  initialState,
  onMissionComplete,
  className = '',
}: MissionScreenProps) {
  // 1. Authoritative single source of truth for simulation GameState
  const [gameState, setGameState] = useState<GameState>(() => initialState || createInitialMission());

  // 2. UI interaction state (does NOT duplicate simulation physics)
  const [selectedModuleId, setSelectedModuleId] = useState<LunarModuleId | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [nasaProvenance, setNasaProvenance] = useState<'live' | 'verified-fallback'>('verified-fallback');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>({
    text: 'Day 1 morning operations active. Select a lunar facility to inspect maintenance actions.',
    type: 'info',
  });

  // Event modal is open whenever gameState is in mandatory event phase
  const isEventModalOpen = gameState.phase === 'event' && Boolean(gameState.currentScenarioId);

  // Fetch NASA DONKI observations on mount to verify live route or fallback
  useEffect(() => {
    let active = true;
    fetch('/api/nasa/events')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: NASAEventsResponse) => {
        if (active && data?.provenance) {
          setNasaProvenance(data.provenance);
        }
      })
      .catch(() => {
        if (active) {
          setNasaProvenance('verified-fallback');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Notify parent on completion if callback provided
  useEffect(() => {
    if (gameState.phase === 'result' && onMissionComplete) {
      onMissionComplete(gameState);
    }
  }, [gameState, onMissionComplete]);

  // Current scheduled scenario for event modal
  const currentScenario: GameScenario | null = useMemo(() => {
    if (!gameState.currentScenarioId) return null;
    return DEFAULT_SCENARIOS.find((s) => s.id === gameState.currentScenarioId) || null;
  }, [gameState.currentScenarioId]);

  // 3. Command handler: Execute maintenance action via canonical controller
  const handleExecuteAction = useCallback((actionId: ActionId) => {
    setGameState((prevState) => {
      const result = executeAction(prevState, actionId);
      if (!result.success) {
        setFeedback({
          text: result.reason || 'Action could not be executed.',
          type: 'warning',
        });
        return prevState;
      }

      setFeedback({
        text: `Operation executed successfully. Remaining actions today: ${result.state.actionsRemaining}.`,
        type: 'success',
      });
      return result.state;
    });
  }, []);

  // 4. Command handler: Conclude current day and apply baseline drain via controller
  const handleFinishDay = useCallback(() => {
    setGameState((prevState) => {
      const result = executeFinishDay(prevState);
      if (!result.success) {
        setFeedback({
          text: result.reason || 'Cannot conclude the mission day right now.',
          type: 'warning',
        });
        return prevState;
      }

      const next = result.state;
      if (next.outcome === 'failure') {
        setFeedback({
          text: 'Life support failure detected during night cycle. Mission aborted.',
          type: 'error',
        });
      } else if (next.outcome === 'success') {
        setFeedback({
          text: 'Congratulations Commander! All 5 lunar days safely completed. Expedition won!',
          type: 'success',
        });
      } else if (next.phase === 'event') {
        setFeedback({
          text: `Advanced to Day ${next.day}. Space weather dilemma detected! Commander action required.`,
          type: 'warning',
        });
      } else {
        setFeedback({
          text: `Advanced to Day ${next.day}. Daily baseline life support drain applied. 2 actions available.`,
          type: 'info',
        });
      }

      return next;
    });
  }, []);

  // 5. Command handler: Resolve mandatory event choice via canonical engine
  const handleSelectEventChoice = useCallback((choiceId: string) => {
    setGameState((prevState) => {
      if (!prevState.currentScenarioId) return prevState;
      return applyEventChoice(
        prevState,
        prevState.currentScenarioId,
        choiceId,
        DEFAULT_SCENARIOS
      );
    });

    setFeedback({
      text: 'Space weather dilemma resolved. Daily maintenance operations unblocked.',
      type: 'success',
    });
  }, []);

  // 6. Clean mission restart
  const handleResetMission = useCallback(() => {
    setGameState(createInitialMission());
    setSelectedModuleId(null);
    setFeedback({
      text: 'Mission reset. Expedition Day 1 initialized.',
      type: 'info',
    });
  }, []);

  const isMissionConcluded = gameState.phase === 'result' || gameState.outcome !== 'active';
  const finalScore = useMemo(() => scoreMission(gameState), [gameState]);

  return (
    <GameShell
      className={className}
      headerProps={{
        day: gameState.day,
        maxDays: 5,
        actionsRemaining: gameState.actionsRemaining,
        maxActions: 2,
        onOpenHelp: () => setIsTutorialOpen(true),
        onOpenScience: () => setIsScienceOpen(true),
        onToggleSound: () => setIsMuted((prev) => !prev),
        isMuted,
      }}
      footerProps={{
        showAiDisclosure: true,
      }}
    >
      <div className="flex flex-col gap-5 w-full">
        {/* Terminal Debrief & Results View */}
        {isMissionConcluded ? (
          <ResultsScreen
            outcome={gameState.outcome}
            day={gameState.day}
            resources={gameState.resources}
            score={finalScore}
            history={gameState.history}
            onRestart={handleResetMission}
          />
        ) : (
          <>
            {/* Informational / Action Feedback Toast */}
            {feedback && (
              <div
                role="status"
                aria-live="polite"
                className={`
                  w-full px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-between gap-3 transition-all
                  ${
                    feedback.type === 'error'
                      ? 'bg-[#FF6B73]/15 text-[#FF888E] border-[#FF6B73]/40'
                      : feedback.type === 'warning'
                      ? 'bg-[#FFCA72]/15 text-[#FFCA72] border-[#FFCA72]/40'
                      : feedback.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-[#101D35]/90 text-[#60E5F4] border-[#1F3352]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">
                    {feedback.type === 'error'
                      ? '🚫'
                      : feedback.type === 'warning'
                      ? '⚠️'
                      : feedback.type === 'success'
                      ? '✅'
                      : 'ℹ️'}
                  </span>
                  <span>{feedback.text}</span>
                  {nasaProvenance === 'live' && (
                    <span className="ml-2 text-[10px] font-mono uppercase bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50">
                      Live Telemetry Connected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-xs opacity-70 hover:opacity-100 hover:text-white px-1.5 py-0.5 rounded transition"
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main 2-Column Responsive Gameplay Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (8 Cols on Desktop): Lunar Surface Scene + Action Controls */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* Interactive 2.5D Lunar Base Scene */}
                <section
                  aria-label="Interactive Lunar Base Station"
                  className="w-full rounded-xl overflow-hidden border border-[#1F3352] bg-[#101D35] shadow-lg"
                >
                  <LunarBaseScene
                    selectedModuleId={selectedModuleId}
                    onSelectModule={setSelectedModuleId}
                    actionsRemaining={gameState.actionsRemaining}
                    disabled={gameState.outcome !== 'active' || isEventPending(gameState)}
                  />
                </section>

                {/* Building Maintenance Action Controls */}
                <ActionControls
                  selectedModuleId={selectedModuleId}
                  state={gameState}
                  actionsRemaining={gameState.actionsRemaining}
                  onExecuteAction={handleExecuteAction}
                  onSelectModule={setSelectedModuleId}
                  disabled={gameState.outcome !== 'active' || isEventPending(gameState)}
                />
              </div>

              {/* Right Column (4 Cols on Desktop): Sticky Mission Telemetry HUD */}
              <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-4">
                <MissionHUD
                  day={gameState.day}
                  phase={gameState.phase}
                  actionsRemaining={gameState.actionsRemaining}
                  resources={gameState.resources}
                  outcome={gameState.outcome}
                  onFinishDay={handleFinishDay}
                />

                {/* Quick Helper Panel */}
                <div className="p-3.5 rounded-xl bg-[#101D35]/80 border border-[#1F3352] flex items-center justify-between gap-3 text-xs text-[#A8B8D0]">
                  <span>Day {gameState.day} of 5</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScienceOpen(true)}
                      className="px-2.5 py-1 rounded bg-[#162640] border border-[#1F3352] hover:border-[#60E5F4] hover:text-[#60E5F4] transition"
                    >
                      NASA Science
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTutorialOpen(true)}
                      className="px-2.5 py-1 rounded bg-[#162640] border border-[#1F3352] hover:border-[#60E5F4] hover:text-[#60E5F4] transition"
                    >
                      How to Play
                    </button>
                    <button
                      type="button"
                      onClick={handleResetMission}
                      className="px-2.5 py-1 rounded bg-[#162640] border border-[#1F3352] hover:border-[#FF6B73] hover:text-[#FF888E] transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mandatory Space Weather & Habitat Anomaly Dilemma Modal */}
      {currentScenario && (
        <EventModal
          open={isEventModalOpen}
          scenario={currentScenario}
          onSelectChoice={handleSelectEventChoice}
        />
      )}

      {/* NASA Science & Sources Learning Drawer */}
      <ScienceDrawer
        open={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />

      {/* How to Play 30-Second Mission Tutorial Modal */}
      <MissionTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </GameShell>
  );
}
