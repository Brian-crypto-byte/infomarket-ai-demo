const { sendJson, sendError } = require('../utils');

const cache = new Map();
const TEAM_ALIASES = {
  'Man Utd': 'Manchester United',
  'Man United': 'Manchester United',
  'Man City': 'Manchester City',
  'Forest': 'Nottingham Forest',
  'PSG': 'Paris Saint-Germain',
  'Spurs': 'Tottenham',
  'Wolves': 'Wolverhampton Wanderers',
  'Inter Milan': 'Inter',
  'CF Cruz Azul': 'Cruz Azul',
  'Cruz Azul': 'Cruz Azul',
  'Pumas de la UNAM': 'Pumas UNAM',
  'Pumas UNAM': 'Pumas UNAM',
  'Club Universidad Nacional': 'Pumas UNAM'
  , Ajax: 'Ajax'
  , 'AFC Ajax': 'Ajax'
  , Groningen: 'Groningen'
  , 'FC Groningen': 'Groningen'
  , Utrecht: 'Utrecht'
  , 'FC Utrecht': 'Utrecht'
  , Heerenveen: 'Heerenveen'
  , 'SC Heerenveen': 'Heerenveen'
  , 'Brøndby IF': 'Brondby'
  , Brondby: 'Brondby'
  , 'FC København': 'FC Copenhagen'
  , 'F.C. Copenhagen': 'FC Copenhagen'
  , 'Ind. Medellin': 'Independiente Medellin'
  , 'Independiente Medellín': 'Independiente Medellin'
  , 'Maghreb AS de Fès': 'Maghreb Fes'
  , 'Maghreb AS de Fes': 'Maghreb Fes'
  , 'MAS de Fès': 'Maghreb Fes'
  , 'IR Tanger': 'Ittihad Tanger'
  , 'Kawkab AC': 'Kawkab Marrakech'
  , 'COD Meknès': 'COD Meknes'
  , UnionTouargaSports: 'Union Touarga'
  , 'US Yacoub El Mansour': 'US Yacoub El Mansour'
};

const LEAGUE_ALIASES = {
  EPL: 'English Premier League',
  'Premier League': 'English Premier League',
  'English Premier League': 'English Premier League',
  UCL: 'UEFA Champions League',
  'Champions League': 'UEFA Champions League',
  'UEFA Champions League': 'UEFA Champions League',
  'Ligue 1': 'French Ligue 1',
  'Serie A': 'Italian Serie A',
  Bundesliga: 'German Bundesliga',
  'La Liga': 'Spanish La Liga',
  MLS: 'American Major League Soccer'
};
const LEAGUE_IDS = {
  'English Premier League': '4328',
  'UEFA Champions League': '4480',
  'French Ligue 1': '4334',
  'Italian Serie A': '4332',
  'German Bundesliga': '4331',
  'Spanish La Liga': '4335',
  'American Major League Soccer': '4346'
};
const API_SPORTS_LEAGUE_IDS = {
  'English Premier League': 39,
  'UEFA Champions League': 2,
  'French Ligue 1': 61,
  'Italian Serie A': 135,
  'German Bundesliga': 78,
  'Spanish La Liga': 140,
  'American Major League Soccer': 253,
  'K League 1': 292,
  'K League': 292
};
const LEAGUE_COUNTRIES = ['England', 'Europe', 'France', 'Spain', 'Italy', 'Germany', 'United States', 'Mexico', 'Netherlands', 'Saudi Arabia', 'Japan', 'Turkey', 'Brazil'];
const KNOWN_TEAM_LOGOS = {
  'Cruz Azul': 'https://commons.wikimedia.org/wiki/Special:FilePath/Cruz%20Azul%202026.png',
  'CF Cruz Azul': 'https://commons.wikimedia.org/wiki/Special:FilePath/Cruz%20Azul%202026.png',
  'Pumas UNAM': 'https://commons.wikimedia.org/wiki/Special:FilePath/Club%20Universidad%20Nacional%20logo.svg',
  'Pumas de la UNAM': 'https://commons.wikimedia.org/wiki/Special:FilePath/Club%20Universidad%20Nacional%20logo.svg',
  'Club Universidad Nacional': 'https://commons.wikimedia.org/wiki/Special:FilePath/Club%20Universidad%20Nacional%20logo.svg',
  Ajax: 'https://commons.wikimedia.org/wiki/Special:FilePath/AFC%20Ajax.svg',
  'AFC Ajax': 'https://commons.wikimedia.org/wiki/Special:FilePath/AFC%20Ajax.svg',
  Groningen: 'https://commons.wikimedia.org/wiki/Special:FilePath/FC%20Groningen%20logo.svg',
  'FC Groningen': 'https://commons.wikimedia.org/wiki/Special:FilePath/FC%20Groningen%20logo.svg',
  Utrecht: 'https://commons.wikimedia.org/wiki/Special:FilePath/FC%20Utrecht%20logo.svg',
  'FC Utrecht': 'https://commons.wikimedia.org/wiki/Special:FilePath/FC%20Utrecht%20logo.svg',
  Heerenveen: 'https://commons.wikimedia.org/wiki/Special:FilePath/SC%20Heerenveen%20logo.svg',
  'SC Heerenveen': 'https://commons.wikimedia.org/wiki/Special:FilePath/SC%20Heerenveen%20logo.svg',
  'Independiente Medellin': 'https://commons.wikimedia.org/wiki/Special:FilePath/Escudo%20del%20Deportivo%20Independiente%20Medell%C3%ADn.svg'
};

