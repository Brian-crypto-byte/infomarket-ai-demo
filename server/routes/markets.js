const { sendJson, sendError, readBody, now, id } = require('../utils');
const { correctScores, priceFootballMarket, noOddsFromYes } = require('../odds/football-pricing');

const KALSHI_EVENTS_URL = 'https://external-api.kalshi.com/trade-api/v2/events?limit=200&status=open&with_nested_markets=true';
const KALSHI_SERIES_URL = 'https://external-api.kalshi.com/trade-api/v2/series?category=Sports&include_volume=true&include_product_metadata=true';
let kalshiCache = { expiresAt: 0, items: [] };
let soccerSeriesCache = { expiresAt: 0, tickers: [] };
let soccerMarketsCache = { expiresAt: 0, items: [] };
let apiSportsCache = { expiresAt: 0, date: '', items: [] };

const API_SPORTS_HOST = 'https://v3.football.api-sports.io';
const API_TIMEZONE = 'Asia/Shanghai';

function dollarsToDecimal(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0.01 || price >= 0.99) return null;
  return Number((1 / price).toFixed(2));
}

function normalizeCategory(category = '') {
  const text = category.toLowerCase();
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) return 'crypto';
  if (text.includes('esport') || text.includes('gaming') || text.includes('video game')) return 'esports';
  if (text.includes('weather') || text.includes('climate')) return 'weather';
  if (text.includes('financial') || text.includes('companies')) return 'economy';
  if (text.includes('science') || text.includes('technology')) return 'tech';
  if (text.includes('entertainment') || text.includes('social')) return 'culture';
  if (text.includes('election') || text.includes('politic') || text.includes('world')) return 'economy';
  return 'trending';
}

function inferKalshiCategory(event = {}, market = {}) {
  const text = [event.category, event.title, market.title, event.series_ticker, market.ticker].join(' ').toLowerCase();
  if (/crypto|bitcoin|btc|ethereum|eth|solana|xrp|doge|stablecoin/.test(text)) return 'crypto';
  if (/esport|gaming|video game|league of legends|valorant|counter-strike|dota|overwatch/.test(text)) return 'esports';
  if (/weather|temperature|rain|snow|hurricane|tornado|climate/.test(text)) return 'weather';
  if (/fed|rate|inflation|cpi|gdp|recession|stock|nasdaq|s&p|oil|gold|treasury|economy|financial|companies/.test(text)) return 'economy';
  if (/ai|openai|spacex|tesla|apple|google|meta|nvidia|science|technology|tech|robot|chip/.test(text)) return 'tech';
  if (/movie|music|grammy|oscar|emmy|taylor|celebrity|culture|entertainment|social/.test(text)) return 'culture';
  return normalizeCategory(event.category || '');
}

function cleanTitle(value = '') {
  return String(value).replace(/\s+/g, ' ').replace('casted', 'cast').trim();
}

function fetchJson(url, timeoutMs = 6500) {
  return fetch(url, {
    headers: { 'User-Agent': 'infomarket.ai/0.1' },
    signal: AbortSignal.timeout(timeoutMs)
  }).then((response) => (response.ok ? response.json() : null));
}

function apiSportsKey() {
  return process.env.API_SPORTS_KEY || process.env.APISPORTS_KEY || process.env.API_FOOTBALL_KEY;
}

function fetchApiSports(path, params = {}, timeoutMs = 9000) {
  const key = apiSportsKey();
  if (!key || typeof fetch !== 'function') return Promise.resolve(null);
  const url = new URL(`${API_SPORTS_HOST}/${path}`);
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(name, value);
  });
  return fetch(url, {
    headers: {
      'x-apisports-key': key,
      'x-rapidapi-key': key,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    },
    signal: AbortSignal.timeout(timeoutMs)
  }).then((response) => (response.ok ? response.json() : null));
}

function localDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: API_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((memo, part) => {
    memo[part.type] = part.value;
    return memo;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function apiFixtureStatus(status = {}) {
  const short = String(status.short || '').toUpperCase();
  if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(short)) return 'live';
  if (['NS', 'TBD'].includes(short)) return 'upcoming';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'closed';
  return String(status.long || 'active').toLowerCase();
}

function firstValidBookmaker(bookmakers = [], betName) {
  return bookmakers
    .map((bookmaker) => ({
      bookmaker,
      bet: (bookmaker.bets || []).find((bet) => bet.name === betName)
    }))
    .filter((item) => item.bet && Array.isArray(item.bet.values) && item.bet.values.length)
    .sort((a, b) => b.bet.values.length - a.bet.values.length)[0] || null;
}

function optionFromOdd(value, label, id, sortOrder) {
  const yesOdds = Number(value?.odd);
  const noOdds = noOddsFromYes(yesOdds);
  if (!Number.isFinite(yesOdds) || !noOdds) return null;
  return {
    id,
    groupKey: 'match_result',
    label,
    sideType: 'yes_no',
    sellable: true,
    sortOrder,
    yesOdds: Number(yesOdds.toFixed(2)),
    noOdds,
    source: 'api-sports'
  };
}

function normalizeScoreLabel(value = '') {
  return String(value).trim().replace(/\s+/g, '').replace(':', '-');
}

function apiSportsCorrectScores(exactScoreBet, fixtureId) {
  const valueMap = new Map((exactScoreBet?.values || []).map((value) => [normalizeScoreLabel(value.value), value]));
  return correctScores().map((score) => {
    const source = valueMap.get(score.label);
    const yesOdds = Number(source?.odd);
    if (!Number.isFinite(yesOdds) || yesOdds <= 1) {
      return {
        ...score,
        id: `api-${fixtureId}-${score.id}`,
        source: 'platform-fixed'
      };
    }
    return {
      ...score,
      id: `api-${fixtureId}-${score.id}`,
      yesOdds: Number(yesOdds.toFixed(2)),
      noOdds: noOddsFromYes(yesOdds),
      source: 'api-sports'
    };
  });
}

function apiSportsMarketFromOdds(oddItem, fixture) {
  if (!fixture) return null;
  const winner = firstValidBookmaker(oddItem.bookmakers, 'Match Winner');
  if (!winner) return null;
  const values = new Map(winner.bet.values.map((value) => [String(value.value).toLowerCase(), value]));
  const home = fixture.teams?.home;
  const away = fixture.teams?.away;
  const options = [
    optionFromOdd(values.get('home'), 'Home', `api-${fixture.fixture.id}-home`, 1),
    optionFromOdd(values.get('draw'), 'Draw', `api-${fixture.fixture.id}-draw`, 2),
    optionFromOdd(values.get('away'), 'Away', `api-${fixture.fixture.id}-away`, 3)
  ].filter(Boolean);
  if (options.length < 3 || !home?.name || !away?.name) return null;

  const exactScore = firstValidBookmaker(oddItem.bookmakers, 'Exact Score');
  const scoreOptions = apiSportsCorrectScores(exactScore?.bet, fixture.fixture.id);

  return priceFootballMarket({
    id: `api-football-${fixture.fixture.id}`,
    externalId: String(fixture.fixture.id),
    type: 'football',
    category: 'sports',
    sport: 'soccer',
    title: `${home.name} vs ${away.name}`,
    league: fixture.league?.name || oddItem.league?.name || 'Soccer',
    leagueLogo: fixture.league?.logo || oddItem.league?.logo || null,
    status: apiFixtureStatus(fixture.fixture?.status),
    startsAt: fixture.fixture?.date || now(),
    volumeUsdt: 0,
    score: fixture.goals?.home === null || fixture.goals?.away === null ? null : { home: fixture.goals.home, away: fixture.goals.away },
    participants: [
      { role: 'home', id: home.id, name: home.name, shortCode: teamLogo(home.name), logo: home.logo },
      { role: 'away', id: away.id, name: away.name, shortCode: teamLogo(away.name), logo: away.logo }
    ],
    options: [...options, ...scoreOptions],
    oddsSource: {
      provider: 'API-SPORTS',
      host: 'v3.football.api-sports.io',
      bookmaker: winner.bookmaker.name,
      updatedAt: oddItem.update || now(),
      exactScoreBookmaker: exactScore?.bookmaker?.name || null
    },
    updatedAt: oddItem.update || now()
  });
}

async function fetchApiSportsFootballMarkets() {
  const date = localDateString();
  if (Date.now() < apiSportsCache.expiresAt && apiSportsCache.date === date) return apiSportsCache.items;
  try {
    const [fixturesData, oddsData] = await Promise.all([
      fetchApiSports('fixtures', { date, timezone: API_TIMEZONE }),
      fetchApiSports('odds', { date, timezone: API_TIMEZONE })
    ]);
    const fixtures = new Map((fixturesData?.response || []).map((fixture) => [fixture.fixture?.id, fixture]));
    const items = (oddsData?.response || [])
      .map((oddItem) => apiSportsMarketFromOdds(oddItem, fixtures.get(oddItem.fixture?.id)))
      .filter(Boolean)
      .filter((market) => market.status !== 'closed')
      .filter((market) => market.options.some((option) => option.groupKey === 'match_result'))
      .slice(0, 160);
    apiSportsCache = { expiresAt: Date.now() + 10 * 60 * 1000, date, items };
    return items;
  } catch (_) {
    return apiSportsCache.items || [];
  }
}

function kalshiEventToMarket(event) {
  const market = (event.markets || []).find((item) => {
    const yes = dollarsToDecimal(item.yes_ask_dollars);
    const no = dollarsToDecimal(item.no_ask_dollars);
    return yes && no && cleanTitle(item.title).length > 16;
  });
  if (!market) return null;

  const yesOdds = dollarsToDecimal(market.yes_ask_dollars);
  const noOdds = dollarsToDecimal(market.no_ask_dollars);
  const title = cleanTitle(event.title || market.title);
  if (!title || !yesOdds || !noOdds) return null;

  return priceFootballMarket({
    id: `kalshi-${String(event.event_ticker || market.ticker).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    externalId: market.ticker,
    type: 'binary',
    category: inferKalshiCategory(event, market),
    title,
    league: event.category || 'Market',
    status: 'active',
    startsAt: market.close_time || now(),
    volumeUsdt: Number(market.volume_fp || 0),
    participants: [],
    options: [
      { id: `${market.ticker}-outcome`, groupKey: 'binary_outcome', label: 'Outcome', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds, noOdds }
    ],
    updatedAt: market.updated_time || now()
  });
}

async function fetchKalshiMarkets() {
  if (Date.now() < kalshiCache.expiresAt) return kalshiCache.items;
  if (typeof fetch !== 'function') return [];

  try {
    const data = await fetchJson(KALSHI_EVENTS_URL);
    if (!data) return [];
    const seen = new Set();
    const items = (data.events || [])
      .map(kalshiEventToMarket)
      .filter(Boolean)
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 24);
    kalshiCache = { expiresAt: Date.now() + 60 * 1000, items };
    return items;
  } catch (_) {
    return kalshiCache.items || [];
  }
}

async function fetchSoccerSeriesTickers() {
  if (Date.now() < soccerSeriesCache.expiresAt) return soccerSeriesCache.tickers;
  if (typeof fetch !== 'function') return [];

  try {
    const data = await fetchJson(KALSHI_SERIES_URL, 9000);
    const tickers = (data?.series || [])
      .filter((item) => (item.tags || []).includes('Soccer'))
      .filter((item) => !/delete/i.test(item.title || ''))
      .sort((a, b) => Number(b.volume_fp || 0) - Number(a.volume_fp || 0))
      .slice(0, 64)
      .map((item) => ({ ticker: item.ticker, title: cleanTitle(item.title), volume: Number(item.volume_fp || 0) }));
    soccerSeriesCache = { expiresAt: Date.now() + 10 * 60 * 1000, tickers };
    return tickers;
  } catch (_) {
    return soccerSeriesCache.tickers || [];
  }
}

function extractTeams(title = '') {
  const match = cleanTitle(title).match(/^(.+?)\s+vs\s+(.+?)\s+Winner\??$/i);
  if (!match) return null;
  return [match[1].trim(), match[2].trim()];
}

function teamLogo(name = '') {
  const words = name.replace(/[^a-z0-9\s]/gi, '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'FC';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((word) => word[0]).join('').toUpperCase();
}

function marketSlug(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 72);
}

function isInternalTestMarket(market = {}) {
  const text = [market.id, market.title, market.league, ...(market.participants || []).map((item) => item.name)].join(' ');
  return /test league|alpha fc|beta fc|custom-admin-market/i.test(text);
}

function decimal(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Number(number.toFixed(2)) : fallback;
}

function normalizeAdminMarket(body = {}) {
  const type = body.type === 'crypto' ? 'crypto' : 'football';
  const title = cleanTitle(body.title);
  if (!title) throw new Error('Missing market title');
  const marketId = body.id || `custom-${marketSlug(title) || Date.now()}`;
  const league = cleanTitle(body.league || (type === 'football' ? 'Custom Soccer' : 'Crypto'));
  const startsAt = body.startsAt || now();
  if (type === 'crypto') {
    const upOdds = decimal(body.upOdds ?? body.homeOdds, 1.9);
    const downOdds = decimal(body.downOdds ?? body.awayOdds, 1.9);
    return {
      id: marketId,
      type: 'crypto',
      category: 'crypto',
      title,
      league,
      status: body.status || 'active',
      startsAt,
      volumeUsdt: 0,
      participants: [],
      options: [
        { id: `${marketId}-up`, groupKey: 'crypto_direction', label: 'Up', sideType: 'up_down', sellable: true, sortOrder: 1, upOdds },
        { id: `${marketId}-down`, groupKey: 'crypto_direction', label: 'Down', sideType: 'up_down', sellable: true, sortOrder: 2, downOdds }
      ],
      createdAt: now(),
      updatedAt: now()
    };
  }

  const home = cleanTitle(body.home || body.homeTeam || 'Home');
  const away = cleanTitle(body.away || body.awayTeam || 'Away');
  const homeOdds = decimal(body.homeOdds, 2.05);
  const drawOdds = decimal(body.drawOdds, 3.2);
  const awayOdds = decimal(body.awayOdds, 2.9);
  return priceFootballMarket({
    id: marketId,
    type: 'football',
    category: 'sports',
    sport: 'soccer',
    title: `${home} vs ${away}`,
    league,
    status: body.status || 'upcoming',
    startsAt,
    volumeUsdt: 0,
    score: null,
    participants: [
      { role: 'home', name: home, shortCode: teamLogo(home), logo: body.homeLogo || teamLogo(home) },
      { role: 'away', name: away, shortCode: teamLogo(away), logo: body.awayLogo || teamLogo(away) }
    ],
    options: [
      { id: `${marketId}-home`, groupKey: 'match_result', label: 'Home', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds: homeOdds, noOdds: noOddsFromYes(homeOdds) },
      { id: `${marketId}-draw`, groupKey: 'match_result', label: 'Draw', sideType: 'yes_no', sellable: true, sortOrder: 2, yesOdds: drawOdds, noOdds: noOddsFromYes(drawOdds) },
      { id: `${marketId}-away`, groupKey: 'match_result', label: 'Away', sideType: 'yes_no', sellable: true, sortOrder: 3, yesOdds: awayOdds, noOdds: noOddsFromYes(awayOdds) },
      ...correctScores().map((score) => ({ ...score, id: `${marketId}-${score.id}` }))
    ],
    oddsSource: { provider: 'Admin fixed pool', updatedAt: now() },
    createdAt: now(),
    updatedAt: now()
  });
}

function updateMarketOdds(market, body = {}) {
  const updates = Array.isArray(body.options) ? body.options : [];
  if (!updates.length) throw new Error('No odds updates provided');
  const optionMap = new Map((market.options || []).map((option) => [option.id, option]));
  const changed = [];
  updates.forEach((update) => {
    const option = optionMap.get(update.id || update.optionId);
    if (!option) return;
    if (option.sideType === 'up_down') {
      if (update.upOdds !== undefined) option.upOdds = decimal(update.upOdds, option.upOdds);
      if (update.downOdds !== undefined) option.downOdds = decimal(update.downOdds, option.downOdds);
    } else {
      if (update.yesOdds !== undefined) option.yesOdds = decimal(update.yesOdds, option.yesOdds);
      if (update.noOdds !== undefined) {
        option.noOdds = decimal(update.noOdds, option.noOdds);
      } else if (update.yesOdds !== undefined) {
        option.noOdds = noOddsFromYes(option.yesOdds);
      }
    }
    option.updatedAt = now();
    changed.push(option.id);
  });
  if (!changed.length) throw new Error('No matching options found');
  market.updatedAt = now();
  market.oddsSource = { provider: 'Admin fixed pool', updatedAt: now() };
  return changed;
}

function optionFromKalshiMarket(market, sortOrder) {
  const yesOdds = dollarsToDecimal(market.yes_ask_dollars);
  const noOdds = dollarsToDecimal(market.no_ask_dollars);
  if (!yesOdds || !noOdds) return null;
  const subTitle = cleanTitle(market.yes_sub_title || market.no_sub_title || market.title);
  return priceFootballMarket({
    id: market.ticker,
    groupKey: 'match_result',
    label: /^tie$/i.test(subTitle) ? 'Draw' : subTitle,
    sideType: 'yes_no',
    sellable: true,
    sortOrder,
    yesOdds,
    noOdds
  });
}

function soccerEventToFootball(eventTicker, markets, seriesTitle) {
  const title = cleanTitle(markets[0]?.title);
  const teams = extractTeams(title);
  if (!teams) return null;
  const options = markets
    .map((market) => {
      const label = cleanTitle(market.yes_sub_title || market.no_sub_title);
      const order = /^tie$/i.test(label) ? 2 : (label === teams[0] ? 1 : 3);
      return optionFromKalshiMarket(market, order);
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (options.length < 3) return null;

  return {
    id: `kalshi-soccer-${eventTicker.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    externalId: eventTicker,
    type: 'football',
    category: 'sports',
    sport: 'soccer',
    title: `${teams[0]} vs ${teams[1]}`,
    league: seriesTitle.replace(/\bGame\b/i, '').trim() || 'Soccer',
    status: 'active',
    startsAt: markets[0].close_time || now(),
    volumeUsdt: markets.reduce((sum, market) => sum + Number(market.volume_fp || 0), 0),
    participants: [
      { role: 'home', name: teams[0], shortCode: teamLogo(teams[0]), logo: teamLogo(teams[0]) },
      { role: 'away', name: teams[1], shortCode: teamLogo(teams[1]), logo: teamLogo(teams[1]) }
    ],
    options: [...options, ...correctScores()],
    updatedAt: markets[0].updated_time || now()
  };
}

function soccerPropToBinary(market, seriesTitle) {
  const yesOdds = dollarsToDecimal(market.yes_ask_dollars);
  const noOdds = dollarsToDecimal(market.no_ask_dollars);
  if (!yesOdds || !noOdds) return null;
  return {
    id: `kalshi-soccer-${market.ticker.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    externalId: market.ticker,
    type: 'binary',
    category: 'sports',
    sport: 'soccer',
    title: cleanTitle(market.title),
    league: seriesTitle || 'Soccer',
    status: 'active',
    startsAt: market.close_time || now(),
    volumeUsdt: Number(market.volume_fp || 0),
    participants: [],
    options: [
      { id: `${market.ticker}-outcome`, groupKey: 'binary_outcome', label: 'Outcome', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds, noOdds }
    ],
    updatedAt: market.updated_time || now()
  };
}

async function fetchKalshiSoccerMarkets() {
  if (Date.now() < soccerMarketsCache.expiresAt) return soccerMarketsCache.items;
  if (typeof fetch !== 'function') return [];

  try {
    const series = await fetchSoccerSeriesTickers();
    const selectedSeries = series;
    const batches = await Promise.all(selectedSeries.map(async (item) => {
      const url = `https://external-api.kalshi.com/trade-api/v2/markets?limit=100&status=open&series_ticker=${encodeURIComponent(item.ticker)}`;
      const data = await fetchJson(url, 9000);
      return { series: item, markets: data?.markets || [] };
    }));

    const grouped = new Map();
    const propMarkets = [];
    batches.forEach((batch) => {
      batch.markets.forEach((market) => {
        if (!dollarsToDecimal(market.yes_ask_dollars) || !dollarsToDecimal(market.no_ask_dollars)) return;
        if (extractTeams(market.title)) {
          const list = grouped.get(market.event_ticker) || { seriesTitle: batch.series.title, markets: [] };
          list.markets.push(market);
          grouped.set(market.event_ticker, list);
        } else {
          propMarkets.push({ market, seriesTitle: batch.series.title });
        }
      });
    });

    const football = Array.from(grouped.entries())
      .map(([eventTicker, group]) => soccerEventToFootball(eventTicker, group.markets, group.seriesTitle))
      .filter(Boolean);
    // Homepage soccer must stay match-first: team crests, 1X2 YES/NO, and correct-score lines.
    // Kalshi soccer prop markets such as totals/spreads are valid data, but they render as
    // generic binary cards without team crests or score previews, which is not the product pattern.
    const items = football
      .sort((a, b) => Number(b.volumeUsdt || 0) - Number(a.volumeUsdt || 0))
      .slice(0, 240);
    soccerMarketsCache = { expiresAt: Date.now() + 90 * 1000, items };
    return items;
  } catch (_) {
    return soccerMarketsCache.items || [];
  }
}

