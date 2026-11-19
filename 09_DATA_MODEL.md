# 09 — Data Model (Logical Schema)

## 1. Rules

- Use UUID/ULID primary keys; all tenant-owned tables include `organization_id`.
- Use foreign keys, unique constraints and transactions for invariants.
- Use `created_at`, `updated_at` where mutable configuration is allowed; use `created_at` plus immutable status/event records for operational history.
- Money values are integer minor units (`amount_minor BIGINT`) with `currency CHAR(3)`, or exact `NUMERIC`; never `FLOAT`/`REAL`.
- Use `TIMESTAMPTZ` stored in UTC.
- Store identity provider references and result metadata, not document images by default.
- Scope-sensitive rows include `branch_id` or relationships that can be checked in every query.

## 2. Core tables

### Organisation and access

- `organizations(id, name, status, default_currency, timezone, created_at)`
- `branches(id, organization_id, name, code, status, created_at)`
- `users(id, organization_id, email_normalized, phone_normalized, password_hash_or_idp_ref, account_type, status, created_at)`
- `player_profiles(user_id, display_name, date_of_birth_ref/status, country, contact_preferences, created_at)`
- `staff_profiles(user_id, staff_code, department, active_from, active_until)`
- `roles(id, organization_id nullable, role_key, label, is_system_role)`
- `permissions(id, permission_key, description)`
- `role_permissions(role_id, permission_id)`
- `user_role_assignments(user_id, role_id, scope_type, scope_id, granted_by, starts_at, ends_at)`
- `sessions(id, user_id, device_hint, ip_hash_or_minimised, created_at, expires_at, revoked_at)`

### Eligibility / compliance

- `verification_cases(id, organization_id, user_id, provider, provider_reference, status, reason_code, requested_at, decided_at)`
- `account_restrictions(id, user_id, restriction_type, scope, starts_at, ends_at, reason_code, source_case_id, created_by)`
- `self_exclusion_records(id, user_id, provider_reference, scope, starts_at, ends_at, status, evidence_ref)`
- `safer_gambling_signals(id, user_id, signal_type, severity, metric_snapshot_ref, detected_at, rule_version)`
- `compliance_cases(id, user_id, case_type, priority, status, assigned_to, opened_at, closed_at, decision_code)`
- `compliance_case_events(id, case_id, event_type, actor_id, note_ref, created_at)`
- `customer_interactions(id, user_id, case_id, channel, action_type, outcome, actor_id, occurred_at)`

### Game configuration and sessions

- `game_providers(id, organization_id, name, status, integration_type, config_secret_ref, approved_scope_ref)`
- `games(id, organization_id, slug, name, category, provider_id, status, real_money_enabled, market_config, created_at)`
- `game_versions(id, game_id, version, rules_version, config_hash, test_evidence_ref, approval_status, approved_by, approved_at)`
- `game_schedules(id, game_id, schedule_version, opens_at, closes_at, result_due_at, status)`
- `game_sessions(id, game_id, game_version_id, user_id, provider_session_ref, status, started_at, ended_at, correlation_id)`
- `game_participations(id, game_session_id, user_id, round_id, stake_minor, currency, accepted_at, idempotency_key, status)`
- `game_actions(id, game_session_id, sequence_no, actor_id, action_type, action_payload_hash, validation_status, created_at)`
- `game_rounds(id, game_id, round_key, schedule_id, status, rules_version, result_ref, result_hash, published_at, settlement_status)`
- `game_results(id, round_id, proposed_result_hash, source_ref, proposed_by, approved_by, status, proposed_at, approved_at)`
- `settlements(id, round_id_or_session_id, settlement_key, status, rules_version, calculated_totals_ref, committed_at, correction_of_id)`
- `settlement_items(id, settlement_id, user_id, result_code, amount_minor, currency, ledger_transaction_group_id)`

### Wallet / ledger

