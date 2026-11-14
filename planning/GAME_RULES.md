# Simulation Contract (proposed educational game rules; freeze via TRI-003)

These numerical effects are **fictional game-point coefficients for pedagogy**, not real consumption rates or lunar radiation measurements. A reviewer must approve them before implementation. No NASA measurement is made up.

- GameState: `day: 1..5`, `actionsRemaining: 2 | 1 | 0`, `phase: briefing | event | choose | result`, `resources: {oxygen,power,water,food,radiationRisk}` with every value bounded `0..100`, `history[]`, `currentEventId`, `outcome: active | success | failure`.
- Initial illustrative game points: oxygen 75, power 70, water 75, food 70, radiationRisk 10.
- At start of each day, a predetermined event can be shown (day 2 / day 3 / day 4). Event displays factual observation/caveat as applicable, then choices apply a typed effect. Each event choice is mandatory on that day and does **not** consume one of the two maintenance action slots. The player sees the consequences and then uses two maintenance actions.
- Two actions per day, each action consumes one slot. After two actions or explicit Finish Day, apply daily demand: oxygen -16, power -14, water -14, food -14. `radiationRisk` changes by events and shelter actions; no unsupported physical model.
- Proposed management actions:
  - `generate-oxygen`: oxygen +20, power -8, water -6.
  - `maintain-solar`: power +20; consumes an action; for solar weather event may incur abstract +5 risk if in exposed state (validate in event definition).
  - `recycle-water`: water +18, power -7.
  - `operate-greenhouse`: food +17, water -9, power -6.
  - `reinforce-shelter`: radiationRisk -18, power -7.
- Event types: `solar-activity` on day 2 (verified NASA DONKI historical FLR/SEP linked source; *not* a claimed Moon dose); `power-outage` on day 3 (fictional scenario); `greenhouse-water` on day 4 (fictional scenario). All consequences shown as game points. Every event offers at least two choices with a resource trade-off and clear educational explanation. Specific event-choice coefficients are defined in TRI-011 and reviewed for solvable game balance.
- Failure triggers after action/event/day settlement if oxygen/power/water/food <=0 OR radiationRisk >=100. The HUD should warn at <=20 essentials or >=70 radiationRisk.
- Success: finish day 5 without failure. Score: base 500 + remaining essential resources sum / 4 - radiationRisk - 25 for each explicit emergency mistake (clamp 0..1000). Display as **Game Score**, not real astronaut risk.
- No free unlimited action; `Finish Day` before using both actions is permitted but never gives extra slots. Restart completely resets event and state.

## Contract to implement
Pure functions: `createInitialMission(): GameState`, `applyAction(state, actionId): GameState`, `applyEventChoice(state, eventId, choiceId): GameState`, `finishDay(state): GameState`, `scoreMission(state): number`.
Next.js route returns a normalized `NASAEvent[]` independent of NASA raw response shape. Date/source id fields never omitted from sourced events. State reducer does not depend on API uptime: the demo uses bundled verified record when necessary.

## Difficulty balancing gate
Before merging TRI-008/009, prove with a small test script that the user can win AND lose using valid choices. With an illustrative sequence (daily drain as above; initial values as above), randomized action checks show both successful and failing paths **before final event-choice effects**, but the final event model still needs verification. If all playthroughs fail or all always succeed, rebalance within TRI-003's approved game assumptions; record the change, don't silently change numbers.
