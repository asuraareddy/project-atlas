# 10 — Security, Privacy & Compliance-by-Design

## 1. Ownership

Client is the accountable gambling operator and owns the interpretation of its licence, product approval, customer policies, legal notices and operational decisions. Development team owns implementing the agreed controls, preserving evidence, identifying gaps, and not silently enabling unapproved gambling functions. Before launch, client compliance/legal leads must verify current UKGC requirements and the exact product/technical scope.

## 2. UKGC-related engineering inputs

This system design should be reviewed against the current versions of:
- Remote Gambling and Software Technical Standards (RTS), including technical standards, security requirements, and testing timing/procedure: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/remote-gambling-and-software-technical-standards
- Online LCCP conditions (version shown by UKGC as effective 29 July 2026 at research time): https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/online
- Remote customer identity verification condition 17.1.1: https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/condition/17-1-1-customer-identity-verification
- Remote customer interaction condition SR 3.4.3: https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/condition/3-4-3-remote-customer-interaction
- Customer-funds segregation condition 4.1.1: https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/condition/4-1-1-segregation-of-funds
- Customer funds guidance and insolvency ratings: https://www.gamblingcommission.gov.uk/guidance/customer-funds-segregation-disclosure-to-customers-and-reporting/introduction-customer-funds-segregation-disclosure-to-customers-and
- Credit card payment ban through money service businesses: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/credit-card-payments-made-through-money-service-businesses
- Testing strategy: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/testing-strategy
- Approved test houses: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/test-houses

These links are a starting checklist, not a guarantee of complete compliance. RTS material indicates changes effective 30 June 2026; confirm all current documents and applicability before release.

## 3. Release control

Every game/payment product configuration must carry:
- `approval_status` and approver identities;
- allowed market/jurisdiction and product mapping;
- game/provider/version identity;
- test evidence reference and applicable test house/process;
- approved rules, limits, disclosures and incident/void rules;
- sign-off timestamp and release change ID.

Real-money game, deposit, withdrawal, bonus and marketing features default OFF. Only a controlled production operator can enable a feature after required product, compliance, provider, finance, security and testing approvals are recorded. New development and preview environments use sandbox payments and test credits only.

## 4. Identity, age and eligibility

- Required name, address and date-of-birth information must be verified before the customer is permitted to gamble, consistent with applicable remote identity verification requirements.
- Expose a central eligibility decision, used before deposit/wager/withdrawal/bonus/marketing actions as policy requires.
- Preserve provider reference and decision metadata; minimise collection of identity documents.
- Block restricted/unverified users consistently across direct API, websockets, deep links, mobile browsers and reconnects.
- A withdrawal process must not routinely request information late if it could reasonably have been requested earlier; additional legal-obligation checks remain an operator-controlled exception.
- Use provider webhooks/polling with dedupe and failure alerts; never assume missing callback means success.

## 5. Safer gambling

Implement a configurable framework for:
- Deposit, loss and session/time controls as selected by the operator.
- Time-out, self-exclusion, account closure and reactivation processes.
- Central restriction evaluation for all games, promotions and account actions.
- Monitoring of spend, spend patterns, time, behavioural indicators, customer-led contact, management-tool use and account indicators.
- Risk alert queue, human review, recorded intervention, outcome assessment, follow-up and evidence exports.
- Immediate protective action when high-risk policy triggers require it, plus human review/contest process where applicable.
- Marketing/bonus suppression where restrictions/risk processes require it.

The software supports configuration and evidence, but the client must define trained roles, procedures, thresholds, response times, messages, escalation and policy review.

## 6. AML/fraud and account abuse

- Integrate risk/transaction monitoring with configurable rules and case workflow.
- Flag velocity, unusual payment patterns, repeated failed payouts, account takeover signals, unusual device/location changes, possible multi-account abuse, collusive matches and payment instrument changes.
- Keep decision trace: signal, version, evidence references, action, reviewer and disposition.
- Do not expose anti-fraud rules in player-visible error messages beyond necessary communication.
- Client compliance determines legal reporting obligations, thresholds and retention; the app must not auto-file legal reports without a separately approved process.

