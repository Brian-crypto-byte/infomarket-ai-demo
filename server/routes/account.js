const { sendJson, sendError, readBody, now, id } = require('../utils');
const { getDemoUser, getBalance, ledgerEntry } = require('../domain');

async function handleAccount(req, res, pathname, url, db, writeDb) {
  if (req.method === 'GET' && pathname === '/account/balances') return sendJson(res, 200, getBalance(db, getDemoUser(db).id));
  if (req.method === 'GET' && pathname === '/ledger') return sendJson(res, 200, { items: db.ledger });
  if (req.method === 'POST' && pathname === '/deposits/address') return sendJson(res, 200, { chain: 'solana', address: getDemoUser(db).walletAddress, token: 'USDT' });
  if (req.method === 'POST' && pathname === '/deposits/simulate') {
    const body = await readBody(req);
    const amount = Number(body.amountUsdt || 0);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return sendError(res, 400, 'Invalid deposit amount');
    const user = getDemoUser(db);
    const balance = getBalance(db, user.id);
    balance.available = Number((balance.available + amount).toFixed(6));
    db.deposits.unshift({ id: id('dep'), userId: user.id, chain: body.chain || 'solana', address: user.walletAddress, amountUsdt: amount, status: 'confirmed', createdAt: now(), confirmedAt: now() });
    ledgerEntry(db, { type: 'deposit', asset: 'USDT', amount, refType: 'deposit', refId: db.deposits[0].id, note: 'Simulated chain confirmation' });
    writeDb(db);
    return sendJson(res, 201, { deposit: db.deposits[0], balance });
  }
  if (req.method === 'POST' && pathname === '/withdrawals') {
    const body = await readBody(req);
    const amount = Number(body.amountUsdt || 0);
    const address = String(body.address || '').trim();
    const user = getDemoUser(db);
    const balance = getBalance(db, user.id);
    if (amount <= 0 || balance.available < amount) return sendError(res, 400, 'Invalid withdrawal amount');
    if (!/^(0x[a-fA-F0-9]{20,}|[1-9A-HJ-NP-Za-km-z]{32,}|T[A-Za-z0-9]{25,})$/.test(address)) return sendError(res, 400, 'Invalid withdrawal address');
    const riskLevel = amount > 10000 ? 'high' : amount > 2000 ? 'medium' : 'low';
    const withdrawal = { id: id('wd'), userId: user.id, address, amountUsdt: amount, riskLevel, status: 'pending_review', createdAt: now() };
    db.withdrawals.unshift(withdrawal);
    balance.available = Number((balance.available - amount).toFixed(6));
    balance.frozen = Number((balance.frozen + amount).toFixed(6));
    ledgerEntry(db, { type: 'withdraw_request', asset: 'USDT', amount: -amount, refType: 'withdrawal', refId: withdrawal.id, status: 'pending_review', note: address });
    writeDb(db);
    return sendJson(res, 201, { withdrawal, balance });
  }
  return false;
}

module.exports = { handleAccount };
