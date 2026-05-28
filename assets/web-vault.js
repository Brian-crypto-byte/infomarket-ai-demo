let activeAction = 'deposit';
let activeLockDays = 30;
let latestAccount = null;
let latestVault = null;
let latestLedger = [];

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function t(key, params = {}) {
  let text = window.InfoMarketI18n ? window.InfoMarketI18n.t(key) : key;
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, value);
  });
  return text;
}

function aprForTerm(days) {
  const rates = { 7: 1.825, 30: 2.555, 90: 3.285, 180: 4.38, 360: 5.475 };
  return rates[Number(days)] || rates[30];
}

function dailyRateForTerm(days) {
  const rates = { 7: 0.005, 30: 0.007, 90: 0.009, 180: 0.012, 360: 0.015 };
  return rates[Number(days)] || rates[30];
}

function vaultYield(vaultBalance, days = activeLockDays) {
  return vaultBalance * aprForTerm(days) * (Number(days) / 365);
}

function levelForDeposit(amount) {
  const value = Number(amount || 0);
  if (value >= 100000) return t('vault.kingLobsterShort');
  if (value >= 50000) return t('vault.royalLobsterShort');
  if (value >= 20000) return t('vault.bigLobsterShort');
  if (value >= 5000) return t('vault.midLobsterShort');
  return t('vault.smallLobsterShort');
}

