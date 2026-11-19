# Project Atlas — Master QA Test Plan
**Document Version:** 1.0.0  
**Target Platform:** White Label Multi-Tenant Gaming Engine & Back Office  
**Assigned QA Department:** 10 Senior QA Engineering Leads

---

## 1. Scope and Objectives
This Master Test Plan governs the comprehensive end-to-end quality audit, security assessment, multi-tenant isolation testing, and functional verification of Project Atlas. 

The audit encompasses:
1. **White Label Super Admin** (`/admin/*`) across 12 distinct operations modules.
2. **Client Admin Dashboards** (`/client-admin`) across multiple isolated client domains.
3. **UI/UX Navigation & Modal Architecture**, with special focus on navigation trap remediation, modal lifecycle management, and mobile accessibility.
4. **API, Backend, and Multi-Tier Payment Gateways** (Option A platform vs Option B client-owned).
5. **Database, Ledger, and Cryptographic Security Integrity**.

---

## 2. 10 Independent QA Workstreams & Roles

| Role | Lead | Focus Area | Primary Deliverable |
| :--- | :--- | :--- | :--- |
| **QA-1** | Senior Enterprise Specialist | Super Admin Functional Testing | `Super_Admin_Test_Report.md` |
| **QA-2** | Senior SaaS Specialist | Client Admin Functional Testing | `Client_Admin_Test_Report.md` |
| **QA-3** | UI Automation & Usability Lead | UI/UX & Navigation Architecture | `UI_UX_Navigation_Audit.md` |
| **QA-4** | Senior API & Backend Lead | API Contracts, Validation & Handshakes | `API_Backend_Test_Report.md` |
| **QA-5** | Enterprise Data Architect | Database, Relational & Ledger Integrity | `Database_Integrity_Report.md` |
| **QA-6** | Application Security Lead | RBAC, Masking, IDOR & Penetration | `Security_Audit_Report.md` |
| **QA-7** | Multi-Tenant Architect | Cross-Tenant Isolation & Domain Routing | `Multi_Tenant_Isolation_Report.md` |
| **QA-8** | FinTech Integration Specialist | Payment Gateways & Idempotent Webhooks | `Payment_Gateway_Test_Report.md` |
| **QA-9** | Test Automation Architect | Automated Regression Harness | `Automation_Regression_Report.md` |
| **QA-10** | Independent QA Director | Defect Tracking, Verification & Sign-off | `Final_QA_Signoff_Report.md` |

---

## 3. Comprehensive Inventory of Admin Sections

### A. Super Admin Routes (`/admin/*`)
1. **Platform Dashboard** (`/admin/dashboard`): Operational telemetry, system kill switches, live KPIs.
2. **B2B Tenants & SaaS** (`/admin/tenants`): Client tenant onboarding, commercial tier allocation, domain mapping, game entitlement gating.
3. **API & Providers** (`/admin/providers`): Centralized credential vault, provider lifecycle, runtime switching, audit logs, rollback snapshots.
4. **Payment Gateways** (`/admin/gateways`): Platform-wide gateway management, tenant gateway overview (masked), client gateway policies.
5. **Deposit & Crypto QR** (`/admin/crypto-deposits`): Non-custodial crypto deposit addresses, dynamic QR generation, block confirmation thresholds.
6. **Withdrawal Approvals** (`/admin/withdrawals`): Dual authorization queue for payout requests.
7. **Maker-Checker Queue** (`/admin/maker-checker`): Segregation of duties, self-approval prevention.
8. **Finance & P&L** (`/admin/finance`): GGR, NGR, player liability balancing, encrypted export.
9. **Compliance & AML** (`/admin/compliance`): Surveillance of harm indicators, Gamstop self-exclusion enforcement.
10. **Game Ops & Feeds** (`/admin/games`): Engine status toggles, real-money kill switches, telemetry.
11. **Branches & Scopes** (`/admin/branches`): Operational hierarchy and branch data scoping.
12. **Immutable Audit Log** (`/admin/audit`): Cryptographic hash-chained audit event logging.

### B. Client Admin Routes (`/client-admin`)
1. **Branding & Theme Studio**: Custom brand name, slogan, primary/secondary colors, hero copy, footer, support email.
2. **Payment Gateway Settings**: Option B client-owned merchant integration (Razorpay UPI, Stripe, PhonePe, Cashfree, Crypto QR).
3. **Domain Transaction History**: Tenant-isolated ledger entries and deposit/payout records.

---

## 4. Test Strategy & Entry/Exit Criteria

### Entry Criteria
- Clean local production build (`npm run build`).
- Next.js server running in production mode (`http://localhost:3000`).
- Test accounts and test tenant fixtures loaded in deterministic state.

### Exit Criteria
- Zero P0 (Critical) defects remaining.
- Zero P1 (High) defects remaining.
- 100% test execution across all 10 QA workstreams.
- High-priority navigation bug on `/admin/tenants` fully investigated, resolved, and verified.
- 100% pass across all automated regression suites (`npm test`, `test:b2b`, `test:providers`, `test:payments`, `test:admin-qa`).

