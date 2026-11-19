# 19 — Matka UI and API Mapping Specification

## 1. Reference status

Reference supplied: `https://dream10.in/matka.html`.

The exact page timed out during direct retrieval. Current search indexing for the root domain did not reliably expose that specific Matka page, so this document does **not** claim a pixel-perfect inspection. Use it as a reference URL, then confirm the intended layout with screenshots or a successful page capture before final design sign-off. Do not copy its branding, assets or wording without permission.

The following is a recommended API-driven UI structure informed by common market-lobby/result-chart patterns. Actual fields, labels and flow are controlled by the client's provider API, product decisions and approved game rules.

## 2. Matka landing/lobby page

### Desktop structure
- Header: operator logo, main navigation, wallet summary (only for authenticated/eligible player), profile/support controls.
- Game category navigation: Matka, Ludo, Carrom, Pool; only show categories enabled for the operator and player.
- Page title and short explanation/help entry.
- Market filters: search, status filter (All/Open/Closed where supported), category/market group, refresh/last updated.
- Market card/grid/list: market name, status badge, opening and closing times (market timezone clearly defined), cutoff countdown only when reliably calculated, latest result only if confirmed, and a “View market” action.
- Responsive result/chart section or market detail route.
- Footer/help with published rules, account support and safer-gambling controls.

### Mobile structure
- Compact header with menu and wallet summary.
- Horizontally scrollable category chips only if accessible; never hide critical actions inside gesture-only UI.
- One-column market cards with large tap targets and stable card height.
- Sticky bottom navigation only if it does not cover page content, game controls, support links or required disclosures.
- Chart uses a horizontally scrollable table with clear headers or a mobile-friendly date-row layout; announce scrollability to assistive technology.

## 3. Market card field map

| UI element | Internal field | Mapping rule |
|---|---|---|
| Market title | `name` | API field normalized by adapter; no hard-coded market names in components |
| Status | `status` | Map documented statuses; unknown values display safe fallback and trigger telemetry |
| Open time | `opensAt` | Convert from documented source timezone to operator display policy; preserve source timezone metadata |
| Close/cutoff time | `closesAt` / `cutoffAt` | Do not infer cutoff from close time unless rules explicitly say they are equivalent |
| Countdown | server time + cutoff | Client may render countdown, but server enforces cutoff |
| Latest result | `latestResult.values` + status | Display only with valid finality/source state; show corrected/void state per policy |
| Last updated | `lastUpdatedAt` | Use API timestamp, not page-load time, to claim source freshness |
| Chart action | capability flag | Hide/disable when chart/history capability is absent |
| Play/participate action | capability + eligibility | Display only when provider supports it and platform eligibility allows it |

## 4. Market detail page

- Market name and current status.
- Schedule/timing in the documented timezone.
- Latest published result and source update timestamp.
- Supported entry/participation types returned by the API; show only documented options.
- Provider/API-driven validation errors and server-confirmed submission status.
- Tabs/links for Results, Chart/History, Rules and My Activity, subject to API capabilities.
- No fabricated odds, payout multipliers, entry types, result values or timing labels.

## 5. Charts and history

- Choose chart type only from API-supported chart types or approved internal projections.
- Server-side pagination and date filters for large histories.
- Keep the provider's source result ID and publication timestamp associated with each row.
- Unknown or unpublished result values should render as “Not available” or the provider-approved label, not as zero.
- Corrected/void records should remain traceable; the UI can show the current official value plus correction history where required.
- Chart data should be responsive, accessible and understandable without colour alone.

## 6. Participation flow (API-dependent)

1. Check player eligibility and market status through platform services.
2. Fetch entry/participation types and validation metadata from the adapter.
3. Player selects an allowed option and inputs the required value(s); frontend validation is helpful but not authoritative.
4. Show review summary according to the approved rules before final confirmation.
5. Backend repeats eligibility, market status, cutoff, limits, balance/reservation and input validation.
6. Submit through the documented provider flow with idempotency. Store a platform command ID before any retry.
7. Show `Pending` until the provider/platform confirms. If response times out, query/reconcile by idempotency/reference before enabling another submission.
8. Show a receipt with platform ID, provider reference where safe, status, timestamp and support/dispute route.
9. Final result and settlement are driven by verified provider events and platform ledger records.

Do not implement provider-specific game terminology or bet formats until the API/rules documents are available. This plan intentionally does not invent them.

## 7. Visual design direction

- UK-facing, clean, premium, high-trust interface.
- Strong information hierarchy: market name > status/time > result summary > navigation/action.
- Use restrained colour for status, readable contrast and consistent typography.
- Avoid blinking, flashing or pressure-oriented countdown design. Countdown exists for clarity only and is not the authority for cutoff.
- Avoid dense all-caps text and tiny tables. Use accessible chart legends and keyboard/focus states.
- Use skeletons with fixed dimensions to prevent layout shift; replace with explicit empty/error states.
- Keep rules, account support, safer-gambling tools and complaints accessible from game screens.

## 8. Required design inputs from client

1. The actual Matka API specification and sandbox examples.
2. Screenshots or a recording of the exact reference page, especially mobile screens, if the reference must be followed closely.
3. The exact fields and meaning for market, result, chart, schedule, entry types and participation receipts.
4. Brand logo, primary colour and typography, plus any rights/limits for provider assets.
5. Approved rules, cut-off timezone and policy for delayed/corrected/void results.

## 9. Acceptance criteria

- Every displayed market/result field has a documented provider/internal source.
- No market, result, schedule or participation type is fabricated in production.
- Loading, no-data, stale, closed, suspended, corrected, error and offline states are covered.
- Desktop and small-screen layouts are tested; charts do not force the whole page wider than the viewport.
- API timeout never displays false confirmation.
- Server enforces market cutoff and accepted/rejected state regardless of client countdown.
- User-visible result and history reconcile with stored provider references.
