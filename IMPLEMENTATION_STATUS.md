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
- [x] Playable Carrom Game Engine & Tournament Arena (`src/domain/games/carrom/`, `/carrom`):
  - **Self-Contained & Independent Architecture**: 100% self-hosted within Project Atlas repository. Zero runtime dependencies on external GitHub repositories, raw GitHub URLs, CDN scripts, or third-party asset hosts.
  - **Licensing & Reference Audit**: Inspected reference `https://github.com/sohaib023/Carrom-Game` (C++/OpenGL GLUT project without explicit licence). Strictly derived standard Indian Carrom Federation (ICF) tabletop geometry and elastic collision physics without copying or embedding C++ code or binary assets. All 2D physics, vector collisions, striker mechanics, and board graphics were independently authored in TypeScript and React SVG.
  - **Deterministic 2D Physics Engine (`physics.ts`)**:
    - Impulse-momentum disc-disc elastic collision resolution with positional separation
    - Wooden cushion boundary rebound with 0.80 restitution damping
    - Continuous friction decay ($\mu = 0.984$) and complete rest threshold ($\epsilon = 0.12$)
    - 4 corner pocket detection with 36px capture aperture
  - **Tournament Rules Engine (`engine.ts`)**:
    - Standard 19-coin concentric rack: Red Queen at (400, 400), 9 White coins, 9 Black coins, and 1 Striker
    - Striker placement clamped along player's baseline ($180 \le X \le 620$)
    - **Queen Cover Rule**: Pocketing Queen requires covering with assigned color on same or next shot; failing to cover returns Queen to center
    - **Foul Penalty**: Pocketing Striker deducts 1 penalty coin returned to center board and forfeits turn
    - **Scoring**: White (+1 pt), Black (+1 pt), Queen (+3 pts); clearing all coins of assigned color wins match
    - **Intelligent AI Bot (`AceStriker`)**: Calculates ghost-ball angle, pocket vector, power, and baseline positioning
  - **Mobile-First Interactive Board (`CarromBoard.tsx`, `CarromBoardSurface.tsx`)**:
    - Scalable 800x800 SVG canvas with teak frame, birch playing surface, corner pockets, rosette, and foul circles
    - Aiming trajectory guide, striker baseline slider, and shot power gauge
    - Slingshot pull shot computation and fine-aim nudge controls
  - **Procedural Web Audio Synthesis**:
    - Acoustic strikes, coin clacks, cushion rebounds, pocket whooshes, fouls, and victory fanfares synthesized in real time via the browser's native Web Audio API (`AudioContext`). Zero external audio downloads.
  - **Crazy Games Dark Design Language Compliance (`carrom-design.md`)**:
    - Strictly implemented the curated tokens for Carrom only: Primary `#7361FF`, Secondary `#A48EFF`, Tertiary `#F9FAFF`, Neutral `#0C0D14`, Surface `#151722`, Chip-blue `#2F3148`, Border `#374151`, Error `#FF4D4F`, Text-muted `#9CA3AF`, and 30px pill radiuses.
    - Upgraded 800x800 SVG canvas to ivory pearl surface (`#FAFBFD`), cushions (`#1E202E`), floral rosette (`#7361FF`), Queen center spot (`#FF4D4F`), and laser aiming trajectory (`#7361FF`).
  - **Universal Dark Mode & Light Mode Theme Support across All Games**:
    - Updated `src/app/globals.css` with dedicated theme mappings for all game navy & charcoal classes (`#04093A`, `#08164B`, `#0c1f69`, `#162a7d`, `#0C0D14`, `#151722`, `#2F3148`) and protected high-contrast text retention on all brand buttons, badges, chips, and tokens (`#7361FF`, `#7e0ac2`, `#9a13e6`, `#10b981`, `#ff5a7a`, `#3b82f6`, `#E52424`, `#12A04A`, `#0D6EFD`, `#FBD706`).
    - Integrated `useTheme()` and `<ThemeToggle />` into `/ludo`, `/carrom`, `/matka`, and `/other-games`, enabling immediate, seamless theme toggling anywhere in the application.
  - Automated Test Suite: Suite 12 and Suite 13 in `tests/run-all-tests.mjs` (72/72 tests passing)
