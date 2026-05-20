const { now } = require('./utils');
const { fetchKalshiSoccerMarkets, fetchApiSportsFootballMarkets, fetchApiSports, teamLogo, noOddsFromYes } = require('./routes/markets');
const { settleFootballMarket } = require('./domain');
const { correctScores, priceFootballMarket } = require('./odds/football-pricing');

const POLYMARKET_SOCCER_URL = 'https://gamma-api.polymarket.com/events?limit=80&active=true&closed=false&tag_slug=soccer';
const POLYMARKET_SOCCER_GAMES_URL = 'https://polymarket.com/zh/sports/soccer/games';
const MATCH_WINDOW_MINUTES = 30;
const FOOTBALL_REGULATION_MINUTES = 90;
const FINISHED_STATUS = new Set(['FT', 'AET', 'PEN']);

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function canonicalTeamName(value = '') {
  const text = clean(value);
  const normalized = text
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

function slug(value = '') {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
}

function eventKey(market = {}) {
  const teams = (market.participants || []).reduce((memo, item) => {
    memo[item.role] = clean(item.name).toLowerCase();
    return memo;
  }, {});
  const date = Number.isNaN(Date.parse(market.startsAt || '')) ? 'pending' : new Date(market.startsAt).toISOString().slice(0, 10);
  return [market.sport || 'soccer', teams.home || '', teams.away || '', date].join('|');
}

function decimalFromProbability(value, fallback = 2) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0.01 || n >= 0.99) return fallback;
  return Number((1 / n).toFixed(2));
}

function matchTeamsFromQuestion(title = '') {
  const text = clean(title).replace(/\s+-\s+More Markets$/i, '');
  const vs = text.match(/^(.+?)\s+(?:vs\.?|v\.?)\s+(.+?)(?:\s+Winner|\s*[:?]|$)/i);
  if (vs) return [clean(vs[1]), clean(vs[2])];
  const at = text.match(/^(.+?)\s+at\s+(.+?)(?:\s*[:?]|$)/i);
  if (at) return [clean(at[2]), clean(at[1])];
  return null;
}

function stripPolymarketSuffix(value = '') {
  return clean(value)
    .replace(/\s*-\s*More Markets\s*$/i, '')
    .replace(/\s*-\s*更多市场\s*$/i, '')
    .replace(/\s*-\s*Player Props\s*$/i, '')
    .replace(/\s*-\s*球员道具\s*$/i, '')
    .replace(/\s*-\s*Exact Score\s*$/i, '')
    .replace(/\s*-\s*确切分数\s*$/i, '')
    .replace(/\s*-\s*Halftime Result\s*$/i, '')
    .replace(/\s*-\s*半场结果\s*$/i, '')
    .replace(/\s*-\s*Total Corners\s*$/i, '');
}

function shouldSkipPolymarketPageEvent(item = {}) {
  const text = [item.name, item.url, item.offers?.name].map(clean).join(' ');
  return /player props|球员道具|total corners|corners|角球|halftime|半场|exact score|确切分数|top scorer|射手|assists|助攻|clean sheet|黄牌|red cards|cards|bookings/i.test(text);
}

function teamsFromPolymarketPageName(name = '') {
  const text = stripPolymarketSuffix(name);
  const match = text.match(/^(.+?)\s*(?:vs\.?|v\.?|与|對|对)\s*(.+)$/i);
  if (!match) return null;
  return [canonicalTeamName(match[1]), canonicalTeamName(match[2])].filter(Boolean);
}

function leagueFromPolymarketUrl(url = '') {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const sportsIndex = parts.indexOf('sports');
    const raw = sportsIndex >= 0 ? parts[sportsIndex + 1] : '';
    return raw ? raw.split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ') : 'Polymarket Soccer';
  } catch (_) {
    return 'Polymarket Soccer';
  }
}

function probabilityFromOffer(item = {}, teams = []) {
  const price = Number(item.offers?.price);
  if (!Number.isFinite(price) || price <= 0 || price >= 1) return null;
  const offerName = clean(item.offers?.name).replace(/^Outcome:\s*/i, '');
  const index = teams.findIndex((team) => offerName && team.toLowerCase().includes(offerName.toLowerCase()));
  return { index, price };
}

