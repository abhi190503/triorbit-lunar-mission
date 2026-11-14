# Frozen Product Requirements & Mission Scope — TriOrbit Lunar Survival Simulator

> **Task ID:** TRI-001  
> **Status:** FROZEN & APPROVED  
> **Challenge:** NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer  
> **Primary Owner:** Abhinaya Jeyakumar (`@abhi190503`)  
> **Independent Reviewer:** Vibhushan Ganeshan (`@Vibhushan-2003`)  
> **Science & QA Lead:** Nirsanth A. (`@nirsanth23`)  
> **Authorized Start:** 14 November 2026, 09:00 Asia/Colombo  

---

## 1. Product Promise & Target Audience

- **Target Audience:** Junior astronauts aged **7–12**, classrooms, and public science learners.
- **Product Promise:** Step into the role of Commander of a lunar surface habitat for a 5-day survival mission. Players actively balance critical life-support vitals (Oxygen, Power, Water, Food, Radiation Risk) against real space weather challenges informed by NASA observations.
- **Core Educational Value:** Demonstrates cause-and-effect in space resource management. Teaches the difference between historical space weather observations recorded by NASA spacecraft and calibrated educational game models, avoiding passive lectures or dry quiz cards.

---

## 2. Frozen Mission Loop & Core Mechanics

| Parameter | Frozen Specification | Details |
|---|---|---|
| **Mission Duration** | 5 Simulated Lunar Days | Day 1 through Day 5 sequential progression. |
| **Crew** | 3 Fictional Astronauts | Abstracted crew vitals; no personal identities. |
| **Player Action Budget** | 2 Actions per Day | Tactical choices before day concludes (total of 10 decisions per full run). |
| **Subsystem Hotspots** | 4 Interactive Base Modules | Life Support Habitat ($O_2$), Solar Array & Battery Station (Power), Hydroponics Bay (Food/Water), and Shielded Bunker (Radiation). |
| **Vital Resources** | 5 Normalized Metrics (0–100) | Oxygen ($O_2$), Power ($kW$), Water ($L$), Food ($kg$), Radiation Risk (Alert Level %). |
| **Survival Thresholds** | Vitals > 0, Radiation < 100 | Dropping any life vital to 0 or reaching 100% Radiation Risk triggers Mission Aborted. Surviving Day 5 yields Mission Accomplished. |
| **Events** | 3 Bounded Dilemmas | At least 1 real NASA DONKI Solar Energetic Particle (SEP) / Solar Flare event, plus 2 habitat anomalies (life-support leak, power grid fluctuation). |
| **Architecture** | Next.js App Router + React Reducer | Pure in-memory state; Next.js Route Handler for NASA data with verified offline fallback; no external database. |

---

## 3. Four Core Game Screens

1. **Landing & Mission Briefing (30-second quick start):**
   - Cinematic Moon base exterior introduction.
   - Clear, child-friendly mission goal: "Keep your crew safe for 5 days on the Moon!"
   - Single-click "Begin Mission" CTA and optional 3-bullet tutorial overlay.
2. **Interactive Mission Screen (2.5D SVG Lunar Base):**
   - Original, responsive 2.5D inline SVG base environment with 4 clickable subsystem modules.
   - Resource HUD showing real-time 0–100 vital gauges, day counter (Day X / 5), and actions remaining (2 / 2).
   - Hotspot selection drawer revealing module status, contextual actions, and cost/yield projections.
3. **Science Drawer & Space Weather Alert Modal:**
   - Pop-up alert for Day events requiring immediate player action.
   - Standalone educational drawer displaying real NASA DONKI spacecraft observation data (event ID, timestamp, instruments) alongside educational game-unit calibration notes.
   - Explicit scientific honesty disclosure.
4. **Mission Results & Replay Screen:**
   - Distinct Mission Success vs. Mission Aborted screens.
   - Final survival score, days survived, decision log, and key science takeaways.
   - One-click "Start Again" replay reset.

---

## 4. Explicit Non-Goals & Scope Exclusions

To safeguard hackathon delivery, the following features are strictly **OUT OF SCOPE**:

- ❌ **No 3D WebGL / Three.js:** Avoid heavy rendering, 3D asset downloads, and GPU compatibility issues. Original 2.5D vector SVG ensures instant loading and high accessibility.
- ❌ **No User Authentication / Accounts:** No login screens, OAuth, password reset, or personal tracking.
- ❌ **No Remote Cloud Databases:** No PostgreSQL, Supabase, Firebase, or DynamoDB. State is managed entirely in-memory via a React reducer.
- ❌ **No Physical Dosimetry Simulations:** No claims of calculating biological Sievert/Gray radiation absorption on the lunar regolith. All game impacts are calibrated educational units.
- ❌ **No AI Chatbots / Dynamic LLM Text Generation:** All game event narratives and science facts are deterministic, pre-authored, and validated.
- ❌ **No Unauthorized NASA Branding:** No generating, altering, or spoofing official NASA insignias or meatball logos.
- ❌ **No Complex Branching Storylines / Avatars:** Single focused 5-day mission loop.

