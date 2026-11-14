# Timeboxed triage / fallback plan

## Saturday hard gates
- **13:00**: NASA route OR validated local factual fixture; pure engine; initial lunar scene. If late: reduce scene animations, keep 4 hotspots functional.
- **16:00**: First playable vertical slice (1 day). If late: shrink tutorial to one overlay, avoid extra pages and backend endpoints.
- **19:00**: Feature freeze. If behind, get one complete start->day->event->result path running and then extend it to five days. Reduce events from 3 to 2 only with a noted scope change.
- **21:00**: Working tested build target. Backup commit/branch, video capture optional. No fresh refactors or library changes after this.

## Drop order
1. TRI-031 expanded gameplay; TRI-024 persistence; TRI-030 deploy.
2. TRI-023 sophisticated animation; TRI-022 secondary mobile refinements (keep basic usability).
3. Reduce 3 fully distinct event UIs into one reusable typed event modal; retain at least one NASA-provenanced event and two simulated dilemmas if possible.
4. Reduce number of auxiliary learning cards or actions (not core engineering trade-offs).
5. **Never** drop source citations, working simulation, a NASA-based mechanic, success/failure and demo reliability.

## External failure fallback
- NASA API timeout/429/empty: bundled **verified** NASA record with provenance, not fabricated event.
- GitHub Projects permission denied: issue list + PR workflow; board later.
- UI asset issue: original inline SVG base with four keyboard-accessible hotspots; no third-party image dependency.
- CI dependency issue: `npm run build` and manual test logs first; fix test script later. No false claims of green CI.
- One member blocked: record dependency, pair on blocker, do not create independent duplicate modules.
- Pitch network failure: local `npm run dev` demo and optional screen recording with organizer approval; keep printed Q&A facts.
