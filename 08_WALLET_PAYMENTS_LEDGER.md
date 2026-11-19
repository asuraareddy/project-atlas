# 08 — Wallet, Payments, QR & Ledger

## 1. Non-negotiable design

A wallet is an accounting domain, not a mutable number field. The platform must keep an immutable journal of every debit, credit, reserve, release, payout and correction. An available-balance projection may be maintained for speed, but it must be transactionally consistent with the journal and rebuildable.

## 2. Balance types

- **Cash available:** customer funds available for permitted real-money actions or withdrawal, subject to holds and rules.
- **Cash reserved:** cash temporarily committed to an accepted game/withdrawal/pending operation.
- **Bonus/restricted funds:** promotional or restricted balance governed by versioned terms; never silently presented as withdrawable cash.
- **Non-cash points:** loyalty or practice points that are not cash and cannot be withdrawn/transferred unless the operator later approves a separately designed programme.
- **Pending deposit / pending withdrawal:** operational states; avoid blending them into cash available.

The UI must label each category and explain restrictions. Account snapshots are not a substitute for ledger entries.

## 3. Ledger invariants

1. Use double-entry journal groups or an equivalently controlled, balanced accounting model.
2. Every journal group balances by currency and accounting dimension: total debits = total credits.
3. Use integer minor units for GBP pence or exact decimal numeric types; do not use floating point.
4. A posting is immutable; corrections use new reversing/compensating postings linked to the original.
5. Unique source key prevents duplicate posting (e.g. `deposit:{provider}:{provider_event_id}`).
6. Each posting stores actor/system, business reason, source type/id, correlation ID, effective/created timestamps and currency.
7. Debit availability checks and reservation must be atomic under concurrent requests.
8. Separate ledger accounts for customer cash liability, PSP clearing, game stakes/participation, prize/winnings liability, bonuses, fees/adjustments and operator revenue as finance approves.
9. A ledger invariant or unexplained balance difference triggers an alert and halts the affected money-moving path.
10. Admin UI never sends an arbitrary new balance; it submits a controlled adjustment request.

## 4. Deposit flow

1. Player requests a deposit amount.
2. Backend checks status, eligibility, configured limits and payment method policy.
3. Backend creates `payment_intent` and idempotency key, then asks approved PSP for checkout details.
4. PSP returns a secure redirect/checkout token or a dynamic QR/payment request, if supported.
5. UI shows pending until backend has verified a provider event.
6. Webhook endpoint verifies signature on raw body, timestamp, replay window, merchant ID, event type, amount/currency and payment intent reference.
7. Deduplicate by provider event ID; update intent and post ledger once in transaction.
8. Provider settlement/reconciliation feed is compared with platform records.

**Never:** credit on client redirect alone; credit from screenshots; use QR codes whose destination can be replaced without control; accept payment to personal staff accounts; store raw card data unless there is an independently approved PCI-compliant design (prefer PSP-hosted forms/tokenisation).

## 5. QR configuration and governance

- QR content is generated per payment intent by an approved PSP or approved bank/payment flow.
- Static/global QR is disabled by default. If a provider contract requires a static QR, compliance/finance/security must document how customer and transaction matching, fraud controls, refunds and reconciliation work before enabling it.
- Changing merchant ID, payee details, webhook secret, callback URL or QR instructions requires maker-checker approval, verification in sandbox, a test transaction and audit event.
- QR generation and payment initiation endpoints are rate-limited; QR payload is short-lived where the provider supports expiry.
- QR is a presentation method, not evidence of payment. Only verified PSP/bank status qualifies.

## 6. Withdrawal flow

States: `requested` → `risk_review` or `awaiting_approval` → `approved` → `submitted_to_provider` → `paid`; alternate terminal states include `rejected`, `failed`, `cancelled`, and `needs_customer_action`.

- On request, validate available cash, payout destination, account/identity status, account restrictions and policy limits.
- Reserve the requested amount so concurrent game actions cannot spend it.
- Apply risk screening and any pending verification/legal review as policy requires.
- Require second-person approval for thresholds and risk flags.
- Submit through the approved PSP/bank payout API and persist provider references.
- Release reservation or post compensating entries only after confirmed failure/cancellation; do not mark paid based on an admin checkbox alone.
- Preserve all decision reasons and show customer a meaningful status.
- Keep payout instrument changes auditable and consider a cooling/review period based on risk policy.

## 7. Manual adjustments

Only use for documented correction/exception cases, never to hide a loss or fix a production bug by changing a balance. Required fields: customer, amount/currency, debit/credit direction, reason code, detailed reason, case ID, evidence, maker, checker, original source if correcting, and accounting approval. Enforce limits, dual control and daily adjustment reports.

## 8. Reconciliation

Reconcile at least these layers:

- Platform payment intents versus PSP transactions.
- Platform ledger clearing accounts versus PSP settlement statements and bank settlement.
- Platform withdrawal states versus provider payout reports.
- Game participation/settlement versus provider result/round reports.
- Customer cash liability versus sum of customer ledger balances/reservations.
- Bonuses/points issued, redeemed, expired and reversed versus promotional ledger/control totals.

Every mismatch becomes a case with amount, currency, age, severity, owner, status and disposition. Never silently force records to match. Daily close requires sign-off, unresolved difference disclosure and exportable evidence.

## 9. Customer funds and accounting

Client finance/compliance decides and documents the applicable customer-funds arrangements, rating/disclosures, bank account segregation, regulatory reporting and accounting policies. The software should support: customer-funds balance snapshots, reconciliation reports, disclosure version tracking, effective dates and evidence attachments. Do not hardcode a legal conclusion into the product.

## 10. Credit/payment restrictions

Use payment providers and instruments only after the client has approved them for the specific UK gambling use case. Block prohibited instruments and prevent obvious circumvention through intermediary services. Avoid cryptocurrency, manual bank transfer, cash agents or peer-to-peer rails in MVP unless the client proves the exact approval and controls.

## 11. Example posting pattern (illustrative, not the client's chart of accounts)

On confirmed deposit of £20.00, the accounting design may debit a PSP clearing/receivable account and credit customer cash liability by 2,000 pence; when the PSP settlement arrives, clear the receivable against bank cash. Exact account mapping must be approved by finance. The player-visible wallet is a liability subledger view, not a bank account.
