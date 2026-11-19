---
version: alpha
name: Ludo King Playful Arcade
description: A high-energy gaming landing page system with bold cartoon headings, vivid brand yellow, and deep midnight backdrops.
colors:
  primary: "#FBD706"
  secondary: "#04093A"
  tertiary: "#0DBA78"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#212529"
  background: "#08164B"
  text: "#212529"
  border: "#E5E7EB"
  accent-blue: "#0D6EFD"
  accent-red: "#E52424"
  accent-green: "#12A04A"
  error: "#D92D20"
typography:
  headline-display:
    fontFamily: Cartton
    fontSize: 44px
    fontWeight: 300
    lineHeight: 52.8px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Cartton
    fontSize: 34px
    fontWeight: 300
    lineHeight: 41px
    letterSpacing: 0px
  headline-md:
    fontFamily: Cartton
    fontSize: 27px
    fontWeight: 300
    lineHeight: 41px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Poppins
    fontSize: 21px
    fontWeight: 300
    lineHeight: 25px
    letterSpacing: 0px
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: 300
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 300
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: 300
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Cartton
    fontSize: 20px
    fontWeight: 300
    lineHeight: 24px
    letterSpacing: 0px
  label-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 300
    lineHeight: 20px
    letterSpacing: 0px
  label-sm:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: 300
    lineHeight: 16px
    letterSpacing: 0.02em
  nav-item:
    fontFamily: Cartton
    fontSize: 18px
    fontWeight: 300
    lineHeight: 22px
    letterSpacing: 0px
  stat-display:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: 800
    lineHeight: 44px
    letterSpacing: -0.02em
  microcopy:
    fontFamily: Poppins
    fontSize: 13px
    fontWeight: 300
    lineHeight: 18px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 34px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 26px
  lg: 40px
  xl: 60px
  gutter: 24px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.xl}"
    padding: 20px 30px 13px
    minHeight: 93px
    minWidth: 246px
  button-primary-hover:
    backgroundColor: "#FFE84A"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.xl}"
    padding: 20px 30px 13px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 20px 30px 13px
    minHeight: 93px
    minWidth: 246px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.accent-blue}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px 14px
  sidebar-link:
    backgroundColor: "transparent"
    textColor: "{colors.neutral}"
    typography: "{typography.nav-item}"
    rounded: "{rounded.none}"
    padding: 0px
  promo-tile:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.lg}"
    padding: 12px
# Ludo King Playful Arcade

## Overview
Ludo King presents a playful, high-contrast arcade personality built to feel energetic, familiar, and game-like. The page is aimed at a broad casual-gaming audience, so the visual language favors immediate recognition, big calls to action, and cheerful brand storytelling. The tone is loud and optimistic rather than minimal, with dense promotional content balanced by clear spacing between major features.

