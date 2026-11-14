import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLOR_PRIMITIVES,
  RESOURCE_TOKENS,
  VITAL_THRESHOLDS,
  getVitalCondition,
  getVitalBarColor,
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  BORDER_RADII,
  SHADOWS,
  MOTION,
  BREAKPOINTS,
  TOUCH_TARGETS,
} from './tokens';

describe('TRI-012: Design Tokens Verification', () => {
  it('defines the approved primitive space color palette with exact hex codes', () => {
    assert.equal(COLOR_PRIMITIVES.spaceDeep, '#080F20');
    assert.equal(COLOR_PRIMITIVES.lunarNavy, '#101D35');
    assert.equal(COLOR_PRIMITIVES.panelSurface, '#162640');
    assert.equal(COLOR_PRIMITIVES.surfaceElevated, '#203653');
    assert.equal(COLOR_PRIMITIVES.cyanElectric, '#60E5F4');
    assert.equal(COLOR_PRIMITIVES.blueLunar, '#5C9CFF');
    assert.equal(COLOR_PRIMITIVES.amberSolar, '#FFCA72');
    assert.equal(COLOR_PRIMITIVES.greenOxygen, '#59DDA5');
    assert.equal(COLOR_PRIMITIVES.orangeWarning, '#FF9F5A');
    assert.equal(COLOR_PRIMITIVES.coralDanger, '#FF6B73');
    assert.equal(COLOR_PRIMITIVES.moonWhite, '#F4F7FC');
    assert.equal(COLOR_PRIMITIVES.textMuted, '#A8B8D0');
    assert.equal(COLOR_PRIMITIVES.borderSubtle, '#1F3352');
    assert.equal(COLOR_PRIMITIVES.borderGlow, '#38BDF8');
  });

  it('configures all 5 canonical game resource tokens with correct subsystems', () => {
    const resources = ['oxygen', 'power', 'water', 'food', 'radiationRisk'] as const;
    for (const key of resources) {
      assert.ok(RESOURCE_TOKENS[key], `Missing resource token config for ${key}`);
      assert.equal(RESOURCE_TOKENS[key].key, key);
      assert.ok(RESOURCE_TOKENS[key].label.length > 0);
      assert.ok(RESOURCE_TOKENS[key].subsystem.length > 0);
      assert.ok(RESOURCE_TOKENS[key].primaryColor.startsWith('#'));
      assert.ok(RESOURCE_TOKENS[key].backgroundPill.startsWith('rgba('));
    }

    // Specific subsystems
    assert.equal(RESOURCE_TOKENS.oxygen.subsystem, 'Life Support Habitat Dome');
    assert.equal(RESOURCE_TOKENS.power.subsystem, 'Solar Array & Battery Station');
    assert.equal(RESOURCE_TOKENS.water.subsystem, 'Water Reclamation Loop');
    assert.equal(RESOURCE_TOKENS.food.subsystem, 'Hydroponics Greenhouse');
    assert.equal(RESOURCE_TOKENS.radiationRisk.subsystem, 'Shielded Regolith Bunker');

    // Hazards
    assert.equal(RESOURCE_TOKENS.radiationRisk.isHazard, true);
    assert.equal(RESOURCE_TOKENS.oxygen.isHazard, false);
    assert.equal(RESOURCE_TOKENS.power.isHazard, false);
  });

  it('evaluates vital conditions accurately across normal and hazard vitals', () => {
    assert.equal(VITAL_THRESHOLDS.nominal.minVital, 41);
    assert.equal(VITAL_THRESHOLDS.warning.maxVital, 40);
    assert.equal(VITAL_THRESHOLDS.critical.maxVital, 20);
    // Normal vital (e.g. Oxygen: nominal > 40, warning 21-40, critical <= 20)
    assert.equal(getVitalCondition(100, false), 'nominal');
    assert.equal(getVitalCondition(50, false), 'nominal');
    assert.equal(getVitalCondition(41, false), 'nominal');
    assert.equal(getVitalCondition(40, false), 'warning');
    assert.equal(getVitalCondition(25, false), 'warning');
    assert.equal(getVitalCondition(21, false), 'warning');
    assert.equal(getVitalCondition(20, false), 'critical');
    assert.equal(getVitalCondition(5, false), 'critical');
    assert.equal(getVitalCondition(0, false), 'critical');

    // Hazard vital (Radiation Risk: nominal < 50, warning 50-69, critical >= 70)
    assert.equal(getVitalCondition(0, true), 'nominal');
    assert.equal(getVitalCondition(25, true), 'nominal');
    assert.equal(getVitalCondition(49, true), 'nominal');
    assert.equal(getVitalCondition(50, true), 'warning');
    assert.equal(getVitalCondition(65, true), 'warning');
    assert.equal(getVitalCondition(69, true), 'warning');
    assert.equal(getVitalCondition(70, true), 'critical');
    assert.equal(getVitalCondition(95, true), 'critical');
    assert.equal(getVitalCondition(100, true), 'critical');
  });

  it('selects correct vital bar fill color based on condition', () => {
    const defaultCyan = COLOR_PRIMITIVES.cyanElectric;
    assert.equal(getVitalBarColor('nominal', defaultCyan), defaultCyan);
    assert.equal(getVitalBarColor('warning', defaultCyan), COLOR_PRIMITIVES.orangeWarning);
    assert.equal(getVitalBarColor('critical', defaultCyan), COLOR_PRIMITIVES.coralDanger);
  });

  it('defines typography scale tokens matching the approved design specifications', () => {
    assert.equal(TYPOGRAPHY_SCALE.displayTitle.fontSize, '2.25rem');
    assert.equal(TYPOGRAPHY_SCALE.screenHeading.fontSize, '1.75rem');
    assert.equal(TYPOGRAPHY_SCALE.sectionHeading.fontSize, '1.25rem');
    assert.equal(TYPOGRAPHY_SCALE.subheading.fontSize, '1.00rem');
    assert.equal(TYPOGRAPHY_SCALE.hudMetricValue.fontSize, '1.50rem');
    assert.equal(TYPOGRAPHY_SCALE.buttonText.fontSize, '0.875rem');
  });

  it('defines 4px grid spacing scale and radii', () => {
    assert.equal(SPACING_SCALE.space1, '4px');
    assert.equal(SPACING_SCALE.space2, '8px');
    assert.equal(SPACING_SCALE.space4, '16px');
    assert.equal(SPACING_SCALE.space6, '24px');
    assert.equal(SPACING_SCALE.space8, '32px');

    assert.equal(BORDER_RADII.sm, '4px');
    assert.equal(BORDER_RADII.md, '8px');
    assert.equal(BORDER_RADII.lg, '12px');
    assert.equal(BORDER_RADII.xl, '16px');
    assert.equal(BORDER_RADII.full, '9999px');
  });

  it('defines elevation shadows with atmospheric cyan/amber/coral glows', () => {
    assert.ok(SHADOWS.panel.includes('rgba(96, 229, 244, 0.08)'));
    assert.ok(SHADOWS.glowCyan.includes('rgba(96, 229, 244, 0.35)'));
    assert.ok(SHADOWS.glowAmber.includes('rgba(255, 202, 114, 0.35)'));
    assert.ok(SHADOWS.glowCoral.includes('rgba(255, 107, 115, 0.45)'));
    assert.equal(SHADOWS.backdropScrim, 'rgba(4, 8, 18, 0.85)');
  });

  it('defines motion duration and easing constants', () => {
    assert.equal(MOTION.durationFast, '150ms');
    assert.equal(MOTION.durationNormal, '250ms');
    assert.equal(MOTION.durationSlow, '400ms');
    assert.equal(MOTION.easeOutSpace, 'cubic-bezier(0, 0, 0.2, 1)');
  });

  it('verifies responsive breakpoints and minimum touch target requirements', () => {
    assert.equal(BREAKPOINTS.mobileMax, 639);
    assert.equal(BREAKPOINTS.tabletMin, 640);
    assert.equal(BREAKPOINTS.desktopMin, 1024);
    assert.equal(BREAKPOINTS.wideDesktopMin, 1440);

    // WCAG 2.1 touch target minimums
    assert.equal(TOUCH_TARGETS.desktop.minWidth, '44px');
    assert.equal(TOUCH_TARGETS.desktop.minHeight, '44px');
    assert.equal(TOUCH_TARGETS.mobile.minWidth, '48px');
    assert.equal(TOUCH_TARGETS.mobile.minHeight, '48px');
  });
});

