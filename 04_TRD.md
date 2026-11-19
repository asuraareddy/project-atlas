# 04 — Technical Requirements Document (TRD)

## 1. Reference stack

This is a reference baseline and can be adjusted after team review.

| Layer | Recommendation | Notes |
|---|---|---|
| Player PWA and admin UI | Next.js App Router, React, TypeScript, Tailwind CSS, accessible component library | Keep player and admin UI packages/modules separated even if in one monorepo |
| Server API | NestJS or Fastify with TypeScript | Modular monolith first; explicit domain boundaries |
| Database | PostgreSQL | Strong transactions, constraints, row-level scoping where applicable, append-only financial journals |
| ORM/query layer | Drizzle or Prisma for normal models; SQL migrations reviewed for ledger invariants | Do not rely only on ORM-level checks for balance invariants |
| Cache/realtime | Redis for short-lived cache, rate limits, presence, distributed coordination when necessary | Cache is never ledger source of truth |
| Jobs/workflows | Durable queue (BullMQ/Redis or cloud queue with durable semantics) | Outbox pattern for reliable events |
| Realtime game channels | WebSocket gateway or provider SDK | Authenticate each connection and authorize each room/action |
| File/object storage | Private S3-compatible object storage | Signed URLs, malware scan, retention and minimal PII |
| Identity | Operator-approved identity provider plus internal eligibility service | Provider status never bypasses central account restrictions |
| Payments | Operator-approved PSP(s), signed webhooks, payout API and reconciliation API/files | No provider-specific logic in UI |
| Observability | OpenTelemetry + structured logs, metrics and traces | Scrub secrets and sensitive PII |
| Infrastructure | Managed containers/compute and managed PostgreSQL in approved region | Vercel can host frontend if appropriate; do not assume it is the only runtime for long-running workers/realtime services |
| CI/CD | GitHub Actions or equivalent, infrastructure as code, environment protections | No production secrets in repository or preview builds |

**Supabase option:** Supabase can be considered for managed Postgres and supported auth/storage services if approved by security and operations. All wallet, wager, settlement, payout and administrative mutation operations must go through trusted server-side services. Never expose service-role keys or allow a public browser client to write financial tables. Review RLS, audit/backup/recovery, region and operational controls before adoption.

## 2. Architecture constraints

- Start with a modular monolith instead of many microservices; split services only when workload or ownership justifies it.
- Maintain separate modules and transaction boundaries for accounts, eligibility, wallet/ledger, payments, games, settlement, safer gambling, reporting, admin and audit.
- Treat wallet/ledger and game settlement as critical systems with stronger change control and test coverage.
- No authoritative state is held only in browser memory, local storage or a service worker cache.
- PostgreSQL is the source of truth for balances, payment states, game participation and settled outcomes.
- External requests use explicit timeouts, retry policies, circuit breakers and idempotency.
- Use the transactional outbox pattern to publish business events without losing messages between database commit and queue publish.
- Every asynchronous job has retry/backoff, a dead-letter or failure queue and an idempotent handler.

## 3. Environment separation

- `local`: synthetic users and simulated payments only.
- `development`: shared non-production services; no real customer data.
- `test/qa`: repeatable test fixtures, PSP sandbox, provider test credentials, regression and abuse tests.
- `staging`: production-like config, masked data only, production release candidate and security verification.
- `production`: locked-down infrastructure, approvals, monitored deployments, separate credentials and backups.

Test data and payment sandbox events must never post to production ledgers. Production data must not be copied to lower environments without approved anonymisation.

## 4. API and data standards

- API style: versioned REST `/api/v1`; WebSocket messages share versioned schemas.
- JSON is UTF-8; amounts use integer minor units (e.g. GBP pence) or exact decimal types, never binary float.
- Store time in UTC using timezone-aware types; render using `Europe/London`.
- UUID/ULID identifiers; never expose sequential internal IDs for sensitive records.
- Required request idempotency keys for money movement and actions whose retry can duplicate side effects.
- Standard error envelope: `code`, safe `message`, `correlationId`, optional field errors; never return stack traces.
- Pagination: cursor-based for high-volume event history; bounded page sizes.
- Rate limits per IP, account, token, route and risk class.
- OpenAPI schemas generated and version-controlled; backward compatibility tested.

## 5. Security and access

- Staff MFA mandatory; require step-up for payout approval, role changes, QR/payment configuration and game result operations.
- Secure, httpOnly, sameSite cookies for browser sessions where applicable; short-lived access tokens if used.
- CSRF protections for cookie-authenticated mutations; strict CORS; CSP; HSTS; secure headers.
- Secrets stored in a managed secret vault, rotated, scoped and monitored.
- Encrypt traffic in transit and sensitive data at rest; manage keys separately from encrypted data.
- Central RBAC + resource/branch scoping; defence in depth via database query scoping/RLS where suitable.
- Admin sessions and player sessions have different policy and cookie scope.
- Signed webhook verification includes raw payload verification, time window/replay prevention, and dedupe.
- Protect against OWASP Top 10, SSRF, IDOR/BOLA, injection, race conditions, broken access control and websocket authorization flaws.
- Privileged access, data exports, sensitive reads and break-glass use are logged and alerted.

## 6. Reliability and performance targets (proposed)

- Target 99.9% monthly availability for player browsing and account history, excluding agreed maintenance; confirm SLA with client.
- Money posting and settlement must be transactionally correct; consistency takes priority over availability for financial writes.
- Initial target load: 1,000 concurrent authenticated sessions and 100 game actions/sec as a test baseline, to be revised after expected traffic and provider contracts are known.
- P95 non-realtime API response under 300 ms for common read endpoints under baseline load, excluding external provider latency.
- P95 game-action acknowledgement under 150 ms within regional infrastructure where a custom realtime game is used; define per game and test environment.
- No single-instance in-memory queue or lock may be relied upon for financial correctness.
- Database backups with defined RPO/RTO; suggested planning baseline RPO <= 5 minutes and RTO <= 60 minutes, subject to cost and business requirements.
- Queue lag, provider latency, failed settlement, reconciliation differences and balance invariant failures have alerts and runbooks.

## 7. Data lifecycle

- Data inventory, purpose, lawful basis, retention and deletion/erasure exceptions must be documented with client privacy counsel.
- Keep accounting/transaction/game evidence according to operator-approved retention policy and applicable legal obligations.
- Separate operational analytics from sensitive identity evidence.
- Use masked or synthetic data in testing; avoid production data in developer laptops.
- Apply least-privilege access and periodic access reviews to data stores and object storage.

## 8. Build/release standards

- TypeScript strict mode, linting, formatting, type checks and dependency scanning required in CI.
- Unit, integration, contract, e2e, load and security tests block release on failure.
- Database migrations reviewed; destructive migrations use staged expand/contract approach.
- Feature flags default off; real-money capability requires a production-only approval path.
- Game configuration/provider version is pinned and linked to test evidence; a new version is not live until required approval/test evidence is recorded.
- SBOM, signed build artefacts where practical, dependency/license checks and provenance records are retained.
