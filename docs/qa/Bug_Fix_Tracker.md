# Bug Fix Tracker
**QA Lead:** QA Engineer 10 (Independent QA Director)  
**Status:** ALL IDENTIFIED DEFECTS RESOLVED & VERIFIED

---

## 1. Defect Log & Remediation Details

| Bug ID | Severity | Category | Title | Affected Component | Root Cause | Fix Applied | Retest Status |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **BUG-001** | **P1 (High)** | UI/UX & Navigation | No visible Close/Return option on `/admin/tenants` | `src/app/admin/layout.tsx`, `src/app/admin/tenants/page.tsx` | Entry from public site into admin canvas had no top header, breadcrumb, or back control; sidebar exit button was below the fold on standard displays. | Added persistent sticky Admin Top Bar with breadcrumbs, Back button, and prominent `Exit Admin (✕)` button. Added in-page return links on `/admin/tenants`. | **VERIFIED & CLOSED** |
| **BUG-002** | **P2 (Med)** | UI/UX & Responsive | Mobile sidebar takes over entire viewport on admin pages | `src/app/admin/layout.tsx` | Below `md` breakpoint, sidebar stacked 12 items vertically above page content. | Converted mobile sidebar into a sliding off-canvas drawer toggled via hamburger menu with backdrop click & Escape dismissal. | **VERIFIED & CLOSED** |
| **BUG-003** | **P2 (Med)** | Usability & A11y | Modal dialogs cannot be closed via Escape key or outside click | `src/app/admin/tenants/page.tsx`, `providers/page.tsx`, `gateways/page.tsx`, `crypto-deposits/page.tsx`, `client-admin/page.tsx` | Modal containers lacked `Escape` key event listeners and backdrop click handlers. | Added window `Escape` key listeners and `onClick={(e) => { if (e.target === e.currentTarget) close(); }}` across all 10 admin modals. | **VERIFIED & CLOSED** |
| **BUG-004** | **P1 (High)** | Backend & Domain | Provisioning new tenant omits `'sports'` from game entitlements | `src/app/api/v1/admin/tenants/route.ts` | Default `allGames` initialization array was missing `'sports'`. | Added `'sports'` to `allGames` array, ensuring complete 7-game configuration for new tenants. | **VERIFIED & CLOSED** |
| **BUG-005** | **P2 (Med)** | API & Standards | Testing non-existent provider returns 400 instead of 404 | `src/app/api/v1/admin/providers/[id]/test/route.ts` | Generic error catch block returned 400 for all errors. | Added check for `'not found'` error message and return HTTP 404 Not Found. | **VERIFIED & CLOSED** |
| **BUG-006** | **P2 (Med)** | API & Standards | Testing non-existent gateway returns 400 instead of 404 | `src/app/api/v1/admin/gateways/[id]/test/route.ts` | Generic error catch block returned 400. | Added check for `'not found'` error message and return HTTP 404 Not Found. | **VERIFIED & CLOSED** |
| **BUG-007** | **P1 (High)** | Security & API | Cross-tenant gateway test in client-admin returns 400 instead of 403 | `src/app/api/v1/client-admin/gateways/[id]/test/route.ts` | Security violation exception returned generic 400 status. | Added check for `'Security Violation'` and return HTTP 403 Forbidden. | **VERIFIED & CLOSED** |

---

## 2. Defect Resolution Summary
- **Total Defects Identified:** 7
- **Defects Fixed:** 7 (100%)
- **Defects Open:** 0
- **P0 Defects:** 0
- **P1 Defects:** 3 (All Fixed)
- **P2 Defects:** 4 (All Fixed)
- **P3/P4 Defects:** 0

