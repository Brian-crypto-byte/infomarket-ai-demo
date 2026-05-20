const SCORE_ORDER = [
  [0, 0], [1, 0], [0, 1], [1, 1], [2, 0],
  [0, 2], [2, 1], [1, 2], [2, 2], [3, 0],
  [0, 3], [3, 1], [1, 3], [3, 2], [2, 3],
  [3, 3], [4, 0], [0, 4], [4, 1], [1, 4],
  [4, 2], [2, 4], [4, 3], [3, 4], [4, 4]
];

const SCORE_SET = new Set(SCORE_ORDER.map(([home, away]) => `${home}-${away}`));

function roundOdds(value) {
  const odds = Number(value);
  if (!Number.isFinite(odds)) return 1.01;
  return Number(Math.min(150, Math.max(1.01, odds)).toFixed(2));
}

function safeProbability(value, fallback = 0.02) {
  const probability = Number(value);
  if (!Number.isFinite(probability)) return fallback;
  return Math.min(0.985, Math.max(0.001, probability));
}

function oddsToProbability(odds) {
  const value = Number(odds);
  if (!Number.isFinite(value) || value <= 1) return null;
  return 1 / value;
}

function probabilityToOdds(probability, margin = 0.06) {
  const p = safeProbability(probability);
  const edge = p < 0.5 ? p * margin : (1 - p) * margin * 0.35;
  const quotedProbability = Math.min(0.985, p + edge);
  return roundOdds(1 / quotedProbability);
}

function yesNoOdds(probability, margin = 0.06) {
  const p = safeProbability(probability);
  return {
    yesOdds: probabilityToOdds(p, margin),
    noOdds: probabilityToOdds(1 - p, margin)
  };
}

function noOddsFromYes(yesOdds, margin = 0.06) {
  const p = oddsToProbability(yesOdds);
  if (!p) return 1.01;
  return yesNoOdds(p, margin).noOdds;
}

function factorial(value) {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poisson(lambda, goals) {
  return Math.exp(-lambda) * Math.pow(lambda, goals) / factorial(goals);
}

function dixonColesTau(homeGoals, awayGoals, lambdaHome, lambdaAway, rho = -0.08) {
  if (homeGoals === 0 && awayGoals === 0) return Math.max(0.75, 1 - lambdaHome * lambdaAway * rho);
  if (homeGoals === 0 && awayGoals === 1) return Math.max(0.75, 1 + lambdaHome * rho);
  if (homeGoals === 1 && awayGoals === 0) return Math.max(0.75, 1 + lambdaAway * rho);
  if (homeGoals === 1 && awayGoals === 1) return Math.max(0.75, 1 - rho);
  return 1;
}

function scoreDistribution(lambdaHome, lambdaAway, maxGoals = 10) {
  const matrix = [];
  let total = 0;
  for (let home = 0; home <= maxGoals; home += 1) {
    matrix[home] = [];
    for (let away = 0; away <= maxGoals; away += 1) {
      const probability = poisson(lambdaHome, home) * poisson(lambdaAway, away) * dixonColesTau(home, away, lambdaHome, lambdaAway);
      matrix[home][away] = probability;
      total += probability;
    }
  }
  for (let home = 0; home <= maxGoals; home += 1) {
    for (let away = 0; away <= maxGoals; away += 1) {
      matrix[home][away] /= total;
    }
  }
  return matrix;
}

function resultProbabilities(matrix) {
  let home = 0;
  let draw = 0;
  let away = 0;
  matrix.forEach((row, homeGoals) => {
    row.forEach((probability, awayGoals) => {
      if (homeGoals > awayGoals) home += probability;
      else if (homeGoals === awayGoals) draw += probability;
      else away += probability;
    });
  });
  return { home, draw, away };
}

function normalizeResultProbabilities(resultOptions = []) {
  const sorted = resultOptions.slice().sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const implied = sorted.slice(0, 3).map((option) => oddsToProbability(option.yesOdds));
  if (implied.length < 3 || implied.some((value) => !value)) {
    return { home: 0.43, draw: 0.27, away: 0.30 };
  }
  const total = implied.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) return { home: 0.43, draw: 0.27, away: 0.30 };
  return {
    home: implied[0] / total,
    draw: implied[1] / total,
    away: implied[2] / total
  };
}

function inferGoalModel(target) {
  let best = null;
  const favoriteGap = Math.abs(target.home - target.away);
  const totalPrior = 2.35 + Math.min(0.45, favoriteGap * 0.9) - Math.min(0.25, Math.max(0, target.draw - 0.27) * 1.8);
  for (let lambdaHome = 0.35; lambdaHome <= 3.8; lambdaHome += 0.05) {
    for (let lambdaAway = 0.25; lambdaAway <= 3.4; lambdaAway += 0.05) {
      const matrix = scoreDistribution(lambdaHome, lambdaAway, 8);
      const result = resultProbabilities(matrix);
      const totalGoals = lambdaHome + lambdaAway;
      const error =
        Math.pow(result.home - target.home, 2) * 4 +
        Math.pow(result.draw - target.draw, 2) * 5 +
        Math.pow(result.away - target.away, 2) * 4 +
        Math.pow(totalGoals - totalPrior, 2) * 0.08;
      if (!best || error < best.error) best = { lambdaHome, lambdaAway, error };
    }
  }
  return {
    lambdaHome: Number((best?.lambdaHome || 1.35).toFixed(2)),
    lambdaAway: Number((best?.lambdaAway || 1.1).toFixed(2))
  };
}