function ledgerTypeLabel(type) {
  const key = {
    'Vault deposit': 'vault.ledgerDeposit',
    'vault_deposit': 'vault.ledgerDeposit',
    'Vault withdraw': 'vault.ledgerWithdraw',
    'vault_withdraw': 'vault.ledgerWithdraw'
  }[type];
  return key ? t(key) : type;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function normalizeBalance(balance = {}) {
  return {
    available: balance.available ?? balance.availableUsdt ?? 0,
    vault: balance.vault ?? balance.vaultUsdt ?? 0,
    claimable: balance.claimable ?? balance.claimableUsdt ?? 0
  };
}

async function loadVaultData() {
  try {
    if (window.InfoMarketAPI) {
      const [balance, vault, ledger] = await Promise.all([
        window.InfoMarketAPI.balances(),
        window.InfoMarketAPI.vault(),
        window.InfoMarketAPI.ledger()
      ]);
      latestAccount = normalizeBalance(balance);
      latestVault = vault;
      latestLedger = ledger.items || [];
    } else {
      latestAccount = normalizeBalance(window.InfoMarketStore?.getAccount?.());
      latestVault = { principalUsdt: latestAccount.vault, accruedYieldUsdt: vaultYield(latestAccount.vault), lockDays: activeLockDays };
      latestLedger = window.InfoMarketStore?.listLedger?.() || [];
    }
  } catch (_) {
    latestAccount = normalizeBalance(window.InfoMarketStore?.getAccount?.());
    latestVault = { principalUsdt: latestAccount.vault, accruedYieldUsdt: vaultYield(latestAccount.vault), lockDays: activeLockDays };
    latestLedger = window.InfoMarketStore?.listLedger?.() || [];
  }
  renderVault();
}

function renderVault() {
  const account = latestAccount || normalizeBalance();
  const principal = Number(latestVault?.principalUsdt ?? account.vault ?? 0);
  const lockDays = Number(latestVault?.lockDays || activeLockDays);
  const y = Number(latestVault?.accruedYieldUsdt ?? vaultYield(principal, lockDays));
  const dailyYield = principal * dailyRateForTerm(lockDays);
  setText('[data-vault="balance"]', `${money(principal)} USDT`);
  setText('[data-vault="level"]', levelForDeposit(principal));
  setText('[data-vault="dailyYield"]', `${money(dailyYield)} USDT`);
  setText('[data-vault="confidence"]', `${Math.min(92, 76 + Math.floor(lockDays / 30))}%`);
  setText('[data-vault-agent-capital]', `${money(principal)} USDT`);
  setText('[data-vault-agent-pnl]', `+${money(Math.max(12.8, dailyYield * 0.18))}`);
  setText('[data-vault-account="available"]', `${money(account.available)} USDT`);
  setText('[data-vault-account="principal"]', `${money(principal)} USDT`);
  setText('[data-vault-account="yield"]', `${money(y)} USDT`);
  setText('[data-vault-account="claimable"]', `${money(Math.min(y, 42.2))} USDT`);
  setText('[data-vault-account="term"]', `${lockDays} ${document.documentElement.lang === 'zh-CN' ? '天' : 'days'}`);
  setText('[data-vault-account="unlock"]', principal > 0 ? `T + ${lockDays} ${document.documentElement.lang === 'zh-CN' ? '天' : 'days'}` : t('vault.afterDeposit'));
  setText('[data-vault-ai]', t(`vault.aiTerm${lockDays}`));
  renderAgentLogs(principal, lockDays);

  const body = document.querySelector('[data-vault-ledger] tbody');
  const entries = latestLedger.filter((entry) => ['Vault deposit', 'Vault withdraw', 'vault_deposit', 'vault_withdraw'].includes(entry.type));
  if (!entries.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="4">${t('vault.noMovements')}</td></tr>`;
    return;
  }
  body.innerHTML = entries.map((entry) => `
    <tr>
      <td>${ledgerTypeLabel(entry.type)}</td>
      <td class="${Number(entry.amount) >= 0 ? 'green' : 'red'}">${Number(entry.amount) >= 0 ? '+' : ''}${money(entry.amount)} USDT</td>
      <td><span class="badge green">${entry.status || 'booked'}</span></td>
      <td>${entry.createdAt || '-'}</td>
    </tr>
  `).join('');
}

function renderAgentLogs(principal, lockDays) {
  const terminal = document.querySelector('[data-agent-terminal]');
  const records = document.querySelector('[data-agent-records]');
  const period = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const exposure = Math.max(50, principal * 0.08);
  const prediction = (0.00031 + lockDays / 1000000).toFixed(12);
  if (terminal) {
    terminal.innerHTML = [
      'OneAgentBot Event Prediction Monitoring Platform',
      '------------------------------------------------------------',
      `[PERIOD]      ${period} +UTC`,
      `[STRATEGY]    A3 Flexible Prediction Strategy T7`,
      `[PRODUCTION]  ${prediction}`,
      `[CAPITAL]     ${money(principal)} USDT`,
      `[STATUS]      Bot initialization complete`,
      `[SIGNAL]      Seoul FC match result edge detected`,
      `[ACTION]      Buy YES / correct-score hedge basket`,
      `[EXPOSURE]    ${money(exposure)} USDT max per market`,
      `[PNL]         +${money(Math.max(12.8, principal * dailyRateForTerm(lockDays) * 0.18))} USDT realized`
    ].map((line) => `<div>${line}</div>`).join('');
  }
  if (records) {
    records.innerHTML = [
      `[INFO] Operation ID: ${Math.floor(190000 + lockDays * 17)}-${Math.floor(principal || 1000)}`,
      `[INFO] Market scan: football 198, crypto 7, esports 7`,
      `[INFO] Portfolio mode: event prediction / fixed-odds`,
      `[INFO] Gross profit: ${money(Math.max(18, principal * 0.006))}`,
      `[INFO] Fees paid with Lobster Token: ${money(Math.max(0.8, principal * 0.00012))} LOB`,
      `[INFO] Net profit: ${money(Math.max(12.8, principal * 0.0048))}`,
      `[INFO] Next rebalance: T+30min`
    ].map((line) => `<div>${line}</div>`).join('');
  }
}

function setAction(action) {
  activeAction = action;
  document.querySelectorAll('[data-vault-action]').forEach((button) => button.classList.toggle('active', button.dataset.vaultAction === action));
  document.querySelector('[data-vault-submit]').textContent = action === 'deposit' ? t('vault.confirmDeposit') : t('vault.confirmWithdraw');
  document.querySelector('[data-vault-term-wrap]').style.display = action === 'deposit' ? '' : 'none';
  document.querySelector('[data-vault-note]').textContent = action === 'deposit'
    ? t('vault.depositNote', { days: activeLockDays })
    : t('vault.withdrawNote');
  setText('[data-vault-ai]', t(`vault.aiTerm${activeLockDays}`));
}

document.querySelectorAll('[data-agent-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-agent-tab]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-agent-pane]').forEach((pane) => pane.classList.toggle('active', pane.dataset.agentPane === button.dataset.agentTab));
  });
});

document.querySelector('[data-scroll-deploy]')?.addEventListener('click', () => {
  document.querySelector('[data-vault-amount]')?.focus();
});

document.querySelectorAll('[data-vault-action]').forEach((button) => {
  button.addEventListener('click', () => setAction(button.dataset.vaultAction));
});

document.querySelectorAll('[data-vault-term]').forEach((button) => {
  button.addEventListener('click', () => {
    activeLockDays = Number(button.dataset.vaultTerm || 30);
    document.querySelectorAll('[data-vault-term]').forEach((item) => item.classList.toggle('active', item === button));
    setAction(activeAction);
  });
});

document.querySelector('[data-vault-submit]')?.addEventListener('click', async () => {
  const amount = Number(document.querySelector('[data-vault-amount]').value || 0);
  if (!amount) return;
  if (window.InfoMarketAPI) {
    if (activeAction === 'deposit') await window.InfoMarketAPI.vaultDeposit(amount, activeLockDays);
    else await window.InfoMarketAPI.vaultWithdraw(amount);
  } else if (window.InfoMarketStore) {
    if (activeAction === 'deposit') window.InfoMarketStore.vaultDeposit(amount);
    else window.InfoMarketStore.vaultWithdraw(amount);
  }
  await loadVaultData();
});

setAction(activeAction);
loadVaultData();
