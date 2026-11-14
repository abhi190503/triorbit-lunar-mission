'use client';

import React from 'react';
import type {
  MissionHUDProps,
  MissionPhase,
  Outcome,
  ResourceKey,
  ResourceState,
} from '@/lib/game/types';
import {
  MAX_ACTIONS_PER_DAY,
  TOTAL_MISSION_DAYS,
  VITAL_CRITICAL_THRESHOLD,
  RADIATION_ALERT_THRESHOLD,
} from '@/lib/game/contracts';
import { ResourceGauge } from './ResourceGauge';
import { GameButton } from './shell/GameButton';
import { GameBadge, type GameBadgeVariant } from './shell/GameBadge';

// ============================================================================
// CANONICAL ORDER FOR HUD RESOURCE GAUGES
// ============================================================================

export const CANONICAL_HUD_RESOURCES: readonly ResourceKey[] = [
  'oxygen',
  'power',
  'water',
  'food',
  'radiationRisk',
] as const;

// ============================================================================
// STATUS DESCRIPTORS & PURE HELPERS
// ============================================================================

export interface MissionStatusDescriptor {
  headline: string;
  subtext: string;
  badgeText: string;
  badgeVariant: GameBadgeVariant;
  isAlert: boolean;
}

/**
 * Derives child-friendly status descriptions from the canonical outcome,
 * phase, and current resource vitals.
 * Does NOT invent separate astronaut health simulation state.
 */
export function getMissionStatusDescriptor(
  outcome: Outcome,
  phase: MissionPhase,
  resources: ResourceState
): MissionStatusDescriptor {
  if (outcome === 'failure') {
    return {
      headline: 'Mission Aborted',
      subtext: 'Life support failure detected. Expedition emergency termination.',
      badgeText: 'MISSION ABORTED',
      badgeVariant: 'critical',
      isAlert: true,
    };
  }

  if (outcome === 'success') {
    return {
      headline: 'Mission Accomplished!',
      subtext: 'All 5 lunar days safely survived. Crew safe and expedition successful!',
      badgeText: 'EXPEDITION WON',
      badgeVariant: 'nominal',
      isAlert: false,
    };
  }

  // Active mission: evaluate whether any vital has crossed into critical territory
  const hasCriticalVital =
    resources.oxygen <= VITAL_CRITICAL_THRESHOLD ||
    resources.power <= VITAL_CRITICAL_THRESHOLD ||
    resources.water <= VITAL_CRITICAL_THRESHOLD ||
    resources.food <= VITAL_CRITICAL_THRESHOLD ||
    resources.radiationRisk >= RADIATION_ALERT_THRESHOLD;

  if (hasCriticalVital) {
    return {
      headline: 'Crew on High Alert',
      subtext: 'One or more life support vitals at emergency critical thresholds!',
      badgeText: 'CRITICAL ALERT',
      badgeVariant: 'critical',
      isAlert: true,
    };
  }

  switch (phase) {
    case 'briefing':
      return {
        headline: 'Morning Briefing',
        subtext: 'Review morning telemetry and prepare daily maintenance plan.',
        badgeText: 'CREW: 3 NOMINAL',
        badgeVariant: 'cyan',
        isAlert: false,
      };
    case 'event':
      return {
        headline: 'Space Weather Alert',
        subtext: 'NASA observation detected. Commander decision required.',
        badgeText: 'HAZARD ALERT',
        badgeVariant: 'warning',
        isAlert: true,
      };
    case 'result':
      return {
        headline: 'Mission Debrief',
        subtext: 'Simulation completed. Review expedition flight log.',
        badgeText: 'FLIGHT LOG',
        badgeVariant: 'muted',
        isAlert: false,
      };
    case 'choose':
    default:
      return {
        headline: 'Base Operations',
        subtext: 'Maintain habitat facilities to balance life support reserves.',
        badgeText: 'CREW: 3 NOMINAL',
        badgeVariant: 'nominal',
        isAlert: false,
      };
  }
}

/**
 * Determines whether Finish Day is disabled based on canonical game contracts.
 * - Allowed during active mission in 'choose' or 'briefing' phase.
 * - Allowed even if actions remain (finishing early is permitted by game rules).
 * - Blocked during active space weather dilemma ('event' phase).
 * - Blocked on terminal states ('success' or 'failure') and 'result' phase.
 */