- [x] Ludo Playable Game Engine & Integration:
  - **Self-Contained & Independent Architecture**: 100% self-hosted within Project Atlas repository. Zero runtime dependencies on external GitHub repositories, raw GitHub URLs, CDN scripts, or third-party asset hosts.
  - **Licensing & Reference Audit**: Inspected reference (`https://github.com/api-evangelist/ludo-ai`); confirmed that Ludo.ai is an asset-generation API catalog and not a board game engine. Traditional Pachisi / Ludo board rules, safe squares, and clockwise circuits were independently implemented from scratch.
  - Built an authoritative deterministic Ludo engine (`src/domain/games/ludo/engine.ts`) supporting:
    - 4-player and 2-player game modes
    - 4 player colors (Red, Green, Yellow, Blue) with 4 tokens each
    - Token states: `base`, `track`, `home_path`, `home`
    - Exact 52-tile common circuit with clockwise progression
    - Safe-zone immunity on 4 color starting squares (0, 13, 26, 39) and 4 star tiles (8, 21, 34, 47)
    - Capture mechanics: opponent knocked out, returned to base, and bonus roll awarded
    - Extra rolls on rolling 6, capturing, and reaching Home
    - 3 consecutive sixes forfeiture rule
    - Exact roll required to reach Home (step 57); overshooting is blocked
    - Intelligent Heuristic Bot AI with capture and home prioritization
  - Server-Authoritative API Endpoints:
    - `POST /api/v1/games/ludo/session` (create/reset session)
    - `GET /api/v1/games/ludo/session` (state recovery and reconnect)
    - `POST /api/v1/games/ludo/roll` (cryptographic server-side dice roll)
    - `POST /api/v1/games/ludo/move` (server-side move validation & execution)
    - `POST /api/v1/games/ludo/bot-turn` (automated AI bot runner)
  - Mobile-First Interactive Game Board (`src/components/ludo/LudoGameBoard.tsx`):
    - Scalable 15x15 SVG Ludo board with 4 colored yards, 4 token slots each, safe stars, and central goal
    - Animated dice roller with pip rendering and Web Audio API synthesized sound effects
    - Pulsating glow on moveable tokens for touch-friendly selection
    - Turn banner and winner celebration overlay
  - Automated Test Suite: Suite 10, Suite 11, and Suite 13 in `tests/run-all-tests.mjs` (72/72 tests passing)
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

### Phase 9: 8-Ball Pool Pro (In-House & Self-Contained)
- [x] Inspected reference repository `jonathansilva/8BallPool` (MIT License Copyright 2020 Jonathan Silva).
- [x] Recreated geometry, aim trajectory, ghost ball contact points, and 2D physics in-house in clean TypeScript and React SVG.
- [x] Zero external runtime dependencies: no raw GitHub URLs, no external CDNs, 100% self-contained.
- [x] Regulation 2:1 pool table geometry with 6 drop pockets, 44px cushioned rails, diamond sights, and worsted cloth.
- [x] 16-ball standard racking (1 cue, 7 solids, 7 stripes, 8-ball in center of third row).
- [x] Interactive controls: 360° touch aiming, fine-nudge angle buttons, power slider, pull-back cue stick animation, and tactile shoot button.
- [x] Official BCA/WPA 8-ball rules: open table on break, group assignment on first legal pocket, legal contact checking, scratches/fouls with Ball-in-Hand placement, premature 8-ball loss, and legal 8-ball win.
- [x] Heuristic AI Bot ("AceCue") for single player vs AI matches.
- [x] Procedural Web Audio API sound synthesizer for authentic cue strikes, ball clicks, cushion thuds, pocket drops, fouls, and victory fanfare.
- [x] Dedicated route `/pool`, player turn & ball count scoreboards, pocketed ball tray, and integration card in `/other-games`.
- [x] Automated Suite 14 test suite added to `tests/run-all-tests.mjs` (83/83 passing tests).
### Phase 10: White-Label B2B Multi-Tenant Platform & Commercial Packages
- [x] Architectural blueprint and implementation plan authored and approved (`white_label_b2b_saas_plan.md`).
- [x] Multi-tenancy contracts, types, and in-memory/cached store (`src/domain/tenant/types.ts`, `src/domain/tenant/store.ts`).
- [x] Commercial package catalog defined:
  - `MATKA_ONLY`: £499/mo (Matka only)
  - `MATKA_LUDO`: £899/mo (Matka + Ludo)
  - `MATKA_CARROM`: £899/mo (Matka + Carrom)
  - `MATKA_LUDO_CARROM`: £1,299/mo (Matka + Ludo + Carrom)
  - `COMPLETE_PRO_SUITE`: £1,699/mo (All games: Matka, Carrom, Ludo, Pool, Other Games)
  - `CUSTOM`: Bespoke operator game mix
- [x] Pre-seeded demo tenants for immediate validation:
  - `org_atlas_uk_001` (`atlas`): Full platform suite, electric violet theme (`platform.atlasgaming.uk`, `localhost`)
  - `ten_kalyan_001` (`kalyan-club`): Matka only, royal amber theme (`kalyanclub.com`, `play.kalyanclub.com`)
  - `ten_board_002` (`board-masters`): Matka + Ludo, emerald green theme (`boardmasters.uk`, `play.boardmasters.uk`)
  - `ten_cue_003` (`pro-cue`): Carrom + 8-Ball Pool Pro, sky blue theme (`procue.com`)
