---
name: Tactical Robotics Dashboard
colors:
  surface: '#faf8ff'
  surface-dim: '#ccd9ff'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2ff'
  on-surface: '#0a1a3a'
  on-surface-variant: '#424754'
  inverse-surface: '#213050'
  inverse-on-surface: '#edf0ff'
  outline: '#727786'
  outline-variant: '#c2c6d6'
  surface-tint: '#0059c8'
  primary: '#0057c3'
  on-primary: '#ffffff'
  primary-container: '#1f6feb'
  on-primary-container: '#fffcff'
  inverse-primary: '#afc6ff'
  secondary: '#006e2c'
  on-secondary: '#ffffff'
  secondary-container: '#88f799'
  on-secondary-container: '#00722f'
  tertiary: '#ba0c17'
  on-tertiary: '#ffffff'
  tertiary-container: '#de2e2d'
  on-tertiary-container: '#fffcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#8bfa9c'
  secondary-fixed-dim: '#6fdd82'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000d'
  background: '#faf8ff'
  on-background: '#0a1a3a'
  surface-variant: '#d9e2ff'
typography:
  display-timer:
    fontFamily: JetBrains Mono
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.04em
  display-timer-mobile:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  mono-metric-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-md: 1rem
  margin: 0.75rem
  margin-md: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for mission-critical robotics competition pit crews, field operators, and drive teams. It serves operators under extreme cognitive load, severe time constraints, and bright arena lighting conditions where visual ambiguity causes match failure. 

The aesthetic is high-contrast, utilitarian, and technical. It rejects ornamental trends, frosted surfaces, deep ambient blurs, and skeuomorphic lighting in favor of hyper-legible tabular layouts, deterministic status states, and precise instrument clusters. Every element must be identifiable in peripheral vision within 100 milliseconds. Information density is prioritized over decorative whitespace, presenting complete operational telemetry, robot actuation states, and match clocks without paging or occlusion.

## Colors

The palette operates under strict functional segmentation:

- **Canvas & Surfaces:** Primary application background is `#F4F6F8` (Light Gray), providing a low-glare surface for high-lumen arena environments. Interactive cards and panels sit on pure `#FFFFFF` surfaces with `#D9DEE5` structural borders.
- **Base Typography & Chrome:** Core text, critical headings, and inactive instrument frames utilize `#1B2A4A` (Dark Navy) for maximum contrast against light surfaces.
- **Alliance & Robot Entity Roles:**
  - **Robot Blue:** `#1F6FEB` (Primary) designates Alliance Blue telemetry, primary actuation triggers, and selected field controls.
  - **Robot Green:** `#2A9D4B` (Secondary) indicates autonomous subsystem locks, nominal operational readiness, and Alliance Green tracking.
  - **Robot Red:** `#D62828` (Tertiary) designates Alliance Red telemetry, mechanical bypasses, and active payload deployments.
- **Diagnostic & Match Safety:**
  - **Warning Yellow:** `#E0A100` signals packet drop, thermal climb, and current spike warnings.
  - **Danger / Disqualification Red:** `#B42318` strictly signals field faults, immediate E-STOP events, communication cutoffs, and match disqualifications.

## Typography

The type hierarchy employs three distinct typefaces serving explicit ergonomic functions:

- **JetBrains Mono** handles all metrics, dynamic match countdown timers, Cartesian coordinates, velocity charts, and bus logs. Tabular figures (`tnum`) and slashed zeros (`zero`) are globally enforced to eliminate layout jitter during high-frequency telemetry updates.
- **Space Grotesk** is reserved for panel titles, subsystem modules, match states, and primary diagnostic status headers. Its technical geometry complements the hardware environment.
- **IBM Plex Sans** delivers ultra-clean legibility for operational instructions, diagnostic lists, configuration labels, and field notes.

All metric labels (`mono-label` and `label-caps`) default to uppercase presentation for immediate parsing.

## Layout & Spacing

The dashboard operates on a strict, space-efficient 12-column layout grid on desktop and multi-monitor driver stations, adapting to an 8-column layout on field tablets and 4 columns on hand-held diagnostic monitors:

- **Desktop (>= 1280px):** 12 columns, 16px (`gutter-md`) gutters, 24px (`margin-md`) margins. Density allows triple-column telemetric layouts: Left rail (Robot selection & match status), Center display (Field map, path tracing, real-time odometry), Right rail (CAN-bus health, motor thermals, pneumatic pressures).
- **Tablet (768px - 1279px):** 8 columns, 12px (`gutter`) gutters, 16px margins. Telemetry panels stack vertically underneath the primary field visualization canvas.
- **Mobile Handheld (< 768px):** 4 columns, 8px gutters, 12px margins. Dedicated single-stream status readout prioritized by severity: E-STOP and vital battery voltage pinned to top edge.

