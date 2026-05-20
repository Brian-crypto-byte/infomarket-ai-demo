const amount = document.getElementById('amount');
const returnValue = document.getElementById('returnValue');
const oddsGrid = document.querySelector('[data-odds-grid]');
const scoreGrid = document.querySelector('[data-score-grid]');
const positionMini = document.querySelector('[data-position-mini]');
const params = new URLSearchParams(location.search);
const marketId = params.get('market') || 'seoul-anyang';
let market = window.INFOMARKET_DATA.markets.find((item) => item.id === marketId) || window.INFOMARKET_DATA.markets[0];
let isFootball = market.type === 'football';
let isCrypto = market.type === 'crypto';
let selectedPrice = market.detail.bestPrice;
let selectedPick = market.detail.bestPick;
let selectedMode = isCrypto ? 'UP' : 'YES';
let selectedOptionId = null;
let scoreLocked = false;
let scoresExpanded = false;

function formatPrice(value) {
  return Number(value).toFixed(2);
}

function t(key) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.t(key) : key;
}

function entity(value) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.entity(value) : value;
}

function outcome(value) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.outcome(value) : value;
}

function marketTitleText(value = market) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.marketTitle(value) : value.title;
}

function localizedPick(pick) {
  return String(pick || '')
    .replace(/\bYES\b/g, t('market.yes'))
    .replace(/\bNO\b/g, t('market.no'))
    .replace(/\bUP\b/g, t('market.up'))
    .replace(/\bDOWN\b/g, t('market.down'))
    .replace(/\bHome\b/g, t('market.home'))
    .replace(/\bDraw\b/g, t('market.draw'))
    .replace(/\bAway\b/g, t('market.away'))
    .replace(/\bUp\b/g, t('market.up'))
    .replace(/\bDown\b/g, t('market.down'));
}

