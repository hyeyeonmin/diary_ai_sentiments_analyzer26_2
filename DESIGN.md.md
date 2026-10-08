---
name: Aura Journal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4e44e3'
  primary: '#3625cd'
  on-primary: '#ffffff'
  primary-container: '#5046e5'
  on-primary-container: '#dbd8ff'
  inverse-primary: '#c3c0ff'
  secondary: '#b90538'
  on-secondary: '#ffffff'
  secondary-container: '#dc2c4f'
  on-secondary-container: '#fffbff'
  tertiary: '#811c6a'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f3783'
  on-tertiary-container: '#ffceea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3422cc'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#ffd8ed'
  tertiary-fixed-dim: '#ffade1'
  on-tertiary-fixed: '#3b002f'
  on-tertiary-fixed-variant: '#7f1a68'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 57px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends Google Material 3 (M3) expressiveness with an empathetic, luminous aesthetic tailored for reflective emotional journaling and AI-driven sentiment insights.

### Personality & Tone
- **Warm & Reassuring:** A sanctuary for personal introspection; the interface feels like open morning light rather than clinical software.
- **Empathetic & Intelligent:** AI interactions suggest curiosity, emotional intelligence, and calm validation rather than cold analytical metrics.
- **Vibrant & Tactile:** Rich, emotive color accents layered over airy tonal surfaces with pill-shaped tap targets that encourage gentle interaction.

### Design Movement
**Material 3 Expressive with Tactile Tonalism:** Leveraging M3's surface-container hierarchy, dynamic pill contours, soft tinted glass highlights, and responsive emotional tokens that adapt visual warmth to the user's recorded sentiments.

## Colors

The palette establishes an uplifting, emotionally expansive environment anchored by a deep luminous indigo primary and vibrant warm accents, reinforced with specific semantic tokens for affective state mapping.

### Semantic Emotion Roles
- **Joy / Gratitude:** `#F59E0B` (Amber) / Light fill: `#FEF3C7` / Text: `#78350F`
- **Calm / Equilibrium:** `#0EA5E9` (Sky Teal) / Light fill: `#E0F2FE` / Text: `#0369A1`
- **Sadness / Reflection:** `#6366F1` (Muted Indigo) / Light fill: `#EEF2FF` / Text: `#3730A3`
- **Anxiety / Overwhelm:** `#8B5CF6` (Violet) / Light fill: `#F5F3FF` / Text: `#5B21B6`
- **Anger / Tension:** `#F43F5E` (Rose Coral) / Light fill: `#FFE4E6` / Text: `#9F1239`

### Surface System (M3 Tone Tiers)
- **Surface (Canvas):** `#F8FAFC`
- **Surface Container Lowest:** `#FFFFFF`
- **Surface Container Low:** `#F1F5F9`
- **Surface Container High:** `#E2E8F0`
- **Surface Tint Overlay:** Translucent `#5046E5` at 4%–8% for elevated tonal cards.

## Typography

The typography unites `Plus Jakarta Sans` for titles and emotionally resonant headlines with `Inter` for uninterrupted, comfortable journal writing and analytical reading.

- **Korean Typography Fallbacks:** Pair seamlessly with `Pretendard`, `Apple SD Gothic Neo`, and `Noto Sans KR` across platforms.
- **Reading Rhythm:** `body-lg` adopts an expanded `26px` line-height to maintain comfortable visual cadence during long-form reflections.
- **Headlines:** Feature subtle geometric curvature to project approachable warmth, avoiding corporate rigidness.

## Layout & Spacing

A responsive 12-column fluid grid system with dedicated layout constraints ensures thoughtful focus during diary drafting and clear data density during mood tracking.