function polymarketPageOptions(marketId, item, teams) {
  const offer = probabilityFromOffer(item, teams);
  const homeProb = offer?.index === 0 ? offer.price : 0.48;
  const awayProb = offer?.index === 1 ? offer.price : 0.31;
  const drawProb = Math.max(0.12, Math.min(0.34, 1 - homeProb - awayProb));
  const homeOdds = decimalFromProbability(homeProb, 2.08);
  const drawOdds = decimalFromProbability(drawProb, 3.35);
  const awayOdds = decimalFromProbability(awayProb, 3.22);
  return [
    { id: `${marketId}-home`, groupKey: 'match_result', label: 'Home', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds: homeOdds, noOdds: noOddsFromYes(homeOdds) },
    { id: `${marketId}-draw`, groupKey: 'match_result', label: 'Draw', sideType: 'yes_no', sellable: true, sortOrder: 2, yesOdds: drawOdds, noOdds: noOddsFromYes(drawOdds) },
    { id: `${marketId}-away`, groupKey: 'match_result', label: 'Away', sideType: 'yes_no', sellable: true, sortOrder: 3, yesOdds: awayOdds, noOdds: noOddsFromYes(awayOdds) }
  ];
}

function normalizePolymarketPageEvent(item = {}) {
  if (!item?.name || shouldSkipPolymarketPageEvent(item)) {
    return {
      source: 'polymarket-games',
      sourceId: item.url || item.name || `skip-${Date.now()}`,
      title: stripPolymarketSuffix(item.name || ''),
      league: leagueFromPolymarketUrl(item.url),
      startsAt: item.endDate || item.startDate || now(),
      publishable: false,
      skipReason: 'not_match_market'
    };
  }
  const teams = teamsFromPolymarketPageName(item.name);
  if (!teams || teams.length < 2) {
    return {
      source: 'polymarket-games',
      sourceId: item.url || item.name || `skip-${Date.now()}`,
      title: stripPolymarketSuffix(item.name || ''),
      league: leagueFromPolymarketUrl(item.url),
      startsAt: item.endDate || item.startDate || now(),
      publishable: false,
      skipReason: 'teams_not_found'
    };
  }

  const [home, away] = teams.map(canonicalTeamName);
  const datePart = Number.isNaN(Date.parse(item.endDate || '')) ? '' : new Date(item.endDate).toISOString().slice(0, 10);
  const marketId = `poly-game-${slug(`${home}-${away}-${datePart || item.url || item.name}`)}`;
  const league = leagueFromPolymarketUrl(item.url);
  return priceFootballMarket({
    id: marketId,
    externalId: item.url || marketId,
    source: 'polymarket-games',
    sourceUrl: item.url || POLYMARKET_SOCCER_GAMES_URL,
    type: 'football',
    category: 'sports',
    sport: 'soccer',
    title: `${home} vs ${away}`,
    league,
    leagueLogo: item.image || null,
    status: 'upcoming',
    startsAt: item.endDate || item.startDate || now(),
    volumeUsdt: 0,
    score: null,
    participants: [
      { role: 'home', name: home, shortCode: teamLogo(home), logo: null },
      { role: 'away', name: away, shortCode: teamLogo(away), logo: null }
    ],
    options: [
      ...polymarketPageOptions(marketId, item, teams),
      ...correctScores().map((score) => ({ ...score, id: `${marketId}-${score.id}` }))
    ],
    oddsSource: {
      provider: item.offers?.price ? 'Polymarket page price' : 'Platform opening odds',
      sourceUrl: item.url || POLYMARKET_SOCCER_GAMES_URL,
      updatedAt: now()
    },
    publishable: true,
    collectedAt: now(),
    updatedAt: now()
  });
}

function parseJsonLdScripts(html = '') {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .map((text) => {
      try { return JSON.parse(text); } catch (_) { return null; }
    })
    .filter(Boolean);
}

async function fetchPolymarketGamesPageCandidates() {
  try {
    const response = await fetch(POLYMARKET_SOCCER_GAMES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; infomarket.ai football collector)',
        Accept: 'text/html,application/xhtml+xml'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return [];
    const html = await response.text();
    const collection = parseJsonLdScripts(html).find((item) => item?.['@type'] === 'CollectionPage' && item?.mainEntity?.itemListElement);
    const items = collection?.mainEntity?.itemListElement || [];
    return items.map((entry) => normalizePolymarketPageEvent(entry.item || entry)).filter(Boolean);
  } catch (_) {
    return [];
  }
}

