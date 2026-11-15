# TriOrbit — Six-Slide Online Demo Production Script & Storyboard

**Task:** TRI-026 — Produce 30-Second Subtitled Demo OR Maximum-Seven-Slide Presentation
**NASA Space Apps Challenge 2026:** Junior Astronaut Mission Trainer (Ages 7–12)
**Team TriOrbit:**
- **Lead / UI Architect:** Abhinaya Jeyakumar (`@abhi190503`)
- **Simulation / Engine Specialist:** Vibhushan Ganeshan (`@Vibhushan-2003`)
- **NASA Data / Content / QA Lead:** Nirsanth A. (`@nirsanth23`)

**Repository:** `abhi190503/triorbit-lunar-mission`
**Workstream Branch:** `work/nirsanth-science`
**Target Integration Branch:** `develop`
**Verified Baseline Application Commit:** `9613dea558c4dd48f8a2ad6f40c74ce0ceeb31b5`

---

## 1. Executive Summary & Selected Format

- **Selected Submission Format:** **Six-Slide Online Presentation** (Maximum 7 slides counting title per NASA Space Apps challenge rules).
- **Format Rationale:** The six-slide presentation provides an educational, self-paced, high-fidelity demonstration of TriOrbit’s interactive lunar survival mechanics, authentic NASA DONKI space weather integration, young-learner accessibility (ages 7–12), and transparent scientific attribution.
- **Single Deliverable Commitment:** Exactly one primary demo deliverable is submitted. No conflicting secondary video or alternate presentation formats are generated.
- **Repository Boundaries:** Strictly confined to `submission/DEMO_SCRIPT.md` and `submission/DEMO_LINK.txt`.

---

## 2. Verified Technical & Scientific Baseline

The demo content directly reflects the fully tested, integrated application:

| Metric / Requirement | Verified Value | Evidence |
|---|---|---|
| **Application Integration (TRI-020)** | MERGED | PR #50 merged into `develop` (`af9b86d`) |
| **Science & Attribution Audit (TRI-025)** | MERGED | PR #54 merged into `develop` (`9613dea`) |
| **Production Build** | PASSED | `npx next build --webpack` compiles static (`/`, `/play`) & dynamic (`/api/nasa/events`) routes cleanly |
| **Type Integrity** | PASSED | `npx tsc --noEmit` reports 0 errors |
| **Lint & Static Analysis** | PASSED | `npm run lint` reports 0 errors, 0 warnings |
| **Automated Test Suite** | PASSED | 25 of 25 test suites (124 assertions) pass deterministically |
| **NASA API & Fallback** | PASSED | Live DONKI proxy endpoint verified with bundled fallback `verified-events.json` |

---

## 3. Slide-by-Slide Detailed Storyboard

### Slide 1: Title & Solution Introduction

- **Slide Number:** 1 of 6 (Title Slide)
- **Slide Title:** TriOrbit — Lunar Survival Simulator
- **Subtitle:** Junior Astronaut Mission Trainer (Ages 7–12) | NASA Space Apps Challenge 2026
- **Team Credits:**
  - Abhinaya Jeyakumar — UI/UX Lead & Responsive Lunar Base Architecture
  - Vibhushan Ganeshan — Pure Deterministic Simulation Engine & Progression
  - Nirsanth A. — NASA Science Integration, DONKI API & Quality Assurance
- **Core Message:** TriOrbit puts young learners in command of a simulated lunar base for 5 crucial days. Players balance life-support vitals against authentic solar weather phenomena observed by NASA spacecraft.
- **Visual Subject:** Full-bleed landing screen showing the cinematic lunar landscape, the lunar base habitat modules, the primary "Begin Mission" action, and the 30-second mission briefing trigger.
- **Application Source:** Route `/` (`src/app/page.tsx` & `src/components/game/LandingScreen.tsx`).
- **Presenter Notes:**
  > "Welcome to TriOrbit! Designed specifically for future astronauts aged 7 to 12, TriOrbit transforms complex aerospace engineering and heliophysics into an accessible, tactical web simulator where children directly experience the cause-and-effect realities of living on the Moon."
- **Validation Status:** VERIFIED against running LandingScreen component.

---

### Slide 2: The Educational Challenge & Learning Goals

- **Slide Number:** 2 of 6
- **Slide Title:** The Mission Challenge — Surviving on the Moon
- **The Problem:**
  - Science education often presents life-support systems and solar radiation through passive lectures or abstract formulas.
  - Young learners lack intuitive appreciation for the delicate trade-offs required to keep an extraterrestrial habitat operational.
- **Core Learning Goals:**
  1. **Resource Stewardship:** Learn that life support is a closed-loop system—generating oxygen or water requires energy and tactical trade-offs.
  2. **Space Weather Literacy:** Understand that the Sun continuously emits solar wind, flares, and high-speed protons that threaten astronauts beyond Earth's protective magnetic field.
  3. **Critical Decision-Making:** Practice tactical decision-making under constrained action budgets without fear of permanent failure.
