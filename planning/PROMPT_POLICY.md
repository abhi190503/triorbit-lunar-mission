# Using one master prompt per TRI task, in three parallel workstreams

1. Check live GitHub Issue `[TRI-###]`, its named owner, true dependencies, allowed files and acceptance criteria. Issue numbers are not TRI IDs.
2. Feed `master_prompts/TRI-###.md` plus the actual Issue URL/body into your coding agent with verified repo access. The agent inspects branch/status first; never hallucinate file content or PR URLs.
3. Three **workstream branches** are used to prevent 31 PRs from blocking each other: `work/abhinaya-ui`, `work/vibhushan-engine`, `work/nirsanth-science`. Make a focused, reviewable commit per TRI ID and check acceptance before progressing. Work can advance on other unblocked tasks while reviews are pending.
4. Do not combine *unrelated instructions* in a single prompt. Run each TRI prompt sequentially within the owner lane; keep affected files separate and test after each meaningful task.
5. Fewer dependencies do not authorize inventing functionality: UI display fixtures only; one real canonical GameState; NASA data only from sourced, verified records.
6. Owner final grouped PR into `develop` links **all actual GitHub Issue #numbers**, screenshots/logs where relevant, source citations and risk disclosures. Reviewer verifies each issue before closing it.
7. `TRI-016/020` integration uses separate branch after workstream PRs; do not ask Abhinaya to wait for engine while working on her `TRI-012`..`015` visual components.
8. Do not edit `.env` files, overwrite others' work, invent test results, generate/alter NASA logos, force push or start actual coding before 09:00 Nov 14 Colombo time.
9. Completion report must show actual changed files, real test output, true commit/PR identifiers, blockers, and next dependent task. Not run = **NOT VERIFIED**.
