'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameShell } from './shell/GameShell';
import { GameButton } from './shell/GameButton';
import { GamePanel } from './shell/GamePanel';
import { GameBadge } from './shell/GameBadge';
import { MissionTutorial } from './MissionTutorial';
import { TOTAL_MISSION_DAYS, MAX_ACTIONS_PER_DAY } from '@/lib/game/contracts';
import { soundscape } from '@/lib/audio/soundscape';

export interface LandingScreenProps {
  /**
   * Typed callback invoked when the commander starts the mission.
   * Supplied by the integrating parent or mission orchestrator.
   */
  onBeginMission: () => void;

  /**
   * Optional external callback when 'How to Play' is requested.
   * If omitted, LandingScreen manages the MissionTutorial modal state internally.
   */
  onOpenTutorial?: () => void;

  /**
   * Initial visibility of the tutorial modal (defaults to false).
   */
  defaultTutorialOpen?: boolean;

  /**
   * Optional custom background image path or URL.
   * If omitted or unavailable, a cinematic dark navy lunar atmosphere fallback is rendered.
   */
  backgroundImageUrl?: string;

  /**
   * Sound toggle handler forwarded to shell header.
   */
  onToggleSound?: () => void;
  isMuted?: boolean;

  /**
   * Optional additional class name for root container.
   */
  className?: string;
}

