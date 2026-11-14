# Shared Interface Agreement (proposal for TRI-007; not implemented)

```ts
type ResourceKey = 'oxygen'|'power'|'water'|'food'|'radiationRisk';
type ResourceState = Record<ResourceKey, number>; // normalized GAME points, not physical SI units
type MissionPhase = 'briefing'|'event'|'choose'|'result';
type Outcome = 'active'|'success'|'failure';
type ActionId = 'generate-oxygen'|'maintain-solar'|'recycle-water'|'operate-greenhouse'|'reinforce-shelter';
interface NASAEvent { id: string; type: 'FLR'|'SEP'; occurredAt: string; title: string; sourceUrl: string; classType?: string; source: 'NASA DONKI'; }
interface GameEventChoice { id: string; label: string; effect: Partial<Record<ResourceKey, number>>; explanation: string; }
interface GameScenario { id: string; day: number; title: string; description: string; sourceKind: 'NASA-observation'|'educational-simulation'; source?: NASAEvent; choices: GameEventChoice[]; }
interface HistoryRecord { day: number; actionId?: ActionId; scenarioId?: string; choiceId?: string; after: ResourceState; }
interface GameState { day: number; phase: MissionPhase; actionsRemaining: number; resources: ResourceState; currentScenarioId?: string; outcome: Outcome; history: HistoryRecord[]; }
```

Backend response: `GET /api/nasa/events` -> `{ events: NASAEvent[], provenance: 'live'|'verified-fallback', retrievedAt: string, caution: string }` with valid HTTP status and traceable source links. On provider failure, return fallback with `provenance:'verified-fallback'`. Never return empty fictional source-labeled data as NASA.

UI consumes only GameState and callbacks. The engine is immutable/pure. API route may use server-only environment `NASA_API_KEY`, never `NEXT_PUBLIC_NASA_API_KEY` or public secrets.

For task owners, fields and filenames are suggestions approved by TRI-007; if implementation changes any exported interface, update this doc and notify impacted tasks before merge.
