# 06 — Roles, RBAC & Branch Scoping

## 1. Design principle

Use **RBAC plus scope-based authorization**. Role names alone are insufficient: every request must be checked against action, resource, tenant/organisation, branch assignment, player relationship and object state. Deny by default.

## 2. Suggested hierarchy

1. **Super Admin** — platform-wide technical administration. Very limited number of users; MFA, step-up authentication and alerts required.
2. **Operator Admin** — organisation-wide day-to-day configuration within operator scope.
3. **Compliance Officer / Safer-Gambling Lead** — verification exceptions, risk and interaction cases, restrictions, self-exclusion evidence, complaints and regulatory evidence.
4. **Finance Manager** — financial reporting, reconciliation, payment exceptions and approval of high-risk withdrawals/adjustments.
5. **Payments Operator** — deposits/withdrawal queue and provider exception processing; cannot approve own maker request.
6. **Game Operations Manager** — game/provider availability, schedule configuration and round monitoring; sensitive result publication requires distinct approval.
7. **Branch / Partner Manager** — manages only assigned branch/partner data and staff; cannot modify global payment/provider configuration or create global roles.
8. **Branch Staff / Support Staff** — scoped lookup, support tickets and allowed status workflows; no raw wallet or outcome mutation.
9. **Auditor / Read-only Analyst** — time-limited read-only evidence/report access. Exports are logged.
10. **Player** — own profile, own history, own wallet view and allowed self-service controls.
11. **Service Account** — non-human, narrowly scoped permission for one integration/workload, secret-managed and rotated.

## 3. Permission matrix (baseline)

Legend: **F** full in scope; **R** read; **C** create/submit; **A** approve; **—** no access; **D** requires dual approval or separate permission. Scope always applies.

| Capability | Super Admin | Operator Admin | Compliance | Finance Mgr | Payments Op | Game Ops | Branch Mgr | Staff/Support | Auditor | Player |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Global configuration | F/D | F/D | — | — | — | scoped | — | — | R | — |
| Manage staff and roles | F/D | scoped/D | scoped | — | — | — | branch scoped | — | R | — |
| View player profile | F | F | F | limited | limited | limited | branch scoped | support scope | R | own |
| Verify/review identity | R | R | F | — | limited status | — | — | submit/escalate | R | own status |
| Safer-gambling cases/restrictions | R | R | F | limited alerts | — | — | escalate | open/escalate | R | own tools |
| Game catalogue config | F/D | F/D | approve gate | — | — | C/D | — | — | R | — |
| Game result publish/correction | D | D | review | — | — | C/D | — | — | R | — |
| View ledger / transactions | R | R | limited | F | scoped | limited | scoped totals | limited | R | own history |
| Deposit exceptions/reconciliation | R | R | limited | F/A | C | — | scoped read | view status | R | own status |
| Withdrawal request handling | R | R | risk hold/review | A | C | — | scoped request only | status only | R | C own |
| Wallet adjustment request | D | D | review if relevant | C/A (separate actors) | C limited | — | request only | — | R | — |
| Payment QR/provider config | D | D | — | approve | C | — | — | — | R | initiate provider QR only |
| Branch management | F | F | — | scoped reports | — | — | own branch | — | R | — |
| P&L/finance report | R | R | limited | F | scoped | game metrics | scoped | — | R | — |
| Audit log | F | F | scoped | financial scope | payment scope | game scope | branch scope | own action history | R | own security history |
| Support/complaints | F | F | compliance cases | payment cases | payment cases | game cases | branch scope | C/handle | R | own cases |

## 4. Scope model

Every user has `organization_id`. Optional assignments include `branch_id`, `partner_id`, `managed_game_ids` and `allowed_report_scopes`. A resource must carry the appropriate scope fields or a secure ownership relationship. Queries should include scope filters in the database access layer; do not fetch global data then filter it only in the UI.

## 5. Maker-checker rules

Require different actors for request and approval for:
- Withdrawals over the configured risk/amount threshold or any flagged payout.
- Wallet corrections, credits or debits.
- Changes to PSP, settlement account, QR/payment instructions or payout policies.
- Changing payout limits or account eligibility policies.
- Publishing matka/draw results or correcting game outcomes.
- Enabling real-money play or a new game version/provider.
- Creating or elevating privileged users.
- Changing retention, logging or security-critical settings.

Approval record contains maker, checker, action, reason, evidence, requested values, approved values, timestamps and immutable correlation ID. Enforce separation server-side, not via UI-only checks.

## 6. Staff security

- MFA required for all back-office users.
- Shorter session lifetime than players; re-authenticate for sensitive operations.
- Device/session revocation and immediate offboarding.
- Quarterly or policy-based access recertification.
- No shared staff accounts.
- Alert on unusual data exports, privilege changes, repeated failed MFA and after-hours break-glass actions.

## 7. Permission design for super admin

Super admin is not an excuse to bypass auditability. Emergency actions must be logged, justified, time-bound and reviewable. Do not provide a generic “edit any database field” feature. The highest privilege account must not be able to quietly rewrite financial or game history.
