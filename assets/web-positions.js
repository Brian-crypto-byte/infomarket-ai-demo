const dynamicTable = document.querySelector('[data-dynamic-positions] tbody');
const tabs = document.querySelectorAll('[data-status]');
let orders = [];
let activeStatus = 'Open';

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function t(key, fallback = key) {
  const value = window.InfoMarketI18n?.t(key);
  return value && value !== key ? value : fallback;
}

function tr(text) {
  return window.InfoMarketI18n?.translateText(text) || text;
}

function normalizeApiPosition(position) {
  const rawStatus = String(position.status || 'open').toLowerCase();
  const settled = rawStatus === 'won' || rawStatus === 'lost' || rawStatus === 'settled';
  return {
    marketId: position.marketId,
    marketTitle: position.marketTitle,
    pick: `${window.InfoMarketI18n?.outcome(position.optionLabel) || position.optionLabel} ${window.InfoMarketI18n?.outcome(position.side) || position.side}`,
    amount: Number(position.amountUsdt || 0),
    potentialReturn: Number(position.potentialReturnUsdt || 0),
    payout: Number(position.payoutUsdt || 0),
    credits: Number(position.amountUsdt || 0) * 0.125,
    insurance: '-',
    status: settled ? 'Settled' : 'Open',
    rule: settled ? (rawStatus === 'won' ? 'Won' : 'Lost') : (position.sellable ? 'Open market' : 'no sell before settlement')
  };
}

function getInsuranceNumber(order) {
  const match = String(order.insurance || '').match(/[\d.]+/);
  const percent = match ? Number(match[0]) / 100 : 0;
  return Number(order.amount || 0) * percent;
}

function fillSummary() {
  const totalStaked = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const totalReturn = orders.reduce((sum, order) => sum + Number(order.potentialReturn || 0), 0);
  const totalInsured = orders.reduce((sum, order) => sum + getInsuranceNumber(order), 0);
  const totalCredits = orders.reduce((sum, order) => sum + Number(order.credits || 0), 0);
  const set = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  set('[data-total-staked]', `${money(totalStaked)} USDT`);
  set('[data-total-return]', `${money(totalReturn)} USDT`);
  set('[data-total-insured]', `${money(totalInsured)} USDT`);
  set('[data-total-credits]', `+${money(totalCredits)}`);
}

function renderRows(status = 'Open') {
  activeStatus = status;
  if (!dynamicTable) return;
  const filtered = status === 'Insured'
    ? orders.filter((order) => Number(order.amount || 0) > 0 && order.insurance && order.insurance !== '-')
    : orders.filter((order) => (order.status || 'Open') === status);

  if (!filtered.length) {
    dynamicTable.innerHTML = `<tr><td class="table-empty" colspan="8">${t('state.noPositions').replace('{status}', tr(status).toLowerCase())}</td></tr>`;
    return;
  }

  dynamicTable.innerHTML = filtered.map((order) => `
    <tr>
      <td>${window.InfoMarketI18n?.marketTitle({ title: order.marketTitle }) || order.marketTitle}</td>
      <td>${order.pick}</td>
      <td>${money(order.amount)} USDT</td>
      <td>${money(order.status === 'Settled' ? order.payout : order.potentialReturn)} USDT</td>
      <td class="green">+${money(order.credits)}</td>
      <td>${order.insurance || '-'}</td>
      <td><span class="badge ${String(order.rule || '').includes('no sell') ? 'amber' : 'green'}">${tr(String(order.rule || 'Open').replace('Fixed odds score market; ', ''))}</span></td>
      <td><button class="btn" onclick="location.href='match.html?market=${order.marketId}'">${t('common.open')}</button></td>
    </tr>
  `).join('');
}

async function loadPositions() {
  try {
    if (window.InfoMarketAPI) {
      const data = await window.InfoMarketAPI.positions();
      orders = data.items.map(normalizeApiPosition);
    } else {
      orders = window.InfoMarketStore ? window.InfoMarketStore.listOrders() : [];
    }
  } catch (_) {
    orders = window.InfoMarketStore ? window.InfoMarketStore.listOrders() : [];
  }
  fillSummary();
  renderRows(activeStatus);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.toggle('active', item === tab));
    renderRows(tab.dataset.status);
  });
});

loadPositions();
window.addEventListener('infomarket:languagechange', () => {
  fillSummary();
  renderRows(activeStatus);
});
