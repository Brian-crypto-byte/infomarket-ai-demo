const marketList = document.querySelector('[data-market-list]');
const searchInput = document.querySelector('[data-search]');
const navLinks = Array.from(document.querySelectorAll('[data-category]'));

let activeCategory = new URLSearchParams(location.search).get('category') || 'soccer';

const marketAccents = [
  ['#cf7049', '#55a873', '#bc9658'],
  ['#bd6f75', '#7fa88b', '#d39a64'],
  ['#c88a4a', '#71a06f', '#b77478'],
  ['#9f7564', '#55a873', '#cf7049'],
  ['#b96d55', '#9b8f62', '#bd6f75'],
  ['#a86147', '#74a57f', '#bc9658']
];

function canonicalTeamName(value) {
  const text = String(value || '').trim();
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/\s+FC$/i, '')
    .replace(/\s+F\.?C\.?$/i, '')
    .replace(/^AFC\s+/i, '')
    .trim();
  const aliases = {
    '\u4e9a\u8db3\u8054\u963f\u8d3e\u514b\u65af': 'Ajax',
    '\u963f\u8d3e\u514b\u65af': 'Ajax',
    '\u9635\u683c\u7f57\u5b81\u6839\u8db3\u7403\u4ff1\u4e50\u90e8': 'Groningen',
    '\u683c\u7f57\u5b81\u6839\u8db3\u7403\u4ff1\u4e50\u90e8': 'Groningen',
    '\u4e4c\u5f97\u52d2\u652f\u8db3\u7403\u4ff1\u4e50\u90e8': 'Utrecht',
    '\u4e4c\u5f97\u52d2\u652f': 'Utrecht',
    'SC Heerenveen\u7684\u6bd4\u8d5b': 'Heerenveen',
    '\u6258\u7279\u7eb3\u59c6\u70ed\u523a\u8db3\u7403\u4ff1\u4e50\u90e8': 'Tottenham',
    '\u6258\u7279\u7eb3\u59c6\u70ed\u523a': 'Tottenham',
    '\u57c3\u5f17\u987f\u8db3\u7403\u4ff1\u4e50\u90e8\u7684\u6bd4\u8d5b': 'Everton',
    '\u57c3\u5f17\u987f\u8db3\u7403\u4ff1\u4e50\u90e8': 'Everton',
    '\u66fc\u57ce\u8db3\u7403\u4ff1\u4e50\u90e8': 'Manchester City',
    '\u66fc\u57ce': 'Manchester City',
    '\u963f\u65af\u987f\u7ef4\u62c9\u8db3\u7403\u4ff1\u4e50\u90e8': 'Aston Villa',
    '\u5e03\u83b1\u987f\u548c\u970d\u592b\u963f\u5c14\u6bd4\u6069\u8db3\u7403\u4ff1\u4e50\u90e8': 'Brighton',
    '\u66fc\u8054\u8db3\u7403\u4ff1\u4e50\u90e8': 'Manchester United',
    '\u66fc\u8054': 'Manchester United',
    '\u5bcc\u52d2\u59c6\u8db3\u7403\u4ff1\u4e50\u90e8': 'Fulham',
    '\u7ebd\u5361\u65af\u5c14\u8054\u8db3\u7403\u4ff1\u4e50\u90e8': 'Newcastle United',
    '\u7ebd\u5361\u65af\u5c14\u8054\u961f': 'Newcastle United',
    Newcastle: 'Newcastle United',
    'Man City': 'Manchester City',
    'Man Utd': 'Manchester United',
    'Man United': 'Manchester United',
    Spurs: 'Tottenham',
    Forest: 'Nottingham Forest',
    WH: 'West Ham United',
    WHU: 'West Ham United',
    '\u9a6c\u683c\u91cc\u5e03AS de F\u00e8s': 'Maghreb AS de F\u00e8s',
    '\u7f8e\u56fdYacoub El Mansour': 'US Yacoub El Mansour',
    UnionTouargaSports: 'Union Touarga',
    'Ind. Medellin': 'Independiente Medellin'
  };
  return aliases[text] || aliases[normalized] || normalized
    .replace(/\u7684\u6bd4\u8d5b$/u, '')
    .replace(/\u8db3\u7403\u4ff1\u4e50\u90e8$/u, '')
    .trim();
}

function formatPrice(value) {
  const number = Number(value || 0);
  return number.toFixed(2);
}

function formatDate(value) {
  if (!value || value === 'Pending') return t('market.pending');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function t(key) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.t(key) : key;
}

function entity(value) {
  const name = canonicalTeamName(value);
  return window.InfoMarketI18n ? window.InfoMarketI18n.entity(name) : name;
}

