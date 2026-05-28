let dashboardOrders = [];
let dashboardBalance = null;
let dashboardInsurance = [];
let dashboardRewards = [];

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function t(key, fallback = key) {
  const value = window.InfoMarketI18n?.t(key);
  return value && value !== key ? value : fallback;
}

function tr(text) {
  return window.InfoMarketI18n?.translateText(text) || text;
}

function normalizePosition(position) {
  const statusMap = { open: 'status.open', settled: 'status.settled', won: 'status.won', lost: 'status.lost' };
  return {
    marketTitle: position.marketTitle,
    pick: `${window.InfoMarketI18n?.outcome(position.optionLabel) || position.optionLabel} ${window.InfoMarketI18n?.outcome(position.side) || position.side}`,
    amount: Number(position.amountUsdt || 0),
    potentialReturn: Number(position.potentialReturnUsdt || 0),
    status: statusMap[position.status] ? t(statusMap[position.status]) : position.status,
    rule: position.sellable ? 'Open market' : 'no sell before settlement'
  };
}

async function loadDashboardData() {
  try {
    if (window.InfoMarketAPI) {
      const [balance, positions, insurance, rewards] = await Promise.all([
        window.InfoMarketAPI.balances(),
        window.InfoMarketAPI.positions(),
        window.InfoMarketAPI.insuranceNodes(),
        window.InfoMarketAPI.rewards()
      ]);
      dashboardBalance = balance;
      dashboardOrders = (positions.items || []).map(normalizePosition);
      dashboardInsurance = insurance.items || [];
      dashboardRewards = rewards.items || [];
    } else {
      dashboardOrders = window.InfoMarketStore ? window.InfoMarketStore.listOrders() : [];
      dashboardBalance = window.InfoMarketStore ? window.InfoMarketStore.getAccount() : null;
      dashboardInsurance = window.InfoMarketStore ? window.InfoMarketStore.listInsuranceNodes() : [];
    }
  } catch (_) {
    dashboardOrders = window.InfoMarketStore ? window.InfoMarketStore.listOrders() : [];
    dashboardBalance = window.InfoMarketStore ? window.InfoMarketStore.getAccount() : null;
    dashboardInsurance = window.InfoMarketStore ? window.InfoMarketStore.listInsuranceNodes() : [];
  }
  renderAccount();
  renderPositions();
  renderUnlock();
}

function renderAccount() {
  const b = dashboardBalance || { available: 12480, frozen: 3250, vault: 24000, lockedInf: 8416.2 };
  setText('[data-account="available"]', money(b.available ?? b.availableUsdt ?? 0));
  setText('[data-account="frozen"]', money(b.frozen ?? b.frozenUsdt ?? 0));
  setText('[data-account="vault"]', money(b.vault ?? b.vaultUsdt ?? 0));
  setText('[data-account="credits"]', money(b.lockedInf ?? b.locked ?? 0));
  setText('[data-account="lobsterToken"]', money((b.lockedInf ?? b.locked ?? 8416.2) * 1.18));
  const vault = Number(b.vault ?? b.vaultUsdt ?? 0);
  const level = vault >= 100000 ? t('vault.kingLobsterShort', 'King Lobster')
    : vault >= 50000 ? t('vault.royalLobsterShort', 'Royal Lobster')
      : vault >= 20000 ? t('vault.bigLobsterShort', 'Big Lobster')
        : vault >= 5000 ? t('vault.midLobsterShort', 'Mid Lobster')
          : t('vault.smallLobsterShort', 'Small Lobster');
  setText('[data-account="lobsterLevel"]', level);
}

function renderPositions() {
  const body = document.querySelector('[data-dashboard-positions] tbody');
  if (!body) return;
  if (!dashboardOrders.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="5">${t('state.noActivePositions')}</td></tr>`;
    return;
  }
  body.innerHTML = dashboardOrders.slice(0, 5).map((order) => `
    <tr>
      <td>${window.InfoMarketI18n?.marketTitle({ title: order.marketTitle }) || order.marketTitle}</td>
      <td>${order.pick}</td>
      <td>${money(order.amount)} USDT</td>
      <td>${money(order.potentialReturn)} USDT</td>
      <td><span class="badge ${String(order.rule || '').includes('no sell') ? 'amber' : 'green'}">${tr(order.status || 'Open')}</span></td>
    </tr>
  `).join('');
}

function renderUnlock() {
  const volume = dashboardOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const credits = dashboardRewards.reduce((sum, row) => sum + Number(row.credits || 0), 0);
  const insured = dashboardInsurance.reduce((sum, node) => sum + Number(node.maxCoverUsdt || node.maxCover || 0), 0);
  setText('[data-volume-unlock]', `${money(volume)} / 250,000 USDT`);
  setText('[data-unlockable]', `${money(credits * 0.26)} INF`);
  setText('[data-cover-total]', `${money(insured)} USDT`);
}

loadDashboardData();
window.addEventListener('infomarket:languagechange', () => {
  renderPositions();
});
