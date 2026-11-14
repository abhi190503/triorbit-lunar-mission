'use client';

import React, { useState, useCallback } from 'react';
import type { ActionId, GameState } from '@/lib/game/types';
import type { LunarModuleId } from '@/components/game/ModuleHotspot';
import {
  createInitialMission,
  executeAction,
  executeFinishDay,
  isMissionFailed,
  isMissionVictorious,
  getFailureReason,
} from '@/lib/game/controller';
import {
  GameShell,
  MissionHUD,
  LunarBaseScene,
  ActionControls,
  MissionTutorial,
  GameButton,
} from '@/components/game';

interface FeedbackMessage {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function PlayPage() {
  // 1. Authoritative single source of truth for simulation GameState
  const [gameState, setGameState] = useState<GameState>(() => createInitialMission());

  // 2. Local UI selection state (does NOT duplicate simulation physics)
  const [selectedModuleId, setSelectedModuleId] = useState<LunarModuleId | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>({
    text: 'Day 1 morning operations active. Select a lunar facility to inspect maintenance actions.',
    type: 'info',
  });

  // Derived state queries
  const failed = isMissionFailed(gameState);
  const victorious = isMissionVictorious(gameState);
  const failureReason = failed ? getFailureReason(gameState) : null;

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
      } else {
        setFeedback({
          text: `Advanced to Day ${next.day}. Daily baseline life support drain applied. 2 actions available.`,
          type: 'info',
        });
      }

      return next;
    });
  }, []);

  // 5. Clean mission restart
  const handleResetMission = useCallback(() => {
    setGameState(createInitialMission());
    setSelectedModuleId(null);
    setFeedback({
      text: 'Mission reset. Expedition Day 1 initialized.',
      type: 'info',
    });
  }, []);

  return (
    <GameShell
      headerProps={{
        day: gameState.day,
        maxDays: 5,
        actionsRemaining: gameState.actionsRemaining,
        maxActions: 2,
        onOpenHelp: () => setIsTutorialOpen(true),
        onToggleSound: () => setIsMuted((prev) => !prev),
        isMuted,
      }}
      footerProps={{
        showAiDisclosure: true,
      }}
    >
      <div className="flex flex-col gap-5 w-full">
        {/* Terminal State Alert Banners */}
        {failed && (
          <div
            role="alert"
            className="w-full p-4 rounded-xl bg-[#FF6B73]/15 border-2 border-[#FF6B73] shadow-[0_0_24px_rgba(255,107,115,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#F4F7FC]"
          >
            <div>
              <h2 className="text-lg font-bold text-[#FF6B73] flex items-center gap-2">
                <span>⚠️</span> Mission Aborted — Life Support Depleted
              </h2>
              <p className="text-sm text-[#F4F7FC]/90 mt-1">
                {failureReason
                  ? failureReason.explanation
                  : 'Critical life support vitals crossed survival thresholds.'}
              </p>
            </div>
            <GameButton
              variant="amber"
              size="md"
              onClick={handleResetMission}
              className="shrink-0"
            >
              Restart Mission
            </GameButton>
          </div>
        )}

        {victorious && (
          <div
            role="alert"
            className="w-full p-4 rounded-xl bg-emerald-950/60 border-2 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#F4F7FC]"
          >
            <div>
              <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <span>🏆</span> Mission Accomplished!
              </h2>
              <p className="text-sm text-[#F4F7FC]/90 mt-1">
                Outstanding command! All five lunar days safely survived with life support vitals intact.
              </p>
            </div>
            <GameButton
              variant="primary"
              size="md"
              onClick={handleResetMission}
              className="shrink-0"
            >
              Play Again
            </GameButton>
          </div>
        )}

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

        {/* Main 2-Column Responsive Layout: Visual Surface + HUD & Controls */}
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
                disabled={gameState.outcome !== 'active'}
              />
            </section>

            {/* Building Maintenance Action Controls */}
            <ActionControls
              selectedModuleId={selectedModuleId}
              state={gameState}
              actionsRemaining={gameState.actionsRemaining}
              onExecuteAction={handleExecuteAction}
              onSelectModule={setSelectedModuleId}
              disabled={gameState.outcome !== 'active'}
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

            {/* Quick Helper / Reset Panel */}
            <div className="p-3.5 rounded-xl bg-[#101D35]/80 border border-[#1F3352] flex items-center justify-between gap-3 text-xs text-[#A8B8D0]">
              <span>Day {gameState.day} of 5</span>
              <div className="flex items-center gap-2">
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
      </div>

      {/* Tutorial Modal */}
      <MissionTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </GameShell>
  );
}