## Colors
- **Primary (#FBD706):** A vivid, casino-bright yellow used for key CTAs, badges, and highlights. It carries the brand’s upbeat energy and should remain the dominant accent.
- **Secondary (#04093A):** A deep navy ink used for button text and dark contrast elements. It supports readability while preserving the game’s premium, night-sky mood.
- **Background (#08164B):** The midnight blue backdrop that gives the site its cinematic, arcade-at-night atmosphere. Use it for large surfaces and full-page backgrounds.
- **Surface (#FFFFFF):** Pure white used for cards, inset tiles, and content panels that need to pop against the dark background.
- **On-surface (#212529):** The main body text color for readable content on white surfaces. It is neutral and restrained so the accent colors can lead.
- **Text (#212529):** A general dark text token for plain content and interface copy when the exact surface pairing is not critical.
- **Border (#E5E7EB):** A light gray divider color for subtle card outlines and low-emphasis structure.
- **Accent Blue (#0D6EFD):** Used sparingly for links and interactive emphasis, especially in informational text.
- **Accent Red (#E52424):** Reinforces one of the board-game player colors and can be used for alerts or game-specific highlights.
- **Accent Green (#12A04A):** A complementary game color for players, success states, and positive accents.
- **Error (#D92D20):** Reserved for destructive or invalid states; keep it rare in this otherwise celebratory palette.

## Typography
The site combines a custom cartoon display face with a clean sans-serif support stack. Cartton drives the brand personality in headings, nav items, chips, and promotional labels, while Poppins handles body copy, interface text, and supporting details.

Headlines are intentionally oversized and informal, with loose letterforms and a hand-drawn gaming feel. Use `headline-display`, `headline-lg`, and `headline-md` for hero titles and section headings; they should feel bold even at a 300 weight because the font itself is expressive. `headline-sm` and `nav-item` work for smaller promotional phrases and menu items without losing the playful tone.

Body text should stay light, open, and easy to scan. `body-md` is the default reading size, with `body-sm` and `microcopy` for secondary notes and disclaimers. Labels and button text can use either Cartton or Poppins depending on whether the component should feel game-themed or more utilitarian.

The source uses minimal uppercase treatment, relying more on size and contrast than letter spacing. Where emphasis is needed, use strong weight, color contrast, or compact stacked lines rather than wide tracking.

## Layout
The layout is a broad, promotional composition with a left navigation rail, a central hero cluster, and right-side supporting content. It feels horizontally distributed rather than tightly centered, which suits the arcade/landing-page style and gives each major feature its own visual zone.

Spacing follows a generous but not minimalist rhythm: 6px for tight adjustments, 16px for standard separation, 26px for grouped content, 40px for section breathing room, and 60px for major vertical gaps. Use `section` spacing for page-level breaks and `gutter` for internal content alignment.

Cards and panels should use clear padding and plenty of edge distance from the page background. White content blocks should sit inside the dark environment with comfortable margins so the interface remains readable and promotional elements do not feel crowded.

## Elevation & Depth
Depth is created more through color contrast and glow than through heavy physical shadow. The interface uses bright yellow highlights, luminous button treatments, and vivid game artwork to pull attention forward against a dark atmospheric background.

Shadows are generally minimal or absent in the extracted system, so elevation should rely on layered surfaces, outlines, and strong tonal separation. Use light borders on cards and reserve glow-like effects for primary CTAs and feature tiles.

## Shapes
The shape language is soft and friendly, with rounded capsules on primary actions and badges. `rounded.xl` and `rounded.full` define the most common feel for buttons and pills, while cards and panels stay modestly rounded with `rounded.sm` or `rounded.lg`.

Overall, the system feels playful rather than geometric. Avoid sharp corners on major interactive elements unless you are styling small utility links or simple separators.

## Components
Buttons are the most important component family. `button-primary` should be a bright yellow capsule with dark navy text, large padding, and a substantial minimum height so it feels arcade-like and tap-friendly. Use `button-primary-hover` for a slightly lighter yellow hover state that preserves contrast. `button-secondary` is transparent with a visible outline and should be used on dark backgrounds when a less dominant action is needed. `button-tertiary` is a text-style action for links and low-emphasis controls.

Cards should stay clean, white, and lightly bordered, using `card` for content blocks that need structure without heavy elevation. Keep padding comfortable and avoid complex shadows; the surrounding dark page already provides enough contrast. Promotional tiles can follow `promo-tile`, which keeps the same rounded, energetic language but can support stronger color blocking.

Inputs should feel simple and readable, with a white `input` surface, subtle border treatment, and rounded corners. Avoid overly decorative fields; the site’s personality belongs in headline content and calls to action, not in form chrome.

Chips and badges should use the yellow brand color with dark text and pill-shaped rounding via `chip`. They work best for download counts, status callouts, or small promotional flags.

Sidebar links should remain text-only and visually light. `sidebar-link` should feel like part of the navigation rather than like a button, with clear vertical spacing and no heavy container framing.

## Do's and Don'ts
- Do keep the primary CTA bright yellow with dark text for maximum recognition.
- Do use Cartton for expressive headings, nav labels, and game-flavored emphasis.
- Do preserve the dark midnight background when building hero or promo sections.
- Do use generous rounded corners on buttons and badges to maintain the playful tone.
- Don't introduce heavy drop shadows or glassmorphism; the system is more glow-and-contrast than depth-and-blur.
- Don't make body copy as decorative as headings; keep informational text in Poppins for readability.
- Don't flatten all colors into neutral grays; the brand depends on strong yellow, blue, and game-color accents.
- Don't tighten spacing so much that the page feels dense; the design needs room to breathe between promotional blocks.