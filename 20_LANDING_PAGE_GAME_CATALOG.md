# 20 — Landing Page & Game Catalog Navigation Specification

**Version:** 1.2  
**Status:** Product requirement for the first implementation

## 1. Goal

Keep the landing page clean and easy to understand. The homepage must not show every game or combine all provider content into a single long page. It acts as the main brand landing page and category selector.

## 2. Required homepage catalog

Render exactly these four primary catalog buttons/cards, in this order:

1. **Matka** → `/matka`
2. **Carrom** → `/carrom`
3. **Ludo** → `/ludo`
4. **Other Games** → `/other-games`

These are the only top-level game category cards on the homepage. Do not add individual Matka market cards, Carrom tables, Ludo rooms, Pool matches or every game provider's title to the homepage. Any promotional content on the home page must not recreate a secondary all-games catalogue.

## 3. Suggested page composition

### Header
- Brand logo.
- Login / Register for signed-out visitors; Account / Wallet menu for signed-in players.
- Primary link for Help and a clearly accessible Responsible Gambling / Safer Gambling route.
- Avoid a dense row of every game/provider name in the global header.

### Hero
- One clear headline and brief description of the platform.
- Main CTA may scroll to the four category buttons or navigate to the category selector section.
- No fake live odds, fictional jackpots, made-up player counts or synthetic results.

### Game category selector
- Four prominent responsive cards/buttons, visually distinct but consistent.
- Each card includes category title, a small approved artwork/icon, a concise descriptor, and a clear action such as “Explore Matka” or “Play Carrom” based on the actual product state.
- Button availability is driven by approved server-side category configuration. If a category is disabled or under maintenance, show a truthful disabled/maintenance state, not a working play CTA.
- Preserve the specified order unless a product-owner change is approved.

### Trust and support section
- Brief links to game rules, account security, payments/crypto deposit guidance where relevant, help/complaints, terms and safer-gambling tools.
- Do not promise guaranteed wins, risk-free earnings, or misleading returns.

### Footer
- Operator-provided legal and contact details, terms, privacy, cookie choices, complaints, safer-gambling and customer support routes. Do not invent licence numbers or legal copy.

## 4. Category route contract

| Route | Content loaded on route | Must not be loaded on homepage |
|---|---|---|
| `/matka` | Matka API-backed markets, schedule, results, chart/history and supported participation actions | Market list, results, charts, participation controls |
| `/carrom` | Carrom provider's approved titles/modes, session lobby and game launch | Carrom tables, rooms, SDK bundle |
| `/ludo` | Ludo provider's approved titles/modes, room/session lobby and game launch | Ludo rooms, tables, SDK bundle |
| `/other-games` | Admin-enabled additional game categories/titles only | Full other-game catalog, provider-specific feeds |

The `Other Games` page is the extensible category page; the homepage remains exactly four category choices even when more games are added.

## 5. Data/API contract

The homepage should request only a small, server-approved category response. Suggested shape:

```json
{
  "categories": [
    { "key": "matka", "label": "Matka", "route": "/matka", "enabled": true, "status": "available" },
    { "key": "carrom", "label": "Carrom", "route": "/carrom", "enabled": true, "status": "available" },
    { "key": "ludo", "label": "Ludo", "route": "/ludo", "enabled": true, "status": "available" },
    { "key": "other-games", "label": "Other Games", "route": "/other-games", "enabled": true, "status": "available" }
  ]
}
```

This is a proposed platform DTO, not a provider endpoint. API may include display order, artwork reference, description and maintenance message. The backend enforces category/game enablement; hiding a disabled button in UI alone is not sufficient authorization.

## 6. UX and responsive behavior

- Desktop: four cards in one row when space permits; otherwise use a balanced 2×2 layout.
- Mobile: large touch targets stacked or in a 2×2 grid as screen width allows, with labels always visible.
- Keyboard/screen reader: use semantic links/buttons, visible focus, meaningful accessible names and correct disabled semantics.
- Deep links work after login and after browser refresh. Browser back/forward behaves normally.
- Category content is lazy-loaded after navigation; use route-level code splitting for provider SDKs, charts and WebSocket clients.
- Do not rely on a homepage carousel to hide categories; all four must be discoverable without horizontal scrolling on common mobile screens.

## 7. PWA and caching

- Cache versioned shell assets and category shell layout only.
- Category availability may be cached briefly only if marked as potentially stale and revalidated on navigation; authoritative enabled/maintenance status comes from the server.
- Do not cache player balances, deposit states, game results, market results, live rooms or game actions as offline truth.
- Direct category URLs must work from an installed PWA; unknown routes get a graceful not-found screen.

## 8. Acceptance criteria

- The homepage contains exactly four primary game catalog buttons in the required order.
- Detailed games/markets/rooms are absent from homepage HTML and initial API payload.
- Each button routes to its own category page and refresh/deep-link works.
- Each category loads only its own provider data and bundles; `Other Games` only displays admin-enabled items.
- Disabled category/game never launches through direct URL/API.
- Mobile, desktop, keyboard, screen-reader and standalone PWA navigation pass QA.
- No fake result, made-up availability, or invented game data is shown when a provider is down.
