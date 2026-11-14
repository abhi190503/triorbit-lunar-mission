# GitHub workflow — 3 parallel lanes, SwiftDrop discipline without PR bottlenecks

## Proposed repository and board (not created by this pack)
- Repository `triorbit-lunar-mission` under verified owner account; public before submission.
- Project board `TriOrbit | NASA Space Apps 2026`.
- Each GitHub Issue title starts with stable `[TRI-###]`, where GitHub `#number` is a distinct actual issue identifier.
- Statuses: Backlog, Ready, In Progress, In Review, Testing, Done, Blocked.
- Optional fields: Priority, Workstream, Phase, Estimate, actual GitHub assignee, PR URL. Issue bodies record canonical dependencies.

## Branches
- `main`: verified stable demo only.
- `develop`: integrated working code, PR base for all workstreams.
- `work/abhinaya-ui`: original interface, scaffold ownership and UI files.
- `work/vibhushan-engine`: canonical pure TypeScript engine and types.
- `work/nirsanth-science`: NASA backend + scenario records + standalone educational components.
- `integrate/mission`: Vibhushan-owned integration, cut only after workstreams merge into develop.

Each task remains independently tracked via one GitHub Issue and matching task prompt. In a one-day hackathon, **one atomic commit per task ID and one grouped PR per workstream** is allowed, rather than forcing 31 serial review gates. Write commit messages such as `feat(ui): lunar interactive scene (TRI-014)`. PR description must reference each actual GitHub issue and indicate acceptance checks/tests. Avoid merging workstream PRs with untested code.

## Nonoverlapping file ownership
- **Abhinaya:** `src/app/*` except API route, `src/components/game/*` scenes/HUD/landing, global CSS and design. Owns bootstrap of project root.
- **Vibhushan:** `src/lib/game/*` canonical contracts, state, rules, tests. Later integrates UI in agreed files after Abhinaya's workstream is merged.
- **Nirsanth:** `src/app/api/nasa/events/*`, `src/lib/nasa/*`, `src/data/scenarios.json`, `src/components/events/*`, `src/components/learn/*`, `src/components/results/*`, `docs/SCIENCE_SOURCES.md`, source audit.
- Only one owner should modify any shared file at once. If a needed file crosses boundary, record and get approval before writing.

## Starts and gate definitions
- Actual code start ≥14 Nov 2026 09:00 Asia/Colombo.
- Abhinaya bootstraps. Others may conduct research/contract review but must not create a second competition repo.
- Frontend display-only fixtures are permitted during development to avoid engine dependency; **no fake data may be presented as NASA measured event data in the final game**.
- NASA route follows the frozen DTO in `INTERFACES.md`; Vibhushan engine follows frozen `GAME_RULES.md`. Resolve schema questions in the GitHub Issue rather than generating alternate interfaces.
- A task is Ready if spec is frozen, repo exists (for code tasks) and its true dependencies are fulfilled. Some code can be drafted on a task branch without merging; marked Done only after review/test/merge.
- A lane is review-ready after lint/build/test evidence. Passing group PR merges to `develop` with independent reviewer approval.
- Full demo is ready only after success+failure, actual NASA provenance, offline fallback, 4 hotspots and replay work on `main`.

## Safety and permissions
- Verify usernames from profile URLs. Do not assign names guessed from memory.
- Never modify existing `.env.local`/secrets without approval; backend only `NASA_API_KEY`, not `NEXT_PUBLIC_` for secrets.
- Avoid force pushes, `git reset --hard`, removing remote branches, committing generated NASA logos, or overwriting peers' unmerged changes.
- If Projects permission fails, import Issues and continue. The board can be linked afterward.
