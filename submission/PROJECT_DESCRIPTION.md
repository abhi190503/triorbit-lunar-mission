# TriOrbit — Lunar Survival Simulator

> **NASA Space Apps Challenge 2026** — *Junior Astronaut Mission Trainer*
> **Team TriOrbit:** Abhinaya Jeyakumar, Vibhushan Ganeshan, Nirsanth A.
> **Repository:** [https://github.com/abhi190503/triorbit-lunar-mission](https://github.com/abhi190503/triorbit-lunar-mission)

---

## High-Level Project Summary

TriOrbit Lunar Survival Simulator is an interactive, browser-based space mission trainer designed for junior astronauts aged 7–12. Taking command of Lunar Base Alpha for a critical five-day survival mission, young commanders balance five normalized life-support vitals—Oxygen, Power, Water, Food, and Radiation Risk—against daily habitat consumption and authentic space weather events observed by NASA spacecraft. Players allocate two maintenance decisions daily across four interactive habitat modules: the Life Support Pod, Solar Station, Hydroponics Greenhouse, and Shielded Regolith Bunker. On Day 2, an authentic Solar Energetic Particle alert recorded by NASA's STEREO A spacecraft challenges commanders to choose between spending power sheltering in the subterranean regolith bunker or delaying shelter to maintain operations. Built with Next.js, React, and a pure deterministic TypeScript simulation engine, TriOrbit transforms complex heliophysics and closed-loop aerospace life-support engineering into an accessible, tactical web game. With zero logins, instant 1-click replay, and transparent scientific disclaimers distinguishing spacecraft observations from educational game points, TriOrbit inspires curiosity, resilience, and systems thinking in the next generation of Artemis explorers.

---

## The Problem & Target Audience

### The Educational Problem
Traditional science curricula often teach space exploration through passive reading or abstract formulas. Young learners rarely experience the real-world operational challenges facing human spaceflight:
- The finite nature of life support: producing air or water demands significant energy.
- The invisible hazard of the space environment: cosmic rays and solar radiation storms operate silently across interplanetary space.
- The necessity of tactical trade-offs: when resources run low, every maintenance choice carries immediate survival consequences.

### Target Audience
TriOrbit is specifically tailored for:
- **Junior Astronauts (Ages 7–12):** Providing clear, encouraging visual feedback, simple touch/mouse controls, and engaging cause-and-effect gameplay.
- **STEM Educators & Classrooms:** Zero logins, zero installs, zero external databases, running smoothly on school Chromebooks and mobile tablets.
- **Space Science Enthusiasts:** Grounded in authentic NASA Open Data and Goddard Space Flight Center heliophysics archives.

---

## Solution & Gameplay Experience

TriOrbit places the student in the seat of the Mission Commander of Lunar Base Alpha:
- **5-Day Mission Progression:** A compact, replayable five-day mission cycle that fits neatly within a classroom session or home exploration.
- **Daily Action Budget:** Exactly two maintenance actions per day force players to prioritize which habitat module to service based on telemetry warnings.
- **Four Subsystem Hotspots:**
  1. *Life Support Pod:* Generates Oxygen ($O_2$) at the expense of Power.
  2. *Solar & Battery Station:* Recharges depleted electrical power banks.
  3. *Hydroponics Greenhouse:* Cultivates microgreens and replenishes Food points using Water and Power.
  4. *Shielded Regolith Bunker:* Fortifies subterranean regolith storm shielding to lower Radiation Risk.
- **Telemetry HUD:** Five normalized resource gauges ($0–100$ points) color-coded to provide instant situational awareness.
- **Scheduled Space Weather Dilemmas:** Realistic mission emergencies on Days 2, 3, and 4 (including a real NASA Solar Energetic Particle alert on Day 2).
- **Comprehensive Debrief & Scoring:** Provides constructive feedback upon mission completion or failure, evaluating remaining resource reserves and decision accuracy on a deterministic scale of $0–1000$ points.

---

## NASA Open Data & Scientific Integrity

TriOrbit integrates authentic scientific data while maintaining clear, honest boundaries between real-world observations and educational simulation models:

### 1. NASA CCMC DONKI Space Weather Integration
- **Historical Event:** Solar Energetic Particle (SEP) storm detected by the STEREO A spacecraft.
  - **Event ID:** `2024-05-11T04:07:00-SEP-001`
  - **Timestamp:** 11 May 2024, 04:07 UTC
  - **Instrument:** STEREO A IMPACT (13–100 MeV energetic protons)
  - **Source Archive:** [NASA CCMC Event 30717](https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1)
- **NASA Open APIs:** Ingested via [api.nasa.gov](https://api.nasa.gov/) with a resilient, bundled offline fallback (`src/data/nasa/verified-events.json`).

### 2. Scientific Honesty Disclaimers
- **Normalized Simulation Points:** In-game vitals (Oxygen, Power, Water, Food, Radiation Risk) are normalized educational game points on a scale of $0–100$. They do **not** represent physical measurements in kilograms, liters, kilowatt-hours, or physical absorbed radiation doses (Grays / Sieverts).
- **Interplanetary Telemetry vs. Lunar Surface Dosimetry:** Deep-space spacecraft detect particle flux in the solar wind; they do not measure surface radiation on the lunar regolith. TriOrbit uses authentic event timestamps and classifications to trigger mission alerts without claiming to calculate biological human tissue damage.
- **Regolith Radiation Shielding:** Accurately reflects NASA lunar architecture concepts demonstrating that covering habitats with lunar soil provides effective cosmic ray attenuation.

---

## Technology Stack

- **Frontend Framework:** Next.js 16.4.6 App Router with React 19.3.0
- **Language & Contracts:** TypeScript 5.x (strict type checking enabled)
- **Styling & UI:** Tailwind CSS 4.3.3 (high-contrast space theme)
- **Vector Graphics:** Original 2.5D inline SVG base environment
- **Simulation Engine:** Pure deterministic TypeScript state reducer (`src/lib/game/`)
- **API Architecture:** Next.js Route Handler (`GET /api/nasa/events`) with server-side caching and bundled historical fallback
- **Test Suite:** Native Node.js test runner with 25 test suites and 124 passing assertions

---

## Educational Value & Lasting Impact

- **Systems Thinking:** Replaces rote learning with hands-on understanding of closed-loop ecological life support.
- **Emotional Resilience:** Mistakes trigger informative educational debriefs rather than punitive game-overs, and the instant 1-click replay encourages players to iterate and test new hypotheses.
- **Curriculum Alignment:** The in-game Science Drawer provides five bite-sized heliophysics lessons explaining coronal mass ejections, regolith geology, and bioregenerative life support.
- **Artemis Generation Inspiration:** Connects young students directly to NASA's ongoing exploration of the Moon and Mars.

---

## Team TriOrbit & Member Contributions

- **Abhinaya Jeyakumar (`@abhi190503`) — Team Leader & UI Architect:** Next.js scaffolding, 2.5D SVG lunar base scene, interactive HUD, motion feedback, design tokens, landing screen & tutorial.
- **Vibhushan Ganeshan (`@Vibhushan-2003`) — Simulation Lead:** Canonical TypeScript contracts, pure deterministic simulation engine, five-day progression, scoring models, and integration lead.
- **Nirsanth A. (`@nirsanth23`) — NASA & QA Lead:** NASA DONKI API route handler, offline fallback, space weather dilemma scenarios, educational Science Drawer, independent test suite & documentation.

---

## Project Links & Deliverables

- **Code Repository:** [https://github.com/abhi190503/triorbit-lunar-mission](https://github.com/abhi190503/triorbit-lunar-mission)
- **Architecture Documentation:** [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Science Sources & Provenance:** [docs/SCIENCE_SOURCES.md](../docs/SCIENCE_SOURCES.md)
- **Scientific Assumptions Register:** [docs/ASSUMPTIONS.md](../docs/ASSUMPTIONS.md)
- **Attribution & AI Disclosures:** [docs/ATTRIBUTION.md](../docs/ATTRIBUTION.md)
- **Independent QA Test Results:** [docs/TEST_RESULTS.md](../docs/TEST_RESULTS.md)
- **Demo Storyboard & Script:** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- **Online Demo Presentation Link:** [DEMO_LINK.txt](DEMO_LINK.txt) (*Pending team owner publication of the verified 6-slide deck to public view-only Google Slides*).

---

## Attribution & AI Tooling Disclosure

- **Open Source Licensing:** All original code and documentation are licensed under the [MIT License](../docs/ATTRIBUTION.md#3-licensing-matrix). All dependencies are verified permissive (MIT and Apache-2.0).
- **AI Tooling Disclosure:** AI-assisted development tools (Antigravity IDE, GitHub Copilot) were utilized for code scaffolding, type generation, and test synthesis under strict human engineering oversight. All scientific data, mathematical models, and game logic were manually reviewed and audited by Team TriOrbit.

---

## Known Limitations

- **Single Dilemma per Day:** The current release schedules one primary space weather or habitat emergency per day on Days 2, 3, and 4.
- **Single-Player Focus:** The simulation is designed around a single Commander role; collaborative multi-role classroom gameplay remains a future roadmap objective.
