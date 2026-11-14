# NASA Science and Evidence Map — TriOrbit Lunar Survival Simulator

> **Document:** `docs/SCIENCE_SOURCES.md`
> **Task ID:** TRI-002 (Issue #2)
> **Workstream:** Nirsanth NASA / Science / QA (`work/nirsanth-science`)
> **Lead Researcher:** Nirsanth A. (`@nirsanth23`)
> **Independent Reviewer:** Vibhushan Ganeshan (`@Vibhushan-2003`)
> **Status:** VERIFIED FOR REVIEW
> **Date Verified:** 14 November 2026

---

## 1. Scientific Purpose

TriOrbit Lunar Survival Simulator incorporates authentic NASA space-weather observations to ground educational gameplay in real solar physics and space exploration history.

**Key Scientific Boundary:**
NASA's space weather datasets (such as DONKI) provide observational records of solar events (e.g., Solar Flares, Coronal Mass Ejections, and Solar Energetic Particle events) detected by interplanetary and near-Earth spacecraft.

These datasets **do not provide physical lunar astronaut radiation dose measurements**. Space weather observations inform players of historical solar activity bulletins, while the resulting in-game vital impacts (such as resource penalties or `radiationRisk` increases) are strictly educational, deterministic simulation models.

---

## 2. Official NASA Challenge Reference

- **Challenge Title:** Build a Junior Astronaut Mission Trainer
- **Hackathon:** NASA Space Apps Challenge 2026
- **Canonical Challenge URL:** [NASA Space Apps Challenge 2026 - Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)
- **Independent Verification Status (Checked 14 Nov 2026):**
  - **HTTP Status:** 200 OK (Served via Next.js client application framework).
  - **Page Content Status:** `NOT VERIFIED (PAGE RETURNS 404 IN APP STATE)`.
  - **Live Audit Finding:** Querying the direct URL `https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/` returns an application shell that displays `"404: This page could not be found."` within the client DOM.
  - **Scientific Honesty Caveat:** Because the specific 2026 challenge detail page at this slug is not currently resolving published resource text on the live challenge portal, the listing of DONKI FLR/SEP as an official challenge-listed resource cannot be independently verified from the challenge page itself at this time. It is therefore classified as an intended challenge reference awaiting final portal publication, rather than a confirmed live challenge listing.

---

## 3. Official NASA Data Documentation

NASA provides public programmatic access to space science data through its Open APIs portal and the Community Coordinated Modeling Center (CCMC).

- **Portal Name:** NASA Open APIs
- **Maintaining Organization:** NASA Open Innovation Team / NASA Goddard Space Flight Center (GSFC)
- **Official Documentation Portal:** [NASA Open APIs](https://api.nasa.gov/)
- **Target Service Family:** DONKI (Space Weather Database Of Notifications, Knowledge, Information)
- **CCMC / DONKI Host Portal:** [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/DONKI/)
- **Core Endpoint Families for TriOrbit:**
  - `GET /DONKI/FLR` (Solar Flares)
  - `GET /DONKI/SEP` (Solar Energetic Particles)
- **Authentication:** `api_key` query parameter. Public testing uses shared `DEMO_KEY` (subject to IP rate limits: 30 requests per hour, 50 per day). Production uses server-side registered `NASA_API_KEY`.
- **Primary Scientific Limitation:** Spacecraft detectors (such as STEREO or GOES) observe particles in heliospheric orbits or geostationary orbit. Measurements are location-dependent and do not equal surface conditions on the Moon.

---

## 4. Solar Flare (FLR) Endpoint & Field Evidence

### Endpoint Specification
```http
GET https://api.nasa.gov/DONKI/FLR?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&api_key={API_KEY}
```

### Live Endpoint Query Audit (14 Nov 2026)
- **Endpoint Tested:** `https://api.nasa.gov/DONKI/FLR?startDate=2024-05-10&endDate=2024-05-12&api_key=DEMO_KEY`
- **HTTP Response:** `404 Not Found`
- **Response Body:**
  ```json
  {
    "timestamp": "2026-11-14T05:42:07.977Z",
    "status": 404,
    "error": "Not Found",
    "path": "/DONKI-API/get/FLR/"
  }
  ```
- **Audit Finding:** The upstream routing gateway for the `FLR` endpoint on `api.nasa.gov` currently returns HTTP 404 (`/DONKI-API/get/FLR/` not found). Downstream systems must account for this endpoint unavailability and prioritize verified SEP data or verified offline fixtures.

### Documented Response Fields (CCMC Specification)
When functional, NASA DONKI FLR records document the following fields:

| Field Name | Type | Description | Scientific Caveat |
|---|---|---|---|
| `flrID` | string | Unique NASA event identifier (e.g., `2024-05-11T01:10:00-FLR-001`) | Canonical tracking ID |
| `beginTime` | string (ISO UTC) | Start of soft X-ray flux enhancement | Observation time at detector |
| `peakTime` | string (ISO UTC) | Maximum recorded flux intensity | Peak electromagnetic emission |
| `endTime` | string (ISO UTC) | Return to baseline flux | May be null if ongoing |
| `classType` | string | GOES flare classification (e.g., `X5.8`, `M1.2`, `C2.4`) | **Classification of X-ray flux, NOT lunar radiation dose** |
| `sourceLocation` | string | Heliographic coordinates of active region (e.g., `S18W89`) | Solar surface origin |
| `activeRegionNum` | number | NOAA active region number (e.g., `13664`) | Solar tracking context |
| `link` | string | URL to NASA CCMC event detail view | Original source provenance |
| `instruments` | array | Observing instruments (e.g., GOES-16 EXIS) | Sensor metadata |
| `linkedEvents` | array | Cross-referenced DONKI events (CME, SEP) | Space weather causality |

---

## 5. Solar Energetic Particle (SEP) Endpoint & Field Evidence

### Endpoint Specification
```http
GET https://api.nasa.gov/DONKI/SEP?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&api_key={API_KEY}
```

### Live Endpoint Query Audit (14 Nov 2026)
- **Endpoint Tested:** `https://api.nasa.gov/DONKI/SEP?startDate=2024-05-11&endDate=2024-05-12&api_key=DEMO_KEY`
- **HTTP Response:** `200 OK`
- **Result:** Successfully returned real authentic NASA JSON array with 2 verified SEP events from the May 2024 solar storm sequence.

### Real Response Fields Verified from Live API

```json
[
  {
    "sepID": "2024-05-11T02:10:00-SEP-001",
    "eventTime": "2024-05-11T02:10Z",
    "instruments": [
      {
        "displayName": "GOES-P: SEISS >100 MeV"
      }
    ],
    "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30714/-1",
    "linkedEvents": [
      {
        "activityID": "2024-05-11T01:10:00-FLR-001"
      },
      {
        "activityID": "2024-05-11T01:36:00-CME-001"
      }
    ],
    "sentNotifications": [
      {
        "messageID": "20240511-AL-006",
        "messageIssueTime": "2024-05-11T02:30Z",
        "messageURL": "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30715/1"
      },
      {
        "messageID": "20240511-AL-007",
        "messageIssueTime": "2024-05-11T02:46Z",
        "messageURL": "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30716/1"
      }
    ],
    "submissionTime": "2024-05-11T02:30Z",
    "versionId": 1
  },
  {
    "sepID": "2024-05-11T04:07:00-SEP-001",
    "eventTime": "2024-05-11T04:07Z",
    "instruments": [
      {
        "displayName": "STEREO A: IMPACT 13-100 MeV"
      }
    ],
    "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1",
    "linkedEvents": [
      {
        "activityID": "2024-05-11T01:10:00-FLR-001"
      },
      {
        "activityID": "2024-05-11T01:36:00-CME-001"
      }
    ],
    "sentNotifications": [
      {
        "messageID": "20240511-AL-008",
        "messageIssueTime": "2024-05-11T04:13Z",
        "messageURL": "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30718/1"
      },
      {
        "messageID": "20240511-AL-013",
        "messageIssueTime": "2024-05-11T15:03Z",
        "messageURL": "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1"
      }
    ],
    "submissionTime": "2024-05-11T04:13Z",
    "versionId": 1
  }
]
```

---

## 6. Real Historical NASA Event Evidence

### Primary Selected Historical Event: STEREO A Solar Energetic Particle Event (11 May 2024)

- **NASA Event ID (`sepID`):** `2024-05-11T04:07:00-SEP-001`
- **Event Type:** SEP (Solar Energetic Particle)
- **Observed Timestamp (`eventTime`):** `2024-05-11T04:07Z` (UTC)
- **Observing Spacecraft / Instrument:** `STEREO A: IMPACT 13-100 MeV` (In-situ Measurements of Particles and CME Transients)
- **Official NASA Catalog Link:** [NASA CCMC DONKI SEP 30717](https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1)
- **Official Space Weather Alert Notification:** [NASA CCMC Alert 30728](https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1)
- **Associated Solar Flare:** `2024-05-11T01:10:00-FLR-001`
- **Associated Coronal Mass Ejection:** `2024-05-11T01:36:00-CME-001`
- **API Request Used:**
  ```http
  GET https://api.nasa.gov/DONKI/SEP?startDate=2024-05-11&endDate=2024-05-12&api_key=DEMO_KEY
  ```
- **Verification Date:** 14 November 2026
- **Dataset Provenance:** NASA CCMC / DONKI via `api.nasa.gov`

### Contextual Background of the Event
On 10–11 May 2024, super active region NOAA AR3664 produced a barrage of powerful X-class solar flares and fast Earth/interplanetary directed CMEs, triggering the most intense geomagnetic storm observed in over twenty years (G5 extreme level). During this sequence, STEREO A detected proton flux enhancements in the 13–100 MeV energy band, generating real-time DONKI alerts across NASA flight teams.

---

## 7. Event Evidence Table

| Field | Required Evidence | Actual Verified Value | Provenance & Audit Note |
|---|---|---|---|
| **NASA Event ID** | Actual returned value | `2024-05-11T04:07:00-SEP-001` | Matches NASA API `sepID` |
| **Event Type** | `FLR` or `SEP` | `SEP` | Solar Energetic Particle event |
| **Observation Time** | Actual UTC timestamp | `2024-05-11T04:07Z` | Matches NASA API `eventTime` |
| **Source Instrument** | Recorded display name | `STEREO A: IMPACT 13-100 MeV` | Spacecraft detector channel |
| **Event Classification** | Recorded classification | Flux threshold exceeded (13–100 MeV) | Documented in Alert 30728/1 |
| **Official Event URL** | Traceable NASA URL | `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1` | CCMC canonical event view |
| **Notification URL** | Traceable alert URL | `https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1` | Official CCMC notification link |
| **Reproducible API Request** | Reproducible endpoint | `https://api.nasa.gov/DONKI/SEP?startDate=2024-05-11&endDate=2024-05-12&api_key=DEMO_KEY` | HTTP 200 confirmed live |
| **Verification Date** | Actual research date | `2026-11-14` | Live terminal verification |
| **Dataset Provenance** | Sourced organization | `NASA DONKI` | CCMC / GSFC Open API |
| **Data Caveat** | Physical limitation | **No inference of lunar radiation dose** | Spacecraft instrument only |

---

## 8. NASA Resource Attribution & Terms of Use

- **Data Attribution:** NASA space weather event metadata is provided courtesy of the Space Weather Database Of Notifications, Knowledge, Information (DONKI) team at the Community Coordinated Modeling Center (CCMC), NASA Goddard Space Flight Center.
- **Data Policy & Terms:** NASA open data and APIs are generally placed in the public domain and made available under NASA Open Data Policy (subject to U.S. government works public domain status, 17 U.S.C. § 105). Data may be redistributed in historical fallback fixtures provided proper citation is maintained.
- **Redistribution Permission:** Permitted for educational and competition purposes, including bundled JSON fallback fixtures for offline resilience.
- **Restrictions & Prohibitions:**
  - **No Endorsement:** Redistribution or usage must not claim or imply NASA endorsement of the TriOrbit application, team, or specific game calculations.
  - **No Brand Modification:** Official NASA insignias (meatball, worm logos) must not be generated, altered, or placed into custom assets without formal NASA permission.
  - **Authenticity Protection:** Fallback datasets must reflect genuine historical records and must never present fabricated data under the `NASA DONKI` source attribution.

---

## 9. Secondary References: NASA RadLab & Canadian Space Agency

### NASA RadLab (Radiation Laboratory)
- **Description:** NASA RadLab compiles and standardizes radiation dosimetry measurements recorded aboard the International Space Station (ISS) in Low Earth Orbit (LEO).
- **Scientific Limitation & Boundary:** LEO radiation environments are heavily shielded by Earth's magnetosphere (geomagnetic cutoff) and by the physical bulk of the ISS pressurized modules. **RadLab measurements must never be substituted for or equated with lunar surface radiation doses.** On the lunar surface, there is no global magnetic field or atmosphere to deflect energetic galactic cosmic rays (GCRs) or solar energetic particles (SEPs).
- **Role in TriOrbit:** Background educational context only. RadLab data is not ingested into the simulation engine.

### Canadian Space Agency (CSA) Food & Nutrition Resources
- **Description:** Educational material on deep-space nutrition, bioregenerative life support systems, and microgreen/plant cultivation in extreme environments (e.g., Deep Space Food Challenge, Tomatosphere).
- **Scientific Limitation & Boundary:** CSA educational narratives describe the principles of space botany. They do not define mathematical oxygen production rates or water consumption curves for the TriOrbit hydroponics module.
- **Role in TriOrbit:** Narrative and pedagogical inspiration for the Hydroponics module and emergency greenhouse dilemma. In-game vital costs remain calibrated educational game units.

---

## 10. Citation Format & Reusable Pattern

### Standard Reusable Citation Pattern
```text
Organization: NASA Goddard Space Flight Center / CCMC
Dataset/Product: Space Weather Database Of Notifications, Knowledge, Information (DONKI)
Event Identifier: {sepID or flrID}
Observation Timestamp: {eventTime or beginTime} (UTC)
Official Event URL: {ccmc_url}
API Documentation URL: https://api.nasa.gov/
Retrieved/Verified on: {retrieval_date}
Scientific Limitation: Spacecraft instrument observation; does not measure biological absorbed dose on the Moon.
```

### Complete Verified Example
```text
Organization: NASA Goddard Space Flight Center / CCMC
Dataset/Product: Space Weather Database Of Notifications, Knowledge, Information (DONKI) - Solar Energetic Particles (SEP)
Event Identifier: 2024-05-11T04:07:00-SEP-001
Observation Timestamp: 2024-05-11T04:07Z
Official Event URL: https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1
Notification URL: https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1
API Documentation URL: https://api.nasa.gov/
Retrieved/Verified on: 2026-11-14
Scientific Limitation: STEREO A spacecraft in-situ detector observation; not a measured lunar surface radiation dose.
```

---

## 11. Independent Source-Link Audit Log (Test F)

| URL Checked | Check Date & Time | HTTP / Result Status | Evidence Matched | Audit Result |
|---|---|---|---|---|
| `https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/` | 2026-11-14 11:12 UTC+5:30 | HTTP 200 / App 404 | URL alive, but challenge page body returns 404 inside Next.js DOM | **NOT VERIFIED (APP 404)** |
| `https://api.nasa.gov/` | 2026-11-14 11:10 UTC+5:30 | HTTP 200 OK | NASA Open APIs documentation root | **PASS** |
| `https://api.nasa.gov/DONKI/SEP?startDate=2024-05-11&endDate=2024-05-12&api_key=DEMO_KEY` | 2026-11-14 11:12 UTC+5:30 | HTTP 200 OK | Valid JSON array returned with 2 real events; matched `2024-05-11T04:07:00-SEP-001` | **PASS** |
| `https://api.nasa.gov/DONKI/FLR?startDate=2024-05-10&endDate=2024-05-12&api_key=DEMO_KEY` | 2026-11-14 11:12 UTC+5:30 | HTTP 404 Not Found | Gateway returns 404 for `/DONKI-API/get/FLR/` | **FAIL (UPSTREAM ENDPOINT 404)** |
| `https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1` | 2026-11-14 11:11 UTC+5:30 | Verified in API Payload | Canonical link URL returned in authentic NASA response body | **PASS** |
| `https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1` | 2026-11-14 11:11 UTC+5:30 | Verified in API Payload | Official notification URL returned in authentic NASA response body | **PASS** |
| `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1` | 2026-11-14 11:11 UTC+5:30 | Connection Timeout | Legacy host `kauai.ccmc.gsfc.nasa.gov` unresponsive; replaced by `ccmc.gsfc.nasa.gov` | **SUPERSEDED HOST** |
