let insuranceNodes = [];

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function t(key) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.t(key) : key;
}

function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'claimable' || s === 'active') return 'green';
  if (s === 'scheduled') return 'amber';
  return '';
}

function normalizeNode(node) {
  return {
    id: node.id,
    marketId: node.marketId,
    marketTitle: node.marketTitle,
    pick: node.pick || node.optionLabel || 'Covered order',
    premium: Number(node.premiumUsdt ?? node.premium ?? 0),
    maxCover: Number(node.maxCoverUsdt ?? node.maxCover ?? 0),
    periodAmount: Number(node.periodAmountUsdt ?? node.periodAmount ?? 0),
    status: node.status,
    phase: node.phase || '-',
    createdAt: node.createdAt
  };
}

async function loadInsurance() {
  try {
    if (window.InfoMarketAPI) {
      const data = await window.InfoMarketAPI.insuranceNodes();
      insuranceNodes = (data.items || []).map(normalizeNode);
    } else {
      window.InfoMarketStore?.seedInsuranceNodes?.();
      insuranceNodes = (window.InfoMarketStore?.listInsuranceNodes?.() || []).map(normalizeNode);
    }
  } catch (_) {
    window.InfoMarketStore?.seedInsuranceNodes?.();
    insuranceNodes = (window.InfoMarketStore?.listInsuranceNodes?.() || []).map(normalizeNode);
  }
  renderInsurance();
}

function renderInsurance() {
  const activeCover = insuranceNodes.filter((node) => ['active', 'claimable', 'scheduled', 'Active', 'Claimable', 'Scheduled'].includes(node.status)).reduce((sum, node) => sum + Number(node.maxCover || 0), 0);
  const claimable = insuranceNodes.filter((node) => String(node.status).toLowerCase() === 'claimable').reduce((sum, node) => sum + Number(node.periodAmount || 0), 0);
  const premium = insuranceNodes.reduce((sum, node) => sum + Number(node.premium || 0), 0);
  const pending = insuranceNodes.filter((node) => ['claimable', 'scheduled'].includes(String(node.status).toLowerCase())).reduce((sum, node) => sum + Number(node.periodAmount || 0), 0);

  document.querySelector('[data-insurance="activeCover"]').textContent = `${money(activeCover)} USDT`;
  document.querySelector('[data-insurance="claimable"]').textContent = `${money(claimable)} USDT`;
  document.querySelector('[data-pool="premium"]').textContent = `${money(premium)} USDT`;
  document.querySelector('[data-pool="pending"]').textContent = `${money(pending)} USDT`;

  const body = document.querySelector('[data-insurance-table] tbody');
  if (!insuranceNodes.length) {
    body.innerHTML = `<tr><td class="table-empty" colspan="7">${t('insurance.empty')}</td></tr>`;
    return;
  }

  body.innerHTML = insuranceNodes.map((node) => `
    <tr>
      <td>${node.id}</td>
      <td>${node.marketTitle}<br><span class="muted-note">${node.pick} ? ${node.phase}</span></td>
      <td>${money(node.premium)} USDT</td>
      <td>${money(node.maxCover)} USDT</td>
      <td class="green">${money(node.periodAmount)} USDT</td>
      <td><span class="badge ${statusBadge(node.status)}">${node.status}</span></td>
      <td>${String(node.status).toLowerCase() === 'claimable' ? `<button class="btn primary" data-claim="${node.id}">${t('insurance.claim')}</button>` : `<button class="btn" onclick="location.href='match.html?market=${node.marketId}'">${t('market.active')}</button>`}</td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-claim]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const claimed = window.InfoMarketAPI
          ? await window.InfoMarketAPI.claimInsuranceNode(button.dataset.claim)
          : window.InfoMarketStore?.claimInsurance?.(button.dataset.claim);
        if (claimed) document.querySelector('[data-claim-result]').textContent = `${button.dataset.claim} ${t('insurance.claim')} recorded.`;
        await loadInsurance();
      } catch (error) {
        document.querySelector('[data-claim-result]').textContent = error.message;
      }
    });
  });
}

document.querySelector('[data-seed-insurance]')?.addEventListener('click', async () => {
  window.InfoMarketStore?.seedInsuranceNodes?.();
  await loadInsurance();
});

loadInsurance();