export function isFinishDayDisabled(
  outcome: Outcome,
  phase: MissionPhase,
  disabledProp?: boolean
): boolean {
  if (disabledProp) return true;
  if (outcome !== 'active') return true;
  if (phase === 'event' || phase === 'result') return true;
  return false;
}

/**
 * Generates descriptive child-friendly help text explaining the Finish Day control state.
 */
export function getFinishDayHelpText(
  outcome: Outcome,
  phase: MissionPhase,
  actionsRemaining: number
): string {
  if (outcome === 'success') {
    return 'Mission completed successfully. View flight log on results screen.';
  }
  if (outcome === 'failure') {
    return 'Mission aborted due to depleted life support resources.';
  }
  if (phase === 'event') {
    return 'Resolve the active Space Weather dilemma before advancing the mission day.';
  }
  if (phase === 'result') {
    return 'Mission completed.';
  }
  if (actionsRemaining > 0) {
    return `${actionsRemaining} unused action slot${actionsRemaining > 1 ? 's' : ''}. Finishing early will process daily drain.`;
  }
  return 'All maintenance actions completed. Conclude day to apply baseline life support drain.';
}

// ============================================================================
// COMPONENT PROPS (EXTENDS CANONICAL MISSION HUD PROPS)
// ============================================================================

export interface MissionHUDComponentProps extends MissionHUDProps {
  /** Optional custom CSS classes for the root container */
  className?: string;
  /** Optional external disabled override */
  disabled?: boolean;
}

// ============================================================================
// MISSION HUD COMPONENT
// ============================================================================