function normalizePolymarketEvent(event = {}) {
  const markets = Array.isArray(event.markets) ? event.markets : [];
  const title = clean(event.title);
  const teams = matchTeamsFromQuestion(title) || matchTeamsFromQuestion(markets[0]?.question);
  if (!teams) {
    return {
      source: 'polymarket',
      sourceId: event.slug || event.id,
      title,
      league: 'Polymarket Soccer',
      startsAt: event.endDate || markets[0]?.endDate || now(),
      publishable: false,
      skipReason: 'not_match_market'
    };
  }

  const [home, away] = teams.map(canonicalTeamName);
  const marketId = `poly-soccer-${slug(event.slug || `${home}-${away}-${event.endDate || event.id}`)}`;
  const firstPrices = (() => {
    try { return JSON.parse(markets[0]?.outcomePrices || '[]'); } catch (_) { return []; }
  })();
  const homeOdds = decimalFromProbability(firstPrices[0], 2.05);
  const awayOdds = decimalFromProbability(firstPrices[1], 2.9);
  const drawOdds = 3.35;

  return priceFootballMarket({
    id: marketId,
    externalId: String(event.id || event.slug || marketId),
    source: 'polymarket',
    sourceUrl: `https://polymarket.com/event/${event.slug || ''}`,
    type: 'football',
    category: 'sports',
    sport: 'soccer',
    title: `${home} vs ${away}`,
    league: 'Polymarket Soccer',
    status: 'upcoming',
    startsAt: event.endDate || markets[0]?.endDate || now(),
    volumeUsdt: Number(event.volume || event.volumeNum || markets.reduce((sum, item) => sum + Number(item.volume || 0), 0) || 0),
    score: null,
    participants: [
      { role: 'home', name: home, shortCode: teamLogo(home), logo: teamLogo(home) },
      { role: 'away', name: away, shortCode: teamLogo(away), logo: teamLogo(away) }
    ],
    options: [
      { id: `${marketId}-home`, groupKey: 'match_result', label: 'Home', sideType: 'yes_no', sellable: true, sortOrder: 1, yesOdds: homeOdds, noOdds: noOddsFromYes(homeOdds) },
      { id: `${marketId}-draw`, groupKey: 'match_result', label: 'Draw', sideType: 'yes_no', sellable: true, sortOrder: 2, yesOdds: drawOdds, noOdds: noOddsFromYes(drawOdds) },
      { id: `${marketId}-away`, groupKey: 'match_result', label: 'Away', sideType: 'yes_no', sellable: true, sortOrder: 3, yesOdds: awayOdds, noOdds: noOddsFromYes(awayOdds) },
      ...correctScores().map((score) => ({ ...score, id: `${marketId}-${score.id}` }))
    ],
    oddsSource: { provider: 'Polymarket collected', updatedAt: now() },
    publishable: true,
    collectedAt: now(),
    updatedAt: now()
  });
}

async function fetchPolymarketSoccerCandidates() {
  try {
    const response = await fetch(POLYMARKET_SOCCER_URL, {
      headers: { 'User-Agent': 'infomarket.ai/0.1' },
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok) return [];
    const events = await response.json();
    return (Array.isArray(events) ? events : []).map(normalizePolymarketEvent);
  } catch (_) {
    return [];
  }
}

function normalizeCollected(market, source) {
  return {
    ...market,
    source,
    sourceId: market.externalId || market.id,
    sourceUrl: market.sourceUrl || (source === 'kalshi' ? `https://kalshi.com/markets/${market.externalId || ''}` : ''),
    publishable: market.type === 'football' && market.sport === 'soccer',
    collectedAt: now()
  };
}

async function collectFootballCandidates(db) {
  const [apiSports, kalshi, polymarket, polymarketGames] = await Promise.all([
    fetchApiSportsFootballMarkets().catch(() => []),
    fetchKalshiSoccerMarkets().catch(() => []),
    fetchPolymarketSoccerCandidates(),
    fetchPolymarketGamesPageCandidates()
  ]);
  const existingKeys = new Set((db.markets || []).filter((item) => item.type === 'football').map(eventKey));
  const seen = new Set();
  const cutoff = Date.now() - 60 * 60 * 1000;
  const candidates = [
    ...apiSports.map((item) => normalizeCollected(item, 'api-sports')),
    ...polymarketGames,
    ...kalshi.map((item) => normalizeCollected(item, 'kalshi')),
    ...polymarket
  ]
    .filter((item) => {
      if (!item.publishable) return true;
      const start = Date.parse(item.startsAt || '');
      return Number.isFinite(start) && start >= cutoff;
    })
    .map((item) => ({ ...item, dedupeKey: item.publishable ? eventKey(item) : `skip|${item.source}|${item.sourceId}` }))
    .filter((item) => {
      if (seen.has(item.dedupeKey)) {
        item.publishable = false;
        item.skipReason = 'duplicate_in_collection';
        return false;
      }
      seen.add(item.dedupeKey);
      return true;
    })
    .sort((a, b) => (Date.parse(a.startsAt || '') || Number.MAX_SAFE_INTEGER) - (Date.parse(b.startsAt || '') || Number.MAX_SAFE_INTEGER));
  return candidates.map((item) => ({
    ...item,
    alreadyPublished: item.publishable && existingKeys.has(item.dedupeKey),
    publishable: item.publishable && !existingKeys.has(item.dedupeKey)
  }));
}

async function runFootballCollection(db, options = {}) {
  const candidates = await collectFootballCandidates(db);
  const published = options.autoPublish === false ? [] : publishCollectedFootball(db, candidates);
  const publishedIds = new Set(published.map((item) => item.id));
  const readyAfterPublish = candidates.filter((item) => item.publishable && !publishedIds.has(item.id));
  const status = {
    lastRunAt: now(),
    nextSource: POLYMARKET_SOCCER_GAMES_URL,
    total: candidates.length,
    collectedReady: candidates.filter((item) => item.publishable).length,
    publishable: readyAfterPublish.length,
    alreadyPublished: candidates.filter((item) => item.alreadyPublished).length,
    skipped: candidates.filter((item) => !item.publishable && !item.alreadyPublished).length,
    published: published.length,
    sources: ['Polymarket soccer games', 'Kalshi soccer', 'API-Football'],
    sourceCounts: candidates.reduce((memo, item) => {
      const key = item.source || 'unknown';
      memo[key] = (memo[key] || 0) + 1;
      return memo;
    }, { 'polymarket-games': 0, polymarket: 0, kalshi: 0, 'api-sports': 0 })
  };
  const storedCandidates = candidates.map((item) => publishedIds.has(item.id)
    ? { ...item, publishable: false, alreadyPublished: true }
    : item);
  db.footballImport = { status, candidates: storedCandidates.slice(0, 250) };
  db.auditLogs ||= [];
  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    action: 'football_auto_collection_run',
    entityType: 'market',
    details: status,
    createdAt: now()
  });
  return { candidates, published, status };
}

