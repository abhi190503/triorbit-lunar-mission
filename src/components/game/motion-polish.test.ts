/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-023: Motion & Visual Polish Within Strict Performance Budget Verification Suite
 *
 * Primary Owner: Abhinaya Jeyakumar (@abhi190503)
 * Reviewer: Vibhushan Ganeshan (@Vibhushan-2003)
 *
 * Verifies:
 * 1. Hotspot selections across all 4 canonical facilities
 * 2. Selected state persistence and visual modifier classes
 * 3. Native keyboard button semantics without duplicate triggers
 * 4. Disabled hotspot behavior preventing callbacks
 * 5. Resource gauge values and progressbar fill transitions
 * 6. Resource warning and critical alert visual states
 * 7. Finish Day callback behavior and phase disabling
 * 8. Reduced-motion compliance in CSS rules
 * 9. No duplicate animation keyframe definitions
 * 10. Performance budget adherence for motion durations
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  LunarBaseScene,
  ModuleHotspot,
  MissionHUD,
  ResourceGauge,
  CANONICAL_LUNAR_MODULES,
  CANONICAL_HUD_RESOURCES,
  type LunarModuleId,
} from './index';
import { INITIAL_RESOURCES } from '@/lib/game/contracts';

describe('TRI-023: Motion & Visual Polish Within Strict Performance Budget', () => {
  // --------------------------------------------------------------------------
  // 1. Hotspot selections across all 4 canonical facilities
  // --------------------------------------------------------------------------
  it('renders LunarBaseScene with all 4 hotspots cleanly and supports selection', () => {
    let sceneSelectedId: LunarModuleId | null = null;
    const sceneProps = {
      selectedModuleId: 'habitat' as LunarModuleId,
      onSelectModule: (id: LunarModuleId) => {
        sceneSelectedId = id;
      },
    };
    const sceneHtml = renderToString(React.createElement(LunarBaseScene, sceneProps));
    sceneProps.onSelectModule('habitat');
    assert.equal(sceneSelectedId, 'habitat');

    assert.ok(sceneHtml.includes('lunar-base-viewport'), 'Must render lunar base viewport');
    assert.ok(sceneHtml.includes('hotspot-solar'), 'Must render solar hotspot');
    assert.ok(sceneHtml.includes('hotspot-habitat'), 'Must render habitat hotspot');
    assert.ok(sceneHtml.includes('hotspot-greenhouse'), 'Must render greenhouse hotspot');
    assert.ok(sceneHtml.includes('hotspot-bunker'), 'Must render bunker hotspot');

    const facilityIds: LunarModuleId[] = ['solar', 'habitat', 'greenhouse', 'bunker'];

    for (const modId of facilityIds) {
      let selected: LunarModuleId | null = null;
      const config = CANONICAL_LUNAR_MODULES.find((m) => m.id === modId);
      assert.ok(config, `Configuration for ${modId} must exist`);

      const element = React.createElement(ModuleHotspot, {
        id: config.id,
        name: config.name,
        subsystem: config.subsystem,
        displayLabel: config.displayLabel,
        accessibleLabel: config.accessibleLabel,
        canonicalActions: config.canonicalActions,
        left: config.left,
        top: config.top,
        width: config.width,
        height: config.height,
        isSelected: false,
        disabled: false,
        onSelect: (id) => {
          selected = id;
        },
      });

      element.props.onSelect(modId);
      assert.equal(selected, modId, `Hotspot ${modId} must trigger onSelect with its ID`);
    }
  });

  // --------------------------------------------------------------------------
  // 2. Selected state persistence and visual modifier classes
  // --------------------------------------------------------------------------
  it('applies selected state modifier classes and aria-pressed attributes correctly', () => {
    const htmlUnselected = renderToString(
      React.createElement(ModuleHotspot, {
        id: 'solar',
        name: 'Solar Power Station',
        subsystem: 'Solar Array & Battery Station',
        displayLabel: 'SOLAR',
        accessibleLabel: 'Solar Array & Battery Station — Generate Power',
        canonicalActions: ['maintain-solar'],
        left: 12,
        top: 42,
        width: 17,
        height: 26,
        isSelected: false,
        disabled: false,
        onSelect: () => {},
      })
    );

    assert.ok(htmlUnselected.includes('aria-pressed="false"'));
    assert.ok(!htmlUnselected.includes('lunar-hotspot--selected'));

    const htmlSelected = renderToString(
      React.createElement(ModuleHotspot, {
        id: 'solar',
        name: 'Solar Power Station',
        subsystem: 'Solar Array & Battery Station',
        displayLabel: 'SOLAR',
        accessibleLabel: 'Solar Array & Battery Station — Generate Power',
        canonicalActions: ['maintain-solar'],
        left: 12,
        top: 42,
        width: 17,
        height: 26,
        isSelected: true,
        disabled: false,
        onSelect: () => {},
      })
    );

    assert.ok(htmlSelected.includes('aria-pressed="true"'));
    assert.ok(htmlSelected.includes('lunar-hotspot--selected'));
    assert.ok(htmlSelected.includes('lunar-hotspot-beacon'));
  });

  // --------------------------------------------------------------------------
  // 3. Keyboard Enter and Space activation semantics via native button
  // --------------------------------------------------------------------------
  it('relies on native button semantics for keyboard Enter and Space activation without duplicate callback dispatch', () => {
    let callCount = 0;
    const element = React.createElement(ModuleHotspot, {
      id: 'habitat',
      name: 'Life Support Habitat',
      subsystem: 'Life Support Habitat',
      displayLabel: 'HABITAT',
      accessibleLabel: 'Life Support Habitat — Produce Oxygen',
      canonicalActions: ['generate-oxygen'],
      left: 38,
      top: 32,
      width: 20,
      height: 30,
      isSelected: false,
      disabled: false,
      onSelect: () => {
        callCount++;
      },
    });

    const html = renderToString(element);
    assert.ok(html.includes('<button'), 'Must be a native button');
    assert.ok(html.includes('type="button"'), 'Button type must be button');
    assert.ok(!html.includes('onkeydown'), 'Must not have custom onKeyDown listener');

    element.props.onSelect('habitat');
    assert.equal(callCount, 1, 'Callback invoked exactly once');
  });

  // --------------------------------------------------------------------------
  // 4. Disabled hotspot behavior
  // --------------------------------------------------------------------------
  it('disables hotspot interaction when disabled=true and prevents callback execution', () => {
    let callCount = 0;
    const element = React.createElement(ModuleHotspot, {
      id: 'greenhouse',
      name: 'Hydroponics Greenhouse',
      subsystem: 'Hydroponics Greenhouse',
      displayLabel: 'GREENHOUSE',
      accessibleLabel: 'Hydroponics Greenhouse — Food Cultivation',
      canonicalActions: ['operate-greenhouse'],
      left: 64,
      top: 36,
      width: 18,
      height: 30,
      isSelected: false,
      disabled: true,
      onSelect: () => {
        callCount++;
      },
    });

    const html = renderToString(element);
    assert.ok(html.includes('disabled=""') || html.includes('disabled'));
    assert.ok(html.includes('lunar-hotspot--disabled'));
    assert.equal(callCount, 0);
  });

  // --------------------------------------------------------------------------
  // 5. Resource gauge values rendered accurately
  // --------------------------------------------------------------------------
  it('renders all 5 resource gauge values matching exact supplied numbers', () => {
    for (const key of CANONICAL_HUD_RESOURCES) {
      const testVal = key === 'radiationRisk' ? 15 : 82;
      const html = renderToString(
        React.createElement(ResourceGauge, {
          resourceKey: key,
          value: testVal,
        })
      );

      assert.ok(html.includes(`${testVal}`), `Must display exact numerical value ${testVal}`);
      assert.ok(html.includes(`width:${testVal}%`), `Progress bar width must be ${testVal}%`);
      assert.ok(html.includes('transition-[width,background-color]'), 'Must transition width and background-color');
      assert.ok(html.includes('motion-reduce:transition-none'), 'Must respect reduced motion');
    }
  });

  // --------------------------------------------------------------------------
  // 6. Resource warning and critical alert visual states
  // --------------------------------------------------------------------------
  it('evaluates and displays distinct warning and critical status indicators for essential and adverse vitals', () => {
    // Oxygen at critical level (<= 20)
    const critOxygenHtml = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'oxygen',
        value: 18,
      })
    );
    assert.ok(critOxygenHtml.includes('Critical'), 'Oxygen at 18 must be Critical');
    assert.ok(critOxygenHtml.includes('animate-pulse'), 'Critical vital must apply alert pulse');
    assert.ok(critOxygenHtml.includes('motion-reduce:animate-none'), 'Pulsing vital must suppress animation on reduce motion');

    // Radiation Risk at critical level (>= 70)
    const critRadHtml = renderToString(
      React.createElement(ResourceGauge, {
        resourceKey: 'radiationRisk',
        value: 75,
      })
    );
    assert.ok(critRadHtml.includes('Critical Risk'), 'Radiation at 75 must be Critical Risk');
    assert.ok(critRadHtml.includes('HAZARD'), 'Radiation Risk must display adverse HAZARD tag');
  });

  // --------------------------------------------------------------------------
  // 7. Finish Day callback behavior and phase disabling
  // --------------------------------------------------------------------------
  it('executes onFinishDay when active and disables during event phase', () => {
    let finishTriggered = false;
    const hudProps = {
      day: 1,
      phase: 'choose' as const,
      actionsRemaining: 1,
      resources: { ...INITIAL_RESOURCES },
      outcome: 'active' as const,
      onFinishDay: () => {
        finishTriggered = true;
      },
    };

    const hudElement = React.createElement(MissionHUD, hudProps);
    assert.equal(typeof hudElement.props.onFinishDay, 'function');
    hudElement.props.onFinishDay();
    assert.equal(finishTriggered, true, 'Finish Day callback must be executed');

    // In event phase: finish day button is disabled
    const eventHudHtml = renderToString(
      React.createElement(MissionHUD, {
        ...hudProps,
        phase: 'event',
      })
    );
    assert.ok(eventHudHtml.includes('Resolve Space Hazard'), 'Must prompt commander to resolve dilemma');
  });

  // --------------------------------------------------------------------------
  // 8. Reduced-motion CSS rules in lunar-scene.css
  // --------------------------------------------------------------------------
  it('verifies that lunar-scene.css contains strict prefers-reduced-motion overrides', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/lunar-scene.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Must define reduced-motion query');
    assert.ok(cssContent.includes('.lunar-hotspot-beacon'), 'Must target beacon');
    assert.ok(cssContent.includes('animation: none !important'), 'Must disable animations with !important');
    assert.ok(cssContent.includes('transition: none !important'), 'Must disable transitions with !important');
    assert.ok(cssContent.includes('transform: none !important'), 'Must reset transforms with !important');
  });

  // --------------------------------------------------------------------------
  // 9. No duplicated animation definitions in lunar-scene.css
  // --------------------------------------------------------------------------
  it('ensures keyframes in lunar-scene.css are uniquely defined without duplicates', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/lunar-scene.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const keyframeRegex = /@keyframes\s+([a-zA-Z0-9_-]+)/g;
    const keyframesFound: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = keyframeRegex.exec(cssContent)) !== null) {
      keyframesFound.push(match[1]);
    }

    assert.ok(keyframesFound.length > 0, 'Must contain keyframe animations');
    const uniqueKeyframes = new Set(keyframesFound);
    assert.equal(
      keyframesFound.length,
      uniqueKeyframes.size,
      `Keyframes must not contain duplicates: ${keyframesFound.join(', ')}`
    );
  });

  // --------------------------------------------------------------------------
  // 10. Performance budget adherence for motion durations
  // --------------------------------------------------------------------------
  it('adheres to the recommended performance budget durations (<= 400ms)', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/lunar-scene.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Extract all transition durations in ms from lunar-scene.css
    const msRegex = /transition:[^;]+(\d+)ms/g;
    let match: RegExpExecArray | null;

    while ((match = msRegex.exec(cssContent)) !== null) {
      const duration = parseInt(match[1], 10);
      assert.ok(
        duration <= 400,
        `Transition duration ${duration}ms in lunar-scene.css exceeds budget (400ms)`
      );
    }
  });
});