function tradeRuleText(kind) {
  if (kind === 'score' || scoreLocked) return t('order.ruleScore');
  if (kind === 'crypto' || isCrypto) return t('order.ruleCrypto');
  return t('order.ruleYesNo');
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function setHtml(id, value) {
  const node = document.getElementById(id);
  if (node) node.innerHTML = value;
}

function syncReturn() {
  returnValue.textContent = (Number(amount.value || 0) * selectedPrice).toFixed(2);
}

function activeResultOdd() {
  if (isCrypto) return null;
  return market.odds.find((odd) => odd.id === selectedOptionId)
    || market.odds.find((odd) => selectedPick.startsWith(odd.label))
    || market.odds[0];
}

function tradeChoices() {
  if (isCrypto) {
    const up = market.odds.find((odd) => String(odd.label).toUpperCase() === 'UP') || market.odds[0];
    const down = market.odds.find((odd) => String(odd.label).toUpperCase() === 'DOWN') || market.odds[1];
    return {
      primary: up && { pick: up.label || 'Up', price: up.price || up.upOdds || up.yes || selectedPrice, mode: 'UP', optionId: up.id },
      secondary: down && { pick: down.label || 'Down', price: down.price || down.downOdds || down.yes || selectedPrice, mode: 'DOWN', optionId: down.id }
    };
  }
  const odd = activeResultOdd();
  return {
    primary: odd && { pick: `${odd.label} YES`, price: odd.yes || odd.price || selectedPrice, mode: 'YES', optionId: odd.id },
    secondary: odd && { pick: `${odd.label} NO`, price: odd.no || selectedPrice, mode: 'NO', optionId: odd.id }
  };
}

function showToast(title, body) {
  let toast = document.querySelector('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.toast = 'true';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  toast.classList.add('open');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('open'), 2600);
}

function syncTradePanel() {
  const choiceRow = document.querySelector('.choice-row');
  const primary = document.getElementById('upBtn');
  const secondary = document.getElementById('downBtn');
  const tradeRule = document.getElementById('tradeRule');
  const choices = tradeChoices();
  primary.textContent = choices.primary ? `${outcome(choices.primary.mode)} @${formatPrice(choices.primary.price)}` : `${outcome(selectedMode)} @${formatPrice(selectedPrice)}`;
  secondary.textContent = choices.secondary ? `${outcome(choices.secondary.mode)} @${formatPrice(choices.secondary.price)}` : (isCrypto ? t('market.down') : t('market.no'));
  secondary.disabled = scoreLocked;
  primary.classList.toggle('selected', selectedMode === (choices.primary?.mode || selectedMode));
  secondary.classList.toggle('selected', !scoreLocked && selectedMode === choices.secondary?.mode);
  choiceRow.classList.toggle('single', scoreLocked);
  document.querySelector('.buy-sell span:first-child').textContent = isCrypto ? `${t('order.buy')} ${t('market.up')}` : `${t('order.buy')} ${t('market.yes')}`;
  document.querySelector('.buy-sell .muted').textContent = scoreLocked ? '' : (isCrypto ? `${t('order.buy')} ${t('market.down')}` : `${t('order.buy')} ${t('market.no')}`);
  if (tradeRule) {
    tradeRule.textContent = scoreLocked ? t('order.scoreInfo') : (isCrypto ? t('order.cryptoInfo') : t('order.yesNoInfo'));
  }
}

function syncMarketLayout() {
  const nonFootball = !isFootball;
  document.body.classList.toggle('football-market', isFootball);
  document.body.classList.toggle('non-football-market', nonFootball);

  document.querySelector('[data-scoreboard]')?.classList.toggle('hidden', nonFootball);
  document.querySelector('[data-section="score"]')?.classList.toggle('hidden', nonFootball);
  document.querySelector('[data-tab="score"]')?.classList.toggle('hidden', nonFootball);

  const tradeCard = document.querySelector('aside.trade');
  const main = document.querySelector('main');
  const tradeZone = document.querySelector('.market-trade-zone');
  const analytics = document.querySelector('.market-analytics');
  if (tradeCard && main && tradeZone && analytics) {
    if (nonFootball && tradeCard.parentElement !== main) {
      main.insertBefore(tradeCard, tradeZone);
    } else if (isFootball && tradeCard.parentElement === main) {
      document.querySelector('.page')?.appendChild(tradeCard);
    }
  }

  const resultTitle = document.querySelector('[data-section="result"] h2');
  const resultSub = document.querySelector('[data-section="result"] .sub');
  if (resultTitle) {
    resultTitle.textContent = isCrypto ? t('market.direction') : (isFootball ? t('market.matchResult') : t('market.outcome'));
  }
  if (resultSub) {
    resultSub.textContent = isCrypto ? t('market.upDownQuotes') : t('market.fixedQuotes');
  }
}

function formatMatchTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || t('market.pending');
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatEventDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return market.startsAt || t('market.pending');
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function marketStatusText() {
  if (market.status === 'Live') return t('market.live');
  if (market.status === 'active') return t('market.active');
  if (market.status === 'upcoming') return t('market.notStarted');
  return market.status || t('market.pending');
}

function matchExplainText() {
  const lang = window.InfoMarketI18n?.getLang?.() || 'en';
  const home = entity(market.home.name);
  const away = entity(market.away.name);
  const league = entity(market.league);
  const time = formatMatchTime(market.rawStartsAt || market.startsAt);
  const source = market.source ? ` / ${market.source}` : '';
  if (isCrypto) {
    if (lang === 'zh-CN') {
      return `<strong>${marketTitleText(market)}</strong> 是一个 ${league} 预测市场，截止时间为 <strong>${time}</strong>${source}。本页提供上涨 / 下跌方向交易，成交后以固定赔率结算到内部 USDT 余额。`;
    }
    return `<strong>${marketTitleText(market)}</strong> is a ${league} prediction market closing at <strong>${time}</strong>${source}. This page offers Up / Down fixed-odds trading, settled to the internal USDT balance.`;
  }
  if (!isFootball) {
    if (lang === 'zh-CN') {
      return `<strong>${marketTitleText(market)}</strong> 是一个 ${league} YES/NO 预测市场，截止时间为 <strong>${time}</strong>${source}。成交后以固定赔率结算到内部 USDT 余额。`;
    }
    return `<strong>${marketTitleText(market)}</strong> is a ${league} YES/NO prediction market closing at <strong>${time}</strong>${source}. Orders settle to the internal USDT balance at fixed odds.`;
  }
  if (lang === 'zh-CN') {
    return `<strong>${home} vs ${away}</strong> 是一场 ${league} 足球比赛，开赛时间为 <strong>${time}</strong>${source}。本页提供胜平负 YES/NO 预测，以及 0-0 到 4-4 的 25 个固定赔率比分选项。比赛结束后系统会拉取赛果并完成结算。`;
  }
  return `<strong>${home} vs ${away}</strong> is a ${league} football match scheduled for <strong>${time}</strong>${source}. This page offers match result YES/NO markets and fixed-odds correct score lines from 0-0 to 4-4. Settlement is handled after the final result is collected.`;
}

function choosePick({ pick, price, mode, locked, optionId }) {
  selectedPick = pick;
  selectedPrice = Number(price);
  selectedMode = mode;
  selectedOptionId = optionId || selectedOptionId;
  scoreLocked = Boolean(locked);
  setText('selectedLabel', localizedPick(pick));
  syncTradePanel();
  syncReturn();
}

function renderOdds() {
  oddsGrid.innerHTML = market.odds
    .filter((odd) => odd.price || odd.yes)
    .map((odd, index) => {
      if (odd.yes) {
        return `
          <button class="odd ${index === 0 ? 'selected' : ''}" data-pick="${odd.label} YES" data-price="${odd.yes}" data-mode="YES" data-option-id="${odd.id}">
            <span>${outcome(odd.label)}</span><strong><b class="yes">${t('market.yes')} @${formatPrice(odd.yes)}</b> <b class="no">${t('market.no')} @${formatPrice(odd.no)}</b></strong>
          </button>
        `;
      }
      return `
        <button class="odd ${index === 0 ? 'selected' : ''}" data-pick="${odd.label}" data-price="${odd.price}" data-mode="${odd.label.toUpperCase()}" data-option-id="${odd.id}">
          <span>${outcome(odd.label)}</span><strong>@${formatPrice(odd.price)}</strong>
        </button>
      `;
    }).join('');

  const compactScoreCount = window.matchMedia && window.matchMedia('(max-width: 760px)').matches && isFootball ? 3 : 4;
  const visibleScores = scoresExpanded ? market.scores : market.scores.slice(0, compactScoreCount);
  scoreGrid.innerHTML = market.scores.length
    ? visibleScores.map((score) => `
      <div class="score-market">
        <div class="score-name">${score.label}</div>
        <button class="score-choice yes-choice" data-pick="${score.label} YES" data-price="${score.yes}" data-mode="YES" data-locked="true" data-option-id="${score.id}">${t('market.yes')} <strong>@${formatPrice(score.yes)}</strong></button>
        <button class="score-choice no-choice" data-pick="${score.label} NO" data-price="${score.no}" data-mode="NO" data-locked="true" data-option-id="${score.id}">${t('market.no')} <strong>@${formatPrice(score.no)}</strong></button>
      </div>
    `).join('') + (market.scores.length > 4 ? `<button class="score-more" type="button" data-toggle-scores>${scoresExpanded ? t('market.showFewer') : t('market.moreScores')}</button>` : '')
    : '<div class="empty-inline">No score markets for this event.</div>';
}

function bindOdds() {
  document.querySelectorAll('[data-pick]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.odd, .score-choice').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      choosePick({
        pick: button.dataset.pick,
        price: button.dataset.price,
        mode: button.dataset.mode,
        locked: button.dataset.locked === 'true',
        optionId: button.dataset.optionId
      });
    });
  });
  const toggleScores = document.querySelector('[data-toggle-scores]');
  if (toggleScores) {
    toggleScores.addEventListener('click', () => {
      scoresExpanded = !scoresExpanded;
      renderOdds();
      bindOdds();
    });
  }
}

