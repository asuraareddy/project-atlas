# 17 — Decisions & Open Questions

## Current planning defaults

| Topic | Planning default | Owner to confirm |
|---|---|---|
| Initial market | Great Britain only, subject to client product/licence scope | Client / compliance |
| Client licence | Client states UKGC licence exists; activity/game coverage not independently verified | Client / legal |
| Brand and domain | TBD; configurable per deployment | Client |
| Currency | GBP only | Finance |
| Roles | Super admin, operator admin, compliance, finance, payments, game ops, branch/partner manager, staff/support, auditor, player | Client ops |
| Branch meaning | Operational/partner data scope, not assumed retail premises | Client |
| Game order | Framework for four games; start with one approved game for controlled validation | Product / compliance |
| Matka variant | Exact rules, product class, result source, schedule and payout table not yet specified | Client / compliance / game ops |
| Ludo/Carrom/Pool | Custom build or provider TBD | Product / engineering |
| Payment rails | Approved PSP; dynamic PSP QR only if available/approved | Finance / PSP |
| Identity provider | TBD | Compliance / engineering |
| Safer-gambling tooling | Build controls + integrate selected providers where needed | Compliance |
| Branch revenue share | Not assumed; configurable finance mapping if needed | Finance |
| Bonus rules | Restricted bonus balance and separate non-cash points by default | Product / finance |
| Hosting | Frontend can be Vercel-compatible; API/workers/database deployed to approved region and architecture | Engineering / security |
| Technology | Next.js + TypeScript + PostgreSQL; backend-only ledger | Engineering |
| PWA | Installable; offline shell only; no offline money actions | Product / engineering |

## Decisions to resolve before estimates

1. Exact game format and rules for the matka-style product; how results are sourced and independently verified.
2. Are games custom-built, bought from third-party providers, or a mixture? What integration documentation and test environment exist?
3. Does each game use cash stakes, skill contest entry fees, tournaments, prizes, or practice-only points? Define separately per product.
4. Expected monthly active users, peak simultaneous game sessions, bets/actions per second and projected growth.
5. Which UKGC-permitted product activities and markets does the client intend to launch? Client compliance should map this per game and feature.
6. Which payment service provider and settlement bank has explicitly accepted this merchant/gambling use case? Is dynamic QR/pay-by-bank supported?
7. Which payout methods, withdrawal approval thresholds and hold/escalation rules apply?
8. What does “branch” mean commercially: reseller/agent, department, customer acquisition channel or internal location? What can it see and earn?
9. Which account verification, self-exclusion, affordability/financial-risk and customer interaction providers are already contracted?
10. What accounting definitions, customer funds arrangements, reporting periods, tax/duty handling, branch allocation and chart of accounts will finance approve?
11. Is multi-brand/white-label required at launch? If yes, define tenant isolation, domain mapping, branding, roles and which operator is accountable for each brand.
12. Which support channels, complaints SLA and dispute escalation routes are required?
13. What data retention periods, UK data-region preference, RPO/RTO, availability target and incident contact coverage are required?
14. What exact provider/test-house evidence and game release approvals will the client require before launch?
15. What does the phrase “ponyTail” in the original request refer to? The plan assumes **PWA-friendly code optimisation**, not a specific framework called Ponytail. Confirm if a specific library/framework was intended.

## Risk register

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| Game scope not confirmed | Release blocked / major rework | Product-by-product sign-off before implementing money flow | Client / compliance |
| Payment rail not accepted | Deposits/payouts unavailable | Obtain written PSP acceptance early; adapter design | Finance |
| Game result disputes | Financial/reputation risk | Versioned rules, immutable evidence, test coverage and incident workflow | Game ops |
| Ledger mismatch | Customer balances and reporting unreliable | Double-entry model, reconciliation, invariant alerts and stop switch | Engineering / finance |
| Privileged insider misuse | Theft/fraud | Least privilege, dual control, immutable audit, alerting | Security / client |
| Customer harm signal not actioned | Customer/regulatory risk | Central monitoring, trained workflow, SLAs and management reporting | Compliance |
| PWA stale cache | Incorrect state/action | Network-only financial/action APIs and reconnect reconciliation | Engineering |
| Vendor lock-in/outage | Service interruption | Adapter layer, documented exit/export, service health and recovery plan | Engineering |

## Sign-off register (complete before live launch)

| Area | Approver | Status | Evidence link |
|---|---|---|---|
| Product scope / game rules | Client product owner | Pending | |
| Applicable licence and markets | Client compliance/legal | Pending | |
| Game/software test evidence | Client + test house/provider | Pending | |
| PSP and payout methods | Finance + PSP | Pending | |
| Customer funds / accounting | Client finance/compliance | Pending | |
| Identity / age / restrictions | Compliance | Pending | |
| Safer gambling / AML workflows | Compliance | Pending | |
| Security / penetration test | Security owner | Pending | |
| Performance / resilience | Engineering / operations | Pending | |
| PWA accessibility / device matrix | Product / QA | Pending | |
| Customer support / complaints | Operations / compliance | Pending | |
| Production release / kill switch | Named release approvers | Pending | |
