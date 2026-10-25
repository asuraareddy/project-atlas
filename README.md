# Project Atlas — Multi-Gaming Platform (PWA)

[![Node](https://img.shields.io/badge/Node-v24+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-purple.svg)](https://tailwindcss.com/)

`Project Atlas` is a modern, UK-first multi-gaming Progressive Web Application (PWA) engineered with a modular-monolith architecture. It implements server-authoritative game adapters, strict double-entry ledger accounting in integer minor units (pence), direct non-custodial crypto QR deposit workflows without third-party payment gateways, and enterprise-grade 10-role RBAC with Maker-Checker dual control.

---

## Key Architectural Highlights

### 1. Homepage & Category Routing
Per Document 20 specifications, the public landing page strictly isolates games into categories to prevent clutter, reduce cognitive load, and comply with UK advertising standards:
- **Homepage** (`/`): Contains **only 4 primary category action buttons** in exact sequence:
  1. **Matka** (`/matka`)
  2. **Carrom** (`/carrom`)
  3. **Ludo** (`/ludo`)
  4. **Other Games** (`/other-games`) — including Pool and arcade skill titles.
- **Strict Invariant**: No raw market lists, match rooms, or live provider feeds appear directly on the homepage.

### 2. Direct Crypto QR Deposit System (No Payment Gateway)
Per Document 21, fiat payment service provider (PSP) dependencies are eliminated in favor of a direct, blockchain-verified deposit pipeline:
- **Backend-Controlled Intent**: Server quotes the current asset exchange rate, reserves a receiving address, and sets an expiration timestamp.
- **Dynamic QR Code**: Rendered client-side from the backend URI (supporting USDT, USDC, BTC, ETH on Polygon, Ethereum, etc.).
- **Zero-Trust Validation**: Uploaded screenshots or user-submitted transaction hashes **NEVER credit wallets**.
- **Independent Blockchain Watcher**: Observes chain transactions, verifies token contract, destination address, and enforces confirmation depth (e.g., 12 blocks on Polygon) before idempotent ledger posting.
- **Fail-Safe Exception Handling**: Automatically detects underpayment, overpayment, wrong-network transfers, and late arrivals for administrative review.

### 3. Double-Entry Accounting Ledger
- **Integer Minor Units**: All monetary amounts are handled strictly as 64-bit integer GBP pence (`amountMinor BIGINT`, e.g., 100 = £1.00). Floating-point arithmetic is strictly prohibited.
- **Strict Balance Segregation**:
  - Cash Available (`cashAvailableMinor`)
  - Cash Reserved for open stakes (`cashReservedMinor`)
  - Restricted / Bonus Balance (`bonusMinor`)
  - Non-Cash Loyalty Points (`pointsBalance`)
- **Balanced Journal Groups**: Sum of debits strictly equals sum of credits for every transaction.
- **Atomic Stake Reservations**: Concurrent duplicate spending is blocked at the domain service layer.

### 4. Enterprise RBAC & Maker-Checker Dual Control
- **10 Documented Roles**: Super Admin, Operator Admin, Compliance, Finance Manager, Payments Operator, Game Operations, Branch Manager, Staff/Support, Auditor, and Player.
- **Branch Data Scoping**: Staff assigned to a specific branch cannot query or modify entities outside their assigned jurisdiction.
- **Maker-Checker Enforcement**: High-risk financial or operational actions (withdrawal approvals, game result overrides, manual balance adjustments) require dual control. **Self-approval (`makerId === checkerId`) is strictly rejected by both application logic and database constraints.**

### 5. Installable PWA with Strict Cache Hygiene
- Installable web app with `manifest.json` and standalone display.
- Service worker (`public/sw.js`) caches static assets and shell UI.
- **Strict Invariant**: Service worker **NEVER caches** wallet balances, financial transactions, admin routes, or authoritative game state.

---

## Directory Structure

```
project-atlas/
├── prisma/
│   ├── schema.prisma                    # Complete PostgreSQL Prisma schema
│   └── migrations/
│       └── 0001_initial_schema.sql      # Direct SQL DDL with constraints & indexes
├── public/
│   ├── manifest.json                    # PWA Web App Manifest
│   ├── sw.js                            # PWA Service Worker (strict cache exclusions)
│   └── offline.html                     # Offline fallback shell
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root PWA layout with Header & Footer
│   │   ├── page.tsx                     # Landing page with EXACTLY 4 category buttons
│   │   ├── matka/page.tsx               # Matka lobby, markets, charts & countdowns
│   │   ├── carrom/page.tsx              # Carrom lobby, rooms & rules
│   │   ├── ludo/page.tsx                # Ludo lobby & multiplayer rooms
│   │   ├── other-games/page.tsx         # Extensible lobby (Pool, Skill games)
│   │   ├── player/                      # Player portal (wallet, deposit, history, safer gambling)
│   │   ├── admin/                       # Admin portal (crypto deposits, approvals, P&L, audit)
│   │   └── api/v1/                      # 18 REST endpoints (auth, games, ledger, crypto, admin)
│   ├── components/
│   │   ├── layout/                      # Header, Footer, Nav
│   │   └── pwa/                         # PwaRegister service worker hook
│   └── domain/                          # Hexagonal Domain Logic
│       ├── rbac/                        # Roles, permissions, branch scoping, maker-checker
│       ├── wallet/                      # Double-entry ledger, balance projection, reservations
│       ├── crypto/                      # Intent generator, watcher & mock simulation
│       └── games/adapters/              # Matka, Carrom, Ludo, Other Games adapters
├── tests/
│   └── run-all-tests.mjs                # Master automated test suite (14 passing tests)
├── docker-compose.yml                   # PostgreSQL 16 & Redis 7 development containers
├── IMPLEMENTATION_STATUS.md             # Requirement traceability matrix
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- Node.js v20+ or v24+
- Docker & Docker Compose (optional for local database)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the provided `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Run Automated Test Suite
Run the 14-point requirement verification suite:
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm start
```

---

## Seed Accounts & Testing Personas

| Role | Email | Password | Branch Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@projectatlas.io` | `AtlasAdmin#2026` | Global |
| **Operator Admin** | `operator@projectatlas.io` | `AtlasAdmin#2026` | Global |
| **Finance Manager** | `finance@projectatlas.io` | `AtlasAdmin#2026` | Global |
| **Payments Operator** | `payments@projectatlas.io` | `AtlasAdmin#2026` | Global |
| **Branch Manager** | `manager.london@projectatlas.io` | `AtlasAdmin#2026` | London Central (`br_london_central`) |
| **Auditor** | `auditor@projectatlas.io` | `AtlasAdmin#2026` | Global (Read-only) |
| **Player (Demo)** | `player1@demo.co.uk` | `AtlasPlayer#2026` | London Central |

---

## Missing Client Dependencies & Blocker Log

1. **Client Matka Live API Credentials**: The external Matka API specification and endpoints are mocked in `ClientMatkaAdapter` using structured sandbox fixtures. Once the client delivers production OpenAPI endpoints and signing secrets, set `MATKA_API_URL` and `MATKA_API_KEY` in `.env.local`.
2. **Carrom & Ludo Providers**: Adapter interfaces (`CarromAdapter`, `LudoAdapter`) are scaffolded. Awaiting provider contract selection.
3. **Blockchain RPC Nodes**: Polygon and Ethereum RPC endpoints default to public fallbacks; enter private Alchemy/Infura RPC keys in production.
