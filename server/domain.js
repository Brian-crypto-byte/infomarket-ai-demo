const { id, now } = require('./utils');

function getDemoUser(db) {
  db.users ||= [];
  if (!db.users[0]) {
    db.users.push({
      id: 'usr_demo',
      walletAddress: '7Nf8mZkB2q84xV1T9q',
      walletType: 'Phantom',
      status: 'active',
      authMethod: 'wallet',
      email: null,
      createdAt: now()
    });
  }
  return db.users[0];
}

function getBalance(db, userId) {
  db.balances ||= {};
  db.balances[userId] ||= { available: 0, frozen: 0, trading: 0, vault: 0, claimable: 0, lockedLobster: 0 };
  db.balances[userId].lockedLobster ||= 0;
  return db.balances[userId];
}

function ledgerEntry(db, entry) {
  db.ledger ||= [];
  db.ledger.unshift({ id: id('led'), userId: 'usr_demo', status: 'booked', createdAt: now(), ...entry });
}

function findMarketOption(db, marketId, optionId, extraMarkets = []) {
  const market = [...(db.markets || []), ...(extraMarkets || [])].find((item) => item.id === marketId);
  if (!market) return null;
  const option = (market.options || []).find((item) => item.id === optionId || item.label === optionId);
  return option ? { market, option } : null;
}

function optionOdds(option, side) {
  if (side === 'YES') return option.yesOdds;
  if (side === 'NO') return option.noOdds;
  if (side === 'UP') return option.upOdds;
  if (side === 'DOWN') return option.downOdds;
  return option.yesOdds || option.upOdds || 1;
}

function getRiskSettings(db) {
  db.riskSettings ||= {
    maxOrderUsdt: 5000,
    maxUserOpenExposureUsdt: 50000,
    maxMarketExposureUsdt: 120000,
    maxScoreExposureUsdt: 18000,
    maxInsurancePremiumUsdt: 1000
  };
  return db.riskSettings;
}

function openPositions(db) {
  return (db.positions || []).filter((position) => position.status === 'open');
}

function riskExposure(db, marketId, optionId) {
  const positions = openPositions(db);
  const marketPositions = positions.filter((position) => position.marketId === marketId);
  const optionPositions = optionId ? marketPositions.filter((position) => position.optionId === optionId) : [];
  return {
    openOrders: positions.length,
    marketStakeUsdt: Number(marketPositions.reduce((sum, item) => sum + Number(item.amountUsdt || 0), 0).toFixed(6)),
    marketPayoutUsdt: Number(marketPositions.reduce((sum, item) => sum + Number(item.potentialReturnUsdt || 0), 0).toFixed(6)),
    optionStakeUsdt: Number(optionPositions.reduce((sum, item) => sum + Number(item.amountUsdt || 0), 0).toFixed(6)),
    optionPayoutUsdt: Number(optionPositions.reduce((sum, item) => sum + Number(item.potentialReturnUsdt || 0), 0).toFixed(6)),
    userOpenPayoutUsdt: Number(positions.reduce((sum, item) => sum + Number(item.potentialReturnUsdt || 0), 0).toFixed(6))
  };
}

function validateOrderRisk(db, found, side, amount, potentialReturn) {
  const settings = getRiskSettings(db);
  const market = found.market;
  const option = found.option;
  const status = String(market.status || '').toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
  if (!['YES', 'NO', 'UP', 'DOWN'].includes(side)) throw new Error('Invalid order side');
  if (!Number.isFinite(potentialReturn) || potentialReturn <= 0) throw new Error('Invalid payout');
  if (status === 'suspended' || status === 'settled' || status === 'closed') throw new Error('Market is not accepting orders');
  if (amount > Number(settings.maxOrderUsdt || 0)) throw new Error(`Order exceeds max size ${settings.maxOrderUsdt} USDT`);
  const exposure = riskExposure(db, market.id, option.id);
  const nextUserPayout = exposure.userOpenPayoutUsdt + potentialReturn;
  const nextMarketPayout = exposure.marketPayoutUsdt + potentialReturn;
  const nextOptionPayout = exposure.optionPayoutUsdt + potentialReturn;
  if (nextUserPayout > Number(settings.maxUserOpenExposureUsdt || Infinity)) throw new Error('User open exposure limit exceeded');
  if (nextMarketPayout > Number(settings.maxMarketExposureUsdt || Infinity)) throw new Error('Market exposure limit exceeded');
  if (option.groupKey === 'correct_score' && nextOptionPayout > Number(settings.maxScoreExposureUsdt || Infinity)) {
    throw new Error('Correct score exposure limit exceeded');
  }
  return { settings, exposure: { ...exposure, nextUserPayout, nextMarketPayout, nextOptionPayout } };
}

