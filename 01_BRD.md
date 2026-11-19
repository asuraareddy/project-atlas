# 01 — Business Requirements Document (BRD)

## 1. Executive summary

Deliver a responsive, PWA-installable multi-game platform for the client's UK-facing gaming business. Players can register, complete the required verification flow, explore approved games, manage available funds, play supported games, see activity history, and use safer-gambling controls. The operator manages the platform through a hierarchy of super admin, platform admin, compliance, finance, operations, branch/partner managers and scoped staff.

The project is not just a website. It includes the game catalogue, game session/orchestration layer, wallet and double-entry ledger, payments/reconciliation, settlement, risk monitoring, reporting, support workflows, and auditable administration.

## 2. Business goals

- Offer a consistent player experience across number/draw games and multiplayer skill-based games.
- Provide one secure account and account-level wallet ledger for supported products.
- Give authorised teams near-real-time operational visibility for deposits, withdrawals, game activity, balances, adjustments, points, risk alerts and profitability.
- Reduce manual reconciliation and prevent untracked balance changes.
- Support configurable brand, game, market and branch/partner settings without changing code for every ordinary configuration update.
- Enable an installable PWA that remains responsive on mid-range Android phones, iPhones and desktop browsers.
- Build an auditable platform with release controls that prevent untested/unapproved games and payment methods from being enabled.

## 3. Stakeholders

| Stakeholder | Primary concern |
|---|---|
| Client / accountable operator | Product scope, regulatory responsibilities, commercial performance, customer outcomes |
| Super admin / platform owner | Global configuration, organisation, system health and privileged access |
| Compliance & safer-gambling team | Verification status, account restrictions, alerts, self-exclusion, customer interaction evidence |
| Finance & payments | Cash movement, payment status, reconciliations, liabilities, chargebacks, ledger integrity |
| Game operations | Game schedules, provider health, incidents, approved configuration, settlement status |
| Branch/partner managers | Scoped player/service visibility and permitted operational tasks |
| Support staff | Customer enquiries, case notes, escalation and read-only financial history |
| Players | Fair and understandable games, accurate balances, safe account controls, transparent history |
| Providers / test house | Integration contracts, evidence, technical test and release requirements |

## 4. Scope

### In scope

- Player website/PWA and secure account profile.
- Game lobby, game details, sessions, history, notifications and responsible-play tools.
- Configurable game modules: matka-style number/draw, Ludo, Carrom and Pool.
- Account wallet with separate cash, bonus/restricted funds and non-cash loyalty points.
- Deposit and withdrawal request flows via approved payment service providers (PSPs), provider-generated QR/payment links where supported, webhook processing and reconciliation.
- Back office roles, branch/partner scoping, staff management, dual approvals and immutable audit trail.
- Risk/compliance cases, verification integrations, restriction enforcement and operational reporting.
- Financial dashboards, P&L estimates, game-wise and branch-wise reports, exports and settlement reports.
- Configuration management, provider monitoring, support tools and incident logs.
- Security, observability, backups, CI/CD, testing, PWA and performance optimization.

### Out of scope for the first release

- Native iOS/Android applications.
- Cryptocurrency deposits/withdrawals.
- Unapproved payment rails, peer-to-peer money transfers, staff-held customer funds or manual screenshot-only payment proof.
- Unverified random-number systems or client-side-controlled result generation.
- Cross-border availability, currencies, languages or separate brands unless expressly approved in a signed change request.
- Direct customer-to-customer transfers, credit/overdraft, credit-card-funded gambling, or any feature prohibited by the operator's approved policies.
- Automatic tax/legal conclusions; finance reports are configurable operational reports, not a replacement for professional accounting.

## 5. Business rules / principles

1. Real-money features are feature-flagged and default OFF in every new environment and game.
2. No gambling before required identity/age checks are completed and the account is eligible.
3. Self-exclusion, time-out, account closure, jurisdiction restrictions, and compliance blocks must be enforced server-side across all games and promotions.
4. A client browser never determines authoritative balances, accepted stakes, game results, winners or settlement amounts.
5. Every money movement must have a unique idempotency key, ledger entries, source reference, status history and audit event.
6. No database row update or admin action may silently overwrite financial history.
7. High-risk transactions and privileged changes use separation of duties and configurable maker-checker approval.
8. Branches only see records in their assigned scope; global access is limited to authorised roles and purpose.
9. Game configuration and result publishing require role separation, audit logging, and where appropriate dual approval.
10. PWA offline mode must not accept real-money bets, withdrawals, or display stale cached balances as current.

## 6. Success measures (provisional)

- 100% of financial ledger entries linked to an idempotent source event and actor/system identity.
- 100% of game sessions linked to an approved game version/configuration and immutable outcome record.
- 100% of privileged configuration, wallet adjustment, payout, role change and result-management events logged.
- 0 unauthorised cash-balance edits through user-facing clients.
- 100% of applicable restricted/self-excluded accounts blocked by server-side checks across all games.
- Payment reconciliation exception rate measured daily and assigned to an owner; target agreed with client before launch.
- PWA Core Web Vitals measured on production-like traffic; target baseline documented in `12_PWA_PERFORMANCE.md`.
- Recovery, alerting, backup restoration and incident response tested before launch.

## 7. Commercial reporting definitions

Finance must approve the definitions used for Gross Gaming Revenue, Net Gaming Revenue, bonuses, fees, payment costs, duty/tax, branch share, net contribution and liabilities. Do not hardcode a single definition as a legal/accounting fact. Reports must show the selected formula/version and effective dates so historical reports remain interpretable.

## 8. Dependencies

- Client provides confirmed UKGC licence/product scope and its compliance interpretation for each intended game and feature.
- Payment providers approve the merchant, UK gambling use case, settlement account, QR/pay-by-bank rails and payout workflow.
- Appropriate identity verification, sanctions/PEP where applicable, affordability/financial-risk or safer-gambling tooling, self-exclusion and customer-support processes are selected and contracted.
- Game mechanics, rules, odds/return disclosures where applicable, result generation, independent testing strategy and test-house responsibilities are approved.
- Hosting, data residency, retention, privacy notice, incident notification and vendor due diligence are approved.

## 9. Key risks

- Product activity does not match the precise licence permissions or provider contract.
- Payment provider or banking partner refuses/changes support for gambling-related payments.
- Ledger race conditions, duplicate webhooks or settlement retries cause balance discrepancies.
- Insider abuse through unrestricted super-admin access, result changes, QR changes or payout overrides.
- Unapproved game update bypasses test/approval gates.
- Customer harm signals are not monitored, acted on, or evidenced.
- PWA caches stale balances or allows conflicting game actions during connection loss.
- Branch reporting exposes customer data across organisational boundaries.

## 10. Acceptance at BRD level

Client owner, product lead, finance, compliance, security and engineering sign off the business scope, money definitions, game list, role model, risk register and launch gates before production real-money capabilities are enabled.
