# 02 — Product Requirements Document (PRD)

## 1. Product vision

A fast, trustworthy and mobile-first multi-game destination with one coherent player account and a robust operational back office. The experience should feel like a professional UK gaming product, not a generic admin template. Clear rules, accurate wallet data, fair-game evidence, reliable support and visible player controls are core product qualities.

## 2. Personas

- **Player:** browses games, manages profile and limits, plays approved games, views cash/bonus/points separately, checks history and asks support for help.
- **Support agent:** locates a player, reviews permitted profile/payment/game history, opens a case and escalates; cannot change balances or approve withdrawals.
- **Branch/partner manager:** manages only assigned operational scope and scoped staff; sees permitted summaries and cases.
- **Finance operator:** reviews deposits, withdrawal queue, provider reconciliation and financial reports; cannot approve own payout or alter game outcomes.
- **Compliance officer:** handles verification exceptions, risk alerts, account restrictions, self-exclusion records, AML escalations and audit evidence.
- **Game operator:** configures approved game schedules/catalogue and monitors provider/session health; cannot bypass result approval controls.
- **Platform administrator:** manages users, roles, environments and operational settings within assigned authority; sensitive changes require approval.
- **Super admin:** organisation-level access and emergency actions, heavily audited and protected by phishing-resistant MFA where feasible.
- **Auditor:** read-only, time-bounded access to evidence, reports and system logs.

## 3. Player information architecture

1. Home / lobby
2. Game categories and game details
3. Game play screen
4. Wallet overview
5. Deposit
6. Withdrawal
7. Transaction history
8. Game/bet history
9. Offers and bonus terms (if enabled)
10. Profile, identity/verification status and contact details
11. Safer-gambling centre: deposit/loss/time limits, reality checks, time-out, self-exclusion and account closure links/actions as configured
12. Help centre, complaints and dispute status
13. Notifications and security activity

## 4. Admin information architecture

- Operations dashboard
- Players and account status
- Verification / compliance queue
- Safer-gambling alerts and interactions
- Game catalogue, providers, schedules, game versions and incident controls
- Deposits, withdrawals, reversals, chargebacks and provider reconciliation
- Wallet/ledger explorer (read-only ledger; separately controlled adjustment workflow)
- Bonus and points management
- Branches/partners and staff scopes
- Reports: cash movement, balances/liabilities, game activity, P&L, risk and audit
- Support tickets and complaints
- QR/payment configuration and payment-provider health
- Security: roles, MFA, sessions, API keys, audit logs, access reviews
- Feature flags, release approvals, maintenance mode and incident dashboard
- System settings and integrations

## 5. MVP feature set

### P0 — Required foundation
- Identity/account creation with email/phone verification and age/identity eligibility integration before real-money play.
- Server-side account status enforcement.
- Role-based admin and scoped branch/staff access.
- Cash wallet ledger and transaction history.
- Payment-provider sandbox integration, signed webhook receiver, idempotency and reconciliation.
- Game provider/module interface, game catalogue, session audit, result/settlement records.
- Responsible-play controls and case-management hooks.
- Admin audit log, alerting, backups and deployment pipeline.
- PWA installability, accessibility basics, fast initial render and no offline real-money actions.

### P1 — First controlled launch, subject to client approval
- Approved matka-style game module if the client confirms its exact game format is in scope.
- One approved multiplayer game (Ludo, Carrom or Pool) to validate realtime lifecycle.
- Withdrawal queue with two-person approval based on configured policy.
- QR/pay-by-bank flow only if the PSP supports it for this merchant and use case.
- Finance reports, payment reconciliation, scoped operational dashboards.
- Support and compliance case queues.

### P2 — Expansion
- Additional games with independent certification/approval as required.
- Loyalty programme using non-cash points.
- Configurable tournaments, leaderboards and promotional campaigns subject to approvals and terms.
- Multi-brand or white-label support if tenant isolation and compliance ownership are separately approved.
- Additional currencies/markets only after explicit architecture and compliance review.

## 6. Core player journeys

