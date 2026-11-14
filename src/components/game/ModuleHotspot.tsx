'use client';

import React, { useCallback } from 'react';
import type { ActionId, ResourceKey } from '@/lib/game/types';

export type LunarModuleId = 'solar' | 'habitat' | 'greenhouse' | 'bunker';

export interface ModuleHotspotProps {
  /**
   * Unique canonical identifier for the facility module.
   */
  id: LunarModuleId;

  /**
   * Human-readable facility name (e.g. "Solar Power Station").
   */
  name: string;

  /**
   * Habitat subsystem description (e.g. "Solar Array & Battery Station").
   */
  subsystem: string;

  /**
   * Short uppercase badge label displayed on the scene (e.g. "SOLAR", "HABITAT").
   */
  displayLabel: string;

  /**
   * Full descriptive accessibility label conforming to WCAG 2.1 AA.
   */
  accessibleLabel: string;

  /**
   * Canonical actions supported by this facility.
   */
  canonicalActions: ActionId[];

  /**
   * Left position as percentage of 16:9 container [0-100].
   */
  left: number;

  /**
   * Top position as percentage of 16:9 container [0-100].
   */
  top: number;

  /**
   * Width as percentage of 16:9 container [0-100].
   */
  width: number;

  /**
   * Height as percentage of 16:9 container [0-100].
   */
  height: number;

  /**
   * Whether this module is currently selected by the commander.
   */
  isSelected?: boolean;

  /**
   * Whether interaction with this hotspot is disabled.
   */
  disabled?: boolean;

  /**
   * Selection callback when clicked, tapped, or activated via keyboard.
   */
  onSelect: (id: LunarModuleId) => void;

  /**
   * Primary vital resource associated with this module.
   */
  vitalMetric?: ResourceKey;

  /**
   * Concise summary of the maintenance yield (e.g. "+20 Power").
   */
  yieldSummary?: string;

  /**
   * Concise summary of the maintenance resource cost (e.g. "0 Cost" or "-8 Power, -6 Water").
   */
  costSummary?: string;

  /**
   * Optional custom class name.
   */
  className?: string;
}

function renderModuleIcon(id: LunarModuleId) {
  switch (id) {
    case 'solar':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-amber-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case 'habitat':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-cyan-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 20h18" />
          <path d="M12 4a9 9 0 0 0-9 9c0 3.87 3.13 7 7 7h4c3.87 0 7-3.13 7-7a9 9 0 0 0-9-9z" />
          <path d="M12 9v4" />
          <path d="M10 11h4" />
        </svg>
      );
    case 'greenhouse':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-emerald-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22v-9" />
          <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
          <path d="M7 16a4 4 0 0 1 4-4" />
        </svg>
      );
    case 'bunker':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-rose-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
  }
}

export function ModuleHotspot({
  id,
  name,
  subsystem,
  displayLabel,
  accessibleLabel,
  left,
  top,
  width,
  height,
  isSelected = false,
  disabled = false,
  onSelect,
  yieldSummary,
  costSummary,
  className = '',
}: ModuleHotspotProps) {
  // Determine horizontal alignment modifier to prevent tooltip clipping near container edges
  const alignClass =
    id === 'solar'
      ? 'lunar-hotspot--align-left'
      : id === 'greenhouse' || id === 'bunker'
      ? 'lunar-hotspot--align-right'
      : '';

  // Native button semantics: Enter and Space trigger onClick natively.
  // Relying on native button semantics prevents duplicate callbacks and keyboard interference.
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(id);
    }
  }, [disabled, onSelect, id]);

  return (
    <button
      type="button"
      id={`hotspot-${id}`}
      data-module-id={id}
      data-selected={isSelected ? 'true' : 'false'}
      aria-label={accessibleLabel}
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={handleClick}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      className={`lunar-hotspot ${alignClass} ${
        isSelected ? 'lunar-hotspot--selected' : ''
      } ${disabled ? 'lunar-hotspot--disabled' : ''} ${className}`.trim()}
    >
      {/* Floating telemetry peek tooltip on hover or keyboard focus */}
      <div className="lunar-hotspot-telemetry" aria-hidden="true">
        <div className="text-moon-white font-semibold text-xs flex items-center gap-1.5">
          {renderModuleIcon(id)}
          <span>{name}</span>
        </div>
        <div className="text-text-muted text-[10px] mt-0.5">{subsystem}</div>
        {yieldSummary && (
          <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-cyan-electric">
            <span>Yield:</span>
            <span className="font-semibold">{yieldSummary}</span>
          </div>
        )}
        {costSummary && (
          <div className="text-[10px] font-mono text-amber-solar">
            <span>Cost: </span>
            <span>{costSummary}</span>
          </div>
        )}
      </div>

      {/* Floating facility identifier badge with animated beacon */}
      <div className="lunar-hotspot-badge">
        <span
          className={`lunar-hotspot-beacon ${
            isSelected ? 'bg-cyan-electric' : 'bg-cyan-electric'
          }`}
          aria-hidden="true"
        />
        {renderModuleIcon(id)}
        <span>{displayLabel}</span>
      </div>
    </button>
  );
}

