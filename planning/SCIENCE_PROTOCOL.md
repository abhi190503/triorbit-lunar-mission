# NASA Research / Data Protocol

1. **Eligible first-party NASA resource**: NASA Open APIs and DONKI listed by user from selected challenge. Source: https://api.nasa.gov/ ; official challenge page: https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/
2. Backend should request NASA DONKI `FLR` and/or `SEP` date windows, normalize actual returned fields, and carry factual NASA event ID, occurrence time, original link/source URL and event type into displayed science card.
3. **Scientific limitation**: solar flare does not equal measured Moon radiation exposure. Some solar events do not result in energetic-particle exposure at lunar surface. DONKI describes solar space weather observations, not game outcomes. Do not infer dose or health harm from event classes alone.
4. NASA RadLab: measurements aboard ISS; do not transfer as lunar dose. If not directly incorporated, place as cited background only and don't claim integration.
5. CSA food toolkit may support age-appropriate plant-food narrative; secondary reference only. No need to fetch all seven resources.
6. A bundled fixture is legitimate only if copied/derived from an *actual verifiable* NASA response during authorized build, with source URL and retrieval date. No invented record to keep the demo going.
7. Distinguish in documentation: (i) NASA factual observations; (ii) pedagogical game coefficients; (iii) fictional narrative; (iv) licensed visual or code assets.
8. If public API fails and verified fixture not yet prepared, stop and ask for a valid record—don't forge observation fields. `DEMO_KEY` is public shared and may have rate limits; real private key must remain on server and in ignored local env.
9. AI-assisted code/art/text must be declared in project submission; generated content must not mimic or modify NASA protected branding.
10. Confirm API usage terms / licensing for any third-party data. Add attribution to README and visible game science panel.

## Pre-verified candidate for tomorrow's integration
- NASA CCMC DONKI notification documents a **solar energetic particle (SEP)** event detected by STEREO A on 11 May 2024, event ID `2024-05-11T04:07:00-SEP-001`. Official notification: https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1
- This is a **candidate source record**, not evidence of radiation at the Moon. The notification refers to a spacecraft observation and is preliminary research information. Check the response of `https://api.nasa.gov/DONKI/SEP?startDate=2024-05-11&endDate=2024-05-12&api_key=DEMO_KEY` at the authorized build start. If it returns a matching valid event record, normalize and store provenance in the verified fallback. If unavailable, use the official NASA notice as supporting context but **do not pretend** it is a successful API response; find another verifiable JSON record from the API.
- The main educational event copy can read: "Mission Control has received a real historical solar-particle-activity bulletin. Your job is to decide how to protect the crew in this fictional training scenario." Do not claim the spacecraft's measurement is a lunar absorbed dose.
