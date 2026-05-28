const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const { readDb, writeDb } = require('../server/store/mock-db');
const { runFootballCollection } = require('../server/football-ops');
const { priceFootballMarkets } = require('../server/odds/football-pricing');

function isFootball(market) {
  return market?.type === 'football' || market?.sport === 'soccer';
}

function isFreshFootball(market, at) {
  const start = Date.parse(market?.startsAt || '');
  if (!Number.isFinite(start)) return false;
  if (['closed', 'settled', 'voided'].includes(String(market.status || '').toLowerCase())) return false;
  return start >= at.getTime() - (3 * 60 * 60 * 1000);
}

async function main() {
  const now = new Date();
  const db = readDb();
  const beforeFootball = (db.markets || []).filter(isFootball).length;
  db.markets = (db.markets || []).filter((market) => !isFootball(market) || isFreshFootball(market, now));

  const result = await runFootballCollection(db, { autoPublish: true });
  db.markets = priceFootballMarkets(db.markets || [], { generatedAt: now.toISOString() });
  db.markets.sort((a, b) => {
    const aFootball = isFootball(a) ? 0 : 1;
    const bFootball = isFootball(b) ? 0 : 1;
    if (aFootball !== bFootball) return aFootball - bFootball;
    return (Date.parse(a.startsAt || '') || Number.MAX_SAFE_INTEGER) - (Date.parse(b.startsAt || '') || Number.MAX_SAFE_INTEGER);
  });
  db.lastFootballRefresh = {
    refreshedAt: new Date().toISOString(),
    removedExpired: beforeFootball - (db.markets || []).filter(isFootball).length + result.published.length,
    published: result.published.length,
    totalCandidates: result.status.total,
    sourceCounts: result.status.sourceCounts
  };
  writeDb(db);

  const afterFootball = (db.markets || []).filter(isFootball).length;
  console.log(JSON.stringify({
    ok: true,
    beforeFootball,
    afterFootball,
    published: result.published.length,
    totalCandidates: result.status.total,
    sourceCounts: result.status.sourceCounts,
    firstFootball: (db.markets || []).find(isFootball)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
