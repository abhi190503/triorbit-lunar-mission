'use client';

import React, { useState, useCallback } from 'react';
import { ModuleHotspot, type LunarModuleId } from './ModuleHotspot';
import type { ActionId, ResourceKey } from '@/lib/game/types';

export interface ModuleHotspotConfig {
  id: LunarModuleId;
  name: string;
  subsystem: string;
  displayLabel: string;
  accessibleLabel: string;
  canonicalActions: ActionId[];
  left: number; // percentage [0-100]
  top: number; // percentage [0-100]
  width: number; // percentage [0-100]
  height: number; // percentage [0-100]
  vitalMetric: ResourceKey;
  yieldSummary: string;
  costSummary: string;
  shortIcon: string;
}

export const CANONICAL_LUNAR_MODULES: ReadonlyArray<ModuleHotspotConfig> = [
  {
    id: 'solar',
    name: 'Solar Power Station',
    subsystem: 'Solar Array & Battery Station',
    displayLabel: 'SOLAR',
    accessibleLabel: 'Solar Array & Battery Station — Generate Power',
    canonicalActions: ['maintain-solar'],
    left: 12,
    top: 42,
    width: 17,
    height: 26,
    vitalMetric: 'power',
    yieldSummary: '+20 Power',
    costSummary: '0 Cost',
    shortIcon: '⚡',
  },
  {
    id: 'habitat',
    name: 'Life Support Habitat',
    subsystem: 'Life Support Habitat',
    displayLabel: 'HABITAT',
    accessibleLabel: 'Life Support Habitat — Produce Oxygen',
    canonicalActions: ['generate-oxygen'],
    left: 38,
    top: 32,
    width: 20,
    height: 30,
    vitalMetric: 'oxygen',
    yieldSummary: '+20 Oxygen',
    costSummary: '-8 Power, -6 Water',
    shortIcon: '🫁',
  },
  {
    id: 'greenhouse',
    name: 'Hydroponics Greenhouse',
    subsystem: 'Hydroponics Greenhouse',
    displayLabel: 'GREENHOUSE',
    accessibleLabel: 'Hydroponics Greenhouse — Water Reclamation & Food Cultivation',
    canonicalActions: ['operate-greenhouse', 'recycle-water'],
    left: 64,
    top: 36,
    width: 18,
    height: 30,
    vitalMetric: 'food',
    yieldSummary: '+17 Food / +18 Water',
    costSummary: '-7 Power / -9 Water',
    shortIcon: '🌱',
  },
  {
    id: 'bunker',
    name: 'Shielded Lunar Bunker',
    subsystem: 'Shielded Lunar Bunker',
    displayLabel: 'BUNKER',
    accessibleLabel: 'Shielded Lunar Bunker — Storm Radiation Defense',
    canonicalActions: ['reinforce-shelter'],
    left: 68,
    top: 68,
    width: 20,
    height: 22,
    vitalMetric: 'radiationRisk',
    yieldSummary: '-18 Radiation Risk',
    costSummary: '-7 Power',
    shortIcon: '🛡️',
  },
] as const;

export interface LunarBaseSceneProps {
  /**
   * ID of the currently selected habitat facility.
   */
  selectedModuleId?: LunarModuleId | null;

  /**
   * Typed callback fired when a facility module is selected.
   */
  onSelectModule?: (moduleId: LunarModuleId) => void;

  /**
   * Disable hotspot interactions (e.g. during alerts, modals, or 0 actions left).
   */
  disabled?: boolean;

  /**
   * Optional custom background image path or URL.
   * Defaults to production asset '/images/lunar-base-cinematic.webp'.
   */
  imageSrc?: string;

  /**
   * Whether to display the mobile-friendly facility selector strip beneath the scene.
   * Defaults to true.
   */
  showMobileSelector?: boolean;

  /**
   * Optional override for module hotspot configurations.
   */
  modules?: ReadonlyArray<ModuleHotspotConfig>;

  /**
   * Number of maintenance actions remaining today (for accessibility announcements).
   */
  actionsRemaining?: number;

  /**
   * Optional class name for the outer container.
   */
  className?: string;
}

