/**
 * TriOrbit — Lunar Survival Simulator
 * Educational Replay Insights & Mission Analytics
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-031 (Optional Expanded Replay Insights & Scenarios)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Nirsanth A. (@nirsanth23)
 *
 * Rules:
 * - Deterministic, pure, side-effect free analytics derived from canonical GameState
 * - Does not alter frozen scoring formulas, resource bounds, or game rules
 * - Calibrated for young learners (ages 7–12) to foster closed-loop systems thinking
 * - Zero external API requirements or unverified scientific claims
 */

import type { ActionId, GameState } from './types';

export interface ActionBreakdown {
  'maintain-solar': number;
  'generate-oxygen': number;
  'recycle-water': number;
  'operate-greenhouse': number;
  'reinforce-shelter': number;
  totalActions: number;
}

export interface DilemmaDecisionAnalysis {
  day: number;
  scenarioId: string;
  choiceId: string;
  isCautious: boolean;
  topic: string;
  lesson: string;
}

export interface ReplayInsights {
  /** Quantitative distribution of commander actions taken across modules */
  actionBreakdown: ActionBreakdown;
  /** Summary of space weather and emergency dilemma choices */
  dilemmaDecisions: DilemmaDecisionAnalysis[];
  /** Child-friendly honorary commander archetype title */
  commanderTitle: string;
  /** Primary systems engineering strength demonstrated */
  keyStrength: string;
  /** Constructive closed-loop learning recommendation */
  growthRecommendation: string;
  /** Educational takeaway explaining extraterrestrial trade-offs */
  educationalTakeaway: string;
}

/**
 * Maps known scenario IDs to educational space science context.
 */
const SCENARIO_LESSONS: Record<string, { topic: string; lesson: string }> = {
  'solar-activity': {
    topic: 'Solar Energetic Particles',
    lesson: 'Taking early shelter in subsurface regolith bunkers shields astronauts from intense solar proton fluxes detected by NASA spacecraft.',
  },
  'power-outage': {
    topic: 'Microgrid Resilience',
    lesson: 'Drawing controlled power from auxiliary reserves prevents life-support disruptions without damaging high-voltage transformers.',
  },
  'greenhouse-water': {
    topic: 'Closed-Loop Hydroponics',
    lesson: 'Flushing irrigation lines safeguards microgreens and crop yields, proving that food security is directly tied to water conservation.',
  },
};

/**
 * Pure function deriving educational replay insights from the completed or aborted GameState.
 */
export function generateReplayInsights(state: GameState): ReplayInsights {
  const { history, outcome, resources, emergencyMistakes } = state;

  // 1. Compute maintenance action breakdown
  const actionBreakdown: ActionBreakdown = {
    'maintain-solar': 0,
    'generate-oxygen': 0,
    'recycle-water': 0,
    'operate-greenhouse': 0,
    'reinforce-shelter': 0,
    totalActions: 0,
  };

  for (const record of history) {
    if (record.type === 'action' && record.actionId) {
      if (record.actionId in actionBreakdown) {
        actionBreakdown[record.actionId as ActionId] += 1;
        actionBreakdown.totalActions += 1;
      }
    }
  }

  // 2. Analyze dilemma choices
  const dilemmaDecisions: DilemmaDecisionAnalysis[] = [];
  for (const record of history) {
    if (record.type === 'event' && record.scenarioId && record.choiceId) {
      const info = SCENARIO_LESSONS[record.scenarioId] || {
        topic: 'Space Habitat Anomaly',
        lesson: 'Careful risk mitigation keeps the crew safe during unforeseen environmental hazards.',
      };

      const isCautious = !record.choiceId.includes('delay') && !record.choiceId.includes('bypass') && !record.choiceId.includes('restrict');

      dilemmaDecisions.push({
        day: record.day,
        scenarioId: record.scenarioId,
        choiceId: record.choiceId,
        isCautious,
        topic: info.topic,
        lesson: info.lesson,
      });
    }
  }

  // 3. Determine Commander Archetype Title
  let commanderTitle = 'Lunar Expedition Pioneer';
  if (outcome === 'success') {
    if (actionBreakdown['maintain-solar'] >= 3 && resources.power >= 20) {
      commanderTitle = 'Solar Array Specialist';
    } else if (actionBreakdown['operate-greenhouse'] >= 2 && resources.food >= 25) {
      commanderTitle = 'Hydroponic Agronomist';
    } else if (actionBreakdown['reinforce-shelter'] >= 2 && resources.radiationRisk <= 10) {
      commanderTitle = 'Radiation Defense Commander';
    } else if (emergencyMistakes === 0) {
      commanderTitle = 'Master Mission Strategist';
    } else {
      commanderTitle = 'Resilient Lunar Commander';
    }
  } else {
    commanderTitle = 'Cadet in Training';
  }

  // 4. Determine Key Strength
  let keyStrength = 'Balanced subsystem allocation across oxygen, power, and water reserves.';
  if (actionBreakdown['maintain-solar'] >= 3) {
    keyStrength = 'Proactive solar array maintenance kept the lunar habitat battery banks charged.';
  } else if (actionBreakdown['recycle-water'] >= 3) {
    keyStrength = 'Stewardship of the water loop prevented life support and crop dehydration.';
  } else if (actionBreakdown['reinforce-shelter'] >= 2) {
    keyStrength = 'Excellent hazard awareness: heavily reinforced bunker shields against solar radiation.';
  }

  // 5. Determine Growth Recommendation
  let growthRecommendation = 'Continue maintaining balanced power reserves to absorb unexpected night drain consumption.';
  if (outcome === 'failure') {
    if (resources.power <= 0) {
      growthRecommendation = 'Clean dust off the solar panels earlier in the week to avoid catastrophic power blackout.';
    } else if (resources.oxygen <= 0) {
      growthRecommendation = 'Electrolyze water for oxygen more frequently so the crew never runs out of breathable air.';
    } else if (resources.water <= 0) {
      growthRecommendation = 'Prioritize water reclamation cycles before expanding greenhouse crops.';
    } else if (resources.radiationRisk >= 100) {
      growthRecommendation = 'Always shelter in the subterranean bunker immediately when NASA space weather alerts arrive.';
    }
  } else if (emergencyMistakes > 0) {
    growthRecommendation = 'Evaluate emergency trade-offs cautiously: risky choices drain vital reserves faster.';
  }

  // 6. Educational Takeaway
  const educationalTakeaway =
    outcome === 'success'
      ? 'Living on the Moon is a continuous balancing act. Resources are never unlimited—every breath, watt of solar power, and sip of water is part of a delicate closed-loop ecosystem.'
      : 'In aerospace engineering, failure is the greatest teacher. Each simulated anomaly shows which life-support link broke first, helping you design a safer lunar habitat on your next expedition!';

  return {
    actionBreakdown,
    dilemmaDecisions,
    commanderTitle,
    keyStrength,
    growthRecommendation,
    educationalTakeaway,
  };
}