- **Visual Subject:** Interactive 2.5D Lunar Base Scene overview, displaying the 4 distinct habitat pods under the starry lunar sky.
- **Application Source:** Component `src/components/game/LunarBaseScene.tsx` & `src/components/game/ModuleHotspot.tsx`.
- **Presenter Notes:**
  > "On Earth, our thick atmosphere and strong magnetic field shield us from cosmic radiation and provide endless air and water. On the Moon, every breath and every kilowatt-hour must be actively managed. TriOrbit gives children hands-on command of these vital systems."
- **Validation Status:** VERIFIED against 2.5D vector base architecture.

---

### Slide 3: Interactive Lunar Survival Gameplay Loop

- **Slide Number:** 3 of 6
- **Slide Title:** Interactive Base Modules & Resource Telemetry
- **Core Mechanics:**
  - **5-Day Mission Cycle:** Day 1 to Day 5 sequential progression with real-time day tracking.
  - **Daily Action Budget:** Exactly 2 maintenance actions per day across 4 specialized habitat modules:
    - *Life Support Pod:* Cycles atmosphere and replenishes Oxygen ($O_2$) at a cost of Power.
    - *Solar Array & Battery Station:* Recharges depleted electrical power reserves.
    - *Hydroponics Bay:* Cultivates microgreens and yields Food points while consuming Water and Power.
    - *Shielded Regolith Bunker:* Powers up subterranean radiation shielding to mitigate Radiation Risk.
  - **5 Normalized Vitals (0–100 Points):** Oxygen, Power, Water, Food, and Radiation Risk Alert Level.
  - **Survival Boundary:** Dropping any life-vital to 0 or allowing Radiation Risk to reach 100 triggers an emergency mission abort.
- **Educational Caveat:** Vitals are normalized educational simulation points ($0-100$), not measured kilograms, liters, kilowatt-hours, or physical absorbed radiation dose (Sieverts/Grays).
- **Visual Subject:** Real Mission HUD displaying vital status bars, action counter (2 / 2 remaining), Day 1 badge, and interactive module maintenance buttons.
- **Application Source:** `src/components/game/MissionHUD.tsx` & `src/components/game/ActionControls.tsx`.
- **Presenter Notes:**
  > "Players manage 4 physical habitat modules using an intuitive 2-action daily budget. If life support drains too low or radiation risk spikes, the mission is aborted. Every choice matters, teaching children proactive resource conservation."
- **Validation Status:** VERIFIED against pure deterministic engine contracts (`src/lib/game/engine.ts`).

---

### Slide 4: Authentic NASA DONKI Data & Mission Dilemmas

- **Slide Number:** 4 of 6
- **Slide Title:** Authentic NASA Space Weather in Action
- **Authentic NASA Event Integration:**
  - **Event ID:** `2024-05-11T04:07:00-SEP-001`
  - **Observation Timestamp:** 11 May 2024, 04:07 UTC
  - **Spacecraft / Instrument:** STEREO A Solar Energetic Particle (SEP) detector ($13-100\text{ MeV}$ proton flux)
  - **Official NASA Archive:** [NASA CCMC DONKI Event 30717](https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1)
- **Day 2 Mission Dilemma:**
  - Mission Control receives an authentic space weather alert from NASA's Space Weather Database (DONKI).
  - **Choice A (Prudent):** *Shelter crew in shielded regolith bunker* (Power $-5$, Radiation Risk $+5$). Crew is protected beneath lunar soil.
  - **Choice B (Risky):** *Delay shelter to maintain external operations* (Radiation Risk $+15$, Power $0$). Avoids auxiliary power draw but exposes crew to elevated particle hazard, logging an emergency mistake.
- **Scientific Honesty Disclosure:** Spacecraft observations in deep space measure interplanetary proton flux; they do not measure physical surface radiation dose. In-game effects represent calibrated educational models.
- **Visual Subject:** Real EventModal UI showing the dilemma narrative, authentic NASA observation badge, and interactive decision buttons.
- **Application Source:** `src/components/events/EventModal.tsx` & `src/data/scenarios.json`.
- **Presenter Notes:**
  > "On Day 2, a real solar storm detected by NASA's STEREO A spacecraft in May 2024 triggers an emergency dilemma. The student commander must choose whether to spend power sheltering in the underground regolith bunker or risk dangerous radiation exposure."
- **Validation Status:** VERIFIED against live API proxy and frozen offline fixture `src/data/nasa/verified-events.json`.

---

### Slide 5: Science Learning Drawer & Transparent Attribution

