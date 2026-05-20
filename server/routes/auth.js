const { sendJson, sendError, readBody, id } = require('../utils');
const { getDemoUser } = require('../domain');

const nonces = new Map();

function validAddress(value = '') {
  return /^(0x[a-fA-F0-9]{20,}|[1-9A-HJ-NP-Za-km-z]{32,}|T[A-Za-z0-9]{25,})$/.test(String(value || '').trim());
}

async function handleAuth(req, res, pathname, url, db, writeDb) {
  if (req.method === 'POST' && pathname === '/auth/nonce') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const walletAddress = String(body.walletAddress || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, 'Invalid email');
    if (walletAddress && !validAddress(walletAddress)) return sendError(res, 400, 'Invalid wallet address');
    const nonce = `Sign in to infomarket.ai: ${id('nonce')}`;
    nonces.set(nonce, Date.now() + 5 * 60 * 1000);
    return sendJson(res, 200, {
      nonce,
      walletAddress,
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
  }

  if (req.method === 'POST' && pathname === '/auth/login') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const walletAddress = String(body.walletAddress || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, 'Invalid email');
    if (walletAddress && !validAddress(walletAddress)) return sendError(res, 400, 'Invalid wallet address');
    if (body.nonce) {
      const expiresAt = nonces.get(body.nonce);
      if (!expiresAt || expiresAt < Date.now()) return sendError(res, 401, 'Sign-in nonce expired');
      nonces.delete(body.nonce);
    }
    const user = getDemoUser(db);
    user.authMethod = email ? 'email' : 'wallet';
    user.email = email || user.email || null;
    user.walletAddress = walletAddress || user.walletAddress;
    user.walletType = body.walletType || user.walletType;
    writeDb(db);
    return sendJson(res, 200, { accessToken: id('session'), user });
  }
  return false;
}

module.exports = { handleAuth };
