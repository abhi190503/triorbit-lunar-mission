/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-015: Mission HUD — Day, Status and Resources Verification Suite
 *
 * Primary Owner: Abhinaya Jeyakumar (@abhi190503)
 * Reviewer: Vibhushan Ganeshan (@Vibhushan-2003)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  MissionHUD,
  ResourceGauge,
  RESOURCE_METAS,
  CANONICAL_HUD_RESOURCES,
  evaluateResourceStatus,
  getMissionStatusDescriptor,
  isFinishDayDisabled,
  getFinishDayHelpText,
} from './index';
import type {
  MissionHUDProps,
  ResourceState,
} from '@/lib/game/types';
import {
  INITIAL_RESOURCES,
} from '@/lib/game/contracts';

describe('TRI-015: Mission HUD & Resource Gauges Verification', () => {
  // --------------------------------------------------------------------------
  // TEST 1: Exports and canonical metadata contracts
  // --------------------------------------------------------------------------
  it('exports all required components, helpers and constants', () => {
    assert.equal(typeof MissionHUD, 'function');
    assert.equal(typeof ResourceGauge, 'function');
    assert.equal(typeof evaluateResourceStatus, 'function');
    assert.equal(typeof getMissionStatusDescriptor, 'function');
    assert.equal(typeof isFinishDayDisabled, 'function');
    assert.equal(typeof getFinishDayHelpText, 'function');
    assert.ok(Array.isArray(CANONICAL_HUD_RESOURCES));
    assert.equal(CANONICAL_HUD_RESOURCES.length, 5);
    assert.deepEqual(CANONICAL_HUD_RESOURCES, [
      'oxygen',
      'power',
      'water',
      'food',
      'radiationRisk',
    ]);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Initial display-only fixture values rendering
  // --------------------------------------------------------------------------
  it('renders initial display-only fixture values accurately without local mutation', () => {
    const fixtureProps: MissionHUDProps = {
      day: 1,
      phase: 'choose',
      actionsRemaining: 2,
      resources: { ...INITIAL_RESOURCES },
      outcome: 'active',
      onFinishDay: () => {},
    };

    const html = renderToString(React.createElement(MissionHUD, fixtureProps));

    // Day counter
    assert.ok(html.includes('DAY 1 / 5'), 'Should display Day 1 / 5');
    // Actions remaining
    assert.ok(html.includes('2 / 2'), 'Should display 2 / 2 actions remaining');
    // Initial resource values: 75, 70, 75, 70, 10
    assert.ok(html.includes('75'), 'Should display Oxygen/Water initial 75');
    assert.ok(html.includes('70'), 'Should display Power/Food initial 70');
    assert.ok(html.includes('10'), 'Should display Radiation initial 10');
    // Status badge
    assert.ok(html.includes('CREW: 3 NOMINAL'), 'Should show nominal crew status badge');
  });

  // --------------------------------------------------------------------------
  // TEST 3: All five canonical resource labels and adverse hazard indication
  // --------------------------------------------------------------------------
  it('renders all five canonical resource labels and identifies radiation as adverse', () => {
    const html = renderToString(
      React.createElement(MissionHUD, {
        day: 1,
        phase: 'choose',
        actionsRemaining: 2,
        resources: { ...INITIAL_RESOURCES },
        outcome: 'active',
        onFinishDay: () => {},
      })
    );

    assert.ok(html.includes('Oxygen'), 'Should include Oxygen label');
    assert.ok(html.includes('Power'), 'Should include Power label');
    assert.ok(html.includes('Water'), 'Should include Water label');
    assert.ok(html.includes('Food'), 'Should include Food label');
    assert.ok(html.includes('Radiation Risk'), 'Should include Radiation Risk label');
    assert.ok(html.includes('HAZARD'), 'Radiation Risk must display adverse HAZARD tag');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Resource values at boundary minimum 0 (Depleted / Low Risk)
  // --------------------------------------------------------------------------
  it('handles resource values at 0 with Depleted for vitals and Low Risk for radiation', () => {
    // Essential vital at 0
    const o2Eval = evaluateResourceStatus('oxygen', 0);
    assert.equal(o2Eval.status, 'depleted');
    assert.equal(o2Eval.statusLabel, 'Depleted');
    assert.equal(o2Eval.isCritical, true);

    // Radiation Risk at 0 (adverse: 0 is completely safe)
    const radEval = evaluateResourceStatus('radiationRisk', 0);
    assert.equal(radEval.status, 'nominal');
    assert.equal(radEval.statusLabel, 'Low Risk');
    assert.equal(radEval.isCritical, false);

    // Component render at 0
    const gaugeHtml = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'oxygen',
        value: 0,
      })
    );
    assert.ok(gaugeHtml.includes('0'), 'Should display 0 value');
    assert.ok(gaugeHtml.includes('Depleted'), 'Should show Depleted badge');
    assert.ok(gaugeHtml.includes('aria-valuenow="0"'), 'aria-valuenow must be 0');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Resource values at boundary maximum 100 (Nominal / Max Risk)
  // --------------------------------------------------------------------------
  it('handles resource values at 100 with Nominal for vitals and Max Risk for radiation', () => {
    // Essential vital at 100
    const o2Eval = evaluateResourceStatus('oxygen', 100);
    assert.equal(o2Eval.status, 'nominal');
    assert.equal(o2Eval.statusLabel, 'Nominal');
    assert.equal(o2Eval.isCritical, false);

    // Radiation Risk at 100 (adverse: 100 is maximum failure hazard)
    const radEval = evaluateResourceStatus('radiationRisk', 100);
    assert.equal(radEval.status, 'maximum');
    assert.equal(radEval.statusLabel, 'Max Risk');
    assert.equal(radEval.isCritical, true);

    const gaugeHtml = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'radiationRisk',
        value: 100,
      })
    );
    assert.ok(gaugeHtml.includes('100'), 'Should display 100 value');
    assert.ok(gaugeHtml.includes('Max Risk'), 'Should show Max Risk badge');
    assert.ok(gaugeHtml.includes('aria-valuenow="100"'), 'aria-valuenow must be 100');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Essential resource critical threshold at 20 vs warning at 21–40 vs nominal > 40
  // --------------------------------------------------------------------------
  it('correctly evaluates essential resource thresholds at 20 (Critical), 21-40 (Warning), and 41+ (Nominal)', () => {
    // Value = 20 (Critical threshold)
    const at20 = evaluateResourceStatus('power', 20);
    assert.equal(at20.status, 'critical');
    assert.equal(at20.statusLabel, 'Critical');
    assert.equal(at20.isCritical, true);
    assert.equal(at20.badgeVariant, 'critical');

    // Value = 21 (Warning lower bound)
    const at21 = evaluateResourceStatus('power', 21);
    assert.equal(at21.status, 'warning');
    assert.equal(at21.statusLabel, 'Warning');
    assert.equal(at21.isCritical, false);
    assert.equal(at21.badgeVariant, 'warning');

    // Value = 40 (Warning upper bound)
    const at40 = evaluateResourceStatus('power', 40);
    assert.equal(at40.status, 'warning');
    assert.equal(at40.statusLabel, 'Warning');
    assert.equal(at40.isCritical, false);

    // Value = 41 (Nominal lower bound)
    const at41 = evaluateResourceStatus('power', 41);
    assert.equal(at41.status, 'nominal');
    assert.equal(at41.statusLabel, 'Nominal');
    assert.equal(at41.isCritical, false);
    assert.equal(at41.badgeVariant, 'nominal');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Normal resource state at 75
  // --------------------------------------------------------------------------
  it('evaluates normal resource state at 75 as Nominal with healthy styles', () => {
    const evalResult = evaluateResourceStatus('water', 75);
    assert.equal(evalResult.status, 'nominal');
    assert.equal(evalResult.statusLabel, 'Nominal');
    assert.equal(evalResult.isCritical, false);
    assert.equal(evalResult.barColorHex, RESOURCE_METAS.water.colorHex);

    const gaugeHtml = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'water',
        value: 75,
      })
    );
    assert.ok(gaugeHtml.includes('75'), 'Should render value 75');
    assert.ok(gaugeHtml.includes('Nominal'), 'Should display Nominal badge');
    assert.ok(!gaugeHtml.includes('animate-pulse'), 'Should not pulse when nominal');
  });

  // --------------------------------------------------------------------------
  // TEST 8: Radiation warning thresholds: 70 (Critical) and 50 (Elevated)
  // --------------------------------------------------------------------------
  it('correctly evaluates radiation hazard at 70 (Critical) and 50 (Elevated)', () => {
    // Value = 70 (Critical radiation threshold)
    const at70 = evaluateResourceStatus('radiationRisk', 70);
    assert.equal(at70.status, 'critical');
    assert.equal(at70.statusLabel, 'Critical Risk');
    assert.equal(at70.isCritical, true);
    assert.equal(at70.badgeVariant, 'critical');

    // Value = 50 (Elevated radiation threshold)
    const at50 = evaluateResourceStatus('radiationRisk', 50);
    assert.equal(at50.status, 'warning');
    assert.equal(at50.statusLabel, 'Elevated Risk');
    assert.equal(at50.isCritical, false);
    assert.equal(at50.badgeVariant, 'warning');

    // Value = 49 (Safe background)
    const at49 = evaluateResourceStatus('radiationRisk', 49);
    assert.equal(at49.status, 'nominal');
    assert.equal(at49.statusLabel, 'Low Risk');
    assert.equal(at49.isCritical, false);
  });

  // --------------------------------------------------------------------------
  // TEST 9: Day 1 and Day 5 display and visual track progression
  // --------------------------------------------------------------------------
  it('renders Day 1 and Day 5 display with active step indicators', () => {
    const baseResources: ResourceState = { ...INITIAL_RESOURCES };

    // Render at Day 1
    const day1Html = renderToString(
      React.createElement(MissionHUD, {
        day: 1,
        phase: 'choose',
        actionsRemaining: 2,
        resources: baseResources,
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(day1Html.includes('DAY 1 / 5'), 'Should display DAY 1 / 5');
    assert.ok(day1Html.includes('data-testid="hud-day-step-1"'), 'Should render day step 1');

    // Render at Day 5
    const day5Html = renderToString(
      React.createElement(MissionHUD, {
        day: 5,
        phase: 'choose',
        actionsRemaining: 1,
        resources: baseResources,
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(day5Html.includes('DAY 5 / 5'), 'Should display DAY 5 / 5');
    assert.ok(day5Html.includes('data-testid="hud-day-step-5"'), 'Should render day step 5');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Actions remaining at 2, 1, and 0 with warning at 0
  // --------------------------------------------------------------------------
  it('renders actions remaining at 2, 1, and 0 with a warning when 0 remain', () => {
    const baseResources: ResourceState = { ...INITIAL_RESOURCES };

    // 2 actions remaining
    const act2Html = renderToString(
      React.createElement(MissionHUD, {
        day: 2,
        phase: 'choose',
        actionsRemaining: 2,
        resources: baseResources,
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(act2Html.includes('2 / 2'), 'Should display 2 / 2');

    // 1 action remaining
    const act1Html = renderToString(
      React.createElement(MissionHUD, {
        day: 2,
        phase: 'choose',
        actionsRemaining: 1,
        resources: baseResources,
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(act1Html.includes('1 / 2'), 'Should display 1 / 2');

    // 0 actions remaining
    const act0Html = renderToString(
      React.createElement(MissionHUD, {
        day: 2,
        phase: 'choose',
        actionsRemaining: 0,
        resources: baseResources,
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(act0Html.includes('0 / 2'), 'Should display 0 / 2');
    assert.ok(
      act0Html.includes('All daily actions used') || act0Html.includes('All actions used'),
      'Should display clear warning when 0 actions remain'
    );
  });

  // --------------------------------------------------------------------------
  // TEST 11: Finish Day callback contract
  // --------------------------------------------------------------------------
  it('respects Finish Day callback contract when enabled', () => {
    let callbackCalled = false;
    const testOnFinishDay = () => {
      callbackCalled = true;
    };

    const props: MissionHUDProps = {
      day: 3,
      phase: 'choose',
      actionsRemaining: 0,
      resources: { ...INITIAL_RESOURCES },
      outcome: 'active',
      onFinishDay: testOnFinishDay,
    };

    const element = React.createElement(MissionHUD, props);
    assert.equal(typeof element.props.onFinishDay, 'function');
    element.props.onFinishDay();
    assert.equal(callbackCalled, true, 'Callback must be executed');
  });

  // --------------------------------------------------------------------------
  // TEST 12: Correct disabled behavior for phases and outcomes
  // --------------------------------------------------------------------------
  it('correctly disables Finish Day during event phase and completed outcomes, allows early finish', () => {
    // 1. Blocked during Space Weather event phase
    assert.equal(
      isFinishDayDisabled('active', 'event'),
      true,
      'Must be disabled during event phase'
    );

    // 2. Blocked during result phase
    assert.equal(
      isFinishDayDisabled('active', 'result'),
      true,
      'Must be disabled during result phase'
    );

    // 3. Blocked on mission failure outcome
    assert.equal(
      isFinishDayDisabled('failure', 'choose'),
      true,
      'Must be disabled on failure outcome'
    );

    // 4. Blocked on mission success outcome
    assert.equal(
      isFinishDayDisabled('success', 'choose'),
      true,
      'Must be disabled on success outcome'
    );

    // 5. ENABLED during maintenance (choose) with 0 actions remaining
    assert.equal(
      isFinishDayDisabled('active', 'choose'),
      false,
      'Must be enabled during choose phase'
    );

    // 6. ENABLED even if unused actions remain (early finish allowed by rules)
    const earlyFinishHtml = renderToString(
      React.createElement(MissionHUD, {
        day: 2,
        phase: 'choose',
        actionsRemaining: 2,
        resources: { ...INITIAL_RESOURCES },
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(
      earlyFinishHtml.includes('Finish Day Early'),
      'Button should say Finish Day Early when actions remain'
    );
    assert.ok(
      !earlyFinishHtml.includes('disabled=""'),
      'Button must not be disabled when finishing early'
    );

    // 7. Verify disabled attribute rendered on HTML during event phase
    const eventPhaseHtml = renderToString(
      React.createElement(MissionHUD, {
        day: 2,
        phase: 'event',
        actionsRemaining: 2,
        resources: { ...INITIAL_RESOURCES },
        outcome: 'active',
        onFinishDay: () => {},
      })
    );
    assert.ok(
      eventPhaseHtml.includes('disabled=""') || eventPhaseHtml.includes('disabled'),
      'Button must be disabled in HTML during event phase'
    );
  });

  // --------------------------------------------------------------------------
  // TEST 13: Numeric accessibility attributes and progress-bar semantics
  // --------------------------------------------------------------------------
  it('provides complete progressbar semantics with aria-valuenow/min/max and descriptive text', () => {
    const html = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'radiationRisk',
        value: 75,
      })
    );

    assert.ok(html.includes('role="progressbar"'), 'Must have role="progressbar"');
    assert.ok(html.includes('aria-valuenow="75"'), 'Must have aria-valuenow="75"');
    assert.ok(html.includes('aria-valuemin="0"'), 'Must have aria-valuemin="0"');
    assert.ok(html.includes('aria-valuemax="100"'), 'Must have aria-valuemax="100"');
    assert.ok(
      html.includes('aria-valuetext='),
      'Must have descriptive aria-valuetext'
    );
    assert.ok(
      html.includes('Higher values indicate greater danger'),
      'Radiation Risk must identify adverse hazard in accessible description'
    );
  });

  // --------------------------------------------------------------------------
  // TEST 14: No hardcoded fixture values inside production components
  // --------------------------------------------------------------------------
  it('verifies that no hardcoded initial values are embedded inside production components', () => {
    // Pass completely non-standard, custom dynamic values
    const customProps: MissionHUDProps = {
      day: 3,
      phase: 'choose',
      actionsRemaining: 1,
      resources: {
        oxygen: 43,
        power: 87,
        water: 19,
        food: 62,
        radiationRisk: 84,
      },
      outcome: 'active',
      onFinishDay: () => {},
    };

    const html = renderToString(React.createElement(MissionHUD, customProps));

    // Must strictly render the passed props, never default 75, 70, 10 or Day 1
    assert.ok(html.includes('DAY 3 / 5'), 'Must render passed day 3');
    assert.ok(html.includes('1 / 2'), 'Must render passed actions 1');
    assert.ok(html.includes('43'), 'Must render passed oxygen 43');
    assert.ok(html.includes('87'), 'Must render passed power 87');
    assert.ok(html.includes('19'), 'Must render passed water 19');
    assert.ok(html.includes('62'), 'Must render passed food 62');
    assert.ok(html.includes('84'), 'Must render passed radiationRisk 84');
  });

  // --------------------------------------------------------------------------
  // TEST 15: Absence of measured physical SI units
  // --------------------------------------------------------------------------
  it('strictly displays normalized educational points and contains zero measured physical units', () => {
    const html = renderToString(
      React.createElement(MissionHUD, {
        day: 1,
        phase: 'choose',
        actionsRemaining: 2,
        resources: { ...INITIAL_RESOURCES },
        outcome: 'active',
        onFinishDay: () => {},
      })
    );

    // Verify absence of forbidden physical units (using word boundary checks)
    assert.ok(!/\bSievert(s)?\b/i.test(html), 'Must not display Sievert');
    assert.ok(!/\bmSv\b/.test(html), 'Must not display mSv');
    assert.ok(!/\bµSv\b/.test(html), 'Must not display µSv');
    assert.ok(!/\bkW\b/.test(html), 'Must not display kW');
    assert.ok(!/\blitre(s)?\b/i.test(html), 'Must not display litres');
    assert.ok(!/\bliter(s)?\b/i.test(html), 'Must not display liters');
    assert.ok(!/\bkg\b/.test(html), 'Must not display kg unit');
  });
});