- `wallets(id, user_id, wallet_type, currency, status, created_at)`
- `ledger_accounts(id, organization_id, account_code, account_type, user_id nullable, currency, status)`
- `ledger_transactions(id, organization_id, source_type, source_id, idempotency_key, status, reason_code, created_at, actor_id nullable, correlation_id)`
- `ledger_entries(id, transaction_id, ledger_account_id, direction, amount_minor, currency, created_at)`
- `wallet_holds(id, wallet_id, source_type, source_id, amount_minor, currency, status, created_at, released_at)`
- `wallet_balance_snapshots(wallet_id, cash_available_minor, cash_reserved_minor, bonus_minor, points_balance, last_ledger_entry_id, calculated_at)` — projection/cache only; rebuildable.
- `adjustment_requests(id, user_id, amount_minor, currency, direction, reason_code, case_id, maker_id, checker_id, status, ledger_transaction_id)`
- `loyalty_events(id, user_id, points_delta, rule_version, source_type, source_id, created_at)`

### Payments

- `payment_providers(id, organization_id, name, status, merchant_ref, secret_ref, capabilities)`
- `payment_intents(id, user_id, provider_id, amount_minor, currency, method, status, idempotency_key, provider_payment_ref, expires_at, created_at)`
- `provider_events(id, provider_id, provider_event_id, event_type, payload_hash, received_at, signature_valid, processing_status, processed_at)` with unique `(provider_id, provider_event_id)`
- `withdrawal_requests(id, user_id, amount_minor, currency, payout_instrument_ref, status, maker_id, checker_id, provider_payout_ref, risk_case_id, created_at, completed_at)`
- `payment_instruments(id, user_id, provider_token_ref, instrument_type, last_four_or_safe_label, verification_status, created_at)`
- `reconciliation_runs(id, provider_id, period_start, period_end, status, started_at, finished_at, difference_minor)`
- `reconciliation_items(id, run_id, platform_reference, provider_reference, expected_minor, actual_minor, currency, status, assigned_to, resolution_code)`

### Administration, audit and support

- `approval_requests(id, action_type, resource_type, resource_id, requested_by, requested_payload_hash, status, approved_by, reason, created_at, decided_at)`
- `audit_events(id, organization_id, actor_type, actor_id, action, resource_type, resource_id, reason, old_value_hash, new_value_hash, ip_hint, correlation_id, created_at)`
- `feature_flags(id, key, scope_type, scope_id, enabled, config_json, updated_by, updated_at)`
- `support_cases(id, user_id, category, priority, status, assigned_to, branch_id, created_at, resolved_at)`
- `support_case_events(id, case_id, actor_id, event_type, message_ref, created_at)`
- `notifications(id, user_id, channel, template_key, status, sent_at, provider_ref)`
- `outbox_events(id, aggregate_type, aggregate_id, event_type, schema_version, payload_json, created_at, published_at, attempts)`
- `processed_events(consumer_key, event_id, processed_at)` unique on `(consumer_key,event_id)`.

## 3. Important constraints

- Unique `(organization_id, user normalized identity)` consistent with approved account policy.
- Unique payment provider event ID and external payment reference.
- Unique `idempotency_key` scoped to operation type/actor or provider as appropriate.
- Unique settlement key; settlement must reference game version/rules version.
- Journal transaction balancing enforced in application transaction and preferably supported by deferred DB validation/controlled stored procedure where feasible.
- No `UPDATE`/`DELETE` permissions on posted ledger tables for ordinary service accounts; only tightly controlled migration/retention process under governance.
- Enforce row scope and tenant ownership on every admin data query.

## 4. Retention and privacy

The client privacy owner must set retention for account information, payment references, game events, interaction evidence, complaints, audit events and raw provider payloads. Raw webhook payloads may contain sensitive data; store only what is required, redact secrets, and consider retaining payload hashes plus a protected evidence store. Deletion workflows must respect valid financial/regulatory retention requirements and be logged.

## 5. Database migration strategy

- Version all migrations, run them in CI, and test forward/backward operational plan.
- Prefer expand/contract changes; don't deploy breaking schema changes and code simultaneously without a compatibility plan.
- Back up before destructive changes and verify restore.
- Use separate DB roles per API, worker, analytics and read-only audit.
- Never let the browser connect directly to a privileged database role.
