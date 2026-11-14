'use client';

import React from 'react';
import type { ResourceKey } from '@/lib/game/types';
import {
  RESOURCE_MIN,
  RESOURCE_MAX,
  VITAL_CRITICAL_THRESHOLD,
  RADIATION_ALERT_THRESHOLD,
  clampResource,
} from '@/lib/game/contracts';
import { GameBadge, type GameBadgeVariant } from './shell/GameBadge';

// ============================================================================
// RESOURCE CONFIGURATION & CONSTANTS
// ============================================================================

export interface ResourceMeta {
  key: ResourceKey;
  name: string;
  subsystem: string;
  colorHex: string;
  trackColorHex: string;
  isAdverse: boolean;
  unitLabel: string;
  description: string;
}

export const RESOURCE_METAS: Readonly<Record<ResourceKey, ResourceMeta>> = {
  oxygen: {
    key: 'oxygen',
    name: 'Oxygen',
    subsystem: 'Life Support Dome',
    colorHex: '#60E5F4',
    trackColorHex: 'rgba(96, 229, 244, 0.12)',
    isAdverse: false,
    unitLabel: 'pts',
    description: 'Atmospheric oxygen levels inside the crew habitat.',
  },
  power: {
    key: 'power',
    name: 'Power',
    subsystem: 'Solar Array & Battery',
    colorHex: '#FFCA72',
    trackColorHex: 'rgba(255, 202, 114, 0.12)',
    isAdverse: false,
    unitLabel: 'pts',
    description: 'Electrical storage and solar generation capacity.',
  },
  water: {
    key: 'water',
    name: 'Water',
    subsystem: 'Reclamation Loop',
    colorHex: '#5C9CFF',
    trackColorHex: 'rgba(92, 156, 255, 0.12)',
    isAdverse: false,
    unitLabel: 'pts',
    description: 'Purified water reserves for hydration and oxygen generation.',
  },
  food: {
    key: 'food',
    name: 'Food',
    subsystem: 'Hydroponics Greenhouse',
    colorHex: '#59DDA5',
    trackColorHex: 'rgba(89, 221, 165, 0.12)',
    isAdverse: false,
    unitLabel: 'pts',
    description: 'Nutritional food stores and hydroponic crop yields.',
  },
  radiationRisk: {
    key: 'radiationRisk',
    name: 'Radiation Risk',
    subsystem: 'Shielded Regolith Bunker',
    colorHex: '#FF6B73',
    trackColorHex: 'rgba(255, 107, 115, 0.12)',
    isAdverse: true,
    unitLabel: 'pts',
    description: 'Simulated cosmic and solar radiation hazard level.',
  },
} as const;

// ============================================================================
// STATUS THRESHOLDS & EVALUATION
// ============================================================================

export type ResourceHealthStatus =
  | 'nominal'
  | 'warning'
  | 'critical'
  | 'depleted'
  | 'maximum';

export interface ResourceStatusEvaluation {
  status: ResourceHealthStatus;
  statusLabel: string;
  badgeVariant: GameBadgeVariant;
  isCritical: boolean;
  barColorHex: string;
  ariaDescription: string;
}

/**
 * Evaluates the pedagogical status of a resource based on canonical thresholds.
 *
 * For essential resources (Oxygen, Power, Water, Food):
 * - > 40: Nominal (Healthy)
 * - 21–40: Warning (Elevated consumption)
 * - 1–20: Critical (Danger of life support collapse)
 * - 0: Depleted (Mission failure threshold)
 *
 * For adverse resources (Radiation Risk):
 * - < 50: Low Risk (Safe orbital background)
 * - 50–69: Elevated Risk (Solar storm hazard detected)
 * - 70–99: Critical Risk (Urgent shelter required)
 * - 100: Maximum Risk (Mission failure threshold)
 */
