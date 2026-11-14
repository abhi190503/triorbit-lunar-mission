# TriOrbit — Lunar Survival Simulator

> **NASA Space Apps Challenge 2026** — *Junior Astronaut Mission Trainer*  
> **Repository:** [abhi190503/triorbit-lunar-mission](https://github.com/abhi190503/triorbit-lunar-mission)  
> **Project Board:** [TriOrbit | NASA Space Apps 2026](https://github.com/users/abhi190503/projects/1)

---

## 🚀 Mission Overview

**TriOrbit Lunar Survival Simulator** is an interactive, browser-based mission trainer designed for junior astronauts (ages 7–12) to learn survival strategies, resource balance, and space weather science on the Moon.

- **Duration & Loop:** 5 simulated lunar days, 2 operational/maintenance decisions per day.
- **Resource Management:** 5 core vitals — Oxygen ($O_2$), Power ($kW$), Water ($L$), Food rations ($kg$), and Radiation Risk (alert level).
- **Interactive Lunar Base:** Cinematic 2.5D SVG environment featuring 4 interactive modules (Life Support Habitat, Solar Array & Power Station, Hydroponics Bay, and Shielded Lunar Bunker).
- **NASA Space Weather Integration:** Live and verified-fallback integration with NASA Space Weather Database Of Notifications, Knowledge, Information (DONKI) for Solar Energetic Particle (SEP) storm alerts.
- **Science Protocol:** Clear educational distinction between measured historical NASA spacecraft observations and educational game simulation assumptions.

---

## 👥 Team TriOrbit & Responsibilities

| Team Member | Role | Workstream & Focus Area |
|---|---|---|
| **Abhinaya Jeyakumar** (`@abhi190503`) | **Team Leader** | Repository setup, project architecture, 2.5D SVG lunar base scene, interactive HUD, landing & game shell (`work/abhinaya-ui`) |
| **Vibhushan Ganeshan** | **Simulation Lead** | Canonical TypeScript contracts, deterministic game engine, 5-day cycle progression, score/outcome calculations, end-to-end integration (`work/vibhushan-engine`, `integrate/mission`) |
| **Nirsanth A.** | **NASA & QA Lead** | NASA DONKI API route handler, offline fallback, JSON scenario data, educational modals & science attribution, independent test suite (`work/nirsanth-science`) |

---

## 🌿 Git Branching Strategy & Workflow

To maximize speed and parallel progress during the hackathon, the team operates across non-overlapping file boundaries with grouped PRs:

- `main` — Production-ready, verified demo code only.
- `develop` — Integration branch; target base for all workstream pull requests.
- `work/abhinaya-ui` — Abhinaya's visual UI, SVG scene, HUD, design tokens.
- `work/vibhushan-engine` — Vibhushan's pure TypeScript game simulation engine and type definitions.
- `work/nirsanth-science` — Nirsanth's NASA backend route handler, scenario data, educational panels.
- `integrate/mission` — Final integration branch for assembling lanes before merging into `develop` and promoting to `main`.

---

## 📋 Task Tracking & Project Board

All 31 canonical tasks (`TRI-001` through `TRI-031`) are tracked on the GitHub Projects board and mapped to GitHub issues:

- **Board:** [TriOrbit | NASA Space Apps 2026](https://github.com/users/abhi190503/projects/1)
- **Issue Mapping:** [`planning/created_issue_links.csv`](planning/created_issue_links.csv)

---

## 📚 Canonical Planning & Master Documentation

All canonical planning assets, specifications, and task prompts are committed in the [`planning/`](planning/) directory:

- [README_START_HERE.md](planning/README_START_HERE.md) — Kickoff overview & sequence
- [PARALLEL_START_PLAN.md](planning/PARALLEL_START_PLAN.md) — Authoritative parallel execution plan
- [OWNERSHIP_AND_DEPENDENCIES.md](planning/OWNERSHIP_AND_DEPENDENCIES.md) — 31-task ownership and dependency matrix
- [GITHUB_WORKFLOW.md](planning/GITHUB_WORKFLOW.md) — Branching, commit conventions, and review rules
- [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) — **Frozen Product Requirements & Scope (TRI-001 Approved)**
- [PROJECT_SPEC.md](planning/PROJECT_SPEC.md) — Functional specifications & constraints
- [GAME_RULES.md](planning/GAME_RULES.md) — Core mechanics, resource formulas, and outcome rules
- [INTERFACES.md](planning/INTERFACES.md) — Frozen TypeScript DTOs and API contract
- [SCIENCE_PROTOCOL.md](planning/SCIENCE_PROTOCOL.md) — NASA API provenance & educational disclosure guidelines
- [SATURDAY_9AM_RUNBOOK.md](planning/SATURDAY_9AM_RUNBOOK.md) — Timeline & runbook
- [STARTING_SEQUENCE_BY_MEMBER.md](planning/STARTING_SEQUENCE_BY_MEMBER.md) — Member startup procedures
- [SUNDAY_PITCH_SUBMIT.md](planning/SUNDAY_PITCH_SUBMIT.md) — Submission and pitch guidelines
- [CUT_AND_RECOVERY.md](planning/CUT_AND_RECOVERY.md) — Contigency cut list and recovery plan
- [issue_index.csv](planning/issue_index.csv) — Complete index of all 31 tasks
- [Master Prompts (`planning/master_prompts/`)](planning/master_prompts/) — All 31 single-task master prompts
- [Issue Specifications (`planning/issues/`)](planning/issues/) — All 31 task issue bodies