function createOrder(db, body, extraMarkets = []) {
  const user = getDemoUser(db);
  const balance = getBalance(db, user.id);
  const amount = Number(body.amountUsdt || body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) throw new Error('Invalid amount');
  if (balance.available < amount) throw new Error('Insufficient available balance');
  const found = findMarketOption(db, body.marketId, body.optionId, extraMarkets);
  if (!found) throw new Error('Market option not found');
  const side = String(body.side || 'YES').toUpperCase();
  const odds = Number(optionOdds(found.option, side));
  if (!Number.isFinite(odds) || odds <= 1) throw new Error('Odds not available for side');
  if (found.option.groupKey === 'correct_score' && found.option.sellable === false && side !== 'YES' && side !== 'NO') {
    throw new Error('Invalid correct-score side');
  }
  const potentialReturn = Number((amount * odds).toFixed(6));
  const risk = validateOrderRisk(db, found, side, amount, potentialReturn);
  db.orders ||= [];
  db.positions ||= [];
  db.rewardEntries ||= [];
  db.insuranceNodes ||= [];
  const order = {
    id: id('ord'), userId: user.id, marketId: found.market.id, marketTitle: found.market.title,
    optionId: found.option.id, optionLabel: found.option.label, side, amountUsdt: amount, odds,
    potentialReturnUsdt: potentialReturn, insuranceEnabled: Boolean(body.insuranceEnabled), status: 'open', riskSnapshot: risk.exposure, createdAt: now()
  };
  const position = {
    id: id('pos'), userId: user.id, orderId: order.id, marketId: order.marketId, marketTitle: order.marketTitle,
    optionId: order.optionId, optionLabel: order.optionLabel, side, amountUsdt: amount, odds,
    potentialReturnUsdt: potentialReturn, sellable: found.option.sellable, status: 'open', createdAt: now()
  };
  const credits = Number((amount * 0.125).toFixed(6));
  db.orders.unshift(order);
  db.positions.unshift(position);
  db.rewardEntries.unshift({ id: id('rew'), userId: user.id, sourceType: 'order', sourceId: order.id, credits, status: 'locked', createdAt: now() });
  balance.available = Number((balance.available - amount).toFixed(6));
  balance.frozen = Number((balance.frozen + amount).toFixed(6));
  balance.trading = Number((balance.trading + amount).toFixed(6));
  balance.lockedLobster = Number((balance.lockedLobster + credits).toFixed(6));
  ledgerEntry(db, { type: 'order_frozen', asset: 'USDT', amount: -amount, refType: 'order', refId: order.id, note: `${found.market.title} / ${found.option.label} ${side}` });
  ledgerEntry(db, { type: 'lobster_reward', asset: 'LOB', amount: credits, refType: 'order', refId: order.id, note: 'Trading mining reward' });
  if (order.insuranceEnabled) {
    const premium = Number((amount * 0.035).toFixed(6));
    const maxCover = Number((amount * 0.4).toFixed(6));
    db.insuranceNodes.unshift({
      id: id('alp'), userId: user.id, orderId: order.id, marketId: order.marketId, marketTitle: order.marketTitle,
      premiumUsdt: premium, maxCoverUsdt: maxCover, periodAmountUsdt: Number((maxCover * 0.25).toFixed(6)),
      status: 'active', phase: 'monitoring', createdAt: now()
    });
    balance.available = Number((balance.available - premium).toFixed(6));
    ledgerEntry(db, { type: 'insurance_premium', asset: 'USDT', amount: -premium, refType: 'order', refId: order.id, note: 'Alpha Insurance premium' });
  }
  return { order, position, lobsterReward: credits, risk: risk.exposure };
}

