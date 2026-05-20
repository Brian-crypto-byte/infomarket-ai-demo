const { sendJson, sendError, readBody } = require('../utils');
const { findMarketOption, optionOdds, validateOrderRisk, createOrder } = require('../domain');
const { publicMarkets } = require('./markets');

async function handleOrders(req, res, pathname, url, db, writeDb) {
  if (req.method === 'POST' && pathname === '/orders/quote') {
    const body = await readBody(req);
    const found = findMarketOption(db, body.marketId, body.optionId, await publicMarkets());
    if (!found) return sendError(res, 404, 'Market option not found');
    const amount = Number(body.amountUsdt || 0);
    const side = String(body.side || 'YES').toUpperCase();
    const odds = Number(optionOdds(found.option, side));
    const potentialReturnUsdt = Number((amount * odds).toFixed(6));
    try {
      const risk = validateOrderRisk(db, found, side, amount, potentialReturnUsdt);
      return sendJson(res, 200, { marketId: found.market.id, optionId: found.option.id, side, amountUsdt: amount, odds, potentialReturnUsdt, infCredits: Number((amount * 0.125).toFixed(6)), insurancePremiumUsdt: body.insuranceEnabled ? Number((amount * 0.035).toFixed(6)) : 0, sellable: found.option.sellable, risk: risk.exposure });
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  }
  if (req.method === 'POST' && pathname === '/orders') {
    const body = await readBody(req);
    try {
      const result = createOrder(db, body, await publicMarkets());
      writeDb(db);
      return sendJson(res, 201, result);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  }
  if (req.method === 'GET' && pathname === '/positions') return sendJson(res, 200, { items: db.positions });
  return false;
}

module.exports = { handleOrders };
