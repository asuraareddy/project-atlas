---
version: alpha
name: Crazy Games Dark
description: A dense, high-energy gaming portal with a dark foundation, vivid accent colors, and bold arcade-style typography.
colors:
  primary: "#7361FF"
  secondary: "#A48EFF"
  tertiary: "#F9FAFF"
  neutral: "#0C0D14"
  surface: "#151722"
  on-surface: "#FFFFFF"
  error: "#FF4D4F"
  border: "#374151"
  text-muted: "#9CA3AF"
  chip-blue: "#2F3148"
typography:
  headline-display:
    fontFamily: "APK Protocol"
    fontSize: 24px
    fontWeight: 900
    lineHeight: 31px
    letterSpacing: 0px
  headline-lg:
    fontFamily: "APK Protocol"
    fontSize: 22px
    fontWeight: 900
    lineHeight: 26px
    letterSpacing: 0px
  headline-md:
    fontFamily: "APK Protocol"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  headline-sm:
    fontFamily: "APK Protocol"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: "APK Protocol"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: "APK Protocol"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: "APK Protocol"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  label-lg:
    fontFamily: "APK Protocol"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: "APK Protocol"
    fontSize: 14px
    fontWeight: 800
    lineHeight: 18px
    letterSpacing: 0px
  label-sm:
    fontFamily: "APK Protocol"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 14px
    letterSpacing: 0px
  button:
    fontFamily: "APK Protocol"
    fontSize: 14px
    fontWeight: 800
    lineHeight: 16px
    letterSpacing: 0px
  nav-item:
    fontFamily: "APK Protocol"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 30px
  full: 9999px
spacing:
  xs: 2px
  sm: 10px
  md: 14px
  lg: 18px
  xl: 60px
  gutter: 16px
  section: 24px
  page: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.chip-blue}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 8px 16px
    height: 48px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 8px 16px
    height: 48px
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 12px 16px
    height: 44px
  chip:
    backgroundColor: "{colors.chip-blue}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 10px 14px
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.nav-item}"
    rounded: "{rounded.md}"
    padding: 10px 12px
---
# Crazy Games Dark

## Overview
Crazy Games uses a playful arcade-first personality wrapped in a modern dark interface. The experience is optimized for fast browsing and high content density, serving gamers who want quick discovery rather than editorial reading. The tone is energetic, loud, and confident, with strong contrast and saturated accents that keep the UI feeling fun and responsive.

