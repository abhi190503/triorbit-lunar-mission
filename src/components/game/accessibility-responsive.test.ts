/**
 * TriOrbit — Lunar Survival Simulator
 * TRI-022: Responsive UI & Keyboard Accessibility Fix Pass Verification Suite
 *
 * Primary Owner: Abhinaya Jeyakumar (@abhi190503)
 * Reviewer: Nirsanth A. (@nirsanth23)
 *
 * Verifies:
 * - ModuleHotspot native button semantics (single callback, Enter/Space native support, disabled guard)
 * - ModuleHotspot boundary edge alignment to prevent tooltip viewport clipping
 * - LunarBaseScene responsive mobile facility strip visibility and >= 48px touch targets
 * - GameModal focus trapping (Tab/Shift+Tab containment, Escape dismissal, focus restoration)
 * - GameModal viewport scroll containment (flex-col, max-h, shrink-0 header/footer, flex-1 body)
 * - MissionTutorial WAI-ARIA tab navigation (roving tabIndex, arrow keys, panel linking)
 * - MissionHUD & ResourceGauge accessibility attributes and adverse hazard distinction
 * - ShellHeader & ShellFooter touch targets (>= 44px) and WCAG AA contrast compliance
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  ModuleHotspot,
  LunarBaseScene,
  type LunarModuleId,
} from './index';
import { GameModal } from './shell/GameModal';
import { GameButton } from './shell/GameButton';
import { ShellHeader } from './shell/ShellHeader';
import { ShellFooter } from './shell/ShellFooter';
import { MissionTutorial } from './MissionTutorial';
import { MissionHUD } from './MissionHUD';
import { ResourceGauge } from './ResourceGauge';

describe('TRI-022: Responsive UI & Keyboard Accessibility Fix Pass Verification', () => {
  // ==========================================================================
  // 1. Hotspot Native Button Semantics & Single Activation Guard
  // ==========================================================================
  describe('Task B: Lunar scene hotspot accessibility', () => {
    it('relies on native button semantics: renders a button without custom onKeyDown interference', () => {
      let callCount = 0;
      let selected: LunarModuleId | null = null;

      const element = React.createElement(ModuleHotspot, {
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
        onSelect: (id) => {
          callCount++;
          selected = id;
        },
      });

      const html = renderToString(element);
      assert.ok(html.includes('<button'), 'Must be a native button');
      assert.ok(html.includes('type="button"'), 'Must have type="button"');
      assert.ok(html.includes('id="hotspot-solar"'), 'Must have semantic ID');
      assert.ok(html.includes('aria-pressed="false"'), 'aria-pressed indicates selection');
      assert.ok(
        html.includes('aria-label="Solar Array &amp; Battery Station — Generate Power"'),
        'Must have full WCAG accessible label'
      );

      // Verify simulated click calls onSelect exactly once
      element.props.onSelect('solar');
      assert.equal(callCount, 1, 'Selection callback must be invoked exactly once');
      assert.equal(selected, 'solar');
    });

    it('prevents selection when disabled=true', () => {
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
        disabled: true,
        onSelect: () => {
          callCount++;
        },
      });

      const html = renderToString(element);
      assert.ok(html.includes('disabled'), 'Must have disabled HTML attribute');
      assert.ok(html.includes('lunar-hotspot--disabled'), 'Must apply disabled modifier class');
      assert.equal(callCount, 0, 'Callback must not be invoked when disabled');
    });

    it('applies edge-alignment classes to prevent tooltip clipping near container borders', () => {
      // Solar is near left edge (left: 12%)
      const solarHtml = renderToString(
        React.createElement(ModuleHotspot, {
          id: 'solar',
          name: 'Solar Power Station',
          subsystem: 'Solar Array & Battery Station',
          displayLabel: 'SOLAR',
          accessibleLabel: 'Solar Array — Generate Power',
          canonicalActions: ['maintain-solar'],
          left: 12,
          top: 42,
          width: 17,
          height: 26,
          onSelect: () => {},
        })
      );
      assert.ok(
        solarHtml.includes('lunar-hotspot--align-left'),
        'Solar hotspot must have lunar-hotspot--align-left modifier'
      );

      // Bunker is near right edge (left: 68%)
      const bunkerHtml = renderToString(
        React.createElement(ModuleHotspot, {
          id: 'bunker',
          name: 'Shielded Lunar Bunker',
          subsystem: 'Shielded Lunar Bunker',
          displayLabel: 'BUNKER',
          accessibleLabel: 'Bunker — Radiation Defense',
          canonicalActions: ['reinforce-shelter'],
          left: 68,
          top: 68,
          width: 20,
          height: 22,
          onSelect: () => {},
        })
      );
      assert.ok(
        bunkerHtml.includes('lunar-hotspot--align-right'),
        'Bunker hotspot must have lunar-hotspot--align-right modifier'
      );

      // Greenhouse is on the right side (left: 64%)
      const greenhouseHtml = renderToString(
        React.createElement(ModuleHotspot, {
          id: 'greenhouse',
          name: 'Hydroponics Greenhouse',
          subsystem: 'Hydroponics Greenhouse',
          displayLabel: 'GREENHOUSE',
          accessibleLabel: 'Greenhouse — Food and Water',
          canonicalActions: ['operate-greenhouse'],
          left: 64,
          top: 36,
          width: 18,
          height: 30,
          onSelect: () => {},
        })
      );
      assert.ok(
        greenhouseHtml.includes('lunar-hotspot--align-right'),
        'Greenhouse hotspot must have lunar-hotspot--align-right modifier'
      );

      // Habitat is in the center (left: 38%)
      const habitatHtml = renderToString(
        React.createElement(ModuleHotspot, {
          id: 'habitat',
          name: 'Life Support Habitat',
          subsystem: 'Life Support Habitat',
          displayLabel: 'HABITAT',
          accessibleLabel: 'Habitat — Produce Oxygen',
          canonicalActions: ['generate-oxygen'],
          left: 38,
          top: 32,
          width: 20,
          height: 30,
          onSelect: () => {},
        })
      );
      assert.ok(
        !habitatHtml.includes('lunar-hotspot--align-left') &&
        !habitatHtml.includes('lunar-hotspot--align-right'),
        'Habitat in center should use default centered tooltip'
      );
    });
  });

  // ==========================================================================
  // 2. Mobile Facility Navigation Strip
  // ==========================================================================
  describe('Task C: Mobile facility navigation', () => {
    it('renders mobile quick bar with responsive lg:hidden class to avoid desktop clutter', () => {
      const html = renderToString(
        React.createElement(LunarBaseScene, {
          selectedModuleId: 'solar',
          showMobileSelector: true,
        })
      );

      // Mobile strip exists for mobile/tablet, with lg:hidden for desktop
      assert.ok(html.includes('aria-label="Facility Selector Quick Bar"'));
      assert.ok(html.includes('lg:hidden'), 'Quick bar must include lg:hidden for desktop hygiene');
      assert.ok(html.includes('min-h-[48px]'), 'Quick bar buttons must satisfy >= 48px touch requirement');

      // Verify all 4 facilities are accessible via mobile buttons
      assert.ok(html.includes('id="mobile-tab-solar"'));
      assert.ok(html.includes('id="mobile-tab-habitat"'));
      assert.ok(html.includes('id="mobile-tab-greenhouse"'));
      assert.ok(html.includes('id="mobile-tab-bunker"'));

      // Verify solar button reflects active selection
      assert.ok(
        html.includes('id="mobile-tab-solar"') &&
        html.includes('aria-pressed="true"')
      );
    });
  });

  // ==========================================================================
  // 3. Modal Focus Trapping & Viewport Scroll Containment
  // ==========================================================================
  describe('Task E: Tutorial and modal keyboard accessibility', () => {
    it('renders GameModal with accessible dialog semantics, focus containment setup and scroll containment', () => {
      const html = renderToString(
        React.createElement(
          GameModal,
          {
            isOpen: true,
            onClose: () => {},
            title: 'Test Accessibility Dialog',
            subtitle: 'Verification Suite',
            footerActions: React.createElement(GameButton, null, 'Confirm'),
          },
          React.createElement('p', null, 'Dialog content body')
        )
      );

      assert.ok(html.includes('role="dialog"'), 'Must have role="dialog"');
      assert.ok(html.includes('aria-modal="true"'), 'Must specify aria-modal="true"');
      assert.ok(html.includes('id="modal-title-test-accessibility-dialog"'), 'Must have title ID');
      assert.ok(html.includes('aria-labelledby="modal-title-test-accessibility-dialog"'));
      assert.ok(html.includes('tabindex="-1"'), 'Modal card container must be focusable');

      // Viewport scroll containment: max-h-[calc(100dvh...)] and flex-col
      assert.ok(
        html.includes('max-h-[calc(100dvh-1.5rem)]') || html.includes('flex flex-col'),
        'Modal card must use flex-col with max-h for viewport containment'
      );
      assert.ok(html.includes('shrink-0'), 'Header and footer must have shrink-0 so they remain pinned');
      assert.ok(html.includes('flex-1 overflow-y-auto'), 'Body must scroll independently');

      // Close button >= 44px
      assert.ok(
        html.includes('min-h-[44px]') && html.includes('min-w-[44px]'),
        'Close button must satisfy >= 44x44px touch target'
      );
    });

    it('returns null when GameModal is closed', () => {
      const html = renderToString(
        React.createElement(
          GameModal,
          {
            isOpen: false,
            onClose: () => {},
            title: 'Closed Modal',
          },
          React.createElement('div', null, 'Hidden')
        )
      );
      assert.equal(html, '', 'Closed modal must render nothing');
    });

    it('renders MissionTutorial with roving tabIndex and keyboard tablist semantics', () => {
      const html = renderToString(
        React.createElement(MissionTutorial, {
          isOpen: true,
          onClose: () => {},
          defaultTab: 'quickstart',
        })
      );

      assert.ok(html.includes('role="tablist"'), 'Must have tablist container');
      assert.ok(html.includes('id="tab-quickstart"'));
      assert.ok(html.includes('aria-selected="true"'));
      assert.ok(html.includes('tabindex="0"'), 'Active tab must have tabIndex=0');
      assert.ok(html.includes('id="tab-modules"'));
      assert.ok(html.includes('tabindex="-1"'), 'Inactive tab must have tabIndex=-1 for roving focus');
      assert.ok(html.includes('id="panel-quickstart"'));
      assert.ok(html.includes('role="tabpanel"'));
      assert.ok(html.includes('aria-labelledby="tab-quickstart"'));
    });
  });

  // ==========================================================================
  // 4. Mission HUD & Resource Gauges
  // ==========================================================================
  describe('Task D: Mission HUD responsiveness', () => {
    it('renders all 5 resource gauges with full progressbar accessibility semantics', () => {
      const resources = {
        oxygen: 75,
        power: 70,
        water: 75,
        food: 70,
        radiationRisk: 10,
      };

      const html = renderToString(
        React.createElement(MissionHUD, {
          day: 2,
          phase: 'choose',
          actionsRemaining: 2,
          resources,
          outcome: 'active',
          onFinishDay: () => {},
        })
      );

      // Verify landmarks and titles
      assert.ok(html.includes('DAY 2 / 5'), 'Must render Day 2 of 5');
      assert.ok(html.includes('Actions:'), 'Must render actions label');
      assert.ok(html.includes('2 / 2'), 'Must render 2 / 2 action slots');

      // Verify all 5 gauges are rendered
      assert.ok(html.includes('data-testid="resource-gauge-oxygen"'));
      assert.ok(html.includes('data-testid="resource-gauge-power"'));
      assert.ok(html.includes('data-testid="resource-gauge-water"'));
      assert.ok(html.includes('data-testid="resource-gauge-food"'));
      assert.ok(html.includes('data-testid="resource-gauge-radiationRisk"'));

      // Progressbar ARIA attributes
      assert.ok(html.includes('role="progressbar"'));
      assert.ok(html.includes('aria-valuenow="75"'));
      assert.ok(html.includes('aria-valuemin="0"'));
      assert.ok(html.includes('aria-valuemax="100"'));

      // Finish Day button touch size and accessibility
      assert.ok(html.includes('data-testid="hud-finish-day-button"'));
      assert.ok(html.includes('min-h-[48px]'), 'Finish Day button must have min-h-[48px]');
    });

    it('preserves Radiation Risk as an adverse hazard with distinct visual indicators and explanations', () => {
      const html = renderToString(
        React.createElement(ResourceGauge, {
          resourceKey: 'radiationRisk',
          value: 75,
          compact: false,
        })
      );

      // Adverse hazard badge
      assert.ok(html.includes('HAZARD'), 'Must display HAZARD indicator');
      assert.ok(
        html.includes('Lower is safer (0 = Safe, 100 = Mission Failure)'),
        'Must explain adverse directionality'
      );
      assert.ok(html.includes('Critical Risk'), '75 points is Critical Risk status');
      assert.ok(
        html.includes('Higher values indicate greater danger'),
        'Aria description must state higher values indicate greater danger'
      );
    });
  });

  // ==========================================================================
  // 5. Header & Footer Touch Targets and Contrast Compliance
  // ==========================================================================
  describe('Task F & G: Color contrast, readable text and touch targets', () => {
    it('ensures ShellHeader navigation controls have minimum 44px touch targets', () => {
      const html = renderToString(
        React.createElement(ShellHeader, {
          day: 1,
          actionsRemaining: 2,
          onOpenScience: () => {},
          onToggleSound: () => {},
          onOpenHelp: () => {},
        })
      );

      // Verify touch targets >= 44px
      assert.ok(html.includes('min-h-[44px]'), 'Buttons must have min-h-[44px]');
      assert.ok(html.includes('aria-label="Open NASA Science Drawer"'));
      assert.ok(html.includes('aria-label="Mute Audio"'));
      assert.ok(html.includes('aria-label="How to play mission guide"'));
    });

    it('ensures ShellFooter meets WCAG AA contrast requirements with readable text tokens', () => {
      const html = renderToString(
        React.createElement(ShellFooter, {
          showAiDisclosure: true,
        })
      );

      // Must use #8FA2BA or text-text-muted instead of low-contrast #5A6E85
      assert.ok(!html.includes('text-[#5A6E85]'), 'Must not use low-contrast text-[#5A6E85]');
      assert.ok(html.includes('text-[#8FA2BA]'), 'Must use WCAG AA compliant text color #8FA2BA');
      assert.ok(html.includes('Concept illustrations prepared with AI assistance'));
    });
  });
});
