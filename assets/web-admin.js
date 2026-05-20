const adminDraftKey = 'infomarket.admin.drafts';
let markets = [];
let positions = [];
let balance = { available: 0, frozen: 0, trading: 0, vault: 0, claimable: 0, lockedInf: 0 };
let withdrawals = [];
let audit = null;
let risk = { settings: {}, markets: [] };
let selectedMarketId = null;
let footballCandidates = [];
let footballImportStatus = null;
let footballSettlementStatus = { status: {}, due: [], oracleResults: [], settlements: [] };

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function normalizeMarket(item) {
  return window.InfoMarketNormalize ? window.InfoMarketNormalize.fromApi(item) : item;
}

function allMarkets() {
  return markets;
}

function selectedMarket() {
  return allMarkets().find((market) => market.id === selectedMarketId) || allMarkets()[0];
}

function marketOptions(market) {
  const result = (market.odds || []).map((odd) => ({ id: odd.id, label: `${odd.label || 'Outcome'} YES`, side: 'YES' }));
  const scores = (market.scores || []).map((score) => ({ id: score.id, label: `${score.label} YES`, side: 'YES' }));
  return [...result, ...scores];
}

function exposureFor(marketId) {
  return positions
    .filter((position) => position.marketId === marketId && String(position.status || 'open').toLowerCase() === 'open')
    .reduce((sum, position) => sum + Number(position.amountUsdt || position.amount || 0), 0);
}

function addLog(title, body) {
  const log = document.querySelector('[data-admin-log]');
  if (!log) return;
  const item = document.createElement('div');
  item.className = 'admin-log-item';
  item.innerHTML = `<strong>${title}</strong>${body}<br>${new Date().toLocaleString()}`;
  log.prepend(item);
  while (log.children.length > 8) log.lastElementChild.remove();
}

function renderMetrics() {
  const volume = allMarkets().reduce((sum, market) => {
    const raw = String(market.volume || market.volumeUsdt || '0').replace(/[$, USDT]/g, '');
    const n = Number(raw.replace('M', ''));
    return sum + (String(raw).includes('M') ? n * 1000000 : Number(market.volumeUsdt || n || 0));
  }, 0);
  const exposure = positions
    .filter((position) => String(position.status || 'open').toLowerCase() === 'open')
    .reduce((sum, position) => sum + Number(position.amountUsdt || 0), 0);
  document.querySelector('[data-admin-metric="volume"]').textContent = `${money(volume)} USDT`;
  document.querySelector('[data-admin-metric="exposure"]').textContent = `${money(exposure)} USDT`;
  document.querySelector('[data-admin-metric="vault"]').textContent = `${money(balance.vault)} USDT`;
  document.querySelector('[data-admin-metric="pool"]').textContent = `${money(426000)} USDT`;
  document.querySelector('[data-admin-metric="withdrawals"]').textContent = withdrawals.filter((item) => item.status === 'pending_review').length;
}

