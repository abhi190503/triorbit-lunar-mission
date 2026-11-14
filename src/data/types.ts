/**
 * TriOrbit — Lunar Survival Simulator
 * Development Mock Fixtures & Shared Data Types
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-007 (Derived from frozen docs/INTERFACES.md & docs/SCIENCE_SOURCES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 *
 * NOTE: All data here are DEVELOPMENT FIXTURES for UI/API mock testing.
 * Historical NASA DONKI records cite authentic spacecraft observations,
 * but do NOT represent biological radiation absorption on the lunar surface.
 */

import type {
  GameScenario,
  GameState,
  NASAEvent,
  NASAEventsResponse,
  ResourceState,
} from '../lib/game/types';

// Re-export canonical game types so data consumers have a unified import surface
export type * from '../lib/game/types';

// ============================================================================
// TYPED MOCK RESOURCE STATES
// ============================================================================

export const MOCK_RESOURCE_STATES: Readonly<Record<string, ResourceState>> = {
  initial: {
    oxygen: 75,
    power: 70,
    water: 75,
    food: 70,
    radiationRisk: 10,
  },
  critical: {
    oxygen: 18,
    power: 15,
    water: 22,
    food: 19,
    radiationRisk: 75,
  },
  depleted: {
    oxygen: 0,
    power: 0,
    water: 5,
    food: 12,
    radiationRisk: 85,
  },
  maximum: {
    oxygen: 100,
    power: 100,
    water: 100,
    food: 100,
    radiationRisk: 0,
  },
} as const;

// ============================================================================
// TYPED VERIFIED NASA EVENT FIXTURE (HISTORICAL OBSERVATION)
// Sourced from authentic STEREO A observation record in docs/SCIENCE_SOURCES.md
// ============================================================================

export const MOCK_VERIFIED_NASA_EVENT: Readonly<NASAEvent> = {
  id: '2024-05-11T04:07:00-SEP-001',
  type: 'SEP',
  occurredAt: '2024-05-11T04:07Z',
  title: 'STEREO A Solar Energetic Particle Event',
  sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1',
  classType: 'Flux threshold exceeded (13–100 MeV)',
  source: 'NASA DONKI',
} as const;

// ============================================================================
// TYPED ROUTE HANDLER RESPONSE FIXTURE
// ============================================================================

export const MOCK_NASA_API_RESPONSE: Readonly<NASAEventsResponse> = {
  events: [MOCK_VERIFIED_NASA_EVENT],
  provenance: 'verified-fallback',
  retrievedAt: '2026-11-14T00:00:00.000Z',
  caution:
    'NASA DONKI records interplanetary space weather observations; they do not represent biological radiation absorption on the lunar surface.',
} as const;

// ============================================================================
// TYPED DEVELOPMENT SCENARIOS FIXTURE (DAYS 2, 3, 4)
// Educational simulations for mock UI testing prior to TRI-011 integration
// ============================================================================

