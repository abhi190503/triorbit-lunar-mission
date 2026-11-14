# TriOrbit — Judges' Q&A Preparation, Demonstration Recovery & Rehearsal Guide
## NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer

> **Task ID:** TRI-028
> **Status:** READY FOR INDEPENDENT REVIEW & HUMAN REHEARSAL
> **Repository:** `abhi190503/triorbit-lunar-mission`
> **Target Integration Branch:** `develop`
> **Current Task Branch:** `docs/abhinaya-tri-028-pitch`
> **Verified Baseline Application Commit:** `6103cc5` (origin/develop)
> **Primary Presenter:** Abhinaya Jeyakumar (`@abhi190503`)
> **Independent Reviewer:** Vibhushan Ganeshan (`@Vibhushan-2003`)
> **Science & QA Lead:** Nirsanth A. (`@nirsanth23`)

---

## 1. Executive Summary & Review Scope

This document provides Team TriOrbit with a comprehensive defense manual for the virtual 5-minute presentation and live judging session. It encompasses:
1. **Twenty Canonical Judges' Questions & Answers** calibrated for international NASA Space Apps judges.
2. **Demonstration Failure Recovery Plan** for live connectivity, software, and pacing emergencies.
3. **Rigorous Rehearsal Verification Protocol** distinguishing automated code validation from required human team practice.
4. **Known Technical & Scientific Limitations Register** ensuring complete transparency.
5. **Independent Reviewer Sign-Off Checklist** for Vibhushan Ganeshan.

---

## 2. Canonical Judges' Q&A (20 Prepared Answers)

Each response is engineered to be concise (45–75 words), accurate to the codebase, free of artificial jargon, and easy to deliver with confidence.

---

### Question 1: What problem does TriOrbit solve?
**Category:** *Mission & Problem Statement*
**Answer:**
> "Space science education often presents life-support engineering and space weather through abstract textbook reading or passive lectures. Young learners rarely understand why living on the Moon is difficult—how making oxygen drains electricity, or how solar storms threaten unshielded habitats. TriOrbit turns aerospace life-support engineering into an interactive, tactical simulator where children discover closed-loop resource stewardship through hands-on cause and effect."

---

### Question 2: Why did you choose children aged 7–12 as your audience?
**Category:** *Target Demographic & Pedagogy*
**Answer:**
> "Ages 7 to 12 represent a critical developmental stage where children transition from concrete operational thinking to abstract systems reasoning. It is also the age when lifelong STEM curiosity takes root. We designed the interface specifically for this group: high-contrast visuals, simple 0-to-100 resource gauges, and encouraging educational debriefs instead of punishing game-overs, making it accessible on school Chromebooks and tablets."

---

### Question 3: What makes your solution original compared to existing space games?
**Category:** *Originality & Innovation*
**Answer:**
> "Most space education tools fall into two extremes: either passive multiple-choice quizzes that lack engagement, or complex orbital simulators like Kerbal Space Program that overwhelm elementary students. TriOrbit is original because it pairs a tactile 2.5D lunar base interface with a strict two-action daily budget and real NASA space weather telemetry. It creates authentic operational tension with zero onboarding friction—no logins, no installs, and instant replay."

---

### Question 4: Why is NASA data essential to the project?
**Category:** *NASA Data & Challenge Relevance*
**Answer:**
> "On Earth, our thick atmosphere and magnetic field shield us from space weather, making cosmic radiation an invisible concept to kids. Integrating real NASA DONKI space weather observations from the STEREO A spacecraft grounds the game in real heliophysics. It shows students that solar storms are not science fiction—they are real phenomena observed by NASA that future Artemis astronauts must actively prepare for."

---

### Question 5: Is your NASA data real or simulated?
**Category:** *Scientific Honesty & Data Grounding*
**Answer:**
> "The observation itself is 100% authentic NASA data from the Space Weather Database of Notifications, Knowledge, and Information (DONKI)—specifically, a Solar Energetic Particle event observed by NASA's STEREO A spacecraft on May 11, 2024. However, the in-game resource consequences are educational simulation models. We maintain complete scientific honesty by separating authentic spacecraft metadata from educational game values across our UI and documentation."

---

### Question 6: How do you calculate radiation exposure in the game?
**Category:** *Heliophysics & Dosimetry Demarcation*
**Answer:**
> "We do not claim to calculate biological human tissue dosimetry in Grays or Sieverts, because spacecraft detectors in interplanetary space do not measure surface human absorption. Instead, `radiationRisk` is represented as an educational alert percentage from 0 to 100%. When a solar event strikes, risk rises, and players learn that sheltering crew beneath lunar regolith or activating deflector shields mitigates this hazard."

---