function publishCollectedFootball(db, candidates, selectedIds = []) {
  const selected = new Set(selectedIds);
  const existingKeys = new Set((db.markets || []).filter((item) => item.type === 'football').map(eventKey));
  const published = [];
  candidates.forEach((candidate) => {
    if (!candidate.publishable) return;
    if (selected.size && !selected.has(candidate.id)) return;
    if (existingKeys.has(candidate.dedupeKey || eventKey(candidate))) return;
    const market = { ...candidate };
    delete market.publishable;
    delete market.alreadyPublished;
    delete market.skipReason;
    market.status = market.status === 'live' ? 'live' : 'upcoming';
    market.importedAt = now();
    market.updatedAt = now();
    db.markets ||= [];
    db.markets.push(market);
    existingKeys.add(eventKey(market));
    published.push(market);
  });
  db.auditLogs ||= [];
  if (published.length) {
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_import_published',
      entityType: 'market',
      details: { count: published.length, ids: published.map((item) => item.id) },
      createdAt: now()
    });
  }
  return published;
}

function isReadyForResultPull(market, at = new Date()) {
  if (market.type !== 'football' || market.status === 'settled') return false;
  if ((market.settlement || {}).status === 'settled') return false;
  const start = Date.parse(market.startsAt || '');
  if (!Number.isFinite(start)) return false;
  return at.getTime() >= start + (FOOTBALL_REGULATION_MINUTES + MATCH_WINDOW_MINUTES) * 60 * 1000;
}

function optionForScore(market, score) {
  const label = `${score.home}-${score.away}`;
  return (market.options || []).find((option) => option.groupKey === 'correct_score' && option.label === label)
    || (market.options || []).find((option) => option.groupKey === 'match_result' && (
      (score.home > score.away && option.sortOrder === 1) ||
      (score.home === score.away && option.sortOrder === 2) ||
      (score.home < score.away && option.sortOrder === 3)
    ));
}

async function runFootballSettlement(db) {
  const due = (db.markets || []).filter((market) => isReadyForResultPull(market));
  const settled = [];
  const pending = [];
  for (const market of due) {
    const oracle = await resolveFootballResult(market).catch((error) => ({ status: 'pending', reason: error.message || 'oracle_error' }));
    recordOracleResult(db, market, oracle);
    if (oracle.status !== 'final') {
      market.oracleStatus = oracle.reason || 'result_not_available';
      market.oracleCheckedAt = now();
      pending.push({ id: market.id, title: market.title, reason: market.oracleStatus });
      continue;
    }
    const result = settleFootballMarket(db, market, oracle.score, { source: oracle.source, sourceId: oracle.sourceId });
    market.resultPulledAt = now();
    market.resultSource = oracle.source;
    market.oracleStatus = 'settled';
    settled.push({ marketId: market.id, title: market.title, score: oracle.score, result });
  }
  if (settled.length || pending.length) {
    db.auditLogs ||= [];
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'football_auto_settlement_run',
      entityType: 'market',
      details: { settled: settled.length, pending: pending.length },
      createdAt: now()
    });
  }
  return { settled, pending, checkedAt: now() };
}

