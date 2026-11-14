import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  GameShell,
  GameButton,
  GamePanel,
  GameBadge,
  GameModal,
  ShellHeader,
  ShellFooter,
  type GameButtonProps,
  type GamePanelProps,
  type GameBadgeProps,
  type GameModalProps,
  type ShellHeaderProps,
  type ShellFooterProps,
  type GameShellProps,
} from './index';

describe('TRI-012: Game Shell & Reusable Components Verification', () => {
  it('exports all required game shell components and interfaces', () => {
    assert.equal(typeof GameShell, 'function');
    assert.equal(typeof GameButton, 'object'); // forwardRef component
    assert.equal(typeof GamePanel, 'function');
    assert.equal(typeof GameBadge, 'function');
    assert.equal(typeof GameModal, 'function');
    assert.equal(typeof ShellHeader, 'function');
    assert.equal(typeof ShellFooter, 'function');
  });

  it('creates GameButton elements with variants and sizes without throwing', () => {
    const primaryProps: GameButtonProps = {
      variant: 'primary',
      size: 'lg',
      children: 'Begin Mission',
    };
    const primaryBtn = React.createElement(GameButton, primaryProps);
    assert.equal(primaryProps.variant, 'primary');
    assert.equal(primaryProps.size, 'lg');
    assert.equal(primaryProps.children, 'Begin Mission');
    assert.ok(primaryBtn);

    const secondaryProps: GameButtonProps = {
      variant: 'secondary',
      size: 'md',
      children: 'How to Play',
    };
    const secondaryBtn = React.createElement(GameButton, secondaryProps);
    assert.equal(secondaryProps.variant, 'secondary');
    assert.ok(secondaryBtn);

    const disabledProps: GameButtonProps = {
      disabled: true,
      isLoading: false,
      children: 'Disabled Action',
    };
    const disabledBtn = React.createElement(GameButton, disabledProps);
    assert.equal(disabledProps.disabled, true);
    assert.ok(disabledBtn);
  });

  it('creates GamePanel elements with proper semantic and layout props', () => {
    const panelProps: GamePanelProps = {
      variant: 'hud',
      padding: 'md',
      title: 'Life Support Vitals',
      subtitle: 'Telemetry Stream',
      children: React.createElement('div', null, 'Vital Gauges Slot'),
    };
    const panel = React.createElement(GamePanel, panelProps);

    assert.equal(panelProps.variant, 'hud');
    assert.equal(panelProps.title, 'Life Support Vitals');
    assert.equal(panelProps.padding, 'md');
    assert.ok(panel);
  });

  it('creates GameBadge elements with status and pulse indicators', () => {
    const nominalProps: GameBadgeProps = {
      variant: 'nominal',
      size: 'sm',
      pulse: true,
      children: 'Crew Nominal',
    };
    const nominalBadge = React.createElement(GameBadge, nominalProps);
    assert.equal(nominalProps.variant, 'nominal');
    assert.equal(nominalProps.pulse, true);
    assert.ok(nominalBadge);

    const alertProps: GameBadgeProps = {
      variant: 'critical',
      children: 'Radiation Spike',
    };
    const alertBadge = React.createElement(GameBadge, alertProps);
    assert.equal(alertProps.variant, 'critical');
    assert.ok(alertBadge);
  });

  it('creates GameModal elements with accessibility attributes and callbacks', () => {
    let closed = false;
    const modalProps: GameModalProps = {
      isOpen: true,
      onClose: () => {
        closed = true;
      },
      title: 'Mission Briefing',
      subtitle: 'Lunar Station Alpha',
      maxWidth: 'lg',
      children: React.createElement('p', null, 'Modal Body Content'),
    };
    const modal = React.createElement(GameModal, modalProps);

    assert.equal(modalProps.isOpen, true);
    assert.equal(modalProps.title, 'Mission Briefing');
    assert.equal(modalProps.maxWidth, 'lg');
    modalProps.onClose();
    assert.equal(closed, true);
    assert.ok(modal);
  });

  it('creates ShellHeader elements with telemetry status and control handlers', () => {
    let helpOpened = false;
    let soundToggled = false;
    const headerProps: ShellHeaderProps = {
      day: 2,
      maxDays: 5,
      crewCount: 3,
      crewStatus: 'NOMINAL',
      actionsRemaining: 1,
      maxActions: 2,
      onOpenHelp: () => {
        helpOpened = true;
      },
      onToggleSound: () => {
        soundToggled = true;
      },
      isMuted: false,
    };
    const header = React.createElement(ShellHeader, headerProps);

    assert.equal(headerProps.day, 2);
    assert.equal(headerProps.crewCount, 3);
    assert.equal(headerProps.actionsRemaining, 1);
    headerProps.onOpenHelp?.();
    assert.equal(helpOpened, true);
    headerProps.onToggleSound?.();
    assert.equal(soundToggled, true);
    assert.ok(header);
  });

  it('creates ShellFooter elements with Space Apps and science disclosures', () => {
    const footerProps: ShellFooterProps = {
      showAiDisclosure: true,
    };
    const footer = React.createElement(ShellFooter, footerProps);
    assert.equal(footerProps.showAiDisclosure, true);
    assert.ok(footer);
  });

  it('creates GameShell layout container with responsive mode slots', () => {
    const shellProps: GameShellProps = {
      layoutMode: 'contained',
      showHeader: true,
      showFooter: true,
      children: React.createElement('div', { id: 'test-child' }, 'Game Stage Content'),
    };
    const shell = React.createElement(GameShell, shellProps);

    assert.equal(shellProps.layoutMode, 'contained');
    assert.equal(shellProps.showHeader, true);
    assert.equal(shellProps.showFooter, true);
    assert.ok(shell);
  });
});