---

## 5. Must-Have vs. Optional Features (Cut List & Priority Triage)

### Tier 1: Must-Have (P0 / Saturday MVP Core)
- Pure deterministic TypeScript simulation engine (`src/lib/game/`).
- 5 vital resources with bounded [0, 100] clamping and daily baseline drain.
- Next.js Route Handler `GET /api/nasa/events` with server-side API key handling, schema validation, and verified offline fixture fallback (`verified-events.json`).
- Original 2.5D inline SVG lunar base with 4 interactive hotspots.
- HUD displaying 5 vitals, current day, remaining action points, and system alerts.
- Event modal presenting decisions with clear trade-offs and instant feedback.
- Science drawer with verified NASA DONKI citations and educational disclaimers.
- Results screen with win/loss states and replay functionality.

### Tier 2: Contingency Drop Order (P1 / P2 Features)
If team falls behind schedule against the Saturday milestones, cut features in this strict order:
1. **TRI-031:** Expanded replay insights and extra scenarios (drop first; maintain standard single replay).
2. **TRI-024:** Local storage progress persistence (drop second; in-memory React state is fully sufficient).
3. **TRI-030:** Vercel cloud deployment (drop third; local `npm run dev` presentation satisfies all judging requirements).
4. **TRI-023:** Advanced micro-animations and particle effects (drop fourth; keep clean, accessible static SVG).
5. **TRI-022:** Secondary mobile touch polish (drop fifth; maintain primary desktop/tablet layout).
6. **Event Modal Consolidation:** If separate event UIs take too long, use one reusable generic event modal.
7. **Auxiliary Science Cards:** Reduce extra educational popups to core DONKI citation.

### Absolute Non-Negotiables (Never Cut):
- Real NASA DONKI data source citations and provenance.
- Clear educational distinction between spacecraft observation and game units.
- Deterministic simulation rules and win/loss verification.
- Offline verified fallback fixture.
- Playable 5-day cycle with replay reset.

---

## 6. Timebox Hard Gates & Triage Schedule (Saturday, Nov 14)

- **13:00 Hard Gate:** NASA route OR validated local factual fixture functional; pure engine contracts verified; initial lunar scene layout rendered.
  - *Triage:* Simplify visual scene styling if behind; keep all 4 module hotspots clickable.
- **16:00 Hard Gate:** First playable vertical slice (Day 1 action loop and 1 event).
  - *Triage:* Shrink onboarding tutorial to single overlay card; eliminate secondary views.
- **19:00 Hard Gate:** Feature Freeze. 5-day end-to-end playable path complete.
  - *Triage:* Stop new UI features immediately; collapse events to 2 if needed with documented note.
- **21:00 Hard Gate:** Stable tested build lock.
  - *Triage:* Zero new dependencies, zero refactors. Bug fixes, demo capture, and presentation rehearsal only.

---

## 7. Parallel Workstream File Boundaries

| Member | Workstream Branch | Owned Directory Boundaries |
|---|---|---|
| **Abhinaya Jeyakumar** | `work/abhinaya-ui` | `src/app/{layout,page,globals}.tsx`, `src/components/game/{LandingScreen,MissionScreen,LunarBaseScene,MissionHUD,ActionPanel}.tsx`, `src/styles/*` |
| **Vibhushan Ganeshan** | `work/vibhushan-engine` | `src/lib/game/{types,contracts,constants,engine,progression,scoring,events}.ts`, unit tests, integration in `integrate/mission` |
| **Nirsanth A.** | `work/nirsanth-science` | `src/app/api/nasa/events/*`, `src/lib/nasa/*`, `src/data/*`, `src/components/game/{EventModal,ScienceDrawer,ResultsScreen}.tsx`, `docs/SCIENCE_SOURCES.md` |

---

## 8. Verification & Acceptance Sign-Off

- [x] **Criterion 1:** One-page scope freezes objectives, target age 7–12, and explicit non-goals.
- [x] **Criterion 2:** Must-have vs optional features distinguished with explicit cut list and fallback triage.
- [x] **Criterion 3:** All three owners acknowledge rules and boundaries before coding in `planning/TEAM_ACKNOWLEDGEMENT.md`.
