# Project Atlas — Implementation Status & Requirement Traceability

**Project:** UK-first multi-game real-money gaming platform (`Project Atlas`)  
**Architecture:** Next.js App Router (TypeScript, Tailwind CSS), Modular Domain Monolith, PostgreSQL (Prisma-ready schema & SQL migrations), In-Memory/Redis-ready Cache, Installable PWA, Server-authoritative Game Orchestrator & Direct Crypto QR Deposits.  
**Date:** October 25, 2026  
**Status:** In Active Phased Implementation  

---

## 1. Requirement Traceability Matrix & Checklist

### Phase 1: Project Foundation, Design System & Environment
- [x] Comprehensive review of all 24 specification documents (01_BRD through 21_CRYPTO_QR_DEPOSITS, README, Antigravity_Build_Prompt, design.md)
- [x] Identified document contradictions and reconciled against latest decisions (Docs 17–21 supersede earlier drafts: 4-category homepage, direct crypto QR without payment gateway, provider adapters)
- [x] Created `IMPLEMENTATION_STATUS.md` checklist mapping all requirements
- [x] Initialized `project-atlas` Next.js App Router TypeScript project with Tailwind CSS
- [x] Implemented design tokens from `design.md` ("Bueno Dark Creator" theme: `#7e0ac2` electric violet, `#1f1f1f`/`#242424` dark charcoal surfaces, pill buttons, high-contrast accessible typography)
- [x] Established environment configuration (`.env.example`, `.env.local`), Docker Compose (PostgreSQL, Redis) and development scripts
- [x] Setup testing framework and test runner

### Phase 2: PWA Shell, Homepage (4 Category Buttons) & Routes
- [x] Responsive PWA manifest (`manifest.json`), service worker (`sw.js`) and app icons
- [x] Header with brand logo, authentication state, wallet summary pill, and persistent Safer Gambling link
- [x] Homepage Hero section with concise value proposition (strictly NO raw market cards, match rooms, or provider feeds)
- [x] Homepage 4 primary game category cards/buttons in exact order:
  1. **Matka** (`/matka`)
  2. **Carrom** (`/carrom`)
  3. **Ludo** (`/ludo`)
  4. **Other Games** (`/other-games`)
- [x] Trust & support section and footer with regulatory disclosures & links
- [x] Dedicated category pages with lazy loading:
  - `/matka`: Matka lobby, market list, schedules, results, charts, entry rules
  - `/carrom`: Carrom lobby, game rooms, modes, rules, provider adapter UI
  - `/ludo`: Ludo lobby, multiplayer rooms, matchmaking, rules, provider adapter UI
  - `/other-games`: Extensible category lobby (Pool, Skill games, admin-enabled titles)

### Phase 3: Database Schema, Migrations, RBAC & Server Security
- [x] PostgreSQL schema with UUID/ULID keys, Timestamptz (UTC), integer minor units (`amount_minor BIGINT` in GBP pence)
- [x] Organization & branch hierarchy (`organizations`, `branches`, `users`, `player_profiles`, `staff_profiles`)
- [x] 10-Role RBAC hierarchy:
  - Super Admin, Operator Admin, Compliance, Finance Manager, Payments Operator, Game Operations, Branch Manager, Staff/Support, Auditor, Player
- [x] Server-side permission & branch scope enforcement (`hasPermission`, `assertScope`)
- [x] Maker-Checker dual control framework (`approval_requests` preventing self-approval: `makerId !== checkerId`)
- [x] Secure session & authentication with staff MFA hooks
- [x] Safe seed data with test users across all 10 roles, sample branches, and mock data

### Phase 4: Player & Admin Portals
- [x] Player Portal routes:
  - `/player/dashboard`: Overview, quick balance, recent activity
  - `/player/wallet`: Detailed cash, bonus/restricted, and points breakdown
  - `/player/deposit`: Crypto QR deposit intent generator and status tracker
  - `/player/withdrawals`: Withdrawal request flow & tracking
  - `/player/history`: Filterable transaction & game participation records
  - `/player/safer-gambling`: Deposit limits, loss limits, session timeout, self-exclusion
  - `/player/profile`: KYC status, account details, login history
  - `/player/support`: Open cases, ticketing, dispute management
