/**
 * TriOrbit — Lunar Survival Simulator
 * Canonical Game Engine Constants & Scheduled Dilemmas
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-008 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import type { GameScenario } from './types';
import {
  ACTION_EFFECTS,
  DAILY_DRAIN,
  INITIAL_RESOURCES,
  MAX_ACTIONS_PER_DAY,
  RADIATION_ALERT_THRESHOLD,
  RESOURCE_MAX,
  RESOURCE_MIN,
  TOTAL_MISSION_DAYS,
  VITAL_CRITICAL_THRESHOLD,
} from './contracts';

// Re-export canonical constants from contracts for single-import convenience
export {
  ACTION_EFFECTS,
  DAILY_DRAIN,
  INITIAL_RESOURCES,
  MAX_ACTIONS_PER_DAY,
  RADIATION_ALERT_THRESHOLD,
  RESOURCE_MAX,
  RESOURCE_MIN,
  TOTAL_MISSION_DAYS,
  VITAL_CRITICAL_THRESHOLD,
};

/**
 * Scheduled scenario IDs by mission day.
 * - Day 1: Orientation & baseline operations (No dilemma).
 * - Day 2: Solar Energetic Particle event (NASA DONKI historical observation).
 * - Day 3: Electrical grid fluctuation (Fictional educational habitat anomaly).
 * - Day 4: Hydroponic irrigation line pressure drop (Fictional educational habitat anomaly).
 * - Day 5: Final survival rotation (No dilemma).
 */
export const SCHEDULED_SCENARIO_DAYS: Readonly<Record<number, string>> = {
  2: 'solar-activity',
  3: 'power-outage',
  4: 'greenhouse-water',
} as const;

/**
 * Default canonical scenarios for Days 2, 3, and 4.
 * Used by the pure engine when external scenarios are not injected.
 * Fictional game points represent educational assumptions (ages 7–12),
 * NOT measured lunar dosimetry or physical engineering rates.
 */
export const DEFAULT_SCENARIOS: Readonly<GameScenario[]> = [
  {
    id: 'solar-activity',
    day: 2,
    title: 'Solar Energetic Particle Warning',
    description:
      'Mission Control has received a space weather alert based on authentic NASA spacecraft observations. Energetic solar proton flux has been detected following an intense solar eruption. Commander, choose how to protect the crew and habitat.',
    sourceKind: 'NASA-observation',
    source: {
      id: '2024-05-11T04:07:00-SEP-001',
      type: 'SEP',
      occurredAt: '2024-05-11T04:07Z',
      title: 'STEREO A Solar Energetic Particle Event (13-100 MeV)',
      sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1',
      source: 'NASA DONKI',
    },
    choices: [
      {
        id: 'shelter-in-bunker',
        label: 'Shelter crew in shielded regolith bunker',
        effect: { power: -5, radiationRisk: 5 },
        explanation:
          'Moving the crew to the subsurface regolith bunker powers up storm shielding, absorbing the particle flux with minimal hazard increase.',
        isMistake: false,
      },
      {
        id: 'delay-shelter',
        label: 'Delay shelter to maintain external operations',
        effect: { radiationRisk: 15, power: 0 },
        explanation:
          'Leaving the crew in standard surface modules avoids auxiliary power draw but significantly elevates crew space weather radiation hazard.',
        isMistake: true,
      },
    ],
  },
  {
    id: 'power-outage',
    day: 3,
    title: 'Habitat Electrical Grid Fluctuation',
    description:
      'A thermal circuit breaker has tripped in the main power distribution substation. Voltage is fluctuating across life support modules. Commander, decide how to stabilize the habitat power grid.',
    sourceKind: 'educational-simulation',
    choices: [
      {
        id: 'reroute-aux-power',
        label: 'Reroute power through auxiliary battery banks',
        effect: { power: -8 },
        explanation:
          'Drawing controlled current from auxiliary reserve batteries safely stabilizes the grid with a manageable power reserve expenditure.',
        isMistake: false,
      },
      {
        id: 'bypass-safety-breaker',
        label: 'Force-reset and bypass safety breaker',
        effect: { power: -15, oxygen: -5 },
        explanation:
          'Bypassing safety switches causes electrical power surges that disrupt oxygen generation transformers and waste power reserves.',
        isMistake: true,
      },
    ],
  },
  {
    id: 'greenhouse-water',
    day: 4,
    title: 'Hydroponic Irrigation Line Emergency',
    description:
      'Sensors report an abrupt pressure drop in the Hydroponics Bay water loop. The irrigation manifold is clogged, threatening crop hydration. Commander, decide how to respond.',
    sourceKind: 'educational-simulation',
    choices: [
      {
        id: 'flush-irrigation-manifold',
        label: 'Flush irrigation lines with purified water reserve',
        effect: { water: -6 },
        explanation:
          'Flushing the irrigation lines consumes a modest amount of purified water to protect crops and maintain steady food production.',
        isMistake: false,
      },
      {
        id: 'restrict-crop-irrigation',
        label: 'Ration water flow and delay line servicing',
        effect: { food: -10, water: -2 },
        explanation:
          'Throttling water to the greenhouse starves the microgreens, causing crop loss and depleting future food stores.',
        isMistake: true,
      },
    ],
  },
] as const;
