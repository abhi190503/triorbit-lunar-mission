# TRI-ORBIT | Parallel-first 9AM execution pack | Revised 13 Nov 2026

**Status:** Planning only. No GitHub repo/board/issues have been created or modified by this pack. Competition coding begins no earlier than 14 Nov 2026, 09:00 Asia/Colombo.

**Begin with `PARALLEL_START_PLAN.md`.** This is the new single authoritative work allocation. It supersedes any earlier packs where Nirsanth owned `TRI-006` or Abhinaya had to wait for game engine interfaces before building UI.

## What changed
1. **Abhinaya owns `TRI-006`**, creates/publishes repo at 09:00, then immediately develops `TRI-012`, `TRI-013`, `TRI-014`, `TRI-015` independently with UI props/fixtures.
2. **Vibhushan owns `TRI-007`/`008`/`009`**, then **`TRI-016`/`020`** integration. Owns canonical game state, no competing UI.
3. **Nirsanth owns NASA route (`TRI-010`), JSON scenario data (`TRI-011`), educational/event/results components (`TRI-017`-`019`) and independent QA (`TRI-021`)**.
4. Cross-owner UI prerequisites were removed; **real integration dependencies remain** and must not be faked.
5. For speed, use three *owner workstream branches* with TRI-ID commits and grouped PRs, not 31 serial PR waits.

## Required read order (all 3)
1. `PARALLEL_START_PLAN.md`
2. `PROJECT_SPEC.md`, `GAME_RULES.md`, `INTERFACES.md`, `SCIENCE_PROTOCOL.md`
3. `OWNERSHIP_AND_DEPENDENCIES.md`, `GITHUB_WORKFLOW.md`
4. `SATURDAY_9AM_RUNBOOK.md`
5. Own `issues/TRI-###.md` + matching `master_prompts/TRI-###.md`
6. `CUT_AND_RECOVERY.md` if behind; `SUNDAY_PITCH_SUBMIT.md` for deliverables.

All 31 IDs are stable. `issues.json` and `issue_index.csv` match the generated issue bodies and master prompts. `scripts/import_issues.ps1` is idempotent by TRI-ID, time gated, and asks for confirmation. Confirm actual GitHub handles; **do not assume usernames match names**.

**This is a plan, not finished app code.** Everyone must show actual tests and source provenance before declaring any task Done.
