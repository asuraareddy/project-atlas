---
version: alpha
name: Devin Minimal Pro
description: A light, high-trust product system with restrained contrast, soft surfaces, and a calm editorial voice.
colors:
  primary: "#191919"
  secondary: "#6F6F6F"
  tertiary: "#B8B8B8"
  neutral: "#F8F8F8"
  surface: "#FFFFFF"
  on-surface: "#191919"
  accent: "#317CFF"
  border: "#00000014"
  success: "#1FAE5B"
  error: "#E5484D"
typography:
  headline-display:
    fontFamily: "Nb International Pro"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: "41.6px"
    letterSpacing: "-1.2px"
  headline-lg:
    fontFamily: "Nb International Pro"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: "41.6px"
    letterSpacing: "-1.2px"
  headline-md:
    fontFamily: "Nb International Pro"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: "30px"
    letterSpacing: "-0.2px"
  headline-sm:
    fontFamily: "Nb International Pro"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Nb International Pro"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "27px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Nb International Pro"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "22.4px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Nb International Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Nb International Pro"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "22.4px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Nb International Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Nb International Pro"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
  code-md:
    fontFamily: "IBM Plex Mono"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 110px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "13px 20px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "13px 20px"
    height: "42px"
  button-secondary-border:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "13px 20px"
    height: "42px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "4px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Devin Minimal Pro

## Overview
Devin presents as calm, polished, and highly functional, with a light editorial tone rather than a flashy SaaS aesthetic. The interface feels spacious and trustworthy, aimed at technical and product-focused audiences who value clarity, speed, and credibility. Visual hierarchy is driven more by typography, whitespace, and subtle tonal separation than by heavy decoration.

## Colors
- **Primary (#191919):** The deep charcoal used for headlines, primary navigation, and high-emphasis text. It gives the brand a serious, product-led feel without looking harsh black everywhere.
- **Secondary (#6F6F6F):** A softened neutral for supporting copy, helper text, and secondary metadata. It keeps dense content readable while preserving the quiet visual tone.
- **Tertiary (#B8B8B8):** A light neutral for borders, dividers, and subdued UI affordances. It helps structure the layout without adding visual noise.
- **Neutral (#F8F8F8):** The main canvas color, used for the page background and muted cards. This near-white gray makes the interface feel airy and premium.
- **Surface (#FFFFFF):** The pure white surface for elevated containers and form fields. It provides contrast against the neutral background while staying minimal.
- **Accent (#317CFF):** A vivid but controlled blue used for actionable highlights and status accents. It adds energy without competing with the black-and-white core palette.
- **Border (#00000014):** A very light translucent border tone for outlines on secondary buttons and subtle separators. It reinforces structure in an almost invisible way.
- **Success (#1FAE5B):** A restrained green for positive status indicators and progress cues. It supports product messaging without becoming a dominant brand color.
- **Error (#E5484D):** A clear alert red for destructive or invalid states. It should remain sparing and functional.

## Typography
Devin uses **Nb International Pro** as the primary voice: neutral, modern, and slightly editorial. Headlines are set at 40px, 32px, 25px, and 20px with light 400 weight and tight negative letter spacing in the larger sizes, creating a refined but not overly stylized presence. Body text stays at 16px with generous 22.4px line height for comfortable reading across dense interface panels.

Labels and buttons follow the same family and remain unbolded, which keeps the system feeling calm and consistent instead of aggressive. The system should avoid all-caps UI labels unless absolutely necessary; the source leans on sentence case and restrained spacing rather than shouty navigation. For code or technical metadata, **IBM Plex Mono** can be used to distinguish structured content from prose.

## Layout
The layout is expansive and centered, with large outer margins and strong horizontal breathing room. Content tends to sit in broad, fixed-max-width sections rather than a rigid dense grid, allowing the hero and product mockups to feel cinematic. The spacing scale is straightforward: 6px for fine adjustments, then 16px, 24px, and 40px for component and section rhythm, with 110px reserved for major vertical separation.

Use generous padding around cards and panels, but keep internal spacing modest so complex product screenshots remain legible. Section composition should prioritize asymmetry, with one dominant narrative column and supporting visual modules offset to the side or below. Containers should feel centered and clean, never cramped.

## Elevation & Depth
Depth is minimal and selective. The design relies on soft shadows, tonal contrast, and overlapping layers rather than strong drop shadows or heavy borders. The main card treatment uses a large, diffuse shadow to lift product panels from the pale background, while most other surfaces remain flat and quiet.

Borders should be faint or absent unless needed for input or button definition. Elevated elements can use the white surface token against the neutral background to create separation without losing the understated aesthetic. Avoid stacking multiple shadow styles; one subtle shadow level is enough.

## Shapes
The shape language is soft and friendly, but not bubbly. Buttons use fully rounded pill corners, while cards and interface panels use a modest 10px radius for a clean architectural feel. Smaller UI elements should stay consistent with this restrained rounding rather than introducing sharp corners or highly playful curves.

Overall, the system feels smooth, modern, and precise. Rounded forms are used to reduce friction and support approachability, not to create a consumer-app whimsy.

## Components
**Buttons:** Primary actions use `button-primary` with a black fill, white text, pill rounding, and compact vertical padding. Secondary actions use `button-secondary` on a white surface with a light border, matching height and radius to primary buttons so they read as peers. Link-style actions should use `button-link` only when the action is clearly tertiary and non-destructive. Hover states should stay subtle; invert or deepen tone rather than introducing color flashes.

**Cards:** Use `card` for surface containers that need lift or framing. Cards should keep the background near-white, rounded corners at `rounded.md`, and minimal internal padding unless the content is especially dense. Strong shadows are acceptable only for layered product previews or hero compositions.

**Inputs:** Inputs should feel quiet and stable, using white surfaces, light borders, and `rounded.full` or similarly soft corners where the control is pill-like. Text inside inputs should use body-sized typography with strong contrast. Focus states should rely on clear outline or accent-color emphasis rather than dramatic fills.

**Chips and badges:** Chips should remain small, low-contrast, and functional, often using the neutral background with secondary text. They should never overpower primary CTAs or section titles. Use them for metadata, categories, or lightweight status labels.

**Navigation:** Top navigation is minimal and text-led, with small indicators for dropdown items. Keep nav items lightweight and avoid heavy tabs or boxed states. The header should remain visually quiet so the hero can carry the page.

**Status and metadata:** Success indicators should use the success green sparingly, mainly for approval states or positive changes. Error states should be direct and readable, but not visually loud. Technical labels and counts can use the mono style when they need to feel system-like or diagnostic.

## Do's and Don'ts
- Do keep the page airy, with generous whitespace and clear separation between major zones.
- Do use black, white, and soft gray as the foundation, with accent blue only for meaningful emphasis.
- Do favor light-weight typography and sentence case for a calm, editorial product voice.
- Do keep buttons pill-shaped and consistent in height across primary and secondary actions.
- Do use subtle shadows and faint borders instead of heavy elevation or thick outlines.
- Don't introduce saturated brand colors beyond the established accent and status tones.
- Don't use bold headline weights or overly compressed tracking that makes the interface feel aggressive.
- Don't add decorative gradients, neon effects, or overly rounded cartoon-style components.