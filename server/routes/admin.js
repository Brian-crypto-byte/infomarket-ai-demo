const { sendJson, sendError, readBody } = require('../utils');
const { getDemoUser, getBalance, getRiskSettings, riskExposure, settleMarket, settleFootballMarket, voidMarket } = require('../domain');
const { collectFootballCandidates, publishCollectedFootball, runFootballCollection, runFootballSettlement } = require('../football-ops');
const { priceFootballMarkets } = require('../odds/football-pricing');

async function handleAdmin(req, res, pathname, url, db, writeDb) {
  if (req.method === 'GET' && pathname === '/admin/withdrawals') return sendJson(res, 200, { items: db.withdrawals });

  if (req.method === 'POST' && pathname === '/admin/football/odds/reprice') {
    const generatedAt = new Date().toISOString();
    const before = JSON.stringify(db.markets || []);
    db.markets = priceFootballMarkets(db.markets || [], { generatedAt });
    const footballMarkets = (db.markets || []).filter((market) => market.type === 'football');
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_odds_repriced',
      entityType: 'pricing_model',
      details: {
        model: 'poisson-dixon-coles-v1',
        footballMarkets: footballMarkets.length,
        scoreLinesPerMatch: 25,
        changed: before !== JSON.stringify(db.markets || [])
      },
      createdAt: generatedAt
    });
    writeDb(db);
    return sendJson(res, 200, {
      ok: true,
      model: 'poisson-dixon-coles-v1',
      footballMarkets: footballMarkets.length,
      scoreLinesPerMatch: 25,
      generatedAt
    });
  }

  if (req.method === 'GET' && pathname === '/admin/football/import/preview') {
    const candidates = await collectFootballCandidates(db);
    db.footballImport = {
      status: {
        ...(db.footballImport?.status || {}),
        lastPreviewAt: new Date().toISOString(),
        total: candidates.length,
        publishable: candidates.filter((item) => item.publishable).length,
        alreadyPublished: candidates.filter((item) => item.alreadyPublished).length,
        skipped: candidates.filter((item) => !item.publishable && !item.alreadyPublished).length
      },
      candidates: candidates.slice(0, 250)
    };
    writeDb(db);
    return sendJson(res, 200, {
      items: candidates,
      summary: {
        total: candidates.length,
        publishable: candidates.filter((item) => item.publishable).length,
        alreadyPublished: candidates.filter((item) => item.alreadyPublished).length,
        skipped: candidates.filter((item) => !item.publishable && !item.alreadyPublished).length
      }
    });
  }

  if (req.method === 'GET' && pathname === '/admin/football/import/status') {
    return sendJson(res, 200, db.footballImport || { status: null, candidates: [] });
  }

  if (req.method === 'POST' && pathname === '/admin/football/import/run') {
    const result = await runFootballCollection(db, { autoPublish: true });
    writeDb(db);
    return sendJson(res, 200, {
      status: result.status,
      published: result.published,
      count: result.published.length,
      items: result.candidates
    });
  }

  if (req.method === 'POST' && pathname === '/admin/football/import/publish') {
    const body = await readBody(req);
    const candidates = await collectFootballCandidates(db);
    const published = publishCollectedFootball(db, candidates, Array.isArray(body.ids) ? body.ids : []);
    writeDb(db);
    return sendJson(res, 200, { published, count: published.length });
  }

  if (req.method === 'POST' && pathname === '/admin/football/settlement/run') {
    const result = await runFootballSettlement(db);
    writeDb(db);
    return sendJson(res, 200, result);
  }

  if (req.method === 'POST' && pathname === '/admin/football/settlement/manual') {
    const body = await readBody(req);
    const market = (db.markets || []).find((item) => item.id === body.marketId);
    if (!market) return sendError(res, 404, 'Market not found');
    if (market.type !== 'football') return sendError(res, 400, 'Manual score settlement is only available for football markets');
    if (market.status === 'settled' || market.status === 'voided') return sendError(res, 400, 'Market is already closed');
    const home = Number(body.homeScore);
    const away = Number(body.awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0 || home > 30 || away > 30) {
      return sendError(res, 400, 'Invalid final score');
    }
    const result = settleFootballMarket(db, market, { home, away }, {
      source: 'manual-review',
      sourceId: body.sourceNote || 'operator'
    });
    market.oracleStatus = 'manual_settled';
    market.resultPulledAt = new Date().toISOString();
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_manual_settlement',
      entityType: 'market',
      entityId: market.id,
      details: { score: { home, away }, sourceNote: body.sourceNote || null },
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, result);
  }

  if (req.method === 'POST' && pathname === '/admin/football/settlement/void') {
    const body = await readBody(req);
    const market = (db.markets || []).find((item) => item.id === body.marketId);
    if (!market) return sendError(res, 404, 'Market not found');
    if (market.status === 'settled') return sendError(res, 400, 'Settled markets cannot be voided here');
    const result = voidMarket(db, market, { reason: body.reason || 'Match voided by operator', source: 'manual-review' });
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_market_voided',
      entityType: 'market',
      entityId: market.id,
      details: { reason: body.reason || null, refunded: result.refunded?.length || 0 },
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, result);
  }

  if (req.method === 'POST' && pathname === '/admin/football/settlement/review') {
    const body = await readBody(req);
    const market = (db.markets || []).find((item) => item.id === body.marketId);
    if (!market) return sendError(res, 404, 'Market not found');
    market.oracleStatus = 'needs_review';
    market.reviewReason = body.reason || 'Operator review required';
    market.reviewedAt = new Date().toISOString();
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_market_needs_review',
      entityType: 'market',
      entityId: market.id,
      details: { reason: market.reviewReason },
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, { market });
  }

  if (req.method === 'GET' && pathname === '/admin/football/settlement/status') {
    const nowMs = Date.now();
    const delayMs = 120 * 60 * 1000;
    const football = (db.markets || []).filter((market) => market.type === 'football');
    const due = football
      .filter((market) => market.status !== 'settled')
      .map((market) => {
        const start = Date.parse(market.startsAt || '');
        const readyAt = Number.isFinite(start) ? new Date(start + delayMs).toISOString() : null;
        return {
          id: market.id,
          title: market.title,
          league: market.league,
          startsAt: market.startsAt,
          readyAt,
          due: readyAt ? nowMs >= Date.parse(readyAt) : false,
          oracleStatus: market.oracleStatus || null,
          reviewReason: market.reviewReason || null,
          home: (market.participants || []).find((item) => item.role === 'home')?.name || null,
          away: (market.participants || []).find((item) => item.role === 'away')?.name || null,
          source: market.source || market.oddsSource?.provider || null
        };
      })
      .filter((item) => item.due || item.oracleStatus)
      .sort((a, b) => (Date.parse(a.readyAt || '') || 0) - (Date.parse(b.readyAt || '') || 0))
      .slice(0, 80);
    return sendJson(res, 200, {
      status: {
        footballMarkets: football.length,
        settled: football.filter((market) => market.status === 'settled').length,
        due: due.filter((item) => item.due).length,
        lastOracleCheck: db.oracleResults?.[0]?.checkedAt || null,
        lastSettlement: db.settlements?.[0]?.createdAt || null
      },
      due,
      oracleResults: (db.oracleResults || []).slice(0, 80),
      settlements: (db.settlements || []).slice(0, 80)
    });
  }

  if (req.method === 'GET' && pathname === '/admin/risk') {
    const settings = getRiskSettings(db);
    const markets = (db.markets || []).map((market) => ({
      marketId: market.id,
      title: market.title,
      status: market.status,
      ...riskExposure(db, market.id)
    }));
    return sendJson(res, 200, { settings, markets });
  }

  if ((req.method === 'PATCH' || req.method === 'POST') && pathname === '/admin/risk') {
    const body = await readBody(req);
    const settings = getRiskSettings(db);
    ['maxOrderUsdt', 'maxUserOpenExposureUsdt', 'maxMarketExposureUsdt', 'maxScoreExposureUsdt', 'maxInsurancePremiumUsdt'].forEach((key) => {
      if (body[key] !== undefined) {
        const value = Number(body[key]);
        if (Number.isFinite(value) && value > 0) settings[key] = value;
      }
    });
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'risk_settings_updated',
      entityType: 'risk',
      details: settings,
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, { settings });
  }

  const withdrawalMatch = pathname.match(/^\/admin\/withdrawals\/([^/]+)\/(approve|reject|complete)$/);
  if (req.method === 'POST' && withdrawalMatch) {
    const [, withdrawalId, action] = withdrawalMatch;
    const withdrawal = (db.withdrawals || []).find((item) => item.id === withdrawalId);
    if (!withdrawal) return sendError(res, 404, 'Withdrawal not found');

    const balance = getBalance(db, withdrawal.userId || getDemoUser(db).id);
    const amount = Number(withdrawal.amountUsdt || 0);
    if (action === 'approve') {
      if (withdrawal.status !== 'pending_review') return sendError(res, 400, 'Withdrawal is not pending review');
      withdrawal.status = 'broadcasting';
      withdrawal.reviewedAt = new Date().toISOString();
      balance.frozen = Number(Math.max(0, balance.frozen - amount).toFixed(6));
    } else if (action === 'reject') {
      if (withdrawal.status !== 'pending_review') return sendError(res, 400, 'Withdrawal is not pending review');
      withdrawal.status = 'rejected';
      withdrawal.reviewedAt = new Date().toISOString();
      balance.frozen = Number(Math.max(0, balance.frozen - amount).toFixed(6));
      balance.available = Number((balance.available + amount).toFixed(6));
    } else {
      if (withdrawal.status !== 'broadcasting') return sendError(res, 400, 'Withdrawal is not broadcasting');
      withdrawal.status = 'completed';
      withdrawal.txHash = withdrawal.txHash || `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
      withdrawal.completedAt = new Date().toISOString();
    }
    (db.ledger || []).forEach((entry) => {
      if (entry.refType === 'withdrawal' && entry.refId === withdrawal.id) entry.status = withdrawal.status;
    });
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: `withdrawal_${action}`,
      entityType: 'withdrawal',
      entityId: withdrawal.id,
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, { withdrawal, balance });
  }

  const settleMatch = pathname.match(/^\/admin\/markets\/([^/]+)\/settle$/);
  if (req.method === 'POST' && settleMatch) {
    const body = await readBody(req);
    const winningOptionId = body.winningOptionId || body.optionId;
    if (!winningOptionId) return sendError(res, 400, 'Missing winning option');
    const result = settleMarket(db, settleMatch[1], winningOptionId, body.winningSide || body.side || 'YES');
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'market_settled',
      entityType: 'market',
      entityId: settleMatch[1],
      details: result,
      createdAt: new Date().toISOString()
    });
    writeDb(db);
    return sendJson(res, 200, result);
  }

  if (req.method === 'GET' && pathname === '/admin/audit/reconcile') {
    const balance = getBalance(db, getDemoUser(db).id);
    const internal = balance.available + balance.frozen + balance.trading + balance.vault + balance.claimable;
    const custody = internal + 1200;
    return sendJson(res, 200, { internalUsdt: internal, custodyUsdt: custody, diffUsdt: custody - internal, checkedAt: new Date().toISOString() });
  }
  return false;
}

module.exports = { handleAdmin };
