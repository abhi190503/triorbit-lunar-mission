/**
 * TriOrbit — Lunar Survival Simulator
 * Educational NASA Science Facts & Citations
 *
 * Task: TRI-018
 * Lead Researcher: Nirsanth A. (@nirsanth23)
 * Reviewer: Vibhushan Ganeshan (@Vibhushan-2003)
 *
 * All facts are grounded in verified NASA Open Data and CCMC DONKI observations.
 * Language is calibrated for young astronauts aged 7–12.
 */

export interface ScienceFact {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  gameplayConnection: string;
  sourceName: string;
  sourceUrl: string;
  category: 'NASA-observation' | 'educational-explanation';
  caution?: string;
}

export const SCIENCE_FACTS: ScienceFact[] = [
  {
    id: "fact-sep-events",
    title: "Solar Storms & High-Speed Particles",
    summary: "The Sun can shoot fast, invisible proton storms across the solar system.",
    explanation:
      "When powerful solar flares erupt on the Sun, they can blast streams of tiny particles called protons into space at nearly the speed of light. NASA satellites monitor these Solar Energetic Particle (SEP) storms to warn space explorers before the particles arrive.",
    gameplayConnection:
      "In the Day 2 mission dilemma, an authentic SEP alert alerts you to move your crew into the underground bunker to stay safe from the solar storm.",
    sourceName: "NASA CCMC DONKI (Event 2024-05-11T04:07:00-SEP-001)",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1",
    category: "NASA-observation",
    caution:
      "This observation was recorded by the STEREO A spacecraft in space; it is not a direct measurement of radiation dose on the Moon's surface.",
  },
  {
    id: "fact-telemetry-vs-moon",
    title: "Spacecraft Cameras vs. The Lunar Surface",
    summary: "Space probes detect space weather far away from the Moon.",
    explanation:
      "Satellites like GOES and STEREO fly in deep space or Earth orbit. Their detectors measure particles flying freely through space. On the Moon, the Moon itself blocks half the sky from space particles, and lunar mountains and rocks change how particles scatter.",
    gameplayConnection:
      "TriOrbit uses real NASA storm alerts to start your emergency training, but the in-game Radiation Risk points (0–100) are educational game scores, not real physical radiation units.",
    sourceName: "NASA Open APIs Portal",
    sourceUrl: "https://api.nasa.gov/",
    category: "educational-explanation",
    caution:
      "In-game radiation numbers are simplified educational game points, not biological Sievert or Gray measurements.",
  },
  {
    id: "fact-space-weather-tracking",
    title: "What is NASA DONKI?",
    summary: "NASA's giant online bulletin board for space weather.",
    explanation:
      "DONKI stands for Space Weather Database Of Notifications, Knowledge, Information. Scientists at NASA's Goddard Space Flight Center log solar flares, particle storms, and coronal mass ejections so space missions and satellite operators know what space weather is doing.",
    gameplayConnection:
      "Your habitat's Mission Control relies on real historical DONKI bulletins to simulate the authentic alerts real astronauts receive from Earth.",
    sourceName: "NASA CCMC Space Weather Center",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/",
    category: "NASA-observation",
  },
  {
    id: "fact-regolith-shielding",
    title: "Moon Soil as a Radiation Shield",
    summary: "Piling lunar soil over a base keeps astronauts protected from space rays.",
    explanation:
      "Because the Moon has no thick atmosphere like Earth to shield against space radiation, astronauts can bury their habitats under several meters of lunar dirt, called regolith. Moon rocks and soil absorb high-energy particles like giant cosmic blankets.",
    gameplayConnection:
      "Selecting the 'Reinforce Shelter' action or choosing the 'Regolith Bunker' uses habitat power to keep your crew safe and reduces your Radiation Risk alert level.",
    sourceName: "NASA Open Data & Lunar Exploration Architecture",
    sourceUrl: "https://api.nasa.gov/",
    category: "educational-explanation",
  },
  {
    id: "fact-bioregenerative-greenhouses",
    title: "Plants in Space: Fresh Air & Food",
    summary: "Hydroponic crops recycle carbon dioxide into breathable oxygen and fresh salads.",
    explanation:
      "In a closed Moon habitat, every breath counts! Plants grown without soil in nutrient-rich water (hydroponics) take in the carbon dioxide astronauts breathe out and give back fresh oxygen and nutritious greens. Water recycling keeps this closed-loop cycle going.",
    gameplayConnection:
      "Operating the Hydroponics Greenhouse module costs water and power, but produces essential food points and stabilizes life-support reserves.",
    sourceName: "NASA & CSA Space Life Support Studies",
    sourceUrl: "https://api.nasa.gov/",
    category: "educational-explanation",
  },
];