export const MOCK_SCENARIOS: Readonly<GameScenario[]> = [
  {
    id: 'scenario-day-2-solar',
    day: 2,
    title: 'Space Weather Alert: Solar Energetic Particle Event',
    description:
      'Mission Control relays a real historical NASA DONKI observation. A high-energy particle storm from the Sun is crossing interplanetary space. How should the habitat respond?',
    sourceKind: 'NASA-observation',
    source: MOCK_VERIFIED_NASA_EVENT,
    choices: [
      {
        id: 'choice-shelter-bunker',
        label: 'Shelter Crew in Lunar Regolith Bunker',
        effect: { power: -5, radiationRisk: 5 },
        explanation:
          'Dense regolith berms absorb incoming particle flux, but bunker life-support pumps draw emergency reserve battery power.',
      },
      {
        id: 'choice-active-shielding',
        label: 'Deploy Magnetic Habitat Deflectors',
        effect: { power: -10, radiationRisk: 10 },
        explanation:
          'High-power electromagnetic coils deflect charged particles, protecting living quarters at significant electrical cost.',
      },
      {
        id: 'choice-unshielded-eva',
        label: 'Conduct Surface Operations Unshielded (Hazardous)',
        effect: { radiationRisk: 25 },
        explanation:
          'Ignoring space weather alerts exposes astronauts to elevated solar radiation risk without habitat protection.',
        isMistake: true,
      },
    ],
  },
  {
    id: 'scenario-day-3-power',
    day: 3,
    title: 'Habitat Anomaly: Electrical Grid Fluctuation',
    description:
      'Thermal expansion in the main battery bus has tripped a primary breaker. Power delivery to subsystems is fluctuating.',
    sourceKind: 'educational-simulation',
    choices: [
      {
        id: 'choice-auxiliary-batteries',
        label: 'Reroute Power Through Auxiliary Battery Reserves',
        effect: { power: -8 },
        explanation:
          'Switching to secondary reserves stabilizes the life-support grid while consuming buffer capacity.',
      },
      {
        id: 'choice-shed-greenhouse',
        label: 'Shed Hydroponic Lighting & Temperature Load',
        effect: { power: -4, food: -5 },
        explanation:
          'Dimming greenhouse grow lights protects critical life support but temporarily stalls crop photosynthesis.',
      },
      {
        id: 'choice-overload-bus',
        label: 'Force Main Breaker Reset Under Load (Hazardous)',
        effect: { power: -18, oxygen: -5 },
        explanation:
          'Resetting overloaded circuits damages power conditioning units and disrupts oxygen generation.',
        isMistake: true,
      },
    ],
  },
  {
    id: 'scenario-day-4-water',
    day: 4,
    title: 'Habitat Anomaly: Hydroponics Irrigation Line Leak',
    description:
      'Sensors detect a pressure drop in the closed-loop water reclamation line supplying the hydroponic greenhouse.',
    sourceKind: 'educational-simulation',
    choices: [
      {
        id: 'choice-purge-valve',
        label: 'Isolate & Purge Faulty Irrigation Valve',
        effect: { water: -6 },
        explanation:
          'Purging the line prevents contamination but vents a small volume of recycled water reserves.',
      },
      {
        id: 'choice-low-pressure-loop',
        label: 'Engage Low-Pressure Closed-Loop Recycling',
        effect: { water: -4, power: -6 },
        explanation:
          'Running backup filtration pumps at reduced flow conserves water while drawing auxiliary power.',
      },
      {
        id: 'choice-ignore-leak',
        label: 'Ignore Pressure Warning as Sensor Glitch (Hazardous)',
        effect: { water: -14, food: -8 },
        explanation:
          'Allowing the leak to persist drenches subfloor insulation, wasting water and drying out seedling root beds.',
        isMistake: true,
      },
    ],
  },
] as const;

// ============================================================================
// TYPED GAME STATE FIXTURES
// ============================================================================

export const MOCK_INITIAL_GAME_STATE: Readonly<GameState> = {
  day: 1,
  phase: 'briefing',
  actionsRemaining: 2,
  resources: { ...MOCK_RESOURCE_STATES.initial },
  currentScenarioId: undefined,
  emergencyMistakes: 0,
  outcome: 'active',
  history: [],
} as const;

export const MOCK_MID_MISSION_GAME_STATE: Readonly<GameState> = {
  day: 2,
  phase: 'choose',
  actionsRemaining: 2,
  resources: {
    oxygen: 79,
    power: 63,
    water: 55,
    food: 56,
    radiationRisk: 15,
  },
  currentScenarioId: 'scenario-day-2-solar',
  emergencyMistakes: 0,
  outcome: 'active',
  history: [
    {
      day: 1,
      type: 'action',
      actionId: 'maintain-solar',
      after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 },
    },
    {
      day: 1,
      type: 'action',
      actionId: 'generate-oxygen',
      after: { oxygen: 95, power: 82, water: 69, food: 70, radiationRisk: 10 },
    },
    {
      day: 1,
      type: 'drain',
      after: { oxygen: 79, power: 68, water: 55, food: 56, radiationRisk: 10 },
    },
    {
      day: 2,
      type: 'event',
      scenarioId: 'scenario-day-2-solar',
      choiceId: 'choice-shelter-bunker',
      delta: { power: -5, radiationRisk: 5 },
      after: { oxygen: 79, power: 63, water: 55, food: 56, radiationRisk: 15 },
    },
  ],
} as const;

export const MOCK_CRITICAL_GAME_STATE: Readonly<GameState> = {
  day: 4,
  phase: 'choose',
  actionsRemaining: 1,
  resources: { ...MOCK_RESOURCE_STATES.critical },
  currentScenarioId: 'scenario-day-4-water',
  emergencyMistakes: 1,
  outcome: 'active',
  history: [],
} as const;

export const MOCK_VICTORIOUS_GAME_STATE: Readonly<GameState> = {
  day: 5,
  phase: 'result',
  actionsRemaining: 0,
  resources: {
    oxygen: 15,
    power: 26,
    water: 11,
    food: 34,
    radiationRisk: 0,
  },
  currentScenarioId: undefined,
  emergencyMistakes: 0,
  outcome: 'success',
  history: [],
} as const;

export const MOCK_FAILED_GAME_STATE: Readonly<GameState> = {
  day: 3,
  phase: 'result',
  actionsRemaining: 0,
  resources: { ...MOCK_RESOURCE_STATES.depleted },
  currentScenarioId: 'scenario-day-3-power',
  emergencyMistakes: 2,
  outcome: 'failure',
  history: [],
} as const;
