# Saturday 14 November 2026 — parallel-first start (Windows PowerShell)

**Before 09:00 Asia/Colombo:** research, plan, verify Node/Git/GitHub CLI/account only. **Do not create competition code or GitHub implementation repo early.**

## Abhinaya — starts independently at 09:00 (`TRI-006`)
1. Verify the **correct** GitHub account: `gh auth status`, `gh api user --jq .login`. Do not assume the linked account belongs to the intended project owner.
2. In an **empty new parent directory**, scaffold exactly one Next.js TypeScript/Tailwind app:

```powershell
npx create-next-app@latest triorbit-lunar-mission --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd .\triorbit-lunar-mission
npm run build
git status
git branch --show-current
```

3. If this new local repo is not on `main`, rename the current branch only after verifying it is a newly generated repo. Check the remote repository does not already exist. Create from local source, push `main`, and create `develop`:

```powershell
# In the newly created project only, after verifying current branch:
git branch -M main
# STOP if owner/repo already exists; inspect instead of creating duplicates:
gh repo view <VERIFIED_OWNER>/triorbit-lunar-mission
# If it does NOT exist, create exactly one:
gh repo create triorbit-lunar-mission --public --source . --remote origin --push --description "TriOrbit Lunar Mission | NASA Space Apps 2026"
git switch -c develop
git push -u origin develop
```

Replace `<VERIFIED_OWNER>` with the real `gh api user` output; never paste placeholder brackets as commands. `gh repo view` returning success means reuse existing rather than create another. **Share remote URL and SHA in team chat immediately**. `git log -1 --oneline` shows SHA.

4. In extracted pack **outside** repo, import 31 issues and create/link Projects board if account permissions allow:

```powershell
.\scripts\import_issues.ps1 -Repository "VERIFIED_OWNER/triorbit-lunar-mission" -CreateProject
```

The importer refuses execution before official start and asks to type CREATE. It does not invent assignees; add actual handles after collaborators accept. If board scope fails, issues remain authoritative and development continues.

5. Start your UI workstream: from `develop` create `work/abhinaya-ui`; `TRI-012` -> `TRI-013` -> `TRI-014` -> `TRI-015`. UI uses isolated fixtures and display-only props. Do not ask Vibhushan to finish engine before starting.

## Vibhushan — engine lane (no UI dependency)
- Until scaffold URL arrives: review/freeze agreed `GAME_RULES.md`/`INTERFACES.md` and manual test cases; do not create a competing repo.
- Clone remote, `git switch develop`, create `work/vibhushan-engine`, complete `TRI-007` -> `TRI-008` -> `TRI-009` with tests. Publish canonical exported interfaces; no changes to UI files.

## Nirsanth — NASA lane (no engine dependency)
- Until scaffold URL arrives: source-check real DONKI event metadata and scientific caveats; do not create competing repo.
- Clone remote, `git switch develop`, create `work/nirsanth-science`; complete `TRI-010`, `TRI-011`, `TRI-017`/`018`/`019`. Work only in NASA backend/data and own standalone component files.

## PR and integration checkpoints
- Aim for each lane to open one reviewed grouped PR into `develop` by late afternoon. Each commit names the TRI-ID, and each PR body references actual GitHub issue numbers (these differ from TRI-###).
- Do not close issues merely because a PR was opened. GitHub issue auto-closing keywords are unreliable for PRs merged into nondefault `develop`. Close after review and verification.
- Vibhushan creates `integrate/mission` from latest `develop` after lanes merge, completes `TRI-016` then `TRI-020`, and opens integration PR. Abhinaya reviews visual correctness; Nirsanth verifies source provenance.
- Nirsanth runs `TRI-021` end-to-end tests and verifies win/loss plus NASA fallback. Fixes only; then test and promote stable code to `main`.
- If GitHub Projects permission or UI status update stalls, **do not delay code**. Use Issues and PRs as source of truth.

## Non-negotiable
No exposed `.env.local`, no duplicate canonical GameState modules, no invented NASA observations, no generated NASA logos, no force pushes or destructive resets. Stop new features at approximately 19:00 if integration behind; Saturday night target is a fully playable five-day demo.
