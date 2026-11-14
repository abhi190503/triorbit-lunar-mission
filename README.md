# TriOrbit — Lunar Survival Simulator

> **NASA Space Apps Challenge 2026** — *Junior Astronaut Mission Trainer (Ages 7–12)*
> **Live Web Application:** [https://triorbit-lunar-mission.vercel.app](https://triorbit-lunar-mission.vercel.app)
> **Repository:** [abhi190503/triorbit-lunar-mission](https://github.com/abhi190503/triorbit-lunar-mission)
> **Challenge Track:** Junior Astronaut Mission Trainer
> **Target Audience:** Future astronauts aged 7–12, educators, and science enthusiasts.

---

## 1. 🚀 Project Overview

**TriOrbit Lunar Survival Simulator** is an interactive, browser-based mission simulator that empowers young learners aged 7–12 to take command of a lunar surface habitat. Over a five-day mission cycle, commanders manage critical life-support vitals, allocate daily maintenance across habitat modules, and respond to authentic space weather events observed by NASA spacecraft.

Designed to replace passive memorization with active systems thinking, TriOrbit challenges students to balance Oxygen, Power, Water, Food, and Radiation Risk while experiencing the real-world trade-offs of extraterrestrial human exploration.

---

## 2. 🎯 Problem & Educational Objectives

### The Educational Challenge
Space science education often reduces life support to abstract formulas or presents radiation as an incomprehensible hazard. Young learners struggle to visualize the cause-and-effect relationship between spacecraft operations, limited resources, and the invisible space environment.

### Core Learning Goals
1. **Closed-Loop Systems Thinking:** Understand that lunar life support is finite and interdependent—producing food consumes water and energy; cycling oxygen requires battery reserves.
2. **Space Weather Literacy:** Discover how solar eruptions accelerate high-speed protons across the solar system, and understand how astronauts use lunar regolith to shelter from ionizing particle storms.
3. **Critical Decision-Making:** Evaluate operational risk under real-time constraints, learning from failure in a resilient, repeatable simulation environment.

---

## 3. ✨ Key Features

- **5-Day Mission Cycle:** Day 1 to Day 5 sequential progression featuring dynamic day/night environmental transitions.
- **Interactive 2.5D Vector Habitat:** High-contrast, responsive SVG lunar base with 4 clickable subsystem hotspots (Life Support Pod, Solar & Battery Station, Hydroponics Bay, and Shielded Regolith Bunker).
- **Daily Action Budget:** Allocate exactly 2 operational decisions each day to service habitat modules before concluding the shift.
- **Normalized Resource Gauges:** Real-time HUD displaying 5 core life vitals (Oxygen, Power, Water, Food, and Radiation Risk Alert Level) calibrated as normalized educational points ($0–100$).
- **Authentic NASA DONKI Integration:** Real historical Solar Energetic Particle (SEP) alerts retrieved from NASA Goddard Space Flight Center's CCMC DONKI API with verified offline fallback.
- **Space Weather Dilemmas:** Scheduled mission challenges on Days 2, 3, and 4 requiring tactical decisions with immediate resource consequences.
- **On-Demand Science Drawer:** Slide-over educational panel offering 5 bite-sized, curriculum-aligned heliophysics facts with direct links to official NASA Open Data.
- **Outcome Debrief & Instant Replay:** Comprehensive mission success or failure analysis, deterministic scoring ($0–1000$), and 1-click state reset for continuous learning.
- **Universal Accessibility:** WAI-ARIA compliant dialogs, full keyboard navigation, accessible touch targets ($\ge 44\text{px}$), zero user logins, and zero external database dependencies.

---

## 4. 🛠️ Technology Stack

| Layer | Technology | Details / Version |
|---|---|---|
| **Framework** | Next.js App Router | Next.js 16.4.6 with React 19.3.0 |
| **Language** | TypeScript | TypeScript 5.x (strict type checking enabled) |
| **Styling** | Tailwind CSS | Tailwind CSS 4.3.3 (high-contrast space theme) |
| **Engine Architecture** | Pure TypeScript Reducer | Deterministic state transitions, zero client-side mutations |
| **NASA API Route** | Next.js Route Handler | `GET /api/nasa/events` with server-side caching & offline fixture |
| **Testing** | Node.js Test Runner | Native Node.js test runner with TypeScript execution loader |
| **Hosting Compatibility** | Static / Serverless | Fully compatible with Vercel, Node server, or local deployment |

---

## 5. 🏗️ System Architecture

TriOrbit is built around a unidirectional data flow separating pure simulation logic from visual rendering:

```text
[ Browser Client ]
        │
        ▼
[ Next.js Application ]
   ├── LandingScreen (Briefing & Tutorial)
   ├── MissionScreen (2.5D SVG Base & HUD)
   ├── ActionControls (2 Actions / Day Allocation)
   ├── EventModal (NASA Dilemma Resolution)
   ├── ScienceDrawer (Curated Heliophysics Facts)
   └── ResultsScreen (Debrief, Score & Replay)
        │
        ├── State Flow (Unidirectional Dispatch)
        ▼
[ Pure TypeScript Engine ] (src/lib/game/)
   ├── contracts.ts (GameState, Actions, Resources)
   ├── engine.ts (State Reducer & Drain Invariants)
   ├── progression.ts (Day Advance & Outcome Logic)
   └── scoring.ts (Deterministic 0–1000 Scoring)
        ▲
        │ Scenario / Event Telemetry
        ▼
[ NASA Route Handler ] (src/app/api/nasa/events/route.ts)
   ├── Live Fetch: NASA CCMC DONKI API (api.nasa.gov)
   └── Bundled Fallback: src/data/nasa/verified-events.json
```

For complete architectural specifications, module responsibilities, and data contracts, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 6. 🚀 Getting Started & Installation

TriOrbit requires **Node.js 20+** (tested on Node.js `v22.23.4` and npm `10.9.9`).

### Step 1: Clone the Repository
```bash
git clone https://github.com/abhi190503/triorbit-lunar-mission.git
cd triorbit-lunar-mission
```

### Step 2: Install Dependencies
```bash
npm ci
```

### Step 3: Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 7. 🔐 Environment Configuration

TriOrbit runs fully out-of-the-box with **zero required environment variables** using its bundled, verified offline NASA space weather fixture.

To query live NASA DONKI endpoints directly, create a `.env.local` file:
```bash
cp .env.example .env.local
```

Add your NASA API key (obtainable free at [api.nasa.gov](https://api.nasa.gov/)):
```env
NASA_API_KEY=your_nasa_api_key_here
```

> **Security Guarantee:** The `NASA_API_KEY` is exclusively consumed server-side within `src/app/api/nasa/events/route.ts`. It is never bundled into client JavaScript or exposed in browser network requests.

---

## 8. 📦 Production Build & Testing

### Production Build
Compile optimized production assets:
```bash
npx next build --webpack
```

Run the production server:
```bash
npm start
```

### Code Quality & Static Analysis
```bash
# Typecheck
npx tsc --noEmit

# ESLint
npm run lint
```

### Automated Integration & Smoke Test Suite
Run the 25-suite deterministic regression test matrix:
```bash
node --import ./src/tests/integration/register.mjs --test src/tests/integration/smoke-regression.test.ts
```

All 25 test suites (124 assertions) execute deterministically with 100% pass rate in $<1$ second.

---

## 9. 🎮 Mission Guide & Gameplay Rules

### The Five-Day Mission Loop
- **Crew:** 3 fictional astronauts aboard Lunar Base Alpha.
- **Action Budget:** Exactly 2 maintenance actions per day.
- **Passive Daily Drain:** Baseline habitat consumption occurs at the end of each day:
  - Oxygen: $-8$ points/day
  - Power: $-10$ points/day
  - Water: $-5$ points/day
  - Food: $-4$ points/day
  - Radiation Risk: $0$ points/day (Radiation does not drain passively; it increases only during solar storms or risky choices).

### Resource Bounding & Failure Thresholds
- **Normalized Units:** All 5 vitals are strictly clamped between $[0, 100]$.
- **Mission Abort (Loss):** Occurs immediately if Oxygen, Power, Water, or Food drops to $0$, or if Radiation Risk reaches $100$.
- **Mission Accomplished (Win):** Occurs upon surviving through the end of Day 5 with all vitals $>0$ and Radiation Risk $<100$.

### Scoring Model
Final Commander Score ($0–1000$ points) is calculated deterministically:
$$\text{Score} = \text{Base Survival Points} + \text{Remaining Vitals Average} - \text{Mistake Penalties}$$

---

## 10. 🛰️ NASA Data Integration & Provenance

TriOrbit integrates authentic heliophysics data from the **NASA Space Weather Database Of Notifications, Knowledge, Information (DONKI)** hosted by the Community Coordinated Modeling Center (CCMC) at NASA Goddard Space Flight Center:

- **Primary Historical Event:** Solar Energetic Particle (SEP) storm detected by the STEREO A spacecraft.
  - **Event ID:** `2024-05-11T04:07:00-SEP-001`
  - **Timestamp:** 11 May 2024, 04:07 UTC
  - **Instrument:** STEREO A IMPACT (13–100 MeV energetic protons)
  - **Official Catalog Archive:** [NASA CCMC Event 30717](https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1)
- **NASA Open APIs:** [api.nasa.gov](https://api.nasa.gov/)
- **CCMC Space Weather Center:** [ccmc.gsfc.nasa.gov/DONKI/](https://ccmc.gsfc.nasa.gov/DONKI/)

---

## 11. 🔬 Scientific Assumptions & Educational Caveats

To ensure scientific integrity while maintaining engaging gameplay for children aged 7–12, TriOrbit observes clear boundaries between authentic science and educational modeling:

1. **Normalized Educational Points vs. Physical Units:**
   All 5 vital resources (Oxygen, Power, Water, Food, Radiation Risk) are represented as **normalized 0–100 educational game points**. They are calibrated simulation scores, **not** physical measurements in kilograms ($kg$), liters ($L$), kilowatt-hours ($kW$), or physical absorbed radiation doses (Grays / Sieverts).
2. **Deep-Space Telemetry vs. Lunar Surface Dosimetry:**
   NASA spacecraft such as STEREO A detect energetic protons in deep space. TriOrbit uses authentic event timestamps and classifications to trigger mission alerts, but does **not** claim to calculate biological surface radiation dosimetry on the lunar regolith.
3. **Regolith Shielding Model:**
   In accordance with NASA and lunar architecture studies, piling lunar soil over subterranean habitats provides effective radiation shielding. In-game actions represent simplified operational concepts for young astronauts.

For comprehensive scientific documentation, see [docs/SCIENCE_SOURCES.md](docs/SCIENCE_SOURCES.md) and [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md).

---

## 12. 🧪 Quality Assurance & Test Verification

TriOrbit's simulation engine and user interface were verified through a comprehensive 17-point test matrix ([docs/TEST_RESULTS.md](docs/TEST_RESULTS.md)):

- **QA-001 to QA-005:** Canonical GameState initialization, daily action budget limits, scenario day scheduling, choice consequence enforcement, and invariant resource clamping $[0, 100]$.
- **QA-006 to QA-009:** Verified 5-day winning walkthrough, deterministic failure lockout on resource depletion, scoring boundaries ($0–1000$), and isolated state replay reset.
- **QA-010 to QA-012:** NASA API payload contract, offline fallback fault tolerance, and HTTPS citation validation.
- **QA-013 to QA-017:** WAI-ARIA modal focus containment, responsive touch targets ($\ge 44\text{px}$), SSR hydration resilience, production build validation, and regression safeguards.

---

## 13. 🎨 Project Presentation & Demonstration

- **Live Deployed Web Application:** [https://triorbit-lunar-mission.vercel.app](https://triorbit-lunar-mission.vercel.app)
- **Demonstration Format:** Agreed Six-Slide Online Presentation (Maximum 7 slides counting title).
- **Storyboard & Script:** Complete slide-by-slide script, layout descriptions, and presenter notes are recorded in [submission/DEMO_SCRIPT.md](submission/DEMO_SCRIPT.md).
- **Online Demo Deck Link:** Recorded in [submission/DEMO_LINK.txt](submission/DEMO_LINK.txt) (*Pending team owner publication of the verified 6-slide deck to public view-only Google Slides*).

---

## 14. 👥 Team TriOrbit & Responsibilities

| Team Member | GitHub | Role & Key Contributions |
|---|---|---|
| **Abhinaya Jeyakumar** | [`@abhi190503`](https://github.com/abhi190503) | **Team Leader & UI Architect:** Scaffold setup, 2.5D SVG lunar base scene, interactive HUD, motion feedback, design tokens, landing screen & tutorial. |
| **Vibhushan Ganeshan** | [`@Vibhushan-2003`](https://github.com/Vibhushan-2003) | **Simulation Lead:** Canonical TypeScript contracts, pure deterministic simulation engine, 5-day cycle progression, scoring algorithms & integration lead. |
| **Nirsanth A.** | [`@nirsanth23`](https://github.com/nirsanth23) | **NASA & QA Lead:** NASA DONKI API route handler, offline fallback, dilemma scenarios, educational Science Drawer, independent QA test suite & scientific documentation. |

---

## 15. 📜 Attribution & AI Disclosure

- **Open Source Licensing:** All application source code and documentation are released under the [MIT License](docs/ATTRIBUTION.md#3-licensing-matrix). Third-party dependencies are 100% compliant with permissive open-source licenses (MIT and Apache-2.0). Zero copyleft dependencies.
- **AI Tooling Disclosure:** AI-assisted development tools (Antigravity IDE, GitHub Copilot) were utilized for code scaffolding, TypeScript typing, and test synthesis under strict human oversight. All simulation formulas, NASA data integrations, and scientific assertions were manually audited and verified by Team TriOrbit.
- **Full Attribution Register:** Comprehensive asset licensing, font notices, and AI disclosures are cataloged in [docs/ATTRIBUTION.md](docs/ATTRIBUTION.md).

---

## 16. 🔗 Documentation Index

- [Project Specification (TRI-001 Approved)](docs/PROJECT_SPEC.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Canonical Game Rules & Formulas](docs/GAME_RULES.md)
- [TypeScript Contracts & DTOs](docs/INTERFACES.md)
- [NASA Science Sources & Provenance](docs/SCIENCE_SOURCES.md)
- [Educational Assumptions & Modeling](docs/ASSUMPTIONS.md)
- [Attribution & Licensing Register](docs/ATTRIBUTION.md)
- [Independent QA Test Results](docs/TEST_RESULTS.md)
- [Demo Presentation Script](submission/DEMO_SCRIPT.md)
- [Project Submission Description](submission/PROJECT_DESCRIPTION.md)
- [Team Git & Workflow Guidelines](docs/GITHUB_WORKFLOW.md)

---

## 17. ⚠️ Known Limitations & Future Roadmap

- **Single Active Scenario per Day:** The current MVP schedules one major event dilemma per day (Days 2, 3, 4). Future iterations could introduce multi-phase cascading emergencies.
- **Sound & Audio Effects:** In compliance with hackathon focus on accessibility and zero-dependency performance, audio effects are currently omitted.
- **Multiplayer Collaboration:** The simulation currently focuses on a single Commander role. Future versions could support collaborative classroom multiplayer roles (e.g. Flight Surgeon, Systems Engineer, Science Officer).
