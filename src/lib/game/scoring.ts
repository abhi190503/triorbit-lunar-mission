/**
 * TriOrbit — Lunar Survival Simulator
 * Deterministic Scoring System & Mission Evaluation
 *
 * NASA Space Apps Challenge 2026
 * Task: TRI-009 (Derived from frozen docs/GAME_RULES.md & docs/INTERFACES.md)
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Nirsanth A. (@nirsanth23)
 *
 * All scoring rules are deterministic, educational assumptions.
 * Score points do NOT represent real astronaut survival probabilities.
 */

import type { GameState, ResourceState } from './types';
import { calculateGameScore, clampResource } from './contracts';

/**
 * Detailed breakdown of the mission performance score components.
 */
export interface ScoreBreakdown {
  /** Fixed bonus awarded for completing the 5-day rotation (+500). */
  baseSurvivalBonus: number;
  /** Average remaining vital resources: (O2 + Power + Water + Food) / 4. */
  essentialsAverage: number;
  /** Penalty equal to final Radiation Risk percentage (-risk). */
  radiationPenalty: number;
  /** Cumulative penalty for hazardous emergency choices (-25 per mistake). */
  emergencyMistakePenalty: number;
  /** Number of hazardous emergency mistakes incurred. */
  emergencyMistakes: number;
  /** Raw unrounded score before clamping. */
  rawScore: number;
  /** Final integer score bounded strictly within [0, 1000]. */
  finalScore: number;
  /** Qualitative mission accomplishment tier for younger learners. */
  rating: 'Nominal Mission' | 'Acceptable Survival' | 'Critical Emergency' | 'Mission Aborted';
  /** Child-friendly educational evaluation text. */
  educationalTakeaway: string;
}

/**
 * Calculates the final integer mission score strictly bounded within [0, 1000].
 * Reuses the canonical calculation formula from contracts.ts.
 *
 * Formula:
 * clamp(0, 1000, round(500 + (O2 + Power + Water + Food) / 4 - RadiationRisk - 25 * emergencyMistakes))
 */
export function calculateMissionScore(state: GameState): number {
  return calculateGameScore(state.resources, state.emergencyMistakes);
}

/**
 * Produces a transparent, visible breakdown of all score components.
 * Pure and deterministic; repeat calls on identical state yield identical breakdowns.
 */
export function getScoreBreakdown(state: GameState): ScoreBreakdown {
  const { resources, emergencyMistakes, outcome } = state;

  const baseSurvivalBonus = outcome === 'success' ? 500 : 0;
  const essentialsAverage =
    (clampResource(resources.oxygen) +
      clampResource(resources.power) +
      clampResource(resources.water) +
      clampResource(resources.food)) /
    4;
  const radiationPenalty = -clampResource(resources.radiationRisk) || 0;
  const emergencyMistakePenalty = -(25 * Math.max(0, emergencyMistakes)) || 0;

  const rawScore =
    baseSurvivalBonus + essentialsAverage + radiationPenalty + emergencyMistakePenalty;
  const finalScore = Math.max(0, Math.min(1000, Math.round(rawScore)));

  let rating: ScoreBreakdown['rating'];
  let educationalTakeaway: string;

  if (outcome !== 'success') {
    rating = 'Mission Aborted';
    educationalTakeaway =
      'The habitat life-support balance was disrupted. Review your subsystem decisions and try again, Commander!';
  } else if (finalScore >= 550) {
    rating = 'Nominal Mission';
    educationalTakeaway =
      'Outstanding mission command! You maintained safe life-support margins and shielded the crew from solar radiation.';
  } else if (finalScore >= 480) {
    rating = 'Acceptable Survival';
    educationalTakeaway =
      'Good job! The crew safely completed their 5-day tour, though some life-support reserves ran low.';
  } else {
    rating = 'Critical Emergency';
    educationalTakeaway =
      'The crew survived, but habitat systems were pushed to their absolute limits. Focus on power and water recycling in your next run!';
  }

  return {
    baseSurvivalBonus,
    essentialsAverage: Math.round(essentialsAverage * 10) / 10,
    radiationPenalty,
    emergencyMistakePenalty,
    emergencyMistakes,
    rawScore: Math.round(rawScore * 10) / 10,
    finalScore,
    rating,
    educationalTakeaway,
  };
}

/**
 * Pure helper calculating score directly from arbitrary ResourceState and mistake count.
 * Useful for UI preview calculations without full GameState instantiation.
 */
export function computeScoreFromResources(
  resources: ResourceState,
  emergencyMistakes: number,
  isVictory: boolean = true
): number {
  const baseBonus = isVictory ? 500 : 0;
  const avg = (resources.oxygen + resources.power + resources.water + resources.food) / 4;
  const raw = baseBonus + avg - resources.radiationRisk - 25 * emergencyMistakes;
  return Math.max(0, Math.min(1000, Math.round(raw)));
}