export function evaluateResourceStatus(
  key: ResourceKey,
  rawVal: number
): ResourceStatusEvaluation {
  const meta = RESOURCE_METAS[key];
  const clamped = clampResource(rawVal);

  if (meta.isAdverse) {
    if (clamped >= RESOURCE_MAX) {
      return {
        status: 'maximum',
        statusLabel: 'Max Risk',
        badgeVariant: 'critical',
        isCritical: true,
        barColorHex: '#FF6B73',
        ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Maximum Hazard! Immediate mission failure. Higher values indicate greater danger.`,
      };
    }
    if (clamped >= RADIATION_ALERT_THRESHOLD) {
      return {
        status: 'critical',
        statusLabel: 'Critical Risk',
        badgeVariant: 'critical',
        isCritical: true,
        barColorHex: '#FF6B73',
        ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Critical Hazard! Bunker shelter strongly advised. Higher values indicate greater danger.`,
      };
    }
    if (clamped >= 50) {
      return {
        status: 'warning',
        statusLabel: 'Elevated Risk',
        badgeVariant: 'warning',
        isCritical: false,
        barColorHex: '#FF9F5A',
        ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Elevated Hazard. Higher values indicate greater danger.`,
      };
    }
    return {
      status: 'nominal',
      statusLabel: 'Low Risk',
      badgeVariant: 'nominal',
      isCritical: false,
      barColorHex: '#59DDA5',
      ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Low Risk (Safe). Higher values indicate greater danger.`,
    };
  }

  // Essential positive resources
  if (clamped <= RESOURCE_MIN) {
    return {
      status: 'depleted',
      statusLabel: 'Depleted',
      badgeVariant: 'critical',
      isCritical: true,
      barColorHex: '#FF6B73',
      ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Depleted! Immediate mission failure.`,
    };
  }
  if (clamped <= VITAL_CRITICAL_THRESHOLD) {
    return {
      status: 'critical',
      statusLabel: 'Critical',
      badgeVariant: 'critical',
      isCritical: true,
      barColorHex: '#FF6B73',
      ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Critical Warning! Replenishment urgently required.`,
    };
  }
  if (clamped <= 40) {
    return {
      status: 'warning',
      statusLabel: 'Warning',
      badgeVariant: 'warning',
      isCritical: false,
      barColorHex: '#FF9F5A',
      ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Warning level. Consumption outpacing recovery.`,
    };
  }
  return {
    status: 'nominal',
    statusLabel: 'Nominal',
    badgeVariant: 'nominal',
    isCritical: false,
    barColorHex: meta.colorHex,
    ariaDescription: `${meta.name}: ${clamped} of 100 points. Status: Nominal (Healthy).`,
  };
}

// ============================================================================
// RESOURCE ICONS (ACCESSIBLE INLINE SVGS)
// ============================================================================

export function ResourceIcon({
  resourceKey,
  color,
  className = 'w-4 h-4',
}: {
  resourceKey: ResourceKey;
  color?: string;
  className?: string;
}) {
  const meta = RESOURCE_METAS[resourceKey];
  const strokeColor = color || meta.colorHex;

  switch (resourceKey) {
    case 'oxygen':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Cylinder / Molecule */}
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'power':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Lightning Bolt */}
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'water':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Water Drop */}
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case 'food':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Sprout / Leaf */}
          <path d="M7 20h10" />
          <path d="M10 20c0-5 2-8 7-9" />
          <path d="M17 11a5 5 0 0 0-5-5c-4 0-5 5-5 5s1 5 5 5a5 5 0 0 0 5-5z" />
        </svg>
      );
    case 'radiationRisk':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Hazard Shield / Trefoil Accent */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" fill={strokeColor} />
        </svg>
      );
  }
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ResourceGaugeProps {
  /** The canonical resource vital key */
  resourceKey: ResourceKey;
  /** Current normalized value (0–100 integer) */
  value: number;
  /** Optional custom display label override */
  label?: string;
  /** Optional subsystem subtitle override */
  subsystem?: string;
  /** Compact rendering mode for dense HUD sidebars */
  compact?: boolean;
  /** Whether to show the textual status badge */
  showStatusBadge?: boolean;
  /** Additional container styling classes */
  className?: string;
}

// ============================================================================
// RESOURCE GAUGE COMPONENT
// ============================================================================

export function ResourceGauge({
  resourceKey,
  value,
  label,
  subsystem,
  compact = false,
  showStatusBadge = true,
  className = '',
}: ResourceGaugeProps) {
  const meta = RESOURCE_METAS[resourceKey];
  const clampedValue = clampResource(value);
  const statusInfo = evaluateResourceStatus(resourceKey, clampedValue);
  const displayLabel = label || meta.name;
  const displaySubsystem = subsystem || meta.subsystem;

  return (
    <article
      data-testid={`resource-gauge-${resourceKey}`}
      data-resource={resourceKey}
      data-status={statusInfo.status}
      className={`
        rounded-lg border transition-all duration-200
        ${statusInfo.isCritical
          ? 'bg-[#162640]/90 border-[#FF6B73]/60 shadow-[0_0_12px_rgba(255,107,115,0.25)]'
          : statusInfo.status === 'warning'
            ? 'bg-[#162640]/80 border-[#FF9F5A]/40'
            : 'bg-[#101D35]/80 border-[#1F3352] hover:border-[#1F3352]/80'
        }
        ${compact ? 'p-2.5' : 'p-3'}
        ${className}
      `}
      aria-label={statusInfo.ariaDescription}
    >
      {/* Top Header: Icon + Name + Subsystem vs Value + Status Badge */}
      <header className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex items-center justify-center w-6 h-6 rounded bg-[#080F20] border border-[#1F3352] shrink-0"
            style={{ color: meta.colorHex }}
            aria-hidden="true"
          >
            <ResourceIcon resourceKey={resourceKey} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold tracking-wider uppercase text-moon-white truncate">
                {displayLabel}
              </h4>
              {meta.isAdverse && (
                <span
                  className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-[#FF6B73]/15 text-[#FF6B73] border border-[#FF6B73]/30 tracking-tight"
                  title="Adverse Hazard: Lower value is safer for crew"
                >
                  HAZARD
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-[10px] text-text-muted truncate leading-tight">
                {displaySubsystem}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Value + Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span
              data-testid={`resource-value-${resourceKey}`}
              className="font-mono text-sm sm:text-base font-bold tabular-nums text-moon-white"
            >
              {clampedValue}
            </span>
            <span className="font-mono text-[10px] text-[#8FA2BA] ml-0.5">
              / 100
            </span>
          </div>

          {showStatusBadge && (
            <GameBadge
              data-testid={`resource-badge-${resourceKey}`}
              variant={statusInfo.badgeVariant}
              size="sm"
              pulse={statusInfo.isCritical}
              className="shrink-0 font-semibold"
            >
              {statusInfo.statusLabel}
            </GameBadge>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={RESOURCE_MIN}
          aria-valuemax={RESOURCE_MAX}
          aria-valuetext={statusInfo.ariaDescription}
          aria-label={`${displayLabel} progress bar`}
          className="w-full h-2 rounded-full overflow-hidden bg-[#080F20] border border-[#1F3352]/80 relative"
        >
          <div
            data-testid={`resource-bar-fill-${resourceKey}`}
            style={{
              width: `${clampedValue}%`,
              backgroundColor: statusInfo.barColorHex,
            }}
            className={`
              h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none
              ${statusInfo.isCritical ? 'animate-pulse' : ''}
            `}
          />
        </div>

        {/* Adverse Educational Note for young learners */}
        {meta.isAdverse && !compact && (
          <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5">
            <span className="text-text-muted italic">
              Lower is safer (0 = Safe, 100 = Mission Failure)
            </span>
            {statusInfo.isCritical && (
              <span className="text-[#FF6B73] font-bold tracking-tight">
                ⚠️ Critical Hazard
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