function apiSportsKey() {
  return process.env.API_SPORTS_KEY || process.env.APISPORTS_KEY || process.env.API_FOOTBALL_KEY;
}

function normalizeName(value, aliases) {
  const text = String(value || '').trim();
  return aliases[text] || text;
}

function logoSearchVariants(value = '') {
  const text = String(value || '').trim();
  const stripped = text
    .replace(/^CF\s+/i, '')
    .replace(/\s+FC$/i, '')
    .replace(/\s+F\.?C\.?$/i, '')
    .replace(/\s+Club$/i, '')
    .replace(/\s+de la UNAM$/i, ' UNAM')
    .trim();
  return Array.from(new Set([text, stripped, text.replace(/\bCF\b|\bFC\b/gi, '').replace(/\s+/g, ' ').trim()].filter(Boolean)));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'infomarket.ai/0.1' },
    signal: AbortSignal.timeout(6000)
  });
  return response.ok ? response.json() : null;
}

async function fetchApiSports(path, params) {
  const key = apiSportsKey();
  if (!key) return null;
  const url = new URL(`https://v3.football.api-sports.io/${path}`);
  Object.entries(params || {}).forEach(([name, value]) => {
    if (value) url.searchParams.set(name, value);
  });
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': key,
      'x-rapidapi-key': key,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    },
    signal: AbortSignal.timeout(7000)
  });
  if (!response.ok) return null;
  return response.json();
}