### Question 7: Why are resources represented using 0–100 points instead of real physical units?
**Category:** *Game Design & Cognitive Load*
**Answer:**
> "Physical units like kilograms of oxygen, kilowatt-hours, or liters of greywater introduce unit-conversion friction that distracts 7-to-12-year-olds from understanding systems dynamics. A normalized 0-to-100 scale provides instant visual comprehension: above 70 is nominal, below 20 is critical, and 0 triggers mission abort. It teaches closed-loop resource trade-offs clearly and universally across all reading levels."

---

### Question 8: How do you decide if a mission succeeds or fails?
**Category:** *Game Logic & Win/Loss Boundaries*
**Answer:**
> "Success requires completing all five simulated days with every life-support vital strictly above zero and Radiation Risk strictly below 100%. If any single vital reaches zero—such as running out of oxygen or power—or if radiation risk reaches 100%, the simulation immediately terminates in Mission Aborted. The results screen provides an educational diagnostic explaining exactly why the base failed and how to prevent it on replay."

---

### Question 9: How does your five-day engine work?
**Category:** *System Architecture & Progression*
**Answer:**
> "The engine operates as a deterministic state reducer built in pure TypeScript. Each morning, the commander receives an allowance of two maintenance actions across four habitat facilities. On Days 2, 3, and 4, an emergency dilemma must be resolved before maintenance. Once daily actions are spent, concluding the day applies overnight crew respiration and baseline power drain. The engine executes synchronously in browser memory with zero network latency."

---

### Question 10: Why is the simulation deterministic?
**Category:** *Software Engineering & Reproducibility*
**Answer:**
> "Determinism guarantees fairness, testability, and classroom utility. If two students enter the exact same sequence of maintenance actions and dilemma decisions, they receive the exact same vitals and score. This eliminates frustrating random dice rolls, allowing students to formulate scientific hypotheses, test different resource strategies, and discuss their results collaboratively like real mission controllers."

---

### Question 11: Why doesn't the application require a database?
**Category:** *Architecture & Privacy Compliance*
**Answer:**
> "Classroom privacy and frictionless accessibility were paramount. Requiring user accounts or a remote database introduces student privacy compliance hurdles under COPPA and FERPA, while adding network failure points. By managing game state in browser memory and caching NASA data in a Next.js server route, TriOrbit loads instantly on any school Chromebook, stores zero student data, and resets cleanly with one click."

---

### Question 12: How does the application behave if the internet disconnects?
**Category:** *Reliability & Fault Tolerance*
**Answer:**
> "TriOrbit is completely fault-tolerant. Our Next.js backend proxy caches verified historical NASA DONKI records in a bundled JSON fixture. If the internet disconnects or NASA's public API is rate-limited, the application automatically falls back to this verified offline dataset. The UI continues running smoothly, displaying an informative offline badge without crashing or interrupting the student's mission."

---

### Question 13: Can the game work on mobile devices?
**Category:** *Responsive UI & Cross-Platform Support*
**Answer:**
> "Yes. We engineered a responsive layout with mobile-first touch targets. On desktop screens, players interact directly with the 2.5D lunar base hotspots. On mobile screens, the interface adapts to a dedicated facility navigation bar with touch targets meeting or exceeding 48 pixels. The telemetry HUD stacks cleanly, ensuring intuitive touch navigation on smartphones and classroom tablets."

---

### Question 14: How did you test its accessibility?
**Category:** *Accessibility & WCAG Compliance*
**Answer:**
> "We followed WAI-ARIA standards throughout development. All dialog modals include focus trapping and `aria-modal` semantics, resource gauges use `role='progressbar'` with descriptive labels, color tokens meet WCAG AA contrast standards, and touch targets exceed 44 pixels. The entire application can be navigated using only a keyboard with Tab, Space, and Enter, verified in our automated accessibility test suites."

---

### Question 15: Which technologies did you use to build TriOrbit?
**Category:** *Technology Stack*
**Answer:**
> "We built TriOrbit using Next.js 16 App Router with React 19 and TypeScript, styled with Tailwind CSS. The simulation engine is pure TypeScript with zero external game dependencies. Visual assets are hand-coded inline vector SVG. Testing was conducted using the native Node.js test runner across 25 test suites with 124 passing assertions, verified by automated TypeScript type-checking and ESLint."

---

### Question 16: How did you use AI tools during the hackathon?
**Category:** *Ethics & AI Tooling Disclosure*
**Answer:**
> "We utilized AI assistants—specifically Antigravity IDE and GitHub Copilot—as engineering accelerators for code scaffolding, boilerplate typing, and test synthesis. However, all scientific boundaries, mathematical simulation formulas, system architectures, and educational texts were strictly designed, reviewed, and audited by our human team under our recorded Project Safety Contract. No unverified AI output was merged."

---

