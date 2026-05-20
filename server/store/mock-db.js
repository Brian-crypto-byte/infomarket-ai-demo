const fs = require('fs');
const { dataDir, dbPath } = require('../config');
const { now } = require('../utils');

const scoreOrder = [
  [0, 0], [1, 0], [0, 1], [1, 1], [2, 0],
  [0, 2], [2, 1], [1, 2], [2, 2], [3, 0],
  [0, 3], [3, 1], [1, 3], [3, 2], [2, 3],
  [3, 3], [4, 0], [0, 4], [4, 1], [1, 4],
  [4, 2], [2, 4], [4, 3], [3, 4], [4, 4]
];

function correctScores() {
  return scoreOrder.map(([home, away], index) => ({
    id: `score-${home}-${away}`,
    groupKey: 'correct_score',
    label: `${home}-${away}`,
    sideType: 'yes_no',
    sellable: false,
    sortOrder: index + 1,
    yesOdds: Number((5.2 + home * 1.35 + away * 1.52 + Math.abs(home - away) * 0.82).toFixed(2)),
    noOdds: Number((1.035 + (home + away) * 0.007 + Math.abs(home - away) * 0.004).toFixed(2))
  }));
}

function seedDb() {
  return {
    users: [
      { id: 'usr_demo', walletAddress: '7Nf8mZkB2q84xV1T9q', walletType: 'Phantom', status: 'active', kycStatus: 'not_submitted', riskTier: 'standard', createdAt: now() }
    ],
    balances: { usr_demo: { available: 12480, frozen: 3250, trading: 0, vault: 24000, claimable: 180, lockedInf: 8416.2 } },
    markets: [
      {
        id: 'manutd-forest', type: 'football', category: 'sports', title: 'Man Utd vs Forest', league: 'EPL', status: 'live', startsAt: '2026-05-18T14:00:00Z', volumeUsdt: 6450000, score: { home: 3, away: 2 },
        participants: [
          { role: 'home', name: 'Man Utd', shortCode: 'MUN', logo: 'MU' },
          { role: 'away', name: 'Forest', shortCode: 'NFO', logo: 'NF' }
        ],
        options: [
          { id: 'mun-result', groupKey: 'match_result', label: 'MUN', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds: 1.09, noOdds: 11.9 },
          { id: 'draw-result', groupKey: 'match_result', label: 'DRAW', sideType: 'yes_no', sellable: true, sortOrder: 2, yesOdds: 10.3, noOdds: 1.11 },
          { id: 'nfo-result', groupKey: 'match_result', label: 'NFO', sideType: 'yes_no', sellable: true, sortOrder: 3, yesOdds: 500, noOdds: 1.002 },
          ...correctScores()
        ],
        createdAt: now(), updatedAt: now()
      },
      {
        id: 'btc-68000', type: 'crypto', category: 'crypto', title: 'Will BTC close above 68,000 USDT today?', league: 'Crypto', status: 'today', startsAt: '2026-05-18T00:00:00Z', volumeUsdt: 184900, participants: [],
        options: [
          { id: 'btc-up', groupKey: 'crypto_direction', label: 'Up', sideType: 'up_down', sellable: true, sortOrder: 1, upOdds: 1.74 },
          { id: 'btc-down', groupKey: 'crypto_direction', label: 'Down', sideType: 'up_down', sellable: true, sortOrder: 2, downOdds: 2.06 }
        ],
        createdAt: now(), updatedAt: now()
      }
    ],
    orders: [], positions: [], ledger: [], deposits: [], withdrawals: [], insuranceNodes: [], rewardEntries: [], auditLogs: []
  };
}

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(seedDb(), null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = { ensureDb, readDb, writeDb, correctScores };
