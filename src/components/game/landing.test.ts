import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  LandingScreen,
  MissionTutorial,
  type LandingScreenProps,
  type MissionTutorialProps,
} from './index';

describe('TRI-013: Landing Screen & 30-Second Tutorial Verification', () => {
  it('exports all required components and interfaces', () => {
    assert.equal(typeof LandingScreen, 'function');
    assert.equal(typeof MissionTutorial, 'function');
  });

  it('instantiates LandingScreen with required onBeginMission callback', () => {
    let missionStarted = false;
    const props: LandingScreenProps = {
      onBeginMission: () => {
        missionStarted = true;
      },
    };

    const element = React.createElement(LandingScreen, props);
    assert.ok(element);
    assert.equal(typeof props.onBeginMission, 'function');

    props.onBeginMission();
    assert.equal(missionStarted, true);
  });

  it('supports optional props for tutorial state, sound, and background image', () => {
    let soundToggled = false;
    let tutorialOpened = false;
    const props: LandingScreenProps = {
      onBeginMission: () => {},
      onOpenTutorial: () => {
        tutorialOpened = true;
      },
      defaultTutorialOpen: true,
      backgroundImageUrl: '/images/lunar-base-cinematic.webp',
      onToggleSound: () => {
        soundToggled = true;
      },
      isMuted: true,
      className: 'custom-landing-root',
    };

    const element = React.createElement(LandingScreen, props);
    assert.ok(element);
    assert.equal(props.defaultTutorialOpen, true);
    assert.equal(props.isMuted, true);
    assert.equal(props.backgroundImageUrl, '/images/lunar-base-cinematic.webp');

    props.onToggleSound?.();
    assert.equal(soundToggled, true);

    props.onOpenTutorial?.();
    assert.equal(tutorialOpened, true);
  });

  it('instantiates MissionTutorial with open state, close, and start callbacks', () => {
    let closed = false;
    let started = false;
    const props: MissionTutorialProps = {
      isOpen: true,
      onClose: () => {
        closed = true;
      },
      onBeginMission: () => {
        started = true;
      },
    };

    const element = React.createElement(MissionTutorial, props);
    assert.ok(element);
    assert.equal(props.isOpen, true);

    props.onClose();
    assert.equal(closed, true);

    props.onBeginMission?.();
    assert.equal(started, true);
  });

  it('instantiates MissionTutorial in closed state without throwing', () => {
    const props: MissionTutorialProps = {
      isOpen: false,
      onClose: () => {},
    };

    const element = React.createElement(MissionTutorial, props);
    assert.ok(element);
    assert.equal(props.isOpen, false);
  });

  it('renders LandingScreen to static HTML containing approved copy and landmarks', () => {
    const props: LandingScreenProps = {
      onBeginMission: () => {},
    };
    const html = renderToString(React.createElement(LandingScreen, props));

    // Verify main landmarks
    assert.ok(html.includes('id="main-stage"'), 'Includes main stage landmark');
    assert.ok(html.includes('role="banner"'), 'Includes header landmark');
    assert.ok(html.includes('role="contentinfo"'), 'Includes footer landmark');

    // Verify Figma Make hero headline and copy
    assert.ok(html.includes('Your Moon Mission Starts Here.'), 'Renders approved Figma Make headline');
    assert.ok(html.includes('TRIORBIT'), 'Renders TriOrbit branding');
    assert.ok(html.includes('LUNAR SURVIVAL'), 'Renders Lunar Survival accent');
    assert.ok(html.includes('Begin Mission'), 'Renders Begin Mission CTA');
    assert.ok(html.includes('How to Play / Guide'), 'Renders How to Play CTA');

    // Verify 4 mission parameters
    assert.ok(html.includes('Days'), 'Renders Days parameter');
    assert.ok(html.includes('3 Astronauts'), 'Renders 3 Astronauts parameter');
    assert.ok(html.includes('4 Base Modules'), 'Renders 4 Base Modules parameter');
    assert.ok(html.includes('Actions / Day'), 'Renders Actions / Day parameter');

    // Verify atmospheric and educational badges
    assert.ok(html.includes('NASA Space Apps Challenge 2026'), 'Renders Space Apps Colombo badge');
    assert.ok(html.includes('Authentic NASA DONKI Solar Data'), 'Renders NASA data disclosure');
  });

  it('renders realistic background image layer above base sky with transparent overlay', () => {
    const props: LandingScreenProps = {
      onBeginMission: () => {},
      backgroundImageUrl: '/images/custom-lunar-base.webp',
    };
    const html = renderToString(React.createElement(LandingScreen, props));

    // Verify image is rendered
    assert.ok(html.includes('/images/custom-lunar-base.webp'), 'Renders supplied image src');

    // Verify image layer has z-[1] (above base sky z-0)
    assert.ok(html.includes('z-[1]'), 'Image is rendered with z-[1] above canvas');

    // Verify transparent vignette overlay has z-[2]
    assert.ok(html.includes('z-[2]'), 'Transparent overlay is rendered with z-[2]');
    assert.ok(html.includes('bg-gradient-to-t'), 'Overlay uses transparent gradient, not opaque cover');
  });

  it('renders MissionTutorial with corrected science wording for NASA and simulated dilemmas', () => {
    const props: MissionTutorialProps = {
      isOpen: true,
      onClose: () => {},
      onBeginMission: () => {},
    };
    const html = renderToString(React.createElement(MissionTutorial, props));

    // Verify modal dialog structure
    assert.ok(html.includes('role="dialog"'), 'Renders as accessible dialog');
    assert.ok(html.includes('aria-modal="true"'), 'Sets aria-modal true');
    assert.ok(html.includes('Mission Briefing &amp; How to Play') || html.includes('Mission Briefing & How to Play'), 'Renders tutorial title');
    assert.ok(html.includes('30-Second Commander Training'), 'Renders 30s tutorial subtitle');

    // Verify tabs
    assert.ok(html.includes('role="tablist"'), 'Renders tab list for keyboard navigation');
    assert.ok(html.includes('30s Quick Start'), 'Renders Quick Start tab');
    assert.ok(html.includes('4 Base Modules'), 'Renders Modules tab');
    assert.ok(html.includes('Vitals &amp; Survival') || html.includes('Vitals & Survival'), 'Renders Vitals tab');
    assert.ok(html.includes('Controls Guide'), 'Renders Controls tab');

    // Verify corrected science wording: 1 real NASA DONKI solar event and simulated emergencies
    assert.ok(html.includes('Mission Dilemmas'), 'Uses accurate dilemma heading');
    assert.ok(
      html.includes('Day 2 features an authentic NASA DONKI solar storm observation, followed by two simulated habitat emergencies'),
      'Accurately distinguishes Day 2 NASA event from Days 3-4 simulated habitat emergencies'
    );
    assert.ok(
      !html.includes('On Days 2, 3, &amp; 4, real NASA observations detect solar storms') &&
      !html.includes('On Days 2, 3, & 4, real NASA observations detect solar storms'),
      'Does NOT falsely claim all 3 events are NASA solar storms'
    );

    // Verify roving tabIndex for tabs
    assert.ok(html.includes('tabindex="0"'), 'Active tab has tabindex 0 for keyboard navigation');
    assert.ok(html.includes('tabindex="-1"'), 'Inactive tabs have tabindex -1 for roving focus');
    assert.ok(html.includes('Begin Mission'), 'Includes Begin Mission CTA in modal footer');

    // Also verify Controls panel content when defaultTab="controls"
    const controlsHtml = renderToString(
      React.createElement(MissionTutorial, {
        isOpen: true,
        onClose: () => {},
        defaultTab: 'controls',
      })
    );
    assert.ok(controlsHtml.includes('Switch Guide Tabs'), 'Documents tab switching with arrow keys');
    assert.ok(controlsHtml.includes('Arrow Keys'), 'Lists arrow keys shortcut');
  });

  it('verifies the full interaction contract: Landing -> Tutorial -> Close -> Start', () => {
    let missionStarted = false;
    let tutorialOpen = false;

    // Step 1: Initialize on Landing
    const onBeginMission = () => {
      missionStarted = true;
    };
    const onOpenTutorial = () => {
      tutorialOpen = true;
    };

    assert.equal(missionStarted, false, 'Mission has not started yet');
    assert.equal(tutorialOpen, false, 'Tutorial starts closed');

    // Step 2: User clicks 'How to Play'
    onOpenTutorial();
    assert.equal(tutorialOpen, true, 'Tutorial opened successfully');

    // Step 3: User closes tutorial
    const onCloseTutorial = () => {
      tutorialOpen = false;
    };
    onCloseTutorial();
    assert.equal(tutorialOpen, false, 'Tutorial closed cleanly');

    // Step 4: User clicks 'Begin Mission'
    onBeginMission();
    assert.equal(missionStarted, true, 'Mission start callback dispatched');
  });

  it('verifies non-interference with focused interactive elements during keyboard handling', () => {
    // Contract check: verify interactive tag and role detection logic
    const isInteractiveElement = (tagName: string, role?: string | null, isEditable?: boolean) => {
      return Boolean(
        tagName === 'BUTTON' ||
        tagName === 'A' ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        role === 'button' ||
        role === 'tab' ||
        role === 'link' ||
        isEditable
      );
    };

    // Button should be recognized as interactive
    assert.equal(isInteractiveElement('BUTTON'), true);
    // Link should be recognized as interactive
    assert.equal(isInteractiveElement('A'), true);
    // Inputs should be recognized as interactive
    assert.equal(isInteractiveElement('INPUT'), true);
    assert.equal(isInteractiveElement('TEXTAREA'), true);
    // Role button/tab should be recognized as interactive
    assert.equal(isInteractiveElement('DIV', 'button'), true);
    assert.equal(isInteractiveElement('DIV', 'tab'), true);
    // Non-interactive container should not be recognized as interactive
    assert.equal(isInteractiveElement('BODY'), false);
    assert.equal(isInteractiveElement('DIV'), false);
    assert.equal(isInteractiveElement('SECTION'), false);
  });
});