export function LandingScreen({
  onBeginMission,
  onOpenTutorial,
  defaultTutorialOpen = false,
  backgroundImageUrl,
  onToggleSound,
  isMuted,
  className = '',
}: LandingScreenProps) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(defaultTutorialOpen);
  const [imageFailed, setImageFailed] = useState(false);
  const [internalMuted, setInternalMuted] = useState(true);

  // Restore audio preference post-mount for SSR hydration consistency
  useEffect(() => {
    const restored = soundscape.restorePreference();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalMuted(restored);
  }, []);

  const activeMuted = isMuted !== undefined ? isMuted : internalMuted;
  const handleToggleSound = useCallback(() => {
    if (onToggleSound) {
      onToggleSound();
    } else {
      const next = soundscape.toggleSound();
      setInternalMuted(next);
    }
  }, [onToggleSound]);

  const handleOpenTutorial = useCallback(() => {
    setIsTutorialOpen(true);
    if (onOpenTutorial) {
      onOpenTutorial();
    }
  }, [onOpenTutorial]);

  const handleCloseTutorial = useCallback(() => {
    setIsTutorialOpen(false);
  }, []);

  const handleBeginMission = useCallback(() => {
    setIsTutorialOpen(false);
    onBeginMission();
  }, [onBeginMission]);

  // Global keyboard shortcuts: Enter starts mission (unless focused on interactive controls), H or ? opens tutorial
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if inside an open modal
      if (isTutorialOpen) return;

      const target = event.target as HTMLElement | null;

      // Do NOT intercept Enter on buttons, links, inputs, or any interactive element to preserve native activation
      const isInteractive = Boolean(
        target && (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('role') === 'button' ||
          target.getAttribute('role') === 'tab' ||
          target.getAttribute('role') === 'link' ||
          target.isContentEditable
        )
      );

      if (event.key === 'Enter') {
        if (!isInteractive) {
          event.preventDefault();
          handleBeginMission();
        }
      } else if (event.key === 'h' || event.key === 'H' || event.key === '?') {
        const isTextInput = Boolean(
          target && (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          )
        );
        if (!isTextInput) {
          event.preventDefault();
          handleOpenTutorial();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTutorialOpen, handleBeginMission, handleOpenTutorial]);

  const resolvedImageSrc = backgroundImageUrl || '/images/lunar-base-cinematic.webp';

  return (
    <GameShell
      layoutMode="full"
      headerProps={{
        onOpenHelp: handleOpenTutorial,
        onToggleSound: handleToggleSound,
        isMuted: activeMuted,
      }}
      footerProps={{
        showAiDisclosure: true,
      }}
      className={className}
      overlaySlot={
        <MissionTutorial
          isOpen={isTutorialOpen}
          onClose={handleCloseTutorial}
          onBeginMission={handleBeginMission}
        />
      }
    >
      {/* Hero Container with Atmospheric Lunar Environment */}
      <section
        aria-label="Mission Command Landing Stage"
        className="relative w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 overflow-hidden min-h-[calc(100vh-140px)]"
      >
        {/* Background Visual Layer: Real Artwork with Transparent Atmospheric Overlay & Fallback */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
          data-artwork-fallback={imageFailed ? 'temporary-pre-tri-014' : undefined}
        >
          {/* Base Space Sky Canvas (rendered behind image or as fallback backdrop) */}
          <div className="absolute inset-0 bg-space-mesh z-0" />

          {/* Realistic Lunar Outpost Image Layer (rendered above base sky so it remains fully visible) */}
          {!imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedImageSrc}
              alt=""
              onError={() => setImageFailed(true)}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 z-[1]"
            />
          )}

          {/* Transparent Atmospheric Vignette Overlay (sits above image or fallback) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080F20] via-transparent to-[#080F20]/60 z-[2] pointer-events-none" />

          {/* Distant Earthrise Crescent Glow */}
          <div
            className="absolute top-8 right-8 sm:top-16 sm:right-24 w-32 h-32 sm:w-48 sm:h-48 rounded-full opacity-70 pointer-events-none z-[3]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(96, 229, 244, 0.45) 0%, rgba(92, 156, 255, 0.25) 45%, transparent 75%)',
              boxShadow: '0 0 40px 10px rgba(96, 229, 244, 0.2)',
            }}
          />

          {/* Stylized Lunar Surface Horizon (visible in CSS fallback when image is unavailable) */}
          {imageFailed && (
            <div
              className="absolute -bottom-24 -left-12 -right-12 h-64 sm:h-80 rounded-[50%] opacity-90 z-[2]"
              style={{
                background: 'radial-gradient(ellipse 65% 50% at 50% 100%, #162640 0%, #101D35 60%, #080F20 100%)',
                borderTop: '1px solid rgba(96, 229, 244, 0.15)',
                boxShadow: '0 -20px 60px rgba(8, 15, 32, 0.9)',
              }}
            />
          )}

          {/* Ambient Habitat Cyan & Amber Light Beacons */}
          <div className="absolute bottom-16 left-1/4 w-72 h-36 bg-[#60E5F4]/10 rounded-full blur-3xl pointer-events-none z-[3]" />
          <div className="absolute bottom-20 right-1/4 w-72 h-36 bg-[#FFCA72]/10 rounded-full blur-3xl pointer-events-none z-[3]" />
        </div>

        {/* Foreground Content Card & Call To Action */}
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Mission Challenge Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#101D35]/90 text-[#60E5F4] border border-[#38BDF8]/40 shadow-[0_0_16px_rgba(96,229,244,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#60E5F4] animate-beacon" aria-hidden="true" />
            <span>NASA Space Apps Challenge 2026 • Colombo</span>
          </div>

          {/* Main Title & Subtitle Card with enhanced contrast backdrop */}
          <div className="space-y-3 max-w-3xl rounded-2xl bg-[#080F20]/75 backdrop-blur-md p-5 sm:p-7 border border-[#1F3352]/70 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#A8B8D0]">
                Junior Astronaut Mission Trainer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F4F7FC] font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              TRIORBIT <span className="text-[#60E5F4]">LUNAR SURVIVAL</span> SIMULATOR
            </h1>

            {/* Figma Make Hero Headline */}
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFCA72] tracking-normal font-sans pt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Your Moon Mission Starts Here.
            </p>

            <p className="text-sm sm:text-base md:text-lg text-[#E2E8F0] font-medium max-w-2xl mx-auto leading-relaxed pt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Command an advanced lunar outpost. Balance critical life support. Survive {TOTAL_MISSION_DAYS} simulated days of space weather hazards.
            </p>
          </div>

          {/* Mission Parameters Card (4 Key Pillars) */}
          <GamePanel
            as="section"
            variant="hud"
            padding="md"
            aria-label="Mission Parameters Overview"
            className="w-full max-w-3xl border-[#38BDF8]/30 backdrop-blur-md"
          >
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#60E5F4] mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60E5F4]" aria-hidden="true" />
              <span>Mission Parameters • 5-Day Surface Expedition</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
              {/* Parameter 1: Days */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#080F20]/70 border border-[#1F3352] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base" aria-hidden="true">🗓️</span>
                  <span className="text-[10px] font-mono text-[#60E5F4] uppercase">Loop</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F4F7FC] font-mono">
                  {TOTAL_MISSION_DAYS} Days
                </div>
                <p className="text-[11px] text-[#A8B8D0] leading-tight">
                  Day 1 to 5 progression
                </p>
              </div>

              {/* Parameter 2: Crew */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#080F20]/70 border border-[#1F3352] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base" aria-hidden="true">👨‍🚀</span>
                  <span className="text-[10px] font-mono text-[#59DDA5] uppercase">Nominal</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F4F7FC] font-mono">
                  3 Astronauts
                </div>
                <p className="text-[11px] text-[#A8B8D0] leading-tight">
                  Keep your crew healthy
                </p>
              </div>

              {/* Parameter 3: Modules */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#080F20]/70 border border-[#1F3352] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base" aria-hidden="true">🏛️</span>
                  <span className="text-[10px] font-mono text-[#FFCA72] uppercase">Facilities</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F4F7FC] font-mono">
                  4 Base Modules
                </div>
                <p className="text-[11px] text-[#A8B8D0] leading-tight">
                  Habitat, Solar, Green, Bunker
                </p>
              </div>

              {/* Parameter 4: Actions */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#080F20]/70 border border-[#1F3352] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base" aria-hidden="true">⚡</span>
                  <span className="text-[10px] font-mono text-[#60E5F4] uppercase">Budget</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F4F7FC] font-mono">
                  {MAX_ACTIONS_PER_DAY} Actions / Day
                </div>
                <p className="text-[11px] text-[#A8B8D0] leading-tight">
                  Daily maintenance choices
                </p>
              </div>
            </div>
          </GamePanel>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto pt-2">
            {/* Primary Action: Begin Mission */}
            <GameButton
              variant="primary"
              size="lg"
              onClick={handleBeginMission}
              className="px-8 sm:px-10 text-base font-bold shadow-[0_0_24px_rgba(96,229,244,0.4)] hover:shadow-[0_0_32px_rgba(96,229,244,0.6)] min-w-[200px]"
              iconRight={
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#080F20]/25 font-semibold">
                  Enter ↵
                </span>
              }
            >
              Begin Mission
            </GameButton>

            {/* Secondary Action: How to Play */}
            <GameButton
              variant="secondary"
              size="lg"
              onClick={handleOpenTutorial}
              className="px-6 sm:px-8 text-base border-[#38BDF8]/40 hover:border-[#60E5F4]"
              iconLeft={
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#101D35] text-[#60E5F4] border border-[#1F3352]">
                  ?
                </span>
              }
            >
              How to Play / Guide
            </GameButton>
          </div>

          {/* Educational Disclaimers & Provenance */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#8FA2BA]">
            <GameBadge variant="muted" size="sm">
              Educational Simulator (Ages 7–12)
            </GameBadge>
            <span>•</span>
            <GameBadge variant="muted" size="sm">
              Authentic NASA DONKI Solar Data
            </GameBadge>
            <span>•</span>
            <GameBadge variant="muted" size="sm">
              Normalized 0–100 Vitals
            </GameBadge>
          </div>
        </div>
      </section>
    </GameShell>
  );
}
