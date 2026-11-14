/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-016: ActionControls Component Verification Suite
 *
 * Primary Owner: Vibhushan Ganeshan (@Vibhushan-2003)
 * Reviewer: Abhinaya Jeyakumar (@abhi190503)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ActionControls } from './ActionControls';
import { createInitialMission } from '@/lib/game/engine';

describe('TRI-016: ActionControls Component Verification', () => {
  it('exports ActionControls as a valid React component', () => {
    assert.equal(typeof ActionControls, 'function');
  });

  it('renders guidance state with facility quick-select buttons when no module is selected', () => {
    const state = createInitialMission();
    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: null,
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Base Maintenance Operations'));
    assert.ok(html.includes('Select a habitat facility'));
    assert.ok(html.includes('Solar Power Station'));
    assert.ok(html.includes('Life Support Habitat'));
    assert.ok(html.includes('Hydroponics Greenhouse'));
    assert.ok(html.includes('Shielded Lunar Bunker'));
    assert.ok(html.includes('2 / 2 Actions Left'));
  });

  it('renders solar module with maintain-solar action and correct yield/cost badges', () => {
    const state = createInitialMission();
    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'solar',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Solar Power Station'));
    assert.ok(html.includes('Maintain Solar Array'));
    assert.ok(html.includes('+20 Power'));
    assert.ok(html.includes('0 Cost'));
    assert.ok(html.includes('Execute Action'));
  });

  it('renders habitat module with generate-oxygen action and cost/benefit', () => {
    const state = createInitialMission();
    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'habitat',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Life Support Habitat'));
    assert.ok(html.includes('Generate Oxygen'));
    assert.ok(html.includes('+20 Oxygen'));
    assert.ok(html.includes('-8 Power, -6 Water'));
    assert.ok(html.includes('Execute Action'));
  });

  it('renders greenhouse module with operate-greenhouse and recycle-water actions', () => {
    const state = createInitialMission();
    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'greenhouse',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Hydroponics Greenhouse'));
    assert.ok(html.includes('Operate Greenhouse'));
    assert.ok(html.includes('+17 Food'));
    assert.ok(html.includes('-6 Power, -9 Water'));
    assert.ok(html.includes('Recycle Water'));
    assert.ok(html.includes('+18 Water'));
    assert.ok(html.includes('-7 Power'));
  });

  it('renders bunker module with reinforce-shelter action', () => {
    const state = createInitialMission();
    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'bunker',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Shielded Lunar Bunker'));
    assert.ok(html.includes('Reinforce Shelter'));
    assert.ok(html.includes('-18 Radiation Risk'));
    assert.ok(html.includes('-7 Power'));
  });

  it('renders disabled explanation alert when resources are insufficient', () => {
    let state = createInitialMission();
    state = {
      ...state,
      resources: {
        ...state.resources,
        power: 3, // Oxygen requires 8 Power
      },
    };

    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'habitat',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('role="alert"'));
    assert.ok(html.includes('Insufficient Power'));
    assert.ok(html.includes('requires 8, have 3'));
    assert.ok(html.includes('Unavailable'));
  });

  it('renders disabled explanation when daily action allowance is depleted', () => {
    let state = createInitialMission();
    state = {
      ...state,
      actionsRemaining: 0,
    };

    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'solar',
        state,
        actionsRemaining: 0,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Daily action limit reached'));
    assert.ok(html.includes('0 / 2 Actions Left'));
    assert.ok(html.includes('Unavailable'));
  });

  it('renders disabled explanation when space weather dilemma is pending', () => {
    let state = createInitialMission();
    state = {
      ...state,
      phase: 'event',
      currentScenarioId: 'solar-activity',
    };

    const html = renderToString(
      React.createElement(ActionControls, {
        selectedModuleId: 'solar',
        state,
        actionsRemaining: 2,
        onExecuteAction: () => {},
      })
    );

    assert.ok(html.includes('Space weather dilemma pending'));
    assert.ok(html.includes('Unavailable'));
  });
});
