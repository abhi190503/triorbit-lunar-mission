# TriOrbit GitHub Workflow & Repository Governance

> **Task ID:** TRI-005
> **Status:** APPROVED & ACTIVE
> **Repository:** [`abhi190503/triorbit-lunar-mission`](https://github.com/abhi190503/triorbit-lunar-mission)
> **Project Board:** [`TriOrbit | NASA Space Apps 2026`](https://github.com/users/abhi190503/projects/1)
> **Primary Owner:** Abhinaya Jeyakumar (`@abhi190503`)
> **Independent Reviewer:** Nirsanth A. (`@nirsanth23`)
> **Engine & Integration Lead:** Vibhushan Ganeshan (`@Vibhushan-2003`)
> **Authorized Hackathon Start:** 14 November 2026, 09:00 Asia/Colombo

---

## 1. Repository Governance & Organization

This workflow document defines the branch strategy, pull request rules, task tracking protocol, and synchronization standards for the **TriOrbit Lunar Survival Simulator** project in the **NASA Space Apps Challenge Colombo 2026**.

### 1.1 Repository & Project Board Details

| Property | Value | Notes |
|---|---|---|
| **Repository Name** | `triorbit-lunar-mission` | Official competition codebase |
| **Repository URL** | [`https://github.com/abhi190503/triorbit-lunar-mission`](https://github.com/abhi190503/triorbit-lunar-mission) | Remote `origin` |
| **GitHub Projects Board** | [`TriOrbit \| NASA Space Apps 2026`](https://github.com/users/abhi190503/projects/1) | Board ID `1` (Project node `PVT_kwHOCSAwxM4Bri9Z`) |
| **Repository Owner** | Abhinaya Jeyakumar (`abhi190503`) | Repository administrator & UI lead |
| **Base Integration Branch** | `develop` | Default target for all task pull requests |
| **Stable Release Branch** | `main` | Production-ready, verified demo code only |
| **Active Collaborators** | `@abhi190503`, `@Vibhushan-2003`, `@nirsanth23` | Direct committers across dedicated workstreams |

### 1.2 Task IDs vs. GitHub Issue Numbers

To maintain clean traceability across requirements, code commits, and project tracking:

- **Task IDs (`TRI-001` through `TRI-031`):** Immutable canonical architecture task identifiers. Every task has a frozen scope defined in `planning/master_prompts/TRI-###.md` and `planning/OWNERSHIP_AND_DEPENDENCIES.md`. All Git commits, branch names, and documentation references must explicitly include the Task ID.
- **GitHub Issue Numbers (`#1` through `#31`):** Platform-assigned identifiers created on GitHub. In this repository, GitHub issues were created sequentially and match 1:1 with Task IDs (`TRI-001` = Issue `#1`, ..., `TRI-031` = Issue `#31`).
- **Distinction in Practice:**
  - Branch names and commit subjects reference the **Task ID** (e.g., `docs(workflow): finalize GitHub process and NASA submission checklist (TRI-005)`).
  - PR bodies and commit trailers reference the **GitHub Issue Number** using GitHub keywords (e.g., `Addresses #5`, `Closes #5`) to enable platform issue tracking.

---

## 2. Team Ownership & 31-Task Matrix

The team operates across three concurrent, non-overlapping workstreams to eliminate development bottlenecks during the fast-paced 48-hour hackathon.

### 2.1 Core Ownership Domains

1. **Abhinaya Jeyakumar (`abhi190503`) — UI & Application Bootstrap:**
   - Next.js 14+ App Router project scaffolding, Tailwind CSS configuration, and design tokens (`src/app/*`, `src/styles/*`).
   - Landing screen, 30-second mission briefing tutorial, and modal shells.
   - Cinematic 2.5D lunar base SVG scene with 4 interactive module hotspots.
   - Mission HUD displaying day counters, actions remaining, and normalized vital gauges (display props and fixtures).
   - Touch/keyboard accessibility pass (`TRI-022`) and final presentation rehearsal (`TRI-028`).

2. **Vibhushan Ganeshan (`Vibhushan-2003`) — Pure Simulation Engine & Integration:**
   - Canonical TypeScript contracts, types, and mock fixture specifications (`src/lib/game/types.ts`).
   - Pure, deterministic resource simulation engine (`src/lib/game/engine.ts`).
   - 5-day progression state machine, scoring calculation, and win/loss outcome evaluation (`src/lib/game/progression.ts`).
   - Wiring interactive module clicks to engine callbacks (`TRI-016`).
   - End-to-end integration into `develop` and promotion to `main` (`TRI-020`).
   - Optional local progress persistence (`TRI-024`) and Vercel production deployment (`TRI-030`).

3. **Nirsanth A. (`nirsanth23`) — NASA Backend, Science Scenarios & Independent QA:**
   - Server-side Next.js Route Handler `GET /api/nasa/events` with real NASA DONKI SEP/FLR queries and resilient historical fallback (`src/app/api/nasa/events/*`, `src/lib/nasa/*`).
   - 3 mission dilemma scenario definitions and educational outcome mappings (`src/data/scenarios.json`).
   - Standalone event choice modal UX (`src/components/events/*`).
   - NASA Science Facts panel with explicit scientific provenance and telemetry disclosures (`src/components/learn/*`).
   - Mission results debrief and replay breakdown (`src/components/results/*`).
   - Independent verification, smoke tests, and negative-path regression testing (`TRI-021`).
   - Science citations, licensing, and AI disclosure audit (`TRI-025`), plus README authoring (`TRI-027`).

### 2.2 Canonical 31-Task Ownership Matrix

| Task ID | Issue # | Task Title | Owner | Reviewer | Prerequisites (`Blocked by`) | Est (h) | Workstream |
|---|---|---|---|---|---|---:|---|
| **TRI-001** | #1 | Freeze challenge, scope and cut list | Abhinaya | Vibhushan | *None* (Merged in PR #32) | 0.4 | UI/Bootstrap |
| **TRI-002** | #2 | NASA science and evidence map | Nirsanth | Vibhushan | TRI-001 | 1.0 | Science/QA |
| **TRI-003** | #3 | Freeze simulation rules and balanced scenarios | Vibhushan | Abhinaya | TRI-001 | 1.0 | Engine |
| **TRI-004** | #4 | Freeze distinctive UI storyboard and interaction map | Abhinaya | Nirsanth | TRI-001 | 1.0 | UI/Bootstrap |
| **TRI-005** | #5 | Freeze GitHub workflow and NASA submission checklist | Abhinaya | Nirsanth | TRI-001 | 0.5 | UI/Bootstrap |
| **TRI-006** | #6 | 9am repo, board, Next.js scaffold and branch setup | Abhinaya | Vibhushan | TRI-005 | 1.0 | UI/Bootstrap |
| **TRI-007** | #7 | Create shared interfaces and mock fixture contracts | Vibhushan | Abhinaya | TRI-003, TRI-006 | 0.7 | Engine |
| **TRI-008** | #8 | Pure resource simulation engine | Vibhushan | Abhinaya | TRI-007 | 2.0 | Engine |
| **TRI-009** | #9 | Five-day progression, score and outcomes | Vibhushan | Nirsanth | TRI-008 | 1.2 | Engine |
| **TRI-010** | #10 | NASA DONKI backend route, normalization and safe fallback | Nirsanth | Vibhushan | TRI-002, TRI-006 | 2.2 | Science/QA |
| **TRI-011** | #11 | Three concise mission events and consequences | Nirsanth | Vibhushan | TRI-002, TRI-003 | 1.5 | Science/QA |
| **TRI-012** | #12 | Design tokens and reusable game shell | Abhinaya | Nirsanth | TRI-004, TRI-006 | 1.0 | UI/Bootstrap |
| **TRI-013** | #13 | Landing screen and 30-second tutorial | Abhinaya | Nirsanth | TRI-012 | 1.0 | UI/Bootstrap |
| **TRI-014** | #14 | Original clickable lunar base SVG scene | Abhinaya | Nirsanth | TRI-012 | 2.6 | UI/Bootstrap |
| **TRI-015** | #15 | Mission HUD: day, status, resources | Abhinaya | Vibhushan | TRI-012 | 1.2 | UI/Bootstrap |
| **TRI-016** | #16 | Bind building interactions to engine actions | Vibhushan | Abhinaya | TRI-008, TRI-009, TRI-014, TRI-015 | 1.6 | Engine |
| **TRI-017** | #17 | Mission event modal and choice consequences UX | Nirsanth | Abhinaya | TRI-011 | 1.1 | Science/QA |
| **TRI-018** | #18 | NASA science facts panel and attribution | Nirsanth | Vibhushan | TRI-002 | 0.8 | Science/QA |
| **TRI-019** | #19 | Mission results, success/failure and replay | Nirsanth | Abhinaya | TRI-003 | 1.0 | Science/QA |
| **TRI-020** | #20 | End-to-end integration into develop and stable main | Vibhushan | Abhinaya | TRI-009, TRI-010, TRI-013..TRI-019 | 2.0 | Engine |
| **TRI-021** | #21 | Smoke tests, regression and failure cases | Nirsanth | Vibhushan | TRI-020 | 1.3 | Science/QA |
| **TRI-022** | #22 | Responsive + keyboard accessibility fix pass | Abhinaya | Nirsanth | TRI-014, TRI-015 | 1.0 | UI/Bootstrap |
| **TRI-023** | #23 | Motion and visual polish within strict budget | Abhinaya | Vibhushan | TRI-014, TRI-015 | 1.0 | UI/Bootstrap |
| **TRI-024** | #24 | Optional local saved progress | Vibhushan | Abhinaya | TRI-020 | 0.8 | Engine |
| **TRI-025** | #25 | Science, references and AI/license audit | Nirsanth | Abhinaya | TRI-002, TRI-010, TRI-011, TRI-018 | 1.0 | Science/QA |
| **TRI-026** | #26 | Produce 30-second subtitled demo OR max-seven slides | Nirsanth | Abhinaya | TRI-020, TRI-025 | 1.1 | Science/QA |
| **TRI-027** | #27 | Complete README, project description and links | Nirsanth | Vibhushan | TRI-002, TRI-010 | 0.9 | Science/QA |
| **TRI-028** | #28 | Rehearse virtual 5-minute pitch and Q&A | Abhinaya | Vibhushan | TRI-014, TRI-015 | 0.9 | UI/Bootstrap |
| **TRI-029** | #29 | Complete NASA project page and verify submission | Abhinaya | Nirsanth | TRI-025, TRI-026, TRI-027 | 0.9 | UI/Bootstrap |
| **TRI-030** | #30 | Optional Vercel deployment | Vibhushan | Abhinaya | TRI-020 | 1.0 | Engine |
| **TRI-031** | #31 | Optional expanded replay insights/scenarios | Vibhushan | Nirsanth | TRI-020 | 1.0 | Engine |

---

## 3. Branch Strategy & Governance

Our branching strategy optimizes for continuous parallel velocity without locking engineers behind serial Pull Requests.

```
       [main]  <====================================== (Verified release only)
          ^                                                  ^
          | (Sprint start)                                   | (TRI-020 Integration PR)
          v                                                  |
      [develop] <---+-----------------+------------------+---+
                    |                 |                  |
           [work/abhinaya-ui] [work/vibhushan-engine] [work/nirsanth-science]
                    |                 |                  |
             (UI Commits)      (Engine Commits)   (NASA & Science Commits)
```

### 3.1 Branch Definitions

1. **`main` (Protected Release Demo Branch):**
   - Represents the frozen, verified, production-ready competition deliverable.
   - Direct pushes and forced updates are strictly forbidden.
   - Updated exclusively via reviewed Pull Requests from `develop` following comprehensive smoke testing.
2. **`develop` (Integration Base Branch):**
   - The primary integration branch where all workstream branches and task Pull Requests land.
   - Must remain buildable at all times once bootstrapped in TRI-006.
3. **`work/abhinaya-ui` (UI & Application Shell Workstream):**
   - Owned by Abhinaya for Next.js scaffolding, UI components, scenes, HUD, and styles.
4. **`work/vibhushan-engine` (Engine & Integration Workstream):**
   - Owned by Vibhushan for TypeScript contracts, deterministic game engine, and integration.
5. **`work/nirsanth-science` (NASA Science & QA Workstream):**
   - Owned by Nirsanth for API route handlers, DONKI integration, scenario content, and QA suites.
6. **`integrate/mission` (Controlled Integration Branch):**
   - Optional temporary integration branch owned by Vibhushan for complex multi-workstream merges during TRI-020.
7. **Short-Lived Task / Documentation Branches:**
   - Dedicated task branches cut directly from `origin/develop` (e.g., `docs/tri-005-workflow-submission`) when focused, atomic reviews are required prior to workstream batching.

### 3.2 Branch Protection Recommendations

To prevent accidental data loss or regression during late-night hackathon coding:
- **`main` Rules:** Require at least 1 independent teammate review; require passing status checks; disallow force pushes; disallow branch deletion.
- **`develop` Rules:** Require at least 1 independent teammate review; require linear history (squash or rebase merge); disallow force pushes.

*(Note: On personal GitHub Free accounts, branch protection rules for private/public repositories should be activated via Repository Settings > Branches once the repository is made fully public for judging).*

---

## 4. Safe Synchronization & Preflight Protocol

Every team member and AI coding assistant must perform preflight checks before modifying or committing any files.

### 4.1 Mandatory Preflight Steps

1. **Verify Identity & Workspace:** Confirm authenticated GitHub username matches the task assignment.
2. **Inspect Working Tree:** Ensure no uncommitted modifications or untracked files are present.
3. **Fetch Upstream State:** Fetch all remote branches from `origin` without altering local working files.
4. **Verify Tracking Configuration:** Ensure the current branch tracks its upstream counterpart.
5. **Fast-Forward Only:** Never create accidental merge bubbles on working branches.
6. **Divergence Guard:** If local and remote histories diverge, stop immediately and inspect before rebasing.

### 4.2 Verified PowerShell Commands

```powershell
# 1. Navigate to repository root
cd D:\NASA\triorbit-lunar-mission

# 2. Check current status and active branch
git status -sb
git branch -vv

# 3. Fetch latest references from remote
git fetch origin

# 4. Check for divergence against remote develop
git log HEAD..origin/develop --oneline

# 5. Safely update current branch (fast-forward only)
git pull --ff-only

# 6. Verify authenticated GitHub CLI identity
gh auth status
gh api user --jq .login
```

> [!CAUTION]
> **Prohibited Git Commands:**
> - `git reset --hard` (destroys uncommitted code)
> - `git clean -fd` (deletes untracked work)
> - `git push --force` or `git push -f` (overwrites remote history)
> - Direct pushes to `origin/main` or `origin/develop`

---

## 5. Dependency Management & Blocking Rules

Dependencies are strictly enforced to prevent teammates from writing incompatible or throwaway code.

### 5.1 Verification Over Assumption
- An open or closed issue alone is not sufficient evidence of completion. The required code, exports, or documentation must be committed, reviewed, and accessible in the repository.
- Planning documents (`planning/*`) describe requirements; they do not constitute implemented code.

### 5.2 Independent Parallel Lanes via Mock Fixtures
- To allow Abhinaya to build UI immediately without waiting for engine logic, UI components must consume **display-only props and local typed fixtures**.
- UI components must **never** create duplicate simulation logic or alternative `GameState` types.
- Nirsanth builds NASA route handlers and scenario JSON conforming to the frozen DTO shapes in `planning/INTERFACES.md`.

### 5.3 What to Do When Blocked
If a task's prerequisites are not satisfied and no approved mock contract exists:
1. **Do not fabricate unapproved code:** Do not implement the missing prerequisite under another owner's domain.
2. **Flag Status:** Update the task status to `Blocked` on the GitHub Projects board.
3. **Comment on Issue:** Leave a clear comment identifying the missing dependency, its owner, and the exact export or commit needed.
4. **Pivot to Unblocked Work:** Switch to an independent, unblocked task in your assigned workstream (refer to `planning/PARALLEL_START_PLAN.md`).

---

## 6. GitHub Projects Status Workflow

The project board [`TriOrbit | NASA Space Apps 2026`](https://github.com/users/abhi190503/projects/1) tracks all 31 tasks through distinct lifecycle stages:

```
[Backlog] ──> [Ready] ──> [In Progress] ──> [In Review] ──> [Testing] ──> [Done]
                               │
                               └──> [Blocked]
```

### 6.1 State Definitions

| Status | Meaning & Criteria |
|---|---|
| **Backlog** | Task specification exists, but prerequisites are incomplete or work has not commenced. |
| **Ready** | All prerequisites are satisfied; specification is frozen; task is unblocked and ready for pickup. |
| **In Progress** | Owner is actively working on the task; branch is checked out; implementation is underway. |
| **Blocked** | Work is halted because a required prerequisite, external resource, or team handoff is missing. |
| **In Review** | Implementation is complete; unit/lint checks pass; Pull Request is open targeting `develop` and awaiting review. |
| **Testing** | PR is merged or staged; end-to-end integration or QA smoke testing is underway (e.g., TRI-021). |
| **Done** | Code is reviewed, verified against acceptance criteria, and merged into `develop` (or `main` for release tasks). |

### 6.2 Managing Status via GitHub CLI

Status updates can be performed programmatically via `gh project` commands or directly in the web UI.

```powershell
# Update task status to "In Progress" (Field ID: PVTSSF_lAHOCSAwxM4Bri9Zzhp1Ngc, Option: 8fb6784d)
gh project item-edit --id <ITEM_ID> --project-id PVT_kwHOCSAwxM4Bri9Z --field-id PVTSSF_lAHOCSAwxM4Bri9Zzhp1Ngc --single-select-option-id 8fb6784d

# Update task status to "In Review" (Option: 99fc56fc)
gh project item-edit --id <ITEM_ID> --project-id PVT_kwHOCSAwxM4Bri9Z --field-id PVTSSF_lAHOCSAwxM4Bri9Zzhp1Ngc --single-select-option-id 99fc56fc

# Update task status to "Done" (Option: 4c1388c7)
gh project item-edit --id <ITEM_ID> --project-id PVT_kwHOCSAwxM4Bri9Z --field-id PVTSSF_lAHOCSAwxM4Bri9Zzhp1Ngc --single-select-option-id 4c1388c7
```

---

## 7. Pull Request & Review Protocol

### 7.1 Commit Message Convention
Commits must be atomic, descriptive, and reference the specific Task ID:

```
<type>(<scope>): <summary> (TRI-###)

[optional body explaining context and technical decisions]
```

- **Types:** `feat` (new feature), `fix` (bug fix), `docs` (documentation), `test` (test suite), `refactor` (code refactoring), `chore` (maintenance/setup).
- **Examples:**
  - `docs(spec): freeze challenge, scope and cut list (TRI-001)`
  - `docs(workflow): finalize GitHub process and NASA submission checklist (TRI-005)`
  - `feat(engine): implement pure resource simulation step (TRI-008)`
  - `feat(nasa): implement DONKI SEP route handler with fallback (TRI-010)`

### 7.2 Pull Request Standards
- **Target Branch:** All feature and task PRs must target `develop`. Only the final release PR targets `main`.
- **Title Format:** `<type>: <Short description> (TRI-###)`
- **PR Description Checklist:**
  - Associated GitHub Issue reference (`Addresses #5` or `Closes #5`).
  - Summary of technical changes.
  - Acceptance criteria validation table.
  - Test evidence (terminal outputs, lint/build logs).
  - Explicit assignment of the designated independent reviewer.
- **Merge Governance:**
  - Never self-merge a PR without independent teammate approval.
  - No automated bots or auto-merge actions allowed.
  - Squash and merge or rebase merge preferred to preserve linear integration history on `develop`.

---

## 8. Continuous Integration & Deployment (CI/CD) Architecture

### 8.1 Approved Tooling Selection
- **Continuous Integration (CI):** GitHub Actions.
- **Continuous Deployment (CD):** Vercel GitHub Integration.

### 8.2 Execution Plan & Pre-Scaffold Boundary
- **Pre-Scaffold State:** CI pipelines cannot run until TRI-006 bootstraps the Next.js project root, `package.json`, and dependencies. No CI configuration files (`.github/workflows/*.yml`) shall be created during TRI-005.
- **Planned CI Pipeline (to be configured in TRI-006 / TRI-021):**
  1. `npm ci` — Clean reproducible dependency installation.
  2. `npm run lint` — ESLint validation against Next.js core web vitals rules.
  3. `npx tsc --noEmit` — Strict TypeScript type checking.
  4. `npm test` — Vitest unit test execution for game engine and route handlers.
  5. `npm run build` — Production Next.js build compilation.
- **Planned Deployment Pipeline (TRI-030):**
  - Preview deployments automatically generated by Vercel for every Pull Request targeting `develop`.
  - Production deployment automatically triggered when verified release commits land on `main`.

---

## 9. Security, Provenance & Quality Standards

1. **Protect Environment Secrets:**
   - Server-side `NASA_API_KEY` must never be exposed to the browser client or prefixed with `NEXT_PUBLIC_`.
   - `.env*.local` and secret files must remain strictly ignored by `.gitignore`.
2. **Preserve Scientific Honesty:**
   - NASA DONKI space weather events represent real historical spacecraft observations (solar flares, coronal mass ejections, solar energetic particles).
   - In-game radiation risk alert points (0–100%) and vital consumption rates are **educational game models**, not measured lunar astronaut absorbed doses.
   - Every NASA-linked event must display its source URL, spacecraft origin, and retrieval timestamp.
3. **NASA Branding Protection:**
   - Never generate, spoof, or modify official NASA insignias, meatball logos, or worm logos.
   - Use text attribution and links to official NASA open resources.
4. **Attribution & AI Transparency:**
   - AI-assisted coding tools (Antigravity, Gemini) must be disclosed transparently in project documentation.
   - All external audio, visual assets, fonts, and open-source libraries must have clear licensing and provenance recorded in `docs/SCIENCE_SOURCES.md` and `README.md`.
