/**
 * TriOrbit — Lunar Survival Simulator
 * Canonical Game Types & Interface Contracts
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-007 (Derived from frozen docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

/**
 * The 5 normalized life-support resources monitored in the lunar habitat.
 * All values represent integer educational game points strictly bounded in [0, 100].
 */
export type ResourceKey = 'oxygen' | 'power' | 'water' | 'food' | 'radiationRisk';

/**
 * Normalized resource state mapping each vital to its current game-point level.
 * Values represent pedagogical assumptions, NOT physical SI units or measured Sieverts.
 */
export type ResourceState = Record<ResourceKey, number>;

/**
 * Game turn phase within a simulated lunar mission day:
 * - 'briefing': Day 1 orientation or morning mission status.
 * - 'event': Active scenario / space weather dilemma awaiting commander decision.
 * - 'choose': Habitat maintenance phase where commander executes daily actions.
 * - 'result': Terminal state reached (Mission Accomplished or Mission Aborted).
 */
export type MissionPhase = 'briefing' | 'event' | 'choose' | 'result';

/**
 * Overall mission outcome:
 * - 'active': Mission currently in progress (Days 1–5).
 * - 'success': Day 5 safely completed with all vitals > 0 and Radiation Risk < 100.
 * - 'failure': One or more vital vitals reached 0 or Radiation Risk reached 100.
 */
export type Outcome = 'active' | 'success' | 'failure';

/**
 * Identifiers for the 5 interactive habitat maintenance actions.
 */
export type ActionId =
  | 'generate-oxygen'
  | 'maintain-solar'
  | 'recycle-water'
  | 'operate-greenhouse'
  | 'reinforce-shelter';

/**
 * NASA Space Weather observation record (from NASA DONKI Open API).
 * Historical metadata from space-based observations, not a direct measurement
 * of lunar astronaut radiation dose.
 */
export interface NASAEvent {
  id: string;
  type: 'FLR' | 'SEP';
  occurredAt: string;
  title: string;
  sourceUrl: string;
  classType?: string;
  source: 'NASA DONKI';
}

/**
 * A decision option presented during a mission scenario dilemma.
 */
export interface GameEventChoice {
  id: string;
  label: string;
  effect: Partial<Record<ResourceKey, number>>;
  explanation: string;
  isMistake?: boolean;
}

/**
 * A scheduled daily dilemma (occurring on Days 2, 3, or 4).
 */
export interface GameScenario {
  id: string;
  day: number;
  title: string;
  description: string;
  sourceKind: 'NASA-observation' | 'educational-simulation';
  source?: NASAEvent;
  choices: GameEventChoice[];
}

/**
 * Immutable historical log entry recorded after every state modification.
 */
export interface HistoryRecord {
  day: number;
  type: 'action' | 'event' | 'drain';
  actionId?: ActionId;
  scenarioId?: string;
  choiceId?: string;
  delta?: Partial<Record<ResourceKey, number>>;
  after: ResourceState;
  timestamp?: string;
}

/**
 * Canonical immutable simulation state for TriOrbit.
 */
export interface GameState {
  day: number;
  phase: MissionPhase;
  actionsRemaining: number;
  resources: ResourceState;
  currentScenarioId?: string;
  emergencyMistakes: number;
  outcome: Outcome;
  history: HistoryRecord[];
}

/**
 * Standard response shape for the Next.js Route Handler GET /api/nasa/events.
 */
export interface NASAEventsResponse {
  events: NASAEvent[];
  provenance: 'live' | 'verified-fallback';
  retrievedAt: string;
  caution: string;
}

/**
 * UI Component Contract: Mission HUD Props
 */
export interface MissionHUDProps {
  day: number;
  phase: MissionPhase;
  actionsRemaining: number;
  resources: ResourceState;
  outcome: Outcome;
  onFinishDay: () => void;
}

/**
 * UI Component Contract: Action Panel / Hotspot Drawer Props
 */
export interface ActionPanelProps {
  actionsRemaining: number;
  resources: ResourceState;
  disabled: boolean;
  onSelectAction: (actionId: ActionId) => void;
}

/**
 * UI Component Contract: Space Weather / Scenario Modal Props
 */
export interface EventModalProps {
  scenario: GameScenario;
  onSelectChoice: (choiceId: string) => void;
  open: boolean;
}

/**
 * UI Component Contract: Mission Results Screen Props
 */
export interface ResultsScreenProps {
  outcome: Outcome;
  day: number;
  resources: ResourceState;
  score: number;
  history: HistoryRecord[];
  onRestart: () => void;
}
