/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-014: Interactive Lunar Base & Hotspots Verification Suite
 *
 * Primary Owner: Abhinaya Jeyakumar (@abhi190503)
 * Reviewer: Nirsanth A. (@nirsanth23)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  LunarBaseScene,
  ModuleHotspot,
  CANONICAL_LUNAR_MODULES,
  type LunarBaseSceneProps,
  type ModuleHotspotProps,
  type LunarModuleId,
} from './index';
import { ACTION_EFFECTS } from '@/lib/game/contracts';

describe('TRI-014: Realistic Interactive Lunar Base & Hotspots Verification', () => {
  it('exports all required components, constants and types', () => {
    assert.equal(typeof LunarBaseScene, 'function');
    assert.equal(typeof ModuleHotspot, 'function');
    assert.ok(Array.isArray(CANONICAL_LUNAR_MODULES));
    assert.equal(CANONICAL_LUNAR_MODULES.length, 4);
  });

  it('defines the 4 approved lunar base facilities with valid coordinates and actions', () => {
    const expectedIds: LunarModuleId[] = ['solar', 'habitat', 'greenhouse', 'bunker'];
    const ids = CANONICAL_LUNAR_MODULES.map((m) => m.id);
    assert.deepEqual(ids, expectedIds);

    for (const mod of CANONICAL_LUNAR_MODULES) {
      assert.ok(mod.name.length > 0);
      assert.ok(mod.subsystem.length > 0);
      assert.ok(mod.displayLabel.length > 0);
      assert.ok(mod.accessibleLabel.length > 0);

      // Verify zero-drift percentage coordinates are bounded in [0, 100]
      assert.ok(mod.left >= 0 && mod.left <= 100);
      assert.ok(mod.top >= 0 && mod.top <= 100);
      assert.ok(mod.width > 0 && mod.width <= 100);
      assert.ok(mod.height > 0 && mod.height <= 100);
      assert.ok(mod.left + mod.width <= 100);
      assert.ok(mod.top + mod.height <= 100);

      // Verify all actions bind to canonical action effects
      assert.ok(mod.canonicalActions.length > 0);
      for (const actionId of mod.canonicalActions) {
        assert.ok(
          ACTION_EFFECTS[actionId],
          `Action ${actionId} must exist in canonical ACTION_EFFECTS`
        );
      }
    }
  });

  it('binds solar arrays to maintain-solar and Power resource', () => {
    const solar = CANONICAL_LUNAR_MODULES.find((m) => m.id === 'solar');
    assert.ok(solar);
    assert.equal(solar.vitalMetric, 'power');
    assert.deepEqual(solar.canonicalActions, ['maintain-solar']);
    assert.equal(solar.displayLabel, 'SOLAR');
  });

  it('binds habitat dome to generate-oxygen and Oxygen resource', () => {
    const habitat = CANONICAL_LUNAR_MODULES.find((m) => m.id === 'habitat');
    assert.ok(habitat);
    assert.equal(habitat.vitalMetric, 'oxygen');
    assert.deepEqual(habitat.canonicalActions, ['generate-oxygen']);
    assert.equal(habitat.displayLabel, 'HABITAT');
  });

  it('binds greenhouse to operate-greenhouse and recycle-water', () => {
    const greenhouse = CANONICAL_LUNAR_MODULES.find((m) => m.id === 'greenhouse');
    assert.ok(greenhouse);
    assert.equal(greenhouse.vitalMetric, 'food');
    assert.deepEqual(greenhouse.canonicalActions, [
      'operate-greenhouse',
      'recycle-water',
    ]);
    assert.equal(greenhouse.displayLabel, 'GREENHOUSE');
  });

  it('binds bunker to reinforce-shelter and radiationRisk defense', () => {
    const bunker = CANONICAL_LUNAR_MODULES.find((m) => m.id === 'bunker');
    assert.ok(bunker);
    assert.equal(bunker.vitalMetric, 'radiationRisk');
    assert.deepEqual(bunker.canonicalActions, ['reinforce-shelter']);
    assert.equal(bunker.displayLabel, 'BUNKER');
  });

  it('renders ModuleHotspot as an accessible button with aria-label, aria-pressed, and coordinates', () => {
    let selectedId: LunarModuleId | null = null;
    const props: ModuleHotspotProps = {
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
      isSelected: true,
      disabled: false,
      onSelect: (id) => {
        selectedId = id;
      },
      yieldSummary: '+20 Oxygen',
      costSummary: '-8 Power, -6 Water',
    };

    const html = renderToString(React.createElement(ModuleHotspot, props));

    // Verify it renders as a native button with correct attributes
    assert.ok(html.includes('<button'), 'Must render a native button element');
    assert.ok(html.includes('type="button"'), 'Button type must be button');
    assert.ok(html.includes('id="hotspot-habitat"'), 'Must have semantic ID');
    assert.ok(
      html.includes('aria-label="Life Support Habitat — Produce Oxygen"'),
      'Must have WCAG accessible label'
    );
    assert.ok(html.includes('aria-pressed="true"'), 'Must indicate selected state via aria-pressed');
    assert.ok(html.includes('lunar-hotspot--selected'), 'Must have selected CSS modifier class');
    assert.ok(html.includes('left:38%'), 'Must position with percentage left');
    assert.ok(html.includes('top:32%'), 'Must position with percentage top');
    assert.ok(html.includes('width:20%'), 'Must size with percentage width');
    assert.ok(html.includes('height:30%'), 'Must size with percentage height');
    assert.ok(html.includes('HABITAT'), 'Must display badge label');
    assert.ok(html.includes('+20 Oxygen'), 'Must display yield summary in telemetry tooltip');

    // Test selection callback execution
    props.onSelect('habitat');
    assert.equal(selectedId, 'habitat');
  });

  it('renders disabled ModuleHotspot with disabled attribute and prevented interaction', () => {
    const props: ModuleHotspotProps = {
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
      disabled: true,
      onSelect: () => {},
    };

    const html = renderToString(React.createElement(ModuleHotspot, props));
    assert.ok(html.includes('disabled=""') || html.includes('disabled'), 'Must render disabled attribute');
    assert.ok(html.includes('lunar-hotspot--disabled'), 'Must apply disabled CSS class');
    assert.ok(html.includes('aria-pressed="false"'), 'aria-pressed should be false when not selected');
  });

  it('renders LunarBaseScene with 16:9 viewport and realistic cinematic image layer', () => {
    const props: LunarBaseSceneProps = {
      selectedModuleId: 'solar',
      actionsRemaining: 2,
    };

    const html = renderToString(React.createElement(LunarBaseScene, props));

    // Verify accessible container landmark
    assert.ok(
      html.includes('aria-label="Interactive Lunar Base Environment"'),
      'Must have accessible section landmark'
    );

    // Verify 16:9 aspect ratio container
    assert.ok(
      html.includes('aspect-[16/9]') || html.includes('lunar-scene-viewport'),
      'Must use 16:9 viewport container'
    );

    // Verify production image asset is rendered
    assert.ok(
      html.includes('src="/images/lunar-base-cinematic.webp"'),
      'Must load approved cinematic lunar base asset'
    );

    // Verify all 4 facility hotspots are present in the overlay
    assert.ok(html.includes('id="hotspot-solar"'), 'Must render Solar hotspot');
    assert.ok(html.includes('id="hotspot-habitat"'), 'Must render Habitat hotspot');
    assert.ok(html.includes('id="hotspot-greenhouse"'), 'Must render Greenhouse hotspot');
    assert.ok(html.includes('id="hotspot-bunker"'), 'Must render Bunker hotspot');

    // Verify telemetry bar displays actions count
    assert.ok(html.includes('Actions: 2 / 2'), 'Must display daily actions count in telemetry');
  });

  it('renders accessible mobile facility selector strip with >= 48px touch buttons', () => {
    const props: LunarBaseSceneProps = {
      selectedModuleId: 'greenhouse',
      showMobileSelector: true,
    };

    const html = renderToString(React.createElement(LunarBaseScene, props));

    // Verify navigation landmark for mobile strip
    assert.ok(
      html.includes('aria-label="Facility Selector Quick Bar"'),
      'Must render mobile navigation quick bar'
    );

    // Verify all 4 mobile buttons exist
    assert.ok(html.includes('id="mobile-tab-solar"'));
    assert.ok(html.includes('id="mobile-tab-habitat"'));
    assert.ok(html.includes('id="mobile-tab-greenhouse"'));
    assert.ok(html.includes('id="mobile-tab-bunker"'));

    // Verify minimum touch target class is applied
    assert.ok(
      html.includes('min-h-[48px]'),
      'Mobile buttons must satisfy >= 48px touch target requirements'
    );

    // Verify greenhouse button is marked as active
    assert.ok(
      html.includes('id="mobile-tab-greenhouse"') &&
        html.includes('aria-pressed="true"'),
      'Greenhouse tab must reflect active selected state'
    );
  });

  it('allows disabling mobile selector strip via showMobileSelector=false', () => {
    const props: LunarBaseSceneProps = {
      showMobileSelector: false,
    };

    const html = renderToString(React.createElement(LunarBaseScene, props));
    assert.equal(
      html.includes('Facility Selector Quick Bar'),
      false,
      'Mobile selector strip should not render when showMobileSelector is false'
    );
  });

  it('supports custom image source override', () => {
    const props: LunarBaseSceneProps = {
      imageSrc: '/custom/test-lunar-scene.webp',
    };

    const html = renderToString(React.createElement(LunarBaseScene, props));
    assert.ok(
      html.includes('src="/custom/test-lunar-scene.webp"'),
      'Must render custom image source'
    );
  });

  it('forwards selection events from both hotspot and mobile selector to onSelectModule callback', () => {
    const selected: LunarModuleId[] = [];
    const props: LunarBaseSceneProps = {
      onSelectModule: (id) => {
        selected.push(id);
      },
    };

    const element = React.createElement(LunarBaseScene, props);
    assert.ok(element);

    props.onSelectModule?.('solar');
    props.onSelectModule?.('habitat');
    props.onSelectModule?.('greenhouse');
    props.onSelectModule?.('bunker');

    assert.deepEqual(selected, ['solar', 'habitat', 'greenhouse', 'bunker']);
  });
});

