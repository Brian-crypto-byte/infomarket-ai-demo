(function () {
  const userKey = 'infomarket.user';
  const protectedPages = new Set(['dashboard.html', 'assets.html', 'positions.html', 'rewards.html', 'vault.html', 'insurance.html', 'admin.html']);
  const adminEmailWhitelist = new Set(['admin@infomarket.ai', 'ops@infomarket.ai', 'demo@infomarket.ai']);

  const style = document.createElement('style');
  style.textContent = `
    .auth-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;background:rgba(21,25,31,.42);padding:18px}
    .auth-modal-backdrop.open{display:flex}
    .auth-modal{width:min(100%,520px);border:1px solid #d9dee5;border-radius:18px;background:#fff;overflow:hidden;color:#20242a}
    .auth-modal-head{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #d9dee5;font-size:16px;font-weight:590}
    .modal-close{width:34px;height:34px;border:0;border-radius:9px;background:#eef1f4;color:#20242a}
    .auth-modal-body{padding:18px;max-height:min(72vh,620px);overflow:auto}
    .auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
    .auth-tab{height:40px;border:1px solid #d9dee5;border-radius:12px;background:#fff;color:#20242a;font-weight:590}
    .auth-tab.active{background:#20242a;color:#fff;border-color:#20242a}
    .auth-panel{display:none}
    .auth-panel.active{display:block}
    .email-form{display:grid;gap:10px;margin-bottom:12px}
    .email-form input{height:44px;border:1px solid #d9dee5;border-radius:12px;padding:0 12px;color:#20242a;background:#fff;outline:0}
    .email-form input:focus{border-color:#20242a}
    .email-submit{height:44px;border:0;border-radius:12px;background:#20242a;color:#fff;font-weight:620}
    .wallet-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .wallet-option{width:100%;height:58px;border:1px solid #d9dee5;border-radius:13px;background:#fff;display:flex;align-items:center;gap:10px;justify-content:flex-start;padding:0 12px;font-weight:590;color:#20242a}
    .wallet-option[disabled]{opacity:.62;cursor:wait}
    .wallet-option span:not(.wallet-mark){width:auto;height:auto;border-radius:0;display:inline;background:transparent;color:inherit;font-size:13px}
    .wallet-option:hover{border-color:#9aa4b2;background:#fafafa}
    .auth-note{color:#606a75;font-size:13px;line-height:1.5}
    .auth-status{display:none;border:1px solid #d9dee5;border-radius:12px;background:#f7f9fb;color:#20242a;font-size:12.5px;line-height:1.45;padding:9px 10px;margin:10px 0}
    .auth-status.show{display:block}
    .auth-status.error{border-color:#e0bbb6;background:#fff8f7;color:#a33b2f}
    .terms-check{display:flex;align-items:flex-start;gap:9px;color:#606a75;font-size:12.5px;line-height:1.45;margin:2px 0}
    .terms-check input{width:16px;height:16px;margin-top:1px;flex:0 0 auto}
    .terms-check a{color:#20242a;text-decoration:underline;text-underline-offset:3px}
    .terms-error{display:none;color:#bd6f75;font-size:12.5px;line-height:1.4}
    .terms-error.show{display:block}
    .account-wrap{position:relative;display:inline-flex}
    .account-pill{min-width:118px;justify-content:center}
    .account-menu{position:absolute;right:0;top:calc(100% + 8px);width:270px;border:1px solid #d9dee5;border-radius:16px;background:#fff;box-shadow:0 18px 48px rgba(20,24,30,.14);padding:10px;z-index:80;display:none;color:#20242a}
    .account-menu.open{display:block}
    .account-menu-head{padding:8px 8px 10px;border-bottom:1px solid #edf0f2;margin-bottom:8px}
    .account-menu-head strong{display:block;font-weight:620}
    .account-menu-head span{display:block;margin-top:4px;color:#606a75;font-size:12.5px;word-break:break-all}
    .account-menu a,.account-menu button{width:100%;height:38px;border:0;border-radius:10px;background:transparent;color:#20242a;display:flex;align-items:center;justify-content:space-between;padding:0 9px;font-weight:560;text-align:left;text-decoration:none}
    .account-menu a:hover,.account-menu button:hover{background:#f3f5f6}
    .auth-gate{position:fixed;inset:0;z-index:90;display:none;align-items:center;justify-content:center;background:rgba(251,248,244,.86);backdrop-filter:blur(14px);padding:18px}
    .auth-gate.open{display:flex}
    .auth-gate-card{width:min(100%,440px);border:1px solid #d9dee5;border-radius:20px;background:#fff;padding:22px;color:#20242a;box-shadow:0 18px 54px rgba(20,24,30,.12)}
    .auth-gate-card h2{margin:0 0 8px;font-size:20px;font-weight:590;letter-spacing:-.02em}
    .auth-gate-card p{margin:0 0 18px;color:#606a75;line-height:1.5}
    .auth-gate-actions{display:flex;gap:10px;flex-wrap:wrap}
    @media(max-width:560px){.wallet-grid{grid-template-columns:1fr}.auth-modal{width:min(100%,420px)}}
  `;
  document.head.appendChild(style);

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(userKey) || 'null');
    } catch (_) {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(userKey, JSON.stringify(user));
  }

  function isAdminPage() {
    return (location.pathname.split('/').pop() || 'index.html') === 'admin.html';
  }

  function isWhitelistedAdmin(user) {
    return user?.authMethod === 'email' && adminEmailWhitelist.has(String(user.email || '').trim().toLowerCase());
  }

  function shortAddress(address) {
    return address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Account';
  }

  function walletMark(name) {
    return window.InfoMarketBrand ? window.InfoMarketBrand.walletIcon(name) : `<span class="wallet-mark">${String(name || 'W').slice(0, 1)}</span>`;
  }

  const fallbackText = {
    'auth.title': 'Log in to infomarket.ai',
    'auth.emailTab': 'Email',
    'auth.walletTab': 'Wallet',
    'auth.emailButton': 'Continue with email',
    'auth.emailNote': 'Email login creates an internal account for trading, rewards, vault, and insurance.',
    'auth.walletNote': 'Connect a wallet for deposits, withdrawals, GreenX sync, and Lobster Token claims.',
    'auth.gateTitle': 'Sign in required',
    'auth.gateBody': 'Sign in to access your account.',
    'auth.adminGateTitle': 'Admin access required',
    'auth.adminGateBody': 'Please sign in with an operator email.',
    'auth.adminDeniedTitle': 'Operator email required',
    'auth.adminDeniedBody': 'This account is not on the admin whitelist. Please switch to an approved operator email.',
    'auth.gateLogin': 'Log in / Sign up',
    'auth.backMarkets': 'Back to markets',
    'auth.termsPrefix': 'I have read and agree to the',
    'auth.terms': 'User Agreement',
    'auth.termsAnd': 'and',
    'auth.privacy': 'Privacy Policy',
    'auth.termsRequired': 'Please accept the User Agreement and Privacy Policy before continuing.',
    'auth.emailAccount': 'Email account',
    'auth.walletAccount': 'Wallet account',
    'auth.logout': 'Log out',
    'nav.dashboard': 'Dashboard',
    'nav.assets': 'Assets',
    'nav.positions': 'Positions',
    'nav.rewards': 'Rewards'
  };

  function t(key) {
    const value = window.InfoMarketI18n ? window.InfoMarketI18n.t(key) : null;
    return value && value !== key ? value : (fallbackText[key] || key);
  }

  function termsMarkup(id) {
    return `
      <label class="terms-check">
        <input type="checkbox" data-terms-checkbox id="${id}">
        <span>${t('auth.termsPrefix')} <a href="terms.html" target="_blank" rel="noopener">${t('auth.terms')}</a> ${t('auth.termsAnd')} <a href="privacy.html" target="_blank" rel="noopener">${t('auth.privacy')}</a></span>
      </label>
      <div class="terms-error" data-terms-error>${t('auth.termsRequired')}</div>
    `;
  }

  const wallets = [
    'Phantom',
    'Backpack',
    'Solflare',
    'MetaMask',
    'Coinbase Wallet',
    'WalletConnect',
    'OKX Wallet',
    'Trust Wallet',
    'Binance Web3',
    'Rabby',
    'Bitget Wallet',
    'TokenPocket',
    'imToken',
    'Bybit Wallet',
    'Gate Wallet',
    'Tonkeeper',
    'Keplr',
    'Ledger'
  ];

  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal-backdrop';
    modal.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-label="${t('auth.title')}">
        <div class="auth-modal-head">
          <span>${t('auth.title')}</span>
          <button class="modal-close" type="button" aria-label="Close">x</button>
        </div>
        <div class="auth-modal-body">
          <div class="auth-tabs">
            <button class="auth-tab active" type="button" data-auth-tab="email">${t('auth.emailTab')}</button>
            <button class="auth-tab" type="button" data-auth-tab="wallet">${t('auth.walletTab')}</button>
          </div>
          <div class="auth-panel active" data-auth-panel="email">
            <form class="email-form" data-email-form>
              <input type="email" name="email" autocomplete="email" placeholder="name@example.com" required />
              ${termsMarkup('modalEmailTerms')}
              <button class="email-submit" type="submit">${t('auth.emailButton')}</button>
            </form>
            <div class="auth-note">${t('auth.emailNote')}</div>
          </div>
          <div class="auth-panel" data-auth-panel="wallet">
            ${termsMarkup('modalWalletTerms')}
            <div class="auth-status" data-auth-status></div>
            <div class="wallet-grid">
              ${wallets.map((wallet) => `<button class="wallet-option" type="button" data-wallet="${wallet}">${walletMark(wallet)}<span>${wallet}</span></button>`).join('')}
            </div>
            <div class="auth-note">${t('auth.walletNote')}</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function createGate() {
    const isAdmin = isAdminPage();
    const gate = document.createElement('div');
    gate.className = 'auth-gate';
    gate.innerHTML = `
      <div class="auth-gate-card">
        <h2 data-gate-title>${isAdmin ? t('auth.adminGateTitle') : t('auth.gateTitle')}</h2>
        <p data-gate-body>${isAdmin ? t('auth.adminGateBody') : t('auth.gateBody')}</p>
        <div class="auth-gate-actions">
          <button class="btn primary" type="button" data-gate-login>${isAdmin ? t('auth.login') : t('auth.gateLogin')}</button>
          <button class="btn" type="button" data-gate-markets>${t('auth.backMarkets')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(gate);
    gate.querySelector('[data-gate-login]').addEventListener('click', openAuth);
    gate.querySelector('[data-gate-markets]').addEventListener('click', () => { location.href = 'index.html'; });
    return gate;
  }

  const modal = createModal();
  const gate = createGate();

  function setGateCopy(titleKey, bodyKey) {
    const title = gate.querySelector('[data-gate-title]');
    const body = gate.querySelector('[data-gate-body]');
    if (title) title.textContent = t(titleKey);
    if (body) body.textContent = t(bodyKey);
  }

  function openAuth() {
    modal.classList.add('open');
  }

  function closeAuth() {
    modal.classList.remove('open');
  }

  function setAuthStatus(message, type = '') {
    const node = modal.querySelector('[data-auth-status]');
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('show', Boolean(message));
    node.classList.toggle('error', type === 'error');
  }

  function encodeMessage(message) {
    return new TextEncoder().encode(message);
  }

  async function connectSolanaWallet(walletName) {
    const provider = walletName === 'Backpack'
      ? window.backpack?.solana
      : walletName === 'Solflare'
        ? window.solflare
        : (window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null));
    if (!provider) return null;
    const result = provider.request
      ? await provider.request({ method: 'connect' })
      : await provider.connect();
    const publicKey = result?.publicKey || provider.publicKey;
    const address = publicKey?.toString?.() || String(publicKey || '');
    let signature = null;
    if (address && provider.signMessage && window.InfoMarketAPI) {
      const nonce = await window.InfoMarketAPI.authNonce({ walletAddress: address, walletType: walletName });
      const signed = await provider.signMessage(encodeMessage(nonce.nonce), 'utf8');
      signature = Array.from(signed?.signature || signed || []).map((byte) => byte.toString(16).padStart(2, '0')).join('');
      return { address, nonce: nonce.nonce, signature };
    }
    return { address, signature };
  }

  async function connectEvmWallet() {
    const provider = window.ethereum;
    if (!provider?.request) return null;
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const address = accounts?.[0] || '';
    let signature = null;
    if (address && window.InfoMarketAPI) {
      const nonce = await window.InfoMarketAPI.authNonce({ walletAddress: address, walletType: 'EVM' });
      signature = await provider.request({ method: 'personal_sign', params: [nonce.nonce, address] }).catch(() => null);
      return { address, nonce: nonce.nonce, signature };
    }
    return { address, signature };
  }

  async function resolveWalletConnection(walletName) {
    const solanaWallets = new Set(['Phantom', 'Backpack', 'Solflare']);
    const evmWallets = new Set(['MetaMask', 'Coinbase Wallet', 'OKX Wallet', 'Trust Wallet', 'Binance Web3', 'Rabby', 'Bitget Wallet', 'TokenPocket', 'imToken', 'Bybit Wallet', 'Gate Wallet', 'Ledger']);
    if (solanaWallets.has(walletName)) return connectSolanaWallet(walletName);
    if (evmWallets.has(walletName)) return connectEvmWallet(walletName);
    return null;
  }

  async function persistWalletLogin(walletName, connection) {
    const address = connection?.address || '7Nf8mZkB2q84xV1T9q';
    if (window.InfoMarketAPI) {
      try {
        const auth = await window.InfoMarketAPI.authLogin({
          walletAddress: address,
          walletType: walletName,
          nonce: connection?.nonce,
          signature: connection?.signature
        });
        const apiUser = auth.user || {};
        setUser({
          id: apiUser.id || 'u_10042',
          authMethod: 'wallet',
          walletName: apiUser.walletType || walletName,
          address: apiUser.walletAddress || address,
          available: 12480,
          frozen: 3250,
          vault: 24000,
          credits: 8416.2,
          accountType: 'Centralized balance'
        });
        return;
      } catch (_) {
        // Keep the demo usable even if the mock auth API is unavailable.
      }
    }
    setUser({
      id: 'u_10042',
      authMethod: 'wallet',
      walletName,
      address,
      available: 12480,
      frozen: 3250,
      vault: 24000,
      credits: 8416.2,
      accountType: 'Centralized balance'
    });
  }

  async function loginWallet(walletName) {
    setAuthStatus(`Connecting ${walletName}...`);
    const connection = await resolveWalletConnection(walletName);
    if (!connection?.address) {
      setAuthStatus(`${walletName} is not available in this browser. Demo sign-in has been used for preview.`, 'error');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    await persistWalletLogin(walletName, connection);
    closeAuth();
    gate.classList.remove('open');
    renderAuthState();
  }

  function acceptedTerms(scope) {
    const checkbox = scope.querySelector('[data-terms-checkbox]');
    const error = scope.querySelector('[data-terms-error]');
    const accepted = Boolean(checkbox?.checked);
    if (error) error.classList.toggle('show', !accepted);
    if (!accepted) setAuthStatus(t('auth.termsRequired'), 'error');
    return accepted;
  }

  function loginEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return;
    setUser({
      id: 'u_email_10042',
      authMethod: 'email',
      email: normalized,
      walletName: 'Email account',
      address: normalized,
      available: 12480,
      frozen: 3250,
      vault: 24000,
      credits: 8416.2,
      accountType: 'Centralized balance'
    });
    closeAuth();
    gate.classList.remove('open');
    renderAuthState();
  }

  function closeMenus(except) {
    document.querySelectorAll('.account-menu.open').forEach((menu) => {
      if (menu !== except) menu.classList.remove('open');
    });
  }

  function ensureAccountWrapper(button, user) {
    let wrap = button.closest('.account-wrap');
    if (!wrap) {
      wrap = document.createElement('span');
      wrap.className = 'account-wrap';
      button.parentNode.insertBefore(wrap, button);
      wrap.appendChild(button);
    }
    let menu = wrap.querySelector('.account-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'account-menu';
      wrap.appendChild(menu);
    }
    menu.innerHTML = `
      <div class="account-menu-head">
        <strong>${user.authMethod === 'email' ? t('auth.emailAccount') : (user.walletName || t('auth.walletAccount'))}</strong>
        <span>${user.email || user.address}</span>
      </div>
      <a href="dashboard.html"><span>${t('nav.dashboard')}</span><b>&gt;</b></a>
      <a href="assets.html"><span>${t('nav.assets')}</span><b>&gt;</b></a>
      <a href="positions.html"><span>${t('nav.positions')}</span><b>&gt;</b></a>
      <a href="rewards.html"><span>${t('nav.rewards')}</span><b>&gt;</b></a>
      <button type="button" data-logout><span>${t('auth.logout')}</span><b>&gt;</b></button>
    `;
    menu.querySelector('[data-logout]').addEventListener('click', logout);
    button.onclick = (event) => {
      event.stopPropagation();
      const willOpen = !menu.classList.contains('open');
      closeMenus(menu);
      menu.classList.toggle('open', willOpen);
    };
  }

  function renderAuthState() {
    const user = getUser();
    document.querySelectorAll('[data-auth-action]').forEach((button) => {
      if (!user) {
        const wrap = button.closest('.account-wrap');
        if (wrap) wrap.replaceWith(button);
        button.textContent = button.dataset.authLabel || 'Log in';
        button.classList.remove('account-pill');
        button.onclick = openAuth;
        return;
      }
      button.textContent = user.authMethod === 'email' ? user.email.split('@')[0] : shortAddress(user.address);
      button.classList.add('account-pill');
      ensureAccountWrapper(button, user);
    });
    protectCurrentPage();
  }

  function logout() {
    localStorage.removeItem(userKey);
    closeMenus();
    renderAuthState();
  }

  function protectCurrentPage() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const user = getUser();
    if (isAdminPage()) {
      if (!user) {
        setGateCopy('auth.adminGateTitle', 'auth.adminGateBody');
        gate.classList.add('open');
        return;
      }
      if (!isWhitelistedAdmin(user)) {
        setGateCopy('auth.adminDeniedTitle', 'auth.adminDeniedBody');
        gate.classList.add('open');
        return;
      }
      gate.classList.remove('open');
      return;
    }
    if (protectedPages.has(page) && !user) {
      setGateCopy('auth.gateTitle', 'auth.gateBody');
      gate.classList.add('open');
    } else {
      gate.classList.remove('open');
    }
  }

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('modal-close')) closeAuth();
  });
  document.addEventListener('click', () => closeMenus());

  modal.querySelectorAll('[data-auth-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      modal.querySelectorAll('[data-auth-tab]').forEach((item) => item.classList.toggle('active', item === button));
      modal.querySelectorAll('[data-auth-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.authPanel === button.dataset.authTab));
    });
  });
  modal.querySelector('[data-email-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!acceptedTerms(event.currentTarget)) return;
    loginEmail(event.currentTarget.email.value);
  });
  modal.querySelectorAll('[data-wallet]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = button.closest('[data-auth-panel]');
      if (!acceptedTerms(panel)) return;
      button.disabled = true;
      loginWallet(button.dataset.wallet).finally(() => { button.disabled = false; });
    });
  });

  window.InfoMarketAuth = {
    getUser,
    login: loginWallet,
    loginWallet,
    loginEmail,
    logout,
    openAuth,
    isWhitelistedAdmin
  };

  renderAuthState();
})();