export function MissionHUD({
  day,
  phase,
  actionsRemaining,
  resources,
  outcome,
  onFinishDay,
  className = '',
  disabled = false,
}: MissionHUDComponentProps) {
  const statusDesc = getMissionStatusDescriptor(outcome, phase, resources);
  const finishDisabled = isFinishDayDisabled(outcome, phase, disabled);
  const finishHelpText = getFinishDayHelpText(outcome, phase, actionsRemaining);

  const handleFinishDayClick = React.useCallback(() => {
    if (!finishDisabled && onFinishDay) {
      onFinishDay();
    }
  }, [finishDisabled, onFinishDay]);

  const boundedDay = Math.max(1, Math.min(TOTAL_MISSION_DAYS, day));
  const boundedActions = Math.max(0, Math.min(MAX_ACTIONS_PER_DAY, actionsRemaining));

  return (
    <aside
      aria-label="Mission Telemetry and Resources HUD"
      className={`
        w-full flex flex-col gap-3
        bg-[#101D35]/95 backdrop-blur-md border border-[#1F3352] rounded-xl
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.6),0_0_1px_1px_rgba(96,229,244,0.08)]
        p-3.5 sm:p-4 text-[#F4F7FC]
        ${statusDesc.isAlert && outcome === 'failure' ? 'border-[#FF6B73]/60' : ''}
        ${className}
      `}
    >
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP MISSION STATUS & DAY PROGRESS HEADER                           */}
      {/* -------------------------------------------------------------------- */}
      <header className="flex flex-col gap-2.5 pb-3 border-b border-[#1F3352]/80">
        <div className="flex items-center justify-between gap-2">
          {/* Mission Day Title */}
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#60E5F4] animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-[#60E5F4]">
              {`DAY ${boundedDay} / ${TOTAL_MISSION_DAYS}`}
            </h2>
          </div>

          {/* Crew / Mission Status Badge */}
          <GameBadge
            data-testid="hud-status-badge"
            variant={statusDesc.badgeVariant}
            size="sm"
            pulse={statusDesc.isAlert}
            className="shrink-0 font-semibold"
          >
            {statusDesc.badgeText}
          </GameBadge>
        </div>

        {/* 5-Day Visual Progress Track */}
        <div
          role="group"
          aria-label={`Mission progress: Day ${boundedDay} of ${TOTAL_MISSION_DAYS}`}
          className="flex items-center gap-1.5 w-full"
        >
          {Array.from({ length: TOTAL_MISSION_DAYS }, (_, idx) => {
            const stepDay = idx + 1;
            const isCompleted = stepDay < boundedDay;
            const isCurrent = stepDay === boundedDay;

            return (
              <div
                key={`mission-day-step-${stepDay}`}
                data-testid={`hud-day-step-${stepDay}`}
                data-active={isCurrent}
                data-completed={isCompleted}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-200 motion-reduce:transition-none relative
                  ${isCurrent
                    ? 'bg-[#60E5F4] shadow-[0_0_8px_rgba(96,229,244,0.6)] ring-1 ring-[#60E5F4]'
                    : isCompleted
                      ? 'bg-[#5C9CFF]/80'
                      : 'bg-[#162640] border border-[#1F3352]'
                  }
                `}
                title={`Day ${stepDay}${isCurrent ? ' (Current)' : isCompleted ? ' (Completed)' : ' (Upcoming)'}`}
              />
            );
          })}
        </div>

        {/* Status Headline and Child-Friendly Description */}
        <div className="bg-[#080F20]/60 rounded-lg p-2 border border-[#1F3352]/60">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-moon-white truncate">
              {statusDesc.headline}
            </h3>
            <span className="text-[10px] font-mono text-[#60E5F4] uppercase tracking-tight shrink-0">
              Phase: {phase}
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
            {statusDesc.subtext}
          </p>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. ACTIONS REMAINING COUNTER                                         */}
      {/* -------------------------------------------------------------------- */}
      <section
        aria-label="Daily Maintenance Action Slots"
        className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#162640]/70 border border-[#1F3352]"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-moon-white">
              Actions:
            </span>
            <span
              data-testid="hud-actions-value"
              className={`font-mono text-sm font-bold tabular-nums ${
                boundedActions === 0 ? 'text-[#FF9F5A]' : 'text-[#60E5F4]'
              }`}
            >
              {`${boundedActions} / ${MAX_ACTIONS_PER_DAY}`}
            </span>
          </div>
          <p className="text-[10px] text-text-muted truncate">
            {boundedActions === 0
              ? '⚠️ All daily actions used'
              : `${boundedActions} maintenance slot${boundedActions > 1 ? 's' : ''} ready`}
          </p>
        </div>

        {/* Action Slot Visual Dots */}
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          {Array.from({ length: MAX_ACTIONS_PER_DAY }, (_, idx) => {
            const slotIndex = idx + 1;
            const isFilled = boundedActions >= slotIndex;

            return (
              <span
                key={`action-slot-dot-${slotIndex}`}
                data-testid={`hud-action-slot-${slotIndex}`}
                className={`
                  w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-150 motion-reduce:transition-none
                  ${isFilled
                    ? 'bg-[#60E5F4] text-[#080F20] shadow-[0_0_8px_rgba(96,229,244,0.4)]'
                    : 'bg-[#080F20] border border-[#1F3352] text-[#8FA2BA]'
                  }
                `}
              >
                {slotIndex}
              </span>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. FIVE RESOURCE GAUGES                                              */}
      {/* -------------------------------------------------------------------- */}
      <section
        aria-label="Normalized Habitat Life Support Resources"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
            Life Support Vitals (0–100)
          </span>
          <span className="text-[9px] font-mono text-text-muted">
            Daily Drain: -14 to -16
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {CANONICAL_HUD_RESOURCES.map((resourceKey) => (
            <ResourceGauge
              key={`hud-gauge-${resourceKey}`}
              resourceKey={resourceKey}
              value={resources[resourceKey]}
              compact
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. FINISH DAY CONTROL                                                */}
      {/* -------------------------------------------------------------------- */}
      <footer className="pt-2 border-t border-[#1F3352]/80 flex flex-col gap-1.5">
        <GameButton
          data-testid="hud-finish-day-button"
          variant={boundedActions === 0 ? 'primary' : 'amber'}
          size="md"
          fullWidth
          disabled={finishDisabled}
          onClick={handleFinishDayClick}
          className="min-h-[48px] text-sm font-bold tracking-wide cursor-pointer"
          aria-describedby="hud-finish-day-help"
        >
          {phase === 'event'
            ? 'Resolve Space Hazard'
            : outcome !== 'active'
              ? 'Mission Completed'
              : boundedActions === 0
                ? 'Finish Day & Rest Crew'
                : 'Finish Day Early'}
        </GameButton>

        <p
          id="hud-finish-day-help"
          data-testid="hud-finish-day-help"
          className="text-[10px] text-center text-text-muted leading-tight px-1"
        >
          {finishHelpText}
        </p>
      </footer>
    </aside>
  );
}
