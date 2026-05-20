const { sendJson } = require('../utils');
const { getDemoUser, getBalance, ledgerEntry } = require('../domain');

async function handleInsurance(req, res, pathname, url, db, writeDb) {
  if (req.method === 'GET' && pathname === '/insurance/nodes') return sendJson(res, 200, { items: db.insuranceNodes });
  const claimMatch = pathname.match(/^\/insurance\/nodes\/([^/]+)\/claim$/);
  if (req.method === 'POST' && claimMatch) {
    const node = db.insuranceNodes.find((item) => item.id === claimMatch[1]);
    if (!node) return false;
    if (node.status === 'claimed') return sendJson(res, 200, { node, balance: getBalance(db, getDemoUser(db).id) });
    node.status = 'claimed';
    node.claimedAt = new Date().toISOString();
    const balance = getBalance(db, getDemoUser(db).id);
    const amount = Number(node.claimableUsdt || node.periodAmountUsdt || 0);
    balance.claimable = Number(Math.max(0, Number(balance.claimable || 0) - amount).toFixed(6));
    balance.available = Number((Number(balance.available || 0) + amount).toFixed(6));
    node.claimedUsdt = amount;
    ledgerEntry(db, { type: 'insurance_claim', asset: 'USDT', amount, refType: 'insurance_node', refId: node.id, note: node.marketTitle });
    writeDb(db);
    return sendJson(res, 200, { node, balance });
  }
  return false;
}

module.exports = { handleInsurance };
