# Client Admin Functional Test Report
**QA Lead:** QA Engineer 2 (10+ Years SaaS & Multi-Tenant QA)  
**Status:** ALL TESTS PASSED  
**Scope:** Client Admin Dashboard (`/client-admin`), Domain Resolution, Isolated Settings & Workflows

---

## 1. Executive Summary
The Client Admin console (`/client-admin`) was tested across multiple independent client domains (`ambaari999.com`, `apexsports.bet`, `royalcasino.live`, and local context). The testing focused on client brand autonomy, Option B merchant gateway management, transaction visibility, and cross-client isolation.

---

## 2. Test Execution Details

### 1. Domain-Specific Context Resolution
- **Test:** Access `/client-admin` with `Host: ambaari999.com`.
  - **Result:** Resolves to Ambaari 999 Back Office (`tenantId: ten_ambaari_001`). Displays Ambaari brand styling and active addons.
- **Test:** Access `/client-admin` with `Host: apexsports.bet`.
  - **Result:** Resolves to Apex Sports Back Office (`tenantId: ten_sports_only`).
- **Pass Rate:** 100%.

### 2. Branding & Theme Studio
- **Custom Brand Identity**: Updated brand name, tagline, hero title, and footer for Ambaari 999.
- **Color Token Customization**: Updated primary brand color (`#0088cc`), hover color, and secondary color (`#2c3e50`).
- **Persistence Verification**: Changes persisted to `TenantStore` and reflected immediately in live customer headers without application redeployment.
- **Isolation Check**: Verified that updating Ambaari branding did not affect Apex Sports or Royal Casino branding.
- **Pass Rate:** 100%.

### 3. Payment Gateway Management (Option B: Client-Owned)
- **Supported Providers**: Tested connection forms for:
  - Razorpay UPI & Smart Collect
  - Stripe Checkout
  - PhonePe PG
  - Cashfree Payouts
  - Direct Crypto QR
- **Dynamic Form Fields**: Context-sensitive fields correctly appear per provider (e.g. Key ID / Key Secret for Razorpay; Merchant ID / Salt Key for PhonePe; Receiving Address for Crypto QR).
- **Credential Rotation**: Successfully rotated client merchant keys. Updated version monotonically (`version: 2`) and refreshed masked keys (`****************8877`).
- **Live Connection Testing**: Testing invalid credentials returns accurate diagnostic status (`status: DOWN`, `statusCode: 401`). Testing valid credentials returns `status: HEALTHY`, `statusCode: 200`.

### 4. Financial & Transaction Logs
- **Transaction Log Isolation**: Tested transaction history query for `ten_ambaari_001`. Returns only Ambaari player deposits and withdrawals.
- **Cross-Tenant Ledger Query**: Attempting to query another tenant's ledger records from a client session returns an empty or restricted set.

### 5. Access Control Shielding
- **Super Admin Menu Inaccessibility**: Verified that `/client-admin` does NOT display or allow navigation to Super Admin menus (Kill Switches, All Tenants, Global Providers, Branches, Central Audits).
- **Master Platform Secrets Protection**: Client Admin receives only masked platform keys (`maskedCredentials`) and cannot view or steal platform secrets.

---

## 3. Workstream Summary
- **Total Test Cases:** 24
- **Passed:** 24
- **Failed:** 0
- **Blocked:** 0

