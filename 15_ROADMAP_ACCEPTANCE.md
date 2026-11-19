# 15 — Delivery Roadmap & Acceptance

## Phase 0 — Discovery and provider decisions

**Deliverables:** signed BRD/PRD, game rules, licence/product-scope confirmation from client, role and branch model, finance definitions, PSP/provider shortlist, identity/safer-gambling vendors, hosting and security decisions.

**Exit:** no unresolved blocker about who owns each launch dependency. Client approves game-by-game MVP scope and payment methods.

## Phase 1 — Foundation

**Build:** repo/CI/CD, web shell and PWA baseline, authentication, organisation model, RBAC, audit framework, feature flags, database migration, logging/monitoring and test harness.

**Exit:** all roles and scope tests pass, staff MFA works, feature flags default off, audit events appear in a controlled viewer.

## Phase 2 — Wallet and payment sandbox

**Build:** ledger, cash/bonus/points separation, reservations, payment intent, PSP sandbox, dynamic QR if supported, signed webhooks, withdrawal case workflow, reconciliation and finance views.

**Exit:** duplicate and out-of-order events tested, race conditions blocked, journal balances, failed payout compensation works, no client-side balance writes.

## Phase 3 — Game engine/provider integration

**Build:** game catalogue, adapter contract, one approved game module/provider, session lifecycle, server-authoritative state, settlement workflow, rules/versioning and incident handling.

**Exit:** full replayable test cases, result integrity, duplicate settlement protection, testing evidence and client approval present. Real-money flag still off until launch gates pass.

## Phase 4 — Admin, compliance and operations

**Build:** branch/partner scope, staff management, maker-checker approvals, compliance case queues, safer-gambling controls, restrictions, customer support, audits and reports.

**Exit:** least-privilege tests, cross-branch isolation tests, escalation workflow and evidence export approved by client.

## Phase 5 — PWA refinement, QA and hardening

**Build:** offline shell, cache rules, mobile design polish, accessibility, bundle optimisation, performance budgets, load tests, penetration test, restore drill and operator training.

**Exit:** PWA tests across devices, performance baselines, security findings resolved/accepted and disaster recovery demonstrated.

## Phase 6 — Controlled launch

**Activities:** production configuration review, provider production certification, game testing sign-off, legal/compliance/finance final checklist, pilot cohort if approved, kill-switch drill, monitoring and daily reconciliation.

**Exit:** client owner signs release; all launch gates in `10_SECURITY_COMPLIANCE.md` are recorded as complete.

## Definition of Done — each feature

- Business requirement and acceptance criteria linked.
- UX states cover loading, error, empty, retry, blocked and success cases.
- Server-side authorization and input validation implemented.
- Audit and idempotency added wherever required.
- Unit/integration/e2e tests pass; critical financial/eligibility paths include negative tests.
- Observability and failure recovery defined.
- Documentation and API contracts updated.
- Security, accessibility and performance impact reviewed.
- Feature flag default and release approvals specified.

## Change control

Changes to game mechanics, payout tables, provider versions, payment flows, wallet accounting, customer restriction logic, role permissions or reporting formulas require impact analysis, tests, versioned approval and auditable release. Do not edit production configuration directly without a request, approver and rollback plan.
