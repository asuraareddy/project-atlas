# 03 — Functional Requirements Document (FRD)

## Requirement notation

IDs are stable references for backlog, tests and sign-off. Priority: **P0** mandatory foundation, **P1** initial controlled release, **P2** expansion. Every feature must be gated by operator configuration and permissions.

## A. Identity, accounts and eligibility

- **FR-ACC-001 (P0):** Support player registration, contact verification, login, logout, session revocation and account recovery.
- **FR-ACC-002 (P0):** Integrate configurable identity/age verification provider; store provider reference, status, timestamps and limited decision metadata, not unnecessary document copies.
- **FR-ACC-003 (P0):** Before wager acceptance, backend must evaluate `account_status`, verification status, self-exclusion/time-out, jurisdiction, game eligibility, unresolved restrictions and current limits.
- **FR-ACC-004 (P0):** Provide suspension, closure, safer-gambling restriction and reactivation states with reason, actor, time, expiry and evidence.
- **FR-ACC-005 (P1):** Support MFA for staff; step-up authentication for highly sensitive actions; strong account-security notifications.
- **FR-ACC-006 (P1):** Provide player activity, login history and session management.

## B. Game catalogue and sessions

- **FR-GAME-001 (P0):** Catalogue has game ID, provider/module, category, display name, enabled state, permitted market(s), min/max stake, rules version, test/certification evidence, release status and maintenance state.
- **FR-GAME-002 (P0):** Game is not real-money-enabled by default. Activation requires appropriate permission, complete required metadata, passed release gate and approval.
- **FR-GAME-003 (P0):** All sessions are created server-side with unique ID, player, game version, timestamp, state and correlation ID.
- **FR-GAME-004 (P0):** Server validates action sequence, timing, state transitions, stake and player eligibility; browser is only a presentation/input client.
- **FR-GAME-005 (P0):** Outcomes are attributable to a documented game engine/provider and rules version. Record the outcome hash/reference, provider reference, event times and verification evidence as applicable.
- **FR-GAME-006 (P0):** Duplicate round/settlement events are idempotent. A completed result cannot be edited in place; corrections use a separate incident/correction workflow with dual approval and audit trail.
- **FR-GAME-007 (P1):** Game operations can pause a game, a provider, a region or all wagering through kill switches. Existing rounds resolve by documented recovery policy.
- **FR-GAME-008 (P1):** Provide player round history, rules, limits and dispute reference.
- **FR-GAME-009 (P2):** Tournaments, leaderboards and seasonal events with clear terms and anti-collusion controls.

## C. Matka / number-draw module

- **FR-MAT-001 (P1, gated):** Treat as a separate game type requiring client-approved rules, market/ licence mapping, independent testing as required and documented result source.
- **FR-MAT-002:** Define schedule, sales cut-off, result publication state, eligible participation types, stake bounds, payout table, void/refund rules and settlement deadline as versioned configuration.
- **FR-MAT-003:** Result publication must be restricted to designated roles and require two-person approval where configured; preserve source evidence and before/after audit metadata.
- **FR-MAT-004:** No backdated result entry, hidden odds/payout changes, or result modification without creating a case and compensating ledger entries where needed.
- **FR-MAT-005:** Automatically stop accepted entries after the configured cut-off using server time; reject late submissions deterministically.
- **FR-MAT-006:** Run pre-settlement validation, duplicate detection, exposure report and exception queue before publishing settlements.
- **FR-MAT-007:** When schedule/result feed fails or is disputed, pause new entries and route affected rounds to an auditable incident workflow.

## D. Ludo, Carrom and Pool modules

- **FR-MULTI-001 (P1/P2 by game):** Provide lobby, matchmaking/invites, room/session state, player presence and reconnection handling.
- **FR-MULTI-002:** All turn/state transitions are validated server-side; a player cannot submit out-of-turn, stale or impossible moves.
- **FR-MULTI-003:** Define match format, entry fee/stake if permitted, prize/payout logic, tie/abandonment/disconnect policy, timeout rules and dispute process before enabling money play.
- **FR-MULTI-004:** Detect repeated collusion indicators, coordinated accounts, suspicious matching and abuse patterns; route to review rather than silently changing outcomes.
- **FR-MULTI-005:** When using a third-party game provider, store provider session ID, provider event IDs, rules/version, settlement references and reconciliation status.
- **FR-MULTI-006:** Practice/social mode must use non-redeemable points clearly labelled as such and must not permit conversion to cash or prizes unless separately approved.

## E. Wallet, points and financial ledger

- **FR-WAL-001 (P0):** Separate cash balance, bonus/restricted funds, pending cash movements and non-cash loyalty points.
- **FR-WAL-002 (P0):** Balance is computed from journal entries or a transactionally maintained balance projection derived from the ledger. No public/admin API accepts arbitrary balance replacement.
- **FR-WAL-003 (P0):** Every posting is append-only, balanced, idempotent, traceable and linked to a source business event.
- **FR-WAL-004 (P0):** Enforce atomic available-balance checks and stake reservation to prevent double-spend under concurrent requests.
- **FR-WAL-005 (P0):** Implement pending/posted/failed/reversed states and compensating postings for failures; do not delete ledger entries.
- **FR-WAL-006 (P1):** Support manual adjustment request with reason, evidence, limit, maker/checker approval and post-adjustment reconciliation. Block self-approval.
- **FR-WAL-007:** Loyalty points are non-cash unless an explicitly approved programme defines otherwise; no implicit cash conversion.
- **FR-WAL-008:** Expose transaction history, source/status, timestamps and references to player and authorised staff.

## F. Deposits, QR and payment integrations

