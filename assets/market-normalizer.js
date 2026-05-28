window.InfoMarketNormalize = {
  formatVolume(value) {
    const amount = Number(value || 0);
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `${amount.toFixed(0)} USDT`;
  },
  fromApi(apiMarket) {
    if (!apiMarket || apiMarket.home) return apiMarket;
    const home = apiMarket.participants?.find((item) => item.role === 'home') || { name: 'Home', logo: 'H', shortCode: 'H' };
    const away = apiMarket.participants?.find((item) => item.role === 'away') || { name: 'Away', logo: 'A', shortCode: 'A' };
    const resultOptions = (apiMarket.options || []).filter((option) =>
      option.groupKey === 'match_result' ||
      option.groupKey === 'crypto_direction' ||
      option.groupKey === 'binary_outcome'
    );
    const scoreOptions = (apiMarket.options || []).filter((option) => option.groupKey === 'correct_score');
    const firstOption = resultOptions[0] || apiMarket.options?.[0] || {};
    const isCrypto = apiMarket.type === 'crypto';
    const isBinary = apiMarket.type === 'binary';
    return {
      id: apiMarket.id,
      type: apiMarket.type,
      logo: apiMarket.leagueLogo || apiMarket.league?.slice(0, 3).toUpperCase() || apiMarket.type?.slice(0, 3).toUpperCase() || 'IM',
      league: apiMarket.league || apiMarket.category || 'Market',
      title: apiMarket.title,
      startsAt: apiMarket.startsAt ? new Date(apiMarket.startsAt).toLocaleString() : 'Pending',
      rawStartsAt: apiMarket.startsAt,
      status: apiMarket.status === 'live' ? 'Live' : apiMarket.status,
      volume: this.formatVolume(apiMarket.volumeUsdt),
      score: apiMarket.score,
      category: apiMarket.category || 'trending',
      sport: apiMarket.sport || (apiMarket.type === 'football' ? 'soccer' : ''),
      source: apiMarket.source || apiMarket.oddsSource?.provider || '',
      sourceUrl: apiMarket.sourceUrl || '',
      kind: isBinary ? 'binary' : (isCrypto ? 'crypto' : 'football'),
      home: { name: isCrypto ? 'Up' : home.name, short: home.shortCode, logo: home.logo || home.shortCode || 'H', color: 'red', record: '' },
      away: { name: isCrypto ? 'Down' : away.name, short: away.shortCode, logo: away.logo || away.shortCode || 'A', color: 'blue', record: '' },
      odds: resultOptions.map((option, index) => ({
        id: option.id,
        label: apiMarket.type === 'football'
          ? (option.sortOrder === 1 || index === 0 ? 'Home' : (option.sortOrder === 2 || index === 1 ? 'Draw' : 'Away'))
          : option.label,
        yes: option.yesOdds,
        no: option.noOdds,
        price: option.upOdds || option.downOdds
      })),
      scores: scoreOptions.map((option) => ({
        id: option.id,
        label: option.label,
        yes: option.yesOdds,
        no: option.noOdds,
        sellable: option.sellable
      })),
      detail: {
        bestPick: isCrypto ? (firstOption.label || 'Up') : `${firstOption.label || 'Home'} YES`,
        bestPrice: Number(firstOption.yesOdds || firstOption.upOdds || firstOption.downOdds || 1),
        timeLeft: apiMarket.status === 'live' ? 'Live' : 'Pending',
        lobsterReward: 0,
        insuranceCover: isCrypto ? '30% cover' : '40% cover'
      }
    };
  }
};