### Question 17: What did each team member contribute?
**Category:** *Team Collaboration & Work Breakdown*
**Answer:**
> "Abhinaya Jeyakumar served as team lead and UI architect, creating the Next.js scaffold, 2.5D SVG lunar base scene, interactive HUD, and design system. Vibhushan Ganeshan designed the canonical game contracts, pure simulation state reducer, five-day progression, and scoring engine. Nirsanth A. integrated the NASA DONKI API, authored educational scenarios, conducted the science and attribution audit, and built our automated test suites."

---

### Question 18: What would you improve with more development time?
**Category:** *Future Roadmap & Scalability*
**Answer:**
> "With more development time, we would implement collaborative multi-role classroom multiplayer—allowing three students to divide duties as Life Support, Power, and Science Officers. We would also expand mission scenarios to include historical NASA emergencies like Apollo 13, introduce Mars habitat physics, and incorporate synthesized radio voice telemetry using the Web Audio API."

---

### Question 19: How could TriOrbit be used in school classrooms?
**Category:** *Curriculum Alignment & Educational Use*
**Answer:**
> "Teachers can project TriOrbit onto a smartboard for whole-class mission command, or have students run individual expeditions on Chromebooks. Because a 5-day cycle takes under four minutes, a teacher can easily fit two or three runs into a single class period. It serves as an active springboard to discuss closed-loop life support, solar physics, and the Artemis program."

---

### Question 20: How does this project support future space exploration?
**Category:** *Artemis Program & Long-Term Vision*
**Answer:**
> "NASA's Artemis campaign will establish humanity's first permanent base camp on the Moon, but sustaining that vision requires inspiring the next generation of engineers and scientists. TriOrbit demystifies the real engineering hurdles of extraterrestrial survival—power storage, radiation shielding, and in-situ resource utilization—showing young students that living on the Moon is a solvable challenge they can be part of."

---

## 3. Demonstration Failure Recovery Plan

Live technology demonstrations carry inherent risks. Follow these contingency protocols if an anomaly occurs during the presentation:

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  Anomaly 1: API Outage  │ ──> │ Auto-Fallback Active    │ ──> │ State: "Built-in offline│
│  (NASA DONKI Unreached) │     │ (verified-events.json)  │     │ resilience demonstrated"│
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  Anomaly 2: Server Down │ ──> │ Switch to 6-Slide Deck  │ ──> │ State: "Presenting from │
│  (Localhost Unreachable)│     │ (submission/DEMO_SCRIPT)│     │ verified application"   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  Anomaly 3: Screen Lag  │ ──> │ Co-Presenter Shares     │ ──> │ Primary Presenter Keeps │
│  (Screen Share Freezes) │     │ (Vibhushan / Nirsanth)  │     │ Speaking without Pause  │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

| Failure Scenario | Immediate Action | Presenter Voiceover Script | Technical Root Cause |
|---|---|---|---|
| **1. NASA API Unavailable or Rate-Limited** | None needed. Application automatically loads bundled `verified-events.json` fixture. | *"Notice our HUD displays our offline resilience badge. TriOrbit automatically falls back to verified NASA archive data to ensure uninterrupted classroom play."* | Upstream HTTP 404/429 handled by `/api/nasa/events` route handler. |
| **2. Internet Disconnects During Pitch** | Continue playing normally. Application runs entirely client-side. | *"Because TriOrbit executes its simulation entirely in browser memory, our lunar base continues running even during total internet loss."* | Pure client state reducer does not make outbound network calls during turns. |
| **3. Local Dev Server Fails to Start** | Switch immediately to the verified Six-Slide Presentation Deck (`submission/DEMO_SCRIPT.md`). | *"Judges, while our local development container reboots, let's step through our verified application walkthrough deck showing our integrated production build."* | Production build assets and screenshots pre-verified in TRI-026. |
| **4. Browser Tab Freezes or Crashes** | Press `Ctrl+Shift+T` or open a new tab at `http://localhost:3000/play`. | *"Resetting our telemetry terminal now—our deterministic engine initializes a fresh expedition in under 200 milliseconds."* | Instant initialization via `createInitialMission()`. |
| **5. Screen Sharing Freezes on Video Call** | Co-presenter (Vibhushan or Nirsanth) takes over screen share; primary speaker continues speaking. | *"Handing screen broadcast over to Vibhushan while we continue inspecting our life support telemetry."* | Standby shared repository clone ready on secondary machine. |
| **6. Accidental Button Click Triggers Game Over** | Turn it into an educational demonstration of the results screen! | *"And notice what happens when a commander takes a critical risk: our debrief screen explains the exact life support system that failed, turning mistakes into learning moments."* | `ResultsScreen.tsx` cleanly renders educational diagnostic debrief. |
| **7. Pitch Running Over Time (4:00 reached at Day 1)** | Skip optional module maintenance; immediately click "Finish Day" to trigger the Day 2 NASA event, then jump to conclusion. | *"To respect our five-minute limit, let's fast-forward directly to our authentic NASA space weather event on Day 2."* | Preserves core evaluation criteria within strictly enforced time limit. |

