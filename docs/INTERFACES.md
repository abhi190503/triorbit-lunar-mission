# TriOrbit Lunar Survival Simulator — Shared Interface Contracts

> **Task ID:** TRI-003  
> **Status:** FROZEN & VERIFIED  
> **Phase:** PREP / ARCHITECTURE  
> **Primary Owner:** Vibhushan Ganeshan (`@Vibhushan-2003`)  
> **Independent Reviewer:** Abhinaya Jeyakumar (`@abhi190503`)  
> **Science & Content Lead:** Nirsanth A. (`@nirsanth23`)  
> **Challenge:** NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer  
> **Integration Target:** `develop` (via `work/vibhushan-engine`)  

---

## 1. Overview & Architectural Boundaries

This document defines the canonical TypeScript data models, state types, pure engine function signatures, and API response contracts for the TriOrbit Lunar Survival Simulator.

To ensure non-blocking parallel development across our three workstreams:
- **Vibhushan (`work/vibhushan-engine`):** Owns `src/lib/game/*` (canonical contracts, pure engine, scoring, and unit tests).
- **Abhinaya (`work/abhinaya-ui`):** Owns UI scenes, layout, HUD, and hotspot interactions. Consumes `GameState` as read-only props and invokes dispatch callbacks.
- **Nirsanth (`work/nirsanth-science`):** Owns the server route `GET /api/nasa/events`, scenario definitions in `src/data/scenarios.json`, and standalone educational modal/drawer components.

All three lanes code against the frozen types below. **No alternative GameState schemas, duplicate type definitions, or competing game reducers may be introduced.**

---

## 2. Canonical TypeScript Types

```typescript
/**
 * The 5 normalized life-support resources monitored in the lunar habitat.
 * All values are integer game points strictly bounded between [0, 100].
 */
export type ResourceKey = 'oxygen' | 'power' | 'water' | 'food' | 'radiationRisk';

/**
 * Normalized resource state object.
 * Values represent educational game assumptions, not physical SI units or measured Sieverts.
 */
export type ResourceState = Record<ResourceKey, number>;

/**
 * Game turn phase within a simulated day:
 * - 'briefing': Day 1 orientation or morning review.
 * - 'event': Active scenario / space weather dilemma awaiting commander decision.
 * - 'choose': Habitat maintenance phase where commander executes daily actions.
 * - 'result': Terminal state (Mission Accomplished or Mission Aborted).
 */
export type MissionPhase = 'briefing' | 'event' | 'choose' | 'result';

/**
 * Overall mission status:
 * - 'active': Mission currently in progress (Days 1–5).
 * - 'success': Day 5 safely completed with all vitals > 0 and Radiation Risk < 100.
 * - 'failure': One or more vital vitals reached 0 or Radiation Risk reached 100.
 */
export type Outcome = 'active' | 'success' | 'failure';

/**
 * Identifier for the 5 habitat maintenance actions.
 */
export type ActionId =
  | 'generate-oxygen'
  | 'maintain-solar'
  | 'recycle-water'
  | 'operate-greenhouse'
  | 'reinforce-shelter';

/**
 * NASA Space Weather observation record (from NASA DONKI Open API).
 * Historical metadata, not a direct measurement of lunar surface dose.
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
 * A decision option presented during a mission scenario.
 */
export interface GameEventChoice {
  id: string;
  label: string;
  effect: Partial<Record<ResourceKey, number>>;
  explanation: string;
  isMistake?: boolean;
}

/**
 * A scheduled daily dilemma (Day 2, 3, or 4).
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
 * Historical log entry recorded after every state modification.
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
 * Canonical immutable simulation state.
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
```

---

## 3. Pure Simulation Engine Function Contracts

The game simulation engine is a **pure, side-effect-free functional state machine**. Functions never mutate their arguments in-place; they return a fresh, deeply immutable `GameState`.

### 1. `createInitialMission`

```typescript
function createInitialMission(): GameState;
```
- **Description:** Initializes a fresh mission state on Day 1 morning.
- **Initial Values:**
  - `day`: `1`
  - `phase`: `'briefing'`
  - `actionsRemaining`: `2`
  - `resources`: `{ oxygen: 75, power: 70, water: 75, food: 70, radiationRisk: 10 }`
  - `currentScenarioId`: `undefined`
  - `emergencyMistakes`: `0`
  - `outcome`: `'active'`
  - `history`: `[]`
- **Invariants:** Independent state instantiation; no shared references with previous playthroughs.

---

### 2. `applyAction`

```typescript
function applyAction(state: GameState, actionId: ActionId): GameState;
```
- **Preconditions:**
  - `state.outcome === 'active'`
  - `state.phase === 'choose'`
  - `state.actionsRemaining > 0`
  - Current resources must satisfy all action costs:
    - `generate-oxygen`: `power >= 8 && water >= 6`
    - `recycle-water`: `power >= 7`
    - `operate-greenhouse`: `water >= 9 && power >= 6`
    - `reinforce-shelter`: `power >= 7`
- **Postconditions:**
  - Deducts resource costs and applies yields.
  - Clamps all resources to $[0, 100]$.
  - Decrements `actionsRemaining` by $1$.
  - Appends record to `history`.
  - If any vital drops $\le 0$ or Radiation Risk $\ge 100$, sets `outcome: 'failure'` and `phase: 'result'`.
- **Error Handling:** If preconditions are not met, returns the existing state unchanged (idempotent rejection).

---

### 3. `applyEventChoice`