## 7. Customer funds and payments

- Support separation of customer balances, a client-funds snapshot, reconciliation and configurable disclosure versions.
- Client finance/compliance must determine the appropriate customer-funds arrangement/rating and required disclosures.
- Use approved payment methods and prevent prohibited instrument use/circumvention.
- No PSP redirect-only credit; use signed provider confirmation.
- Maintain accurate withdrawal status and don't use staff/manual QR proof as a financial source of truth.

## 8. Data protection and privacy engineering

- Maintain a data inventory covering each field, purpose, access, retention and processors/subprocessors.
- Collect the minimum needed. Redact secrets and payment/identity information from logs and analytics.
- Encrypt in transit and at rest; restrict private object storage; use expiring signed links.
- Provide user workflows for applicable access/correction/deletion requests, with retention/recordkeeping exceptions reviewed by the client.
- Apply retention schedules, deletion/anonymisation jobs and evidence of completion.
- Review international transfers, hosting region, vendor subprocessors, cookies/analytics and consent requirements with client privacy counsel.

## 9. Threat model and security controls

| Threat | Controls |
|---|---|
| Account takeover | MFA/options, credential protection, rate limits, session revocation, risk alerts |
| Staff privilege abuse | Least privilege, scoped RBAC, dual control, immutable audit, alerts and periodic reviews |
| Double-spend / race condition | Atomic reserve/debit transaction, serializable/locking strategy as needed, unique idempotency keys, concurrency tests |
| Duplicate/malicious webhook | Signature validation, replay window, unique provider event ID, schema validation, idempotent consumer |
| Client-forged outcome | Server-authoritative state, signed provider outcomes, game version evidence, settlement validation |
| QR replacement / payment diversion | PSP-generated intent, dual approval for config, smoke test, audit and destination verification |
| IDOR / cross-branch leakage | Object-level auth, scope constraints at query layer, penetration tests |
| Realtime socket misuse | Auth per connection and action, room authorization, message schema validation, rate limits |
| Data exfiltration | Least privilege, export controls, audit, encryption, DLP/alerts where available |
| Dependency/build compromise | Lockfiles, scanning, SBOM, protected branches, signed artefacts where practical |
| Backup compromise | Separate account/project, encryption, least privilege, restore drills |

## 10. Incident response

Create runbooks for: suspected account takeover, payment provider compromise, financial ledger mismatch, suspected result manipulation, game provider outage, customer data incident, inaccessible self-exclusion, unsafe customer-harm alert backlog, ransomware and failed restore. Each runbook needs owner, severity criteria, containment actions, evidence preservation, client notification path and recovery validation. The client decides statutory/regulatory notification obligations with counsel.

## 11. Pre-launch sign-off checklist

- [ ] Client confirms precise licensed activity and each game variant is within approved scope.
- [ ] Applicable RTS/LCCP and supplier/test-house requirements reviewed against current live versions.
- [ ] Identity/age verification and central eligibility gates verified end-to-end.
- [ ] Safer-gambling limits, self-exclusion, interaction cases, escalation and evidence flows signed off.
- [ ] Payment methods, credit restrictions, deposit QR, payout and reconciliation approved by PSP/client finance/compliance.
- [ ] Customer funds arrangements/disclosures and accounting definitions signed off.
- [ ] Test evidence for each applicable game/software version retained.
- [ ] Security review, vulnerability remediation, penetration test and access review complete.
- [ ] Load, disaster recovery, backup restore, alerting and on-call runbooks tested.
- [ ] Public terms/privacy/cookies/complaints and player-facing game disclosures approved by the client.
- [ ] Production release and kill-switch drill completed with named approvers.
