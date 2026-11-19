# 11 — API Contracts (Initial Draft)

## 1. Conventions

Base path: `/api/v1`. JSON request/response. UTC timestamps in ISO 8601. Currency amounts use integer minor units. All money-moving requests require `Idempotency-Key`. Responses include `correlationId`. APIs enforce permissions and account eligibility server-side.

Example success:
```json
{
  "data": { "id": "01J...", "status": "pending" },
  "meta": { "correlationId": "01J..." }
}
```
Example error:
```json
{
  "error": {
    "code": "ACCOUNT_NOT_ELIGIBLE",
    "message": "This action is currently unavailable for your account.",
    "correlationId": "01J..."
  }
}
```
Don't expose stack traces, private risk rules, provider secrets or internal user existence details.

## 2. Player endpoints (indicative)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /me/eligibility`
- `GET /me/wallets`
- `GET /me/transactions?cursor=&limit=`
- `POST /me/safer-gambling/limits`
- `POST /me/safer-gambling/time-out`
- `POST /me/safer-gambling/self-exclusion`
- `GET /games`
- `GET /games/{gameId}`
- `POST /games/{gameId}/sessions`
- `POST /game-sessions/{sessionId}/actions`
- `GET /me/game-history?cursor=&limit=`
- `POST /payments/deposit-intents`
- `GET /payments/deposit-intents/{id}`
- `POST /withdrawals`
- `GET /withdrawals/{id}`
- `POST /support-cases`

Sensitive actions such as identity data, payout instrument changes, financial operations and account restrictions require additional checks and appropriate authentication.

## 3. Admin endpoints (indicative)

- `GET /admin/dashboard/summary`
- `GET /admin/players?filters...`
- `GET /admin/players/{id}`
- `POST /admin/players/{id}/restrictions` (permission + reason + approval as required)
- `GET /admin/compliance-cases`
- `POST /admin/compliance-cases/{id}/events`
- `GET /admin/payments/deposits`
- `GET /admin/payments/withdrawals`
- `POST /admin/withdrawals/{id}/approve`
- `POST /admin/withdrawals/{id}/reject`
- `POST /admin/wallet-adjustments` (creates a request; does not post directly)
- `POST /admin/approvals/{id}/approve`
- `GET /admin/ledger/transactions` (read-only)
- `GET /admin/reconciliation/runs`
- `POST /admin/reconciliation/runs`
- `GET /admin/games`
- `POST /admin/games/{id}/configuration-requests`
- `POST /admin/games/{id}/pause`
- `POST /admin/games/{id}/release-requests`
- `GET /admin/reports/pnl`
- `GET /admin/audit-events`
- `POST /admin/feature-flags/{key}/change-requests`

Do not create a generic endpoint such as `PATCH /wallets/{id}` or `PATCH /game-results/{id}` that directly overwrites authoritative state.

## 4. Create a deposit intent — request

```json
{
  "amountMinor": 2500,
  "currency": "GBP",
  "paymentMethod": "provider_checkout",
  "returnUrl": "https://example.invalid/payment/return"
}
```

Server: authenticate player; check account status, verified eligibility, configured deposit limits, PSP availability and blocked instrument policy; validate return URL against allow-list (avoid open redirect); create payment intent idempotently; request PSP session. Return only safe provider checkout fields.

Response:
```json
{
  "data": {
    "paymentIntentId": "01J...",
    "status": "pending",
    "amountMinor": 2500,
    "currency": "GBP",
    "checkoutUrl": "https://approved-psp.example/checkout/...",
    "expiresAt": "2026-10-24T20:00:00Z"
  },
  "meta": { "correlationId": "01J..." }
}
```

The example domain is a placeholder and must never be used in production. Do not trust this redirect as proof of payment.

## 5. PSP webhook contract

`POST /webhooks/{provider}`

- Validate provider signature using raw request body and active secret version.
- Validate timestamp/replay window and required headers.
- Persist `provider_event_id` with unique key before processing.
- Validate merchant reference, currency, expected amount and provider payment reference.
- Process transactionally and idempotently.
- Return provider-required acknowledgement only after durable receipt, according to provider contract. Long-running reconciliation moves to a queue.
- Invalid signatures are rejected and alerted; do not log secret-bearing raw payloads.

## 6. Place a game participation — internal pattern

Request fields include `gameId`, `sessionId` (if already created), `roundId`, `stakeMinor`, `currency`, `clientActionId`. Server performs eligibility, bounds, timing, balance reservation and state validation in a transaction. It returns accepted/rejected status and authoritative session/round version. A client action ID alone is not proof that a stake was accepted; backend persists an idempotent participation record.

## 7. WebSocket messages

All messages carry `messageId`, `schemaVersion`, `sessionId`, `sequence` and a typed payload. Server validates user/session/room membership on every message. Ignore duplicate messages; reject stale or illegal sequence numbers. Never accept `balance`, `winner`, `payout`, `result` or `isAdmin` values as authority from the client.

## 8. API version and compatibility

- Maintain OpenAPI specifications in source control.
- Additive fields are safe; remove/rename fields only through versioned deprecation.
- Provider webhook versions are stored per event and mapped into internal event schemas.
- Contract tests run against mocks and provider sandbox before deployment.