## Colors
- **Primary (#7361FF):** A vivid violet used for active states, category accents, and brand energy. It gives the interface its signature gaming feel without overpowering the content.
- **Secondary (#A48EFF):** A lighter purple used for links, secondary buttons, and subtle emphasis. It complements the primary accent while staying legible on the dark canvas.
- **Tertiary (#F9FAFF):** A near-white highlight used for primary CTA fills and bright contrast moments. It reads as crisp and optimistic against the dark background.
- **Neutral (#0C0D14):** The core background tone, a near-black navy that supports the content-heavy layout and helps colorful game thumbnails stand out.
- **Surface (#151722):** A slightly lifted dark panel color for inputs, cards, and control surfaces. It creates separation without breaking the dark theme.
- **On-surface (#FFFFFF):** The main text color, used for headlines, labels, and high-contrast iconography.
- **Error (#FF4D4F):** Reserved for alerts, badges, and notification cues, such as the red count dot in the header.
- **Border (#374151):** A restrained border tone for subtle dividers and card outlines when structure is needed.
- **Text-muted (#9CA3AF):** A softer gray for secondary metadata and inactive navigation items.
- **Chip-blue (#2F3148):** A deep blue-gray used for compact controls and dark pill components that need to feel clickable but understated.

## Typography
The UI is built on APK Protocol, a compact, bold sans-serif that feels game-native and highly legible at small sizes. Headlines use very heavy weights, especially `headline-display` and `headline-lg`, to create a punchy, arcade-like hierarchy. Body text stays simple and efficient with medium sizes and comfortable line heights for scanning.

Labels and buttons lean heavier than body text, reflecting the product’s emphasis on fast action and strong calls to action. There is little to no letter-spacing styling; the system relies on weight, size, and contrast rather than uppercase tracking tricks. Use `headline-*` for section titles, `body-*` for supporting copy, and `label-*` or `button` for interactive controls.

## Layout
The layout is a dense, left-anchored browsing experience with a fixed sidebar and a wide content canvas. Rows of game cards stretch horizontally, creating a grid that feels more like a streaming library than a traditional article page. Section spacing is moderate: compact vertical rhythm inside rows, with larger breaks between major content bands.

Padding is conservative so the page can surface many thumbnails at once without feeling cramped. The spacing scale favors small increments like 2px, 10px, 14px, and 18px, with a larger 60px step for major separation. Cards and controls generally use 16px internal padding, while pills and buttons use tighter horizontal padding for speed and clarity.

## Elevation & Depth
Depth is achieved primarily through contrast, not heavy shadow layering. The dark background, lifted surface panels, and vivid thumbnail art do most of the work. Shadows are minimal to absent in the system, so hierarchy comes from color blocking, borders, and the obvious visual weight of image tiles.

When emphasis is needed, use strong fills, subtle borders, and badge contrast rather than dramatic blur or glow. The result is a flat-but-rich interface that stays performant and lets game artwork remain the visual hero.

## Shapes
The shape language is soft and modern, with rounded rectangles dominating cards, pills, and buttons. The most common interactive radius is `rounded.xl` at 30px, giving controls a friendly capsule feel. Secondary surfaces use smaller radii like 8px and 12px to keep content blocks tidy and modular.

This combination creates a “playful but organized” personality: rounded enough to feel accessible, structured enough to handle dense browsing. Avoid sharp corners on primary UI elements unless they are purely structural dividers.

## Components
Buttons are pill-shaped and bold. `button-primary` should use the bright tertiary fill with dark text, `button-secondary` should use the purple family for softer emphasis, and `button-link` should remain transparent with underline styling for low-priority actions. Button height is typically 48px, with 8px vertical and 16px horizontal padding, and text should stay semibold to extra-bold for quick scanning.

Cards should be dark, compact, and content-forward. Use `card` for bordered content blocks and `card-elevated` when a slightly lifted surface is needed, but avoid heavy shadows. Game tiles and section panels should prioritize image coverage, with rounded corners and minimal ornamentation.

Inputs match the same rounded capsule feel as buttons, using a dark surface background, white text, and a generous horizontal padding of 16px. Search fields should feel prominent but not intrusive, with subtle contrast against the header. Placeholder and inactive text should fall back to muted gray rather than introducing extra decoration.

Chips and category pills are a core pattern on the page. They should be compact, brightly colored or dark-filled depending on priority, and sized for fast tap targets. Navigation items are understated by default, with active states signaled through brighter text, accent icons, or stronger background contrast rather than heavy outlines.

Lists and sidebar items should stay vertically compact with clear icon/text alignment. Notification badges should use the error color for urgency, and dividers should be thin, low-contrast separators that keep the interface organized without dominating it.

## Do's and Don'ts
- Do keep the interface dark, high-contrast, and content-first.
- Do use bold APK Protocol headings and heavier label weights for interactive elements.
- Do rely on rounded pills and compact cards to match the gaming browse experience.
- Do emphasize active states with accent color, bright fills, or badges rather than complex effects.
- Don't introduce large amounts of whitespace that reduce the sense of content density.
- Don't use heavy shadows or glossy skeuomorphic treatments; keep depth mostly flat.
- Don't switch to thin, elegant typography; the system should remain chunky and energetic.
- Don't make sidebar or chip states too subtle, or the fast-navigation feel will be lost.
