/**
 * TriOrbit — Design System & Visual Tokens
 * 
 * Target Framework: Next.js App Router, Tailwind CSS v4, TypeScript
 * Primary Owner: Abhinaya Jeyakumar (TRI-012)
 * Independent Reviewer: Nirsanth A.
 * Approved Visual Reference: Figma Make — TriOrbit Lunar Survival Simulator UI
 * Specification: docs/DESIGN_TOKENS.md & docs/UI_STORYBOARD.md
 */

// ============================================================================
// 1. Primitive & Semantic Color Palette
// ============================================================================

export const COLOR_PRIMITIVES = {
  // Surface & Canvas (Dark Aerospace Navy)
  spaceDeep: '#080F20',
  lunarNavy: '#101D35',
  panelSurface: '#162640',
  surfaceElevated: '#203653',

  // Luminescent Telemetry Accents
  cyanElectric: '#60E5F4',
  blueLunar: '#5C9CFF',
  amberSolar: '#FFCA72',
  greenOxygen: '#59DDA5',
  orangeWarning: '#FF9F5A',
  coralDanger: '#FF6B73',

  // Typography & Content
  moonWhite: '#F4F7FC',
  textMuted: '#A8B8D0',
  textDim: '#5A6E85',

  // Structural Borders
  borderSubtle: '#1F3352',
  borderGlow: '#38BDF8',
} as const;

export type ColorPrimitiveKey = keyof typeof COLOR_PRIMITIVES;

// ============================================================================
// 2. Semantic Resource Tokens (5 Canonical Vitals)
// ============================================================================

export interface ResourceTokenConfig {
  key: 'oxygen' | 'power' | 'water' | 'food' | 'radiationRisk';
  label: string;
  subsystem: string;
  primaryColor: string;
  backgroundPill: string;
  textAccent: string;
  isHazard: boolean;
  unit: string;
  description: string;
}

export const RESOURCE_TOKENS: Record<
  'oxygen' | 'power' | 'water' | 'food' | 'radiationRisk',
  ResourceTokenConfig
> = {
  oxygen: {
    key: 'oxygen',
    label: 'Oxygen',
    subsystem: 'Life Support Habitat Dome',
    primaryColor: COLOR_PRIMITIVES.cyanElectric,
    backgroundPill: 'rgba(96, 229, 244, 0.12)',
    textAccent: '#60E5F4',
    isHazard: false,
    unit: 'pts',
    description: 'Pressurized O2 atmosphere for astronaut survival',
  },
  power: {
    key: 'power',
    label: 'Power Grid',
    subsystem: 'Solar Array & Battery Station',
    primaryColor: COLOR_PRIMITIVES.amberSolar,
    backgroundPill: 'rgba(255, 202, 114, 0.12)',
    textAccent: '#FFCA72',
    isHazard: false,
    unit: 'pts',
    description: 'Photovoltaic generation and electrochemical storage',
  },
  water: {
    key: 'water',
    label: 'Water Supply',
    subsystem: 'Water Reclamation Loop',
    primaryColor: COLOR_PRIMITIVES.blueLunar,
    backgroundPill: 'rgba(92, 156, 255, 0.12)',
    textAccent: '#5C9CFF',
    isHazard: false,
    unit: 'pts',
    description: 'Closed-loop greywater purification and drinking reserves',
  },
  food: {
    key: 'food',
    label: 'Food Rations',
    subsystem: 'Hydroponics Greenhouse',
    primaryColor: COLOR_PRIMITIVES.greenOxygen,
    backgroundPill: 'rgba(89, 221, 165, 0.12)',
    textAccent: '#59DDA5',
    isHazard: false,
    unit: 'pts',
    description: 'High-yield spirulina and automated aeroponic crops',
  },
  radiationRisk: {
    key: 'radiationRisk',
    label: 'Radiation Risk',
    subsystem: 'Shielded Regolith Bunker',
    primaryColor: COLOR_PRIMITIVES.coralDanger,
    backgroundPill: 'rgba(255, 107, 115, 0.12)',
    textAccent: '#FF6B73',
    isHazard: true,
    unit: 'pts',
    description: 'Cosmic ray exposure and solar proton event threat level',
  },
} as const;

// ============================================================================
// 3. Vital Condition Thresholds (Nominal / Warning / Critical)
// ============================================================================

export type VitalCondition = 'nominal' | 'warning' | 'critical';

export interface ConditionRule {
  condition: VitalCondition;
  label: string;
  badgeToken: string;
  trackBg: string;
}

export const VITAL_THRESHOLDS = {
  nominal: {
    minVital: 41,
    maxRisk: 49,
    label: 'Nominal',
    trackBg: 'rgba(255, 255, 255, 0.08)',
  },
  warning: {
    minVital: 21,
    maxVital: 40,
    minRisk: 50,
    maxRisk: 69,
    label: 'Warning',
    color: COLOR_PRIMITIVES.orangeWarning,
    trackBg: 'rgba(255, 159, 90, 0.15)',
  },
  critical: {
    maxVital: 20,
    minRisk: 70,
    label: 'Critical',
    color: COLOR_PRIMITIVES.coralDanger,
    trackBg: 'rgba(255, 107, 115, 0.25)',
  },
} as const;

