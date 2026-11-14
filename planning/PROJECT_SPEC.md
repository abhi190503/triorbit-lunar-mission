# Frozen Product Requirements - TriOrbit Lunar Survival Simulator

## Product promise
For ages ~7–12, help a young learner act as commander of a lunar habitat for five simulated days. They discover the trade-offs among oxygen, power, water, food and radiation protection. The player sees immediate consequences and linked NASA science context, rather than only reading a quiz or watching a video.

## Four visible screens
1. **Landing / 30-second tutorial:** Cinematic original Moon base, mission objective, Start.
2. **Mission screen:** Original 2.5D inline SVG lunar environment, 4 hotspots (life support, solar power, greenhouse, shelter), source-aware event alert, resource HUD and remaining action count.
3. **Science drawer (within mission):** Accessible young-audience explanation of NASA observation vs simplified game assumption, with link.
4. **Results / replay:** Win or loss, day reached, score, real decisions and learning points; Start Again.

## Functional non-negotiables
- One Moon base; three fictional astronauts (no personal identities); five days; two selectable system actions per day; four hotspots; at least three bounded event definitions (the solar event must be linked to a real NASA DONKI record).
- Resource changes calculated by typed deterministic pure functions; no hardcoded dashboard-only animation; choices cannot be unlimited.
- At least one `GET /api/nasa/events` route on Next.js server. NASA key lives server-side only; validate response; timeout; fallback to a verified citation-carrying fixture. The game must run even if internet is unavailable during pitch.
- No live user database. State in React reducer; no login; optional save later.
- A real NASA resource from this challenge's Resources tab materially informs a scenario and source information is visible.
- Scientific honesty: DONKI event does NOT directly imply astronaut dose on Moon; numerical effects are explicitly labeled educational game units.
- The design must feel like a game environment, not a generic rectangular-card admin dashboard. Responsive, original SVG, clear contrast, keyboard accessible controls.

## Architecture
`src/app/page.tsx` -> game state/reducer -> `src/lib/game/{types,engine,progression}` -> `src/components/game/*`
`GET /api/nasa/events` (Next.js Route Handler) -> `src/lib/nasa/donki.ts` -> NASA public DONKI API; normalized/validated data -> verified fallback in `src/data/nasa/verified-events.json`.
Static science content and non-NASA simulated educational scenarios in `src/data/`.

## Folder contract (create after 9am)
```text
src/
  app/{page.tsx,layout.tsx,globals.css,api/nasa/events/route.ts}
  components/game/{LandingScreen,MissionScreen,LunarBaseScene,MissionHUD,ActionPanel,EventModal,ScienceDrawer,ResultsScreen}.tsx
  lib/game/{types,contracts,constants,engine,progression,scoring,events}.ts
  lib/nasa/donki.ts
  data/{scenarios,science-facts}.ts
  data/nasa/verified-events.json
  hooks/useMission.ts
  styles/lunar-scene.css

docs/{PROJECT_SPEC,GAME_RULES,INTERFACES,SCIENCE_SOURCES,ASSUMPTIONS,ATTRIBUTION,GITHUB_WORKFLOW}.md
submission/{DEMO_SCRIPT,PROJECT_DESCRIPTION,PITCH_SCRIPT,QA_PREP,SUBMISSION_CHECKLIST}.md
```
No owner duplicates canonical engine types in feature files. File ownership not a strict prohibition on reviewed integration changes; ask before editing another feature's active files.

## Acceptance gate
Fresh clone -> install -> `npm run dev` -> Start -> two actions -> day advances and event choice -> NASA explanation -> remaining days -> result -> replay. Try at least one failure route; test a true live DONKI response when available and known-verified fallback when API fails.

## Scope exclusions
No full 3D, accounts, cloud database, real-time radiation-dose calculation, fragile complex auth, telemetry, chat bot, multi-level story, paid assets or NASA logo editing.
