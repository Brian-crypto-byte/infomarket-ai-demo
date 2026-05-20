const { sendJson, sendError, now } = require('./utils');
const { readDb, writeDb } = require('./store/mock-db');
const { handleAuth } = require('./routes/auth');
const { handleMarkets } = require('./routes/markets');
const { handleOrders } = require('./routes/orders');
const { handleAccount } = require('./routes/account');
const { handleVault } = require('./routes/vault');
const { handleInsurance } = require('./routes/insurance');
const { handleRewards } = require('./routes/rewards');
const { handleAdmin } = require('./routes/admin');
const { handleLogos } = require('./routes/logos');

const routeHandlers = [handleAuth, handleMarkets, handleLogos, handleOrders, handleAccount, handleVault, handleInsurance, handleRewards, handleAdmin];
const rateBuckets = new Map();

function rateLimited(req, pathname) {
  const key = `${req.socket.remoteAddress || 'local'}:${pathname}`;
  const nowMs = Date.now();
  const bucket = rateBuckets.get(key) || { resetAt: nowMs + 60_000, count: 0 };
  if (nowMs > bucket.resetAt) {
    bucket.resetAt = nowMs + 60_000;
    bucket.count = 0;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count > 240;
}

async function handleApi(req, res, url) {
  const db = readDb();
  const pathname = url.pathname.replace(/^\/api\/v1/, '') || '/';
  if (rateLimited(req, pathname)) return sendError(res, 429, 'Too many requests');

  if (req.method === 'GET' && pathname === '/health') {
    return sendJson(res, 200, { ok: true, service: 'infomarket-api', time: now() });
  }

  for (const handler of routeHandlers) {
    const handled = await handler(req, res, pathname, url, db, writeDb);
    if (handled !== false) return handled;
  }

  return sendError(res, 404, 'API route not found', { method: req.method, pathname });
}

module.exports = { handleApi };
