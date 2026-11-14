# TriOrbit: Ownership and minimized dependency gates

**Revised at the user request: Abhinaya starts from the repo without depending on another member.** GitHub usernames still require verification.

| TRI-ID | Primary owner | Reviewer | Actual blocking prerequisites | Estimate (h) |
|---|---|---|---|---:|
| TRI-001 | Abhinaya Jeyakumar | Vibhushan Ganeshan | None | 0.4 |
| TRI-002 | Nirsanth A. | Vibhushan Ganeshan | TRI-001 | 1.0 |
| TRI-003 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-001 | 1.0 |
| TRI-004 | Abhinaya Jeyakumar | Nirsanth A. | TRI-001 | 1.0 |
| TRI-005 | Abhinaya Jeyakumar | Nirsanth A. | TRI-001 | 0.5 |
| TRI-006 | Abhinaya Jeyakumar | Vibhushan Ganeshan | TRI-005 | 1.0 |
| TRI-007 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-003;TRI-006 | 0.7 |
| TRI-008 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-007 | 2.0 |
| TRI-009 | Vibhushan Ganeshan | Nirsanth A. | TRI-008 | 1.2 |
| TRI-010 | Nirsanth A. | Vibhushan Ganeshan | TRI-002;TRI-006 | 2.2 |
| TRI-011 | Nirsanth A. | Vibhushan Ganeshan | TRI-002;TRI-003 | 1.5 |
| TRI-012 | Abhinaya Jeyakumar | Nirsanth A. | TRI-004;TRI-006 | 1.0 |
| TRI-013 | Abhinaya Jeyakumar | Nirsanth A. | TRI-012 | 1.0 |
| TRI-014 | Abhinaya Jeyakumar | Nirsanth A. | TRI-012 | 2.6 |
| TRI-015 | Abhinaya Jeyakumar | Vibhushan Ganeshan | TRI-012 | 1.2 |
| TRI-016 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-008;TRI-009;TRI-014;TRI-015 | 1.6 |
| TRI-017 | Nirsanth A. | Abhinaya Jeyakumar | TRI-011 | 1.1 |
| TRI-018 | Nirsanth A. | Vibhushan Ganeshan | TRI-002 | 0.8 |
| TRI-019 | Nirsanth A. | Abhinaya Jeyakumar | TRI-003 | 1.0 |
| TRI-020 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-009;TRI-010;TRI-013;TRI-014;TRI-015;TRI-016;TRI-017;TRI-018;TRI-019 | 2.0 |
| TRI-021 | Nirsanth A. | Vibhushan Ganeshan | TRI-020 | 1.3 |
| TRI-022 | Abhinaya Jeyakumar | Nirsanth A. | TRI-014;TRI-015 | 1.0 |
| TRI-023 | Abhinaya Jeyakumar | Vibhushan Ganeshan | TRI-014;TRI-015 | 1.0 |
| TRI-024 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-020 | 0.8 |
| TRI-025 | Nirsanth A. | Abhinaya Jeyakumar | TRI-002;TRI-010;TRI-011;TRI-018 | 1.0 |
| TRI-026 | Nirsanth A. | Abhinaya Jeyakumar | TRI-020;TRI-025 | 1.1 |
| TRI-027 | Nirsanth A. | Vibhushan Ganeshan | TRI-002;TRI-010 | 0.9 |
| TRI-028 | Abhinaya Jeyakumar | Vibhushan Ganeshan | TRI-014;TRI-015 | 0.9 |
| TRI-029 | Abhinaya Jeyakumar | Nirsanth A. | TRI-025;TRI-026;TRI-027 | 0.9 |
| TRI-030 | Vibhushan Ganeshan | Abhinaya Jeyakumar | TRI-020 | 1.0 |
| TRI-031 | Vibhushan Ganeshan | Nirsanth A. | TRI-020 | 1.0 |

## Independent starts
- **Abhinaya:** `TRI-006` -> `TRI-012` -> `TRI-013`/`TRI-014`/`TRI-015`. No dependency on Vibhushan or Nirsanth. `TRI-022` and optional `TRI-023` can begin once her visual UI is stable.
- **Vibhushan:** read the frozen interface spec; after the scaffold exists, start `TRI-007` -> `TRI-008` -> `TRI-009`. Later do `TRI-016` and `TRI-020` after UI and data workstreams are merged.
- **Nirsanth:** read the already-supplied NASA resources; after scaffold, start `TRI-010` independently of shared GameState. Author JSON `TRI-011`, UI-only `TRI-017`/`TRI-018`/`TRI-019`, and own `TRI-021` QA once integrated.

## Only unavoidable handoffs
1. **Repo creation:** Abhinaya publishes scaffold first. Until it is online, the other two can review game rules/NASA sources and work from planning data; they do not create a competing repo.
2. **Shared format:** The `INTERFACES.md` spec is frozen before starting. `TRI-007` publishes canonical TypeScript exports; other lanes do not need to wait to build standalone work.
3. **Integration:** Vibhushan wires engine to the UI in `TRI-016` and assembles all accepted lanes in `TRI-020`; Nirsanth runs independent QA in `TRI-021`.

## Expected Saturday focused hours (excluding reviews, setup surprises and breaks)
- Abhinaya: **6.8 h** (scaffold + UI).
- Vibhushan: **7.5 h** (contracts + engine + integration).
- Nirsanth: **7.9 h** (NASA + event UI + QA).

Workstreams use separate file boundaries and grouped PRs, with issue-specific commits. *Review can be asynchronous:* owners proceed with other **unblocked** tasks while waiting for review. Final integrated promotion requires approval and tests.
