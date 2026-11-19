# 21 — Direct Crypto QR Deposits (No Payment Gateway)

**Version:** 1.2  
**Decision:** Deposit initiation is a direct on-chain crypto transfer to an operator-controlled receiving address shown as QR. No payment gateway/PSP checkout is in scope for deposits.  
**Important:** This is a technical/product specification, not a legal approval. The client is responsible for confirming the UKGC permission/product scope and approving the direct-crypto risk assessment, disclosures and any applicable notification before production.

## 1. Product boundary

- A player requests a deposit on the site and receives a QR code and copyable address.
- The player sends the exact approved crypto asset on the exact approved blockchain network.
- The platform detects and independently validates the on-chain transfer, waits for required confirmations and applies risk policy.
- Only then does the backend post the wallet credit once in the immutable ledger.
- There is no payment gateway, card processor or bank-QR checkout in this deposit workflow.
- A blockchain node/RPC endpoint or reliable indexer is still required to observe network activity. That is chain infrastructure, not a payment gateway.
- Crypto withdrawals are not implicitly included. Define withdrawal asset/network, destination verification and isolated transaction-signing workflow separately.

## 2. UKGC reference and operator gate

UKGC guidance on digital and virtual currencies says operators accepting digital currency directly or through a payment processor need to satisfy themselves and the Commission that they can meet AML and social-responsibility obligations. Its blockchain/crypto-assets guidance highlights source of funds, volatility relative to fiat (including deposit limits and AML triggers), fees, scalability, security of funds, custody, insolvency treatment, consumer disclosures and reporting expectations when payment methods change.

Primary references:
- https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/digital-and-virtual-currencies
- https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/blockchain-technology-and-crypto-assets
- https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/emerging-money-laundering-and-terrorist-financing-risks-from-october-2025

Before production, the operator's compliance lead must document the risk assessment, customer identification/source-of-funds policy, direct acceptance and custody model, crypto/GBP valuation policy, consumer disclosure, treatment of customer funds on insolvency and whether UKGC key-event/notification steps apply. A UKGC licence alone should not be treated by development as blanket approval for every payment method.

## 3. Configurable asset/network allow-list

Every accepted asset is a separate record including:
- canonical chain ID/network key and human-readable network label;
- asset symbol plus exact token contract/mint address if tokenized;
- decimals and native/base units;
- enabled/disabled state;
- minimum and maximum accepted amount;
- required confirmation depth and reorg policy;
- receiving-address strategy;
- valuation/rate source and quote policy;
- supported transaction watcher/adapter version;
- approval IDs, effective date and config hash.

Never use ticker alone (`USDT`, `USDC`, etc.) to identify an asset. The same symbol may exist on different chains or use different token contracts. Production must contain no placeholder addresses or unsupported assets.

## 4. Deposit user flow

1. Verify account eligibility, required identity status, restrictions, deposit limits and payment-risk policy.
2. Player chooses a configured asset/network and account-currency amount or selects from permitted deposit amounts.
3. Backend creates `crypto_deposit_intent` with unique idempotency key, immutable rate/quote policy version, expiry and status.
4. Address allocator produces a unique receiving address per intent where supported. If using memo/tag or shared-address design, client security/finance must sign off a reliable chain-specific matching method; amount-only matching is not acceptable.
5. UI displays: asset, network, token contract hint where helpful, QR, full address, quoted crypto amount, displayed account-currency value, quote expiry, estimated network fee caveat, minimum amount, confirmation expectations, irreversible-transfer warning and support link.
6. Player sends funds from their wallet. The page may accept a transaction hash for status lookup, but the hash is not accepted as proof.
7. Chain watcher detects the transfer independently and validates it using machine-readable chain data.
8. Risk engine evaluates configured source-of-funds, blockchain-address risk, transaction velocity and customer profile signals. Suspicious or unmatched cases go to trained human review.
9. On required confirmations and successful checks, a single transactional process records the chain receipt, deposit status, double-entry ledger group and outbox event.
10. UI refreshes from the server and shows `Credited` only after ledger posting. If any requirement is unmet, retain pending/review/exception state.

## 5. QR and receiving-address safety

- QR generation is internal and uses only the approved receiving address + exact asset/network URI format. It must never point to a staff wallet or a user-controlled destination.
- Display network name prominently above and below the QR. Do not rely on the wallet application automatically selecting the correct chain.
- Show the full address in selectable text; copy-to-clipboard is a convenience only, not a security guarantee. Consider copy confirmation and address-prefix display.
- Address assignments must be immutable records. Changing an operator wallet destination is a configuration migration requiring maker-checker, a controlled test transfer, reconciliation and audit.
- Monitor destination-address configuration and the actual address/derivation outputs. Alert if an address returned to the browser does not match the approved allocator output.
- Unique address per intent is preferred. If the chosen chain/provider cannot support it, explicitly document and test the alternative matching scheme before enabling the asset.

## 6. Chain watcher and transaction validation

The backend must independently obtain chain data through the chosen node/RPC/indexer service; multiple observation sources are recommended for high-value operations where practical.

Validate at least:
- chain ID/network matches the intent;
- transaction is in the expected canonical chain and has succeeded;
- destination equals the assigned address or exact memo/tag mapping;
- asset is native coin or the allow-listed token contract/mint;
- token decimals and base-unit amount are handled exactly;
- transaction hash and event/log index have not previously been processed;
- correct block number/hash and required confirmation depth are reached;
- transaction is not already credited to another player or intent;
- amount satisfies quote/underpayment/overpayment policy;
- no current chain halt, reorg incident, watcher lag or risk hold blocks credit.

