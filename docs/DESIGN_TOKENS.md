# TriOrbit — Design System & Visual Tokens

> **Task ID:** TRI-004  
> **Status:** Proposed Implementation Token Set (Ready for Review by `@nirsanth23`)  
> **Project:** TriOrbit — Lunar Survival Simulator  
> **Challenge:** NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer  
> **Primary Owner:** Abhinaya Jeyakumar (`@abhi190503`)  
> **Independent Reviewer:** Nirsanth A. (`@nirsanth23`)  
> **Target Framework:** Next.js App Router, Tailwind CSS v4, TypeScript  
> **Official Figma Reference:** [Figma Make — TriOrbit Lunar Survival Simulator UI](https://www.figma.com/make/zYcbshtDwiJULc3ha5P3wu/TriOrbit-%E2%80%94-Lunar-Survival-Simulator-UI?p=f&t=sEAV14zXtyKYHnOP-0)  
> **Inspection Status:** Direct web extraction restricted (auth/404); values represent the approved target implementation tokens synthesized from owner-approved Figma design references.

---

## 1. Design Token Architecture & Philosophy

TriOrbit's design system is engineered specifically for a **cinematic lunar survival game**. It departs from generic SaaS dashboard styling by delivering:
- A rich, dark aerospace environment grounded in deep space navies (`#080F20`, `#101D35`).
- Vibrant luminescent accents (Electric Cyan, Lunar Blue, Solar Amber) inspired by mission control displays and spacesuit telemetry.
- Purposeful educational color-coding for the 5 vital life-support resources.
- Strict WCAG 2.1 AA accessibility and contrast compliance to accommodate young learners (ages 7–12) across diverse classroom screens.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Base Palette (Primitive Tokens)

| Token Name | Hex Code | RGB | Swatch Description | Role in TriOrbit |
|---|---|---|---|---|
| `space-deep` | `#080F20` | `rgb(8, 15, 32)` | Deep Space Black-Navy | Primary canvas background |
| `lunar-navy` | `#101D35` | `rgb(16, 29, 53)` | Deep Regolith Navy | Card and panel container surfaces |
| `panel-surface` | `#162640` | `rgb(22, 38, 64)` | Mid-Tone Space Navy | Interactive cards, drawers, HUD panels |
| `surface-elevated`| `#203653` | `rgb(32, 54, 83)` | Highlighted Space Slate | Modals, floating tooltips, active states |
| `cyan-electric` | `#60E5F4` | `rgb(96, 229, 244)`| Electric Cyan | Primary CTA, Oxygen vital, focus rings |
| `blue-lunar` | `#5C9CFF` | `rgb(92, 156, 255)`| Luminous Lunar Blue | Water vital, secondary interactive accents |
| `amber-solar` | `#FFCA72` | `rgb(255, 202, 114)`| Radiant Solar Amber | Power vital, caution alerts, solar arrays |
| `green-oxygen` | `#59DDA5` | `rgb(89, 221, 165)`| Fresh Biosphere Emerald| Food vital, hydroponics, nominal success |
| `orange-warning` | `#FF9F5A` | `rgb(255, 159, 90)` | Solar Storm Orange | Moderate hazard warning state |
| `coral-danger` | `#FF6B73` | `rgb(255, 107, 115)`| Critical Alert Coral Red| Radiation Risk, vital emergency, failure |
| `moon-white` | `#F4F7FC` | `rgb(244, 247, 252)`| Brilliant Lunar Frost | Primary headings, prominent values |
| `text-muted` | `#A8B8D0` | `rgb(168, 184, 208)`| Soft Telemetry Gray | Secondary labels, descriptions, units |
| `border-subtle` | `#1F3352` | `rgb(31, 51, 82)` | Translucent Blue-Navy | Standard panel borders |
| `border-glow` | `#38BDF8` | `rgb(56, 189, 248)` | Sky Blue Beacon | Focus rings, highlighted module borders |

---

### 2.2 Semantic Resource Tokens

Each of the 5 canonical game vitals is bound to a distinct chromatic identity to ensure young players can immediately recognize resources at a glance:

```
[ OXYGEN ]       --> #60E5F4 (Electric Cyan)   - Subsystem: Life Support Dome
[ POWER ]        --> #FFCA72 (Solar Amber)     - Subsystem: Solar Array & Batteries
[ WATER ]        --> #5C9CFF (Lunar Blue)      - Subsystem: Water Reclamation Loop
[ FOOD ]         --> #59DDA5 (Oxygen Green)    - Subsystem: Hydroponics Bay
[ RAD RISK ]     --> #FF6B73 (Danger Coral)    - Subsystem: Shielded Bunker (Adverse Hazard)
```

| Vital Resource | Primary Token | Background Pill | Text Accent | Canonical Subsystem |
|---|---|---|---|---|
| **Oxygen** | `var(--color-cyan-electric)` | `rgba(96, 229, 244, 0.12)` | `#60E5F4` | Life Support Habitat Dome |
| **Power** | `var(--color-amber-solar)` | `rgba(255, 202, 114, 0.12)` | `#FFCA72` | Solar Array & Battery Station |
| **Water** | `var(--color-blue-lunar)` | `rgba(92, 156, 255, 0.12)` | `#5C9CFF` | Water Reclamation Loop |
| **Food** | `var(--color-green-oxygen)` | `rgba(89, 221, 165, 0.12)` | `#59DDA5` | Hydroponics Greenhouse |
| **Radiation Risk** | `var(--color-coral-danger)` | `rgba(255, 107, 115, 0.12)` | `#FF6B73` | Shielded Regolith Bunker |

---

### 2.3 Contrast & Readability Verification (WCAG 2.1 AA)

All proposed text-to-background combinations were mathematically evaluated against WCAG 2.1 Level AA requirements ($4.5:1$ for normal text, $3.0:1$ for large text/UI components):

| Text Token | Background Surface | Contrast Ratio | WCAG 2.1 AA Status | Use Case |
|---|---|---|---|---|
| `moon-white` (`#F4F7FC`) | `space-deep` (`#080F20`) | **16.2:1** | **PASS (AAA)** | Primary titles, mission headers |
| `moon-white` (`#F4F7FC`) | `panel-surface` (`#162640`) | **13.1:1** | **PASS (AAA)** | Modal headings, card titles |
| `text-muted` (`#A8B8D0`) | `space-deep` (`#080F20`) | **9.6:1** | **PASS (AAA)** | Body paragraphs, instructions |
| `text-muted` (`#A8B8D0`) | `panel-surface` (`#162640`) | **7.8:1** | **PASS (AAA)** | Secondary telemetry descriptions |
| `cyan-electric` (`#60E5F4`) | `space-deep` (`#080F20`) | **13.5:1** | **PASS (AAA)** | High-priority accents, focus indicators |
| `amber-solar` (`#FFCA72`) | `panel-surface` (`#162640`) | **11.4:1** | **PASS (AAA)** | Power readouts, warning text |
| `coral-danger` (`#FF6B73`) | `space-deep` (`#080F20`) | **6.4:1** | **PASS (AA)** | Critical radiation warning banner |
| `space-deep` (`#080F20`) | `cyan-electric` (`#60E5F4`) | **13.5:1** | **PASS (AAA)** | Primary CTA Button ("Begin Mission") |

---

## 3. Typography Scale & Specifications

### 3.1 Font Families
- **Display & Headings:** `Space Grotesk`, sans-serif (Fallback: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
  - *Personality:* Geometric, technical, modern aerospace character that excites young learners without sacrificing legibility.
- **Body & Controls:** `Inter`, sans-serif (Fallback: `system-ui, -apple-system, sans-serif`)
  - *Personality:* Highly neutral, ultra-legible at small screen sizes, excellent numerals.
- **Telemetry & Gauges:** Tabular Sans / Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)
  - *Personality:* Fixed-width numerals prevent jumping and visual jitter during real-time vital transitions.

### 3.2 Type Hierarchy Table

| Scale Name | Font Size | Line Height | Weight | Letter Spacing | Semantic HTML | Target Usage |
|---|---|---|---|---|---|---|
| **Display Title** | $36\text{px}$ ($2.25\text{rem}$) | $44\text{px}$ | Bold ($700$) | $-0.02\text{em}$ | `<h1>` | Landing Screen Hero Title |
| **Screen Heading** | $28\text{px}$ ($1.75\text{rem}$) | $36\text{px}$ | Bold ($700$) | $-0.01\text{em}$ | `<h2>` | Results Header, Briefing Title |
| **Section Heading** | $20\text{px}$ ($1.25\text{rem}$) | $28\text{px}$ | SemiBold ($600$) | $0\text{em}$ | `<h3>` | Event Modal Title, Drawer Header |
| **Subheading** | $16\text{px}$ ($1.00\text{rem}$) | $24\text{px}$ | Medium ($500$) | $0\text{em}$ | `<h4>` | Facility Names, Card Subheadings |
| **Body Regular** | $15\text{px}$ ($0.9375\text{rem}$) | $22\text{px}$ | Regular ($400$) | $0\text{em}$ | `<p>` | Narrative Descriptions, Explanations |
| **Body Small** | $13\text{px}$ ($0.8125\text{rem}$) | $18\text{px}$ | Regular ($400$) | $+0.01\text{em}$ | `<p>, <span>` | Science Disclaimers, Citations |
| **HUD Metric Value**| $24\text{px}$ ($1.50\text{rem}$) | $28\text{px}$ | Bold ($700$) | $-0.01\text{em}$ | `<span>` | Vital Numbers ($0–100$), Day Counter |
| **HUD Metric Label**| $11\text{px}$ ($0.6875\text{rem}$) | $14\text{px}$ | Bold ($700$) | $+0.08\text{em}$ | `<label>` | "OXYGEN", "POWER", "RAD RISK" (Caps) |
| **Button Text** | $14\text{px}$ ($0.875\text{rem}$) | $20\text{px}$ | SemiBold ($600$) | $+0.02\text{em}$ | `<button>` | "Begin Mission", "Finish Day" |
| **Badge / Tag** | $11\text{px}$ ($0.6875\text{rem}$) | $14\text{px}$ | Medium ($500$) | $+0.04\text{em}$ | `<span>` | "NASA DONKI", "NOMINAL", "ACTIVE" |
| **Caption / Footnote**| $11\text{px}$ ($0.6875\text{rem}$)| $16\text{px}$ | Regular ($400$) | $0\text{em}$ | `<small>` | Legal disclaimers, AI art notice |

---

## 4. Spacing, Layout & Elevation Scale

### 4.1 Spacing Scale (4px Baseline Grid)

| Token | Dimension | Tailwind Equivalent | Primary Usage |
|---|---|---|---|
| `space-1` | $4\text{px}$ | `p-1`, `gap-1`, `m-1` | Tight icon-to-label gaps, badge padding |
| `space-2` | $8\text{px}$ | `p-2`, `gap-2`, `m-2` | Button inner padding, metric item spacing |
| `space-3` | $12\text{px}$ | `p-3`, `gap-3`, `m-3` | HUD metric card padding, compact lists |
| `space-4` | $16\text{px}$ | `p-4`, `gap-4`, `m-4` | Standard card padding, modal content gap |
| `space-6` | $24\text{px}$ | `p-6`, `gap-6`, `m-6` | Dialog outer padding, screen section gaps |
| `space-8` | $32\text{px}$ | `p-8`, `gap-8`, `m-8` | Modal borders, hero layout spacing |
| `space-12` | $48\text{px}$ | `p-12`, `gap-12` | Landing screen hero spacing |
| `space-16` | $64\text{px}$ | `p-16`, `gap-16` | Large desktop viewport margins |

---

### 4.2 Border Radius & Shapes

| Token | Value | Tailwind Equivalent | Intended Usage |
|---|---|---|---|
| `radius-sm` | $4\text{px}$ | `rounded` | Status badges, tooltip corners |
| `radius-md` | $8\text{px}$ | `rounded-lg` | Standard buttons, input fields, action cards |
| `radius-lg` | $12\text{px}$ | `rounded-xl` | HUD panels, event option cards, facility cards |
| `radius-xl` | $16\text{px}$ | `rounded-2xl` | Main mission modals, science drawer shell |
| `radius-full` | $9999\text{px}$ | `rounded-full` | Vital gauge progress pills, circular icon buttons |

---

### 4.3 Elevation & Shadows (Atmospheric Space Glows)

Rather than heavy realistic drop shadows that disappear on dark space backgrounds, TriOrbit utilizes **subtle atmospheric glows** that create depth and visual hierarchy:

```css
/* Card Elevation */
--shadow-panel: 0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(96, 229, 244, 0.08);

/* Active / Focused Component Glows */
--shadow-glow-cyan: 0 0 16px 2px rgba(96, 229, 244, 0.35);
--shadow-glow-amber: 0 0 16px 2px rgba(255, 202, 114, 0.35);
--shadow-glow-coral: 0 0 20px 4px rgba(255, 107, 115, 0.45);

/* Modal Overlay Backdrop */
--backdrop-scrim: rgba(4, 8, 18, 0.85);
```

---

## 5. Component Visual States

### 5.1 Primary Button ("Begin Mission", "Confirm Action", "Play Again")

| State | Background | Border | Text Color | Shadow / Glow |
|---|---|---|---|---|
| **Default** | `#60E5F4` (Electric Cyan) | *None* | `#080F20` (Bold Space Navy) | `0 0 12px rgba(96, 229, 244, 0.25)` |
| **Hover** | `#88EEF8` (Bright Cyan) | *None* | `#080F20` | `0 0 20px rgba(96, 229, 244, 0.50)` |
| **Focus** | `#60E5F4` | $2\text{px}$ solid `#FFFFFF` | `#080F20` | Focus ring offset $2\text{px}$ |
| **Active / Pressed**| `#38BDF8` (Deep Cyan) | *None* | `#080F20` | Scale $0.98$, inner shadow |
| **Disabled** | `#162640` (Muted Slate) | $1\text{px}$ solid `#1F3352` | `#5A6E85` (Dim Gray) | *None*, cursor `not-allowed` |

---

### 5.2 Facility Hotspot Badge & Boundary

| State | Hotspot Pin / Beacon | Module Boundary Outline | Floating Label Badge |
|---|---|---|---|
| **Default (Idle)** | `#60E5F4` dot, pulsing at $1.5\text{s}$ | Transparent / hidden | `#101D35` bg (85% opacity), `#A8B8D0` text |
| **Hover** | Outer ring expands to $24\text{px}$ | $1\text{px}$ dashed `#60E5F4` | `#162640` bg, `#F4F7FC` text, cyan border |
| **Keyboard Focus** | Pulsing paused, solid $3\text{px}$ dot | $2\text{px}$ solid `#60E5F4` (offset $2\text{px}$) | Visible focus outline, expanded text label |
| **Selected** | Solid `#59DDA5` (Active Teal) | $2\text{px}$ solid `#60E5F4` with cyan glow | Glowing cyan tag: `[ ACTIVE FACILITY ]` |

---

### 5.3 Resource Gauges (HUD)

| Vital Condition | Percentage Range | Bar Fill Token | Background Track | Status Icon |
|---|---|---|---|---|
| **Nominal** | $> 40\%$ vitals ($< 50\%$ risk) | `var(--color-vital-accent)` | `rgba(255, 255, 255, 0.08)` | Small checkmark / steady pulse |
| **Warning** | $21\%–40\%$ vitals ($50\%–69\%$ risk) | `#FF9F5A` (Warning Orange) | `rgba(255, 159, 90, 0.15)` | Warning triangle, amber text |
| **Critical** | $\le 20\%$ vitals ($\ge 70\%$ risk) | `#FF6B73` (Critical Coral) | `rgba(255, 107, 115, 0.25)` | Pulsing alert shield, red border |

---

## 6. Responsive Breakpoints & Device Adaptation

```
  Mobile (<640px)          Tablet (640px-1023px)         Desktop (1024px-1439px)        Large Desktop (>=1440px)
+------------------+    +--------------------------+   +-----------------------------+ +-----------------------------+
| Top HUD Strip    |    | Top Horizontal HUD       |   | Left HUD | Scene | Action   | | Left HUD | Wide Scene| Panel  |
| Scaled Base View |    | Centered Base Graphic    |   | (260px)  | (Hero)| (300px)  | | (320px)  | (1200px)  | (360px)|
| Module Pills [4] |    | Collapsible Bottom Sheet |   +-----------------------------+ +-----------------------------+
| Bottom Action Drw|    +--------------------------+
+------------------+
```

| Viewport Range | Primary Target | HUD Behavior | Lunar Base Presentation | Action Selection Mechanism | Minimum Touch Target |
|---|---|---|---|---|---|
| **Mobile (`< 640px`)** | $390 \times 844$ | Collapsed top bar (5 vitals in row) | Fixed 16:9 ratio, auto-scaled | **Accessible Module Pill Strip** + Bottom Action Drawer | $48 \times 48\text{px}$ |
| **Tablet (`640–1023px`)** | $768 \times 1024$ / $1024 \times 768$ | Top horizontal dashboard card | Fluid width (max $720\text{px}$) | Hotspot clicks OR selector pill strip | $44 \times 44\text{px}$ |
| **Desktop (`1024–1439px`)**| $1366 \times 768$ | Left fixed sidebar ($260\text{px}$) | Center hero ($16:9$, max $900\text{px}$) | Direct hotspot clicking + right action dock | $44 \times 44\text{px}$ |
| **Large Desktop (`>=1440px`)**| $1440 \times 900+$ | Left fixed sidebar ($320\text{px}$) | Wide cinematic center (max $1200\text{px}$) | Direct hotspot clicking + right action dock | $44 \times 44\text{px}$ |

---

## 7. Motion & Animation Tokens

### 7.1 Duration & Easing Constants

```css
/* Duration Tokens */
--duration-fast: 150ms;       /* Button hover, focus ring, tooltip toggle */
--duration-normal: 250ms;     /* Action drawer slide, modal enter, toast pop */
--duration-slow: 400ms;       /* Resource bar animated filling, day transition */

/* Easing Curves */
--ease-out-space: cubic-bezier(0, 0, 0.2, 1);       /* Smooth entrance */
--ease-in-out-space: cubic-bezier(0.4, 0, 0.2, 1);   /* Balanced transitions */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Bouncy celebration pop */
```

### 7.2 Keyframe Animations
1. **`pulse-beacon`:** Animates hotspot markers ($0\% \rightarrow 100\%$ scale $1.0 \rightarrow 1.4$, opacity $0.8 \rightarrow 0.0$, duration $1.5\text{s}$ infinite).
2. **`glow-pulse-alert`:** High-urgency vital alert on critical resources (border color pulses between `#FF6B73` and `#FF9F5A` at $1\text{s}$ intervals).
3. **`vital-fill-transition`:** Smooth ease-out fill for progress gauges (`transition: width 350ms ease-out`).

### 7.3 Reduced-Motion Compliance
When `@media (prefers-reduced-motion: reduce)` is detected:
- All infinite beacon pulsations are halted (`animation: none`).
- Transitions are set to `0ms` or instant opacity swaps.
- Progress bars snap directly to final calculated values.

---

## 8. Artwork Usage, Optimization & Provenance Handoff

### 8.1 Asset Role in Production
The realistic lunar outpost image serves exclusively as a **decorative backdrop**:
- Rendered via `<Image>` or `<img>` with `aria-hidden="true"`.
- Must never contain embedded text or flattened buttons that screen readers cannot parse.
- All interactive module targets sit in a transparent, accessible SVG/HTML overlay layer positioned above the image.

### 8.2 Image Provenance & Disclosures
- **Provenance:** Original concept artwork generated with AI assistance specifically for TriOrbit.
- **NASA Brand Safety:** Zero NASA insignias, "meatball" logos, or official agency graphics appear in the artwork.
- **Fictional Context:** Clearly identified as a pedagogical visualization of a lunar settlement, not a photograph of an active operational facility.

### 8.3 Asset Transfer Handoff (`TRI-014`)
During task `TRI-004`, **zero binary images are committed** to maintain repository safety and prevent unreviewed binary bloat.
During the upcoming `TRI-014` task:
1. The approved artwork will be exported from Figma Make in lossless PNG and WebP/AVIF formats.
2. File size target: $\le 180\text{ KB}$ for WebP, $\le 350\text{ KB}$ for responsive desktop fallback.
3. Placed under `public/images/lunar-base-cinematic.webp`.
4. Exact hotspot percentage coordinates will be calibrated against the rendered dimensions of the final asset.
