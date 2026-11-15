'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ActionId, GameScenario, GameState } from '@/lib/game/types';
import type { LunarModuleId } from './ModuleHotspot';
import { scoreMission, isEventPending } from '@/lib/game/controller';
import { DEFAULT_SCENARIOS } from '@/lib/game/constants';
import { soundscape } from '@/lib/audio/soundscape';
import { useMission } from '@/hooks/useMission';
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

export type NasaArchiveStatus = 'loading' | 'live' | 'verified-fallback' | 'unavailable';

export function MissionScreen({
  initialState,
  onMissionComplete,
  className = '',
}: MissionScreenProps) {
  // 1. Authoritative single source of truth for simulation GameState via useMission hook
  const {
    gameState,
    executeAction: runAction,
    finishDay: runFinishDay,
    applyEventChoice: runEventChoice,
    replayMission: resetMissionState,
  } = useMission({
    initialState,
    onMissionComplete,
  });

  // 2. UI interaction state (does NOT duplicate simulation physics)
  const [selectedModuleId, setSelectedModuleId] = useState<LunarModuleId | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [nasaStatus, setNasaStatus] = useState<NasaArchiveStatus>('loading');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(() => ({
    text: 'Day 1 morning operations active. Select a lunar facility to inspect maintenance actions.',
    type: 'info',
  }));

  // Cleanly dispose audio nodes on unmount
  useEffect(() => {
    return () => {
      soundscape.cleanup();
    };
  }, []);

  // Restore sound preference from localStorage post-mount for Next.js hydration consistency
  useEffect(() => {
    const restoredMuted = soundscape.restorePreference();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMuted(restoredMuted);
  }, []);

  // Update feedback when saved progress is restored on client post-hydration
  const hasAnnouncedRestoreRef = useRef(false);
  useEffect(() => {
    if (gameState.day > 1 && !hasAnnouncedRestoreRef.current) {
      hasAnnouncedRestoreRef.current = true;
      setFeedback({
        text: `Saved mission restored: Day ${gameState.day} morning operations active.`,
        type: 'info',
      });
    }
  }, [gameState.day]);

  // Event modal is open whenever gameState is in mandatory event phase
  const isEventModalOpen = gameState.phase === 'event' && Boolean(gameState.currentScenarioId);

  // Play restrained warning cue when emergency dilemma triggers
  useEffect(() => {
    if (isEventModalOpen) {
      soundscape.playEmergencyWarning();
    }
  }, [isEventModalOpen]);

  // Fetch NASA DONKI observations on mount to verify live route or fallback
  useEffect(() => {
    let active = true;
    fetch('/api/nasa/events')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: NASAEventsResponse) => {
        if (!active) return;
        if (data?.provenance === 'live') {
          setNasaStatus('live');
        } else if (data?.provenance === 'verified-fallback') {
          setNasaStatus('verified-fallback');
        } else {
          setNasaStatus('unavailable');
        }
      })
      .catch(() => {
        if (active) {
          setNasaStatus('unavailable');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Current scheduled scenario for event modal
  const currentScenario: GameScenario | null = useMemo(() => {
    if (!gameState.currentScenarioId) return null;
    return DEFAULT_SCENARIOS.find((s) => s.id === gameState.currentScenarioId) || null;
  }, [gameState.currentScenarioId]);

  // Module selection with gentle acoustic feedback
  const handleSelectModule = useCallback((moduleId: LunarModuleId | null) => {
    setSelectedModuleId(moduleId);
    if (moduleId) {
      soundscape.playFacilitySelect();
    }
  }, []);

  // 3. Command handler: Execute maintenance action via canonical useMission hook
  const handleExecuteAction = useCallback(
    (actionId: ActionId) => {
      const result = runAction(actionId);
      if (!result.success) {
        setFeedback({
          text: result.reason || 'Action could not be executed.',
          type: 'warning',
        });
        return;
      }

      soundscape.playMaintenanceSuccess();

      setFeedback({
        text: `Operation executed successfully. Remaining actions today: ${result.state.actionsRemaining}.`,
        type: 'success',
      });
    },
    [runAction]
  );

  // 4. Command handler: Conclude current day and apply baseline drain via useMission hook
  const handleFinishDay = useCallback(() => {
    const result = runFinishDay();
    if (!result.success) {
      setFeedback({
        text: result.reason || 'Cannot conclude the mission day right now.',
        type: 'warning',
      });
      return;
    }

    const next = result.state;
    if (next.outcome === 'failure') {
      soundscape.playFailure();
      setFeedback({
        text: 'Life support failure detected during night cycle. Mission aborted.',
        type: 'error',
      });
    } else if (next.outcome === 'success') {
      soundscape.playVictory();
      setFeedback({
        text: 'Congratulations Commander! All 5 lunar days safely completed. Expedition won!',
        type: 'success',
      });
    } else if (next.phase === 'event') {
      soundscape.playEmergencyWarning();
      const isSolar = next.currentScenarioId === 'solar-activity';
      const isElectrical = next.currentScenarioId === 'power-outage';
      const isIrrigation = next.currentScenarioId === 'greenhouse-water';
      const eventLabel = isSolar
        ? 'Space weather dilemma detected!'
        : isElectrical
        ? 'Habitat electrical emergency detected!'
        : isIrrigation
        ? 'Hydroponics irrigation emergency detected!'
        : 'Mission emergency detected!';

      setFeedback({
        text: `Advanced to Day ${next.day}. ${eventLabel} Commander action required.`,
        type: 'warning',
      });
    } else {
      setFeedback({
        text: `Advanced to Day ${next.day}. Daily baseline life support drain applied. 2 actions available.`,
        type: 'info',
      });
    }
  }, [runFinishDay]);

  // 5. Command handler: Resolve mandatory event choice via useMission hook
  const handleSelectEventChoice = useCallback(
    (choiceId: string) => {
      if (!gameState.currentScenarioId) return;
      const scenarioId = gameState.currentScenarioId;
      runEventChoice(scenarioId, choiceId);

      let message = 'Mission emergency resolved. Daily maintenance operations available.';
      if (scenarioId === 'solar-activity') {
        message = 'Space weather dilemma resolved. Daily maintenance operations unblocked.';
      } else if (scenarioId === 'power-outage') {
        message = 'Electrical emergency resolved. Daily maintenance operations available.';
      } else if (scenarioId === 'greenhouse-water') {
        message = 'Hydroponics irrigation emergency resolved. Daily maintenance operations available.';
      }

      setFeedback({
        text: message,
        type: 'success',
      });
    },
    [gameState.currentScenarioId, runEventChoice]
  );

  // 6. Clean mission restart & replay
  const handleResetMission = useCallback(() => {
    resetMissionState();
    setSelectedModuleId(null);
    setFeedback({
      text: 'Mission reset. Expedition Day 1 initialized.',
      type: 'info',
    });
  }, [resetMissionState]);

  // Sound toggle handler
  const handleToggleSound = useCallback(() => {
    const nextMuted = soundscape.toggleSound();
    setIsMuted(nextMuted);
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
        onToggleSound: handleToggleSound,
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
                  w-full px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-between gap-3 transition-all duration-200 motion-reduce:transition-none
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
                  {nasaStatus === 'loading' && (
                    <span className="ml-2 text-[10px] font-mono uppercase bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                      NASA Archive Loading...
                    </span>
                  )}
                  {nasaStatus === 'live' && (
                    <span className="ml-2 text-[10px] font-mono uppercase bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50 whitespace-nowrap">
                      NASA Historical Data Loaded
                    </span>
                  )}
                  {nasaStatus === 'verified-fallback' && (
                    <span className="ml-2 text-[10px] font-mono uppercase bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                      NASA Verified Fallback Loaded
                    </span>
                  )}
                  {nasaStatus === 'unavailable' && (
                    <span className="ml-2 text-[10px] font-mono uppercase bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded border border-rose-800/50 whitespace-nowrap">
                      NASA Archive Unavailable
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
                    onSelectModule={handleSelectModule}
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
                  onSelectModule={handleSelectModule}
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