- [x] Admin Portal routes:
  - `/admin/dashboard`: Platform metrics, health, alerts
  - `/admin/players`: Player search, branch-scoped access, KYC verification
  - `/admin/compliance`: Safer gambling queue, self-exclusion blocks, AML cases
  - `/admin/finance`: P&L reports, ledger explorer, reconciliation exceptions
  - `/admin/crypto-deposits`: **Deposit Management & Dynamic Crypto QR Watcher**:
    - Renamed from Chain Watcher to focus on **Deposit Management**
    - Dynamic QR code generation directly from operator receiving address
    - Live QR code preview updated in real-time as operator modifies addresses
    - Live GBP exchange rate feed configuration, block confirmation depths, and asset pause/resume
    - Authoritative backend APIs (`PUT` / `POST` `/api/v1/crypto/whitelist`) immediately reflected in player deposit intents
  - `/admin/withdrawals`: Withdrawal queue, risk holds, maker-checker dual approval
  - `/admin/games`: Game catalog, schedule, kill switches, result publication with dual approval
  - `/admin/branches`: Branch/partner management, scoped staff assignments
  - `/admin/maker-checker`: Pending approvals queue with audit logging
  - `/admin/audit`: Central immutable audit event log

### Phase 5: Game Provider Adapter Framework & Game Integrations
- [x] Canonical `GameAdapter` interface (`getCapabilities`, `validateLaunch`, `createSession`, `validateAction`, `validateResult`, `buildSettlement`)
- [x] Matka Provider Adapter & Participation System:
  - Live client Matka API (`matkaapi.com`) integrated and verified using domain key authentication
  - Fetches active live daily markets with real-time declared results (`market=all`)
  - Full catalog directory access across 399 market configurations (`market_list=1`)
  - Server-authoritative result parser decomposes Open Pana, Jodi composite, and Close Pana
  - Built-in in-memory 30s TTL cache eliminates provider rate-limiting and provides sub-50ms responses
  - Market schedule, countdown, and cut-off enforcement strictly on server time
  - **Matka Participation — Single Patti, Double Patti & Triple Patti (Complete System)**:
    - 10 selectable digit buttons (`1, 2, 3, 4, 5, 6, 7, 8, 9, 0`) with active visual highlights
    - Separate Points amount field with whole-number range validation (1–10+ points)
    - Date selector and `OPEN` / `CLOSE` game-type toggle
    - Authoritative mathematical generator (`src/domain/games/matka/patti-generator.ts`) deriving all 220 Patti:
      - Single Patti: 12 combinations per digit $\times$ 10 digits = 120 total (distinct digits, sum % 10 = digit)
      - Double Patti: 9 combinations per digit $\times$ 10 digits = 90 total (two identical digits, sum % 10 = digit)
      - Triple Patti: 1 combination per digit $\times$ 10 digits = 10 total (three identical digits, sum % 10 = digit)
    - All Patti numbers rendered strictly as 3-character strings preserving leading/trailing zeroes (`000`, `100`, `120`)
    - Switching categories preserves selected digit, date, game type, and points amount
    - Responsive Participation Table (Patti Number, Points, Game Type, Action) with Select All / Deselect All
    - Participation Slip with accidental duplicate prevention, instant entries & total points recalculation
    - Dedicated backend endpoint `GET /api/v1/games/matka/patti` for authoritative possibilities
    - Server-side validation and atomic ledger reservation via `POST /api/v1/games/matka/participate` with idempotency
    - Automated Suite 8 covering all 220 Patti, sums, classifications, leading zeros, points, and cart deduplication
- [x] Carrom Provider Adapter:
  - Match format, turn state machine, shot sequence validation, disconnect recovery
