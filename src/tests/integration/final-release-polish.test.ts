/**
 * TriOrbit Lunar Survival Simulator — Final Release Polish Test Suite
 *
 * Verifies:
 * 1. Audio System: Sound OFF by default, no autoplay, safe SSR handling, mute/unmute toggling.
 * 2. Branding & Favicon: icon.svg and favicon.ico files exist and layout metadata includes proper icon links.
 * 3. NASA Telemetry Labeling: Accurately displays "NASA Historical Data Loaded" / "NASA Verified Fallback Loaded".
 * 4. Event Confirmation Messages: Appropriate canonical feedback for Days 2, 3, and 4 dilemmas.
 * 5. Educational Wording: Survival condition in MissionTutorial and natural grammar in science facts.
 * 6. Mobile & Accessibility Polish: Badges whitespace-nowrap, touch targets >= 44px, and modal scroll containment.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

// Components & Modules
import { MissionScreen } from '@/components/game/MissionScreen';
import { LandingScreen } from '@/components/game/LandingScreen';
import { MissionTutorial } from '@/components/game/MissionTutorial';
import { ShellHeader } from '@/components/game/shell/ShellHeader';
import { GameBadge } from '@/components/game/shell/GameBadge';
import { EventModal } from '@/components/events/EventModal';
import { soundscape } from '@/lib/audio/soundscape';
import { SCIENCE_FACTS } from '@/data/science-facts';
import { DEFAULT_SCENARIOS } from '@/lib/game/constants';
import { metadata } from '@/app/layout';

describe('TRI-RELEASE: Audio System Verification', () => {
  it('guarantees audio is OFF (muted) by default to prevent unexpected autoplay', () => {
    assert.equal(soundscape.isMuted, true, 'Audio must default to muted/off');
  });

  it('safely handles all synthesized cues in headless/SSR environments without throwing', () => {
    assert.doesNotThrow(() => {
      soundscape.playFacilitySelect();
      soundscape.playMaintenanceSuccess();
      soundscape.playEmergencyWarning();
      soundscape.playVictory();
      soundscape.playFailure();
    });
  });

  it('allows explicit user toggling of sound on and off', () => {
    const startMuted = soundscape.isMuted;
    const toggled = soundscape.toggleSound();
    assert.equal(toggled, !startMuted);
    assert.equal(soundscape.isMuted, !startMuted);

    // Toggle back to preserve default state
    const restored = soundscape.toggleSound();
    assert.equal(restored, startMuted);
  });
});

describe('TRI-RELEASE: Branding and Favicon Verification', () => {
  it('confirms original TriOrbit icon.svg and favicon.ico exist on disk', () => {
    const root = process.cwd();
    const iconSvgPath = path.join(root, 'src', 'app', 'icon.svg');
    const faviconAppPath = path.join(root, 'src', 'app', 'favicon.ico');
    const faviconPublicPath = path.join(root, 'public', 'favicon.ico');

    assert.ok(fs.existsSync(iconSvgPath), 'src/app/icon.svg must exist');
    assert.ok(fs.existsSync(faviconAppPath), 'src/app/favicon.ico must exist');
    assert.ok(fs.existsSync(faviconPublicPath), 'public/favicon.ico must exist');

    const svgContent = fs.readFileSync(iconSvgPath, 'utf8');
    assert.ok(svgContent.includes('triorbit-cyan'), 'icon.svg must feature TriOrbit cyan gradient');
    assert.ok(svgContent.includes('#60E5F4'), 'icon.svg must use TriOrbit electric cyan #60E5F4');
  });

  it('verifies layout metadata includes icon links and TriOrbit title', () => {
    assert.equal(metadata.title, 'TriOrbit — Lunar Survival Simulator');
    assert.ok(metadata.icons, 'Layout metadata must define icons');
  });
});

describe('TRI-RELEASE: NASA Telemetry Labeling & Fallback Truthfulness', () => {
  it('does NOT display misleading "Live Telemetry Connected" in initial render', () => {
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(
      !html.includes('Live Telemetry Connected'),
      'Must not display misleading Live Telemetry Connected'
    );
  });

  it('renders verified historical/fallback label in SSR state', () => {
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(
      html.includes('NASA Verified Fallback Loaded') || html.includes('NASA Historical Data Loaded'),
      'Must display accurate NASA archive status'
    );
  });
});

describe('TRI-RELEASE: Event Confirmation Paths for Days 2, 3, and 4', () => {
  it('provides distinct, scientifically truthful labels across all 3 scenarios', () => {
    const solarScenario = DEFAULT_SCENARIOS.find((s) => s.id === 'solar-activity');
    const powerScenario = DEFAULT_SCENARIOS.find((s) => s.id === 'power-outage');
    const waterScenario = DEFAULT_SCENARIOS.find((s) => s.id === 'greenhouse-water');

    assert.ok(solarScenario);
    assert.ok(powerScenario);
    assert.ok(waterScenario);

    // Day 2 authentic NASA observation
    const solarHtml = renderToString(
      React.createElement(EventModal, {
        open: true,
        scenario: solarScenario,
        onSelectChoice: () => {},
      })
    );
    assert.ok(solarHtml.includes('NASA Observation'));
    assert.ok(solarHtml.includes('Historical Archive'));

    // Day 3 fictional electrical emergency
    const powerHtml = renderToString(
      React.createElement(EventModal, {
        open: true,
        scenario: powerScenario,
        onSelectChoice: () => {},
      })
    );
    assert.ok(powerHtml.includes('Educational Simulation'));
    assert.ok(powerHtml.includes('Fictional lunar outpost dilemma'));

    // Day 4 fictional hydroponics emergency
    const waterHtml = renderToString(
      React.createElement(EventModal, {
        open: true,
        scenario: waterScenario,
        onSelectChoice: () => {},
      })
    );
    assert.ok(waterHtml.includes('Educational Simulation'));
    assert.ok(waterHtml.includes('Fictional lunar outpost dilemma'));
  });
});

describe('TRI-RELEASE: Educational Wording and Scientific Honesty', () => {
  it('verifies tutorial survival condition requires completing all 5 days with vitals > 0 and risk < 100', () => {
    const html = renderToString(
      React.createElement(MissionTutorial, {
        isOpen: true,
        onClose: () => {},
        defaultTab: 'vitals',
      })
    );

    assert.ok(
      html.includes(
        'complete all five mission days while keeping Oxygen, Power, Water and Food above zero and Radiation Risk below 100'
      ),
      'Must state exact survival condition instead of vague reach-day-5'
    );
  });

  it('verifies science fact SEP warning has natural phrasing without redundant "alert alerts you"', () => {
    const sepFact = SCIENCE_FACTS.find((f) => f.id === 'fact-sep-events');
    assert.ok(sepFact);
    assert.ok(
      !sepFact.gameplayConnection.includes('alert alerts you'),
      'Must not contain grammatically awkward "alert alerts you"'
    );
    assert.ok(
      sepFact.gameplayConnection.includes('an authentic SEP warning prompts you to shelter your crew'),
      'Must use natural warning phrasing'
    );
  });

  it('verifies science facts clearly label in-game values as educational units (0–100)', () => {
    const moonFact = SCIENCE_FACTS.find((f) => f.id === 'fact-telemetry-vs-moon');
    assert.ok(moonFact);
    assert.ok(moonFact.caution?.includes('simplified educational game points'));
  });
});

describe('TRI-RELEASE: Mobile Presentation & Accessibility Polish', () => {
  it('ensures GameBadge enforces whitespace-nowrap and shrink-0 to prevent awkward wrapping', () => {
    const html = renderToString(
      React.createElement(GameBadge, { variant: 'cyan', size: 'sm' }, 'Test Badge')
    );
    assert.ok(html.includes('whitespace-nowrap'), 'GameBadge must include whitespace-nowrap');
    assert.ok(html.includes('shrink-0'), 'GameBadge must include shrink-0');
  });

  it('ensures ShellHeader maintains min 44px touch targets on all interactive controls', () => {
    const html = renderToString(
      React.createElement(ShellHeader, {
        day: 1,
        actionsRemaining: 2,
        onOpenScience: () => {},
        onToggleSound: () => {},
        onOpenHelp: () => {},
      })
    );
    assert.ok(html.includes('min-h-[44px]'));
    assert.ok(html.includes('aria-label="Open NASA Science Drawer"'));
    assert.ok(html.includes('aria-label="Unmute Audio"') || html.includes('aria-label="Mute Audio"'));
    assert.ok(html.includes('aria-label="How to play mission guide"'));
  });

  it('ensures EventModal has max-height and internal scroll containment on mobile viewports', () => {
    const scenario = DEFAULT_SCENARIOS[0];
    const html = renderToString(
      React.createElement(EventModal, {
        open: true,
        scenario,
        onSelectChoice: () => {},
      })
    );
    assert.ok(html.includes('max-h-[calc(100dvh-1.5rem)]'), 'Must constrain height on small viewports');
    assert.ok(html.includes('overflow-y-auto'), 'Must support internal vertical scrolling');
  });

  it('ensures LandingScreen hero card has high contrast backdrop and readable typography', () => {
    const html = renderToString(
      React.createElement(LandingScreen, {
        onBeginMission: () => {},
      })
    );
    assert.ok(html.includes('bg-[#080F20]/75'), 'Must render high-contrast dark backdrop');
    assert.ok(html.includes('backdrop-blur-md'), 'Must render backdrop blur for legibility');
    assert.ok(html.includes('TRIORBIT'), 'Must render main title');
  });
});
