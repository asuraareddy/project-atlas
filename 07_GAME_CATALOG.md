# 07 — Game Catalogue & Game Modules

## 1. Common game contract

Each game implements a versioned adapter/interface so game-specific logic does not directly mutate wallets or bypass eligibility.

```ts
export interface GameAdapter {
  getCapabilities(): GameCapabilities;
  validateLaunch(input: LaunchGameInput, ctx: EligibilityContext): Promise<LaunchDecision>;
  createSession(input: CreateSessionInput): Promise<GameSessionRef>;
  validateAction(input: GameActionInput): Promise<ValidatedGameAction>;
  getStatus(sessionId: string): Promise<GameSessionStatus>;
  validateResult(input: ProviderResult | InternalResult): Promise<ValidatedResult>;
  buildSettlement(input: ValidatedResult): Promise<SettlementInstruction>;
  recoverSession(input: RecoveryInput): Promise<RecoveryDecision>;
}
```

The interface above is illustrative. It is not a finished game engine. Wallet posting is always delegated to the Wallet/Ledger module, and all actions/results carry an idempotency key and rules/configuration version.

## 2. Game catalogue metadata

Minimum fields: `game_id`, `slug`, `display_name`, `category`, `provider_id`, `module_version`, `rules_version`, `real_money_enabled`, `practice_mode_enabled`, allowed jurisdictions, allowed account types, min/max entry, allowed payment/wallet types, schedule/cut-off policy, payout model reference, game status, approved test/certification reference, approval actors/timestamps, maintenance message and release version.

Statuses: `draft`, `configuration_pending`, `testing`, `approved`, `scheduled`, `live`, `paused`, `incident_hold`, `retired`. A user interface may show only games allowed for that user and market; APIs must enforce the same policy.

## 3. Matka / number-draw module

Treat this as its own game family with versioned rules and a defensible result process.

### Required configuration
- Draw/round identifiers and schedule.
- Timezone and cut-off rules based on server time.
- Accepted entry/participation types and their rule definitions.
- Minimum/maximum participation and player/account exposure constraints.
- Result format and result source, including verification evidence and source outage behavior.
- Prize/payout table as a versioned artifact.
- Void, cancellation, delayed result, duplicate result and correction policy.
- Settlement batch definition and reconciliation controls.
- Player-facing rules and required disclosures.

### Controls
- Only a limited, authorised result-management role can propose a result.
- Second approver required where operator policy dictates; approver cannot be the proposer.
- Preserve result source evidence, result hash/version and all approvals.
- Lock entry acceptance at cut-off in the backend.
- Generate pre-settlement exposure and duplicate-entry checks.
- Run settlement in a dry-run/reconciliation mode before final posting for configured rounds.
- Pause the affected market/round on inconsistent data; do not resolve uncertainty by editing records silently.

## 4. Ludo module

- Server-authoritative turn order and legal-move validation.
- Randomness provider/algorithm documented and evaluated by the client/test house where relevant.
- Rules version, board state and action sequence persisted for replay/dispute review.
- Anti-collusion and multi-account patterns evaluated separately from game mechanics.
- Reconnect token is session-bound, short-lived and single-use or rotation-protected.
- Match state machine: `waiting`, `ready_check`, `in_progress`, `awaiting_result_validation`, `settled`, `voided`, `disputed`.

## 5. Carrom module

- Server-side validation of shot sequence, match phase, turn ownership, foul/score transitions and end condition.
- Where physics simulation is custom, version and test the simulation parameters; never trust final score sent only by the client.
- Store enough state/event data to explain and reproduce a disputed match within defined retention limits.
- Define disconnect, pause, timeout, device-change and abandoned-match rules before money play.

## 6. Pool module

- Server-side validation of turn, legal shot, foul, ball state and match completion.
- If a third-party pool provider is used, maintain an explicit contract for result callbacks, match IDs, dispute windows and settlement events.
- Matchmaking must avoid leaking player data and should support abuse/collusion monitoring.

## 7. Third-party providers

For each provider capture:
- Legal entity and supplier approval status, contractual scope, allowed game/market, test evidence and version.
- API endpoints, auth method, signing keys, IP allow-list where supported, timeouts, retry policy and rate limits.
- Callback signing and replay protection, event IDs and duplicate behavior.
- Sandbox details and documented production certification steps.
- SLA, outage/status page, escalation contact, result dispute process and data export/offboarding plan.
- Data processing/security terms and subprocessor inventory.

## 8. Fairness and result integrity

- Do not place RNG, payout calculation, authoritative game state or settlement authority entirely in the browser.
- Where random outcomes are used, use an appropriately reviewed cryptographic RNG or approved provider implementation, preserving required test evidence.
- The operator/test house determines which game versions need independent testing and what evidence is required.
- Do not ship or enable modified game logic until the required regression/test approval is complete.
- Keep outcomes and financial settlement records immutable; correction is an audited compensating process.

## 9. Game launch checklist

- Client confirms exact product classification and permission for the game variant.
- Rules, prize/payout table, limits, void rules, dispute flow and player disclosures approved.
- Provider contract and production account approved.
- Required testing completed and test evidence linked to the release.
- Security, fairness, load and failure-recovery tests passed.
- Game/market flags remain OFF until both compliance/product and engineering release gates are signed.
