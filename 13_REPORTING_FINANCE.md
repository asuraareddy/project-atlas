# 13 — Reporting, P&L & Finance Operations

## 1. Dashboard groups

### Executive dashboard
- Total eligible active players (definition configurable)
- New registrations and verification completion
- Game activity by game/category
- Deposit/withdrawal totals and pending age
- Revenue indicators with defined formula and current reconciliation status
- Safer-gambling/compliance case queue volume (without unnecessary sensitive details)
- Provider availability, error rate and operational incidents

### Payment/finance dashboard
- Deposit intents by status, provider and payment method
- Confirmed deposits, failed/pending deposits, chargebacks/disputes/refunds
- Withdrawals requested/approved/submitted/paid/failed/rejected with ageing
- PSP settlement and bank reconciliation differences
- Customer cash liability and reserved amounts
- Bonus/points liability or outstanding restricted balances, according to finance policy
- Adjustment requests and approvals

### Game operations dashboard
- Game/provider status and latency
- Live sessions and participation volume
- Rounds pending result, result approval queue and settlement backlog
- Voids, disputes, refunds and exceptions
- Game-version approvals and release status

### Branch/partner dashboard
- Scoped metrics only: assigned users/activity, permitted payment/support cases and approved finance summaries.
- No global player search, global provider credentials or other branch customer data.

## 2. Financial definitions

The client accountant must approve formulas before implementation. Suggested configurable concepts:

- **Stakes / participation amounts:** accepted and not voided participation value according to the product's accounting policy.
- **Winnings/prizes:** player amounts credited due to completed and validated outcomes.
- **GGR (Gross Gaming Revenue):** commonly modelled as stakes less winnings for relevant products, but exact treatment, timing, voids and product classification must be approved by finance.
- **NGR (Net Gaming Revenue):** configurable GGR less defined deductions such as bonuses/promotions, gaming duties/taxes, payment costs or other operator-defined items; not a hardcoded universal formula.
- **Net contribution:** defined subset of revenue less approved variable and allocated costs.
- **Cash liability:** customer cash balances, pending amounts and reservations according to approved accounting definition.
- **Bonus/restricted funds:** track separately by programme and terms version.
- **Points:** track issued, redeemed, expired, reversed and outstanding; don't treat as cash unless explicitly approved.

Every report displays its formula version and effective date. Historical periods remain calculated under the version applicable to that report or can be deliberately restated with a recorded reason.

## 3. Required reports

- Daily payments and PSP settlement reconciliation.
- Player cash liability and balance movement report.
- Deposits and withdrawals by status/provider/day.
- Payment method fees, refunds, chargebacks and failed payouts.
- Game-wise stakes, results, winnings, voids and settlements.
- Game/branch/partner P&L (scoped and based on approved attribution rules).
- Bonus and loyalty points ledger.
- Adjustment and privileged-action audit report.
- Suspicious/unusual payment and risk case report with access restriction.
- Safer-gambling actions/interventions and review outcomes.
- Complaint/dispute report and service-level ageing.
- User/admin access review and export audit report.
- Daily closing, outstanding exceptions and unresolved differences.

## 4. Report consistency and access

- Financial reports source from posted ledger facts or validated reporting tables; never sum client-side balances.
- Provide `asOf`, timezone, filters, formula version and reconciliation status.
- Define how late provider events restate reports; keep prior run snapshots/evidence where finance requires it.
- Exports require explicit permission, scope check, data minimisation and audit event.
- Background exports use expiring download links from private storage.
- Large reports are queued; user sees status and can only access their own permitted export.

## 5. Daily close

1. Freeze the report period according to the operator's UK business day and cutoff.
2. Import/receive PSP and game-provider reconciliation feeds.
3. Match platform events, provider reports, ledger and bank settlement.
4. Create exception cases for mismatches, duplicate items or missing provider events.
5. Finance reviews outstanding differences and unresolved liabilities.
6. Approver signs off with comments/evidence; don't suppress unmatched amounts to make totals appear correct.
7. Store signed report version, filters, formula version, data watermark and approval identity.

## 6. Data freshness

Label dashboard widgets as real-time, near-real-time or period-closed. A reporting replica/warehouse may lag; it must show the latest event watermark. For money-moving decisions, use authoritative API/ledger state rather than analytics cache.
