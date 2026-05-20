# Product Rules

## Platform Model

infomarket.ai is a centralized off-chain prediction market. Users deposit USDT on-chain, then trade through an internal ledger. Orders, balances, settlements, INF Credits, vault positions, and insurance nodes are handled off-chain.

## Removed Scope

The following features are not part of the current build:

- User-to-user P2P matching.
- Multi-chain support.

## Market Types

### Football

Football markets use YES / NO outcomes.

Supported football market groups:

- Match result: home / draw / away, each with YES and NO sides.
- Correct score: fixed-odds score predictions.
- Future groups: totals and handicap.

### Correct Score

Every football match has exactly 25 correct-score outcomes from 0-0 to 4-4:

1. 0-0
2. 1-0
3. 0-1
4. 1-1
5. 2-0
6. 0-2
7. 2-1
8. 1-2
9. 2-2
10. 3-0
11. 0-3
12. 3-1
13. 1-3
14. 3-2
15. 2-3
16. 3-3
17. 4-0
18. 0-4
19. 4-1
20. 1-4
21. 4-2
22. 2-4
23. 4-3
24. 3-4
25. 4-4

Each score has two choices:

- YES with fixed odds.
- NO with fixed odds.

Correct-score positions cannot be sold after purchase. They remain open until event settlement.

### Crypto

Crypto markets use Up / Down outcomes.

Example:

- BTC close above 68,000 USDT today?
- Up
- Down

## Orders

Order lifecycle:

1. User selects market and outcome.
2. User enters USDT amount.
3. System checks internal balance, market availability, odds version, and platform exposure.
4. Internal ledger freezes amount.
5. Position is created.
6. INF Credits and insurance premium entries are recorded if applicable.
7. Settlement resolves the position and releases funds.

## Internal Balance Buckets

- available: spendable USDT.
- frozen: USDT locked by open orders or withdrawal review.
- trading: USDT currently exposed to active positions.
- vault: USDT deposited into INFO Vault.
- claimable: USDT available to claim from settlement, vault yield, or insurance payout.
- locked: locked INF Credits / locked INF allocation.

## INFO Vault

Users can lock available USDT into fixed-term vault plans: 7, 15, 30, 60, or 180 days. Vault balance earns base yield and INF Credits boost. Principal can be withdrawn back to available balance after the lock expires. The first version is internal-ledger based.

## Alpha Insurance

Users can buy optional insurance during order placement. If a covered position loses, the system creates an internal insurance payout node.

Insurance nodes:

- Are internal payout credentials.
- Are not NFTs.
- Cannot be transferred.
- Pay out by schedule based on pool health, user risk tier, and order type.

## INF Credits

INF Credits are locked INF token allocation. They cannot be transferred or withdrawn until unlocked.

Unlock factors:

- Cumulative trading volume.
- Active days.
- Vault balance duration.
- Valid referrals.
- Task completion.