function commonsFileUrl(file) {
  return file ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}` : null;
}

function similarEnough(resultName, query) {
  const a = String(resultName || '').toLowerCase().replace(/football club|f\.c\.|fc|club|the|[^a-z0-9]/g, '');
  const b = String(query || '').toLowerCase().replace(/football club|f\.c\.|fc|club|the|[^a-z0-9]/g, '');
  return a && b && (a.includes(b) || b.includes(a));
}

async function findWikidataImage(name, suffix = '') {
  let hit = null;
  for (const variant of logoSearchVariants(name)) {
    for (const search of [`${variant} ${suffix}`.trim(), variant]) {
      const searchData = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(search)}&language=en&format=json&limit=6`).catch(() => null);
      hit = (searchData?.search || []).find((item) => /football|soccer|association/i.test(item.description || '') && similarEnough(item.label, variant))
        || (searchData?.search || []).find((item) => similarEnough(item.label, variant))
        || searchData?.search?.[0];
      if (hit?.id) break;
    }
    if (hit?.id) break;
  }
  if (!hit?.id) return null;
  const entityData = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${hit.id}.json`);
  const claims = entityData?.entities?.[hit.id]?.claims || {};
  const claim = ['P154', 'P94', 'P41', 'P18'].map((prop) => claims[prop]?.[0]).find(Boolean);
  const file = claim?.mainsnak?.datavalue?.value;
  return file ? { name: hit.label, badge: commonsFileUrl(file), logo: commonsFileUrl(file) } : null;
}

async function findApiSportsTeamLogo(name) {
  const data = await fetchApiSports('teams', { search: name });
  const teams = data?.response || [];
  const item = teams.find((entry) => similarEnough(entry?.team?.name, name)) || teams[0];
  if (!item?.team?.logo) return null;
  return {
    name: item.team.name,
    badge: item.team.logo,
    logo: item.team.logo,
    source: 'api-sports'
  };
}

async function findApiSportsLeagueLogo(name) {
  const leagueId = API_SPORTS_LEAGUE_IDS[name];
  const data = await fetchApiSports('leagues', leagueId ? { id: leagueId } : { search: name });
  const leagues = data?.response || [];
  const item = leagues.find((entry) => similarEnough(entry?.league?.name, name)) || leagues[0];
  if (!item?.league?.logo) return null;
  return {
    name: item.league.name,
    badge: item.league.logo,
    logo: item.league.logo,
    country: item.country?.name || null,
    source: 'api-sports'
  };
}

function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return Promise.resolve(hit.value);
  return loader().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return value;
  });
}

async function findTeamLogo(name) {
  const query = normalizeName(name, TEAM_ALIASES);
  return cached(`team:${query.toLowerCase()}`, async () => {
    const known = KNOWN_TEAM_LOGOS[query] || KNOWN_TEAM_LOGOS[name];
    if (known) return { name: query, badge: known, logo: known, source: 'known-logo' };

    const apiSportsLogo = await findApiSportsTeamLogo(query).catch(() => null);
    if (apiSportsLogo) return apiSportsLogo;

    for (const variant of logoSearchVariants(query)) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(variant)}`;
      const data = await fetchJson(url).catch(() => null);
      const team = (data?.teams || []).find((item) => item.strSport === 'Soccer' && similarEnough(item.strTeam, variant)) || data?.teams?.[0];
      if (team && similarEnough(team.strTeam, variant)) return {
        name: team.strTeam,
        badge: team.strBadge || team.strLogo || null,
        logo: team.strLogo || team.strBadge || null,
        color1: team.strColour1 || null,
        color2: team.strColour2 || null
      };
    }
    return findWikidataImage(query, 'football club');
  });
}

async function findLeagueLogo(name) {
  const query = normalizeName(name, LEAGUE_ALIASES);
  return cached(`league:${query.toLowerCase()}`, async () => {
    const apiSportsLogo = await findApiSportsLeagueLogo(query).catch(() => null);
    if (apiSportsLogo) return apiSportsLogo;

    if (LEAGUE_IDS[query]) {
      const lookup = await fetchJson(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${LEAGUE_IDS[query]}`);
      const league = lookup?.leagues?.[0];
      if (league) {
        return {
          name: league.strLeague,
          badge: league.strBadge || league.strLogo || null,
          logo: league.strLogo || league.strBadge || null
        };
      }
    }
    const results = await Promise.all(LEAGUE_COUNTRIES.map((country) =>
      fetchJson(`https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=${encodeURIComponent(country)}&s=Soccer`).catch(() => null)
    ));
    const leagues = results.flatMap((data) => data?.countries || []);
    const lower = query.toLowerCase();
    const league = leagues.find((item) => String(item.strLeague || '').toLowerCase() === lower)
      || leagues.find((item) => String(item.strLeague || '').toLowerCase().includes(lower))
      || leagues.find((item) => String(item.strLeagueAlternate || '').toLowerCase().includes(lower));
    if (league) return {
      name: league.strLeague,
      badge: league.strBadge || league.strLogo || null,
      logo: league.strLogo || league.strBadge || null
    };
    return findWikidataImage(query, 'football league logo');
  });
}

async function handleLogos(req, res, pathname, url) {
  if (req.method !== 'GET') return false;

  if (pathname === '/logos/status') {
    return sendJson(res, 200, {
      apiSportsConfigured: Boolean(apiSportsKey()),
      primary: apiSportsKey() ? 'api-sports' : 'public-fallback',
      fallback: ['thesportsdb', 'wikidata']
    });
  }

  if (pathname === '/logos/team') {
    const name = url.searchParams.get('name');
    if (!name) return sendError(res, 400, 'Missing team name');
    return sendJson(res, 200, { logo: await findTeamLogo(name) });
  }

  if (pathname === '/logos/league') {
    const name = url.searchParams.get('name');
    if (!name) return sendError(res, 400, 'Missing league name');
    return sendJson(res, 200, { logo: await findLeagueLogo(name) });
  }

  return false;
}

module.exports = { handleLogos };
