# Mission Scenario Evidence & Balance Verification — TriOrbit Lunar Survival Simulator

> **Document:** `docs/SCENARIO_EVIDENCE.md`
> **Task ID:** TRI-011 (GitHub Issue #11)
> **Workstream:** Nirsanth NASA / Science / QA (`work/nirsanth-science`)
> **Lead Researcher & Content Designer:** Nirsanth A. (`@nirsanth23`)
> **Independent Reviewer:** Vibhushan Ganeshan (`@Vibhushan-2003`)
> **Status:** VERIFIED FOR REVIEW
> **Date Verified:** 14 November 2026

---

## 1. Task Identification & Authorized Boundaries

- **Task ID:** TRI-011 — Three concise mission events and consequences
- **GitHub Issue:** #11 (`https://github.com/abhi190503/triorbit-lunar-mission/issues/11`)
- **Primary Owner:** Nirsanth A. (`nirsanth23`)
- **Independent Reviewer:** Vibhushan Ganeshan (`Vibhushan-2003`)
- **Authorized File Boundaries:**
  - `src/data/scenarios.json`
  - `docs/SCENARIO_EVIDENCE.md`
- **Frozen Contract References:**
  - `docs/INTERFACES.md` (GameScenario, GameEventChoice, NASAEvent schemas)
  - `docs/GAME_RULES.md` (Mission loop, action costs, daily drain, scoring, balancing)
  - `docs/SCIENCE_SOURCES.md` (NASA DONKI SEP evidence and attribution)
  - `docs/ASSUMPTIONS.md` (4-tier information classification and unit non-equivalence)

---

## 2. Canonical Scenario Schedule

TriOrbit schedules exactly three daily dilemma events across the 5-day rotation:

| Day | Scenario ID | Scenario Title | Source Classification | Provenance / Evidence Base |
|:---:|---|---|---|---|
| **Day 2** | `solar-activity` | Solar Energetic Particle Warning | `NASA-observation` | NASA DONKI historical SEP observation (`2024-05-11T04:07:00-SEP-001`) |
| **Day 3** | `power-outage` | Habitat Electrical Grid Fluctuation | `educational-simulation` | Explicitly fictional life-support power distribution anomaly |
| **Day 4** | `greenhouse-water` | Hydroponic Irrigation Line Emergency | `educational-simulation` | Explicitly fictional bioregenerative hydroponics pressure emergency |

Days 1 and 5 do not feature random emergency scenarios:
- **Day 1:** System orientation and initial baseline maintenance actions.
- **Day 5:** Final operational push and victory settlement.

---

## 3. NASA Observation Provenance (Day 2 Scenario)

The Day 2 scenario is directly motivated by an authentic, independently verified NASA space weather event:

- **NASA Event ID (`id`):** `2024-05-11T04:07:00-SEP-001`
- **Event Type (`type`):** `SEP` (Solar Energetic Particle event)
- **Observation Timestamp (`occurredAt`):** `2024-05-11T04:07Z` (UTC)
- **Observing Spacecraft & Channel:** `STEREO A: IMPACT 13-100 MeV`
- **Official NASA Catalog URL:** [NASA CCMC DONKI SEP 30717](https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1)
- **Official NASA Notification:** [NASA CCMC Alert 30728](https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1)
- **Data Source (`source`):** `NASA DONKI`
- **Verification Evidence:** Verified live from `https://api.nasa.gov/DONKI/SEP` returning HTTP 200 OK during TRI-002 and TRI-010 audits.

### Scientific Limitation & Boundary:
The observation was recorded by in-situ detectors aboard the STEREO A spacecraft operating in heliospheric orbit. It represents interplanetary solar proton flux, **not a direct measurement of radiation dose absorbed on the lunar surface**. The subsequent in-game radiation hazard increase and bunker shelter mechanics are simplified educational game assumptions calibrated for young learners (ages 7–12).

---

## 4. Fictional Scenario Classification (Days 3 & 4)

In accordance with the 4-tier information classification defined in `docs/ASSUMPTIONS.md` §1:

- **Day 3 (`power-outage`)** is classified strictly as `sourceKind: 'educational-simulation'`. It simulates an electrical substation breaker failure. No NASA spacecraft data is attached or claimed.
- **Day 4 (`greenhouse-water`)** is classified strictly as `sourceKind: 'educational-simulation'`. It simulates a clogged hydroponics manifold and pressure drop. No NASA or CSA space agency data is attached or claimed.

Both fictional scenarios are clearly identified to learners as training exercises in resource trade-offs.

---

## 5. Choice Effects & Resource Trade-Off Table

All choices conform to the frozen `GameEventChoice` contract and `docs/GAME_RULES.md` balancing constraints:

| Scenario ID | Choice ID | Choice Label | Positive Effects | Negative Effects (Penalties) | `isMistake` | Educational Explanation |
|---|---|---|---|---|:---:|---|
| `solar-activity` | `shelter-in-bunker` | Shelter crew in shielded regolith bunker | None | Power: $-5$, Rad Risk: $+5$ | `false` | Moving the crew to the subsurface regolith bunker powers up storm shielding, absorbing the particle flux with minimal hazard increase. |
| `solar-activity` | `delay-shelter` | Delay shelter to maintain external operations | Power: $0$ (Conserves power) | Rad Risk: $+15$ | `true` | Leaving the crew in standard surface modules avoids auxiliary power draw but significantly elevates crew space weather radiation hazard. |
| `power-outage` | `reroute-aux-power` | Reroute power through auxiliary battery banks | None | Power: $-8$ | `false` | Drawing controlled current from auxiliary reserve batteries safely stabilizes the grid with a manageable power reserve expenditure. |
| `power-outage` | `bypass-safety-breaker` | Force-reset and bypass safety breaker | None | Power: $-15$, Oxygen: $-5$ | `true` | Bypassing safety switches causes electrical power surges that disrupt oxygen generation transformers and waste power reserves. |
| `greenhouse-water` | `flush-irrigation-manifold` | Flush irrigation lines with purified water reserve | None | Water: $-6$ | `false` | Flushing the irrigation lines consumes a modest amount of purified water to protect crops and maintain steady food production. |
| `greenhouse-water` | `restrict-crop-irrigation` | Ration water flow and delay line servicing | Water: $-2$ (Conserves water vs. flush) | Food: $-10$ | `true` | Throttling water to the greenhouse starves the microgreens, causing crop loss and depleting future food stores. |

---

## 6. Balance Rationale & Mathematical Proof

### Bounded Penalty Safeguards:
1. **Maximum Single Resource Penalty Rule:** In accordance with `docs/GAME_RULES.md` §7, no single resource penalty exceeds $-15$. The maximum single penalty authored is $-15$ Power on `bypass-safety-breaker`. This guarantees that an event choice cannot trigger sudden death from full health.
2. **Mistake Tracking:** Risky decisions (`delay-shelter`, `bypass-safety-breaker`, `restrict-crop-irrigation`) are explicitly flagged with `isMistake: true`. Each increments `emergencyMistakes` by $+1$, penalizing the final score by $-25$ points per mistake under the canonical scoring formula:
   $$\text{Score} = \text{clamp}\left(0, 1000, \text{round}\left(500 + \frac{O_2 + P + W + F}{4} - \text{Radiation Risk} - 25 \times \text{emergencyMistakes}\right)\right)$$

### Arithmetic Proof (Alignment with `docs/GAME_RULES.md` §17.A):
When the commander chooses the optimal path (`shelter-in-bunker`, `reroute-aux-power`, `flush-irrigation-manifold`):
- Day 2 Delta: $\Delta \text{Power} = -5, \Delta \text{Risk} = +5$
- Day 3 Delta: $\Delta \text{Power} = -8$
- Day 4 Delta: $\Delta \text{Water} = -6, \Delta \text{Food} = +5$

Combining these with the 10 strategic maintenance actions and 5 daily drains demonstrates guaranteed survival:
- **Final Vitals:** $O_2: 15$, Power: $26$, Water: $11$, Food: $34$, Radiation Risk: $0\%$.
- **Final Score:** $\mathbf{522} / 1000$ (Mission Accomplished).

Conversely, combining mistakes with suboptimal maintenance leads deterministically to Day 3 power failure ($0\text{ kW}$) or Day 4 dehydration ($0\text{ L}$), proving meaningful educational cause-and-effect.

---

## 7. Source Attribution & Documentation Links

- **NASA DONKI Space Weather Service:** Community Coordinated Modeling Center (CCMC), NASA Goddard Space Flight Center.
  - Event View: `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1`
  - Notification View: `https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1`
- **Internal Cross-References:**
  - Science documentation: `docs/SCIENCE_SOURCES.md` §6 & §7
  - Assumption classification: `docs/ASSUMPTIONS.md` §1 & §6
  - Simulation contracts: `docs/INTERFACES.md` §2

---

## 8. Verification Matrix & Quality Audit

| Audit Item | Verification Requirement | Actual Authored State | Status |
|---|---|---|:---:|
| **Scenario Count** | Exactly 3 scenarios authored in `scenarios.json` | 3 objects in root array | **PASS** |
| **Unique IDs** | Unique string IDs matching frozen schedule | `solar-activity`, `power-outage`, `greenhouse-water` | **PASS** |
| **Days** | Exactly Days 2, 3, and 4 | Day 2, Day 3, Day 4 | **PASS** |
| **Choices Count** | Minimum 2 distinct choices per scenario | Exactly 2 choices per scenario (6 total) | **PASS** |
| **Unique Choice IDs** | Nonempty, unique choice IDs within scenario | All 6 IDs unique and descriptive | **PASS** |
| **Resource Keys** | Only frozen `ResourceKey` members in `effect` | `oxygen`, `power`, `water`, `food`, `radiationRisk` | **PASS** |
| **Penalty Bound** | Single resource decrement $\ge -15$ | Lowest penalty is $-15$ (Power) | **PASS** |
| **NASA Provenance** | Day 2 carries authentic NASA SEP metadata | Contains STEREO A SEP ID, timestamp, and CCMC URL | **PASS** |
| **Simulation Provenance** | Days 3 & 4 labeled `educational-simulation` | Verified `sourceKind: 'educational-simulation'` | **PASS** |
| **JSON Syntax** | Valid JSON, parseable without error | Validated via `JSON.parse` | **PASS** |
| **Self-Contained** | Zero imports or runtime dependencies in JSON | Pure static JSON payload | **PASS** |

---

## 9. Downstream Handoff

The authored `src/data/scenarios.json` is ready for consumption by:
1. **TRI-008 / TRI-016 (Simulation Engine Integration):** Loaded directly or imported via TypeScript module resolution as `GameScenario[]` to resolve active daily scenarios.
2. **TRI-017 (Event Modal UI Component):** Provides narrative briefings, button labels, and immediate feedback explanations for commander decisions.
3. **TRI-018 (Science & Educational Drawer):** Supplies authentic NASA metadata and CCMC links for the Day 2 space weather card.
4. **TRI-021 (QA & Science Audit):** Serves as the verified baseline for end-to-end mission playthrough testing.