function settleMarket(db, marketId, winningOptionId, winningSide = 'YES') {
  const user = getDemoUser(db);
  const balance = getBalance(db, user.id);
  const side = String(winningSide || 'YES').toUpperCase();
  const positions = db.positions.filter((item) => item.marketId === marketId && item.status === 'open');
  const settled = [];
  positions.forEach((position) => {
    const amount = Number(position.amountUsdt || 0);
    const won = position.optionId === winningOptionId && String(position.side || '').toUpperCase() === side;
    const payout = won ? Number(position.potentialReturnUsdt || 0) : 0;
    position.status = won ? 'won' : 'lost';
    position.settledAt = now();
    position.payoutUsdt = payout;
    const order = db.orders.find((item) => item.id === position.orderId);
    if (order) {
      order.status = position.status;
      order.settledAt = position.settledAt;
      order.payoutUsdt = payout;
    }
    balance.frozen = Number(Math.max(0, balance.frozen - amount).toFixed(6));
    balance.trading = Number(Math.max(0, balance.trading - amount).toFixed(6));
    if (payout > 0) balance.available = Number((balance.available + payout).toFixed(6));
    ledgerEntry(db, {
      type: won ? 'settlement_win' : 'settlement_loss',
      asset: 'USDT',
      amount: payout,
      refType: 'position',
      refId: position.id,
      note: `${position.marketTitle} / ${position.optionLabel} ${position.side}`
    });
    settled.push({ positionId: position.id, won, payoutUsdt: payout });
  });
  const market = db.markets.find((item) => item.id === marketId);
  if (market) {
    market.status = 'settled';
    market.settlement = { winningOptionId, winningSide: side, settledAt: now() };
  }
  return { marketId, winningOptionId, winningSide: side, settled };
}

function settlePositionFinancials(db, position, won, context = {}) {
  const balance = getBalance(db, position.userId || getDemoUser(db).id);
  const amount = Number(position.amountUsdt || 0);
  const payout = won ? Number(position.potentialReturnUsdt || 0) : 0;
  position.status = won ? 'won' : 'lost';
  position.settledAt = context.settledAt || now();
  position.payoutUsdt = payout;
  position.result = context.result || null;

  const order = (db.orders || []).find((item) => item.id === position.orderId);
  if (order) {
    order.status = position.status;
    order.settledAt = position.settledAt;
    order.payoutUsdt = payout;
    order.result = context.result || null;
  }

  balance.frozen = Number(Math.max(0, balance.frozen - amount).toFixed(6));
  balance.trading = Number(Math.max(0, balance.trading - amount).toFixed(6));
  if (payout > 0) balance.available = Number((balance.available + payout).toFixed(6));

  ledgerEntry(db, {
    userId: position.userId || 'usr_demo',
    type: won ? 'settlement_win' : 'settlement_loss',
    asset: 'USDT',
    amount: payout,
    refType: 'position',
    refId: position.id,
    note: `${position.marketTitle} / ${position.optionLabel} ${position.side}`
  });

  if (!won && order?.insuranceEnabled) {
    const node = (db.insuranceNodes || []).find((item) => item.orderId === order.id);
    if (node && node.phase !== 'claimable' && node.status !== 'paid') {
      const claimable = Number(node.periodAmountUsdt || node.maxCoverUsdt || 0);
      node.status = 'claimable';
      node.phase = 'claimable';
      node.eligibleLossUsdt = amount;
      node.claimableUsdt = claimable;
      node.verifiedAt = position.settledAt;
      balance.claimable = Number((Number(balance.claimable || 0) + claimable).toFixed(6));
      ledgerEntry(db, {
        userId: position.userId || 'usr_demo',
        type: 'insurance_claimable',
        asset: 'USDT',
        amount: claimable,
        refType: 'insurance',
        refId: node.id,
        note: 'Alpha Insurance claimable'
      });
    }
  }

  return { positionId: position.id, orderId: position.orderId, won, payoutUsdt: payout };
}

function optionWins(option, position, result) {
  const side = String(position.side || '').toUpperCase();
  const group = option?.groupKey;
  if (!option || !['YES', 'NO'].includes(side)) return false;
  if (group === 'match_result') {
    const winningSort = result.home > result.away ? 1 : (result.home === result.away ? 2 : 3);
    const isWinningOption = Number(option.sortOrder) === winningSort;
    return side === 'YES' ? isWinningOption : !isWinningOption;
  }
  if (group === 'correct_score') {
    const isExactScore = option.label === `${result.home}-${result.away}`;
    return side === 'YES' ? isExactScore : !isExactScore;
  }
  return false;
}