async function handleMarkets(req, res, pathname, url, db, writeDb) {
  if (req.method === 'GET' && pathname === '/markets') {
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const includeExternal = url.searchParams.get('includeExternal') === '1';
    const shouldLoadFootball = includeExternal && (!category || category === 'soccer' || category === 'trending' || type === 'football');
    const [kalshiItems, soccerItems, apiSportsItems] = await Promise.all([
      includeExternal && type !== 'football' ? fetchKalshiMarkets() : [],
      shouldLoadFootball ? fetchKalshiSoccerMarkets() : [],
      shouldLoadFootball ? fetchApiSportsFootballMarkets() : []
    ]);
    const seen = new Set();
    const seenEventKeys = new Set();
    const localMarkets = db.markets || [];
    const items = [...apiSportsItems, ...soccerItems, ...kalshiItems, ...localMarkets].filter((market) => {
      if (isInternalTestMarket(market)) return false;
      if (market.status === 'suspended' && !url.searchParams.get('includeSuspended')) return false;
      if (seen.has(market.id)) return false;
      seen.add(market.id);
      if (market.type === 'football') {
        const eventKey = `${market.type}:${cleanTitle(market.title).toLowerCase()}`;
        if (seenEventKeys.has(eventKey)) return false;
        seenEventKeys.add(eventKey);
      }
      return (
      (!type || market.type === type) &&
      (!status || market.status === status) &&
      (!category ||
        (category === 'trending' && (market.type === 'football' || market.sport === 'soccer')) ||
        (category === 'soccer' && (market.sport === 'soccer' || market.type === 'football')) ||
        (category === 'sports' && market.category === 'sports' && market.type !== 'football' && market.sport !== 'soccer') ||
        (category !== 'sports' && market.category === category))
      );
    }).sort((a, b) => {
      const at = Date.parse(a.startsAt || '') || Number.MAX_SAFE_INTEGER;
      const bt = Date.parse(b.startsAt || '') || Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
    return sendJson(res, 200, { items });
  }

  const marketMatch = pathname.match(/^\/markets\/([^/]+)$/);
  if (req.method === 'GET' && marketMatch) {
    const marketId = marketMatch[1];
    const market = db.markets.find((item) => item.id === marketId);
    if (market) return sendJson(res, 200, { market });
    const [apiSportsItems, soccerItems, kalshiItems] = await Promise.all([fetchApiSportsFootballMarkets(), fetchKalshiSoccerMarkets(), fetchKalshiMarkets()]);
    const kalshiMarket = [...apiSportsItems, ...soccerItems, ...kalshiItems].find((item) => item.id === marketId);
    return kalshiMarket ? sendJson(res, 200, { market: kalshiMarket }) : sendError(res, 404, 'Market not found');
  }

  if (req.method === 'POST' && pathname === '/admin/markets') {
    const body = await readBody(req);
    let market;
    try {
      market = normalizeAdminMarket(body);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
    db.markets ||= [];
    if (db.markets.some((item) => item.id === market.id)) return sendError(res, 409, 'Market already exists');
    db.markets.unshift(market);
    db.auditLogs ||= [];
    db.auditLogs.unshift({ id: id('aud'), action: 'market_created', entityType: 'market', entityId: market.id, createdAt: now() });
    writeDb(db);
    return sendJson(res, 201, { market });
  }

  const oddsMatch = pathname.match(/^\/admin\/markets\/([^/]+)\/odds$/);
  if ((req.method === 'PATCH' || req.method === 'POST') && oddsMatch) {
    const market = (db.markets || []).find((item) => item.id === oddsMatch[1]);
    if (!market) return sendError(res, 404, 'Only admin-created markets can be edited');
    const body = await readBody(req);
    let changed;
    try {
      changed = updateMarketOdds(market, body);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
    db.auditLogs ||= [];
    db.auditLogs.unshift({ id: id('aud'), action: 'market_odds_updated', entityType: 'market', entityId: market.id, details: { changed }, createdAt: now() });
    writeDb(db);
    return sendJson(res, 200, { market, changed });
  }

  const statusMatch = pathname.match(/^\/admin\/markets\/([^/]+)\/status$/);
  if ((req.method === 'PATCH' || req.method === 'POST') && statusMatch) {
    const market = (db.markets || []).find((item) => item.id === statusMatch[1]);
    if (!market) return sendError(res, 404, 'Only admin-created markets can be updated');
    const body = await readBody(req);
    const status = String(body.status || '').toLowerCase();
    const allowed = new Set(['draft', 'upcoming', 'active', 'suspended', 'settled']);
    if (!allowed.has(status)) return sendError(res, 400, 'Invalid market status');
    market.status = status;
    market.updatedAt = now();
    db.auditLogs ||= [];
    db.auditLogs.unshift({ id: id('aud'), action: 'market_status_updated', entityType: 'market', entityId: market.id, details: { status }, createdAt: now() });
    writeDb(db);
    return sendJson(res, 200, { market });
  }
  return false;
}

async function publicMarkets() {
  const [apiSportsItems, soccerItems, kalshiItems] = await Promise.all([
    fetchApiSportsFootballMarkets(),
    fetchKalshiSoccerMarkets(),
    fetchKalshiMarkets()
  ]);
  return [...apiSportsItems, ...soccerItems, ...kalshiItems];
}

module.exports = { handleMarkets, publicMarkets, fetchKalshiSoccerMarkets, fetchApiSportsFootballMarkets, fetchApiSports, teamLogo, noOddsFromYes };