For UTXO chains, validate outputs and spends. For EVM/token chains, validate chain ID and matching token transfer logs. Implement chain-specific adapters; do not build a universal ticker-based parser. A transaction in the mempool or an unconfirmed block is not spendable customer value.

## 7. Quote, conversion and amount policy

The following decisions must be explicitly configured and disclosed:
- account currency (recommended default: GBP-denominated ledger, but client must confirm);
- rate source(s), timestamp and availability requirements;
- quote lock moment and expiry;
- whether final credit uses the quoted value or value at a defined confirmation time;
- spread/fees, network-fee responsibility and exact rounding rules;
- minimum deposit and acceptable overpayment/underpayment tolerance;
- late arrivals after quote expiry and split/multiple transfers;
- whether a detected deposit is held for review before credit.

Store crypto amount in integer base units and GBP/account-currency credit in integer minor units. Store the exact rate, source, timestamp, quote version and calculation evidence used. Never use floating point. If price feed fails or rate differs beyond configured thresholds, pause credit or route to review; do not silently use stale rates.

## 8. Deposit state machine

Suggested states:

`created` → `awaiting_transfer` → `detected` → `confirming` → `risk_review` (optional) → `credit_eligible` → `credited`

Exception/terminal states may include `expired_unmatched`, `underpaid`, `overpaid`, `wrong_asset`, `wrong_network`, `failed_transaction`, `reorged`, `rejected_risk`, and `manual_review`. Never present an exception as success.

A status transition must have timestamp, source, correlation ID, policy/version and audit data. Transitions are idempotent; an event observed repeatedly must not create multiple credits.

## 9. Reorgs, duplicates and late transactions

- Define per-network finality/confirmation depth and observe the chain's reorg risk. A fixed generic number of confirmations is not correct for every chain.
- Do not credit before the configured threshold. If chain reorg occurs before threshold, return the intent to pending or exception.
- If a network can reorganize after the credit threshold, define an operator-approved remediation policy. Never delete ledger entries; use audited compensating entries and incident review where warranted.
- Use idempotency key based on chain + transaction hash + event/log index where needed. The same transfer observed by multiple watcher sources credits once.
- A late transfer to an expired address must not be silently ignored or credited to a new intent. Create an unmatched-transfer case and preserve traceability.

## 10. AML, source of funds and manual review

- Define risk scoring and hold triggers in the operator's AML risk assessment. Source of funds/wealth checks may be required based on customer risk and transaction profile.
- Integrate an approved blockchain analytics service if selected by the client; this is a risk-intelligence provider, not a payment gateway. If no vendor is selected, define the manual review capability and limits with compliance before launch.
- Flag known high-risk/sanctioned exposures, mixing/tumbling patterns or otherwise suspicious transfers according to the approved tool/policy, while preserving human review and documented dispositions where required.
- Keep transaction risk evidence access-controlled. Do not expose detection thresholds or sensitive monitoring logic in player-visible messages.
- Finance/Compliance can hold or release a case only under permission policy, with reason and audit. A release cannot override an unresolved legally required restriction.

## 11. Wallets, key management and operational security

- Deposit address derivation should use a hardened key-management design. A public derivation key may be used for receive-address generation only if reviewed and appropriately protected; do not expose private keys.
- Private keys/seed phrases must not be stored in browser storage, frontend environment variables, Git, normal database tables, support ticket attachments or logs.
- If withdrawal signing is later enabled, use a separate signer/HSM/multisig/custody workflow with limits, destination allow-lists as appropriate, two-person approval, transaction simulation/policy checks, signing audit and emergency pause. UI/admin servers must not directly export signing secrets.
- Separate hot and cold funds according to the client's approved custody/treasury design. Set alarms, access controls, rotation and key-compromise runbooks.
- The operator must choose how customer assets are held, segregated/reported, valued and disclosed, including insolvency treatment; this cannot be decided by the software developer alone.

## 12. Admin, finance and reconciliation views

Super admin and permitted finance/compliance roles may view:
- deposit intents by status, asset/network and time;
- received transaction hash, block, amount, confirmations and risk state;
- address assignment references (mask sensitive parts in general screens);
- valuation rate/source and credited account-currency amount;
- unmatched transfers, late/partial payments, wrong asset/network, reorgs and risk holds;
- chain watcher health, last indexed block, lag, rate-feed health and reconciliation differences.

No role receives private keys/seed phrases through an admin screen. Address/asset/rate/confirmation settings require proposal, separate approval, reason, version history and controlled test. Ordinary staff may not force-credit from a screenshot or delete a transaction.

## 13. Reconciliation

Reconcile multiple sources:
1. Deposit intents ↔ chain transactions by assigned address/transaction identity.
2. Chain transactions ↔ ledger posting ID.
3. Operator receiving-wallet balances/known flows ↔ internal chain watcher records.
4. Customer liability balances ↔ wallet subledger and reservations.
5. Crypto amount ↔ account-currency value using the exact recorded quote/rate policy.

Create cases for every unexplained difference, assign an owner and record disposition. Do not adjust records merely to make totals match. Keep event history, rate snapshots and ledger entries immutable.

## 14. Minimum production release gates

- Client confirms asset/network list, exact token contracts, account currency and exchange-rate policy.
- Client finance/security approves custody and address derivation architecture, receiving-address controls and reconciliation.
- Client compliance approves source-of-funds/blockchain risk process, risk holds, consumer disclosures and any applicable UKGC reporting/key event.
- Node/RPC/indexer resilience, confirmation depths, reorg handling, duplicate events and rate-feed failure are tested.
- Pen test includes address substitution, role bypass, credit forgery, replay, transaction-hash forgery, secret leakage and admin config abuse.
- Testnet or controlled low-value tests complete before production. No live real-money deposit activation before named sign-offs.