function bindTabs() {
  document.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === tab));
      document.querySelectorAll('[data-section]').forEach((section) => {
        const key = section.dataset.section;
        const visible = target === 'all' || target === key || (target === 'result' && key === 'activity');
        section.classList.toggle('hidden', !visible);
      });
      if (target === 'score' && !scoresExpanded) {
        scoresExpanded = true;
        renderOdds();
        bindOdds();
      }
    });
  });
}

function bindTradeChoices() {
  const primary = document.getElementById('upBtn');
  const secondary = document.getElementById('downBtn');
  primary?.addEventListener('click', () => {
    const choice = tradeChoices().primary;
    if (!choice) return;
    choosePick({ ...choice, locked: false });
  });
  secondary?.addEventListener('click', () => {
    const choice = tradeChoices().secondary;
    if (!choice || scoreLocked) return;
    choosePick({ ...choice, locked: false });
  });
}

function renderLastPosition(order) {
  if (!positionMini || !order) return;
  positionMini.classList.add('open');
  positionMini.innerHTML = `<strong>${t('order.latestPosition')}</strong>${localizedPick(order.pick)} @${formatPrice(order.price)} · ${order.amount.toFixed(2)} USDT<br>${order.rule}`;
}


function normalizeSide(mode) {
  const upper = String(mode || '').toUpperCase();
  if (upper === 'UP') return 'UP';
  if (upper === 'DOWN') return 'DOWN';
  if (upper === 'NO') return 'NO';
  return 'YES';
}