```typescript
function applyEventChoice(state: GameState, scenarioId: string, choiceId: string): GameState;
```
- **Preconditions:**
  - `state.outcome === 'active'`
  - `state.phase === 'event'`
  - `scenarioId` matches current active scenario.
  - `choiceId` exists within the scenario's choices.
- **Postconditions:**
  - Applies choice effect deltas to `resources`.
  - Clamps all resources to $[0, 100]$.
  - If `choice.isMistake === true`, increments `emergencyMistakes` by $+1$.
  - Appends record to `history`.
  - If any vital drops $\le 0$ or Radiation Risk $\ge 100$, sets `outcome: 'failure'` and `phase: 'result'`.
  - Otherwise, transitions `phase` to `'choose'` (enabling the commander to take daily maintenance actions).
- **Error Handling:** If called when `phase !== 'event'` or on invalid IDs, returns existing state unchanged.

---

### 4. `finishDay`

```typescript
function finishDay(state: GameState): GameState;
```
- **Preconditions:**
  - `state.outcome === 'active'`
  - Can be invoked when `actionsRemaining === 0` OR as an early finish when `actionsRemaining > 0`.
- **Postconditions:**
  - Applies baseline daily consumption:
    - Oxygen: $-16$
    - Power: $-14$
    - Water: $-14$
    - Food: $-14$
    - Radiation Risk: $0$
  - Clamps all resources to $[0, 100]$.
  - Appends drain record to `history`.
  - **Check Failure:** If any vital $\le 0$ or Radiation Risk $\ge 100$, sets `outcome: 'failure'` and `phase: 'result'`.
  - **Check Victory:** If not failed and `state.day === 5`, sets `outcome: 'success'` and `phase: 'result'`.
  - **Advance Day:** If not failed and `state.day < 5`:
    - `day = state.day + 1`
    - `actionsRemaining = 2`
    - If next day has a scenario (Days 2, 3, 4), sets `phase: 'event'` and `currentScenarioId = scheduledId`.
    - Otherwise (Day 5), sets `phase: 'choose'` and `currentScenarioId = undefined`.
- **Error Handling:** If called on an already completed/aborted mission (`outcome !== 'active'`), returns state unchanged.

---

### 5. `scoreMission`

```typescript
function scoreMission(state: GameState): number;
```
- **Description:** Calculates the final mission score.
- **Formula:**
  $$\text{score} = \text{clamp}\left(0, 1000, \text{round}\left(500 + \frac{O_2 + P + W + F}{4} - \text{Radiation Risk} - 25 \times \text{emergencyMistakes}\right)\right)$$
- **Return Value:** Integer between $0$ and $1000$.
- **Idempotency:** Calling multiple times on the same state yields the identical score.

---

## 4. Backend API Route Contract

### `GET /api/nasa/events`

The Next.js Route Handler retrieves space weather event metadata. It parses live NASA DONKI data when available, and seamlessly serves verified offline fixtures when offline or rate-limited.

```typescript
export interface NASAEventsResponse {
  events: NASAEvent[];
  provenance: 'live' | 'verified-fallback';
  retrievedAt: string;
  caution: string;
}
```

#### Response Properties:
- `events`: Array of verified `NASAEvent` items.
- `provenance`: Explicit flag indicating whether records were fetched live from NASA APIs or loaded from the validated offline fixture (`verified-events.json`).
- `retrievedAt`: ISO 8601 UTC timestamp of data retrieval.
- `caution`: Mandatory scientific disclaimer: *"NASA DONKI records interplanetary space weather observations; they do not represent biological radiation absorption on the lunar surface."*

#### Security & Route Rules:
- **Server-Only API Key:** `NASA_API_KEY` is read strictly on the server from environment variables.
- **Never Client-Exposed:** Never prefix with `NEXT_PUBLIC_` and never pass keys to the browser.
- **Fail-Safe Fallback:** The Route Handler must catch upstream NASA API errors, timeouts, and rate limits ($429$), immediately returning HTTP $200$ with `provenance: 'verified-fallback'`. The client UI never crashes due to upstream API unavailability.

---

## 5. UI Component Interaction Contracts (Props & Callbacks)

Abhinaya's UI components interact with the simulation state through standard React props:

### Mission Screen / HUD:
```typescript
export interface MissionHUDProps {
  day: number;
  phase: MissionPhase;
  actionsRemaining: number;
  resources: ResourceState;
  outcome: Outcome;
  onFinishDay: () => void;
}
```

### Action / Hotspot Drawer:
```typescript
export interface ActionPanelProps {
  actionsRemaining: number;
  resources: ResourceState;
  disabled: boolean;
  onSelectAction: (actionId: ActionId) => void;
}
```

### Space Weather / Scenario Modal:
```typescript
export interface EventModalProps {
  scenario: GameScenario;
  onSelectChoice: (choiceId: string) => void;
  open: boolean;
}
```

### Results Screen:
```typescript
export interface ResultsScreenProps {
  outcome: Outcome;
  day: number;
  resources: ResourceState;
  score: number;
  history: HistoryRecord[];
  onRestart: () => void;
}
```

---

## 6. Verification and Compliance Checklist

- [x] All 5 normalized resources bounded strictly $[0, 100]$.
- [x] Maintenance actions and daily drain match `docs/GAME_RULES.md` exactly.
- [x] Clear scientific honesty disclaimer on all NASA data representations.
- [x] Immutable pure functions with deterministic outputs.
- [x] Strict non-overlapping file ownership preserved.
