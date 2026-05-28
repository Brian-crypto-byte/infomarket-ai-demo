const { sendJson, sendError, readBody } = require('../utils');
const { getDemoUser, getBalance, ledgerEntry } = require('../domain');

const LOCK_TERMS = [7, 15, 30, 60, 180];
const APR_BY_TERM = { 7: 0.068, 15: 0.088, 30: 0.124, 60: 0.158, 180: 0.226 };

async function handleVault(req, res, pathname, url, db, writeDb) {
  if (req.method === 'GET' && pathname === '/vault') {
    const balance = getBalance(db, getDemoUser(db).id);
    const lockDays = Number(balance.vaultLockDays || 30);
    const apr = APR_BY_TERM[lockDays] || APR_BY_TERM[30];
    return sendJson(res, 200, {
      principalUsdt: balance.vault,
      lockDays,
      estimatedApr: apr,
      accruedYieldUsdt: Number((balance.vault * apr * lockDays / 365).toFixed(6))
    });
  }

  if (req.method === 'POST' && pathname === '/vault/deposit') {
    const body = await readBody(req);
    const amount = Number(body.amountUsdt || 0);
    const lockDays = Number(body.lockDays || 30);
    const balance = getBalance(db, getDemoUser(db).id);
    if (!LOCK_TERMS.includes(lockDays)) return sendError(res, 400, 'Invalid vault lock term');
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 || balance.available < amount) return sendError(res, 400, 'Invalid vault deposit amount');
    balance.available = Number((balance.available - amount).toFixed(6));
    balance.vault = Number((balance.vault + amount).toFixed(6));
    balance.vaultLockDays = lockDays;
    ledgerEntry(db, { type: 'vault_deposit', asset: 'USDT', amount, note: `Locked in GreenX Vault for ${lockDays} days` });
    writeDb(db);
    return sendJson(res, 201, { balance });
  }

  if (req.method === 'POST' && pathname === '/vault/withdraw') {
    const body = await readBody(req);
    const amount = Number(body.amountUsdt || 0);
    const balance = getBalance(db, getDemoUser(db).id);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 || balance.vault < amount) return sendError(res, 400, 'Invalid vault withdrawal amount');
    balance.vault = Number((balance.vault - amount).toFixed(6));
    balance.available = Number((balance.available + amount).toFixed(6));
    ledgerEntry(db, { type: 'vault_withdraw', asset: 'USDT', amount: -amount, note: 'Withdrawn after lock expiry' });
    writeDb(db);
    return sendJson(res, 201, { balance });
  }

  return false;
}

module.exports = { handleVault };