function outcome(value) {
  return window.InfoMarketI18n ? window.InfoMarketI18n.outcome(value) : value;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function logoLookup(value, fallback) {
  const text = String(value || '');
  return /^https?:\/\//i.test(text) ? text : fallback;
}

function marketTitle(market) {
  if (market?.type === 'football' && market.home && market.away) return `${entity(market.home.name)} VS ${entity(market.away.name)}`;
  return window.InfoMarketI18n ? window.InfoMarketI18n.marketTitle(market) : market.title;
}

function marketMatchesSearch(market) {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return true;
  const haystack = [market.title, marketTitle(market), market.league, entity(market.league), market.home?.name, entity(market.home?.name), market.away?.name, entity(market.away?.name), market.category].join(' ');
  return haystack.toLowerCase().includes(query);
}

function marketMatchesCategory(market) {
  if (activeCategory === 'trending') return market.type === 'football' || market.sport === 'soccer';
  if (activeCategory === 'sports') return market.category === 'sports' && market.type !== 'football' && market.sport !== 'soccer';
  if (activeCategory === 'soccer') return market.sport === 'soccer' || market.type === 'football';
  if (activeCategory === 'crypto') return market.category === 'crypto' || market.type === 'crypto';
  return market.category === activeCategory;
}

function marketStartTime(market) {
  return Date.parse(market.rawStartsAt || market.startsAt || '') || Number.MAX_SAFE_INTEGER;
}

function isClosedMarketStatus(status) {
  return ['closed', 'settled', 'expired', 'void', 'cancelled', 'canceled', 'finished', 'ended'].includes(String(status || '').toLowerCase());
}

function marketOpenForListing(market) {
  if (isClosedMarketStatus(market.status)) return false;
  if (!(market.type === 'football' || market.sport === 'soccer')) return true;
  if (String(market.status || '').toLowerCase() === 'live') return true;
  const startTime = marketStartTime(market);
  return startTime === Number.MAX_SAFE_INTEGER || startTime >= Date.now();
}

function hasRenderableFootballLogos(market) {
  if (market.type !== 'football') return true;
  const hasLogo = (team) => {
    const direct = /^https?:\/\//i.test(String(team?.logo || ''));
    const local = window.InfoMarketBrand?.hasTeamLogo?.(team?.name) || window.InfoMarketBrand?.hasTeamLogo?.(team?.logo);
    return direct || local;
  };
  return hasLogo(market.home) && hasLogo(market.away);
}

function renderTeam(team) {
  const logo = window.InfoMarketBrand
    ? window.InfoMarketBrand.badge(team.name || team.logo, { type: 'team' })
    : team.logo;

  return `
    <div class="team-row">
      <span class="team-badge ${team.color || ''}">${logo}</span>
      <span class="team-name">${esc(entity(team.name))}</span>
      <span class="team-record">${team.record || ''}</span>
    </div>
  `;
}

function renderScorePreview(market) {
  if (!market.scores?.length) return '';

  return `
    <div class="score-preview">
      ${market.scores.slice(0, 3).map((score) => `
        <button class="score-chip" type="button" onclick="event.stopPropagation();location.href='match.html?market=${esc(market.id)}'">
          <b>${esc(score.label)}</b>
          <span class="yes">${t('market.yes')} ${formatPrice(score.yes)}</span>
          <i>|</i>
          <span class="no">${t('market.no')} ${formatPrice(score.no)}</span>
        </button>
      `).join('')}
      <button class="more-score" type="button" onclick="event.stopPropagation();location.href='match.html?market=${esc(market.id)}'">${t('market.moreScores')}</button>
    </div>
  `;
}

function renderResultOdds(market) {
  return (market.odds || []).slice(0, 3).map((odd) => `
    <button class="result-btn" type="button" onclick="event.stopPropagation();location.href='match.html?market=${esc(market.id)}'">
      <span>${esc(outcome(odd.label))}</span>
      <strong>@${formatPrice(odd.yes || odd.price)}</strong>
    </button>
  `).join('');
}

function renderFootballMarket(market, index) {
  const accents = marketAccents[index % marketAccents.length];
  const style = `--accent-a:${accents[0]};--accent-b:${accents[1]};--accent-c:${accents[2]};animation-delay:${index * -0.9}s`;
  const leagueLogoValue = logoLookup(market.logo, market.league) || market.league;
  const homeName = canonicalTeamName(market.home.name);
  const awayName = canonicalTeamName(market.away.name);
  const homeLogoValue = logoLookup(market.home.logo, homeName) || homeName;
  const awayLogoValue = logoLookup(market.away.logo, awayName) || awayName;
  const leagueLogo = window.InfoMarketBrand
    ? window.InfoMarketBrand.badge(leagueLogoValue, { type: 'league', title: market.league, fallback: market.league })
    : (market.logo || market.league.slice(0, 2));
  const homeLogo = window.InfoMarketBrand
    ? window.InfoMarketBrand.badge(homeLogoValue, { type: 'event', title: homeName, fallback: homeName })
    : market.home.logo;
  const awayLogo = window.InfoMarketBrand
    ? window.InfoMarketBrand.badge(awayLogoValue, { type: 'event', title: awayName, fallback: awayName })
    : market.away.logo;

  return `
    <article class="match-card category-${esc(market.category || 'trending')} sport-${esc(market.sport || 'none')} type-${esc(market.type || 'market')}" data-no-auto-i18n style="${style}" onclick="location.href='match.html?market=${esc(market.id)}'">
      <div class="match-title-row">
        <span class="league-badge">${leagueLogo}</span>
        <strong>${esc(marketTitle(market))}</strong>
        <span class="card-arrow">&rsaquo;</span>
      </div>
      <div class="match-inner">
        <div class="versus-row">
          <div class="versus-team">
            ${homeLogo}
            <strong>${esc(entity(homeName))}</strong>
          </div>
          <div class="versus-center">
            ${String(market.status).toLowerCase() === 'live' ? `<span class="live-text">${t('market.live')}</span>` : `<span class="live-text soft">${t('market.active')}</span>`}
            <span>${formatDate(market.startsAt)}</span>
            <b>${market.score ? t('market.live') : t('market.notStarted')}</b>
          </div>
          <div class="versus-team away">
            ${awayLogo}
            <strong>${esc(entity(awayName))}</strong>
          </div>
        </div>
        <div class="result-actions">${renderResultOdds(market)}</div>
        ${renderScorePreview(market)}
      </div>
    </article>
  `;
}

function renderBinaryMarket(market, index) {
  const accents = marketAccents[index % marketAccents.length];
  const yes = market.odds?.[0];
  const no = market.type === 'crypto' ? market.odds?.[1] : yes;
  if (!yes || (!yes.no && !no?.price)) return '';
  const style = `--accent-a:${accents[0]};--accent-b:${accents[1]};--accent-c:${accents[2]};animation-delay:${index * -0.9}s`;
  const leagueLogo = window.InfoMarketBrand
    ? window.InfoMarketBrand.badge(market.league || market.category, { type: 'league' })
    : (market.logo || market.league.slice(0, 2).toUpperCase());

  return `
    <article class="match-card binary-card category-${esc(market.category || 'trending')} sport-${esc(market.sport || 'none')} type-${esc(market.type || 'market')}" data-no-auto-i18n style="${style}" onclick="location.href='match.html?market=${esc(market.id)}'">
      <div class="match-meta">
        <span class="league-badge">${leagueLogo}</span>
        <strong>${esc(entity(market.league))}</strong>
        <span>${t('market.closes')} ${formatDate(market.startsAt)}</span>
      </div>
      <h3 class="binary-title">${esc(marketTitle(market))}</h3>
      <div class="binary-actions">
        <button class="result-btn" type="button" onclick="event.stopPropagation();location.href='match.html?market=${esc(market.id)}'">
          <span>${market.type === 'crypto' ? t('market.up') : t('market.yes')}</span>
          <strong>${formatPrice(yes.yes || yes.price)}</strong>
        </button>
        <button class="result-btn no-action" type="button" onclick="event.stopPropagation();location.href='match.html?market=${esc(market.id)}'">
          <span>${market.type === 'crypto' ? t('market.down') : t('market.no')}</span>
          <strong>${formatPrice(market.type === 'crypto' ? no.price : yes.no)}</strong>
        </button>
      </div>
    </article>
  `;
}

function renderMarket(market, index) {
  return market.type === 'football' ? renderFootballMarket(market, index) : renderBinaryMarket(market, index);
}

function renderMarkets(marketsSource = window.INFOMARKET_DATA.markets) {
  const markets = marketsSource
    .filter(marketMatchesCategory)
    .filter(marketOpenForListing)
    .filter(marketMatchesSearch)
    .sort((a, b) => marketStartTime(a) - marketStartTime(b));
  marketList.innerHTML = markets.map(renderMarket).join('') || `<p class="empty-state">${t('market.empty')}</p>`;
  if (window.InfoMarketBrand) window.InfoMarketBrand.hydrateLogos(marketList);
}

async function loadMarkets() {
  try {
    if (window.InfoMarketAPI && window.InfoMarketNormalize) {
      const data = await window.InfoMarketAPI.markets();
      window.homeMarkets = (data.items || []).map((item) => window.InfoMarketNormalize.fromApi(item));
    } else {
      window.homeMarkets = window.INFOMARKET_DATA.markets;
    }
  } catch (_) {
    window.homeMarkets = window.INFOMARKET_DATA.markets;
  }
  renderMarkets(window.homeMarkets);
}

function selectCategory(link) {
  activeCategory = link.dataset.category || 'trending';
  history.replaceState(null, '', `${location.pathname}?category=${encodeURIComponent(activeCategory)}`);
  document.body.dataset.activeCategory = activeCategory;
  navLinks.forEach((item) => item.classList.toggle('active', item === link));
  renderMarkets(window.homeMarkets || window.INFOMARKET_DATA.markets);
}
window.infomarketSelectCategory = (link, event) => {
  event?.preventDefault?.();
  selectCategory(link);
  return false;
};

navLinks.forEach((item) => item.classList.toggle('active', item.dataset.category === activeCategory));
document.body.dataset.activeCategory = activeCategory;
searchInput.addEventListener('input', () => renderMarkets(window.homeMarkets || window.INFOMARKET_DATA.markets));
document.addEventListener('click', (event) => {
  const link = event.target.closest?.('[data-category]');
  if (!link) return;
  event.preventDefault();
  selectCategory(link);
});
loadMarkets();
