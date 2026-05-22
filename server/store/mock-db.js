const fs = require('fs');
const { dataDir, dbPath } = require('../config');
const { now } = require('../utils');

const { correctScores, priceFootballMarkets } = require('../odds/football-pricing');
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
  if (process.env.INFOMARKET_REPRICE_ON_READ !== '1') return;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const pricedMarkets = priceFootballMarkets(db.markets || []);
  if (JSON.stringify(pricedMarkets) !== JSON.stringify(db.markets || [])) {
    db.markets = pricedMarkets;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
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

