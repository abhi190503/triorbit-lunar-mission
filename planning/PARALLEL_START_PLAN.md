# TRI-ORBIT: Parallel-first Saturday execution plan

**Version:** 14 Nov 2026 planning revision (prepared before the hackathon); no competition code created by this document.

## Decision: Abhinaya starts immediately
Abhinaya owns the verified repository/bootstrap step `TRI-006` at/after **09:00 Asia/Colombo**. She does **not** have to wait for someone to create the repo. She then codes the original lunar game UI with display props while Vibhushan and Nirsanth build independent modules. No one generates an alternative project root.

## Shared single source of truth
- Official challenge: Build a Junior Astronaut Mission Trainer (NASA Space Apps 2026).
- App: Next.js App Router + React/TypeScript, Tailwind; one backend Route Handler `GET /api/nasa/events` with verified DONKI fallback; no DB or Java backend.
- Scope: five simulated days, two maintenance actions/day, oxygen/power/water/food/radiationRisk game points, one real NASA-sourced solar scenario and two declared fictional events, clickable modules, short science panel, win/loss/replay.
- **Real NASA event metadata** is a historical cited observation. The game risk/resource effects are educational assumptions, not measured lunar dose.
- Visual: original cinematic 2.5D SVG, not generic cards; younger learner readable; accessible touch/keyboard.
- Sign-off docs already supplied tonight: `PROJECT_SPEC.md`, `INTERFACES.md`, `GAME_RULES.md`, `SCIENCE_PROTOCOL.md`; **read-only until team-approved change**.

## Concurrent lanes and ownership

### Abhinaya — independent UI/Bootstrap lane (`work/abhinaya-ui`)
- At 09:00, verify account, scaffold app, publish `main` and `develop`, create issues and board (`TRI-006`). **Immediately share repository URL + exact base commit SHA**. Board creation can follow; it must not block UI coding.
- `TRI-012`: own design system and game shell.
- `TRI-013`: landing/tutorial.
- `TRI-014`: original interactive lunar SVG with accessible hotspots.
- `TRI-015`: HUD with *display-only props* and temporary fixture values; she does **not** wait for canonical engine.
- Owns `src/app` base pages and shared visual files; no other agent should silently overwrite them. She reviews integration at `TRI-016` and `TRI-020`.

### Vibhushan — independent engine lane (`work/vibhushan-engine`)
- Before repo URL is shared, review existing `INTERFACES.md` and `GAME_RULES.md`, write planned validation cases (planning-only).
- After clone: `TRI-007` canonical exported interfaces -> `TRI-008` pure engine -> `TRI-009` day/score/outcome logic.
- Do NOT touch Abhinaya's scene, CSS, landing or HUD until the approved integration branch.
- After three lanes have usable PRs: `TRI-016` wires real engine callbacks to scene and HUD; `TRI-020` integrates mission page, event/learn/results, NASA fetch and fallback.

### Nirsanth — independent NASA/content/QA lane (`work/nirsanth-science`)
- Before repo URL: verify NASA DONKI source fields, event facts, caution language and citations (research only).
- After clone: `TRI-010` backend NASA integration using frozen response contract without importing unfinished engine -> `TRI-011` JSON scenario content -> `TRI-017` standalone event modal -> `TRI-018` standalone science panel -> `TRI-019` results UI with display-only props.
- Own server API, sources, scenario files and education/results components; do not change Abhinaya's app shell or Vibhushan's game engine.
- After integration: `TRI-021` independent smoke and negative-path tests, and Sunday science audit/demo README.

## Exact minimal integration contracts
- A single canonical GameState/type set is implemented by Vibhushan. It is **specified tonight in INTERFACES.md**, not guessed by UI agents.
- Abhinaya UI accepts `props + callbacks` and uses local fixture data for display only; no duplicate engine state module.
- Nirsanth NASA endpoint returns `{events: NASAEvent[], provenance:'live'|'verified-fallback', retrievedAt:string, caution:string}`. Server raw NASA response parsed/validated; no client secrets.
- Nirsanth scenario JSON references event IDs and has explicit educational caveats; Vibhushan's engine consumes normalized scenario data during integration.
- End-to-end playable code, not a screenshot-only UI, is required before pitching.

## Approximate Saturday sequence (targets, not guarantees)
| Time | Abhinaya | Vibhushan | Nirsanth |
|---|---|---|---|
| 09:00-09:30 | TRI-006 scaffold + publish repo | Review contract/test cases; clone once URL is ready | Validate NASA sources; clone once URL is ready |
| 09:30-12:30 | TRI-012, TRI-013, start TRI-014 | TRI-007, TRI-008 | TRI-010, TRI-011 |
| 12:30-15:30 | Finish TRI-014, TRI-015 | TRI-009; engine unit checks | TRI-017, TRI-018, TRI-019 |
| 15:30-17:30 | Grouped UI PR, review fixes | Grouped engine PR; begin TRI-016 | Grouped science PR; prepare TRI-021 cases |
| 17:30-19:00 | UI smoke, feedback, snapshots | TRI-016, TRI-020 integration | TRI-021 smoke tests once candidate ready |
| 19:00-21:00 | Fix UI blockers only; stable demo rehearsal | Stabilize main; test NASA fallback | Retest fixes; evidence and sources |

## Avoiding false dependencies
- **No cross-member blocker for Abhinaya's Saturday UI lane.** Her only direct prereqs are her own planning/scaffold tasks.
- Only the initial repo URL blocks cloning for teammates (typically short). They must not start competing scaffolds.
- Missing backend does not block UI; UI must not fake backend success in final demo.
- Missing engine does not block standalone UI; typed local fixtures must be removed from final gameplay wiring.
- If `gh project` permissions fail, **use Issues + labels** and finish board later.
- Use three workstream branches rather than forcing 31 separate PRs in a day. Keep one small commit per task ID and create at most 3 workstream PRs plus integration PR. Actual GitHub issue IDs are separate from TRI IDs. Mark tasks Done only after verified merge.

## Saturday success criteria
Complete full 5-day playable loop, all 4 clickable lunar modules, source-provenance NASA event with fallback, 2+ choices per event, explain actual vs assumed science, win/loss and replay, a pass for success/failure and API fallback. `main` must contain a tested working demo, not merely generated code.

## Sunday completion
Live 5-minute demo + 5-minute Q&A (Colombo virtual) and official NASA submission page with name, 50–200 word overview, details, NASA citations, external/AI-use disclosures, public GitHub/project link, **one** max-7-slide deck or 30-second subtitled video. Deployment optional.

## Absolutely not allowed
No actual competition project code before the official start; no second repo, duplicate types/engine, fabricated NASA records, NASA branding generation, passwords in code, major last-minute architecture expansion, destructive Git changes, or unreviewed direct pushes to stable main.
