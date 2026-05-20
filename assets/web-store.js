window.InfoMarketStore = {
  key: 'infomarket.orders',
  ledgerKey: 'infomarket.ledger',
  insuranceKey: 'infomarket.insurance',
  listOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch (_) {
      return [];
    }
  },
  addOrder(order) {
    const orders = this.listOrders();
    const savedOrder = { ...order, id: `ord_${Date.now()}`, createdAt: new Date().toLocaleString() };
    orders.unshift(savedOrder);
    localStorage.setItem(this.key, JSON.stringify(orders.slice(0, 50)));
    this.addLedger({
      type: 'Order frozen',
      amount: -Number(order.amount || 0),
      asset: 'USDT',
      status: 'Booked',
      note: `${order.marketTitle} / ${order.pick}`
    });
    this.addLedger({
      type: 'INF Credits',
      amount: Number(order.credits || 0),
      asset: 'INF',
      status: 'Locked',
      note: order.rule || 'Trading reward'
    });
    this.addInsuranceFromOrder(savedOrder);
  },
  listLedger() {
    try {
      return JSON.parse(localStorage.getItem(this.ledgerKey) || '[]');
    } catch (_) {
      return [];
    }
  },
  addLedger(entry) {
    const ledger = this.listLedger();
    ledger.unshift({ ...entry, id: `led_${Date.now()}_${Math.random().toString(16).slice(2)}`, createdAt: new Date().toLocaleString() });
    localStorage.setItem(this.ledgerKey, JSON.stringify(ledger.slice(0, 120)));
  },
  getAccount() {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('infomarket.user') || 'null');
    } catch (_) {
      user = null;
    }
    const base = user || { available: 12480, frozen: 3250, vault: 24000, credits: 8416.2 };
    const orders = this.listOrders();
    const ledger = this.listLedger();
    const staked = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const deposits = ledger.filter((item) => item.type === 'Deposit').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const withdrawals = ledger.filter((item) => item.type === 'Withdraw request').reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
    const vaultDeposits = ledger.filter((item) => item.type === 'Vault deposit').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const vaultWithdrawals = ledger.filter((item) => item.type === 'Vault withdraw').reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
    const claimable = this.listInsuranceNodes()
      .filter((node) => node.status === 'Claimable')
      .reduce((sum, node) => sum + Number(node.periodAmount || 0), 0);
    const vault = Number(base.vault || 0) + vaultDeposits - vaultWithdrawals;
    return {
      available: Math.max(Number(base.available || 0) + deposits - withdrawals - staked - vaultDeposits + vaultWithdrawals, 0),
      frozen: Number(base.frozen || 0) + staked,
      trading: staked,
      vault,
      claimable,
      locked: Number(base.credits || 0) + orders.reduce((sum, order) => sum + Number(order.credits || 0), 0)
    };
  },
  vaultDeposit(amount) {
    this.addLedger({
      type: 'Vault deposit',
      amount: Number(amount || 0),
      asset: 'USDT',
      status: 'Booked',
      note: 'Moved from available to INFO Vault'
    });
  },
  vaultWithdraw(amount) {
    this.addLedger({
      type: 'Vault withdraw',
      amount: -Number(amount || 0),
      asset: 'USDT',
      status: 'Booked',
      note: 'Moved from INFO Vault to available'
    });
  },
  listInsuranceNodes() {
    try {
      return JSON.parse(localStorage.getItem(this.insuranceKey) || '[]');
    } catch (_) {
      return [];
    }
  },
  saveInsuranceNodes(nodes) {
    localStorage.setItem(this.insuranceKey, JSON.stringify(nodes.slice(0, 80)));
  },
  addInsuranceFromOrder(order) {
    if (!order.insurance || String(order.insurance).startsWith('0')) return;
    const exists = this.listInsuranceNodes().some((node) => node.orderId === order.id);
    if (exists) return;
    const coverMatch = String(order.insurance).match(/[\d.]+/);
    const coverRate = coverMatch ? Number(coverMatch[0]) / 100 : 0.3;
    const premium = Number(order.amount || 0) * 0.035;
    const maxCover = Number(order.amount || 0) * coverRate;
    const node = {
      id: `ALP-${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      marketId: order.marketId,
      marketTitle: order.marketTitle,
      pick: order.pick,
      premium,
      maxCover,
      periodAmount: Math.min(maxCover * 0.25, 180),
      status: 'Active',
      phase: 'Monitoring',
      createdAt: new Date().toLocaleString()
    };
    const nodes = this.listInsuranceNodes();
    nodes.unshift(node);
    this.saveInsuranceNodes(nodes);
    this.addLedger({
      type: 'Insurance premium',
      amount: -premium,
      asset: 'USDT',
      status: 'Booked',
      note: `${order.marketTitle} / ${order.pick}`
    });
  },
  seedInsuranceNodes() {
    const nodes = this.listInsuranceNodes();
    if (nodes.length) return nodes;
    const seeded = [
      {
        id: 'ALP-1042',
        marketId: 'seoul-anyang',
        marketTitle: 'Seoul vs Anyang',
        pick: 'Home YES',
        premium: 17.5,
        maxCover: 200,
        periodAmount: 45,
        status: 'Claimable',
        phase: 'Loss verified',
        createdAt: '2026/5/17 14:22'
      },
      {
        id: 'ALP-1038',
        marketId: 'btc-68000',
        marketTitle: 'BTC close above 68,000',
        pick: 'Up',
        premium: 28,
        maxCover: 240,
        periodAmount: 32,
        status: 'Scheduled',
        phase: 'Next payout cycle',
        createdAt: '2026/5/17 09:18'
      },
      {
        id: 'ALP-1021',
        marketId: 'national-noida',
        marketTitle: 'National Union vs Noida City',
        pick: 'Away NO',
        premium: 40,
        maxCover: 480,
        periodAmount: 120,
        status: 'Completed',
        phase: 'Paid',
        createdAt: '2026/5/16 20:07'
      }
    ];
    this.saveInsuranceNodes(seeded);
    return seeded;
  },
  claimInsurance(id) {
    const nodes = this.listInsuranceNodes();
    const node = nodes.find((item) => item.id === id);
    if (!node || node.status !== 'Claimable') return null;
    node.status = 'Claimed';
    node.phase = 'Paid to claimable balance';
    node.claimedAt = new Date().toLocaleString();
    this.saveInsuranceNodes(nodes);
    this.addLedger({
      type: 'Insurance claim',
      amount: Number(node.periodAmount || 0),
      asset: 'USDT',
      status: 'Confirmed',
      note: `${node.id} / ${node.marketTitle}`
    });
    return node;
  }
};
