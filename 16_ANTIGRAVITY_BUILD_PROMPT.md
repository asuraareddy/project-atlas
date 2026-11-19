# 16 — Simple Antigravity / AI Coding Prompt

Build a production-minded, mobile-first multi-gaming platform using the specifications in this documentation pack. Read `README.md` first, then `BRD`, `PRD`, `FRD`, `TRD`, `SYSTEM_ARCHITECTURE`, `ROLES_RBAC`, `WALLET_PAYMENTS_LEDGER`, `SECURITY_COMPLIANCE` and `PWA_PERFORMANCE` before coding.

## Stack

Use Next.js, TypeScript, Tailwind CSS, PostgreSQL, and a server-side API/domain layer. Use a modular monolith first. Keep the player PWA and admin portal clearly separated by route/module. Use environment variables/secret manager for integrations. If using Supabase, never expose service-role credentials or allow browser-side writes to financial tables.

## Build order

1. Create responsive PWA shell, public landing/lobby, player account screens and admin layout.
2. Implement authentication, staff MFA hooks, account status, organisation/branch data model and server-side RBAC.
3. Create game catalogue with matka/number-draw, Ludo, Carrom and Pool as separate modules. Keep all real-money features OFF and use test credits in development.
4. Implement wallet as an immutable, idempotent ledger with separate cash, bonus/restricted funds and non-cash points. Never let UI directly update balances.
5. Implement PSP adapter interfaces, payment intents, provider-generated dynamic QR where supported, signed/deduplicated webhooks, withdrawal approvals and reconciliation. Use sandbox/mock providers until client credentials and approval are supplied.
6. Implement game-session state machines, server-authoritative action/result validation, idempotent settlement and dispute/void workflows.
7. Add admin controls for payments, QR/provider configuration, points, branches, staff, game config, P&L, audit, safer-gambling cases and feature flags with maker-checker for sensitive changes.
8. Apply PWA cache rules: cache static shell assets only; never cache wallet balances, payment states, admin/sensitive pages or authoritative game state as offline truth.
9. Add tests, audit logging, error handling, alerts, seed data, API documentation and deployment notes.

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
