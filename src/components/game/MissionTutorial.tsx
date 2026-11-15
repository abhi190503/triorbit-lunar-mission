'use client';

import React, { useState, useRef } from 'react';
import { GameModal } from './shell/GameModal';
import { GameButton } from './shell/GameButton';
import { GameBadge } from './shell/GameBadge';
import { DAILY_DRAIN, TOTAL_MISSION_DAYS, MAX_ACTIONS_PER_DAY } from '@/lib/game/contracts';

export type TutorialTab = 'quickstart' | 'modules' | 'vitals' | 'controls';

const TAB_ORDER: TutorialTab[] = ['quickstart', 'modules', 'vitals', 'controls'];

export interface MissionTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onBeginMission?: () => void;
  defaultTab?: TutorialTab;
  className?: string;
}

export function MissionTutorial({
  isOpen,
  onClose,
  onBeginMission,
  defaultTab = 'quickstart',
}: MissionTutorialProps) {
  const [activeTab, setActiveTab] = useState<TutorialTab>(defaultTab);
  const tabRefs = useRef<Record<TutorialTab, HTMLButtonElement | null>>({
    quickstart: null,
    modules: null,
    vitals: null,
    controls: null,
  });

  const handleStartMission = () => {
    onClose();
    if (onBeginMission) {
      onBeginMission();
    }
  };

  // WAI-ARIA accessible keyboard navigation across tabs (Arrow Left/Right/Up/Down, Home, End)
  const handleTabKeyDown = (event: React.KeyboardEvent, currentTab: TutorialTab) => {
    const currentIndex = TAB_ORDER.indexOf(currentTab);
    let nextIndex = -1;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = TAB_ORDER.length - 1;
    }

    if (nextIndex >= 0) {
      const nextTab = TAB_ORDER[nextIndex];
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  return (
    <GameModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mission Briefing & How to Play"
      subtitle="30-Second Commander Training • Ages 7–12"
      maxWidth="lg"
      icon={
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      }
      footerActions={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 text-xs text-[#A8B8D0] font-mono">
            <span>NASA Space Apps 2026</span>
            <span>•</span>
            <span>TriOrbit Simulator</span>
          </div>
          <div className="flex items-center gap-2">
            <GameButton
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close Guide
            </GameButton>
            {onBeginMission && (
              <GameButton
                variant="primary"
                size="sm"
                onClick={handleStartMission}
                className="w-full sm:w-auto"
                iconRight={
                  <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-[#080F20]/20 font-normal">
                    Enter ↵
                  </span>
                }
              >
                Begin Mission
              </GameButton>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Navigation Tabs (WAI-ARIA with Arrow Key Navigation) */}
        <div
          role="tablist"
          aria-label="Tutorial Sections"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#080F20]/80 border border-[#1F3352]"
        >
          <button
            type="button"
            role="tab"
            id="tab-quickstart"
            ref={(el) => { tabRefs.current.quickstart = el; }}
            aria-selected={activeTab === 'quickstart'}
            aria-controls="panel-quickstart"
            tabIndex={activeTab === 'quickstart' ? 0 : -1}
            onClick={() => setActiveTab('quickstart')}
            onKeyDown={(e) => handleTabKeyDown(e, 'quickstart')}
            className={`
              flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all
              focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[40px]
              ${activeTab === 'quickstart'
                ? 'bg-[#162640] text-[#60E5F4] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(96,229,244,0.15)]'
                : 'text-[#A8B8D0] hover:text-[#F4F7FC] hover:bg-[#162640]/50'
              }
            `}
          >
            ⚡ 30s Quick Start
          </button>

          <button
            type="button"
            role="tab"
            id="tab-modules"
            ref={(el) => { tabRefs.current.modules = el; }}
            aria-selected={activeTab === 'modules'}
            aria-controls="panel-modules"
            tabIndex={activeTab === 'modules' ? 0 : -1}
            onClick={() => setActiveTab('modules')}
            onKeyDown={(e) => handleTabKeyDown(e, 'modules')}
            className={`
              flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all
              focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[40px]
              ${activeTab === 'modules'
                ? 'bg-[#162640] text-[#60E5F4] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(96,229,244,0.15)]'
                : 'text-[#A8B8D0] hover:text-[#F4F7FC] hover:bg-[#162640]/50'
              }
            `}
          >
            🏛️ 4 Base Modules
          </button>

          <button
            type="button"
            role="tab"
            id="tab-vitals"
            ref={(el) => { tabRefs.current.vitals = el; }}
            aria-selected={activeTab === 'vitals'}
            aria-controls="panel-vitals"
            tabIndex={activeTab === 'vitals' ? 0 : -1}
            onClick={() => setActiveTab('vitals')}
            onKeyDown={(e) => handleTabKeyDown(e, 'vitals')}
            className={`
              flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all
              focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[40px]
              ${activeTab === 'vitals'
                ? 'bg-[#162640] text-[#60E5F4] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(96,229,244,0.15)]'
                : 'text-[#A8B8D0] hover:text-[#F4F7FC] hover:bg-[#162640]/50'
              }
            `}
          >
            📊 Vitals & Survival
          </button>

          <button
            type="button"
            role="tab"
            id="tab-controls"
            ref={(el) => { tabRefs.current.controls = el; }}
            aria-selected={activeTab === 'controls'}
            aria-controls="panel-controls"
            tabIndex={activeTab === 'controls' ? 0 : -1}
            onClick={() => setActiveTab('controls')}
            onKeyDown={(e) => handleTabKeyDown(e, 'controls')}
            className={`
              flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all
              focus-visible:ring-2 focus-visible:ring-[#60E5F4] focus-visible:outline-none min-h-[40px]
              ${activeTab === 'controls'
                ? 'bg-[#162640] text-[#60E5F4] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(96,229,244,0.15)]'
                : 'text-[#A8B8D0] hover:text-[#F4F7FC] hover:bg-[#162640]/50'
              }
            `}
          >
            🎮 Controls Guide
          </button>
        </div>

        {/* Tab 1: 30s Quick Start */}
        {activeTab === 'quickstart' && (
          <div
            role="tabpanel"
            id="panel-quickstart"
            aria-labelledby="tab-quickstart"
            className="space-y-4 animate-in fade-in duration-150"
          >
            <div className="p-4 rounded-xl bg-[#162640]/70 border border-[#1F3352] space-y-2">
              <h3 className="text-sm font-bold text-[#60E5F4] font-mono flex items-center gap-2">
                <span>🚀</span>
                <span>YOUR MISSION AS COMMANDER</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#F4F7FC] leading-relaxed">
                Welcome to Lunar Outpost Alpha! Your mission is to keep your <strong>3 astronaut crew alive for {TOTAL_MISSION_DAYS} simulated days</strong> on the Moon. Every action counts!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#080F20]/90 border border-[#1F3352] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg" aria-hidden="true">⏱️</span>
                  <GameBadge variant="cyan" size="sm">Rule 1</GameBadge>
                </div>
                <h4 className="text-xs font-bold text-[#F4F7FC] uppercase font-mono">
                  {MAX_ACTIONS_PER_DAY} Actions Daily
                </h4>
                <p className="text-xs text-[#A8B8D0] leading-normal">
                  Each simulated day, you get <strong>2 action slots</strong> to repair or boost habitat modules before night falls.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080F20]/90 border border-[#1F3352] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg" aria-hidden="true">⚖️</span>
                  <GameBadge variant="amber" size="sm">Rule 2</GameBadge>
                </div>
                <h4 className="text-xs font-bold text-[#F4F7FC] uppercase font-mono">
                  Balance Vitals
                </h4>
                <p className="text-xs text-[#A8B8D0] leading-normal">
                  Keep <strong>Oxygen, Power, Water, & Food above 0</strong>. Keep <strong>Radiation Risk below 100%</strong> to survive.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080F20]/90 border border-[#1F3352] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg" aria-hidden="true">🛰️</span>
                  <GameBadge variant="nominal" size="sm">Rule 3</GameBadge>
                </div>
                <h4 className="text-xs font-bold text-[#F4F7FC] uppercase font-mono">
                  Mission Dilemmas
                </h4>
                <p className="text-xs text-[#A8B8D0] leading-normal">
                  On Days 2, 3, & 4, face critical dilemmas: Day 2 features an authentic NASA DONKI solar storm observation, followed by two simulated habitat emergencies.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FFCA72]/10 border border-[#FFCA72]/30 flex items-start gap-2.5">
              <span className="text-[#FFCA72] text-sm shrink-0" aria-hidden="true">⚠️</span>
              <p className="text-xs text-[#FFCA72] leading-relaxed">
                <strong>Nightly Drain:</strong> At the end of every day, life support consumes <strong>16 Oxygen, 14 Power, 14 Water, and 14 Food</strong>. Always plan ahead!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: 4 Base Modules */}
        {activeTab === 'modules' && (
          <div
            role="tabpanel"
            id="panel-modules"
            aria-labelledby="tab-modules"
            className="space-y-3 animate-in fade-in duration-150"
          >
            <p className="text-xs text-[#A8B8D0]">
              Click on any module in the lunar base scene to open its maintenance controls:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Module 1: Solar */}
              <div className="p-3 rounded-xl bg-[#080F20]/90 border border-[#FFCA72]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFCA72] font-mono flex items-center gap-1.5">
                    <span>⚡</span> 1. Solar Array Station
                  </span>
                  <GameBadge variant="amber" size="sm">Cost: Free (0)</GameBadge>
                </div>
                <p className="text-xs text-[#A8B8D0]">
                  Clears lunar dust from photovoltaic panels. Restores <strong>+20 Power</strong> to recharge batteries.
                </p>
                <div className="text-[11px] font-mono text-[#59DDA5]">
                  Yield: +20 Power • Cost: None
                </div>
              </div>

              {/* Module 2: Habitat */}
              <div className="p-3 rounded-xl bg-[#080F20]/90 border border-[#60E5F4]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#60E5F4] font-mono flex items-center gap-1.5">
                    <span>🫁</span> 2. Life Support Habitat
                  </span>
                  <GameBadge variant="cyan" size="sm">Electrolysis</GameBadge>
                </div>
                <p className="text-xs text-[#A8B8D0]">
                  Pressurizes crew dome. Splits water molecules to produce <strong>+20 Oxygen</strong>.
                </p>
                <div className="text-[11px] font-mono text-[#60E5F4]">
                  Yield: +20 Oxygen • Cost: -8 Power, -6 Water
                </div>
              </div>

              {/* Module 3: Greenhouse */}
              <div className="p-3 rounded-xl bg-[#080F20]/90 border border-[#59DDA5]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#59DDA5] font-mono flex items-center gap-1.5">
                    <span>🌱</span> 3. Hydroponics Greenhouse
                  </span>
                  <GameBadge variant="nominal" size="sm">2 Actions</GameBadge>
                </div>
                <p className="text-xs text-[#A8B8D0]">
                  Cultivates spirulina and crops for <strong>+17 Food</strong>, or purifies wastewater for <strong>+18 Water</strong>.
                </p>
                <div className="text-[11px] font-mono text-[#59DDA5]">
                  Food: -9 Water, -6 Power • Water: -7 Power
                </div>
              </div>

              {/* Module 4: Bunker */}
              <div className="p-3 rounded-xl bg-[#080F20]/90 border border-[#FF6B73]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF6B73] font-mono flex items-center gap-1.5">
                    <span>🛡️</span> 4. Shielded Regolith Bunker
                  </span>
                  <GameBadge variant="critical" size="sm">Defense</GameBadge>
                </div>
                <p className="text-xs text-[#A8B8D0]">
                  Subsurface storm shelter. Thick lunar soil absorbs cosmic radiation, lowering threat by <strong>-18 Risk</strong>.
                </p>
                <div className="text-[11px] font-mono text-[#FF6B73]">
                  Yield: -18 Radiation Risk • Cost: -7 Power
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vitals & Survival */}
        {activeTab === 'vitals' && (
          <div
            role="tabpanel"
            id="panel-vitals"
            aria-labelledby="tab-vitals"
            className="space-y-3 animate-in fade-in duration-150"
          >
            <p className="text-xs text-[#A8B8D0]">
              All vitals use simplified educational simulation points (<strong>0 to 100</strong>):
            </p>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60E5F4]" aria-hidden="true" />
                  <span className="font-bold text-[#F4F7FC]">Oxygen (O₂)</span>
                  <span className="text-[#A8B8D0] text-[11px]">Starts at 75</span>
                </div>
                <span className="font-mono text-[#60E5F4]">Daily Drain: {DAILY_DRAIN.oxygen} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFCA72]" aria-hidden="true" />
                  <span className="font-bold text-[#F4F7FC]">Power Grid (kW)</span>
                  <span className="text-[#A8B8D0] text-[11px]">Starts at 70</span>
                </div>
                <span className="font-mono text-[#FFCA72]">Daily Drain: {DAILY_DRAIN.power} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5C9CFF]" aria-hidden="true" />
                  <span className="font-bold text-[#F4F7FC]">Water Supply (H₂O)</span>
                  <span className="text-[#A8B8D0] text-[11px]">Starts at 75</span>
                </div>
                <span className="font-mono text-[#5C9CFF]">Daily Drain: {DAILY_DRAIN.water} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#59DDA5]" aria-hidden="true" />
                  <span className="font-bold text-[#F4F7FC]">Food Rations</span>
                  <span className="text-[#A8B8D0] text-[11px]">Starts at 70</span>
                </div>
                <span className="font-mono text-[#59DDA5]">Daily Drain: {DAILY_DRAIN.food} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B73]" aria-hidden="true" />
                  <span className="font-bold text-[#F4F7FC]">Radiation Hazard</span>
                  <span className="text-[#A8B8D0] text-[11px]">Starts at 10 (Alert at 70)</span>
                </div>
                <span className="font-mono text-[#FF6B73]">Critical Threshold: ≥ 100</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#162640] border border-[#38BDF8]/30 text-xs text-[#A8B8D0] space-y-1">
              <span className="font-bold text-[#60E5F4] uppercase font-mono">
                Survival Condition:
              </span>
              <p>
                To achieve <strong>Mission Accomplished</strong>, complete all five mission days while keeping Oxygen, Power, Water and Food above zero and Radiation Risk below 100. If any vital hits 0 or Radiation hits 100, the mission aborts immediately!
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Controls Guide */}
        {activeTab === 'controls' && (
          <div
            role="tabpanel"
            id="panel-controls"
            aria-labelledby="tab-controls"
            className="space-y-3 animate-in fade-in duration-150"
          >
            <p className="text-xs text-[#A8B8D0]">
              TriOrbit supports seamless keyboard navigation, mouse clicks, and touch gestures:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between">
                <span className="text-[#A8B8D0]">Begin Mission / Start</span>
                <kbd className="px-2 py-1 rounded bg-[#162640] border border-[#1F3352] text-[#60E5F4] text-xs">
                  Enter ↵
                </kbd>
              </div>

              <div className="p-3 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between">
                <span className="text-[#A8B8D0]">How to Play / Help</span>
                <kbd className="px-2 py-1 rounded bg-[#162640] border border-[#1F3352] text-[#60E5F4] text-xs">
                  H or ?
                </kbd>
              </div>

              <div className="p-3 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between">
                <span className="text-[#A8B8D0]">Close Guide / Modal</span>
                <kbd className="px-2 py-1 rounded bg-[#162640] border border-[#1F3352] text-[#60E5F4] text-xs">
                  Esc
                </kbd>
              </div>

              <div className="p-3 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between">
                <span className="text-[#A8B8D0]">Navigate Controls</span>
                <kbd className="px-2 py-1 rounded bg-[#162640] border border-[#1F3352] text-[#60E5F4] text-xs">
                  Tab / Shift+Tab
                </kbd>
              </div>

              <div className="p-3 rounded-lg bg-[#080F20] border border-[#1F3352] flex items-center justify-between sm:col-span-2">
                <span className="text-[#A8B8D0]">Switch Guide Tabs</span>
                <kbd className="px-2 py-1 rounded bg-[#162640] border border-[#1F3352] text-[#60E5F4] text-xs">
                  ← / → Arrow Keys
                </kbd>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#162640] border border-[#1F3352] text-xs text-[#A8B8D0]">
              <strong className="text-[#F4F7FC]">Mobile Touch Friendly:</strong> On smartphones and tablets, all buttons exceed 48px touch targets for easy thumb activation.
            </div>
          </div>
        )}
      </div>
    </GameModal>
  );
}
