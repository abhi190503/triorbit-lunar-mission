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
import { hydrateRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

async function waitFor(predicate: () => boolean, timeoutMs = 2000, intervalMs = 20): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for predicate after ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

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

  it('restores unmuted preference post-mount without SSR hydration mismatch and keeps audio locked until interaction', async () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
    });
    dom.window.localStorage.setItem('triorbit_sound_muted', 'false');

    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { HTMLElement: unknown }).HTMLElement = dom.window.HTMLElement;

    try {
      soundscape.cleanup();

      // 1. SSR render: always defaults to muted state
      const ssrTree = React.createElement(MissionScreen);
      const ssrHtml = renderToString(ssrTree);
      assert.ok(ssrHtml.includes('aria-label="Unmute Audio"'), 'SSR must render Unmute Audio button');

      // 2. Client hydrateRoot: must have 0 recoverable hydration errors
      const container = dom.window.document.getElementById('root')!;
      container.innerHTML = ssrHtml;

      const recoverableErrors: string[] = [];
      const root = hydrateRoot(container, ssrTree, {
        onRecoverableError(err: unknown) {
          recoverableErrors.push((err as Error).message);
        },
      });

      // Wait for effects to commit and preference to restore post-mount
      await waitFor(() => Boolean(container.querySelector('button[aria-label="Mute Audio"]')));

      assert.equal(recoverableErrors.length, 0, 'Must have zero hydration mismatch errors');

      // 3. Post-mount restoration must reflect unmuted preference in UI
      const button = container.querySelector('button[aria-label="Mute Audio"]');
      assert.ok(button, 'UI should update to Mute Audio after post-mount preference restoration');
      assert.equal(soundscape.isMuted, false);

      // 4. BUT audio playback MUST remain locked until fresh user interaction
      assert.equal(soundscape.isUnlocked, false, 'Playback must remain locked until user interaction');

      // 5. Fresh user interaction unlocks playback
      soundscape.unlockPlayback();
      assert.equal(soundscape.isUnlocked, true);

      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      soundscape.cleanup();
      delete (globalThis as unknown as { window?: unknown }).window;
      delete (globalThis as unknown as { document?: unknown }).document;
      delete (globalThis as unknown as { HTMLElement?: unknown }).HTMLElement;
    }
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
  it('does NOT display misleading "Live Telemetry Connected" or claim fallback data before request completes', () => {
    const html = renderToString(React.createElement(MissionScreen));
    assert.ok(
      !html.includes('Live Telemetry Connected'),
      'Must not display misleading Live Telemetry Connected'
    );
    assert.ok(
      !html.includes('NASA Verified Fallback Loaded'),
      'Must not claim fallback data was loaded before API request completes'
    );
    assert.ok(
      html.includes('NASA Archive Loading...'),
      'Must display accurate loading state during SSR / initial render'
    );
  });

  it('accurately transitions from loading to live historical data when API confirms live observation', async () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
    });

    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { HTMLElement: unknown }).HTMLElement = dom.window.HTMLElement;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          events: [],
          provenance: 'live',
          retrievedAt: new Date().toISOString(),
          caution: 'Test caution',
        }),
      } as unknown as Response;
    }) as typeof fetch;

    try {
      const container = dom.window.document.getElementById('root')!;
      const tree = React.createElement(MissionScreen);
      container.innerHTML = renderToString(tree);

      const root = hydrateRoot(container, tree);
      await waitFor(() => container.innerHTML.includes('NASA Historical Data Loaded'));

      assert.ok(
        container.innerHTML.includes('NASA Historical Data Loaded'),
        'Must display NASA Historical Data Loaded when API returns live provenance'
      );
      assert.ok(!container.innerHTML.includes('NASA Archive Loading...'));

      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      globalThis.fetch = originalFetch;
      delete (globalThis as unknown as { window?: unknown }).window;
      delete (globalThis as unknown as { document?: unknown }).document;
      delete (globalThis as unknown as { HTMLElement?: unknown }).HTMLElement;
    }
  });

  it('accurately transitions from loading to verified fallback when API confirms fallback archive payload', async () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
    });

    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { HTMLElement: unknown }).HTMLElement = dom.window.HTMLElement;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          events: [],
          provenance: 'verified-fallback',
          retrievedAt: new Date().toISOString(),
          caution: 'Test caution',
        }),
      } as unknown as Response;
    }) as typeof fetch;

    try {
      const container = dom.window.document.getElementById('root')!;
      const tree = React.createElement(MissionScreen);
      container.innerHTML = renderToString(tree);

      const root = hydrateRoot(container, tree);
      await waitFor(() => container.innerHTML.includes('NASA Verified Fallback Loaded'));

      assert.ok(
        container.innerHTML.includes('NASA Verified Fallback Loaded'),
        'Must display NASA Verified Fallback Loaded when confirmed by API payload'
      );
      assert.ok(!container.innerHTML.includes('NASA Archive Loading...'));

      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      globalThis.fetch = originalFetch;
      delete (globalThis as unknown as { window?: unknown }).window;
      delete (globalThis as unknown as { document?: unknown }).document;
      delete (globalThis as unknown as { HTMLElement?: unknown }).HTMLElement;
    }
  });

  it('accurately transitions to unavailable when client request fails without confirmation', async () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
    });

    (globalThis as unknown as { window: unknown }).window = dom.window;
    (globalThis as unknown as { document: unknown }).document = dom.window.document;
    (globalThis as unknown as { HTMLElement: unknown }).HTMLElement = dom.window.HTMLElement;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('Network fault / offline');
    }) as typeof fetch;

    try {
      const container = dom.window.document.getElementById('root')!;
      const tree = React.createElement(MissionScreen);
      container.innerHTML = renderToString(tree);

      const root = hydrateRoot(container, tree);
      await waitFor(() => container.innerHTML.includes('NASA Archive Unavailable'));

      assert.ok(
        container.innerHTML.includes('NASA Archive Unavailable'),
        'Must display NASA Archive Unavailable when network request fails'
      );
      assert.ok(
        !container.innerHTML.includes('NASA Verified Fallback Loaded'),
        'Must NEVER claim verified fallback data was loaded when request fails unconfirmed'
      );

      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      globalThis.fetch = originalFetch;
      delete (globalThis as unknown as { window?: unknown }).window;
      delete (globalThis as unknown as { document?: unknown }).document;
      delete (globalThis as unknown as { HTMLElement?: unknown }).HTMLElement;
    }
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
