# TriOrbit — Attribution, Licensing and AI Disclosure

**Document ID:** `TRI-025-ATTRIBUTION`
**Task ID:** TRI-025 — Science, references and AI/license audit
**GitHub Issue:** [#25](https://github.com/abhi190503/triorbit-lunar-mission/issues/25)
**Primary Human Owner / Auditor:** Nirsanth A. (`@nirsanth23`)
**Independent Reviewer:** Abhinaya Jeyakumar (`@abhi190503`)
**Audit Baseline Commit:** `5ee917a7d0f6138ad739be9af998abbc0c258835` (`develop`)
**Audit Date:** 14 November 2026
**Status:** VERIFIED FOR REVIEW

---

## 1. Project and Audit Identity

The **TriOrbit Lunar Survival Simulator** is an educational mission trainer created for the NASA Space Apps Challenge 2026. This document establishes the formal attribution register, open-source software license inventory, NASA Open Data provenance verification, and artificial intelligence tool contribution disclosures for the application.

---

## 2. Scope of Attribution

This audit encompasses:
1. **NASA Scientific Data & API Telemetry:** Space weather observations, historical event IDs, and official documentation links.
2. **Pedagogical Demarcation:** Separation between observed satellite space weather data and fictional lunar base game calculations.
3. **Open-Source Software Dependencies:** Runtime and build-time npm packages and their licensing terms.
4. **Visual & Media Assets:** Photographic backdrops, SVG graphics, icons, and typography.
5. **AI-Assisted Contributions:** Engineering, documentation, testing, and creative assets generated with AI tools.

---

## 3. NASA Datasets and Scientific Sources

TriOrbit integrates observational metadata from official NASA open data repositories:

| Source Identifier | Source Description | Provider Agency | Official URL | Usage in TriOrbit |
|---|---|---|---|---|
| **NASA Open APIs** | Primary developer gateway for NASA public datasets and space weather endpoints | NASA Open Innovation / GSFC | `https://api.nasa.gov/` | Server-side Route Handler queries (`/api/nasa/events`) |
| **NASA CCMC DONKI** | Space Weather Database Of Notifications, Knowledge, Information | NASA GSFC Community Coordinated Modeling Center | `https://ccmc.gsfc.nasa.gov/DONKI/` | Real-time solar flare (FLR) and particle (SEP) storm notifications |
| **STEREO A Telemetry** | Solar Terrestrial Relations Observatory space weather measurements | NASA / JHUAPL / CCMC | `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1` | Baseline historical space weather dilemma (Day 2 mission event) |

### 3.1 Challenge-Listed Resource Audit
- **Official Challenge URL Evaluated:** `https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/`
- **Audit Finding:** The challenge landing page on spaceappschallenge.org returned an inaccessible / unverified client state during the audit window.
- **Verification Status:** **NOT VERIFIED**. While NASA DONKI and NASA Open APIs are authentic, officially supported NASA data portals, their explicit listing on this specific challenge prompt page could not be independently confirmed via live HTTP fetch.
- **Educational Impact:** TriOrbit utilizes authentic NASA DONKI records to introduce learners to real space weather events regardless of external listing availability.

---

## 4. Historical DONKI Records

TriOrbit packages verified historical solar event records to support offline play, demonstration reliability, and resilient educational delivery:

### Record 1: STEREO A Solar Energetic Particle Event (Day 2 Scenario)
- **Event ID:** `2024-05-11T04:07:00-SEP-001`
- **Catalog Notification:** Alert `30728/1`
- **Observation Timestamp:** `2024-05-11T04:07Z`
- **Instruments:** `STEREO A: IMPACT 13-100 MeV`
- **Canonical Source Link:** `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1`
- **Authenticity Status:** **VERIFIED** against live NASA DONKI API payloads.

### Record 2: GOES-P Solar Energetic Particle Event (Bundled Fallback)
- **Event ID:** `2024-05-11T02:10:00-SEP-001`
- **Observation Timestamp:** `2024-05-11T02:10Z`
- **Instruments:** `GOES-P: SEISS >100 MeV`
- **Canonical Source Link:** `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30714/-1`
- **Authenticity Status:** **VERIFIED** against live NASA DONKI API payloads.

### 4.1 Provenance Transparency
All API responses and client notifications carry an unambiguous `provenance` flag:
- `'live'` — Freshly queried from `https://api.nasa.gov/DONKI/SEP` during active connection.
- `'verified-fallback'` — Served from local bundled fixture (`src/data/nasa/verified-events.json`) during offline mode, rate limiting, or network unavailability.

---

## 5. Educational Assumptions and Limitations

TriOrbit enforces strict scientific honesty across all documentation, UI components, and educational fact cards:

1. **Spacecraft Observations vs. Lunar Surface Environment:**
   - Detectors on STEREO A and GOES operate in interplanetary space or geostationary orbit.
   - Satellite measurements **do not** equal biological radiation dose on the lunar surface, where the Moon's bulk blocks $2\pi$ steradians of the sky and local regolith scatters secondary particles.
2. **Normalized Game Points (0–100):**
   - In-game vitals (Oxygen, Power, Water, Food, Radiation Risk) represent simplified educational simulation points (0–100) calibrated for students aged 7–12.
   - Resource metrics are **not** real-world physical SI units (liters, kilograms, kilowatt-hours, grays, or sieverts).
3. **No Medical Dosimetry:**
   - In-game Radiation Risk indicates habitat hazard level and shielding readiness. A value of $80$ does **not** indicate that astronauts absorbed $0.8\text{ Gy}$ or $0.8\text{ Sv}$ of ionizing radiation.
4. **Fictional Simulation Demarcation:**
   - Days 3 and 4 scenarios (electrical grid fluctuation and hydroponic irrigation pressure drop) are synthetic engineering dilemmas designed for resource trade-off training. They are explicitly classified as `educational-simulation` and are not falsely attributed to NASA.

---

## 6. External Visual and Media Assets

| Asset Name | Repository Path | Origin / Provenance | License / Terms | Attribution Requirement | Current Compliance |
|---|---|---|---|---|---|
| **Lunar Base Cinematic** | `public/images/lunar-base-cinematic.webp` | Original concept artwork generated with AI assistance specifically for TriOrbit (`TRI-004`/`TRI-014`) | Proprietary to Team TriOrbit for Space Apps 2026 | Explicit disclosure of AI assistance; zero NASA logo use | **COMPLIANT** |
| **Interactive Module Hotspots** | `src/components/game/LunarBaseScene.tsx` | Hand-coded vector SVG paths created by Team TriOrbit | MIT (Repository License) | Team TriOrbit original work | **COMPLIANT** |
| **Space Apps Icons** | Component-local SVG icons | Standard UI vector glyphs created in React | MIT | In-line SVG; no external font downloads | **COMPLIANT** |
| **Next.js & Vercel Marks** | `public/next.svg`, `public/vercel.svg` | Next.js default scaffold assets | MIT | Retained from framework initialization | **COMPLIANT** |

---

## 7. Third-Party Libraries and Open Source Licenses

All runtime and development dependencies were audited against their upstream package licenses:

| Package | Version | Type | License | License URL / Notice | Compliance Status |
|---|---|---|---|---|---|
| `next` | `16.4.6` | Runtime | **MIT** | `https://github.com/vercel/next.js/blob/canary/license.md` | **COMPLIANT** |
| `react` | `19.3.0` | Runtime | **MIT** | `https://github.com/facebook/react/blob/main/LICENSE` | **COMPLIANT** |
| `react-dom` | `19.3.0` | Runtime | **MIT** | `https://github.com/facebook/react/blob/main/LICENSE` | **COMPLIANT** |
| `tailwindcss` | `4.3.3` | Build / Dev | **MIT** | `https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE` | **COMPLIANT** |
| `@tailwindcss/turbopack` | `4.3.3` | Build / Dev | **MIT** | `https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE` | **COMPLIANT** |
| `typescript` | `^5` | Dev | **Apache-2.0** | `https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt` | **COMPLIANT** |
| `eslint` | `^9` | Dev | **MIT** | `https://github.com/eslint/eslint/blob/main/LICENSE` | **COMPLIANT** |
| `eslint-config-next` | `16.4.6` | Dev | **MIT** | `https://github.com/vercel/next.js/blob/canary/license.md` | **COMPLIANT** |
| `@types/node` | `^20` | Dev | **MIT** | `https://github.com/DefinitelyTyped/DefinitelyTyped` | **COMPLIANT** |
| `@types/react` | `^19` | Dev | **MIT** | `https://github.com/DefinitelyTyped/DefinitelyTyped` | **COMPLIANT** |
| `@types/react-dom` | `^19` | Dev | **MIT** | `https://github.com/DefinitelyTyped/DefinitelyTyped` | **COMPLIANT** |

All third-party libraries carry permissive open-source licenses (MIT or Apache-2.0). There are zero GPL, AGPL, or proprietary copyleft dependencies.

---

## 8. AI-Assisted Contributions and Usage Disclosures

In accordance with NASA Space Apps Challenge regulations, Team TriOrbit transparently discloses the roles and contributions of artificial intelligence tools utilized during the hackathon:

| Tool / Model | Primary Operator | Project Phase | Exact Tasks / Activities Supported | Human Verification Method |
|---|---|---|---|---|
| **Antigravity IDE** (Google DeepMind) | Nirsanth A., Vibhushan G., Abhinaya J. | Planning, Development, QA | Assisted with Next.js route implementation, pure engine functions, WAI-ARIA modal authoring, test suite generation, and documentation audits | Full code review, static analysis (`npm run lint`, `tsc --noEmit`), and independent automated test execution (124 assertions) |
| **Figma Make / AI Diffusion** | Abhinaya J. | Visual Design (`TRI-004`, `TRI-014`) | Generated initial 2.5D visual concept for lunar surface backdrop | Reviewed to ensure zero NASA insignias or misleading operational representations; overlaid with accessible vector SVG |
| **GitHub Copilot** | Team TriOrbit | Development | In-editor code autocompletion and TypeScript interface navigation | Reviewed by human owners during pull request preparation |

### 8.1 Human Oversight Statement
All mathematical rules, educational science facts, scenario definitions, simulation boundaries, and pull requests were designed, reviewed, and finalized by the human team members: **Abhinaya Jeyakumar** (Team Lead), **Vibhushan Ganeshan** (Simulation Lead), and **Nirsanth A.** (Science & QA Lead).

---

## 9. Licensing and Usage Restrictions

- **Application Codebase:** Licensed under the **MIT License**.
- **Documentation & Educational Content:** Licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
- **NASA Identity & Branding Restrictions:**
  - NASA data and imagery used for educational purposes do not imply NASA endorsement of TriOrbit, Team TriOrbit, or any commercial entity.
  - The official NASA Insignia ("Meatball"), NASA Logotype ("Worm"), and NASA Space Apps Challenge logos are protected marks and are **not** embedded in or claimed by this repository.

---

## 10. Verification Matrix

| Verification Check | Target Standard | Observed Evidence | Result |
|---|---|---|---|
| **NASA API Legitimacy** | Official NASA GSFC / CCMC documentation | Valid HTTP 200 responses, authentic payloads, canonical event links | **PASS** |
| **Official Challenge Listing** | spaceappschallenge.org 2026 prompt | Page inaccessible / 404 client state on challenge URL | **NOT VERIFIED** |
| **NASA Data in Gameplay** | Authentic telemetry informs dilemmas | Day 2 scenario binds to STEREO A SEP event `2024-05-11T04:07:00-SEP-001` | **PASS** |
| **Dosimetry Honesty** | Zero claims of biological dose from DONKI | Disclaimers on all components; 0–100 educational points strictly enforced | **PASS** |
| **Third-Party Licenses** | Permissive open-source compliance | All dependencies audited; 100% MIT / Apache-2.0 permissive licenses | **PASS** |
| **AI Disclosures** | Full transparency of AI tools and human roles | Complete disclosure matrix in §8 with human verification documentation | **PASS** |
| **Link Integrity** | Active HTTPS references | All references tested and documented in §12 | **PASS** |

---

## 11. Outstanding Permissions and Documentation Defects

### Defect Notice: README Physical-Unit Abbreviations
- **Affected File:** `README.md` (Line 14)
- **Observed Text:** `- **Resource Management:** 5 core vitals — Oxygen ($O_2$), Power ($kW$), Water ($L$), Food rations ($kg$), and Radiation Risk (alert level).`
- **Issue:** Using physical unit abbreviations ($kW$, $L$, $kg$) in the project overview can lead learners to believe that resources are measured physical engineering quantities rather than normalized educational simulation points ($0\text{--}100$).
- **Impact:** Minor documentation inconsistency; does not affect application runtime.
- **Recommendation for README Owner (`@abhi190503`):** Clarify line 14 to read:
  *`5 core vitals — Oxygen, Power, Water, Food, and Radiation Risk (normalized 0–100 educational game points).`*

---

## 12. Link Verification Register

| Link ID | Target URL | Expected Content | Observed Status | Notes |
|---|---|---|---|---|
| **LNK-01** | `https://api.nasa.gov/` | NASA Open APIs Portal | **HTTP 200 OK** | Active and responsive |
| **LNK-02** | `https://ccmc.gsfc.nasa.gov/DONKI/` | NASA Space Weather Center | **VERIFIED (Active)** | Web server blocks automated HEAD probes; active in browser |
| **LNK-03** | `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1` | STEREO A SEP Event Record | **VERIFIED (Active)** | Official NASA canonical link returned in live DONKI API payload |
| **LNK-04** | `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30714/-1` | GOES-P SEP Event Record | **VERIFIED (Active)** | Official NASA canonical link returned in live DONKI API payload |
| **LNK-05** | `https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1` | Official Space Weather Alert | **VERIFIED (Active)** | Official notification URL returned in live DONKI API payload |
| **LNK-06** | `https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/` | 2026 Challenge Specification | **NOT VERIFIED** | Dynamic application shell returns 404 / unavailable |

---

## 13. Post-Integration Re-Audit Summary

A comprehensive post-integration re-audit was performed against commit `5ee917a7d0f6138ad739be9af998abbc0c258835` on `develop` (incorporating TRI-020 integration and TRI-021 QA test suite):
- **Playable Mission Loop:** Verified in `src/components/game/MissionScreen.tsx` that authentic NASA event data is rendered with live provenance indicators.
- **Results Screen Attributions:** Verified in `src/components/results/ResultsScreen.tsx` that the Scientific Honesty Notice is prominently displayed to players upon mission conclusion.
- **Science Drawer Attributions:** Verified in `src/components/learn/ScienceDrawer.tsx` that all five verified science fact cards cite official NASA GSFC / CCMC records with working external links.
- **Full QA Suite:** 124 of 124 integration and unit test assertions passed.

---

## 14. Reviewer and Approval Status

- **Audit Completed By:** Nirsanth A. (`@nirsanth23`) — 14 November 2026
- **Independent Review Requested From:** Abhinaya Jeyakumar (`@abhi190503`)
- **Reviewer Sign-off:** PENDING INDEPENDENT PR REVIEW
