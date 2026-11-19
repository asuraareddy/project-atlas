# 14 — QA, Testing & Release Plan

## 1. Testing layers

- Unit tests for domain rules, limits, state machines, payout calculations and role policy.
- Database integration tests for transactions, concurrent balance reservations, ledger invariants and migration correctness.
- Contract tests for PSP, KYC, game provider, notification and webhook integrations.
- End-to-end tests for registration, eligibility, deposit, game, settlement, withdrawal, restriction and support paths.
- Security tests for RBAC, IDOR/BOLA, injection, session handling, SSRF, CSRF, XSS, webhook signatures, rate limits and websocket controls.
- Load/stress/soak tests for concurrency, queue lag, game sessions, provider degradation and peak payment windows.
- Accessibility, responsive layout, iOS PWA and Android PWA tests.
- Disaster recovery: restore database and storage, reprocess outbox/queues safely, reconcile ledger and provider state.
- Required external/independent game and software testing selected by the client and test house.

## 2. Critical test scenarios

### Identity and eligibility
- Unverified, underage/ineligible, restricted or self-excluded account cannot place a stake through UI, REST endpoint, websocket, deep link or reconnect.
- Restriction applied while game open prevents the next prohibited action.
- Provider outage or unknown verification state fails closed for functions requiring verified eligibility.

### Ledger and money
- Two concurrent requests cannot spend the same available balance.
- Duplicate deposit webhook creates exactly one ledger posting.
- Out-of-order provider events don't revert a final paid state without controlled investigation.
- Incorrect amount/currency/merchant reference webhook is rejected and escalated.
- Failed withdrawal releases the hold once; duplicate failure webhook does not double-release.
- Adjustment maker cannot approve own request.
- Every journal group balances; snapshots can be rebuilt from ledger.
- Currency rounding, maximum integer limits, negative values and decimal injection are tested.

### Game integrity
- Client submits fake winner/payout/balance; server ignores/rejects it.
- Invalid action order, stale state, replayed action and duplicate sequence are rejected.
- Result event and settlement repeated multiple times produce one settlement.
- Conflicting result from provider creates incident and doesn't overwrite a committed result.
- Matka/draw entry after cutoff is rejected using server time.
- Paused game/provider blocks new sessions/participations but applies documented recovery to accepted rounds.
- Disconnection, abandoned game, timeout, ties, void/refund and dispute cases match approved rules.

### Admin/branch
- Branch manager cannot access another branch by changing IDs in URL/request.
- Support staff cannot see full payment instruments or adjust balances.
- Super admin privilege changes are logged and trigger alert.
- Staff offboarding invalidates active sessions and tokens.
- Feature-flag real-money enablement requires configured approvals and cannot be enabled by non-production environments.

### PWA
- Wallet is not served from stale service-worker cache.
- No real-money actions are accepted offline.
- Service worker updates do not corrupt an active session.
- Logout and account switching clear protected client state.
- On timeout after stake submission, client queries action state rather than sending a new stake blindly.

## 3. Test accounts and fixtures

Use synthetic identities only. Include fixtures for clean verified user, pending verification, failed verification, blocked account, self-excluded account, low balance, pending deposit, duplicate webhook, withdrawal hold, chargeback, provider outage, branch staff, finance maker/checker and auditor.

## 4. Release pipeline

1. Pull request with code review and passing type/lint/unit/security/dependency checks.
2. Build artifact and run integration/contract tests.
3. Deploy to test environment and run e2e + regression suites.
4. Run migrations in a rehearsed sequence; verify backward compatibility.
5. Release candidate deployed to staging with sandbox providers and production-like load.
6. Security and independent testing evidence linked to release.
7. Client product/compliance/finance approval, game version approval, payment provider approval and operations readiness sign-off.
8. Production deployment with real-money flags off.
9. Smoke tests and reconciliation checks, then controlled feature activation with named approvers.
10. Monitor metrics and rollback/kill-switch readiness.

## 5. Go/no-go criteria

- No open critical/high severity security finding without documented risk acceptance by authorised owner.
- No known ledger invariant issue or unresolved critical reconciliation defect.
- All applicable game/software tests completed with evidence.
- Required customer identity, self-exclusion and safer-gambling controls pass end-to-end.
- PSP webhooks/payout/reconciliation work in production certification path.
- Backups restored successfully; on-call and incident contacts available.
- Legal/compliance/client approval recorded for each game, market, payment method and marketing launch.

## 6. Post-launch monitoring

For the first 72 hours, use heightened monitoring of payment-event lag, wallet discrepancies, duplicate events, settlement backlog, provider uptime, restricted-account blocks, safer-gambling alert backlog, error rates and complaints. Any unexplained ledger imbalance, result-integrity issue or restriction bypass triggers immediate pause of the affected flow and incident response.
