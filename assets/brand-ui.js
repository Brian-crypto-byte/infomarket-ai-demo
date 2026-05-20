(function () {
  const colors = [
    ['#1f5eff', '#0f172a'],
    ['#d44b3c', '#7c1d1d'],
    ['#0f9f6e', '#064e3b'],
    ['#c58a27', '#713f12'],
    ['#5865f2', '#312e81'],
    ['#64748b', '#111827'],
    ['#e25373', '#7f1d1d'],
    ['#2563eb', '#0f766e']
  ];

  const teamAliases = {
    'Manchester United': 'MUN',
    'Man Utd': 'MUN',
    'Manchester City': 'MCI',
    'Man City': 'MCI',
    'Arsenal': 'ARS',
    'Chelsea': 'CHE',
    'Liverpool': 'LIV',
    'Tottenham': 'TOT',
    'Brentford': 'BRE',
    'Bournemouth': 'BOU',
    'Brighton': 'BRI',
    'Burnley': 'BUR',
    'Crystal Palace': 'CRY',
    'Aston Villa': 'AVL',
    'PSG': 'PSG',
    'Nantes': 'NAN',
    'Toulouse': 'TOU',
    'Forest': 'NFO'
  };

  const leagueAliases = {
    'Premier League': 'EPL',
    'English Premier League': 'EPL',
    'Champions League': 'UCL',
    'UEFA Champions League': 'UCL',
    'Ligue 1': 'L1',
    'La Liga': 'LL',
    'Serie A': 'SA',
    'Bundesliga': 'BUN',
    'MLS': 'MLS',
    'Soccer': 'SOC',
    'Crypto': 'BTC'
  };

  const localTeamLogos = {
    'Manchester United': 'manchester-united', 'Man Utd': 'manchester-united', 'Man United': 'manchester-united', MU: 'manchester-united', MUN: 'manchester-united',
    'Manchester City': 'manchester-city', 'Man City': 'manchester-city', MC: 'manchester-city', MCI: 'manchester-city',
    Arsenal: 'arsenal', ARS: 'arsenal', Chelsea: 'chelsea', CHE: 'chelsea', Tottenham: 'tottenham', Spurs: 'tottenham', TOT: 'tottenham',
    Liverpool: 'liverpool', LIV: 'liverpool', 'West Ham': 'west-ham', 'West Ham United': 'west-ham', WH: 'west-ham', WHU: 'west-ham',
    Bournemouth: 'bournemouth', 'AFC Bournemouth': 'bournemouth', BOU: 'bournemouth', 'Aston Villa': 'aston-villa', AV: 'aston-villa', AVL: 'aston-villa',
    'Crystal Palace': 'crystal-palace', CP: 'crystal-palace', CRY: 'crystal-palace', Brighton: 'brighton', BRI: 'brighton',
    Brentford: 'brentford', BRE: 'brentford', Fulham: 'fulham', FUL: 'fulham', Wolves: 'wolves', Wolverhampton: 'wolves', WOL: 'wolves',
    Leeds: 'leeds-united', 'Leeds United': 'leeds-united', LEE: 'leeds-united', Everton: 'everton', EVE: 'everton', Newcastle: 'newcastle', 'Newcastle United': 'newcastle', NEW: 'newcastle',
    Forest: 'nottingham-forest', Nottingham: 'nottingham-forest', 'Nottingham Forest': 'nottingham-forest', NF: 'nottingham-forest', NFO: 'nottingham-forest',
    Burnley: 'burnley', BUR: 'burnley', Sunderland: 'sunderland', SUN: 'sunderland',
    PSG: 'psg', 'Paris Saint-Germain': 'psg', Barcelona: 'barcelona', BAR: 'barcelona', 'Real Madrid': 'real-madrid',
    Ajax: null, Groningen: null, Utrecht: null, Heerenveen: null,
    Nantes: 'nantes', NAN: 'nantes', Toulouse: 'toulouse', TOU: 'toulouse', Bilbao: 'athletic-bilbao', 'Athletic Bilbao': 'athletic-bilbao', BIL: 'athletic-bilbao', Levante: 'levante',
    Atletico: 'atletico-madrid', 'Atletico Madrid': 'atletico-madrid', Valencia: 'valencia', VAL: 'valencia', Sevilla: 'sevilla', SEV: 'sevilla',
    Villarreal: 'villarreal', 'Celta Vigo': 'celta-vigo', 'Real Betis': 'real-betis', Girona: 'girona', Getafe: 'getafe',
    Osasuna: 'osasuna', Mallorca: 'mallorca', Oviedo: 'real-oviedo', OVI: 'real-oviedo', Espanyol: 'espanyol', 'Real Sociedad': 'real-sociedad', Alaves: 'alaves', Elche: 'elche', Vallecano: 'rayo-vallecano',
    Milan: 'milan', 'AC Milan': 'ac-milan', Cagliari: 'cagliari', 'Inter Milan': 'inter-milan', Inter: 'inter-milan',
    Verona: 'verona', 'Hellas Verona': 'hellas-verona', Roma: 'roma', Lecce: 'lecce', Genoa: 'genoa', Torino: 'torino', Juventus: 'juventus', Bologna: 'bologna',
    Napoli: 'napoli', Lazio: 'lazio', Atalanta: 'atalanta', Fiorentina: 'fiorentina', Parma: 'parma', Como: 'como', Sassuolo: 'sassuolo', Udinese: 'udinese', Pisa: 'pisa', Cremonese: 'cremonese',
    Wolfsburg: 'wolfsburg', Paderborn: 'paderborn',
    Seoul: 'seoul', Anyang: 'anyang', Mexico: 'mexico', Ghana: 'ghana'
  };

  function localTeamLogo(label) {
    const slug = localTeamLogos[String(label || '').trim()];
    return slug ? `assets/logos/teams/${slug}.png` : null;
  }

  function hasTeamLogo(label) {
    return Boolean(localTeamLogo(label));
  }

  function hash(value) {
    return String(value || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function initials(value, fallback = 'IM') {
    const text = String(value || fallback).trim();
    const alias = teamAliases[text] || leagueAliases[text];
    if (alias) return alias;
    const words = text.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return fallback;
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.slice(0, 3).map((word) => word[0]).join('').toUpperCase();
  }

  function palette(value) {
    return colors[hash(value) % colors.length];
  }

  function badge(label, options = {}) {
    const localLogo = options.type !== 'league' ? localTeamLogo(label) : null;
    if (localLogo) {
      const title = String(options.title || options.fallback || label || 'logo').replace(/"/g, '&quot;');
      const type = options.type || 'team';
      return `<span class="im-logo im-logo-${type} has-image" title="${title}"><img src="${localLogo}" alt="${title}" loading="lazy" /></span>`;
    }
    if (/^https?:\/\//i.test(String(label || ''))) {
      const title = String(options.title || options.fallback || 'logo').replace(/"/g, '&quot;');
      const type = options.type || 'team';
      return `<span class="im-logo im-logo-${type} has-image" title="${title}"><img src="${label}" alt="${title}" loading="lazy" /></span>`;
    }
    if (options.type === 'event') {
      const title = String(options.title || options.fallback || label || 'team').replace(/"/g, '&quot;');
      return `<span class="im-logo im-logo-event has-image pending-logo" title="${title}" data-logo-kind="team" data-logo-name="${title}"><img src="assets/logos/teams/football-placeholder.svg" alt="${title}" loading="lazy" /></span>`;
    }
    const text = initials(label, options.fallback || 'IM');
    const [a, b] = palette(label || text);
    const type = options.type || 'team';
    const title = String(label || text).replace(/"/g, '&quot;');
    const kind = type === 'league' ? 'league' : 'team';
    return `<span class="im-logo im-logo-${type}" title="${title}" data-logo-kind="${kind}" data-logo-name="${title}" style="--logo-a:${a};--logo-b:${b}"><span>${text}</span></span>`;
  }

  async function resolveLogo(kind, name) {
    if (!window.InfoMarketAPI || !name) return null;
    const key = `infomarket.logo.v3.${kind}.${name}`.toLowerCase();
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached) return cached;
    } catch (_) {}
    try {
      const data = kind === 'league'
        ? await window.InfoMarketAPI.leagueLogo(name)
        : await window.InfoMarketAPI.teamLogo(name);
      const url = data?.logo?.badge || data?.logo?.logo || null;
      if (!url) return null;
      sessionStorage.setItem(key, JSON.stringify(url));
      return url;
    } catch (_) {
      return null;
    }
  }

  function hydrateLogos(root = document) {
    const nodes = Array.from(root.querySelectorAll('.im-logo[data-logo-kind]:not([data-logo-loaded])'));
    nodes.slice(0, 80).forEach(async (node) => {
      node.dataset.logoLoaded = '1';
      const url = await resolveLogo(node.dataset.logoKind, node.dataset.logoName);
      if (!url) return;
      node.classList.add('has-image');
      node.innerHTML = `<img src="${url}" alt="${node.dataset.logoName || ''}" loading="lazy" />`;
    });
  }

  function walletIcon(name) {
    const safeName = String(name || 'Wallet').replace(/"/g, '&quot;');
    const marks = {
      Phantom: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#ab9ff2"/><path fill="#fff" d="M29 13.5c0-2.5-2.5-4.5-6.2-4.5-6.3 0-11.8 5.4-11.8 12.1 0 3.9 2.2 6.9 5.7 6.9 1.9 0 3.4-.8 4.6-2.1.8 1.5 2.4 2.1 4.2 2.1 3.1 0 5.5-2.6 5.5-5.7 0-1.5-.6-2.8-1.7-3.6 1.1-1.2 1.7-3 1.7-5.2Z"/><circle cx="24.4" cy="17.7" r="1.3" fill="#4b3f72"/><circle cx="29.1" cy="17.7" r="1.3" fill="#4b3f72"/></svg>`,
      Backpack: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#111827"/><path fill="#f6b93b" d="M13 16.5A7 7 0 0 1 20 9a7 7 0 0 1 7 7.5V30H13V16.5Z"/><path fill="#fff3d3" d="M16 18h8v8h-8z"/><path stroke="#111827" stroke-width="2" d="M17 14c1.4-1.2 4.6-1.2 6 0"/></svg>`,
      Solflare: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#ff8a00"/><path fill="#fff" d="M20 7l3.1 8.2 8.9.6-6.9 5.5 2.2 8.7-7.3-4.9-7.3 4.9 2.2-8.7L8 15.8l8.9-.6L20 7Z"/></svg>`,
      MetaMask: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#fff3e4"/><path fill="#e2761b" d="M8 10l10 7-2 5-5-2-3-10Zm24 0-10 7 2 5 5-2 3-10Z"/><path fill="#f6851b" d="M18 17h4l2 5-4 3-4-3 2-5Z"/><path fill="#763d16" d="M11 20l5 2 4 9-7-3-2-8Zm18 0-5 2-4 9 7-3 2-8Z"/></svg>`,
      'Coinbase Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#0052ff"/><circle cx="20" cy="20" r="12" fill="#fff"/><path fill="#0052ff" d="M22.7 23.8h-5.4a3.8 3.8 0 1 1 0-7.6h5.4v3h-5.2a.8.8 0 0 0 0 1.6h5.2v3Z"/></svg>`,
      WalletConnect: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#3b99fc"/><path fill="#fff" d="M12 17.4a11.3 11.3 0 0 1 16 0l1.3 1.3-3.5 3.5-1.8-1.8a5.7 5.7 0 0 0-8 0l-1.8 1.8-3.5-3.5 1.3-1.3Z"/></svg>`,
      'OKX Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#111"/><path fill="#fff" d="M10 10h8v8h-8zM22 10h8v8h-8zM10 22h8v8h-8zM22 22h8v8h-8z"/></svg>`,
      'Trust Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#3375bb"/><path fill="#fff" d="M20 8l11 4v8.2c0 6-4.6 10.4-11 12.8-6.4-2.4-11-6.8-11-12.8V12l11-4Z"/><path fill="#3375bb" d="M20 12l7 2.5v5.3c0 3.8-2.7 6.7-7 8.5V12Z"/></svg>`,
      'Binance Web3': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#f0b90b"/><path fill="#111" d="M20 8l5 5-5 5-5-5 5-5Zm-8 8l4 4-4 4-4-4 4-4Zm16 0l4 4-4 4-4-4 4-4Zm-8 6l5 5-5 5-5-5 5-5Z"/></svg>`,
      Rabby: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#8b5cf6"/><path fill="#fff" d="M13 17c0-4 2-8 4.3-8 1.3 0 2.1 1.3 2.7 3 .6-1.7 1.4-3 2.7-3 2.3 0 4.3 4 4.3 8 2.3 1.5 3 3.5 3 5.6 0 4.6-4 8.4-10 8.4s-10-3.8-10-8.4c0-2.1.7-4.1 3-5.6Z"/><circle cx="16.6" cy="22" r="1.3" fill="#111827"/><circle cx="23.4" cy="22" r="1.3" fill="#111827"/></svg>`,
      'Bitget Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#00c2c7"/><path fill="#fff" d="M11 12h11l7 7-7 7H11l7-7-7-7Zm11 2.8L17.8 19l4.2 4.2 4.2-4.2-4.2-4.2Z"/></svg>`,
      TokenPocket: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#2980ff"/><path fill="#fff" d="M11 11h18v6h-6v12h-6V17h-6v-6Z"/></svg>`,
      imToken: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#0ea5e9"/><circle cx="20" cy="20" r="11" fill="#fff"/><path fill="#0ea5e9" d="M14 15h4v11h-4V15Zm8 0h4v11h-4V15Z"/></svg>`,
      'Bybit Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#111827"/><path fill="#f7a600" d="M10 12h6v16h-6zM18 12h5.8c3.7 0 6.2 2.2 6.2 5.4 0 3.3-2.5 5.5-6.2 5.5H23V28h-5V12Z"/><path fill="#111827" d="M23 17h1.2c.8 0 1.3.4 1.3 1.1s-.5 1.2-1.3 1.2H23V17Z"/></svg>`,
      'Gate Wallet': `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#2354e6"/><path fill="#fff" d="M20 9a11 11 0 1 0 9.7 16.2h-9.1v-5h15C35 27.2 28.6 33 20 33a13 13 0 1 1 10.6-20.5l-4.1 3A8 8 0 0 0 20 9Z"/></svg>`,
      Tonkeeper: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#0098ea"/><path fill="#fff" d="M9 12h22L20 31 9 12Zm5 3 6 10 6-10H14Z"/></svg>`,
      Keplr: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#324ce9"/><path fill="#fff" d="M12 10h6v8l7-8h7l-8.4 9.3L32 30h-7.4L18 21.5V30h-6V10Z"/></svg>`,
      Ledger: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#111"/><path fill="#fff" d="M10 10h8v3h-5v5h-3v-8Zm12 0h8v8h-3v-5h-5v-3ZM10 22h3v5h5v3h-8v-8Zm17 0h3v8h-8v-3h5v-5Z"/></svg>`
    };
    const mark = marks[name] || `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="${palette(name)[0]}"/><circle cx="20" cy="20" r="11" fill="#fff"/><path fill="${palette(name)[1]}" d="M14 14h12v12H14z"/></svg>`;
    return `<span class="wallet-mark wallet-logo" title="${safeName}">${mark}</span>`;
  }

  function injectStyles() {
    if (document.getElementById('infomarket-brand-ui')) return;
    const style = document.createElement('style');
    style.id = 'infomarket-brand-ui';
    style.textContent = `
      .im-logo{width:36px;height:36px;border-radius:50%;display:inline-grid;place-items:center;position:relative;flex:0 0 auto;background:linear-gradient(145deg,var(--logo-a),var(--logo-b));box-shadow:inset 0 0 0 1px rgba(255,255,255,.36);overflow:hidden;color:#fff}
      .im-logo::after{content:"";position:absolute;inset:3px;border-radius:inherit;border:1px solid rgba(255,255,255,.28)}
      .im-logo span{position:relative;z-index:1;font-size:10px;font-weight:680;letter-spacing:-.02em}
      .im-logo img{width:100%;height:100%;object-fit:contain;padding:0;display:block}
      .im-logo.has-image{background:transparent;box-shadow:none;border-radius:0}
      .im-logo.has-image::after{display:none}
      .im-logo-league{border-radius:11px;width:30px;height:30px}
      .im-logo-league.has-image{border-radius:0}
      .im-logo-league img{padding:0}
      .im-logo-event{width:58px;height:58px;border-radius:18px}
      .im-logo-event.has-image{width:58px;height:58px;border-radius:0;overflow:hidden}
      .im-logo-event span{font-size:15px}
      .im-logo-event img{width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;padding:0}
      .im-logo-league span{font-size:10px}
      .event-logo .im-logo{width:100%;height:100%;border-radius:18px}
      .event-logo:has(.im-logo.has-image),.team-crest:has(.im-logo.has-image){background:transparent!important;border:0!important;box-shadow:none!important}
      .event-logo .im-logo.has-image,.team-crest .im-logo.has-image{width:100%!important;height:100%!important;border-radius:0!important}
      .event-logo .im-logo.has-image img,.team-crest .im-logo.has-image img{width:100%!important;height:100%!important;object-fit:contain!important}
      .event-logo .im-logo span{font-size:17px}
      .team-badge,.league-badge{background:none!important;border:0!important;color:inherit!important;padding:0!important}
      .versus-team .im-logo-event,.versus-team .im-logo-event img{width:58px!important;height:58px!important;max-width:58px!important;max-height:58px!important;object-fit:contain!important}
      .wallet-mark{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:transparent;color:#fff;font-size:11px;font-weight:720;letter-spacing:-.02em;overflow:hidden;flex:0 0 auto}
      .wallet-logo svg{width:34px;height:34px;display:block}
      .wallet-option span:not(.wallet-mark){width:auto!important;height:auto!important;border-radius:0!important;display:inline!important;background:transparent!important;color:inherit!important;font-size:13px!important}
    `;
    document.head.appendChild(style);
  }

  window.InfoMarketBrand = { badge, walletIcon, initials, injectStyles, hydrateLogos, hasTeamLogo };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
})();