### Grid & Breakpoints
- **Mobile (< 640px):** 4-column layout, `margin: 1rem`, `gutter: 1rem`. Bottom navigation bar and persistent primary reflection floating action pill.
- **Tablet (640px – 1024px):** 8-column layout, `margin-tablet: 2rem`, `gutter-tablet: 1.5rem`. Collapsible sidebar navigation.
- **Desktop (> 1024px):** 12-column layout, `margin-desktop: 3rem`, `gutter-desktop: 2rem`. Maximum content canvas capped at `1280px` centered, with the central journal editor strictly constrained to `720px` for optimal reading and writing focus.

## Elevation & Depth

Visual hierarchy combines M3 tonal surface tiers with soft, ambient indigo-tinted drop shadows and translucent glass backdrops.

- **Level 0 (Flat Canvas):** `#F8FAFC`, zero shadow. Used for the page foundation and background workspace.
- **Level 1 (Resting Cards):** `#FFFFFF` with `0 2px 8px -2px rgba(80, 70, 229, 0.05)`. Used for daily entry preview list items and dashboard summaries.
- **Level 2 (Hover / Active Cards):** `#FFFFFF` with `0 8px 24px -4px rgba(80, 70, 229, 0.08)`. Subtle elevation on interactive journal cards.
- **Level 3 (Modal Sheets & Floating Actions):** `#FFFFFF` with `0 16px 36px -6px rgba(80, 70, 229, 0.12)`. Applied to full AI mood analysis overlays and composer dialogs.
- **Glassmorphism Accent:** `backdrop-filter: blur(16px)` over `rgba(255, 255, 255, 0.85)` with a 1px inner border of `rgba(255, 255, 255, 0.6)` for navigation bars, filter chips bars, and transient AI feedback overlays.

## Shapes

The interface embraces a hyper-rounded, approachable silhouette true to modern Material You ergonomics.

- **Full Pill (`rounded-full`):** Standard for buttons, emotion chips, search bars, AI prompts, and bottom navigation pill indicators.
- **Curved Cards (`rounded-2xl` / `1.5rem` to `2rem`):** All journal content cards, sentiment metric containers, and audio-voice recording panels.
- **Inputs & Fields (`rounded-xl` / `1rem`):** Ambient input forms, textarea wrappers, and modal corners.

## Components

### Buttons
- **Filled Primary:** Pill-shaped (`rounded-full`), `#5046E5` background, `#FFFFFF` text, `0 4px 12px rgba(80, 70, 229, 0.25)` drop shadow. On hover, apply a 6% white overlay with a slight scale transition (`scale-[1.02]`).
- **Tonal (Secondary):** Light violet fill (`#EEF2FF`), `#5046E5` label, zero elevation.
- **Floating Action Pill (Journal Entry):** Extended pill with leading sparkle or pencil icon, `#5046E5` background, high elevation.

### Emotion Chips & Badges
- **Shape:** Complete pill with `space-xs` vertical and `space-sm` horizontal padding.
- **States:** Default state uses the specific emotion's soft background tint with matching high-contrast text. Selected state adds a 1.5px solid border in the dominant emotion color and a scale accent.

### Cards (Journal & Insight)
- **Container:** High-radius (`24px`), `#FFFFFF` surface, wrapped in a 1px border of `rgba(226, 232, 240, 0.6)`.
- **Accent Line / Mood Wash:** Subtle gradient along the top edge or top-left corner corresponding to that entry's primary emotional state.

### Input Fields & Editor
- **Writing Canvas:** Borderless or soft ghost-container (`#FFFFFF`) with generous internal padding (`space-lg`), focusing entirely on large readable typography.
- **Form Controls:** Checkboxes and radio targets use smooth pill-shaped toggles with saturated `#5046E5` active checks.

### AI Insight & Voice Waves (Domain Specific)
- **AI Feedback Card:** Soft gradient border (`linear-gradient(135deg, #6366F1, #F43F5E, #ff88d9)`) surrounding a frosted glass panel (`rgba(255, 255, 255, 0.9)`), accompanied by a warm ambient indigo glow.