/**
 * Calculates current condition category (nominal, warning, critical) for any vital
 */
export function getVitalCondition(value: number, isHazard: boolean): VitalCondition {
  if (isHazard) {
    if (value >= VITAL_THRESHOLDS.critical.minRisk) return 'critical';
    if (value >= VITAL_THRESHOLDS.warning.minRisk) return 'warning';
    return 'nominal';
  } else {
    if (value <= VITAL_THRESHOLDS.critical.maxVital) return 'critical';
    if (value <= VITAL_THRESHOLDS.warning.maxVital) return 'warning';
    return 'nominal';
  }
}

/**
 * Returns the fill color for a vital bar given its condition and default accent color
 */
export function getVitalBarColor(condition: VitalCondition, defaultColor: string): string {
  switch (condition) {
    case 'critical':
      return COLOR_PRIMITIVES.coralDanger;
    case 'warning':
      return COLOR_PRIMITIVES.orangeWarning;
    case 'nominal':
    default:
      return defaultColor;
  }
}

// ============================================================================
// 4. Typography Scale & Fonts
// ============================================================================

export const FONT_STACKS = {
  display: '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const;

export const TYPOGRAPHY_SCALE = {
  displayTitle: {
    fontSize: '2.25rem', // 36px
    lineHeight: '2.75rem', // 44px
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  screenHeading: {
    fontSize: '1.75rem', // 28px
    lineHeight: '2.25rem', // 36px
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  sectionHeading: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.75rem', // 28px
    fontWeight: '600',
    letterSpacing: '0em',
  },
  subheading: {
    fontSize: '1.00rem', // 16px
    lineHeight: '1.50rem', // 24px
    fontWeight: '500',
    letterSpacing: '0em',
  },
  bodyRegular: {
    fontSize: '0.9375rem', // 15px
    lineHeight: '1.375rem', // 22px
    fontWeight: '400',
    letterSpacing: '0em',
  },
  bodySmall: {
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.125rem', // 18px
    fontWeight: '400',
    letterSpacing: '+0.01em',
  },
  hudMetricValue: {
    fontSize: '1.50rem', // 24px
    lineHeight: '1.75rem', // 28px
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  hudMetricLabel: {
    fontSize: '0.6875rem', // 11px
    lineHeight: '0.875rem', // 14px
    fontWeight: '700',
    letterSpacing: '+0.08em',
  },
  buttonText: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '600',
    letterSpacing: '+0.02em',
  },
  badgeText: {
    fontSize: '0.6875rem', // 11px
    lineHeight: '0.875rem', // 14px
    fontWeight: '500',
    letterSpacing: '+0.04em',
  },
  caption: {
    fontSize: '0.6875rem', // 11px
    lineHeight: '1.00rem', // 16px
    fontWeight: '400',
    letterSpacing: '0em',
  },
} as const;

// ============================================================================
// 5. Spacing Scale (4px Baseline Grid)
// ============================================================================

export const SPACING_SCALE = {
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space6: '24px',
  space8: '32px',
  space12: '48px',
  space16: '64px',
} as const;

// ============================================================================
// 6. Border Radius
// ============================================================================

export const BORDER_RADII = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// ============================================================================
// 7. Elevation & Shadows (Atmospheric Space Glows)
// ============================================================================

export const SHADOWS = {
  panel: '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(96, 229, 244, 0.08)',
  glowCyan: '0 0 16px 2px rgba(96, 229, 244, 0.35)',
  glowAmber: '0 0 16px 2px rgba(255, 202, 114, 0.35)',
  glowCoral: '0 0 20px 4px rgba(255, 107, 115, 0.45)',
  backdropScrim: 'rgba(4, 8, 18, 0.85)',
} as const;

// ============================================================================
// 8. Motion & Transitions
// ============================================================================

export const MOTION = {
  durationFast: '150ms',
  durationNormal: '250ms',
  durationSlow: '400ms',
  easeOutSpace: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOutSpace: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================================================
// 9. Responsive Breakpoints & Target Viewports
// ============================================================================

export const BREAKPOINTS = {
  mobileMax: 639, // < 640px (Target: 390x844 iPhone 14/15)
  tabletMin: 640,
  tabletMax: 1023, // 640 - 1023px (Target: 768x1024 iPad)
  desktopMin: 1024,
  desktopMax: 1439, // 1024 - 1439px (Target: 1366x768 Standard Laptop)
  wideDesktopMin: 1440, // >= 1440px (Target: 1440x900+)
} as const;

export const TOUCH_TARGETS = {
  desktop: { minWidth: '44px', minHeight: '44px' },
  mobile: { minWidth: '48px', minHeight: '48px' },
} as const;