Padding inside component panels remains compact (`space-sm` to `space-md`) to ensure zero vertical scrolling is required for vital match metrics.

## Elevation & Depth

This design system strictly disallows blurred drop shadows, multi-tier ambient shadows, and translucent frosted glass overlays. Elevation and visual hierarchy are communicated strictly through:

- **Solid Structural Outlines:** Every container, sensor widget, and panel uses a continuous 1px solid border (`#D9DEE5`).
- **Surface Layering:** 
  - Level 0 (Canvas Base): `#F4F6F8`
  - Level 1 (Panels & Instrument Cards): `#FFFFFF`
  - Level 2 (Inset Data Wells & Monospace Code Feeds): `#EDF1F5` with a 1px `#D9DEE5` stroke.
  - Level 3 (Active Overlays / Safety Dialogs): `#FFFFFF` with a 2px `#1B2A4A` high-contrast outer keyline and an immediate flat `0px 4px 0px #1B2A4A` technical drop.
- **Focus & State Outlines:** Active components utilize sharp, 2px solid indicator rings with a 1px offset, using the respective functional robot color token.

## Shapes

Corner rounding across the entire interface is standardized to 8px (`0.5rem`, level 2):

- **Panels, Cards, and Modals:** Fixed 8px border radius. This maintains an engineered, instrument-like silhouette while preventing visual harshness.
- **Interactive Controls (Buttons, Inputs, Selectors):** Uniform 8px radius to maintain optical rhythm with parent cards.
- **Telemetry Chips & Badges:** 4px radius (`rounded-sm`) for compact internal tags to preserve rectangular density inside crowded metric tables.
- **Absolute Exceptions:** Circular elements are strictly reserved for radial gauges, emergency indicators, and live field robot positions.

## Components

### Buttons & Trigger Actions
- **Primary Operational:** Background `#1F6FEB`, label `#FFFFFF`, 8px border radius, 0px border. Padding: 10px 16px. Height: 40px. Monospace or uppercase bold text.
- **Secondary / Utility:** Background `#FFFFFF`, label `#1B2A4A`, border 1px solid `#D9DEE5`. Hover: background `#EDF1F5`.
- **E-STOP / Hazard Action:** Background `#B42318`, label `#FFFFFF`, font weight 700. Active state uses 2px solid `#1B2A4A` inset ring.
- **Alliance Selection Switchers:** Segmented buttons wrapped in `#D9DEE5` 1px border; active item takes the corresponding `#2A9D4B`, `#1F6FEB`, or `#D62828` background with pure white typography.

### Input Fields & Numeric Steppers
- Background `#FFFFFF`, 1px solid `#D9DEE5` border, 8px radius, text `#1B2A4A`.
- Active focus state: 1px solid `#1F6FEB` with an explicit 2px external ring in `#1F6FEB` at 20% opacity or a sharp 2px solid `#1F6FEB` outline.
- Monospace values for manual offset adjustments (e.g., Gyro trim, autonomous delays) accompanied by inline 1px bordered `+` / `-` buttons.

### Telemetry Cards & Metric Blocks
- Background `#FFFFFF`, 1px solid border `#D9DEE5`, 8px radius.
- Padding: 12px.
- Internal structure: `mono-label` label at top in `#1B2A4A` (opacity 70%), centered or left-aligned `mono-metric-lg` value in tabular figures, followed by a compact trend line or sub-bar indicator.

### Status Chips & Badges
- Non-interactive telemetry status labels (e.g., `CAN: OK`, `VOLTS: 12.6V`, `ESTOP: ARMED`).
- Height: 22px, border-radius: 4px, font: `mono-label`.
- Green chip: Background `#E8F5E9`, text `#2A9D4B`, border 1px solid `#2A9D4B`.
- Yellow chip: Background `#FFF9E6`, text `#E0A100`, border 1px solid `#E0A100`.
- Danger chip: Background `#FEECEB`, text `#B42318`, border 1px solid `#B42318`.

### Lists & Data Grids
- Stripped of heavy zebra striping. Rows delineated exclusively by 1px solid `#D9DEE5` horizontal lines.
- Fixed cell heights (32px compact, 40px standard) with JetBrains Mono tabular digits right-aligned for all numerical parameters.

### Checkboxes & Toggle Switches
- Checkboxes: 16x16px box, 4px border radius, 1px solid `#1B2A4A`. Checked state fills `#1B2A4A` with a crisp white check icon.
- Toggles: 36x20px capsule track, 1px solid `#D9DEE5`, sliding indicator disk (16px). Active tracks fill with the designated operational token (`#2A9D4B` for subsystem enabled, `#1F6FEB` for auto-routine locked).