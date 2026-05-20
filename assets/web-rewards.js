let rewardItems = [];
let positions = [];
let balance = null;
let insurance = [];

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

async function loadRewardsData() {
  try {
    if (window.InfoMarketAPI) {
      const [rewards, pos, bal, ins] = await Promise.all([
        window.InfoMarketAPI.rewards(),
        window.InfoMarketAPI.positions(),
        window.InfoMarketAPI.balances(),
        window.InfoMarketAPI.insuranceNodes()
      ]);
      rewardItems = rewards.items || [];
      positions = pos.items || [];
      balance = bal;
      insurance = ins.items || [];
    } else {
      const store = window.InfoMarketStore;
      rewardItems = (store?.listLedger?.() || []).filter((entry) => entry.asset === 'INF').map((entry) => ({ sourceType: entry.type, credits: entry.amount, createdAt: entry.createdAt }));
      positions = (store?.listOrders?.() || []).map((order) => ({ amountUsdt: order.amount, marketTitle: order.marketTitle, optionLabel: order.pick, side: '' }));
      balance = store?.getAccount?.() || {};
      insurance = store?.listInsuranceNodes?.() || [];
    }
  } catch (_) {
    rewardItems = [];
    positions = [];
    balance = { lockedInf: 0, vault: 0 };
    insurance = [];
  }
  renderSummary();
  renderUnlock();
  renderRewardTable();
  renderTasks();
}

function rewardRows() {
  const orderRows = rewardItems.map((row) => ({
    source: row.sourceType === 'order' ? `${t('reward.orderReward')} / ${row.sourceId || ''}` : tr(row.sourceType),
    credits: Number(row.credits || 0),
    multiplier: '1.20x',
    time: row.createdAt || '-'
  }));
  const vaultBalance = Number(balance?.vault ?? balance?.vaultUsdt ?? 0);
  const vaultCredits = vaultBalance * 0.0018;
  const insuranceCredits = insurance.reduce((sum, node) => sum + Number(node.premiumUsdt || node.premium || 0) * 0.42, 0);
  return [
    ...orderRows,
    { source: t('reward.vaultBoost'), credits: vaultCredits, multiplier: '1.35x', time: t('reward.daily') },
    { source: t('reward.insuranceBoost'), credits: insuranceCredits, multiplier: '1.10x', time: t('reward.daily') },
    { source: t('reward.referralRebate'), credits: 318.6, multiplier: '-', time: t('reward.campaign') }
  ].filter((row) => row.credits > 0);
}

function renderSummary() {
  const rows = rewardRows();
  const total = Number(balance?.lockedInf ?? balance?.locked ?? 0) + 318.6;
  const today = rows.slice(0, 4).reduce((sum, row) => sum + Number(row.credits || 0), 0);
  const unlocked = Math.min(total * unlockProgress(), total);
  document.querySelector('[data-reward="total"]').textContent = money(total);
  document.querySelector('[data-reward="unlocked"]').textContent = money(unlocked);
  document.querySelector('[data-reward="today"]').textContent = `+${money(today)}`;
  document.querySelector('[data-board-you]').textContent = money(total);
}

function unlockProgress() {
  const volume = positions.reduce((sum, pos) => sum + Number(pos.amountUsdt || pos.amount || 0), 0);
  const volumeScore = Math.min(volume / 250000, 1) * 0.35;
  const activeScore = 18 / 30 * 0.25;
  const vaultScore = Math.min(Number(balance?.vault ?? 0) / 24000, 1) * 0.25;
  const referralScore = 7 / 10 * 0.15;
  return volumeScore + activeScore + vaultScore + referralScore;
}

function renderUnlock() {
  const volume = positions.reduce((sum, pos) => sum + Number(pos.amountUsdt || pos.amount || 0), 0);
  const vault = Number(balance?.vault ?? balance?.vaultUsdt ?? 0);
  document.querySelector('[data-unlock="volumeText"]').textContent = `${money(volume)} / 250,000 USDT`;
  document.querySelector('[data-unlock="vaultText"]').textContent = `${money(vault)} USDT · ${t('rewards.vaultDays')}`;
  document.querySelector('[data-progress="volume"]').style.setProperty('--value', `${Math.min(volume / 250000 * 100, 100)}%`);
  document.querySelector('[data-progress="vault"]').style.setProperty('--value', `${Math.min(vault / 24000 * 100, 100)}%`);
}

function renderRewardTable() {
  const body = document.querySelector('[data-reward-table] tbody');
  const rows = rewardRows();
  if (!rows.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="4">${t('state.noRewards')}</td></tr>`;
    return;
  }
  body.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.source}</td>
      <td class="green">+${money(row.credits)}</td>
      <td>${row.multiplier}</td>
      <td>${row.time}</td>
    </tr>
  `).join('');
}

function renderTasks() {
  const volume = positions.reduce((sum, pos) => sum + Number(pos.amountUsdt || pos.amount || 0), 0);
  const vault = Number(balance?.vault ?? balance?.vaultUsdt ?? 0);
  const tasks = [
    { title: t('task.firstOrder'), desc: '+50 INF Credits', done: positions.length > 0 },
    { title: t('task.tradeVolume'), desc: `${money(volume)} / 10,000 USDT`, done: volume >= 10000 },
    { title: t('task.depositVault'), desc: `${money(vault)} USDT ${t('task.inVault')}`, done: vault > 0 },
    { title: t('task.useInsurance'), desc: `${insurance.length} ${t('task.insuranceNodes')}`, done: insurance.length > 0 }
  ];
  document.querySelector('[data-task-list]').innerHTML = tasks.map((task) => `
    <div class="task-item">
      <div><strong>${task.title}</strong><span>${task.desc}</span></div>
      <span class="badge ${task.done ? 'green' : 'amber'}">${task.done ? t('common.done') : t('common.open')}</span>
    </div>
  `).join('');
}

document.querySelector('[data-copy-referral]')?.addEventListener('click', async () => {
  const input = document.querySelector('[data-referral]');
  try { await navigator.clipboard.writeText(input.value); } catch (_) { input.select(); document.execCommand('copy'); }
  const ok = document.querySelector('[data-copy-ok]');
  ok.classList.add('open');
  setTimeout(() => ok.classList.remove('open'), 1500);
});

document.querySelector('[data-claim-inf]')?.addEventListener('click', () => {
  document.querySelector('[data-claim-inf]').textContent = t('rewards.claimQueued');
});

loadRewardsData();
window.addEventListener('infomarket:languagechange', () => {
  renderSummary();
  renderUnlock();
  renderRewardTable();
  renderTasks();
});
