function appHeader(active) {
  const i18n = window.InfoMarketI18n;
  const t = (key) => i18n ? i18n.t(key) : key;
  const nav = [
    ['Markets', 'nav.markets', 'index.html'],
    ['Dashboard', 'nav.dashboard', 'dashboard.html'],
    ['Assets', 'nav.assets', 'assets.html'],
    ['Positions', 'nav.positions', 'positions.html'],
    ['Rewards', 'nav.rewards', 'rewards.html'],
    ['Vault', 'nav.vault', 'vault.html'],
    ['Insurance', 'nav.insurance', 'insurance.html']
  ];

  return `
    <header class="app-topbar">
      <div class="app-top-inner">
        <a class="brand" href="index.html" aria-label="infomarket.ai home">
          <img class="brand-logo" src="assets/logo.svg" alt="infomarket.ai logo">
          <span class="brand-word">infomarket<em>.ai</em></span>
        </a>
        <div class="app-search">
          <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
            <path d="M8.8 15.2a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Zm4.5-1.5 4.1 4.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input data-i18n-placeholder="search.app" placeholder="${t('search.app')}">
        </div>
        <div class="app-actions">
          ${nav.map(([label, key, href]) => `<button class="btn ${active === label ? 'soft' : ''}" onclick="location.href='${href}'" data-i18n="${key}">${t(key)}</button>`).join('')}
          ${i18n ? i18n.selector() : ''}
          <button class="btn primary" data-auth-action data-auth-label="${t('auth.loginSignup')}" data-auth-label-key="auth.loginSignup" data-i18n="auth.loginSignup">${t('auth.loginSignup')}</button>
        </div>
      </div>
    </header>
  `;
}
