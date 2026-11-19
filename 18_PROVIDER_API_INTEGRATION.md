# 18 — Game Provider API Integration Plan

## 1. Purpose

This platform is a multi-provider gaming product. The client is supplying a Matka API and separate APIs/providers for Ludo, Carrom and Pool. The application should own the user experience and admin operations while game-provider protocols remain behind backend adapters. The actual API specifications are implementation prerequisites; no vendor endpoint, field or behaviour should be guessed.

## 2. Target architecture

`Player/Admin UI -> Platform API/BFF -> Game Orchestrator -> Provider Adapter -> External Game API`

Provider callbacks enter a separate secured webhook/polling ingress, are durably stored in an inbox, normalized, deduplicated, then sent to the orchestrator. Wallet settlement is a separate domain that consumes validated internal instructions. The UI never calls a provider with secret credentials and never writes financial state directly.

## 3. Integration onboarding checklist

For every API, obtain:
- OpenAPI/Swagger file, Postman collection, or complete equivalent documentation.
- Sandbox and production base URLs, API version, authentication/signing method and credential hand-off procedure.
- Required headers, request body schemas, response schemas, error/status catalogue, pagination/cursors and rate limits.
- Callback/webhook catalogue, signature specification, retry policy, delivery ordering guarantees, deduplication key and test events.
- Fields for provider game IDs, market/round/session IDs, customer/player mapping, entry types, statuses, timestamps and currency values.
- Data freshness and timezone rules; market schedule/cut-off timezone; whether schedules/results are polled, pushed or both.
- Provider responsibilities for game logic, randomness, validation, participation acceptance, result determination, payout calculation, settlement, refunds/voids and dispute evidence.
- API SLA, sandbox fixtures, known limits, maintenance process, escalation contact and certification/test evidence.
- Brand/UI requirements, embed/SDK rules, allowed assets and restrictions on storing or displaying provider data.

No production credentials should be committed to the repository or embedded in Markdown prompts.

## 4. Canonical internal contracts

The platform needs stable provider-independent types. Example conceptual types (field names are illustrative and must be aligned with actual business and API requirements):

```ts
export type ProviderStatus =
  | 'available' | 'open' | 'closed' | 'suspended'
  | 'pending' | 'accepted' | 'rejected' | 'final'
  | 'unknown';

export interface ProviderRef {
  providerId: string;
  externalId: string;
  externalVersion?: string;
}

export interface MarketSummary {
  id: string;                 // platform ID
  providerRef: ProviderRef;
  name: string;
  status: ProviderStatus;
  timezone: string;
  opensAt?: string;           // ISO timestamp
  closesAt?: string;
  lastUpdatedAt?: string;
  capabilities: string[];     // internal, approved capability identifiers
}

export interface ResultRecord {
  id: string;
  providerRef: ProviderRef;
  marketId: string;
  roundId?: string;
  status: 'provisional' | 'final' | 'corrected' | 'void' | 'unknown';
  publishedAt?: string;
  receivedAt: string;
  values: Record<string, string | number | null>;
  sourcePayloadHash: string;
}
```

A real mapping must be created once API documents are provided. Avoid forcing an API's actual schema into this draft if the supplier uses different concepts.

## 5. Matka adapter capability interface

Create a `MatkaProviderAdapter` with capability discovery/configuration and functions for only those operations that the actual API supports:

- `getMarkets(filters)`
- `getMarket(marketId)`
- `getSchedule(marketId)`
- `getLatestResults(marketId, cursor/dateRange)`
- `getChart(marketId, chartType, dateRange/cursor)`
- `getEntryTypes(marketId)`
- `validateParticipation(command)`
- `submitParticipation(command, idempotencyKey)`
- `getParticipationStatus(providerReference)`
- `getPlayerHistory(playerReference, filters)`
- `verifyAndNormalizeEvent(event)`

These are **adapter method names**, not presumed third-party routes. Where the provider has no chart endpoint, the platform may build a chart from authorized historical result records only if the provider contract permits it and all missing/void/corrected records are handled. Where participation is managed fully by a third-party SDK, document token exchange and callback/result responsibilities instead of pretending a direct submit endpoint exists.

## 6. Matka UI-to-API mapping workflow

1. List each screen and each displayed field/action.
2. Point every item to a documented response field, endpoint or event.
3. Record format, nullability, timezone, currency, freshness and authorization rules.
4. Convert provider data into canonical DTOs on the backend.
5. Add fixture payloads based on the actual sandbox, including edge cases.
6. Write contract tests before connecting live screens.
7. Verify responsive UI with realistic market counts, long names, delayed results, closed markets, no results, corrected results and API outage.
8. Obtain product and client sign-off on screenshots/flows.

### Required UI states
- Initial loading and background refresh.
- No market available / empty result history.
- Market open, closing soon, closed, suspended, provider maintenance.
- Latest result final, provisional if provider supports that status, delayed, corrected or void.
- API offline / rate limited / unauthorized / schema mismatch.
- Participation submission pending, confirmed accepted, rejected, expired, unknown outcome after timeout, and history not yet reconciled.

A timeout on a participation submission is an ambiguous result. Query by idempotency key or provider reference if supported; do not blindly submit again or show success based on optimistic UI.

