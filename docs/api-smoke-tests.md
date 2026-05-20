# Local API Smoke Tests

These examples assume the local server is running on `http://127.0.0.1:5173`.

## Health

```bash
curl http://127.0.0.1:5173/api/v1/health
```

## List football markets

```bash
curl "http://127.0.0.1:5173/api/v1/markets?type=football"
```

## Get match detail

```bash
curl http://127.0.0.1:5173/api/v1/markets/manutd-forest
```

## Quote a correct-score order

```bash
curl -X POST http://127.0.0.1:5173/api/v1/orders/quote \
  -H "Content-Type: application/json" \
  -d '{"marketId":"manutd-forest","optionId":"score-1-0","side":"YES","amountUsdt":"25","insuranceEnabled":true}'
```

Expected detail: `sellable` is `false` for correct-score options.

## Place an order

```bash
curl -X POST http://127.0.0.1:5173/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"marketId":"manutd-forest","optionId":"score-1-0","side":"YES","amountUsdt":"25","insuranceEnabled":true}'
```

## Check balances

```bash
curl http://127.0.0.1:5173/api/v1/account/balances
```

## Simulate deposit

```bash
curl -X POST http://127.0.0.1:5173/api/v1/deposits/simulate \
  -H "Content-Type: application/json" \
  -d '{"amountUsdt":"1000","chain":"solana"}'
```

## Vault deposit

```bash
curl -X POST http://127.0.0.1:5173/api/v1/vault/deposit \
  -H "Content-Type: application/json" \
  -d '{"amountUsdt":"100"}'
```

## Admin reconciliation

```bash
curl http://127.0.0.1:5173/api/v1/admin/audit/reconcile
```
