# 12 — PWA, Mobile UX & Performance Optimization

## 1. Goals

Deliver a reliable, installable, mobile-first experience that loads quickly over average mobile connections and remains safe when connectivity is weak. PWA is a presentation/distribution enhancement, not a substitute for server-authoritative gaming or payment controls.

## 2. PWA requirements

- Valid web app manifest: name, short name, icons, start URL, scope, display mode, theme/background colours and app screenshots if helpful.
- HTTPS in production; service worker uses a reviewed offline/cache policy.
- Install prompts are progressive enhancements, not blocking modals.
- Responsive layouts for small phones, tablets and desktop.
- App-like navigation with accessible focus, back navigation and clear connection state.
- Update notification/reload path when a new service worker is waiting; avoid silently mixing assets and API assumptions.
- Web push only with explicit permission and approved message/campaign rules; suppress restricted users where required.

## 3. Cache policy (critical)

| Resource | Cache strategy | Notes |
|---|---|---|
| Hashed JS/CSS/fonts/icons | Cache-first with long immutable lifetime | Versioned filenames; size-budgeted |
| Public help/game rules (published version) | Stale-while-revalidate or network-first | Display published version and update timestamp |
| Public images | Cache-first with size/lifetime limits | Optimised formats, CDN |
| Player profile | Network-first or no-store for sensitive fields | Revalidate auth and status |
| Wallet balances and transaction state | Network-only / no-store | Never show old cached value as current; show “refreshing” when needed |
| Deposits/withdrawals | Network-only | No offline creation/approval |
| Game action/session state | Network-only/realtime; safe in-memory resilience only | No offline wager submission; server resolves ambiguous request by idempotency key |
| Admin pages, KYC, risk cases, audit exports | No shared cache; generally network-only | Prevent cross-user/device leakage |
| API auth/identity endpoints | No-store | Avoid caching tokens or sensitive responses |

The app may cache non-sensitive shell assets for launch/offline help but must not support offline betting, payment, payout or authoritative game result display.

## 4. Performance targets

Production-like field targets (75th percentile where sufficient field data exists):
- LCP <= 2.5 seconds.
- INP <= 200 milliseconds.
- CLS <= 0.1.
- Initial JS kept small; route-level splitting and lazy loading for game engines/admin charts.
- Common read API P95 <= 300 ms at defined baseline load, excluding third-party provider latency.
- Game action latency budget set per game; custom regional realtime baseline P95 <= 150 ms where practical.

Targets are initial acceptance thresholds, not a promise; measure on actual devices and network profiles.

## 5. Frontend optimization practices

- Use server components for public/static data where compatible; keep client components small.
- Split game UI by route and load game-specific engines only when user opens that game.
- Use `next/image` or equivalent image optimisation, responsive sizes and modern formats.
- Avoid giant UI component libraries and duplicate date/chart packages; audit bundle size.
- Import icons individually; tree-shake; remove unused dependencies.
- Defer analytics, chat widgets and non-critical integrations until after initial interaction.
- Reserve media dimensions to prevent layout shift; render loading skeletons with stable geometry.
- Virtualise long transaction/ledger/audit lists.
- Debounce filters, paginate server-side, avoid polling every player on dashboards.
- Use optimistic UI only for reversible, non-financial preferences; never optimistically credit money or claim a bet accepted before server confirmation.

## 6. Realtime games and network recovery

- Use WebSockets/provider SDK with ping/pong, reconnect backoff and authenticated resume token.
- Use a monotonically increasing server sequence/version so clients can discard stale updates.
- On reconnect, fetch authoritative server state before accepting the next action.
- If an action request times out, query by idempotency/client action ID; do not blindly submit a duplicate stake.
- If state can't be reconciled, put the session in recovery state and follow the published game policy.
- Show connectivity loss clearly and disable actions that cannot be safely validated.

## 7. Accessibility and inclusive design

- Target WCAG 2.2 AA with independent review.
- Keyboard support for admin and game lobby; visible focus indicators.
- Semantic headings, labels, form errors and accessible status announcements.
- Meet contrast requirements; don't communicate only with colour.
- Respect reduced motion and avoid flashing/attention-grabbing patterns.
- Touch targets comfortably sized; avoid overlapping buttons on mobile.
- Game animations must not block required text, controls or safer-gambling tools.

## 8. PWA test matrix

- Current major desktop browsers and iOS Safari/iOS home-screen PWA.
- Android Chrome install, standalone mode, updates and offline shell.
- Intermittent network, airplane mode, tab suspension, OS kill and restored tab.
- Expired session while installed; account restriction while app is backgrounded; logout and device sharing.
- Deep link directly into a game while ineligible.
- Service worker update while a game is open.
- Payment redirect back to the app with delayed/missing webhook.
- No stale wallet or sensitive admin content visible after logout/account switch.