function fixtureIdFromMarket(market = {}) {
  const external = String(market.externalId || market.id || '');
  const direct = external.match(/^\d+$/);
  if (direct) return direct[0];
  const fromId = external.match(/api-football-(\d+)/i);
  return fromId ? fromId[1] : null;
}

function scoreFromFixture(fixture) {
  const status = String(fixture?.fixture?.status?.short || '').toUpperCase();
  if (!FINISHED_STATUS.has(status)) {
    return { status: 'pending', reason: `fixture_${status || 'not_finished'}` };
  }
  const home = fixture.goals?.home;
  const away = fixture.goals?.away;
  if (!Number.isFinite(Number(home)) || !Number.isFinite(Number(away))) {
    return { status: 'pending', reason: 'score_missing' };
  }
  return {
    status: 'final',
    score: { home: Number(home), away: Number(away) },
    sourceStatus: status
  };
}

function marketTeamNames(market) {
  const home = (market.participants || []).find((item) => item.role === 'home')?.name || '';
  const away = (market.participants || []).find((item) => item.role === 'away')?.name || '';
  return { home: canonicalTeamName(home).toLowerCase(), away: canonicalTeamName(away).toLowerCase() };
}

function teamsMatchFixture(market, fixture) {
  const teams = marketTeamNames(market);
  const home = canonicalTeamName(fixture?.teams?.home?.name || '').toLowerCase();
  const away = canonicalTeamName(fixture?.teams?.away?.name || '').toLowerCase();
  return teams.home && teams.away && home && away && (
    (home.includes(teams.home) || teams.home.includes(home)) &&
    (away.includes(teams.away) || teams.away.includes(away))
  );
}

async function fetchApiSportsFixtureById(fixtureId) {
  if (!fixtureId) return null;
  const data = await fetchApiSports('fixtures', { id: fixtureId, timezone: 'Asia/Shanghai' }, 9000);
  return data?.response?.[0] || null;
}

async function fetchApiSportsFixtureByTeams(market) {
  const date = Number.isNaN(Date.parse(market.startsAt || '')) ? null : new Date(market.startsAt).toISOString().slice(0, 10);
  if (!date) return null;
  const data = await fetchApiSports('fixtures', { date, timezone: 'Asia/Shanghai' }, 10000);
  return (data?.response || []).find((fixture) => teamsMatchFixture(market, fixture)) || null;
}

async function resolveFootballResult(market) {
  const fixtureId = fixtureIdFromMarket(market);
  let fixture = await fetchApiSportsFixtureById(fixtureId).catch(() => null);
  let sourceId = fixtureId;
  if (!fixture) {
    fixture = await fetchApiSportsFixtureByTeams(market).catch(() => null);
    sourceId = fixture?.fixture?.id ? String(fixture.fixture.id) : null;
  }
  if (!fixture) return { status: 'pending', reason: 'fixture_not_found', source: 'api-sports', sourceId };
  const parsed = scoreFromFixture(fixture);
  if (parsed.status !== 'final') return { ...parsed, source: 'api-sports', sourceId: String(fixture.fixture?.id || sourceId || '') };
  return {
    status: 'final',
    score: parsed.score,
    source: 'api-sports',
    sourceId: String(fixture.fixture?.id || sourceId || ''),
    sourceStatus: parsed.sourceStatus,
    raw: {
      league: fixture.league?.name,
      home: fixture.teams?.home?.name,
      away: fixture.teams?.away?.name,
      date: fixture.fixture?.date
    }
  };
}

function recordOracleResult(db, market, oracle) {
  db.oracleResults ||= [];
  db.oracleResults.unshift({
    id: `orc_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    marketId: market.id,
    title: market.title,
    source: oracle.source || 'api-sports',
    sourceId: oracle.sourceId || fixtureIdFromMarket(market),
    status: oracle.status,
    reason: oracle.reason || null,
    score: oracle.score || null,
    raw: oracle.raw || null,
    checkedAt: now()
  });
  db.oracleResults = db.oracleResults.slice(0, 500);
}

module.exports = {
  collectFootballCandidates,
  publishCollectedFootball,
  runFootballCollection,
  runFootballSettlement,
  isReadyForResultPull,
  resolveFootballResult
};
