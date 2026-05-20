window.InfoMarketAPI = {
  base: '/api/v1',
  async request(path, options = {}) {
    const response = await fetch(`${this.base}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(data?.error?.message || `API ${response.status}`);
    return data;
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
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/odds`, {
      method: 'PATCH',
      body: { options }
    });
  },
  updateMarketStatus(marketId, status) {
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/status`, {
      method: 'PATCH',
      body: { status }
    });
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
  manualFootballSettlement(payload) {
    return this.request('/admin/football/settlement/manual', { method: 'POST', body: payload });
  },
  voidFootballMarket(payload) {
    return this.request('/admin/football/settlement/void', { method: 'POST', body: payload });
  },
  reviewFootballMarket(payload) {
    return this.request('/admin/football/settlement/review', { method: 'POST', body: payload });
  },
  adminRisk() { return this.request('/admin/risk'); },
  updateRiskSettings(payload) { return this.request('/admin/risk', { method: 'PATCH', body: payload }); },
  reviewWithdrawal(id, action = 'approve') {
    return this.request(`/admin/withdrawals/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, { method: 'POST' });
  },
  adminReconcile() { return this.request('/admin/audit/reconcile'); },
  settleMarket(marketId, winningOptionId, winningSide = 'YES') {
    return this.request(`/admin/markets/${encodeURIComponent(marketId)}/settle`, {
      method: 'POST',
      body: { winningOptionId, winningSide }
    });
  }
};