- [x] Modular Game Plugin Registry (`src/domain/games/registry.ts`) mapping route paths, metadata, provider requirements, and entitlement assertions.
- [x] Edge Middleware (`src/middleware.ts`):
  - Dynamic host / domain / header / query param / cookie tenant resolution.
  - Hard server-side route gating: direct URL navigation to disabled games returns HTTP 403 or redirects to `/access-denied`.
  - Injects `x-tenant-id`, `x-tenant-slug`, and branding headers.
- [x] Dynamic White-Label Presentation Layer:
  - `TenantContext.tsx` & `TenantBrandProvider.tsx` injecting custom CSS variables (`--tenant-primary`, `--tenant-secondary`, `--tenant-glow`).
  - Interactive `TenantSwitcher.tsx` preview widget in header for instant live tenant switching.
  - Header and Homepage dynamically filter navigation and game cards to only render subscribed games in configured display order.
  - `/access-denied` page explaining commercial package restrictions with return buttons.
- [x] Admin Portals & API routes:
  - `/admin/tenants/page.tsx`: Super Admin B2B SaaS tenant manager (onboarding, package changer, granular game toggles).
  - `/client-admin/page.tsx`: Client operator branding studio (custom colors, logo, hero copy, live component preview).
  - `/api/v1/admin/tenants`, `/api/v1/admin/tenants/[id]`, `/api/v1/admin/tenants/[id]/games`.
  - `/api/v1/client-admin/branding`.
  - `/api/v1/categories` (tenant-aware dynamic category catalogue).
### Phase 11: Casino Games Integration (Test Mode Only — Flexrix API)
- [x] Inspected linked repository `https://github.com/flexrix/flexrix-casino-api`:
  - Identified as an API specification & architectural documentation showcase for the Flexrix Unified iGaming API.
  - No runnable npm package, client library, or server code in repo; specifies REST endpoints, HMAC-SHA1 signature authentication (`X-Merchant-Id`, `X-Timestamp`, `X-Nonce`, `X-Signature`), and single seamless-wallet callbacks (`bet`, `win`, `refund`) with `tx_id` idempotency.
- [x] Built in-house dedicated backend adapter (`src/domain/games/adapters/casino.adapter.ts`):
  - HMAC-SHA1 signature generator and timing-safe validator.
  - Replay protection with 5-minute timestamp window check.
  - Seamless wallet callback handler with mandatory `tx_id` idempotency.
  - Isolated from production double-entry ledger; zero real-money transactions can take place.
- [x] Environment configuration:
  - Added safe placeholders in `.env.example` (`CASINO_TEST_MODE_ENABLED=true`, `FLEXRIX_SANDBOX_MODE=true`, `FLEXRIX_CASINO_API_URL`, `FLEXRIX_MERCHANT_ID`, `FLEXRIX_MERCHANT_SECRET`).
  - Integration disabled by default or restricted to sandbox test mode.
- [x] Dedicated Casino Landing Page & Sandbox Simulator:
  - `/casino`: Mobile-first responsive landing page with prominent "Casino Test Mode (Sandbox Only)" banner, category filters (Slots, Live Dealer, Crash, Table Games), provider selector (Pragmatic Play, Evolution, NetEnt, Hacksaw, Spribe, BGaming), search bar, and technical reference drawer.
  - `/casino/sandbox-frame`: Interactive in-browser sandbox launcher with live animated reels, test credit controls, and real-time HMAC diagnostic log.
- [x] White-Label B2B SaaS Multi-Tenant Registration:
  - Registered `casino` in `GameRegistry` and `GameKey`.
  - Added commercial package `CASINO_SUITE` (£1,199/mo) and included `casino` in `COMPLETE_PRO_SUITE`.
  - Hard server-side edge route gating in `src/middleware.ts` for `/casino` when disabled for a tenant.
  - Super Admin toggle in `/admin/tenants`.
- [x] Automated Test Suite 16 added to `tests/run-all-tests.mjs` (99/99 tests passing).
- [x] Production build validation verified (`npm run build` passed with 0 errors).

---



## 2. Documented Contradictions & Latest Decisions Applied

1. **Homepage Design**: Early documents (01, 02) referenced a general game lobby. Document 20 & prompt override this: **The homepage displays ONLY 4 game-category buttons in exact order: Matka, Carrom, Ludo, Other Games.** No individual market cards or match rooms appear on the homepage.
2. **Deposit Rail**: Documents 01 & 08 discussed traditional PSPs, card checkouts, and bank QRs. Document 21 & prompt override this: **Deposits are strictly direct crypto QR transfers without a payment gateway.** Wallets are credited solely through independent blockchain watcher verification.
3. **Withdrawals**: Not automatically crypto; handled as a controlled, maker-checker approved payout workflow.
4. **Third-Party Game APIs**: Where live API documentation or credentials have not yet been provided by the client, adapter interfaces and canonical DTOs are built with clearly labeled development fixtures; no fake production endpoints are invented.
