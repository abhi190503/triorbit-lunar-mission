import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { GameState } from './types';
import { createInitialMission } from './engine';
import { generateReplayInsights } from './insights';

describe('TRI-031: Educational Replay Insights & Mission Analytics', () => {
  it('correctly compiles action breakdown from history', () => {
    const state: GameState = {
      ...createInitialMission(),
      history: [
        { day: 1, type: 'action', actionId: 'maintain-solar', after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 } },
        { day: 1, type: 'action', actionId: 'maintain-solar', after: { oxygen: 75, power: 100, water: 75, food: 70, radiationRisk: 10 } },
        { day: 2, type: 'action', actionId: 'generate-oxygen', after: { oxygen: 95, power: 92, water: 69, food: 70, radiationRisk: 10 } },
        { day: 2, type: 'action', actionId: 'recycle-water', after: { oxygen: 95, power: 85, water: 87, food: 70, radiationRisk: 10 } },
        { day: 3, type: 'action', actionId: 'operate-greenhouse', after: { oxygen: 95, power: 79, water: 78, food: 87, radiationRisk: 10 } },
        { day: 3, type: 'action', actionId: 'reinforce-shelter', after: { oxygen: 95, power: 72, water: 78, food: 87, radiationRisk: 0 } },
      ],
    };

    const insights = generateReplayInsights(state);
    assert.equal(insights.actionBreakdown['maintain-solar'], 2);
    assert.equal(insights.actionBreakdown['generate-oxygen'], 1);
    assert.equal(insights.actionBreakdown['recycle-water'], 1);
    assert.equal(insights.actionBreakdown['operate-greenhouse'], 1);
    assert.equal(insights.actionBreakdown['reinforce-shelter'], 1);
    assert.equal(insights.actionBreakdown.totalActions, 6);
  });

  it('correctly analyzes dilemma decisions from history', () => {
    const state: GameState = {
      ...createInitialMission(),
      history: [
        {
          day: 2,
          type: 'event',
          scenarioId: 'solar-activity',
          choiceId: 'shelter-in-bunker',
          after: { oxygen: 75, power: 65, water: 75, food: 70, radiationRisk: 15 },
        },
      ],
    };

    const insights = generateReplayInsights(state);
    assert.equal(insights.dilemmaDecisions.length, 1);
    assert.equal(insights.dilemmaDecisions[0].day, 2);
    assert.equal(insights.dilemmaDecisions[0].scenarioId, 'solar-activity');
    assert.equal(insights.dilemmaDecisions[0].isCautious, true);
    assert.ok(insights.dilemmaDecisions[0].lesson.includes('subsurface regolith bunkers'));
  });

  it('assigns constructive growth recommendations on failure conditions', () => {
    // Power blackout failure
    const blackoutState: GameState = {
      ...createInitialMission(),
      outcome: 'failure',
      phase: 'result',
      resources: { oxygen: 50, power: 0, water: 50, food: 50, radiationRisk: 20 },
    };
    const blackoutInsights = generateReplayInsights(blackoutState);
    assert.equal(blackoutInsights.commanderTitle, 'Cadet in Training');
    assert.ok(blackoutInsights.growthRecommendation.includes('solar panels'));

    // Radiation hazard failure
    const radiationState: GameState = {
      ...createInitialMission(),
      outcome: 'failure',
      phase: 'result',
      resources: { oxygen: 50, power: 50, water: 50, food: 50, radiationRisk: 100 },
    };
    const radInsights = generateReplayInsights(radiationState);
    assert.ok(radInsights.growthRecommendation.includes('subterranean bunker'));
  });

  it('awards honorary titles on successful mission completion', () => {
    const successState: GameState = {
      ...createInitialMission(),
      outcome: 'success',
      phase: 'result',
      emergencyMistakes: 0,
      resources: { oxygen: 40, power: 30, water: 30, food: 30, radiationRisk: 5 },
      history: [
        { day: 1, type: 'action', actionId: 'maintain-solar', after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 } },
        { day: 2, type: 'action', actionId: 'maintain-solar', after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 } },
        { day: 3, type: 'action', actionId: 'maintain-solar', after: { oxygen: 75, power: 90, water: 75, food: 70, radiationRisk: 10 } },
      ],
    };
    const insights = generateReplayInsights(successState);
    assert.equal(insights.commanderTitle, 'Solar Array Specialist');
    assert.ok(insights.educationalTakeaway.includes('closed-loop ecosystem'));
  });

  it('is purely deterministic and does not mutate input state', () => {
    const state = createInitialMission();
    const beforeStr = JSON.stringify(state);

    const res1 = generateReplayInsights(state);
    const res2 = generateReplayInsights(state);

    assert.deepEqual(res1, res2);
    assert.equal(JSON.stringify(state), beforeStr);
  });
});
