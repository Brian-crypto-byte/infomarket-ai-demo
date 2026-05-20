const STATIC_DB_KEY = 'infomarket.static.db.v1';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scoreOption(option) {
  return option?.groupKey === 'correct_score';
}

function normalizeCategoryParam(category) {
  if (category === 'soccer' || category === 'trending') return 'sports';
  return category;
}

function marketVisibleForCategory(market, category) {
  if (!category) return true;
  if (category === 'trending') return market.type === 'football' || market.sport === 'soccer';
  if (category === 'soccer') return market.type === 'football' || market.sport === 'soccer';
  return market.category === normalizeCategoryParam(category);
}

function staticBalance(db) {
  const userId = db.users?.[0]?.id || 'usr_demo';
  db.balances ||= {};
  db.balances[userId] ||= { available: 25000, frozen: 0, trading: 0, vault: 0, claimable: 0, lockedInf: 0 };
  return db.balances[userId];
}

function optionOdds(option, side) {
  const s = String(side || 'YES').toUpperCase();
  if (option?.sideType === 'up_down') return s === 'DOWN' ? option.downOdds : option.upOdds;
  return s === 'NO' ? option.noOdds : option.yesOdds;
}

async function loadStaticDb() {
  try {
    const cached = JSON.parse(localStorage.getItem(STATIC_DB_KEY) || 'null');
    if (cached?.markets?.length) return cached;
  } catch (_) {}
  const response = await fetch('data/mock-db.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Static data ${response.status}`);
  const db = await response.json();
  localStorage.setItem(STATIC_DB_KEY, JSON.stringify(db));
  return db;
}

function saveStaticDb(db) {
  try {
    localStorage.setItem(STATIC_DB_KEY, JSON.stringify(db));
  } catch (_) {}
}

async function staticRequest(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const url = new URL(path, window.location.origin);
  const db = await loadStaticDb();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  if (method === 'GET' && url.pathname === '/health') {
    return { ok: true, service: 'infomarket-static-preview', time: nowIso(), mode: 'static' };
  }

  if (method === 'POST' && url.pathname === '/auth/nonce') {
    return {
      nonce: `Sign in to infomarket.ai preview: ${uid('nonce')}`,
      walletAddress: body.walletAddress || '',
      email: body.email || '',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
  }

  if (method === 'POST' && url.pathname === '/auth/login') {
    db.users ||= [{ id: 'usr_demo', status: 'active' }];
    const user = db.users[0];
    user.authMethod = body.email ? 'email' : 'wallet';
    user.email = body.email || user.email || 'demo@infomarket.ai';
    user.walletAddress = body.walletAddress || user.walletAddress || '7Nf8mZkB2q84xV1T9q';
    user.walletType = body.walletType || user.walletType || 'Demo';
    saveStaticDb(db);
    return { accessToken: uid('session'), user };
  }

  if (method === 'GET' && url.pathname === '/markets') {
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const seen = new Set();
    const items = (db.markets || [])
      .filter((market) => !/alpha fc|beta fc|test league/i.test([market.id, market.title, market.league].join(' ')))
      .filter((market) => !type || market.type === type)
      .filter((market) => !status || market.status === status)
      .filter((market) => marketVisibleForCategory(market, category))
      .filter((market) => {
        const key = `${market.type}:${String(market.title || '').toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (Date.parse(a.startsAt || '') || 0) - (Date.parse(b.startsAt || '') || 0));
    return { items };
  }

  const marketMatch = url.pathname.match(/^\/markets\/([^/]+)$/);
  if (method === 'GET' && marketMatch) {
    const market = (db.markets || []).find((item) => item.id === decodeURIComponent(marketMatch[1]));
    if (!market) throw new Error('Market not found');
    return { market };
  }

  if (method === 'GET' && url.pathname === '/account/balances') return staticBalance(db);
  if (method === 'GET' && url.pathname === '/ledger') return { items: db.ledger || [] };
  if (method === 'GET' && url.pathname === '/positions') return { items: db.positions || [] };
  if (method === 'GET' && url.pathname === '/insurance/nodes') return { items: db.insuranceNodes || [] };
  if (method === 'GET' && url.pathname === '/rewards') return { items: db.rewardEntries || [], totalLockedInf: staticBalance(db).lockedInf || 0 };
  if (method === 'GET' && url.pathname === '/vault') {
    const balance = staticBalance(db);
    const lockDays = Number(balance.vaultLockDays || 30);
    const aprMap = { 7: 0.068, 15: 0.088, 30: 0.124, 60: 0.158, 180: 0.226 };
    const estimatedApr = aprMap[lockDays] || aprMap[30];
    return {
      principalUsdt: Number(balance.vault || 0),
      lockDays,
      estimatedApr,
      accruedYieldUsdt: Number(((balance.vault || 0) * estimatedApr * lockDays / 365).toFixed(6))
    };
  }

  if (method === 'POST' && url.pathname === '/deposits/address') {
    return { chain: 'solana', address: db.users?.[0]?.walletAddress || '7Nf8mZkB2q84xV1T9q', token: 'USDT' };
  }

  if (method === 'POST' && url.pathname === '/deposits/simulate') {
    const amount = Number(body.amountUsdt || 0);
    const balance = staticBalance(db);
    balance.available = Number((Number(balance.available || 0) + amount).toFixed(6));
    db.deposits ||= [];
    const deposit = { id: uid('dep'), amountUsdt: amount, chain: body.chain || 'solana', status: 'confirmed', createdAt: nowIso(), confirmedAt: nowIso() };
    db.deposits.unshift(deposit);
    saveStaticDb(db);
    return { deposit, balance };
  }

  if (method === 'POST' && url.pathname === '/withdrawals') {
    const amount = Number(body.amountUsdt || 0);
    const balance = staticBalance(db);
    balance.available = Number(Math.max(0, Number(balance.available || 0) - amount).toFixed(6));
    balance.frozen = Number((Number(balance.frozen || 0) + amount).toFixed(6));
    db.withdrawals ||= [];
    const withdrawal = { id: uid('wd'), address: body.address, amountUsdt: amount, riskLevel: amount > 10000 ? 'high' : 'low', status: 'pending_review', createdAt: nowIso() };
    db.withdrawals.unshift(withdrawal);
    saveStaticDb(db);
    return { withdrawal, balance };
  }

  if (method === 'POST' && url.pathname === '/vault/deposit') {
    const amount = Number(body.amountUsdt || 0);
    const balance = staticBalance(db);
    balance.available = Number(Math.max(0, Number(balance.available || 0) - amount).toFixed(6));
    balance.vault = Number((Number(balance.vault || 0) + amount).toFixed(6));
    balance.vaultLockDays = Number(body.lockDays || 30);
    saveStaticDb(db);
    return { balance };
  }

  if (method === 'POST' && url.pathname === '/vault/withdraw') {
    const amount = Number(body.amountUsdt || 0);
    const balance = staticBalance(db);
    balance.vault = Number(Math.max(0, Number(balance.vault || 0) - amount).toFixed(6));
    balance.available = Number((Number(balance.available || 0) + amount).toFixed(6));
    saveStaticDb(db);
    return { balance };
  }

  if (method === 'POST' && url.pathname === '/orders/quote') {
    const market = (db.markets || []).find((item) => item.id === body.marketId);
    const option = market?.options?.find((item) => item.id === body.optionId);
    if (!market || !option) throw new Error('Market option not found');
    const amountUsdt = Number(body.amountUsdt || 0);
    const odds = Number(optionOdds(option, body.side) || 1);
    return {
      marketId: market.id,
      optionId: option.id,
      side: String(body.side || 'YES').toUpperCase(),
      amountUsdt,
      odds,
      potentialReturnUsdt: Number((amountUsdt * odds).toFixed(6)),
      infCredits: Number((amountUsdt * 0.125).toFixed(6)),
      insurancePremiumUsdt: body.insuranceEnabled ? Number((amountUsdt * 0.035).toFixed(6)) : 0,
      sellable: !scoreOption(option) && option.sellable !== false,
      risk: { mode: 'static-preview' }
    };
  }

  if (method === 'POST' && url.pathname === '/orders') {
    const quote = await staticRequest('/orders/quote', { method: 'POST', body });
    const balance = staticBalance(db);
    const totalCost = quote.amountUsdt + quote.insurancePremiumUsdt;
    balance.available = Number(Math.max(0, Number(balance.available || 0) - totalCost).toFixed(6));
    balance.trading = Number((Number(balance.trading || 0) + quote.amountUsdt).toFixed(6));
    db.positions ||= [];
    const position = { id: uid('pos'), ...quote, status: 'open', createdAt: nowIso() };
    db.positions.unshift(position);
    saveStaticDb(db);
    return { order: { id: uid('ord'), ...quote, createdAt: nowIso() }, position, balance };
  }

  if (method === 'GET' && url.pathname === '/admin/withdrawals') return { items: db.withdrawals || [] };
  if (method === 'GET' && url.pathname === '/admin/audit/reconcile') return { ok: true, varianceUsdt: 0, checkedAt: nowIso(), items: [] };
  if (method === 'GET' && url.pathname === '/admin/risk') return { settings: db.riskSettings || {}, markets: [] };
  if (method === 'GET' && url.pathname === '/admin/football/import/status') return db.footballImport || { status: null, candidates: [] };
  if (method === 'GET' && url.pathname === '/admin/football/settlement/status') {
    const football = (db.markets || []).filter((market) => market.type === 'football');
    return { status: { footballMarkets: football.length, settled: football.filter((m) => m.status === 'settled').length, due: 0, lastOracleCheck: null, lastSettlement: null }, due: [], oracleResults: [], settlements: [] };
  }
  if (method === 'GET' && url.pathname.startsWith('/logos/')) return { logo: null };

  if (['POST', 'PATCH'].includes(method)) {
    return { ok: true, mode: 'static-preview', time: nowIso() };
  }

  throw new Error(`Static route not available: ${method} ${url.pathname}`);
}

window.InfoMarketAPI = {
  base: '/api/v1',
  async request(path, options = {}) {
    try {
      const response = await fetch(`${this.base}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
        body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(data?.error?.message || `API ${response.status}`);
      return data;
    } catch (error) {
      if (window.location.protocol === 'file:' || !window.location.pathname.startsWith('/api/')) {
        return staticRequest(path, options);
      }
      throw error;
    }
  },
  health() { return this.request('/health'); },
  authNonce(payload) { return this.request('/auth/nonce', { method: 'POST', body: payload }); },
  authLogin(payload) { return this.request('/auth/login', { method: 'POST', body: payload }); },
  markets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/markets${query ? `?${query}` : ''}`);
  },
  market(id) { return this.request(`/markets/${encodeURIComponent(id)}`); },
  createMarket(payload) { return this.request('/admin/markets', { method: 'POST', body: payload }); },
  updateMarketOdds(marketId, options) {
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/odds`, { method: 'PATCH', body: { options } });
  },
  updateMarketStatus(marketId, status) {
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/status`, { method: 'PATCH', body: { status } });
  },
  teamLogo(name) { return this.request(`/logos/team?name=${encodeURIComponent(name)}`); },
  leagueLogo(name) { return this.request(`/logos/league?name=${encodeURIComponent(name)}`); },
  quoteOrder(payload) { return this.request('/orders/quote', { method: 'POST', body: payload }); },
  createOrder(payload) { return this.request('/orders', { method: 'POST', body: payload }); },
  positions() { return this.request('/positions'); },
  balances() { return this.request('/account/balances'); },
  ledger() { return this.request('/ledger'); },
  depositAddress() { return this.request('/deposits/address', { method: 'POST', body: { chain: 'solana' } }); },
  simulateDeposit(amountUsdt, chain = 'solana') { return this.request('/deposits/simulate', { method: 'POST', body: { amountUsdt, chain } }); },
  createWithdrawal(address, amountUsdt) { return this.request('/withdrawals', { method: 'POST', body: { address, amountUsdt } }); },
  vault() { return this.request('/vault'); },
  vaultDeposit(amountUsdt, lockDays = 30) { return this.request('/vault/deposit', { method: 'POST', body: { amountUsdt, lockDays } }); },
  vaultWithdraw(amountUsdt) { return this.request('/vault/withdraw', { method: 'POST', body: { amountUsdt } }); },
  insuranceNodes() { return this.request('/insurance/nodes'); },
  claimInsuranceNode(id) { return this.request(`/insurance/nodes/${encodeURIComponent(id)}/claim`, { method: 'POST' }); },
  rewards() { return this.request('/rewards'); },
  adminWithdrawals() { return this.request('/admin/withdrawals'); },
  footballImportPreview() { return this.request('/admin/football/import/preview'); },
  footballImportStatus() { return this.request('/admin/football/import/status'); },
  runFootballImport() { return this.request('/admin/football/import/run', { method: 'POST' }); },
  publishFootballImport(ids = []) { return this.request('/admin/football/import/publish', { method: 'POST', body: { ids } }); },
  runFootballSettlement() { return this.request('/admin/football/settlement/run', { method: 'POST' }); },
  footballSettlementStatus() { return this.request('/admin/football/settlement/status'); },
  manualFootballSettlement(payload) { return this.request('/admin/football/settlement/manual', { method: 'POST', body: payload }); },
  voidFootballMarket(payload) { return this.request('/admin/football/settlement/void', { method: 'POST', body: payload }); },
  reviewFootballMarket(payload) { return this.request('/admin/football/settlement/review', { method: 'POST', body: payload }); },
  adminRisk() { return this.request('/admin/risk'); },
  updateRiskSettings(payload) { return this.request('/admin/risk', { method: 'PATCH', body: payload }); },
  reviewWithdrawal(id, action = 'approve') {
    return this.request(`/admin/withdrawals/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, { method: 'POST' });
  },
  adminReconcile() { return this.request('/admin/audit/reconcile'); },
  settleMarket(marketId, winningOptionId, winningSide = 'YES') {
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/settle`, { method: 'POST', body: { winningOptionId, winningSide } });
  }
};