function resolveOptionId() {
  if (selectedOptionId) return selectedOptionId;
  if (!isCrypto) {
    const result = market.odds.find((odd) => selectedPick.startsWith(odd.label));
    if (result) return result.id;
  }
  const crypto = market.odds.find((odd) => odd.label === selectedPick || odd.label.toUpperCase() === selectedMode);
  return crypto?.id || market.odds[0]?.id;
}

function createOrderModal() {
  const modal = document.createElement('div');
  modal.className = 'order-modal-backdrop';
  modal.innerHTML = `
    <div class="order-modal" role="dialog" aria-modal="true" aria-label="${t('order.confirmTitle')}">
      <div class="order-modal-head"><span>${t('order.confirmTitle')}</span><button class="modal-close" type="button">x</button></div>
      <div class="order-modal-body">
        <div class="row"><span>${t('order.market')}</span><strong data-order-market></strong></div>
        <div class="row"><span>${t('order.pick')}</span><strong data-order-pick></strong></div>
        <div class="row"><span>${t('order.amount')}</span><strong data-order-amount></strong></div>
        <div class="row"><span>${t('order.potentialReturn')}</span><strong data-order-return></strong></div>
        <div class="row"><span>${t('order.tradeRule')}</span><strong data-order-rule></strong></div>
        <div class="row"><span>Alpha Insurance</span><strong data-order-insurance></strong></div>
        <div class="row"><span>INF Credits</span><strong data-order-credits></strong></div>
        <button class="submit" type="button" data-confirm-order>${t('order.confirmPlace')}</button>
        <div class="order-note" style="margin-top:12px;">${t('order.note')}</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('modal-close')) modal.classList.remove('open');
  });
  modal.querySelector('[data-confirm-order]').addEventListener('click', async () => {
    const order = {
      marketId: market.id,
      marketTitle: market.title,
      optionId: selectedOptionId || resolveOptionId(),
      pick: selectedPick,
      side: normalizeSide(selectedMode),
      price: selectedPrice,
      amount: Number(amount.value || 0),
      potentialReturn: Number(returnValue.textContent || 0),
      insurance: market.detail.insuranceCover,
      credits: market.detail.infCredits,
      status: t('order.open'),
      rule: tradeRuleText()
    };
    try {
      if (window.InfoMarketAPI) {
        const result = await window.InfoMarketAPI.createOrder({
          marketId: order.marketId,
          optionId: order.optionId,
          side: order.side,
          amountUsdt: order.amount,
          insuranceEnabled: !String(order.insurance || '').startsWith('0')
        });
        order.apiOrderId = result.order.id;
        order.apiPositionId = result.position.id;
        order.potentialReturn = result.order.potentialReturnUsdt;
        order.credits = result.credits;
      } else if (window.InfoMarketStore) {
        window.InfoMarketStore.addOrder(order);
      }
      modal.classList.remove('open');
      document.querySelector('.submit').textContent = t('order.placeAnother');
      renderLastPosition(order);
      showToast(t('order.placed'), `${localizedPick(order.pick)} · ${order.amount.toFixed(2)} USDT`);
    } catch (error) {
      showToast(t('order.failed'), error.message);
    }
  });
  return modal;
}

const orderModal = createOrderModal();

async function loadMarketFromApi() {
  try {
    if (window.InfoMarketAPI && window.InfoMarketNormalize) {
      const data = await window.InfoMarketAPI.market(marketId);
      market = window.InfoMarketNormalize.fromApi(data.market);
      isFootball = market.type === 'football';
      isCrypto = market.type === 'crypto';
      selectedPrice = market.detail.bestPrice;
      selectedPick = market.detail.bestPick;
      selectedMode = isCrypto ? 'UP' : 'YES';
      scoreLocked = false;
      scoresExpanded = false;
    }
  } catch (_) {}
}


document.querySelector('.submit').addEventListener('click', () => {
  if (window.InfoMarketAuth && !window.InfoMarketAuth.getUser()) {
    window.InfoMarketAuth.openAuth();
    return;
  }
  orderModal.querySelector('[data-order-market]').textContent = marketTitleText(market);
  orderModal.querySelector('[data-order-pick]').textContent = `${localizedPick(selectedPick)} @${formatPrice(selectedPrice)}`;
  orderModal.querySelector('[data-order-amount]').textContent = `${Number(amount.value || 0).toFixed(2)} USDT`;
  orderModal.querySelector('[data-order-return]').textContent = `${returnValue.textContent} USDT`;
  orderModal.querySelector('[data-order-rule]').textContent = tradeRuleText();
  orderModal.querySelector('[data-order-insurance]').textContent = market.detail.insuranceCover;
  orderModal.querySelector('[data-order-credits]').textContent = `+${market.detail.infCredits}`;
  orderModal.classList.add('open');
});

function initMarket() {
  syncMarketLayout();
  setHtml('eventLogo', window.InfoMarketBrand ? window.InfoMarketBrand.badge(market.logo || market.league || market.type, {
    type: 'event',
    title: isFootball ? market.league : marketTitleText(market),
    fallback: market.league || market.type,
    marketTitle: market.title,
    marketType: market.type,
    category: market.category || market.league
  }) : market.logo);
  setText('eventTitle', marketTitleText(market));
  setText('eventSub', `${entity(market.league)} / ${market.startsAt} / ${market.status === 'Live' ? t('market.live') : (market.status || t('market.pending'))}`);
  setHtml('matchExplain', matchExplainText());
  setHtml('homeLogo', window.InfoMarketBrand ? window.InfoMarketBrand.badge(market.home.logo || market.home.name, { type: 'team', title: market.home.name, fallback: market.home.name }) : (market.home.logo || market.home.short || 'H'));
  setHtml('awayLogo', window.InfoMarketBrand ? window.InfoMarketBrand.badge(market.away.logo || market.away.name, { type: 'team', title: market.away.name, fallback: market.away.name }) : (market.away.logo || market.away.short || 'A'));
  setText('homeName', entity(market.home.name));
  setText('awayName', entity(market.away.name));
  setText('homeRecord', market.home.record || '');
  setText('awayRecord', market.away.record || '');
  setHtml('scoreLine', market.score
    ? `<b>${market.score.home} : ${market.score.away}</b>`
    : `<em>${formatEventDay(market.rawStartsAt || market.startsAt)}</em><b>${marketStatusText()}</b>`);
  setText('volume', market.volume);
  setText('bestPrice', `${localizedPick(market.detail.bestPick)} @${formatPrice(market.detail.bestPrice)}`);
  setText('timeLeft', market.detail.timeLeft);
  setText('selectedLabel', localizedPick(market.detail.bestPick));
  setText('infCredits', `+${market.detail.infCredits}`);
  setText('insuranceCover', market.detail.insuranceCover);
  selectedOptionId = market.odds[0]?.id || market.scores[0]?.id || null;
  if (window.InfoMarketBrand) window.InfoMarketBrand.hydrateLogos(document);
  renderOdds();
  bindOdds();
  bindTabs();
  syncTradePanel();
  syncReturn();
  bindTradeChoices();
}

document.querySelectorAll('.quick button').forEach((button) => {
  button.addEventListener('click', () => {
    amount.value = button.dataset.amount;
    syncReturn();
  });
});

amount.addEventListener('input', syncReturn);
loadMarketFromApi().then(initMarket);