function scoreMargin(probability) {
  if (probability >= 0.08) return 0.075;
  if (probability >= 0.04) return 0.095;
  if (probability >= 0.015) return 0.125;
  return 0.18;
}

function createCorrectScoreOptions(model, existingOptions = []) {
  const matrix = scoreDistribution(model.lambdaHome, model.lambdaAway, 10);
  const existingByLabel = new Map(existingOptions.map((option) => [String(option.label || '').replace(':', '-'), option]));
  return SCORE_ORDER.map(([home, away], index) => {
    const label = `${home}-${away}`;
    const existing = existingByLabel.get(label) || {};
    const probability = matrix[home]?.[away] || 0.001;
    const odds = yesNoOdds(probability, scoreMargin(probability));
    return {
      ...existing,
      id: existing.id || `score-${home}-${away}`,
      groupKey: 'correct_score',
      label,
      sideType: 'yes_no',
      sellable: false,
      sortOrder: index + 1,
      probability: Number(probability.toFixed(6)),
      yesOdds: odds.yesOdds,
      noOdds: odds.noOdds,
      pricingModel: 'poisson-dixon-coles-v1'
    };
  });
}

function correctScores() {
  return createCorrectScoreOptions({ lambdaHome: 1.35, lambdaAway: 1.1 });
}

function priceFootballMarket(market, options = {}) {
  if (!market || market.type !== 'football') return market;
  const generatedAt = options.generatedAt || market.pricingModel?.generatedAt || market.oddsSource?.updatedAt || new Date().toISOString();
  const clone = { ...market, options: (market.options || []).map((option) => ({ ...option })) };
  const resultOptions = clone.options
    .filter((option) => option.groupKey === 'match_result')
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  if (resultOptions.length < 3) return clone;

  const target = normalizeResultProbabilities(resultOptions);
  const model = inferGoalModel(target);
  const matrix = scoreDistribution(model.lambdaHome, model.lambdaAway, 10);
  const result = resultProbabilities(matrix);
  const resultProbList = [result.home, result.draw, result.away];

  resultOptions.slice(0, 3).forEach((option, index) => {
    const priced = yesNoOdds(resultProbList[index], options.resultMargin ?? 0.06);
    option.probability = Number(resultProbList[index].toFixed(6));
    option.yesOdds = priced.yesOdds;
    option.noOdds = priced.noOdds;
    option.sideType = 'yes_no';
    option.sellable = option.sellable !== false;
    option.pricingModel = 'poisson-dixon-coles-v1';
  });

  const nonScoreOptions = clone.options.filter((option) => option.groupKey !== 'correct_score');
  const scoreOptions = createCorrectScoreOptions(model, clone.options.filter((option) => option.groupKey === 'correct_score'));
  const insideScoreMass = SCORE_ORDER.reduce((sum, [home, away]) => sum + (matrix[home]?.[away] || 0), 0);

  clone.options = [...nonScoreOptions, ...scoreOptions].sort((a, b) => {
    if (a.groupKey === b.groupKey) return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (a.groupKey === 'match_result') return -1;
    if (b.groupKey === 'match_result') return 1;
    return 0;
  });
  clone.pricingModel = {
    name: 'poisson-dixon-coles-v1',
    lambdaHome: model.lambdaHome,
    lambdaAway: model.lambdaAway,
    resultProbabilities: {
      home: Number(result.home.toFixed(6)),
      draw: Number(result.draw.toFixed(6)),
      away: Number(result.away.toFixed(6))
    },
    otherScoreProbability: Number(Math.max(0, 1 - insideScoreMass).toFixed(6)),
    generatedAt
  };
  clone.oddsSource = {
    ...(clone.oddsSource || {}),
    provider: clone.oddsSource?.provider || 'Automated football pricing',
    pricingModel: 'poisson-dixon-coles-v1',
    updatedAt: clone.pricingModel.generatedAt
  };
  clone.updatedAt = clone.pricingModel.generatedAt;
  return clone;
}

function priceFootballMarkets(markets = [], options = {}) {
  return markets.map((market) => (market?.type === 'football' ? priceFootballMarket(market, options) : market));
}

module.exports = {
  SCORE_ORDER,
  SCORE_SET,
  correctScores,
  createCorrectScoreOptions,
  noOddsFromYes,
  probabilityToOdds,
  yesNoOdds,
  priceFootballMarket,
  priceFootballMarkets
};
