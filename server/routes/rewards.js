const { sendJson } = require('../utils');
const { getDemoUser, getBalance } = require('../domain');

async function handleRewards(req, res, pathname, url, db) {
  if (req.method === 'GET' && pathname === '/rewards') return sendJson(res, 200, { items: db.rewardEntries, totalLockedLobster: getBalance(db, getDemoUser(db).id).lockedLobster });
  return false;
}

module.exports = { handleRewards };