### Journey A — register and become eligible
1. Player registers with required contact details and proves possession of the contact channel.
2. The system obtains required identity and age verification status from the configured provider.
3. Eligibility service evaluates location/jurisdiction, account restrictions, self-exclusion and other required checks.
4. The account can browse public content while incomplete, but wagering, deposits or other functions are controlled by policy. Exact access matrix must be signed off by the client.
5. Only an eligible account can start a real-money game session.

### Journey B — deposit
1. Player selects amount within server-evaluated limits.
2. Backend creates an immutable payment intent and requests a provider checkout/QR if supported.
3. UI shows pending state; it never credits funds based on client redirect alone.
4. Provider webhook is signature-verified, deduplicated, validated against amount/currency/account and processed transactionally.
5. Ledger is posted exactly once; wallet display refreshes from server; reconciliation exceptions enter a queue.

### Journey C — play and settle
1. Server checks player eligibility, balance, limits and game availability.
2. Server reserves stake/participation amount within one transaction and creates an immutable game participation record.
3. Game module/provider processes action using a server-authoritative game/session ID.
4. Result is validated against game rules and version; idempotent settlement writes ledger entries and outcome record.
5. Player can see outcome and history. Disputed rounds are flagged and preserved, never rewritten silently.

### Journey D — withdrawal
1. Player requests amount to an eligible payout instrument; backend checks available cash, pending withdrawals, identity and account restrictions.
2. Request becomes a withdrawal case; risk/compliance controls may hold it for review.
3. A user other than the maker approves when policy requires dual control; staff cannot use their personal payout details to bypass the player-owned instrument checks.
4. PSP executes payout; signed status event reconciles provider reference and ledger; failed payments are reversed through compensating entries, not deletion.
5. Player is shown status, relevant next steps and support route.

### Journey E — safer-gambling intervention
1. Monitoring detects an indicator from spend, spend patterns, time, gambling behaviour, customer contact, management-tool use or account indicators.
2. Alert enters risk queue with explanation, context, timestamp and priority.
3. Appropriate trained staff review and record action and outcome; where policy requires, automation applies a protective restriction immediately.
4. Marketing/bonus eligibility and game APIs read the same central restriction state.
5. The system records review, rationale, decision, customer communication and follow-up. Automated decisions affecting customers require the operator-defined review/contest process.

## 7. UX requirements

- No misleading fake balances, confusing bonus/cash labels, or hidden wagering restrictions.
- Show available, pending, restricted and bonus values separately.
- Keep important actions reachable with one hand on mobile and provide accessible labels, focus states and error explanations.
- Confirm irreversible actions; avoid confirmation fatigue for routine navigation.
- Use plain English and GMT/BST-aware dates; internally store timestamps in UTC.
- Use skeleton/loading states for async balances, but do not render stale data as current.
- Display a clear connection status during realtime game sessions and recover safely on reconnect.
- Explain game rules, participation costs, settlement timing, and dispute route before play.

## 8. Product analytics

Events should be privacy-minimised, permissioned and documented. Suggested events: `registration_started`, `verification_status_changed`, `game_lobby_viewed`, `game_session_started`, `participation_accepted`, `round_settled`, `deposit_intent_created`, `deposit_confirmed`, `withdrawal_requested`, `withdrawal_paid`, `safer_gambling_tool_used`, `support_case_opened`. Do not send sensitive identity documents, full payment instruments or unnecessary special-category data to general analytics.

## 9. Launch gates

- Legal/compliance confirms every intended game, rules, licence/product mapping, target geography and marketing.
- Required independent game/software tests are passed and evidence is stored.
- PSP merchant acceptance, webhook security, payout and dispute flows pass sandbox and production readiness checks.
- KYC/age, safer-gambling, self-exclusion, complaints, security and customer-funds workflows pass end-to-end tests.
- Finance reconciles opening balances, deposits, stakes, winnings, bonuses, withdrawals, PSP settlement and liabilities.
- Accessibility/performance, restore drills, pen test findings and incident runbook are accepted.