export function LunarBaseScene({
  selectedModuleId = null,
  onSelectModule,
  disabled = false,
  imageSrc = '/images/lunar-base-cinematic.webp',
  showMobileSelector = true,
  modules = CANONICAL_LUNAR_MODULES,
  actionsRemaining,
  className = '',
}: LunarBaseSceneProps) {
  const [imageError, setImageError] = useState(false);

  const handleSelect = useCallback(
    (id: LunarModuleId) => {
      if (!disabled && onSelectModule) {
        onSelectModule(id);
      }
    },
    [disabled, onSelectModule]
  );

  return (
    <section
      aria-label="Interactive Lunar Base Environment"
      className={`lunar-scene-root ${className}`.trim()}
    >
      {/* 16:9 Zero-Drift Responsive Viewport */}
      <div
        className="lunar-scene-viewport relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-space-deep border border-border-subtle shadow-panel"
        data-testid="lunar-base-viewport"
      >
        {/* Sky / Regolith Fallback Layer (always rendered behind image) */}
        <div
          className="absolute inset-0 bg-space-mesh z-0"
          aria-hidden="true"
        />

        {/* Realistic Lunar Outpost Graphic Layer */}
        {!imageError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt="TriOrbit Lunar Outpost showing solar array, central habitat dome, hydroponics greenhouse, and shielded bunker against lunar regolith and starry space"
            onError={() => setImageError(true)}
            className="lunar-scene-image absolute inset-0 w-full h-full object-cover object-center z-[1]"
            data-testid="lunar-base-image"
          />
        )}

        {/* Artwork Fallback Notice if image fails to load */}
        {imageError && (
          <div
            className="absolute inset-0 z-[1] flex flex-col items-center justify-center p-6 text-center bg-lunar-navy/80 border border-cyan-electric/20"
            role="status"
          >
            <p className="text-moon-white font-display text-sm sm:text-base font-bold tracking-wide">
              LUNAR BASE TELEMETRY GRID ACTIVE
            </p>
            <p className="text-text-muted text-xs max-w-md mt-1">
              Visual feed fallback active. All 4 facility maintenance interfaces remain fully operational.
            </p>
          </div>
        )}

        {/* Cinematic Atmospheric Scrim Overlay */}
        <div
          className="lunar-scene-scrim absolute inset-0 z-[2] pointer-events-none"
          aria-hidden="true"
        />

        {/* Hotspot Overlay Layer */}
        <div
          className="lunar-hotspots-layer absolute inset-0 z-[3]"
          role="group"
          aria-label="Lunar Base Facilities"
        >
          {modules.map((module) => (
            <ModuleHotspot
              key={module.id}
              id={module.id}
              name={module.name}
              subsystem={module.subsystem}
              displayLabel={module.displayLabel}
              accessibleLabel={module.accessibleLabel}
              canonicalActions={module.canonicalActions}
              left={module.left}
              top={module.top}
              width={module.width}
              height={module.height}
              isSelected={selectedModuleId === module.id}
              disabled={disabled}
              onSelect={handleSelect}
              vitalMetric={module.vitalMetric}
              yieldSummary={module.yieldSummary}
              costSummary={module.costSummary}
            />
          ))}
        </div>

        {/* Subtitle / Telemetry Legend Footer inside Scene */}
        <div
          className="absolute bottom-2 left-3 right-3 z-[4] flex items-center justify-between text-[11px] text-text-muted/80 pointer-events-none px-2 py-1 rounded bg-space-deep/60 backdrop-blur-sm border border-border-subtle/50"
          aria-hidden="true"
        >
          <span className="font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric animate-pulse inline-block" />
            OUTPOST TELEMETRY NOMINAL
          </span>
          <span className="hidden sm:inline text-[10px] text-text-muted">
            Fictional Habitat Visualization • 4 Interactive Modules
          </span>
          {typeof actionsRemaining === 'number' && (
            <span className="font-mono text-cyan-electric font-semibold">
              {`Actions: ${actionsRemaining} / 2`}
            </span>
          )}
        </div>
      </div>

      {/* Accessible Mobile Facility Selector Strip (< 640px and high-accessibility fallback, hidden on lg desktop where direct hotspots are used) */}
      {showMobileSelector && (
        <nav
          aria-label="Facility Selector Quick Bar"
          className="lunar-mobile-strip w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 lg:hidden"
        >
          {modules.map((module) => {
            const isSelected = selectedModuleId === module.id;
            return (
              <button
                key={`mobile-${module.id}`}
                type="button"
                id={`mobile-tab-${module.id}`}
                aria-label={`Select ${module.name} (${module.subsystem})`}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => handleSelect(module.id)}
                className={`lunar-mobile-tab-btn min-h-[48px] flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-panel-surface border-cyan-electric text-cyan-electric shadow-[0_0_12px_rgba(96,229,244,0.3)]'
                    : 'bg-lunar-navy border-border-subtle text-moon-white hover:border-cyan-electric/50 hover:bg-panel-surface'
                } ${disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-base" aria-hidden="true">
                  {module.shortIcon}
                </span>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="font-display uppercase tracking-wider text-[11px] truncate">
                    {module.displayLabel}
                  </span>
                  <span className="text-[10px] text-text-muted truncate font-normal">
                    {module.yieldSummary.split('/')[0].trim()}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      )}
    </section>
  );
}