---

## 4. Rehearsal Verification & Quality Assurance Checklist

> [!CAUTION]
> The automated test suite has passed 124 of 124 assertions in integration testing. However, a successful live presentation requires timed human rehearsal. Items requiring physical execution are explicitly classified.

### Human Rehearsal Checklist

| Checkpoint | Target Standard | Verification Method | Status | Notes / Instructions |
|---|---|---|:---:|---|
| **1. Integrated Application Build** | Clean build with static routes (`/`, `/play`) and API route (`/api/nasa/events`) | `npm run build` | **VERIFIED** | Passed in TRI-021 / TRI-026 audits |
| **2. TypeScript & Lint Integrity** | 0 TypeScript errors, 0 ESLint warnings | `npx tsc --noEmit && npm run lint` | **VERIFIED** | 0 errors, 0 warnings across all files |
| **3. Automated Test Suite** | 100% deterministic pass across all game contracts | Native test runner | **VERIFIED** | 124 passing assertions (TRI-021) |
| **4. Timed Human Speaking Rehearsal** | Spoken delivery completes in under 4 minutes 45 seconds | Physical stopwatch dry run | **NOT VERIFIED** | **Action for Abhinaya:** Complete 1 live dry run with timer |
| **5. Screen-by-Screen Click Practice** | All clicks executed in sync with spoken voiceover | Browser rehearsal on localhost | **NOT VERIFIED** | **Action for Abhinaya:** Practice clicks listed in `PITCH_SCRIPT.md` |
| **6. Handover Verbal Cues (if panel)** | Seamless 2-second handovers between Abhinaya, Nirsanth, Vibhushan | Team dry run on voice call | **NOT VERIFIED** | **Action for Team:** Rehearse Section 4 handovers if presenting as trio |
| **7. NASA API Fallback Injection Test** | Disconnect Wi-Fi and verify Day 2 event loads with offline provenance | Manual network disconnect test | **NOT VERIFIED** | **Action for Nirsanth:** Test `verified-events.json` fallback locally |
| **8. Meeting Link & Presentation Slot** | Zoom / Webex slot confirmed with Space Apps Local Lead | Local event communication | **NOT VERIFIED** | **Action for Abhinaya:** Check local event schedule and meeting link |
| **9. Backup Presentation Slides Loaded** | 6-slide deck tab open and ready as contingency | Browser tab prepared | **NOT VERIFIED** | **Action for Team:** Have `submission/DEMO_SCRIPT.md` open |

---

## 5. Known Technical & Scientific Limitations Register

To uphold academic integrity and prevent false claims during judging:

1. **Space Weather vs. Surface Dosimetry:**
   - STEREO A detects protons in interplanetary orbit; it does **not** measure absorbed radiation dose on the lunar surface.
   - The game's `radiationRisk` scale is an educational simulation point system ($0–100$), not a biological measurement in Grays or Sieverts.
2. **Simplified Life Support Physics:**
   - Habitat resource consumption rates ($-16\ O_2$, $-14\ \text{Power}$, etc.) are calibrated for game balance across 5 days, not calculated from NASA-STD-3001 metabolic charts.
3. **Single Dilemma Schedule:**
   - Days 2, 3, and 4 each present exactly one scheduled emergency dilemma; Days 1 and 5 feature pure base maintenance.
4. **Single-Player Focus:**
   - The current release focuses on a single Commander role; collaborative multi-role networking is reserved for future work.
5. **Pending Public Slide Deck URL:**
   - The public Google Slides link in `submission/DEMO_LINK.txt` remains marked `PENDING` awaiting team publication; the presentation script strictly utilizes the verified repository codebase.

---

## 6. Independent Reviewer Sign-Off Checklist

*For completion by Independent Reviewer Vibhushan Ganeshan (`@Vibhushan-2003`):*

- [ ] Verified that `submission/PITCH_SCRIPT.md` adheres to the 5-minute presentation budget.
- [ ] Confirmed that all 20 canonical questions in `submission/QA_PREP.md` reflect actual repository code and contracts.
- [ ] Verified that the screen-by-screen demonstration flow accurately mirrors `/play` interface behavior.
- [ ] Confirmed that NASA scientific disclaimers strictly distinguish STEREO A space weather from educational game points.
- [ ] Confirmed that offline backup recovery plans align with the Next.js route handler implementation.
- [ ] Confirmed that unperformed human dry runs and organizer meeting confirmations are transparently marked **NOT VERIFIED**.
