# TriOrbit NASA Space Apps Submission & Judging Guide

> **Task ID:** TRI-005
> **Status:** APPROVED & ACTIVE
> **Challenge:** [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)
> **Competition:** NASA Space Apps Challenge 2026 — Colombo Local Event (Virtual)
> **Project Name:** TriOrbit Lunar Survival Simulator
> **Team Name:** TriOrbit
> **Team Members:** Abhinaya Jeyakumar (`@abhi190503`), Vibhushan Ganeshan (`@Vibhushan-2003`), Nirsanth A. (`@nirsanth23`)
> **Public Repository:** [`https://github.com/abhi190503/triorbit-lunar-mission`](https://github.com/abhi190503/triorbit-lunar-mission)
> **Submission Deadline:** Sunday, 15 November 2026, 23:59 Asia/Colombo (Target Submission: 20:00 Asia/Colombo)

---

## 1. Competition Overview & Official Timeline

### 1.1 Key Event Parameters

| Parameter | Details | Verification Source |
|---|---|---|
| **Global Organization** | NASA International Space Apps Challenge 2026 | [spaceappschallenge.org/2026](https://www.spaceappschallenge.org/2026/) |
| **Local Event** | Colombo, Sri Lanka (Virtual Event) | Colombo Local Organizer Briefing |
| **Official Challenge** | *Build a Junior Astronaut Mission Trainer* | [Official Challenge Page](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) |
| **Target Audience** | Junior Astronauts aged **7–12**, classrooms & youth science learners | Challenge Description & `docs/PROJECT_SPEC.md` |
| **Hackathon Start** | Saturday, 14 November 2026, 09:00 Asia/Colombo | Global Hackathon Start Protocol |
| **Live Pitch Sessions** | Sunday, 15 November 2026, starting from 10:00 AM Asia/Colombo | Colombo Judging Guide (Virtual slots) |
| **Submission Deadline** | Sunday, 15 November 2026, 23:59 Asia/Colombo | Global Project Portal Closure |
| **Internal Freeze Target** | Sunday, 15 November 2026, 20:00 Asia/Colombo | TriOrbit Safety Buffer Protocol |

### 1.2 Team Eligibility Confirmation
- All 3 team members (Abhinaya Jeyakumar, Vibhushan Ganeshan, Nirsanth A.) are registered on the official NASA Space Apps Challenge platform and affiliated with the Colombo Local Event.
- All competition code and documentation are authored within the official hackathon window (14–15 November 2026).

---

## 2. NASA Challenge Alignment & Pedagogical Value

The challenge requires creating an interactive, educational tool that introduces young minds to the realities, discipline, and problem-solving required of astronauts on space missions.

```
       [Raw NASA Space Weather Data]
         (DONKI SEP / Solar Flares)
                     │
                     ▼
         [Server-Side Validation]
        (Safe Historical Fallback)
                     │
                     ▼
        [5-Day Mission Simulation]
    (O2, Power, Water, Food, Radiation)
                     │
                     ▼
       [Junior Astronaut Decisions]
  (Tactical Choices & Resource Trade-offs)
                     │
                     ▼
       [Scientific Debrief & Facts]
    (Raw Observations vs. Game Models)
```

### 2.1 Core Pillars of the Mission Trainer

1. **Astronaut Training & Decision Discipline:**
   - Rather than passive reading or rote quizzes, players assume the role of Lunar Habitat Commander.
   - Players must allocate a finite daily action budget (2 actions/day across 5 days) across 4 habitat subsystems.
2. **Dynamic Closed-Loop Resource Management:**
   - Players continuously balance 5 interconnected life vitals: Oxygen ($O_2$), Power ($kW$), Water ($L$), Food ($kg$), and Radiation Risk (Alert Level %).
   - Neglecting power threatens life-support heaters; water shortages directly impair hydroponic food production.
3. **Space Weather Awareness & NASA Data Integration:**
   - Children encounter space weather dilemmas driven by real NASA spacecraft observations (Solar Energetic Particles and Solar Flares).
   - In-game alerts explain the origin of space radiation and why the Moon requires specialized shielding habitats.
4. **Transparent Cause-and-Effect Feedback:**
   - Every choice produces immediate, legible consequences on habitat gauges.
   - Surpassing 100% Radiation Risk or depleting any vital to 0 triggers a clear "Mission Aborted" debrief explaining what went wrong and how to adapt on replay.
5. **Clear Educational Boundaries:**
   - Explicit disclaimers teach children that game radiation points are educational risk models, not physical astronaut radiation doses.

---

## 3. Scientific Provenance & Research Protocol

Adherence to scientific integrity is a core requirement of the TriOrbit engineering contract (`planning/SCIENCE_PROTOCOL.md`).

### 3.1 Primary Real-Data Source: NASA DONKI

- **API Endpoint:** NASA Space Weather Database of Notifications, Knowledge, Information ([NASA DONKI API](https://api.nasa.gov/)).
- **Monitored Phenomena:** Solar Energetic Particle (SEP) events and Solar Flares (FLR).
- **Candidate Primary Historical Record:**
  - **Event ID:** `2024-05-11T04:07:00-SEP-001`
  - **Observing Spacecraft:** STEREO A (Solar Terrestrial Relations Observatory)
  - **Instruments:** IMPACT / HET (High Energy Telescope)
  - **NASA CCMC Alert Reference:** [CCMC Alert Notice 30728](https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1)
  - **Historical Significance:** Part of the historic Solar Cycle 25 space weather storms of May 2024.

### 3.2 Distinction Between Science Data & Game Units

| Domain | NASA Factual Observation | TriOrbit Educational Game Model |
|---|---|---|
| **Space Weather Metric** | Proton flux ($>10\text{ MeV}$, $>100\text{ MeV}$) observed at STEREO A | Normalized Radiation Risk Alert Level (0–100%) |
| **Lunar Environment** | Vacuum, solar irradiance, regolith thermal swings | Abstracted Oxygen ($O_2$), Power ($kW$), Water ($L$), Food ($kg$) |
| **Biological Impact** | Physical absorbed dose ($\text{mGy}$, $\text{mSv}$) measured by active dosimeters | Educational survival threshold (Risk reaches 100% = Abort) |
| **Data Integrity Rule** | Display verified event ID, spacecraft, and NASA URL | Disclose that game mechanics are educational calibrations |

### 3.3 Offline Resilience & Provenance Fallback
- The application must never break or display blank screens if the live NASA API is unreachable or rate-limited.
- A pre-verified JSON fallback containing authentic historical DONKI observation metadata is bundled server-side (`src/lib/nasa/fallbackData.ts`).
- When fallback data is served, the API response carries `provenance: 'verified-fallback'` and the in-game science drawer explicitly discloses this status to the learner.

---

## 4. Required Project Submission Components

Based on the official **NASA Space Apps Project Submission Guide** and Colombo local guidelines, the following assets must be prepared and published before portal closure.

### 4.1 Project Form Fields Matrix

| Component | Official Requirement | TriOrbit Implementation / Value | Responsible Owner | Verification Status |
|---|---|---|---|---|
| **Project Title** | Official project name | `TriOrbit Lunar Survival Simulator` | Abhinaya | **READY** |
| **High-Level Summary** | 50–200 words summarizing problem, solution, and impact | Frozen 142-word submission summary (see Section 4.2) | Abhinaya | **READY** |
| **Challenge Track** | Selected challenge | *Build a Junior Astronaut Mission Trainer* | Abhinaya | **READY** |
| **Project Presentation** | ONE link: Max 7 slides OR Max 30-sec subtitled video | Primary: **6-Slide Presentation Deck (PDF)**; Secondary backup: 30-sec demo video | Nirsanth | **IN PROGRESS** (`TRI-026`) |
| **Public Code Repository** | Public GitHub repo link | [`https://github.com/abhi190503/triorbit-lunar-mission`](https://github.com/abhi190503/triorbit-lunar-mission) | Abhinaya | **READY** |
| **Live Interactive Demo** | Deployed accessible web URL | Vercel production deployment link (`TRI-030`) | Vibhushan | **PENDING** (`TRI-030`) |
| **NASA Data Sources** | Explicit citations of NASA APIs & datasets used | NASA DONKI API (`/DONKI/SEP`, `/DONKI/FLR`), STEREO A metadata, CCMC Alert 30728 | Nirsanth | **READY** |
| **Third-Party Citations** | Open-source libraries, fonts, and assets | Next.js, React, Tailwind CSS, Lucide React, KaTeX | Nirsanth | **READY** (`TRI-025`) |
| **AI Tool Disclosure** | Disclosure of AI tools used in development | Transparent disclosure of AI coding assistants (see Section 6) | Abhinaya | **READY** |
| **Language** | All text in English (subtitles if video in other tongue) | 100% English interface, documentation, and deck | All | **READY** |

### 4.2 Approved High-Level Project Summary (142 Words)

> TriOrbit Lunar Survival Simulator is an interactive, browser-based mission trainer designed for junior astronauts aged 7–12. Addressing the NASA Space Apps Challenge "Build a Junior Astronaut Mission Trainer," the game places young learners in command of a lunar surface habitat for an intensive five-day survival mission. Players actively balance five vital life-support metrics—Oxygen, Power, Water, Food, and Radiation Risk—by directing tactical daily actions across four interactive base subsystems.
>
> When real space weather anomalies strike, the trainer queries NASA’s Space Weather Database (DONKI), incorporating real historical Solar Energetic Particle observations from the STEREO A spacecraft. Learners make critical operational trade-offs, experiencing direct cause-and-effect consequences while learning to distinguish raw scientific observations from educational simulations. Built with Next.js and pure TypeScript, TriOrbit features offline resilience, accessible 2.5D visual scenes, and instant replay debriefs, inspiring the next generation of space explorers.

### 4.3 Slide Presentation Structure (Max 7 Slides)

The team has chosen a **6-slide PDF deck** as the primary presentation deliverable to maximize clarity during review:

- **Slide 1 — Title & Mission:** Project name, team members, Colombo Local Event, target age (7–12), tagline.
- **Slide 2 — The Challenge & The Vision:** Why space education needs interactive decision trade-offs rather than passive textbooks.
- **Slide 3 — The Habitat Simulator:** 2.5D interactive base modules, 5 core vitals, 2 actions/day loop.
- **Slide 4 — NASA Data in Action:** Real DONKI STEREO A solar energetic particle telemetry and science fact drawer.
- **Slide 5 — Tech Stack & Resilience:** Next.js App Router, pure TypeScript simulation engine, offline fallback architecture.
- **Slide 6 — Educational Impact & Future Horizons:** Learning outcomes, accessibility, classroom readiness, and replay insights.

---

## 5. Live Virtual Pitch & Judging (Colombo Local Event)

### 5.1 Format & Schedule
- **Session Timing:** Sunday, 15 November 2026, starting from 10:00 AM Asia/Colombo.
- **Allocation:** Strictly **5 minutes live demo/presentation**, followed by **5 minutes Q&A with judges**.
- **Attendance:** All 3 team members present in the virtual room.

### 5.2 5-Minute Live Pitch Rehearsal Script

```
[0:00 - 0:35] HOOK & CHALLENGE
"Good morning, judges! We are Team TriOrbit. Space exploration is entering the Artemis era,
yet most space education for kids remains passive reading. We built the TriOrbit Lunar Survival
Simulator: a mission trainer for junior astronauts aged 7 to 12 where every decision has real
consequences on survival."

[0:35 - 1:00] MISSION OVERVIEW & BASE MODULES
"As Commander of a 3-person lunar habitat, the player has 5 days to keep the crew alive.
Here is our interactive 2.5D base: Life Support Habitat for Oxygen, Solar Station for Power,
Hydroponics for Food and Water, and a Subsurface Bunker for Radiation shielding.
Notice our HUD: 5 normalized vitals and 2 action points per day."

[1:00 - 3:20] LIVE GAMEPLAY & NASA DATA INTEGRATION
"Let's advance to Day 2. An emergency alert triggers! This is not generic sci-fi: our backend
queried NASA DONKI for historical Solar Energetic Particle event 2024-05-11 from STEREO A.
Opening the Science Drawer, students can inspect actual NASA instruments and timestamps.
Now, a critical dilemma: do we seal the bunker to protect crew radiation, or divert power to
save the freezing hydroponics bay? Let's divert power. Notice the immediate gauge update:
Radiation rises to caution, but Food reserves stabilize."

[3:20 - 4:15] SURVIVAL OUTCOMES & REPLAY DEBRIEF
"Fast-forwarding to Day 5: we survived! The debrief screen breaks down our efficiency score,
vital trends, and highlights how real lunar habitats must operate under closed-loop physics.
Had any vital dropped to zero, learners receive an encouraging diagnostic explaining how to
adapt their strategy."

[4:15 - 5:00] ARCHITECTURE, PROVENANCE & WRAP-UP
"Under the hood: Next.js App Router, deterministic TypeScript simulation engine, and an offline
fallback ensuring the game works in schools with zero internet. We adhere strictly to scientific
honesty: DONKI solar events are real observations; game risk points are educational models.
Thank you! We're excited to take your questions."
```

### 5.3 Anticipated Judge Q&A & Talking Points

| Question Topic | Key Talking Point | Supporting Documentation |
|---|---|---|
| **NASA Data Provenance** | "We pull real historical SEP events via NASA DONKI API. We clearly disclose that spacecraft proton flux observations are historical facts, while lunar habitat risk points are educational models." | `planning/SCIENCE_PROTOCOL.md` |
| **Age Appropriateness** | "Designed for ages 7–12: bright 2.5D visuals, intuitive color-coded gauges (green/amber/red), 2 tactical choices per day, and zero complex math required to understand cause-and-effect." | `docs/PROJECT_SPEC.md` |
| **Offline Resilience** | "Schools and competitions often have flaky Wi-Fi. Our server-side Route Handler includes verified historical DONKI fallbacks so the educational experience never fails." | `src/app/api/nasa/events/route.ts` |
| **Technical Architecture** | "Pure TypeScript simulation engine decoupled from React UI. Deterministic state transitions, zero external databases, lightweight bundle size." | `planning/INTERFACES.md` |

---

## 6. AI Disclosure & Third-Party Attribution

### 6.1 AI-Assisted Development Disclosure
- **Tooling Used:** Antigravity / Gemini coding assistants.
- **Scope of AI Assistance:** Used for generating boilerplate code structures, Next.js scaffolding validation, drafting documentation outlines, and validating test assertions.
- **Human Leadership & Originality:** The core project concept, educational narrative, game balancing rules, architecture decisions, and code review were exclusively authored, verified, and directed by the human engineering team (Abhinaya Jeyakumar, Vibhushan Ganeshan, Nirsanth A.).

### 6.2 Data & Software Attribution
- **NASA Open Data:** NASA DONKI (Space Weather Database of Notifications, Knowledge, Information) API.
- **Frameworks & Libraries:** Next.js (MIT License), React (MIT License), Tailwind CSS (MIT License), Lucide React (ISC License), Vitest (MIT License).
- **Branding Disclaimer:** TriOrbit does not use, modify, or spoof official NASA logos or insignias. All NASA references are purely textual and educational citations.

---

## 7. Final Submission Checklist & Verification Matrix

| Checklist Item | Description | Responsible Owner | Status | Verification Method |
|---|---|---|---|---|
| **Core Game Functional** | 5-day loop, 4 modules, 5 vitals, win/loss/replay | Vibhushan | PENDING | Smoke test pass on `develop` (`TRI-020`) |
| **NASA DONKI Integration** | Server Route Handler returning real event metadata | Nirsanth | PENDING | API test pass (`TRI-010`) |
| **Verified Fallback Data** | Bundled historical fallback when API is down | Nirsanth | PENDING | Negative network test pass (`TRI-010`) |
| **Accessible 2.5D UI** | Responsive layout, keyboard focus, touch targets | Abhinaya | PENDING | Accessibility audit (`TRI-022`) |
| **Public GitHub Repo** | Repo set to Public with complete README & setup | Abhinaya | READY | GitHub repository settings |
| **Production Vercel URL** | Live accessible web app on `main` branch | Vibhushan | PENDING | Vercel live health check (`TRI-030`) |
| **6-Slide Deck (PDF)** | Exported public PDF presentation meeting rules | Nirsanth | PENDING | Visual check & link test (`TRI-026`) |
| **Scientific Disclaimers** | In-game science cards distinguish data from models | Nirsanth | PENDING | UI inspection (`TRI-018`, `TRI-025`) |
| **AI Disclosure Form** | Completed AI disclosure on project submission form | Abhinaya | READY | Submission form review |
| **Pitch Rehearsal** | 5-minute pitch timed and tested with all 3 members | Abhinaya | PENDING | Team rehearsal run (`TRI-028`) |
| **Final Submission Link** | Verified submission on NASA Space Apps portal | Abhinaya | PENDING | Portal confirmation email (`TRI-029`) |
