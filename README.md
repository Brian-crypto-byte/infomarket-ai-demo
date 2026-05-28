# infomarket.ai

infomarket.ai is a centralized off-chain information prediction trading platform for real-world events. The current repository contains the Web prototype and product specifications for the first production build.

## Product Scope

- Centralized off-chain order, position, settlement, mining, vault, and insurance accounting.
- On-chain scope is limited to USDT deposit, USDT withdrawal, and future Lobster Token claim/withdraw.
- Web-first product. H5 and DApp visual prototypes exist, but current development priority is Web.
- P2P matching and multi-chain support are intentionally removed from current scope.

## Current Prototype

Run locally:

```bash
node server.js
```

Optional football logos:

```bash
API_SPORTS_KEY=your_api_sports_key_here
```

Put the key in `.env` to use API-SPORTS for football team crests and league logos. If the key is missing or a logo is not found, the app falls back to public logo sources.

Open:

- Home: `http://127.0.0.1:5173/`
- Match detail: `http://127.0.0.1:5173/match.html?market=manutd-forest`
- Dashboard: `http://127.0.0.1:5173/dashboard.html`
- Assets: `http://127.0.0.1:5173/assets.html`
- Positions: `http://127.0.0.1:5173/positions.html`
- GreenX Vault: `http://127.0.0.1:5173/vault.html`
- Alpha Insurance: `http://127.0.0.1:5173/insurance.html`
- Rewards: `http://127.0.0.1:5173/rewards.html`
- Admin: `http://127.0.0.1:5173/admin.html`
- Project status: `http://127.0.0.1:5173/project-status.html`

## Implemented Frontend Modules

- Market homepage with football cards, result odds, and score previews.
- Match detail page with YES/NO football markets, Up/Down crypto markets, and 25 correct-score markets.
- Correct-score markets are fixed odds and cannot be sold after purchase.
- Local wallet-login simulation and protected account pages.
- Internal account buckets: available, frozen, trading, vault, claimable, locked.
- Local order store, positions, asset ledger, GreenX Vault, Alpha Insurance, Lobster Token rewards, and admin console.

## Documentation

- Product rules: `docs/product-rules.md`
- API draft: `docs/api.md`
- Database schema draft: `docs/database-schema.md`
- Backend build plan: `docs/backend-plan.md`

## Next Engineering Step

Build a real backend service with persistent database tables, typed APIs, Solana USDT deposit watcher, withdrawal signer, and risk engine. The current localStorage store should become a temporary mock adapter behind the same data contract.

## Local API Server

The static preview server now also exposes a no-dependency mock API under `/api/v1`.

Quick checks:

```bash
curl http://127.0.0.1:5173/api/v1/health
curl http://127.0.0.1:5173/api/v1/markets?type=football
```

Persistent mock data is stored in `data/mock-db.json`. This file represents the temporary development database and mirrors the future PostgreSQL entities documented in `docs/database-schema.md`.

Implemented API groups:

- Auth mock: `/auth/nonce`, `/auth/login`
- Markets: `/markets`, `/markets/:id`
- Orders: `/orders/quote`, `/orders`
- Account: `/account/balances`, `/ledger`
- Deposits and withdrawals: `/deposits/address`, `/deposits/simulate`, `/withdrawals`
- Vault: `/vault`, `/vault/deposit`, `/vault/withdraw`
- Insurance: `/insurance/nodes`, `/insurance/nodes/:id/claim`
- Rewards: `/rewards`
- Admin: `/admin/markets`, `/admin/withdrawals`, `/admin/audit/reconcile`
