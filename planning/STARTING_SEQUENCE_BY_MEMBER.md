# Start immediately in your own lane — Saturday, November 14, 2026

Read the shared pack before the authorized 09:00 start. During implementation, copy the **specific** `master_prompts/TRI-###.md` for your next task into your coding assistant, plus the current GitHub issue URL when available. Do not submit all tasks at once to one assistant.

## Abhinaya — lead and original interface (no cross-member coding blocker)

**Start 09:00:** `TRI-006`: GitHub login confirmation, one Next.js scaffold/repo, publish main/develop, share repo URL and SHA. Issue import/Projects board can follow without delaying UI. No need to wait for Vibhushan or Nirsanth.

**Then stay on `work/abhinaya-ui`:**

1. `TRI-012` — design tokens and game shell. Ensure original lunar visual direction, accessibility, readable children-oriented controls.
2. `TRI-013` — landing and quick tutorial.
3. `TRI-014` — 2.5D clickable lunar base with four hotspots; selected state and keyboard/touch interactions.
4. `TRI-015` — HUD from **props and display-only mock fixture**, with low-resource/high-radiation visual states. Do not create parallel GameState.

**Do not wait on** `TRI-007`, `TRI-008`, `TRI-009`, `TRI-010` or `TRI-011` for any of those four UI tasks. For later integration, Vibhushan wires real engine in `TRI-016`. Rehearse pitch after stable demo.

**Report to team after each task:** issue ID, commit hash, what you can show, actual tests and blockers. Open one grouped UI PR when the lane is ready.

## Vibhushan — core engine and later integration

**Before first clone:** review `GAME_RULES.md` and `INTERFACES.md` and agree success/failure test cases. Do not create a competing repository.

**Then stay on `work/vibhushan-engine`:**

1. `TRI-007` — canonical types/contracts and typed fixtures.
2. `TRI-008` — immutable pure engine and unit tests.
3. `TRI-009` — 5-day progression, scoring and outcomes.

**Independent of** Abhinaya scene or Nirsanth backend. Send contract exports/commit SHA to teammates, but they can continue building standalone parts without waiting.

**At integration:** after workstream PRs merge, create `integrate/mission`, complete `TRI-016` (connect real engine to UI) and `TRI-020` (wire event, NASA, science, results, replay). Ask Abhinaya to review any UI file changes. Avoid overwriting scene and style components.

## Nirsanth — NASA/data/content and independent QA

**Before first clone:** validate source links, DONKI event fields, official citation and caveats. No speculative NASA solar dose values.

**Then stay on `work/nirsanth-science`:**

1. `TRI-010` — Next.js NASA route, validation and verified fallback, without waiting for engine types.
2. `TRI-011` — three scenario JSON definitions under frozen GAME_RULES/INTERFACES; real NASA event must be cited.
3. `TRI-017` — standalone event modal with `onSelect` callback.
4. `TRI-018` — standalone NASA-learning panel and evidence citations.
5. `TRI-019` — results/replay display component with props and callback (no scoring math).

**No need to wait for** Abhinaya's HUD or Vibhushan's engine for these standalone components. Work only under your owned paths. On the integrated candidate, run `TRI-021` QA and record actual outcomes.

## Common no-conflict agreements

- No second repo, duplicate GameState, separate backend, fake NASA records, generated NASA logos, or exposing secrets.
- Do not edit another owner's files until the integration stage and documented agreement.
- One commit referencing each completed TRI-ID, but grouped workstream PRs make reviews faster.
- The current plan and task ID assignments override the old pack. Keep the original task IDs stable for traceability.
- `Done` requires tests/review/merge, not merely a generated file.