function renderMarkets() {
  const body = document.querySelector('[data-admin-markets] tbody');
  if (!body) return;
  body.innerHTML = allMarkets().slice(0, 40).map((market) => {
    const exposure = exposureFor(market.id);
    return `
      <tr>
        <td>${market.title}</td>
        <td>${market.type || market.kind || 'market'}</td>
        <td>${market.volume || `${money(market.volumeUsdt)} USDT`}</td>
        <td class="${exposure > 5000 ? 'red' : ''}">${money(exposure)} USDT</td>
        <td><span class="badge ${statusBadge(market.status)}">${market.status || 'active'}</span></td>
        <td>${marketActions(market)}</td>
      </tr>
    `;
  }).join('') || '<tr><td class="table-empty" colspan="6">No markets loaded.</td></tr>';
  document.querySelectorAll('[data-manage-market]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedMarketId = button.dataset.manageMarket;
      renderOddsSelect();
      renderOddsEditor();
      renderSettlement();
      addLog('Market selected', selectedMarket()?.title || selectedMarketId);
    });
  });
  document.querySelectorAll('[data-market-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const [marketId, status] = button.dataset.marketStatus.split('|');
      button.disabled = true;
      try {
        const result = await window.InfoMarketAPI.updateMarketStatus(marketId, status);
        selectedMarketId = result.market.id;
        addLog('Market status updated', `${result.market.title}: ${result.market.status}`);
        await loadData();
      } catch (error) {
        addLog('Status update failed', error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderFootballImport() {
  const target = document.querySelector('[data-football-import-list]');
  const statusTarget = document.querySelector('[data-football-status]');
  if (statusTarget) {
    if (footballImportStatus?.lastRunAt || footballImportStatus?.lastPreviewAt) {
      const time = new Date(footballImportStatus.lastRunAt || footballImportStatus.lastPreviewAt).toLocaleString();
      const sourceCounts = footballImportStatus.sourceCounts || {};
      const sourceText = Object.entries(sourceCounts)
        .map(([name, count]) => `${name}: ${count}`)
        .join(' · ');
      statusTarget.textContent = `${time} · ${footballImportStatus.published || 0} published · ${footballImportStatus.publishable || 0} ready${sourceText ? ` · ${sourceText}` : ''}`;
    } else {
      statusTarget.textContent = 'Polymarket, Kalshi, and API-Football run automatically every 15 minutes.';
    }
  }
  if (!target) return;
  if (!footballCandidates.length) {
    target.innerHTML = '<div class="table-empty">Automatic collection is active for Polymarket, Kalshi, and API-Football. Use Preview to inspect candidates or Run now to publish fresh matches.</div>';
    return;
  }
  target.innerHTML = footballCandidates.map((item) => {
    const checked = item.publishable ? 'checked' : '';
    const disabled = item.publishable ? '' : 'disabled';
    const status = item.alreadyPublished ? 'Published' : (item.publishable ? 'Ready' : (item.skipReason || 'Skipped'));
    const badge = item.publishable ? 'green' : (item.alreadyPublished ? 'amber' : 'red');
    return `
      <label class="football-import-item">
        <input type="checkbox" data-football-import-id="${item.id || item.sourceId}" ${checked} ${disabled}>
        <span><strong>${item.title || '-'}</strong><span>${item.league || '-'} / ${new Date(item.startsAt || Date.now()).toLocaleString()} / ${item.source || '-'}</span></span>
        <small class="badge ${badge}">${status}</small>
      </label>
    `;
  }).join('');
}

async function collectFootballImport() {
  const button = document.querySelector('[data-football-preview]');
  if (button) button.disabled = true;
  try {
    const result = await window.InfoMarketAPI.footballImportPreview();
    footballCandidates = result.items || [];
    footballImportStatus = { ...(footballImportStatus || {}), ...(result.summary || {}), lastPreviewAt: new Date().toISOString() };
    renderFootballImport();
    addLog('Football collection completed', `${result.summary?.publishable || 0} ready, ${result.summary?.alreadyPublished || 0} already published, ${result.summary?.skipped || 0} skipped.`);
  } catch (error) {
    addLog('Football collection failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function runFootballImportNow() {
  const button = document.querySelector('[data-football-run]');
  if (button) button.disabled = true;
  try {
    const result = await window.InfoMarketAPI.runFootballImport();
    footballCandidates = result.items || [];
    footballImportStatus = result.status || footballImportStatus;
    renderFootballImport();
    addLog('Football auto collection ran', `${result.count || 0} new matches published from collected soccer games.`);
    await loadData();
  } catch (error) {
    addLog('Football auto collection failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function publishFootballImport() {
  const ids = Array.from(document.querySelectorAll('[data-football-import-id]:checked')).map((item) => item.dataset.footballImportId);
  if (!ids.length) return addLog('Football publish skipped', 'No publishable matches selected.');
  const button = document.querySelector('[data-football-publish]');
  if (button) button.disabled = true;
  try {
    const result = await window.InfoMarketAPI.publishFootballImport(ids);
    addLog('Football channel updated', `${result.count} matches published.`);
    await loadData();
    await collectFootballImport();
  } catch (error) {
    addLog('Football publish failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function runAutoSettlement() {
  try {
    const result = await window.InfoMarketAPI.runFootballSettlement();
    addLog('Football settlement checked', `${result.settled?.length || 0} settled, ${result.pending?.length || 0} pending results.`);
    await loadData();
  } catch (error) {
    addLog('Football settlement failed', error.message);
  }
}

async function manualFootballSettlement(marketId, button) {
  const homeInput = document.querySelector(`[data-manual-home="${marketId}"]`);
  const awayInput = document.querySelector(`[data-manual-away="${marketId}"]`);
  const noteInput = document.querySelector(`[data-manual-note="${marketId}"]`);
  const payload = {
    marketId,
    homeScore: Number(homeInput?.value),
    awayScore: Number(awayInput?.value),
    sourceNote: noteInput?.value?.trim() || 'operator-confirmed-result'
  };
  if (!Number.isInteger(payload.homeScore) || !Number.isInteger(payload.awayScore) || payload.homeScore < 0 || payload.awayScore < 0) {
    return addLog('Manual settlement failed', 'Enter a valid final score first.');
  }
  if (button) button.disabled = true;
  try {
    const result = await window.InfoMarketAPI.manualFootballSettlement(payload);
    addLog('Football manually settled', `${marketId}: ${payload.homeScore}-${payload.awayScore}, ${result.settled?.length || 0} positions settled.`);
    await loadData();
  } catch (error) {
    addLog('Manual settlement failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function markFootballReview(marketId, button) {
  const reason = document.querySelector(`[data-manual-note="${marketId}"]`)?.value?.trim() || 'Needs result review';
  if (button) button.disabled = true;
  try {
    await window.InfoMarketAPI.reviewFootballMarket({ marketId, reason });
    addLog('Football market flagged', `${marketId}: ${reason}`);
    await loadData();
  } catch (error) {
    addLog('Review flag failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function voidFootballMarket(marketId, button) {
  const reason = document.querySelector(`[data-manual-note="${marketId}"]`)?.value?.trim() || 'Match cancelled or invalid result';
  if (button) button.disabled = true;
  try {
    const result = await window.InfoMarketAPI.voidFootballMarket({ marketId, reason });
    addLog('Football market voided', `${marketId}: ${result.refunded?.length || 0} positions refunded.`);
    await loadData();
  } catch (error) {
    addLog('Void failed', error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

function statusBadge(status = '') {
  const text = String(status).toLowerCase();
  if (text === 'active' || text === 'live') return 'green';
  if (text === 'suspended' || text === 'settled') return 'red';
  return 'amber';
}

function isAdminMarket(market) {
  return String(market.id || '').startsWith('custom-') || market.oddsSource?.provider === 'Admin fixed pool';
}

function marketActions(market) {
  const manage = `<button class="btn" data-manage-market="${market.id}">Manage</button>`;
  if (!isAdminMarket(market)) return manage;
  const status = String(market.status || '').toLowerCase();
  if (status === 'active') return `${manage} <button class="btn" data-market-status="${market.id}|suspended">Pause</button>`;
  if (status === 'suspended') return `${manage} <button class="btn" data-market-status="${market.id}|active">Resume</button>`;
  if (status === 'settled') return manage;
  return `${manage} <button class="btn" data-market-status="${market.id}|active">Publish</button>`;
}

function renderOddsSelect() {
  const select = document.querySelector('[data-odds-market]');
  if (!select) return;
  const items = allMarkets();
  if (!selectedMarketId && items[0]) selectedMarketId = items[0].id;
  select.innerHTML = items.map((market) => `<option value="${market.id}">${market.title}</option>`).join('');
  select.value = selectedMarketId || '';
}

function renderOddsEditor() {
  const market = selectedMarket();
  const target = document.querySelector('[data-result-odds]');
  if (!target || !market) return;
  target.innerHTML = (market.odds || []).slice(0, 3).map((odd, index) => `
    <div class="field">
      <label>${odd.label || `Option ${index + 1}`}</label>
      <div class="input"><input data-result-price="${index}" data-option-id="${odd.id}" value="${Number(odd.yes || odd.price || 1).toFixed(2)}"></div>
    </div>
  `).join('') || '<div class="table-empty">No editable odds.</div>';
  renderScoreEditor();
}

function renderScoreEditor() {
  const market = selectedMarket();
  const target = document.querySelector('[data-score-admin]');
  if (!target) return;
  if (!market || market.type !== 'football' || !market.scores?.length) {
    target.innerHTML = '<div class="table-empty">No correct-score market for this event.</div>';
    return;
  }
  target.innerHTML = market.scores.map((score, index) => `
    <div class="score-admin">
      <strong>${score.label}</strong>
      <label class="mini">YES <input data-score-yes="${index}" data-option-id="${score.id}" value="${Number(score.yes).toFixed(2)}"></label>
      <label class="mini">NO <input data-score-no="${index}" data-option-id="${score.id}" value="${Number(score.no).toFixed(2)}"></label>
    </div>
  `).join('');
}

function collectResultOdds() {
  const market = selectedMarket();
  if (!market) return [];
  return Array.from(document.querySelectorAll('[data-result-price]')).map((input) => {
    const option = (market.odds || []).find((item) => item.id === input.dataset.optionId);
    if (market.type === 'crypto') {
      const isDown = String(option?.label || '').toLowerCase() === 'down';
      return { id: input.dataset.optionId, [isDown ? 'downOdds' : 'upOdds']: Number(input.value) };
    }
    return { id: input.dataset.optionId, yesOdds: Number(input.value) };
  });
}

function collectScoreOdds() {
  const updates = new Map();
  document.querySelectorAll('[data-score-yes], [data-score-no]').forEach((input) => {
    const id = input.dataset.optionId;
    if (!updates.has(id)) updates.set(id, { id });
    const update = updates.get(id);
    if (input.matches('[data-score-yes]')) update.yesOdds = Number(input.value);
    if (input.matches('[data-score-no]')) update.noOdds = Number(input.value);
  });
  return Array.from(updates.values());
}

async function publishOdds(includeScores = false) {
  const market = selectedMarket();
  if (!market) return addLog('Odds update failed', 'No market selected.');
  const updates = includeScores ? [...collectResultOdds(), ...collectScoreOdds()] : collectResultOdds();
  try {
    const result = await window.InfoMarketAPI.updateMarketOdds(market.id, updates);
    selectedMarketId = result.market.id;
    addLog(includeScores ? 'Result and score odds saved' : 'Result odds saved', `${result.changed.length} lines updated.`);
    await loadData();
  } catch (error) {
    addLog('Odds update failed', error.message);
  }
}

function renderSettlement() {
  const body = document.querySelector('[data-settlement-table] tbody');
  if (!body) return;
  const dueRows = (footballSettlementStatus.due || []).slice(0, 16);
  const rows = dueRows.length ? dueRows : allMarkets()
    .filter((market) => market.type === 'football' || market.type === 'binary' || market.type === 'crypto')
    .filter((market) => exposureFor(market.id) > 0 || market.id === selectedMarketId)
    .slice(0, 12)
    .map((market) => ({ id: market.id, title: market.title, source: market.oddsSource?.provider || 'Oracle', oracleStatus: market.status || 'pending', manual: true }));
  if (!rows.length) {
    body.innerHTML = '<tr><td class="table-empty" colspan="5">No football matches are due for oracle settlement.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((row) => {
    const isFootball = !row.manual || allMarkets().find((item) => item.id === row.id)?.type === 'football';
    if (isFootball) {
      const home = row.home || allMarkets().find((item) => item.id === row.id)?.participants?.find((item) => item.role === 'home')?.name || 'Home';
      const away = row.away || allMarkets().find((item) => item.id === row.id)?.participants?.find((item) => item.role === 'away')?.name || 'Away';
      return `
      <tr>
        <td>${row.title}<br><span class="sub">${row.league || '-'} · ${home} vs ${away} · ready ${row.readyAt ? new Date(row.readyAt).toLocaleString() : '-'}</span></td>
        <td>
          <div class="settlement-score">
            <input data-manual-home="${row.id}" inputmode="numeric" placeholder="${home}" aria-label="Home score">
            <span>-</span>
            <input data-manual-away="${row.id}" inputmode="numeric" placeholder="${away}" aria-label="Away score">
          </div>
          <input class="settlement-note" data-manual-note="${row.id}" placeholder="Source note / review reason">
        </td>
        <td>${row.source || 'api-sports'}</td>
        <td><span class="badge ${row.oracleStatus ? 'amber' : 'green'}">${row.oracleStatus || (row.due ? 'due' : 'waiting')}</span></td>
        <td class="settlement-actions">
          <button class="btn" data-run-oracle="${row.id}">Run oracle</button>
          <button class="btn primary" data-manual-football="${row.id}">Manual settle</button>
          <button class="btn" data-review-football="${row.id}">Review</button>
          <button class="btn danger" data-void-football="${row.id}">Void</button>
        </td>
      </tr>
    `;
    }
    const market = allMarkets().find((item) => item.id === row.id);
    const options = marketOptions(market || {});
    return `
      <tr>
        <td>${row.title}</td>
        <td><div class="input"><select data-settle-option="${row.id}">${options.map((option) => `<option value="${option.id}" data-side="${option.side}">${option.label}</option>`).join('')}</select></div></td>
        <td>${row.source}</td>
        <td><span class="badge amber">${row.oracleStatus}</span></td>
        <td><button class="btn" data-settle="${row.id}">Manual settle</button></td>
      </tr>
    `;
  }).join('');
  document.querySelectorAll('[data-run-oracle]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      await runAutoSettlement();
      button.disabled = false;
    });
  });
  document.querySelectorAll('[data-manual-football]').forEach((button) => {
    button.addEventListener('click', () => manualFootballSettlement(button.dataset.manualFootball, button));
  });
  document.querySelectorAll('[data-review-football]').forEach((button) => {
    button.addEventListener('click', () => markFootballReview(button.dataset.reviewFootball, button));
  });
  document.querySelectorAll('[data-void-football]').forEach((button) => {
    button.addEventListener('click', () => voidFootballMarket(button.dataset.voidFootball, button));
  });
  document.querySelectorAll('[data-settle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const marketId = button.dataset.settle;
      const select = document.querySelector(`[data-settle-option="${marketId}"]`);
      const option = select?.selectedOptions?.[0];
      if (!select?.value) return addLog('Settlement failed', 'No winning option selected.');
      button.disabled = true;
      try {
        const result = await window.InfoMarketAPI.settleMarket(marketId, select.value, option?.dataset.side || 'YES');
        addLog('Market settled', `${marketId}: ${result.settled.length} positions settled.`);
        await loadData();
      } catch (error) {
        addLog('Settlement failed', error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderOracleSummary() {
  const status = footballSettlementStatus.status || {};
  const target = document.querySelector('[data-settlement-table]')?.closest('.panel')?.querySelector('.panel-title-row h2');
  if (target) target.textContent = `Settlement queue · ${status.due || 0} due · ${status.settled || 0} settled`;
}

function renderWithdrawals() {
  const body = document.querySelector('[data-withdrawal-table] tbody');
  if (!body) return;
  if (!withdrawals.length) {
    body.innerHTML = '<tr><td class="table-empty" colspan="5">No withdrawal requests.</td></tr>';
    return;
  }
  body.innerHTML = withdrawals.map((item) => {
    const amount = Number(item.amountUsdt || 0);
    const risk = item.riskLevel || (amount > 10000 ? 'high' : amount > 2000 ? 'medium' : 'low');
    return `
      <tr>
        <td>${item.address || item.userId}</td>
        <td>${money(amount)} USDT</td>
        <td><span class="badge ${risk === 'high' ? 'red' : risk === 'medium' ? 'amber' : 'green'}">${risk}</span></td>
        <td>${item.status}</td>
        <td>${withdrawalAction(item)}</td>
      </tr>
    `;
  }).join('');
  document.querySelectorAll('[data-approve-withdraw]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await window.InfoMarketAPI.reviewWithdrawal(button.dataset.approveWithdraw, 'approve');
        addLog('Withdrawal approved', button.dataset.approveWithdraw);
        await loadData();
      } catch (error) {
        addLog('Withdrawal review failed', error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
  document.querySelectorAll('[data-reject-withdraw]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await window.InfoMarketAPI.reviewWithdrawal(button.dataset.rejectWithdraw, 'reject');
        addLog('Withdrawal rejected', button.dataset.rejectWithdraw);
        await loadData();
      } catch (error) {
        addLog('Withdrawal review failed', error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
  document.querySelectorAll('[data-complete-withdraw]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await window.InfoMarketAPI.reviewWithdrawal(button.dataset.completeWithdraw, 'complete');
        addLog('Withdrawal completed', button.dataset.completeWithdraw);
        await loadData();
      } catch (error) {
        addLog('Withdrawal completion failed', error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function withdrawalAction(item) {
  if (item.status === 'pending_review') {
    return `<button class="btn" data-approve-withdraw="${item.id}">Approve</button> <button class="btn" data-reject-withdraw="${item.id}">Reject</button>`;
  }
  if (item.status === 'broadcasting') return `<button class="btn" data-complete-withdraw="${item.id}">Mark completed</button>`;
  return '-';
}

function renderAudit() {
  const internal = audit?.internalUsdt ?? (Number(balance.available || 0) + Number(balance.frozen || 0) + Number(balance.trading || 0) + Number(balance.vault || 0) + Number(balance.claimable || 0));
  const custody = audit?.custodyUsdt ?? internal;
  document.querySelector('[data-audit="internal"]').textContent = `${money(internal)} USDT`;
  document.querySelector('[data-audit="custody"]').textContent = `${money(custody)} USDT`;
  document.querySelector('[data-audit="diff"]').textContent = `${custody - internal >= 0 ? '+' : ''}${money(custody - internal)} USDT`;
  document.querySelector('[data-audit="time"]').textContent = audit?.checkedAt ? new Date(audit.checkedAt).toLocaleTimeString() : new Date().toLocaleTimeString();
}

function renderRisk() {
  const settings = risk.settings || {};
  document.querySelectorAll('[data-risk-setting]').forEach((input) => {
    const key = input.dataset.riskSetting;
    if (settings[key] !== undefined && document.activeElement !== input) input.value = settings[key];
  });
  const body = document.querySelector('[data-risk-table] tbody');
  if (!body) return;
  const rows = (risk.markets || []).filter((item) => Number(item.marketPayoutUsdt || 0) > 0).slice(0, 20);
  if (!rows.length) {
    body.innerHTML = '<tr><td class="table-empty" colspan="4">No open market exposure.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((item) => {
    const limit = Number(settings.maxMarketExposureUsdt || 0);
    const ratio = limit ? Number(item.marketPayoutUsdt || 0) / limit : 0;
    const badge = ratio > 0.85 ? 'red' : ratio > 0.55 ? 'amber' : 'green';
    return `
      <tr>
        <td>${item.title}</td>
        <td>${money(item.marketStakeUsdt)} USDT</td>
        <td class="${badge === 'red' ? 'red' : ''}">${money(item.marketPayoutUsdt)} USDT</td>
        <td><span class="badge ${badge}">${Math.round(ratio * 100)}%</span></td>
      </tr>
    `;
  }).join('');
}

async function saveRiskSettings() {
  const payload = {};
  document.querySelectorAll('[data-risk-setting]').forEach((input) => {
    payload[input.dataset.riskSetting] = Number(input.value || 0);
  });
  try {
    const result = await window.InfoMarketAPI.updateRiskSettings(payload);
    risk.settings = result.settings;
    renderRisk();
    addLog('Risk limits saved', 'Pre-trade checks updated.');
  } catch (error) {
    addLog('Risk update failed', error.message);
  }
}

async function saveMarketDraft() {
  const title = document.querySelector('[data-new-title]').value.trim();
  const type = document.querySelector('[data-new-type]').value;
  const home = document.querySelector('[data-new-home]').value.trim();
  const away = document.querySelector('[data-new-away]').value.trim();
  const payload = {
    type,
    league: document.querySelector('[data-new-league]').value.trim() || 'Custom',
    title,
    home,
    away,
    homeOdds: Number(document.querySelector('[data-new-home-odds]').value),
    drawOdds: Number(document.querySelector('[data-new-draw-odds]').value),
    awayOdds: Number(document.querySelector('[data-new-away-odds]').value),
    upOdds: Number(document.querySelector('[data-new-home-odds]').value),
    downOdds: Number(document.querySelector('[data-new-away-odds]').value)
  };
  try {
    const result = await window.InfoMarketAPI.createMarket(payload);
    selectedMarketId = result.market.id;
    addLog('Market created', result.market.title);
    await loadData();
  } catch (error) {
    addLog('Market create failed', error.message);
  }
}

function renderAll() {
  renderMetrics();
  renderMarkets();
  renderOddsSelect();
  renderOddsEditor();
  renderSettlement();
  renderWithdrawals();
  renderAudit();
  renderRisk();
  renderFootballImport();
  renderOracleSummary();
}

async function loadData() {
  try {
    if (window.InfoMarketAPI) {
      const [marketData, positionData, balanceData, withdrawalData, auditData, riskData, settlementData] = await Promise.all([
        window.InfoMarketAPI.markets(),
        window.InfoMarketAPI.positions(),
        window.InfoMarketAPI.balances(),
        window.InfoMarketAPI.adminWithdrawals(),
        window.InfoMarketAPI.adminReconcile(),
        window.InfoMarketAPI.adminRisk(),
        window.InfoMarketAPI.footballSettlementStatus().catch(() => null)
      ]);
      const importData = await window.InfoMarketAPI.footballImportStatus().catch(() => null);
      markets = (marketData.items || []).map(normalizeMarket);
      positions = positionData.items || [];
      balance = balanceData || balance;
      withdrawals = withdrawalData.items || [];
      audit = auditData;
      risk = riskData || risk;
      footballSettlementStatus = settlementData || footballSettlementStatus;
      footballCandidates = importData?.candidates || footballCandidates;
      footballImportStatus = importData?.status || footballImportStatus;
    } else {
      markets = window.INFOMARKET_DATA?.markets || [];
    }
  } catch (error) {
    markets = window.INFOMARKET_DATA?.markets || [];
    addLog('API load failed', error.message);
  }
  if (!selectedMarketId && allMarkets()[0]) selectedMarketId = allMarkets()[0].id;
  renderAll();
}

function bindActions() {
  document.querySelector('[data-save-market]')?.addEventListener('click', saveMarketDraft);
  document.querySelector('[data-create-market]')?.addEventListener('click', () => document.querySelector('[data-new-title]')?.focus());
  document.querySelector('[data-publish-odds]')?.addEventListener('click', () => publishOdds(false));
  document.querySelector('[data-publish-scores]')?.addEventListener('click', () => publishOdds(true));
  document.querySelector('[data-settle-selected]')?.addEventListener('click', renderSettlement);
  document.querySelector('[data-refresh-withdrawals]')?.addEventListener('click', loadData);
  document.querySelector('[data-refresh-risk]')?.addEventListener('click', loadData);
  document.querySelector('[data-football-preview]')?.addEventListener('click', collectFootballImport);
  document.querySelector('[data-football-run]')?.addEventListener('click', runFootballImportNow);
  document.querySelector('[data-football-publish]')?.addEventListener('click', publishFootballImport);
  document.querySelector('[data-settle-selected]')?.addEventListener('click', runAutoSettlement);
  document.querySelector('[data-save-risk]')?.addEventListener('click', saveRiskSettings);
  document.querySelector('[data-export-markets]')?.addEventListener('click', () => addLog('Market export ready', `${allMarkets().length} markets loaded.`));
  document.querySelector('[data-odds-market]')?.addEventListener('change', (event) => {
    selectedMarketId = event.target.value;
    renderOddsEditor();
    renderSettlement();
  });
  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-tab]').forEach((item) => item.classList.toggle('active', item === button));
      addLog('Admin section opened', button.textContent.trim());
    });
  });
}

bindActions();
loadData().then(() => addLog('Admin console ready', 'Live API data loaded.'));
