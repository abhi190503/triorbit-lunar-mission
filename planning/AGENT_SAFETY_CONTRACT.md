# TRIORBIT — GLOBAL AI IMPLEMENTATION SAFETY CONTRACT

Applies to all 31 tasks: TRI-001 through TRI-031.

This contract is mandatory and takes precedence over ordinary implementation instructions when protecting source code, team ownership, dependencies and Git history.

## 1. Verify the environment

Before any implementation:

- Confirm the repository is `abhi190503/triorbit-lunar-mission`.
- Confirm the local directory is the actual repository root.
- Identify the current GitHub account, branch and remote.
- Read the live GitHub issue matching the requested TRI task.
- Read the corresponding `planning/master_prompts/TRI-###.md`.
- Read the relevant project specifications, interfaces, game rules and Git workflow.
- Do not assume a feature exists merely because it appears in planning documents.

If any essential information is missing, stop and report what is missing.

## 2. Inspect local Git state

Run:

```bash
git status --short
git branch --show-current
git remote -v
git fetch origin
git status -sb
```

If the working tree contains existing modifications or untracked files, inspect and report them.

Do not automatically discard, overwrite, stash or commit someone else's unfinished work.

Do not run destructive commands such as:

- `git reset --hard`
- `git clean -fd`
- `git push --force`

Do not delete existing branches or files without explicit authorization.

## 3. Safely synchronize the branch

Verify the correct workstream branch:

- Abhinaya: `work/abhinaya-ui`
- Vibhushan: `work/vibhushan-engine`
- Nirsanth: `work/nirsanth-science`

For TRI-006, follow the special bootstrap instructions instead.

When the working tree is clean and the branch has a valid remote, synchronize safely:

```bash
git pull --ff-only
```

If the branch is not configured to track a remote, inspect its upstream configuration first.

Never pull an unrelated branch or create an accidental merge.

If the local and remote histories diverge, stop and report the divergence.

Before integrating updates from `develop`, inspect the difference and obtain approval for any non-fast-forward merge or rebase.

Never overwrite teammate commits.

## 4. Enforce task dependencies

Read the actual GitHub issue's `Blocked by` field.

For every prerequisite:

1. Locate the corresponding real GitHub issue.
2. Check its actual status.
3. Inspect required implementation commits, PRs and tests.
4. Verify that the required files, exports or contracts are available.
5. Confirm the prerequisite satisfies what the current task actually needs.

A closed issue alone is not sufficient evidence if the implementation is missing.

For same-owner sequential work, a tested, committed implementation on the owner's current workstream branch may satisfy a prerequisite before the grouped PR is merged, if the dependency contract permits it.

For cross-owner implementation dependencies, require reviewed merged code or an expressly approved and documented handoff.

If a frozen interface explicitly allows independent work, use that interface and approved display-only fixtures. Do not invent or duplicate another owner's code.

**BLOCKING RULE:**

If a real prerequisite is incomplete and no approved independent-work contract exists:

- Do not implement the dependent task.
- Mark or report it as Blocked.
- Identify the missing prerequisite and owner.
- Explain precisely what is needed to unblock it.
- Stop this task.
- Recommend another independently executable task in the same workstream.

Never bypass a dependency simply to finish faster.

## 5. Respect file ownership

Abhinaya owns visual design, application shell, landing screen, lunar scene and mission HUD.

Vibhushan owns canonical game contracts, simulation logic, progression, scoring and approved integration.

Nirsanth owns NASA data access, source verification, scenarios, educational content and assigned results/QA components.

Before editing a file, confirm it belongs to the current task's approved file scope.

If another owner controls the file, request coordination and record the agreement in the GitHub issue.

Do not rewrite the entire application, introduce another GameState implementation, or regenerate existing teammates' components.

## 6. Keep implementation within scope

Implement only the requested TRI task.

Preserve:

- Next.js App Router and TypeScript
- Tailwind CSS and the approved cinematic 2.5D game design
- Next.js Route Handlers for NASA data
- The shared TypeScript simulation contracts
- The five-day mission scope
- The verified NASA data protocol

No new database, authentication framework, separate backend service or major dependency without approval.

Never introduce unnecessary complexity or replace working components with generic generated UI.

## 7. Protect science, security and credentials

- Do not fabricate NASA observations or measurements.
- Distinguish actual NASA data from simplified educational simulation values.
- Do not claim ISS radiation measurements represent lunar surface measurements.
- Do not expose NASA API keys through client code.
- Never commit `.env.local`, tokens, passwords or secrets.
- Never generate, modify or falsely reproduce NASA logos or official branding.
- Cite external datasets, libraries, images and AI-generated content where required.
- Preserve verified fallback data and source provenance.

## 8. Validate implementation

Before reporting success:

- Inspect all modified files.
- Run available TypeScript, lint, build and relevant task tests.
- Test both normal and error conditions where applicable.
- Verify exported interfaces against the frozen contracts.
- Check that unrelated work remains unchanged.
- Check for secrets and accidental files in the proposed commit.
- Document tests that could not run.

Never claim tests passed without executing them.

If tests fail, fix in-scope problems or report the failure and blocker.

## 9. Git commit and PR workflow

Commit only task-related files on the correct workstream branch.

Include the task ID in the commit message.

Example:

`feat(ui): implement clickable lunar base (TRI-014)`

Push only the intended branch.

For grouped workstream PRs:

- Target `develop`, not `main`.
- Link every actual GitHub issue covered by the PR.
- Explain changes and test evidence.
- Request independent teammate review.
- Never self-merge without the team's agreed authorization.
- Never mark implementation Done before its acceptance criteria and merge requirements are satisfied.

Promote tested integrated work from `develop` to `main` only through the agreed integration process.

## 10. Mandatory execution report

At the end of each task, produce:

**Task ID:**  
**Owner:**  
**Current branch:**  
**Dependencies checked:**  
**Dependency evidence:**  
**Files changed:**  
**Implementation completed:**  
**Tests executed and results:**  
**Commit SHA:**  
**Pull request URL:**  
**Blockers or risks:**  
**Status: VERIFIED / BLOCKED / FAILED / NOT VERIFIED**  
**Next safe task:**

Report only real results.

Never invent a commit, PR, GitHub status, test result or successful integration.

## 11. Stop conditions

Immediately stop the current task when:

- The repository or GitHub account is incorrect.
- Existing uncommitted work risks being overwritten.
- Git synchronization fails or histories diverge.
- Required dependencies are not satisfied.
- An incompatible shared interface is detected.
- A change would overwrite another member's work.
- Secret credentials could be exposed.
- Implementation requires an unapproved architecture change.
- A destructive Git operation would be required.

Explain the issue clearly and recommend the safest next action.

**Core principle: Protect existing code, verify dependencies, implement only authorized scope, test before merging, and never hide blockers.**