- **FR-PAY-001 (P0):** Create payment intent server-side with amount, GBP currency, player, PSP, idempotency key, expiry, permitted method and status.
- **FR-PAY-002:** If QR is supported, generate it from the PSP payment intent or secure checkout flow. QR config changes require privileged approval, audit, test and verification.
- **FR-PAY-003:** Never credit a wallet from a screenshot, client-side redirect, user claim or unverified webhook.
- **FR-PAY-004:** Verify webhook signatures, timestamps/replay controls, event schema, amount, currency, merchant account and provider reference.
- **FR-PAY-005:** Deduplicate provider events and process event + ledger posting + payment status in one database transaction where possible.
- **FR-PAY-006:** Support provider reconciliation files/API, exception queues, refunds, disputes and chargeback states.
- **FR-PAY-007:** Provider/payment method must be explicitly allowed for the operator's business, geography and merchant account; payment by prohibited instruments is blocked.
- **FR-PAY-008:** Payment secrets live in a secret manager and are never exposed to the PWA or admin browser.

## G. Withdrawals

- **FR-WD-001 (P0):** Check available cash, account restrictions, identity status, payout destination ownership/verification and configured limits.
- **FR-WD-002:** Create a withdrawal case with pending/under-review/approved/rejected/submitted/paid/failed/cancelled state and timestamps.
- **FR-WD-003:** Apply risk and compliance holds before payout. Do not use extra information requests as a routine delay if the operator could reasonably have obtained required information earlier; exact workflow is client compliance-owned.
- **FR-WD-004:** Use maker-checker for configurable amounts/risk levels; requester cannot approve own request.
- **FR-WD-005:** Send payout via PSP API; only provider-confirmed state can mark it paid.
- **FR-WD-006:** Failed payout releases/reverses the reservation with balanced compensating entries and recorded reason.
- **FR-WD-007:** Alert on unusual payout velocity, changed payout instrument, mismatched owner data or repeated failed withdrawals.

## H. Admin, branch and staff

- **FR-ADM-001 (P0):** RBAC plus attribute/tenant scope controls; permissions are enforced server-side for every route and service.
- **FR-ADM-002:** Role assignment is constrained by a person's authority; no branch manager can create a global admin or expand scope beyond own authority.
- **FR-ADM-003:** Admin can search players using minimised data and permitted fields; all sensitive reads are auditable.
- **FR-ADM-004:** Branch users only see players/cases/financial summaries explicitly assigned to their branch scope. Data ownership and branch attribution must be defined.
- **FR-ADM-005:** High-risk operations (withdrawal approval, wallet adjustments, QR/provider changes, game/result configuration, privilege changes) support maker-checker and reason capture.
- **FR-ADM-006:** Staff offboarding disables sessions/API tokens immediately and records effective time.
- **FR-ADM-007:** Break-glass access is time-bound, MFA-protected, alerted and retrospectively reviewed.

## I. Safer gambling and compliance workflows

- **FR-SG-001 (P0):** Provide configuration points for deposit, loss and session/time limits as appropriate; validate and enforce on server before accepting actions.
- **FR-SG-002:** Provide time-out, self-exclusion and account closure controls; apply globally across games, promotions and deposits/wagering as defined by operator policy.
- **FR-SG-003:** Monitor spend, spend patterns, time spent, gambling behaviour, player contact, use of management tools and account indicators; allow operator to tune rules under governance.
- **FR-SG-004:** Create risk cases with rule, evidence links, severity, owner, due time, actions, contact history, outcome and audit trail.
- **FR-SG-005:** Strong-harm indicators can trigger immediate server-side restrictions; cases must support individual human review and customer contest process where applicable.
- **FR-SG-006:** Exclude customers from marketing/bonus offers when required by restrictions or risk decisions.
- **FR-SG-007:** Provide exportable evidence and action history for authorised compliance review.

## J. Reports, audit and support

- **FR-REP-001 (P0):** Show daily/weekly/monthly/custom range reports and consistent UTC-backed, UK-local display.
- **FR-REP-002:** Filter by game, status, payment provider, branch/partner, player, date and currency within access scope.
- **FR-REP-003:** Export CSV with permission checks, export audit event and PII minimisation.
- **FR-REP-004:** Show opening/closing balances, cash deposits, payouts, stake movements, prizes/winnings, bonus costs, fees, reversals and unexplained difference.
- **FR-AUD-001 (P0):** Audit actor, action, entity, previous/new metadata where safe, reason, timestamp, IP/device hints, correlation ID and approval chain.
- **FR-AUD-002:** Logs are append-only for application roles and sent to centrally controlled storage with retention policy.
- **FR-SUP-001:** Support cases track category, urgency, owner, status, messages, evidence, internal notes and resolution.
- **FR-SUP-002:** Complaints/disputes link to game rounds/payment refs and preserve immutable underlying records.

## K. System configuration and availability

- **FR-SYS-001:** Feature flags support kill switches per game/provider/market/payment method and system-wide wagering.
- **FR-SYS-002:** Every flag change is audited; critical enablement requires two-person approval.
- **FR-SYS-003:** Maintenance mode blocks new real-money actions while preserving safe read-only history and support access.
- **FR-SYS-004:** Alerts cover webhook lag, payout failures, game-provider downtime, queue backlog, ledger/reconciliation mismatches, error rates and security events.

## 5. Cross-cutting acceptance rules

- A user with no permission gets a server-side `403` even if they edit browser state or call an endpoint directly.
- Duplicate payment/game events do not duplicate money or settlement.
- A completed round and its ledger entries remain reproducible from stored event/configuration data.
- A self-excluded or otherwise blocked account cannot bypass restrictions by entering via a deep link, another game or websocket reconnect.
- All dates/times have unambiguous UTC storage and appropriate localized display.
