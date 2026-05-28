# Backend Build Plan

## Phase 1: API Foundation

- Node.js or Go backend service.
- PostgreSQL database.
- Wallet nonce and signature login.
- JWT or secure HTTP-only session cookie.
- Market read APIs.
- Account balance and ledger APIs.
- Order quote and create APIs.

## Phase 2: Trading Ledger

- Atomic transaction for order placement:
  - Validate user session, internal balance, market status, odds version, and exposure limit.
  - Move USDT from available to frozen/trading.
  - Create order and position.
  - Create ledger entries.
  - Create reward entry.
  - Create insurance premium and node when enabled.
- Add idempotency keys for order placement.
- Add optimistic odds version checks.

## Phase 3: Settlement

- Admin settlement endpoint.
- Oracle/source verification workflow.
- Resolve positions.
- Move funds into available or claimable.
- Update insurance nodes for covered losses.
- Write audit logs for every settlement action.

## Phase 4: Solana USDT

- Generate or assign deposit addresses.
- Solana USDT deposit watcher.
- Confirmation tracking.
- Hot wallet withdrawal broadcaster.
- Cold/hot wallet separation policy.
- Withdrawal queue with balance checks and hot-wallet signing controls.

## Phase 5: Risk Engine

- Region restriction.
- Account security gates.
- Blacklist and wallet reputation.
- Wash-trading detection.
- Market exposure limits.
- User-level order limits.
- Insurance abuse controls.

## Phase 6: Admin Console Integration

- Replace local admin mock data with real APIs.
- Market creation and odds publishing.
- Correct-score odds editor.
- Settlement queue.
- Withdrawal approval queue.
- Ledger reconciliation dashboard.

## Phase 7: Production Readiness

- Structured logs.
- Metrics and alerts.
- Daily ledger reconciliation job.
- Backup and restore.
- Security review.
- Rate limiting.
- Error tracking.
- Multi-language content pipeline.

## Suggested Service Boundaries

- `api-service`: user-facing REST API.
- `admin-service`: privileged operations API.
- `settlement-worker`: event settlement jobs.
- `chain-watcher`: Solana deposit watcher.
- `withdrawal-signer`: approved withdrawal broadcaster.
- `risk-worker`: exposure and anti-abuse checks.
- `rewards-worker`: daily Lobster Token calculations.
- `vault-worker`: daily vault yield settlement.
