const addresses = {
  Solana: '7Nf8mZkB2q84xV1T9q',
  TRC20: 'TQm8e4QJq7fx9pV8r6tYt9fDemo',
  ERC20: '0x91F5aD8e42a34Fdemo8E0E4114B9B2cD4'
};
let latestAccount = null;
let latestLedger = [];
let latestWithdrawals = [];

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

function normalizeAccount(account) {
  return {
    available: account.available ?? account.availableUsdt ?? 0,
    frozen: account.frozen ?? account.frozenUsdt ?? 0,
    trading: account.trading ?? account.tradingUsdt ?? 0,
    vault: account.vault ?? account.vaultUsdt ?? 0,
    claimable: account.claimable ?? account.claimableUsdt ?? 0,
    locked: account.locked ?? account.lockedInf ?? 0
  };
}

function normalizeLedger(entry) {
  return {
    type: entry.type,
    amount: entry.amount,
    asset: entry.asset || 'USDT',
    status: entry.status || 'Booked',
    note: entry.note || '-',
    createdAt: entry.createdAt || '-'
  };
}

async function loadData() {
  try {
    if (window.InfoMarketAPI) {
      const [balanceData, ledgerData, withdrawalData] = await Promise.all([
        window.InfoMarketAPI.balances(),
        window.InfoMarketAPI.ledger(),
        window.InfoMarketAPI.adminWithdrawals()
      ]);
      latestAccount = normalizeAccount(balanceData);
      latestLedger = (ledgerData.items || []).map(normalizeLedger);
      latestWithdrawals = withdrawalData.items || [];
    } else if (window.InfoMarketStore) {
      latestAccount = normalizeAccount(window.InfoMarketStore.getAccount());
      latestLedger = window.InfoMarketStore.listLedger().map(normalizeLedger);
    }
  } catch (_) {
    latestAccount = normalizeAccount(window.InfoMarketStore?.getAccount?.() || {});
    latestLedger = (window.InfoMarketStore?.listLedger?.() || []).map(normalizeLedger);
  }
  refresh();
}

function renderBalances() {
  const account = latestAccount || normalizeAccount({});
  ['available', 'frozen', 'vault', 'claimable'].forEach((key) => {
    document.querySelectorAll(`[data-balance="${key}"]`).forEach((node) => { node.textContent = money(account[key]); });
  });
  ['available', 'frozen', 'trading', 'vault', 'claimable'].forEach((key) => {
    const node = document.querySelector(`[data-bucket="${key}"]`);
    if (node) node.textContent = `${money(account[key])} USDT`;
  });
  const locked = document.querySelector('[data-bucket="locked"]');
  if (locked) locked.textContent = `${money(account.locked)} INF`;
}

function renderLedger() {
  const body = document.querySelector('[data-ledger-table] tbody');
  if (!body) return;
  if (!latestLedger.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="5">${t('state.noLedger')}</td></tr>`;
    return;
  }
  body.innerHTML = latestLedger.map((entry) => {
    const positive = Number(entry.amount || 0) >= 0;
    return `
      <tr>
        <td>${tr(entry.type)}</td>
        <td class="${positive ? 'green' : 'red'}">${positive ? '+' : ''}${money(entry.amount)} ${entry.asset || 'USDT'}</td>
        <td><span class="badge ${String(entry.status).toLowerCase().includes('confirmed') || String(entry.status).toLowerCase().includes('booked') ? 'green' : String(entry.status).toLowerCase().includes('pending') ? 'amber' : ''}">${tr(entry.status || 'Booked')}</span></td>
        <td>${entry.note === '-' ? '-' : tr(entry.note || '-')}</td>
        <td>${entry.createdAt || '-'}</td>
      </tr>
    `;
  }).join('');
}

function refresh() {
  renderBalances();
  renderLedger();
  renderWithdrawals();
}

function statusClass(status) {
  const text = String(status || '').toLowerCase();
  if (text.includes('completed') || text.includes('confirmed') || text.includes('booked')) return 'green';
  if (text.includes('pending') || text.includes('broadcast')) return 'amber';
  if (text.includes('reject') || text.includes('failed')) return 'red';
  return '';
}

function renderWithdrawals() {
  const body = document.querySelector('[data-withdrawal-status] tbody');
  if (!body) return;
  if (!latestWithdrawals.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="3">${t('state.noWithdrawals')}</td></tr>`;
    return;
  }
  body.innerHTML = latestWithdrawals.slice(0, 8).map((item) => `
    <tr>
      <td>${money(item.amountUsdt)} USDT</td>
      <td><span class="badge ${statusClass(item.status)}">${tr(item.status)}</span></td>
      <td>${item.completedAt || item.reviewedAt || item.createdAt || '-'}</td>
    </tr>
  `).join('');
}

document.querySelectorAll('[data-network]').forEach((button) => {
  button.addEventListener('click', async () => {
    document.querySelectorAll('[data-network]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelector('[data-deposit-address]').value = addresses[button.dataset.network];
    if (button.dataset.network === 'Solana' && window.InfoMarketAPI) {
      try {
        const data = await window.InfoMarketAPI.depositAddress();
        document.querySelector('[data-deposit-address]').value = data.address;
      } catch (_) {}
    }
  });
});

document.querySelector('[data-copy-address]')?.addEventListener('click', async () => {
  const input = document.querySelector('[data-deposit-address]');
  try {
    await navigator.clipboard.writeText(input.value);
  } catch (_) {
    input.select();
    document.execCommand('copy');
  }
  const ok = document.querySelector('[data-copy-ok]');
  ok.classList.add('open');
  setTimeout(() => ok.classList.remove('open'), 1500);
});

document.querySelector('[data-deposit-confirm]')?.addEventListener('click', async () => {
  const amount = Number(document.querySelector('[data-deposit-amount]').value || 0);
  if (!amount) return;
  if (window.InfoMarketAPI) await window.InfoMarketAPI.simulateDeposit(amount, 'solana');
  else window.InfoMarketStore?.addLedger({ type: 'Deposit', amount, asset: 'USDT', status: 'Confirmed', note: 'Simulated chain confirmation' });
  await loadData();
});

document.querySelector('[data-withdraw-submit]')?.addEventListener('click', async () => {
  const amount = Number(document.querySelector('[data-withdraw-amount]').value || 0);
  const address = document.querySelector('[data-withdraw-address]').value.trim();
  if (!amount || !address) return;
  if (window.InfoMarketAPI) await window.InfoMarketAPI.createWithdrawal(address, amount);
  else window.InfoMarketStore?.addLedger({ type: 'Withdraw request', amount: -amount, asset: 'USDT', status: 'Pending review', note: address });
  await loadData();
});

document.querySelector('[data-clear-demo]')?.addEventListener('click', () => {
  loadData();
});

loadData();
window.addEventListener('infomarket:languagechange', refresh);