- **Slide Number:** 5 of 6
- **Slide Title:** Educational Science Drawer & Open Data Attribution
- **In-Game Science Education:**
  - Slide-over educational drawer accessible at any time without interrupting gameplay.
  - 5 Curated NASA Science Facts written for children aged 7–12:
    1. *Solar Storms & High-Speed Particles:* How solar eruptions blast protons across the solar system at near-light speed.
    2. *Spacecraft Cameras vs. The Lunar Surface:* Why orbital sensors differ from lunar regolith dosimetry.
    3. *What is NASA DONKI:* Explaining NASA's open database of space weather notifications and knowledge.
    4. *Moon Soil as a Radiation Shield:* How lunar regolith absorbs cosmic rays like a giant natural blanket.
    5. *Plants in Space:* How closed-loop hydroponics recycle carbon dioxide into breathable air and food.
- **Transparent Attribution & Open Source Integrity:**
  - 100% verified HTTPS source citations to NASA Open APIs (`api.nasa.gov`) and NASA CCMC (`ccmc.gsfc.nasa.gov`).
  - 100% open-source permissive licensing (MIT and Apache-2.0 dependencies; zero copyleft code).
  - Full disclosure of AI-assisted engineering tools (Antigravity IDE, GitHub Copilot) with 100% human review and verification.
- **Visual Subject:** ScienceDrawer slide-over card displaying verified NASA facts, external link badges, and educational caution banners.
- **Application Source:** `src/components/learn/ScienceDrawer.tsx` & `src/data/science-facts.ts`.
- **Presenter Notes:**
  > "Curiosity is encouraged! The in-game Science Drawer lets students explore real heliophysics and lunar habitat science at their own pace. All content links directly to verified NASA Open APIs and Goddard Space Flight Center research."
- **Validation Status:** VERIFIED against comprehensive TRI-025 attribution audit (`docs/ATTRIBUTION.md`).

---

### Slide 6: Mission Outcomes, Replayability & Lasting Impact

- **Slide Number:** 6 of 6
- **Slide Title:** Mission Debrief, Replay & Educational Impact
- **Dynamic Mission Outcomes:**
  - **Mission Accomplished:** Awarded upon completing Day 5 with all vitals $>0$ and Radiation Risk $<100$.
  - **Mission Aborted:** Triggered with specific educational debrief if oxygen, power, water, or food depletes, or if radiation risk breaches safe limits.
  - **Deterministic Scoring (0–1000 Points):** Evaluates surviving resource reserves, emergency dilemma accuracy, and mission duration.
- **Instant Replay Loop:**
  - "Replay Mission" button completely purges state and resets to Day 1 instantly, encouraging players to try alternative resource strategies.
- **Educational Impact Summary:**
  - Replaces dry memorization with active systems thinking.
  - Fosters early intuition for space exploration challenges facing NASA's Artemis program.
  - Completely accessible: zero logins, zero ads, zero external databases, 100% free and open-source.
- **Visual Subject:** ResultsScreen showing victory debrief, score badge (e.g. 785 / 1000), vital breakdown summary, and the "Replay Mission" CTA.
- **Application Source:** `src/components/results/ResultsScreen.tsx`.
- **Presenter Notes:**
  > "Whether students succeed or face an emergency abort, TriOrbit provides an instant educational debrief explaining why systems failed or succeeded. With one click, they can replay the mission to test new strategies—building resilience, curiosity, and a lifelong passion for space science."
- **Validation Status:** VERIFIED against passing deterministic replay test QA-009.

---

## 4. Visual Design System & Presentation Standards

- **Color Palette:**
  - Background: Deep Space Navy (`#0B0F19`)
  - Surface Cards: Elevated Slate (`#151D2F`)
  - Accent / Energy: Cyan / Electric Blue (`#38BDF8`)
  - Success Indicator: Emerald Green (`#34D399`)
  - Alert / Solar Storm: Solar Amber (`#F59E0B` & `#EF4444`)
  - Typography: Pure White (`#F9FAFB`) and Muted Grey (`#94A3B8`)
- **Typography:**
  - Headers: Clean, bold modern sans-serif (Inter / system sans).
  - Body: High-contrast, legible text calibrated for screen sharing and presentation projectors.
- **Screenshot Standards:**
  - 100% genuine captures from the integrated application build (`9613dea`).
  - Zero concept mockups or synthetic UI renders.
  - Clean desktop viewport (16:9 aspect ratio).
- **Slide Budget:** Exactly 6 slides (cannot exceed 7 slides total).

---

## 5. Reviewer Handoff & Acceptance Checklist

- [x] **Single Demo Format:** Exactly one demo format chosen (Six-Slide Online Presentation).
- [x] **Slide Count:** Exactly 6 slides (strictly $\le 7$ counting title).
- [x] **Real Application Features:** All slides reflect working features from merged commit `9613dea`.
- [x] **NASA Science Grounding:** CCMC DONKI event `2024-05-11T04:07:00-SEP-001` and NASA Open APIs cited accurately.
- [x] **Scientific Integrity:** Explicit educational disclaimers distinguishing space weather telemetry from surface dosimetry.
- [x] **Independent Reviewer:** Prepared for Abhinaya Jeyakumar (`@abhi190503`).
