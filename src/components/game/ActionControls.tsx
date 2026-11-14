'use client';

import React from 'react';
import type { ActionId, GameState } from '@/lib/game/types';
import type { LunarModuleId } from './ModuleHotspot';
import {
  getModuleActionViewStates,
  ActionViewState,
} from '@/lib/game/controller';
import { GamePanel } from './shell/GamePanel';
import { GameButton } from './shell/GameButton';
import { GameBadge } from './shell/GameBadge';
import { CANONICAL_LUNAR_MODULES } from './LunarBaseScene';

export interface ActionControlsProps {
  /**
   * The currently selected lunar habitat module (null if none selected).
   */
  selectedModuleId: LunarModuleId | null;

  /**
   * Authoritative canonical GameState.
   */
  state: GameState;

  /**
   * Number of daily maintenance actions remaining [0-2].
   */
  actionsRemaining: number;

  /**
   * Callback invoked when commander triggers a maintenance action.
   */
  onExecuteAction: (actionId: ActionId) => void;

  /**
   * Optional callback to change selected module or deselect.
   */
  onSelectModule?: (moduleId: LunarModuleId | null) => void;

  /**
   * External disabled override (e.g. during alerts, modals, or animations).
   */
  disabled?: boolean;

  /**
   * Optional additional class name.
   */
  className?: string;
}

export function ActionControls({
  selectedModuleId,
  state,
  actionsRemaining,
  onExecuteAction,
  onSelectModule,
  disabled = false,
  className = '',
}: ActionControlsProps) {
  // Find metadata for the selected module
  const selectedConfig = selectedModuleId
    ? CANONICAL_LUNAR_MODULES.find((m) => m.id === selectedModuleId)
    : null;

  // Retrieve derived action view states for the selected module
  const moduleActions: ActionViewState[] = selectedModuleId
    ? getModuleActionViewStates(state, selectedModuleId)
    : [];

  const isActionsDepleted = actionsRemaining <= 0;
  const isMissionConcluded = state.outcome !== 'active';

  return (
    <section
      aria-label="Facility Maintenance Controls"
      className={`w-full flex flex-col gap-3 ${className}`}
    >
      {selectedConfig ? (
        <GamePanel
          variant="default"
          padding="md"
          className="border-[#1F3352]"
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {selectedConfig.shortIcon}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#F4F7FC]">
                  {selectedConfig.name}
                </h3>
                <p className="text-xs text-[#A8B8D0] font-normal">
                  {selectedConfig.subsystem}
                </p>
              </div>
            </div>
          }
          headerBadge={
            <div className="flex items-center gap-1.5">
              <GameBadge
                variant={isActionsDepleted ? 'muted' : 'cyan'}
                size="sm"
              >
                {`${actionsRemaining} / 2 Actions Left`}
              </GameBadge>
              {onSelectModule && (
                <button
                  type="button"
                  onClick={() => onSelectModule(null)}
                  className="text-xs text-[#60E5F4] hover:text-white px-2 py-1 rounded bg-[#162640] border border-[#1F3352] hover:border-[#60E5F4] transition ml-1"
                  aria-label="Close facility actions panel"
                >
                  ✕ Close
                </button>
              )}
            </div>
          }
        >
          {/* Action List */}
          <div className="flex flex-col gap-3 mt-2">
            {moduleActions.map((action) => {
              const canExecute =
                !disabled &&
                action.isAvailable &&
                actionsRemaining > 0 &&
                !isMissionConcluded;

              return (
                <article
                  key={action.id}
                  data-testid={`action-card-${action.id}`}
                  className={`
                    flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg
                    border transition-all
                    ${
                      canExecute
                        ? 'bg-[#162640]/90 border-[#1F3352] hover:border-[#60E5F4]/60 hover:shadow-[0_0_12px_rgba(96,229,244,0.15)]'
                        : 'bg-[#101D35]/60 border-[#1F3352]/60 opacity-80'
                    }
                  `}
                >
                  {/* Left: Action Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-semibold text-[#F4F7FC]">
                        {action.name}
                      </h4>
                      {/* Yield Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        {action.yieldSummary}
                      </span>
                      {/* Cost Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          action.costSummary === '0 Cost'
                            ? 'bg-slate-900 text-slate-400 border border-slate-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        Cost: {action.costSummary}
                      </span>
                    </div>

                    <p className="text-xs text-[#A8B8D0] mt-1.5 leading-relaxed">
                      {action.description}
                    </p>

                    {/* Disabled Explanation */}
                    {!action.isAvailable && action.disabledReason && (
                      <div
                        role="alert"
                        className="mt-2 text-xs flex items-start gap-1.5 text-[#FFCA72] bg-[#FFCA72]/10 border border-[#FFCA72]/30 px-2.5 py-1.5 rounded"
                      >
                        <span aria-hidden="true">⚠️</span>
                        <span>{action.disabledReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Trigger Button */}
                  <div className="sm:self-center shrink-0">
                    <GameButton
                      variant={canExecute ? 'primary' : 'secondary'}
                      size="md"
                      disabled={!canExecute}
                      onClick={() => onExecuteAction(action.id)}
                      aria-label={`Execute ${action.name} — Yields ${action.yieldSummary}, Costs ${action.costSummary}`}
                      className="w-full sm:w-auto font-bold"
                    >
                      {canExecute ? 'Execute Action' : 'Unavailable'}
                    </GameButton>
                  </div>
                </article>
              );
            })}
          </div>
        </GamePanel>
      ) : (
        /* Empty / Guidance State when no module is selected */
        <GamePanel
          variant="default"
          padding="md"
          className="border-[#1F3352]"
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                🛰️
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#F4F7FC]">
                  Base Maintenance Operations
                </h3>
                <p className="text-xs text-[#A8B8D0] font-normal">
                  Select a habitat facility to inspect and execute maintenance decisions
                </p>
              </div>
            </div>
          }
          headerBadge={
            <GameBadge
              variant={isActionsDepleted ? 'muted' : 'cyan'}
              size="sm"
            >
              {`${actionsRemaining} / 2 Actions Left`}
            </GameBadge>
          }
        >
          <div className="py-2 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-[#A8B8D0] mb-3">
              Commander: Select an interactive module on the lunar surface above or choose a facility below to balance critical oxygen, power, water, food, and radiation risk reserves.
            </p>

            {/* Quick module selection buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CANONICAL_LUNAR_MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectModule && onSelectModule(m.id)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#162640] border border-[#1F3352] hover:border-[#60E5F4] hover:bg-[#203653] transition text-center group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {m.shortIcon}
                  </span>
                  <span className="text-xs font-semibold text-[#F4F7FC]">
                    {m.name}
                  </span>
                  <span className="text-[10px] text-[#60E5F4] font-mono mt-0.5">
                    {m.yieldSummary}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </GamePanel>
      )}
    </section>
  );
}