function settleFootballMarket(db, market, result, meta = {}) {
  db.settlements ||= [];
  if (db.settlements.some((item) => item.marketId === market.id && item.status === 'settled')) {
    return { marketId: market.id, alreadySettled: true, settled: [] };
  }
  const settledAt = now();
  const optionsById = new Map((market.options || []).map((option) => [option.id, option]));
  const positions = (db.positions || []).filter((item) => item.marketId === market.id && item.status === 'open');
  const settled = positions.map((position) => {
    const option = optionsById.get(position.optionId);
    return settlePositionFinancials(db, position, optionWins(option, position, result), { result, settledAt });
  });

  const winningSort = result.home > result.away ? 1 : (result.home === result.away ? 2 : 3);
  const winningResult = (market.options || []).find((option) => option.groupKey === 'match_result' && Number(option.sortOrder) === winningSort);
  const winningScore = (market.options || []).find((option) => option.groupKey === 'correct_score' && option.label === `${result.home}-${result.away}`);
  market.status = 'settled';
  market.score = { home: result.home, away: result.away };
  market.settlement = {
    type: 'football',
    score: { home: result.home, away: result.away },
    winningResultOptionId: winningResult?.id || null,
    winningScoreOptionId: winningScore?.id || null,
    source: meta.source || 'football-oracle',
    settledAt
  };
  db.settlements.unshift({
    id: id('set'),
    marketId: market.id,
    title: market.title,
    type: 'football',
    status: 'settled',
    score: { home: result.home, away: result.away },
    source: meta.source || 'football-oracle',
    sourceId: meta.sourceId || null,
    settledPositions: settled.length,
    createdAt: settledAt
  });
  return { marketId: market.id, score: { home: result.home, away: result.away }, settled };
}

function voidMarket(db, market, meta = {}) {
  db.settlements ||= [];
  if (db.settlements.some((item) => item.marketId === market.id && item.status === 'voided')) {
    return { marketId: market.id, alreadyVoided: true, refunded: [] };
  }
  const voidedAt = now();
  const positions = (db.positions || []).filter((item) => item.marketId === market.id && item.status === 'open');
  const refunded = positions.map((position) => {
    const balance = getBalance(db, position.userId || getDemoUser(db).id);
    const amount = Number(position.amountUsdt || 0);
    position.status = 'voided';
    position.voidedAt = voidedAt;
    position.payoutUsdt = amount;
    position.result = { status: 'voided', reason: meta.reason || 'Market voided' };

    const order = (db.orders || []).find((item) => item.id === position.orderId);
    if (order) {
      order.status = 'voided';
      order.voidedAt = voidedAt;
      order.payoutUsdt = amount;
      order.result = position.result;
    }

    balance.frozen = Number(Math.max(0, balance.frozen - amount).toFixed(6));
    balance.trading = Number(Math.max(0, balance.trading - amount).toFixed(6));
    balance.available = Number((balance.available + amount).toFixed(6));
    ledgerEntry(db, {
      userId: position.userId || 'usr_demo',
      type: 'market_void_refund',
      asset: 'USDT',
      amount,
      refType: 'position',
      refId: position.id,
      note: `${position.marketTitle} / ${position.optionLabel} refunded`
    });
    return { positionId: position.id, orderId: position.orderId, refundUsdt: amount };
  });

  market.status = 'voided';
  market.oracleStatus = 'voided';
  market.settlement = {
    type: 'void',
    status: 'voided',
    reason: meta.reason || 'Market voided',
    source: meta.source || 'manual-review',
    settledAt: voidedAt
  };
  db.settlements.unshift({
    id: id('set'),
    marketId: market.id,
    title: market.title,
    type: 'void',
    status: 'voided',
    reason: meta.reason || 'Market voided',
    source: meta.source || 'manual-review',
    settledPositions: refunded.length,
    createdAt: voidedAt
  });
  return { marketId: market.id, status: 'voided', refunded };
}

module.exports = { getDemoUser, getBalance, ledgerEntry, findMarketOption, optionOdds, getRiskSettings, riskExposure, validateOrderRisk, createOrder, settleMarket, settleFootballMarket, voidMarket };
