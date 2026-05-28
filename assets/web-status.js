const modules = [
  ['Homepage markets', 'Football market cards with result odds and score previews', true],
  ['Match detail', 'YES/NO result markets, 25 correct-score lines, no-sell score behavior', true],
  ['Orders', 'Local order confirmation, positions, and frozen ledger entries', true],
  ['Dashboard', 'Account summary, positions, unlock progress, quick actions', true],
  ['Assets', 'USDT deposit/withdraw prototype and internal balance buckets', true],
  ['GreenX Vault', 'Deposit/withdraw flow connected to account buckets', true],
  ['Alpha Insurance', 'Payout nodes, claim flow, premium ledger entries', true],
  ['Rewards', 'Lobster Token, unlock progress, tasks, referrals, leaderboard', true],
  ['Admin', 'Market creation, odds editor, score lines, settlement, withdrawal review', true],
  ['Backend', 'API, DB, Solana watcher, risk engine', false]
];

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

setText('[data-status="pages"]', document.querySelectorAll('.quick-link').length);
setText('[data-status="markets"]', window.INFOMARKET_DATA.markets.length);
setText('[data-status="scores"]', window.INFOMARKET_DATA.markets.find((market) => market.type === 'football')?.scores.length || 0);
setText('[data-status="modules"]', modules.filter((item) => item[2]).length);

document.querySelector('[data-module-list]').innerHTML = modules.map(([title, desc, done]) => `
  <div class="task-item">
    <div><strong>${title}</strong><span>${desc}</span></div>
    <span class="badge ${done ? 'green' : 'amber'}">${done ? 'Done' : 'Next'}</span>
  </div>
`).join('');
