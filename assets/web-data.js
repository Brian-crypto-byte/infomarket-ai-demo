const FOOTBALL_SCORE_ORDER = [
  [0, 0], [1, 0], [0, 1], [1, 1], [2, 0],
  [0, 2], [2, 1], [1, 2], [2, 2], [3, 0],
  [0, 3], [3, 1], [1, 3], [3, 2], [2, 3],
  [3, 3], [4, 0], [0, 4], [4, 1], [1, 4],
  [4, 2], [2, 4], [4, 3], [3, 4], [4, 4]
];

const FOOTBALL_SCORES = FOOTBALL_SCORE_ORDER.map(([home, away]) => ({
  id: `score-${home}-${away}`,
  label: `${home}-${away}`,
  yes: Number((5.2 + home * 1.35 + away * 1.52 + Math.abs(home - away) * 0.82).toFixed(2)),
  no: Number((1.035 + (home + away) * 0.007 + Math.abs(home - away) * 0.004).toFixed(2)),
  sellable: false
}));

window.INFOMARKET_DATA = {
  markets: [
    {
      id: 'manutd-forest',
      type: 'football',
      logo: 'EPL',
      league: 'EPL',
      title: 'Man Utd vs Forest',
      startsAt: '2H - 90',
      status: 'Live',
      volume: '$6.45M',
      viewCount: 55,
      score: { home: 3, away: 2 },
      home: { name: 'Man Utd', short: 'MUN', logo: 'MU', color: 'red', record: '18-11-7' },
      away: { name: 'Forest', short: 'NFO', logo: 'NF', color: 'red', record: '11-10-15' },
      odds: [
        { id: 'home', label: 'MUN', cents: '91.6c', yes: 1.09, no: 11.9, tone: 'red' },
        { id: 'draw', label: 'DRAW', cents: '9.7c', yes: 10.3, no: 1.11, tone: 'neutral' },
        { id: 'away', label: 'NFO', cents: '0.2c', yes: 500, no: 1.002, tone: 'red' }
      ],
      scores: FOOTBALL_SCORES,
      detail: { bestPick: 'MUN YES', bestPrice: 1.09, timeLeft: '00:00', infCredits: 84.5, insuranceCover: '40% cover' }
    },
    {
      id: 'inter-verona',
      type: 'football',
      logo: 'SA',
      league: 'Serie A',
      title: 'Inter Milan vs Verona',
      startsAt: '1H - 21',
      status: 'Live',
      volume: '$364.42K',
      viewCount: 51,
      score: { home: 0, away: 0 },
      home: { name: 'Inter Milan', short: 'INT', logo: 'INT', color: 'blue', record: '27-4-5' },
      away: { name: 'Verona', short: 'VER', logo: 'VER', color: 'navy', record: '3-11-22' },
      odds: [
        { id: 'home', label: 'INT', cents: '69c', yes: 1.45, no: 3.22, tone: 'purple' },
        { id: 'draw', label: 'DRAW', cents: '23c', yes: 4.35, no: 1.3, tone: 'neutral' },
        { id: 'away', label: 'VER', cents: '11c', yes: 9.09, no: 1.13, tone: 'navy' }
      ],
      scores: FOOTBALL_SCORES,
      detail: { bestPick: 'INT YES', bestPrice: 1.45, timeLeft: '68:40', infCredits: 42.5, insuranceCover: '35% cover' }
    },
    {
      id: 'wolves-fulham',
      type: 'football',
      logo: 'EPL',
      league: 'EPL',
      title: 'Wolves vs Fulham',
      startsAt: '22:00',
      status: 'Upcoming',
      volume: '$3.83M',
      viewCount: 56,
      home: { name: 'Wolves', short: 'WOL', logo: 'WOL', color: 'gold', record: '3-9-24' },
      away: { name: 'Fulham', short: 'FUL', logo: 'FUL', color: 'red', record: '14-6-16' },
      odds: [
        { id: 'home', label: 'WOL', cents: '23c', yes: 4.35, no: 1.3, tone: 'gold' },
        { id: 'draw', label: 'DRAW', cents: '26c', yes: 3.85, no: 1.35, tone: 'neutral' },
        { id: 'away', label: 'FUL', cents: '53c', yes: 1.89, no: 2.13, tone: 'blue' }
      ],
      scores: FOOTBALL_SCORES,
      detail: { bestPick: 'FUL YES', bestPrice: 1.89, timeLeft: '05:22', infCredits: 55.2, insuranceCover: '40% cover' }
    },
    {
      id: 'leeds-brighton',
      type: 'football',
      logo: 'EPL',
      league: 'EPL',
      title: 'Leeds vs Brighton',
      startsAt: '22:00',
      status: 'Upcoming',
      volume: '$335.59K',
      viewCount: 54,
      home: { name: 'Leeds', short: 'LEE', logo: 'LEE', color: 'gold', record: '10-14-12' },
      away: { name: 'Brighton', short: 'BRI', logo: 'BRI', color: 'blue', record: '14-11-11' },
      odds: [
        { id: 'home', label: 'LEE', cents: '28c', yes: 3.57, no: 1.39, tone: 'gold' },
        { id: 'draw', label: 'DRAW', cents: '27c', yes: 3.7, no: 1.37, tone: 'neutral' },
        { id: 'away', label: 'BRI', cents: '47c', yes: 2.13, no: 1.89, tone: 'blue' }
      ],
      scores: FOOTBALL_SCORES,
      detail: { bestPick: 'BRI YES', bestPrice: 2.13, timeLeft: '05:22', infCredits: 35.7, insuranceCover: '35% cover' }
    },
    {
      id: 'seoul-anyang',
      type: 'football',
      logo: 'K',
      league: 'K League',
      title: 'Seoul vs Anyang',
      startsAt: '2026/5/5 18:00',
      status: 'Live',
      volume: '318,420 USDT',
      home: { name: 'Seoul', logo: 'SEO', color: 'red' },
      away: { name: 'Anyang', logo: 'ANY', color: 'purple' },
      odds: [
        { id: 'home', label: 'Home', yes: 1.7, no: 2.18, sideLabel: 'YES/NO' },
        { id: 'draw', label: 'Draw', yes: 3.5, no: 1.31, sideLabel: 'YES/NO' },
        { id: 'away', label: 'Away', yes: 4.75, no: 1.19, sideLabel: 'YES/NO' }
      ],
      scores: FOOTBALL_SCORES,
      detail: {
        bestPick: 'Home YES',
        bestPrice: 1.7,
        timeLeft: '04:03',
        infCredits: 62.5,
        insuranceCover: '40% cover'
      }
    },
    {
      id: 'national-noida',
      type: 'football',
      logo: 'PL',
      league: 'Premier League',
      title: 'National Union vs Noida City',
      startsAt: '2026/5/5 20:30',
      status: 'Live',
      volume: '96,115 USDT',
      home: { name: 'National', logo: 'NU', color: 'blue' },
      away: { name: 'Noida', logo: 'NC', color: 'navy' },
      odds: [
        { id: 'home', label: 'Home', yes: 2.12, no: 1.89, sideLabel: 'YES/NO' },
        { id: 'draw', label: 'Draw', yes: 3.24, no: 1.34, sideLabel: 'YES/NO' },
        { id: 'away', label: 'Away', yes: 3.18, no: 1.36, sideLabel: 'YES/NO' }
      ],
      scores: FOOTBALL_SCORES.map((score) => ({ ...score, yes: Number((score.yes * 0.94 + 0.55).toFixed(2)) })),
      detail: {
        bestPick: 'Home YES',
        bestPrice: 2.12,
        timeLeft: '08:21',
        infCredits: 48.2,
        insuranceCover: '35% cover'
      }
    },
    {
      id: 'btc-68000',
      type: 'crypto',
      logo: 'BTC',
      league: 'Crypto',
      title: 'Will BTC close above 68,000 USDT today?',
      startsAt: 'UTC close',
      status: 'Today',
      volume: '184,900 USDT',
      home: { name: 'Up', logo: 'BTC', color: 'blue' },
      away: { name: 'Down', logo: 'USD', color: 'navy' },
      odds: [
        { id: 'up', label: 'Up', price: 1.74, sideLabel: 'UP' },
        { id: 'down', label: 'Down', price: 2.06, sideLabel: 'DOWN' },
        { id: 'reward', label: 'INF reward', priceLabel: '1.25x' }
      ],
      scores: [],
      detail: {
        bestPick: 'Up',
        bestPrice: 1.74,
        timeLeft: '02:18',
        infCredits: 58.4,
        insuranceCover: '30% cover'
      }
    }
  ]
};
