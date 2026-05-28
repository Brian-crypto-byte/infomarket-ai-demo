# API Draft

Base path: `/api/v1`

All protected endpoints require wallet-session authentication.

## Auth

### POST `/auth/nonce`

Request:

```json
{ "walletAddress": "7Nf8...9q", "walletType": "Phantom" }
```

Response:

```json
{ "nonce": "Sign in to infomarket.ai: ...", "expiresAt": "2026-05-18T12:00:00Z" }
```

### POST `/auth/login`

Request:

```json
{ "walletAddress": "7Nf8...9q", "signature": "base58_signature", "nonce": "..." }
```

Response:

```json
{ "accessToken": "jwt", "user": { "id": "usr_...", "walletAddress": "7Nf8...9q" } }
```

### POST `/auth/logout`

Invalidates current session.

## Markets

### GET `/markets`

Query:

- `type`: football, crypto, esports, finance.
- `status`: live, upcoming, closed.
- `category`: sports, crypto, tech, economy.

Response:

```json
{
  "items": [
    {
      "id": "mkt_...",
      "type": "football",
      "title": "Man Utd vs Forest",
      "league": "EPL",
      "status": "live",
      "volumeUsdt": "6450000.00",
      "startsAt": "2026-05-18T14:00:00Z"
    }
  ]
}
```

### GET `/markets/:id`

Returns event, teams, market groups, odds, volume, and settlement status.

### POST `/admin/markets`

Creates a draft market.

### PATCH `/admin/markets/:id/odds`

Updates fixed pool odds.

Request:

```json
{
  "odds": [
    { "marketOptionId": "opt_home", "yesOdds": "1.700", "noOdds": "2.180" }
  ]
}
```

## Orders

### POST `/orders/quote`

Returns estimated return, fees, Lobster Token, and insurance premium.

### POST `/orders`

Request:

```json
{
  "marketId": "mkt_...",
  "optionId": "score_1_0",
  "side": "YES",
  "amountUsdt": "500.00",
  "insuranceEnabled": true
}
```

Response:

```json
{
  "orderId": "ord_...",
  "positionId": "pos_...",
  "status": "open",
  "potentialReturnUsdt": "850.00"
}
```

### GET `/positions`

Returns current user's positions.

## Assets

### GET `/account/balances`

Response:

```json
{
  "available": "12480.00",
  "frozen": "3250.00",
  "trading": "500.00",
  "vault": "24000.00",
  "claimable": "180.00",
  "lockedLobster": "8416.20"
}
```

### GET `/ledger`

Returns internal account ledger entries.

### POST `/deposits/address`

Creates or returns a USDT deposit address for the user.

### POST `/withdrawals`

Creates a withdrawal request pending risk review.

## Vault

### GET `/vault`

Returns user's vault state and platform TVL.

### POST `/vault/deposit`

Moves available USDT into vault.

### POST `/vault/withdraw`

Moves vault USDT back to available balance.

## Insurance

### GET `/insurance/nodes`

Returns user's insurance payout nodes.

### POST `/insurance/nodes/:id/claim`

Claims current period payout.

## Rewards

### GET `/rewards`

Returns Lobster Token summary, unlock progress, tasks, and reward ledger.

### POST `/rewards/claim-inf`

Claims unlocked Lobster Token allocation.

## Admin

### GET `/admin/withdrawals`

Returns pending withdrawal review queue.

### POST `/admin/withdrawals/:id/approve`

Approves withdrawal for hot-wallet broadcast.

### POST `/admin/markets/:id/settle`

Settles a market.

### GET `/admin/audit/reconcile`

Returns internal ledger vs on-chain custody reconciliation.