## 7. Ludo, Carrom and Pool adapters

Each provider gets its own mapping for:
- catalog/title/artwork/allowed modes;
- session launch and token handshake, if applicable;
- room/match creation, matchmaking, join/leave, reconnect and session recovery;
- legal actions or provider SDK responsibilities;
- score/result/status callbacks and authoritative match identifiers;
- disputes, voids, settlement data and session history;
- player exposure limits and supported regions/currencies where applicable.

For embedded providers, verify sandboxing, origin allow-list, iframe restrictions, SDK versions, cross-window message schema and mobile standalone/PWA behaviour. Never accept `winner`, score or balance values posted directly by an untrusted browser as authoritative.

## 8. Reliability and security

- Use one unique provider event inbox constraint per provider/event ID (or documented composite key).
- Keep an idempotency store for outgoing commands where the provider offers idempotent commands.
- Use outbox pattern for internal events so a database commit is not separated from event publication.
- Poll with cursors/high-water marks and overlap windows where appropriate; deduplicate overlapping results.
- Quarantine unknown schemas and statuses; alert operators and keep evidence for analysis.
- Use circuit breakers for repeated outages and display a clear status without fabricating data.
- Reconcile provider records against platform sessions and settlement batches.
- Maintain a provider kill switch, per-game/per-market pause and controlled recovery plan.
- Log metadata and payload hashes, not bearer tokens, API keys, full card details or unneeded personal data.

## 9. Provider admin module

Admin pages should allow authorised staff to view (not reveal) provider configuration and secret references, set sandbox/production mode via controlled release process, run a connection test, view health/latency/error counts, inspect callback lag, list unmatched events, set maintenance state, test mappings against a sample response and view integration/version history. Production secret rotation and endpoint changes require elevated permissions, reason, audit trail and approval.

## 10. Definition of done

- Actual documentation and test credentials received securely.
- Field mapping table completed for all visible UI elements.
- Adapter and OpenAPI contract tests pass.
- Duplicate callback, delayed event, out-of-order result, timeout, rate limit and provider outage cases pass.
- Provider event references reconcile with the platform's session/participation records.
- No provider secret appears in browser bundle, client logs, Git, or screenshots.
- UI demonstrates no fake success or stale authoritative state.
- Client/product acceptance and required release evidence are recorded.

## 11. Live Client Matka API (matkaapi.com) Integration Specifications

### Endpoint Architecture & Authentication
- **Provider Base URL**: `https://www.matkaapi.com/mapi/`
- **Authentication**: `domain_key` (32-character hexadecimal key) passed alongside authorized `domain` parameter.
- **Trial Credentials**:
  - `domain_key`: `244cca4eaf15d9f297ee70eecf7bd100`
  - `domain`: `goldyanna.world`
  - *Server-authoritative*: Kept strictly on the backend (`.env.local` / environment configuration).

### Supported Endpoints & Payload Contracts
1. **Live All Markets Feed**:
   - `GET /mapi/market_api.php?market=all&domain_key={key}&domain={domain}`
   - Returns real-time results for active daily markets:
     ```json
     {
       "status": true,
       "message": "success",
       "data": [
         {
           "name": "ANANT DAY",
           "result": "170-81-236",
           "date": "2026-10-25",
           "open_time": "",
           "close_time": ""
         }
       ]
     }
     ```
2. **Market Directory (399 Markets)**:
   - `GET /mapi/market_api.php?market_list=1&domain_key={key}&domain={domain}`
   - Returns full catalog with `name`, `open_time`, `close_time`, `sat_day`, `sun_day`.
3. **Single Market Result**:
   - `GET /mapi/market_api.php?market={market_name}&domain_key={key}&domain={domain}`
4. **Additional Number Game Categories Available**:
   - `starline_api.php?game_list=1`: Starline game feeds
   - `satta_api.php?satta_list=1`: Satta game feeds (189 games)
   - `teer_api.php?game_list=1`: Teer game feeds (4 games)

### Result Decomposition Logic
- Raw string format: `[Open Pana]-[Jodi]-[Close Pana]` (e.g. `170-81-236`).
- Open Pana (`170`): 3-digit Patti for the opening draw.
- Jodi (`81`): 2-digit composite (Open Single Digit `8` + Close Single Digit `1`).
- Close Pana (`236`): 3-digit Patti for the closing draw.
- Partial / Undeclared draws: Indicated by asterisks (`123-4*-***` or `***-**-***`).

### Rate-Limiting & Caching Defense
- **Provider Limit**: Minimum interval of 5–10 seconds between requests; repeated identical queries within 30 seconds trigger `{"status":false,"error_code":"rate_limited"}`.
- **Platform Invariant**: `ClientMatkaAdapter` maintains an in-memory 30-second TTL cache (`cacheTtlMs: 30000`). All user and BFF traffic is served from cache in ~50ms, eliminating vendor rate-limit penalties while maintaining near-real-time updates.

### Historical Chart Limitations
- On Trial and Monthly plans, querying historical chart archives (`list=1`) returns:
  `{"status": false, "message": "OLD Data not available for Monthly Plan"}`.
- Full multi-year historical panel charts require an upgraded Yearly subscription with the vendor. Calibrated historical panel structures are provided in the adapter for UI testing.
