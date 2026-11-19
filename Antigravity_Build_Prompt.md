# 16 — Simple Antigravity / AI Coding Prompt

Build a production-minded, mobile-first multi-gaming platform using the specifications in this documentation pack. Read `README.md` first, then `BRD`, `PRD`, `FRD`, `TRD`, `SYSTEM_ARCHITECTURE`, `ROLES_RBAC`, `WALLET_PAYMENTS_LEDGER`, `SECURITY_COMPLIANCE` and `PWA_PERFORMANCE` before coding.

## Stack

Use Next.js, TypeScript, Tailwind CSS, PostgreSQL, and a server-side API/domain layer. Use a modular monolith first. Keep the player PWA and admin portal clearly separated by route/module. Use environment variables/secret manager for integrations. If using Supabase, never expose service-role credentials or allow browser-side writes to financial tables.

## Build order

1. Create responsive PWA shell, public landing page with exactly four game-category buttons (Matka, Carrom, Ludo, Other Games), player account screens and admin layout. Do not show all games/markets/rooms on the homepage; each category has a separate route.
2. Implement authentication, staff MFA hooks, account status, organisation/branch data model and server-side RBAC.
3. Create game catalogue with matka/number-draw, Ludo, Carrom and Pool as separate modules. Keep all real-money features OFF and use test credits in development.
4. Implement wallet as an immutable, idempotent ledger with separate cash, bonus/restricted funds and non-cash points. Never let UI directly update balances.
5. Implement direct crypto QR deposit intents without a payment gateway: whitelisted asset/network, server-allocated receiving address, quote/expiry, blockchain watcher on testnet/mock, transaction validation, confirmation/reorg logic, risk holds, idempotent ledger credit and reconciliation. Keep withdrawals as a separate approval/execution workflow. Do not credit based on screenshots or user-submitted hashes.
6. Implement game-session state machines, server-authoritative action/result validation, idempotent settlement and dispute/void workflows.
7. Add admin controls for crypto asset/network/address/quote configuration, chain watcher health, deposit exceptions, reconciliation, withdrawal queue, points, branches, staff, game config, P&L, audit, safer-gambling cases and feature flags with maker-checker for sensitive changes.
8. Apply PWA cache rules: cache static shell assets only; never cache wallet balances, payment states, admin/sensitive pages or authoritative game state as offline truth.
9. Add tests, audit logging, error handling, alerts, seed data, API documentation and deployment notes.

## API-first provider integration rules

- Treat Matka, Ludo, Carrom and Pool as separate provider integrations. Do not build their production logic from hard-coded arrays or guessed endpoints.
- First inspect the client-supplied OpenAPI/Swagger/Postman docs and sample payloads. Create a provider-to-canonical-field mapping sheet and list unsupported capabilities before implementing the UI.
- The Matka page must derive market cards, schedules/cut-off time, status, results, chart/history fields and available participation types from the Matka API through a server-side adapter.
- Keep frontend DTOs provider-independent so a provider can be replaced without rebuilding every screen.
- Add mock/sandbox fixtures for development, but label mock data and block it from production builds. Never silently fall back to fake results if live API fails.
- Build graceful loading/empty/error/retry and stale-data states; show API freshness time and never infer accepted participation from a click or timeout.
- Keep provider credentials server-side. Validate schemas, use signed webhooks where supported, deduplicate events, and preserve raw event hashes/references for audit.
- If the client hasn't yet supplied API docs, scaffold the adapter interface and mocked contract tests only; record each unimplemented mapping in `18_PROVIDER_API_INTEGRATION.md` rather than inventing endpoint names.

## Mandatory implementation rules

- Do not build a generic wallet balance edit endpoint.
- Do not trust client-submitted stakes, winners, outcomes, balances or payment confirmation.
- All financial posting must be server-side and transactional; use integer GBP pence and idempotency keys.
- Duplicate webhooks/actions/settlements must not duplicate money.
- Every admin request is checked against permission and branch/organisation scope on the server.
- Any privileged money/game/config change has a reason, audit event and approval where specified.
- Self-exclusion/restriction/eligibility checks must run server-side before actions.
- Real-money play, deposits, payouts and game activation remain disabled until the client enables them after required approvals and testing.
- Never make up live payment, identity or game-provider credentials. Use clearly labelled sandbox adapters.
- Do not remove requirements just to make a demo work; record assumptions and blocked integrations in `17_DECISIONS_OPEN_QUESTIONS.md`.

## UI direction

Professional UK-facing gaming product: polished but restrained, mobile-first, clear typography, accessible contrast, high trust, clear cash/bonus/points labelling, visible rules and support, and a persistent route to safer-gambling controls. Avoid clutter, misleading balance colours, aggressive motion or dark-pattern prompts.

## Before saying a module is complete

Run type checks, lint, tests and a security-minded review. Test role bypass, duplicate payment callbacks, concurrent stake attempts, withdrawal maker-checker, cross-branch access, service-worker cache behavior and restricted-account actions. Update documentation for any design change.

## Additional mandatory requirements from v1.2

- Implement `/matka`, `/carrom`, `/ludo`, `/other-games` as separate pages. Homepage only fetches category metadata.
- Do not implement or request a payment gateway for deposits. Implement the chain observation abstraction separately from a payment provider: it reads public chain events but cannot create wallet credit until the full validation/risk policy passes.
- Treat supported crypto asset/network choices as server-configured allow-list data. Do not hardcode a token or use fake addresses in production.
- For a prototype, use testnet or labelled mock chain fixtures only. Do not include private keys/seed phrases in source code, frontend, database plaintext, environment examples or screenshots.
- Before production: exact asset/network, valuation policy, address allocation, confirmations, reorg handling, source-of-funds/blockchain screening, customer disclosures and any applicable UKGC payment-method notification must be approved by client finance/compliance.