- [x] Ludo Provider Adapter:
  - Matchmaking, turn state machine, server-authoritative move validation
- [x] Other Games (Pool) Adapter:
  - Session launch, rules validation, table management
- [x] Real-money flags default to **OFF**; practice mode with non-cash points

### Phase 6: Immutable Double-Entry Ledger & Direct Crypto QR Deposits
- [x] Ledger core:
  - Balanced double-entry journal groups (total debits == total credits)
  - Currency minor units: Integer GBP pence (100 = £1.00)
  - Separate balances: Cash Available, Cash Reserved, Bonus/Restricted, Non-cash Loyalty Points
  - Atomic stake reservations to prevent double-spending
  - Idempotency keys on all financial mutations
- [x] Direct Crypto QR Deposit System (NO payment gateway):
  - Whitelisted asset/network allowlist (e.g., USDT-Polygon, USDT-Ethereum, BTC, ETH)
  - Backend deposit intent creation (`crypto_deposit_intents`) with exchange rate quote & expiry
  - Operator-controlled receiving address allocation & dynamic QR generation
  - Blockchain Watcher / Mock Observer:
    - Observes on-chain transfers, confirms block depth, detects reorgs, deduplicates transaction hashes
    - Strictly blocks credit from screenshot or user-submitted tx hash alone
    - Idempotent wallet credit posting on confirmed chain transaction
  - Exception handling: wrong network, underpayment, overpayment, late transfer, risk hold
- [x] Withdrawal Workflow:
  - Segregated from deposit flow
  - Available cash validation, reservation posting
  - Risk screening & maker-checker approval
  - Payout execution & status tracking

### Phase 7: Finance Reporting, Compliance & Operational Controls
- [x] Daily, weekly, monthly and custom period financial reports (UTC backed, Europe/London display)
- [x] Gross Gaming Revenue (GGR), Net Gaming Revenue (NGR), cash liabilities, and fee accounting
- [x] Branch-wise and game-wise P&L with strict branch data scoping
- [x] Reconciliation engine: Deposit intents vs on-chain receipts vs ledger postings
- [x] Safer gambling risk triggers: spend spikes, session duration, velocity
- [x] System kill switches: per-game, per-provider, per-payment-method, global wagering pause

### Phase 8: PWA Optimization, Security, Testing & Hardening
- [x] PWA caching policy verification:
  - Cache static shell assets only
  - STRICTLY NO CACHING of wallet balances, financial transactions, admin pages, or authoritative game state
  - Reconnect recovery: re-fetch authoritative server state
- [x] Comprehensive automated test suite:
  - 4 Category buttons on homepage test
  - Category route accessibility test
  - RBAC & branch scoping bypass test
  - Ledger double-entry balance & atomic reservation concurrency test
  - Duplicate blockchain transaction callback deduplication test
  - Maker-checker self-approval prevention test
  - Provider timeout and graceful degradation test
- [x] Build & type-check validation (`npm run build`, `tsc --noEmit`)

---

## 2. Documented Contradictions & Latest Decisions Applied

1. **Homepage Design**: Early documents (01, 02) referenced a general game lobby. Document 20 & prompt override this: **The homepage displays ONLY 4 game-category buttons in exact order: Matka, Carrom, Ludo, Other Games.** No individual market cards or match rooms appear on the homepage.
2. **Deposit Rail**: Documents 01 & 08 discussed traditional PSPs, card checkouts, and bank QRs. Document 21 & prompt override this: **Deposits are strictly direct crypto QR transfers without a payment gateway.** Wallets are credited solely through independent blockchain watcher verification.
3. **Withdrawals**: Not automatically crypto; handled as a controlled, maker-checker approved payout workflow.
4. **Third-Party Game APIs**: Where live API documentation or credentials have not yet been provided by the client, adapter interfaces and canonical DTOs are built with clearly labeled development fixtures; no fake production endpoints are invented.
