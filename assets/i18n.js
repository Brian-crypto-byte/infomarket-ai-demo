(function () {
  const storageKey = 'infomarket.lang';
  const languages = [
    ['en', 'English'],
    ['zh-CN', '简体中文'],
    ['ja', '日本語'],
    ['ko', '한국어'],
    ['vi', 'Tiếng Việt'],
    ['id', 'Bahasa Indonesia']
  ];

  const en = {
    'nav.markets': 'Markets', 'nav.dashboard': 'Account', 'nav.assets': 'Assets', 'nav.positions': 'Positions',
    'nav.rewards': 'Rewards', 'nav.vault': 'Vault', 'nav.insurance': 'Insurance', 'nav.admin': 'Admin', 'nav.project': 'Project',
    'nav.trending': 'Trending', 'nav.sports': 'Sports', 'nav.soccer': 'Soccer', 'nav.crypto': 'Crypto',
    'nav.esports': 'Esports', 'nav.tech': 'Tech', 'nav.culture': 'Culture', 'nav.economy': 'Economy', 'nav.weather': 'Weather',
    'auth.login': 'Log in', 'auth.signup': 'Sign up', 'auth.loginSignup': 'Log in / Sign up',
    'auth.secure': 'Secure sign-in', 'auth.title': 'Log in to infomarket.ai',
    'auth.subtitle': 'Use email for your trading account or connect a wallet for deposits, withdrawals, and INF token claims.',
    'auth.emailTitle': 'Continue with email', 'auth.walletTitle': 'Choose wallet', 'auth.emailButton': 'Continue with email',
    'auth.emailTab': 'Email', 'auth.walletTab': 'Wallet', 'auth.emailAccount': 'Email account', 'auth.walletAccount': 'Wallet account',
    'auth.emailNote': 'Email sign-in creates your internal trading account. Wallets can be linked for USDT deposits and withdrawals.',
    'auth.walletNote': 'Connect a wallet for deposits, withdrawals, and INF token claims.',
    'auth.devNote': 'Preview access uses a test account. Production sign-in will require email verification or wallet signature before deposits, withdrawals, and trading.',
    'auth.gateTitle': 'Sign in required', 'auth.gateBody': 'Please sign in to continue.',
    'auth.adminGateTitle': 'Admin access required', 'auth.adminGateBody': 'Please sign in with an operator email.',
    'auth.adminDeniedTitle': 'Operator email required', 'auth.adminDeniedBody': 'This account is not on the admin whitelist. Please switch to an approved operator email.',
    'auth.gateLogin': 'Log in / Sign up', 'auth.backMarkets': 'Back to markets', 'auth.logout': 'Log out',
    'auth.termsPrefix': 'I have read and agree to the', 'auth.terms': 'User Agreement', 'auth.privacy': 'Privacy Policy',
    'auth.termsAnd': 'and', 'auth.termsRequired': 'Please accept the User Agreement and Privacy Policy before continuing.',
    'search.app': 'Search markets, assets, positions or orders', 'search.home': 'Search markets, teams, scores or assets',
    'home.notice': 'Trading is unavailable in restricted jurisdictions. Please review the terms before placing orders.',
    'home.featured': 'Featured markets', 'home.viewAll': 'View all', 'lang.label': 'Language',
    'market.yes': 'Yes', 'market.no': 'No', 'market.up': 'Up', 'market.down': 'Down',
    'market.home': 'Home', 'market.draw': 'Draw', 'market.away': 'Away', 'market.live': 'Live',
    'market.active': 'Open', 'market.pending': 'Pending', 'market.notStarted': 'Not started',
    'market.moreScores': 'More scores', 'market.showFewer': 'Show fewer',
    'market.matchResult': 'Match result',
    'market.correctScore': 'Correct score',
    'market.correctScoreSub': 'First 3 scores shown on mobile; expand for all 25 fixed score lines',
    'market.all': 'All',
    'market.result': 'Result',
    'market.volume': 'Volume',
    'market.bestPrice': 'Best price',
    'market.timeLeft': 'Time left',
    'market.activity': 'Market activity',
    'market.activitySub': 'Recent trades and quote changes',
    'market.activityEmpty': 'Trades, quote updates, and settlement events appear here.',
    'market.liveQuotes': 'Live pool quotes',
    'market.direction': 'Direction',
    'market.outcome': 'Outcome',
    'market.fixedQuotes': 'Fixed pool quotes',
    'market.upDownQuotes': 'Up / Down fixed quotes',
    'market.empty': 'No markets available right now.', 'market.closes': 'Closes',
    'common.backDashboard': 'Back to dashboard', 'common.openAssets': 'Open assets', 'common.confirm': 'Confirm',
    'vault.product': '', 'vault.title': 'INFO Vault',
    'vault.subtitle': 'Deposit idle USDT into fixed-term vault plans and unlock after 7, 15, 30, 60, or 180 days.',
    'vault.estimatedApr': 'Estimated APR 12.4%', 'vault.myVault': 'My vault', 'vault.accruedYield': 'Accrued yield',
    'vault.infBoost': 'INF boost', 'vault.tvl': 'Vault TVL', 'vault.yieldCurve': 'Yield curve',
    'vault.dailySettlement': 'Daily settlement', 'vault.rules': 'Vault rules', 'vault.terms': 'Vault terms',
    'vault.yieldSettlement': 'Yield settlement', 'vault.withdraw': 'Withdraw', 'vault.afterLock': 'After lock expires',
    'vault.creditsBoost': 'Credits boost', 'vault.longerBoost': 'Longer term, higher boost',
    'vault.ledger': 'Vault ledger', 'vault.manage': 'Manage vault', 'vault.deposit': 'Deposit',
    'vault.withdrawAction': 'Withdraw', 'vault.lockTerm': 'Lock term', 'vault.amount': 'Amount',
    'vault.confirmDeposit': 'Confirm deposit', 'vault.confirmWithdraw': 'Confirm withdraw',
    'vault.depositNote': 'Locks USDT for {days} days in INFO Vault.',
    'vault.withdrawNote': 'Withdraws unlocked USDT from INFO Vault back to available balance.',
    'vault.account': 'My vault account', 'vault.available': 'Available', 'vault.principal': 'Principal',
    'vault.claimableYield': 'Claimable yield', 'vault.currentTerm': 'Current term', 'vault.unlockDate': 'Unlock date',
    'vault.afterDeposit': 'After deposit', 'vault.noMovements': 'No vault movements yet.',
    'insurance.eyebrow': '', 'insurance.title': 'INFO Alpha Insurance',
    'insurance.subtitle': 'Buy optional cover with a prediction order. If the position has a verified loss, claimable USDT is released by the insurance-pool schedule.',
    'insurance.tradeCover': 'Trade with cover', 'insurance.pool': 'Insurance pool', 'insurance.activeCover': 'Active cover',
    'insurance.claimable': 'Claimable', 'insurance.payoutRatio': 'Payout ratio', 'insurance.nodes': 'Payout nodes',
    'insurance.loadNodes': 'Refresh nodes', 'insurance.node': 'Node', 'insurance.source': 'Source',
    'insurance.premium': 'Premium', 'insurance.maxCover': 'Max cover', 'insurance.thisPeriod': 'This period',
    'insurance.status': 'Status', 'insurance.flow': 'Insurance flow',
    'insurance.step1': '1. Order placement', 'insurance.step1Body': 'Pay premium with the prediction order',
    'insurance.step2': '2. Loss verification', 'insurance.step2Body': 'Oracle / admin settlement marks eligible loss',
    'insurance.step3': '3. Node created', 'insurance.step3Body': 'Internal payout credential, not on-chain NFT',
    'insurance.step4': '4. Payout schedule', 'insurance.step4Body': 'Released by pool health and user risk tier',
    'insurance.poolHealth': 'Pool health', 'insurance.premiumIncome': 'Premium income',
    'insurance.pendingPayout': 'Pending payout', 'insurance.singleMax': 'Single-order max cover',
    'insurance.payoutCycle': 'Payout cycle', 'insurance.productRule': 'Product rule',
    'insurance.ruleBody': 'Insurance nodes are internal payout credentials. They are not NFTs and cannot be transferred. Payout depends on settlement result, pool health, user risk score, and order type.',
    'insurance.claimResult': 'Claim result', 'insurance.noClaim': 'No claim action yet.',
    'insurance.empty': 'No insurance nodes yet. Place an insured order from a market page.',
    'insurance.claim': 'Claim'
  };

  const dict = {
    en,
    'zh-CN': { ...en,
      'nav.markets': '市场', 'nav.dashboard': '账户', 'nav.assets': '资产', 'nav.positions': '持仓', 'nav.rewards': '奖励', 'nav.vault': '金库', 'nav.insurance': '保险', 'nav.admin': '管理后台', 'nav.project': '项目',
      'nav.trending': '热门', 'nav.sports': '体育', 'nav.soccer': '足球', 'nav.crypto': '加密', 'nav.esports': '电竞', 'nav.tech': '科技', 'nav.culture': '文化', 'nav.economy': '经济', 'nav.weather': '天气',
      'auth.login': '登录', 'auth.signup': '注册', 'auth.loginSignup': '登录 / 注册', 'auth.secure': '安全登录', 'auth.title': '登录 infomarket.ai',
      'auth.subtitle': '使用邮箱创建交易账户，或连接钱包用于 USDT 充值、提现和 INF Token 领取。',
      'auth.emailTitle': '使用邮箱继续', 'auth.walletTitle': '选择钱包', 'auth.emailButton': '使用邮箱继续', 'auth.emailTab': '邮箱', 'auth.walletTab': '钱包',
      'auth.emailAccount': '邮箱账户', 'auth.walletAccount': '钱包账户',
      'auth.emailNote': '邮箱登录会创建你的内部交易账户。钱包可用于 USDT 充值与提现。',
      'auth.walletNote': '连接钱包用于充值、提现和 INF Token 领取。',
      'auth.devNote': '当前为预览测试账户。正式环境会在充值、提现和交易前完成邮箱验证或钱包签名。',
      'auth.gateTitle': '请先登录', 'auth.gateBody': '请登录后继续。', 'auth.adminGateTitle': '需要管理员权限', 'auth.adminGateBody': '请使用白名单运营邮箱登录。',
      'auth.adminDeniedTitle': '需要白名单运营邮箱', 'auth.adminDeniedBody': '当前账户不在管理后台白名单中，请切换为已授权的运营邮箱。',
      'auth.gateLogin': '登录 / 注册', 'auth.backMarkets': '返回市场', 'auth.logout': '退出登录',
      'auth.termsPrefix': '我已阅读并同意', 'auth.terms': '用户协议', 'auth.privacy': '隐私政策', 'auth.termsAnd': '和', 'auth.termsRequired': '请先同意用户协议和隐私政策。',
      'search.app': '搜索市场、资产、持仓或订单', 'search.home': '搜索市场、球队、比分或资产',
      'home.notice': '受限制地区暂不可交易。下单前请阅读并确认相关条款。', 'home.featured': '精选市场', 'home.viewAll': '查看全部', 'lang.label': '语言',
      'market.yes': '是', 'market.no': '否', 'market.up': '上涨', 'market.down': '下跌', 'market.home': '主胜', 'market.draw': '平局', 'market.away': '客胜',
      'market.live': '进行中', 'market.active': '可交易', 'market.pending': '待定', 'market.notStarted': '未开始', 'market.moreScores': '更多比分', 'market.showFewer': '收起比分',
      'market.matchResult': '胜平负',
      'market.correctScore': '比分',
      'market.correctScoreSub': '手机端先展示 3 个比分，展开后查看全部 25 个固定比分赔率',
      'market.all': '全部',
      'market.result': '赛果',
      'market.volume': '交易量',
      'market.bestPrice': '最佳价',
      'market.timeLeft': '剩余时间',
      'market.activity': '市场动态',
      'market.activitySub': '近期成交与报价变化',
      'market.activityEmpty': '成交、报价更新和结算事件会显示在这里。',
      'market.liveQuotes': '实时资金池报价',
      'market.direction': '方向交易', 'market.outcome': '市场结果', 'market.fixedQuotes': '固定赔率报价', 'market.upDownQuotes': '上涨 / 下跌固定赔率',
      'market.empty': '当前暂无可交易市场。', 'market.closes': '截止',
      'common.backDashboard': '返回账户', 'common.openAssets': '打开资产页', 'common.confirm': '确认',
      'vault.product': '', 'vault.title': 'INFO 金库',
      'vault.subtitle': '将闲置 USDT 存入固定期限金库计划，并在 7、15、30、60 或 180 天锁仓期结束后解锁。',
      'vault.estimatedApr': '预估年化 12.4%', 'vault.myVault': '我的金库', 'vault.accruedYield': '累计收益',
      'vault.infBoost': 'INF 加成', 'vault.tvl': '金库 TVL', 'vault.yieldCurve': '收益曲线',
      'vault.dailySettlement': '每日结算', 'vault.rules': '金库规则', 'vault.terms': '锁仓期限',
      'vault.yieldSettlement': '收益结算', 'vault.withdraw': '取出', 'vault.afterLock': '锁仓到期后可取出',
      'vault.creditsBoost': 'Credits 加成', 'vault.longerBoost': '期限越长，加成越高',
      'vault.ledger': '金库流水', 'vault.manage': '管理金库', 'vault.deposit': '存入',
      'vault.withdrawAction': '取出', 'vault.lockTerm': '锁仓期限', 'vault.amount': '金额',
      'vault.confirmDeposit': '确认存入', 'vault.confirmWithdraw': '确认取出',
      'vault.depositNote': '将 USDT 锁定 {days} 天并存入 INFO 金库。',
      'vault.withdrawNote': '将已解锁 USDT 从 INFO 金库转回可用余额。',
      'vault.account': '我的金库账户', 'vault.available': '可用余额', 'vault.principal': '本金',
      'vault.claimableYield': '可领取收益', 'vault.currentTerm': '当前期限', 'vault.unlockDate': '解锁日期',
      'vault.afterDeposit': '存入后显示', 'vault.noMovements': '暂无金库流水。',
      'insurance.eyebrow': '', 'insurance.title': 'INFO Alpha 保险',
      'insurance.subtitle': '下单时可选择购买保险。若持仓结算为有效亏损，可领取 USDT 会按保险池计划释放。',
      'insurance.tradeCover': '带保险交易', 'insurance.pool': '保险池', 'insurance.activeCover': '生效保额',
      'insurance.claimable': '可领取', 'insurance.payoutRatio': '赔付比例', 'insurance.nodes': '赔付节点',
      'insurance.loadNodes': '刷新节点', 'insurance.node': '节点', 'insurance.source': '来源',
      'insurance.premium': '保费', 'insurance.maxCover': '最高赔付', 'insurance.thisPeriod': '本期可领',
      'insurance.status': '状态', 'insurance.flow': '保险流程',
      'insurance.step1': '1. 下单购买', 'insurance.step1Body': '随预测订单一起支付保费',
      'insurance.step2': '2. 亏损确认', 'insurance.step2Body': '预言机或后台结算确认有效亏损',
      'insurance.step3': '3. 生成节点', 'insurance.step3Body': '内部赔付凭证，不是链上 NFT',
      'insurance.step4': '4. 分期释放', 'insurance.step4Body': '根据保险池健康度和用户风险等级释放',
      'insurance.poolHealth': '保险池状态', 'insurance.premiumIncome': '保费收入',
      'insurance.pendingPayout': '待赔付', 'insurance.singleMax': '单笔最高保障',
      'insurance.payoutCycle': '赔付周期', 'insurance.productRule': '产品规则',
      'insurance.ruleBody': '保险节点是内部赔付凭证，不是 NFT，不能转让。赔付取决于结算结果、保险池健康度、用户风险评分和订单类型。',
      'insurance.claimResult': '领取结果', 'insurance.noClaim': '暂无领取操作。',
      'insurance.empty': '暂无保险节点。请在市场页下单时选择保险。',
      'insurance.claim': '领取'
    },
    ja: { ...en,
      'nav.markets': 'マーケット', 'nav.dashboard': 'アカウント', 'nav.assets': '資産', 'nav.positions': 'ポジション', 'nav.rewards': '報酬', 'nav.vault': '金庫', 'nav.insurance': '保険', 'nav.admin': '管理画面', 'nav.project': 'プロジェクト',
      'nav.trending': '注目', 'nav.sports': 'スポーツ', 'nav.soccer': 'サッカー', 'nav.crypto': '暗号資産', 'nav.esports': 'eスポーツ', 'nav.tech': 'テクノロジー', 'nav.culture': 'カルチャー', 'nav.economy': '経済', 'nav.weather': '天気',
      'auth.loginSignup': 'ログイン / 登録', 'auth.title': 'infomarket.ai にログイン', 'auth.subtitle': 'メールで取引用アカウントを作成するか、ウォレットを接続して USDT の入出金と INF Token の受け取りを行います。',
      'auth.gateTitle': 'ログインが必要です', 'auth.gateBody': '続行するにはログインしてください。', 'auth.adminGateTitle': '管理者権限が必要です', 'auth.adminGateBody': '許可済みの運用メールでログインしてください。',
      'auth.adminDeniedTitle': '運用メールが必要です', 'auth.adminDeniedBody': 'このアカウントは管理画面の許可リストにありません。承認済みの運用メールに切り替えてください。',
      'search.home': 'マーケット、チーム、スコア、資産を検索', 'home.notice': '制限対象地域では取引できません。注文前に規約をご確認ください。', 'lang.label': '言語',
      'market.yes': 'はい', 'market.no': 'いいえ', 'market.up': '上昇', 'market.down': '下落', 'market.home': 'ホーム勝利', 'market.draw': '引き分け', 'market.away': 'アウェイ勝利', 'market.live': 'ライブ', 'market.active': '取引可', 'market.notStarted': '開始前', 'market.moreScores': '他のスコア',
      'market.matchResult': '試合結果', 'market.correctScore': '正確スコア', 'market.correctScoreSub': 'モバイルでは最初に3件を表示し、展開すると25件すべてを確認できます', 'market.all': 'すべて', 'market.result': '結果', 'market.volume': '取引量', 'market.bestPrice': 'ベスト価格', 'market.timeLeft': '残り時間', 'market.activity': '市場アクティビティ', 'market.activitySub': '直近の約定と価格更新', 'market.activityEmpty': '約定、価格更新、精算イベントがここに表示されます。', 'market.liveQuotes': 'ライブプール価格', 'market.direction': '方向取引', 'market.outcome': '市場結果', 'market.fixedQuotes': '固定オッズ', 'market.upDownQuotes': '上昇 / 下落の固定オッズ'
    },
    ko: { ...en,
      'nav.markets': '마켓', 'nav.dashboard': '계정', 'nav.assets': '자산', 'nav.positions': '포지션', 'nav.rewards': '리워드', 'nav.vault': '금고', 'nav.insurance': '보험', 'nav.admin': '관리 콘솔', 'nav.project': '프로젝트',
      'nav.trending': '인기', 'nav.sports': '스포츠', 'nav.soccer': '축구', 'nav.crypto': '암호화폐', 'nav.esports': 'e스포츠', 'nav.tech': '기술', 'nav.culture': '문화', 'nav.economy': '경제', 'nav.weather': '날씨',
      'auth.loginSignup': '로그인 / 가입', 'auth.title': 'infomarket.ai 로그인', 'auth.subtitle': '이메일로 거래 계정을 만들거나 지갑을 연결해 USDT 입출금과 INF Token 수령을 진행하세요.',
      'auth.gateTitle': '로그인이 필요합니다', 'auth.gateBody': '계속하려면 로그인하세요.', 'auth.adminGateTitle': '관리자 권한 필요', 'auth.adminGateBody': '허용된 운영 이메일로 로그인하세요.',
      'auth.adminDeniedTitle': '운영 이메일 필요', 'auth.adminDeniedBody': '이 계정은 관리자 화이트리스트에 없습니다. 승인된 운영 이메일로 전환하세요.',
      'search.home': '마켓, 팀, 스코어 또는 자산 검색', 'home.notice': '제한 지역에서는 거래할 수 없습니다. 주문 전 약관을 확인하세요.', 'lang.label': '언어',
      'market.yes': '예', 'market.no': '아니요', 'market.up': '상승', 'market.down': '하락', 'market.home': '홈 승', 'market.draw': '무승부', 'market.away': '원정 승', 'market.live': '라이브', 'market.active': '거래 가능', 'market.notStarted': '시작 전', 'market.moreScores': '더 많은 스코어',
      'market.matchResult': '경기 결과', 'market.correctScore': '정확한 스코어', 'market.correctScoreSub': '모바일에서는 3개를 먼저 표시하고, 펼치면 25개 고정 스코어 배당을 모두 볼 수 있습니다', 'market.all': '전체', 'market.result': '결과', 'market.volume': '거래량', 'market.bestPrice': '최우선 가격', 'market.timeLeft': '남은 시간', 'market.activity': '시장 활동', 'market.activitySub': '최근 체결 및 호가 변경', 'market.activityEmpty': '체결, 호가 업데이트, 정산 이벤트가 여기에 표시됩니다.', 'market.liveQuotes': '실시간 풀 호가', 'market.direction': '방향 거래', 'market.outcome': '마켓 결과', 'market.fixedQuotes': '고정 배당 호가', 'market.upDownQuotes': '상승 / 하락 고정 배당'
    },
    vi: { ...en,
      'nav.markets': 'Thị trường', 'nav.dashboard': 'Tài khoản', 'nav.assets': 'Tài sản', 'nav.positions': 'Vị thế', 'nav.rewards': 'Thưởng', 'nav.vault': 'Kho lợi suất', 'nav.insurance': 'Bảo hiểm', 'nav.admin': 'Quản trị', 'nav.project': 'Dự án',
      'nav.trending': 'Thịnh hành', 'nav.sports': 'Thể thao', 'nav.soccer': 'Bóng đá', 'nav.crypto': 'Crypto', 'nav.esports': 'Esports', 'nav.tech': 'Công nghệ', 'nav.culture': 'Văn hóa', 'nav.economy': 'Kinh tế', 'nav.weather': 'Thời tiết',
      'auth.loginSignup': 'Đăng nhập / Đăng ký', 'auth.title': 'Đăng nhập infomarket.ai', 'auth.subtitle': 'Dùng email để tạo tài khoản giao dịch hoặc kết nối ví để nạp, rút USDT và nhận INF Token.',
      'auth.gateTitle': 'Cần đăng nhập', 'auth.gateBody': 'Vui lòng đăng nhập để tiếp tục.', 'auth.adminGateTitle': 'Cần quyền quản trị', 'auth.adminGateBody': 'Vui lòng đăng nhập bằng email vận hành đã được phê duyệt.',
      'auth.adminDeniedTitle': 'Cần email vận hành', 'auth.adminDeniedBody': 'Tài khoản này không nằm trong danh sách quản trị. Vui lòng chuyển sang email vận hành đã được phê duyệt.',
      'search.home': 'Tìm thị trường, đội bóng, tỷ số hoặc tài sản', 'home.notice': 'Giao dịch không khả dụng tại khu vực bị hạn chế. Vui lòng đọc điều khoản trước khi đặt lệnh.', 'lang.label': 'Ngôn ngữ',
      'market.yes': 'Có', 'market.no': 'Không', 'market.up': 'Tăng', 'market.down': 'Giảm', 'market.home': 'Chủ nhà thắng', 'market.draw': 'Hòa', 'market.away': 'Khách thắng', 'market.live': 'Trực tiếp', 'market.active': 'Có thể giao dịch', 'market.notStarted': 'Chưa bắt đầu', 'market.moreScores': 'Thêm tỷ số',
      'market.matchResult': 'Kết quả trận đấu', 'market.correctScore': 'Tỷ số chính xác', 'market.correctScoreSub': 'Trên di động hiển thị trước 3 tỷ số; mở rộng để xem đủ 25 tỷ số cố định', 'market.all': 'Tất cả', 'market.result': 'Kết quả', 'market.volume': 'Khối lượng', 'market.bestPrice': 'Giá tốt nhất', 'market.timeLeft': 'Thời gian còn lại', 'market.activity': 'Hoạt động thị trường', 'market.activitySub': 'Giao dịch và cập nhật báo giá gần đây', 'market.activityEmpty': 'Giao dịch, cập nhật báo giá và sự kiện quyết toán sẽ hiển thị tại đây.', 'market.liveQuotes': 'Báo giá pool trực tiếp', 'market.direction': 'Giao dịch hướng', 'market.outcome': 'Kết quả thị trường', 'market.fixedQuotes': 'Tỷ lệ cố định', 'market.upDownQuotes': 'Tỷ lệ cố định Tăng / Giảm'
    },
    id: { ...en,
      'nav.markets': 'Pasar', 'nav.dashboard': 'Akun', 'nav.assets': 'Aset', 'nav.positions': 'Posisi', 'nav.rewards': 'Reward', 'nav.vault': 'Vault', 'nav.insurance': 'Asuransi', 'nav.admin': 'Admin', 'nav.project': 'Proyek',
      'nav.trending': 'Populer', 'nav.sports': 'Olahraga', 'nav.soccer': 'Sepak bola', 'nav.crypto': 'Kripto', 'nav.esports': 'Esports', 'nav.tech': 'Teknologi', 'nav.culture': 'Budaya', 'nav.economy': 'Ekonomi', 'nav.weather': 'Cuaca',
      'auth.loginSignup': 'Masuk / Daftar', 'auth.title': 'Masuk ke infomarket.ai', 'auth.subtitle': 'Gunakan email untuk membuat akun trading atau hubungkan wallet untuk deposit, penarikan USDT, dan klaim INF Token.',
      'auth.gateTitle': 'Masuk diperlukan', 'auth.gateBody': 'Silakan masuk untuk melanjutkan.', 'auth.adminGateTitle': 'Akses admin diperlukan', 'auth.adminGateBody': 'Silakan masuk dengan email operator yang disetujui.',
      'auth.adminDeniedTitle': 'Email operator diperlukan', 'auth.adminDeniedBody': 'Akun ini tidak ada di whitelist admin. Silakan beralih ke email operator yang disetujui.',
      'search.home': 'Cari pasar, tim, skor, atau aset', 'home.notice': 'Trading tidak tersedia di wilayah terbatas. Harap tinjau ketentuan sebelum memasang order.', 'lang.label': 'Bahasa',
      'market.yes': 'Ya', 'market.no': 'Tidak', 'market.up': 'Naik', 'market.down': 'Turun', 'market.home': 'Tuan rumah menang', 'market.draw': 'Seri', 'market.away': 'Tamu menang', 'market.live': 'Live', 'market.active': 'Dapat diperdagangkan', 'market.notStarted': 'Belum mulai', 'market.moreScores': 'Skor lainnya',
      'market.matchResult': 'Hasil pertandingan', 'market.correctScore': 'Skor tepat', 'market.correctScoreSub': 'Di mobile tampil 3 skor lebih dulu; buka untuk melihat 25 odds skor tetap', 'market.all': 'Semua', 'market.result': 'Hasil', 'market.volume': 'Volume', 'market.bestPrice': 'Harga terbaik', 'market.timeLeft': 'Sisa waktu', 'market.activity': 'Aktivitas pasar', 'market.activitySub': 'Trading dan pembaruan quote terbaru', 'market.activityEmpty': 'Trading, pembaruan quote, dan event settlement akan tampil di sini.', 'market.liveQuotes': 'Quote pool live', 'market.direction': 'Trading arah', 'market.outcome': 'Hasil pasar', 'market.fixedQuotes': 'Odds tetap', 'market.upDownQuotes': 'Odds tetap Naik / Turun'
    }
  };

  const pageTranslations = {
    ja: {
      'common.backDashboard': 'アカウントへ戻る', 'common.openAssets': '資産ページを開く',
      'vault.product': '', 'vault.title': 'INFO 金庫', 'vault.subtitle': '未使用の USDT を固定期間の金庫プランに預け入れ、7、15、30、60、180 日のロック期間後に解除できます。', 'vault.estimatedApr': '想定 APR 12.4%', 'vault.myVault': 'マイ金庫', 'vault.accruedYield': '累積利回り', 'vault.infBoost': 'INF ブースト', 'vault.tvl': '金庫 TVL', 'vault.yieldCurve': '利回り曲線', 'vault.dailySettlement': '毎日精算', 'vault.rules': '金庫ルール', 'vault.terms': 'ロック期間', 'vault.yieldSettlement': '利回り精算', 'vault.withdraw': '出金', 'vault.afterLock': 'ロック期間終了後に出金可能', 'vault.creditsBoost': 'Credits ブースト', 'vault.longerBoost': '期間が長いほどブーストが高くなります', 'vault.ledger': '金庫履歴', 'vault.manage': '金庫を管理', 'vault.deposit': '預け入れ', 'vault.withdrawAction': '引き出し', 'vault.lockTerm': 'ロック期間', 'vault.amount': '金額', 'vault.confirmDeposit': '預け入れを確定', 'vault.confirmWithdraw': '引き出しを確定', 'vault.depositNote': 'USDT を {days} 日間 INFO 金庫にロックします。', 'vault.withdrawNote': 'ロック解除済み USDT を利用可能残高へ戻します。', 'vault.account': 'マイ金庫口座', 'vault.available': '利用可能', 'vault.principal': '元本', 'vault.claimableYield': '請求可能利回り', 'vault.currentTerm': '現在の期間', 'vault.unlockDate': '解除日', 'vault.afterDeposit': '預け入れ後に表示', 'vault.noMovements': '金庫の履歴はまだありません。',
      'insurance.eyebrow': '', 'insurance.title': 'INFO Alpha 保険', 'insurance.subtitle': '予測注文時に任意で保険を購入できます。検証済み損失が発生した場合、保険プールのスケジュールに従って請求可能 USDT が解放されます。', 'insurance.tradeCover': '保険付きで取引', 'insurance.pool': '保険プール', 'insurance.activeCover': '有効カバー', 'insurance.claimable': '請求可能', 'insurance.payoutRatio': '支払い比率', 'insurance.nodes': '支払いノード', 'insurance.loadNodes': 'テストノードを読み込む', 'insurance.node': 'ノード', 'insurance.source': 'ソース', 'insurance.premium': '保険料', 'insurance.maxCover': '最大カバー', 'insurance.thisPeriod': '今期分', 'insurance.status': 'ステータス', 'insurance.flow': '保険フロー', 'insurance.step1': '1. 注文時購入', 'insurance.step1Body': '予測注文と同時に保険料を支払います', 'insurance.step2': '2. 損失確認', 'insurance.step2Body': 'オラクルまたは管理者精算が対象損失を確認します', 'insurance.step3': '3. ノード作成', 'insurance.step3Body': '内部支払い証憑であり、オンチェーン NFT ではありません', 'insurance.step4': '4. 分割支払い', 'insurance.step4Body': 'プール健全性とユーザーリスク階層に基づいて解放されます', 'insurance.poolHealth': 'プール健全性', 'insurance.premiumIncome': '保険料収入', 'insurance.pendingPayout': '支払い待ち', 'insurance.singleMax': '1 注文あたり最大カバー', 'insurance.payoutCycle': '支払い周期', 'insurance.productRule': '商品ルール', 'insurance.ruleBody': '保険ノードは内部支払い証憑です。NFT ではなく譲渡できません。支払いは精算結果、プール健全性、ユーザーリスクスコア、注文タイプに依存します。', 'insurance.claimResult': '請求結果', 'insurance.noClaim': '請求操作はまだありません。', 'insurance.empty': '保険ノードはまだありません。市場ページで保険付き注文を行ってください。', 'insurance.claim': '請求'
    },
    ko: {
      'common.backDashboard': '계정으로 돌아가기', 'common.openAssets': '자산 열기',
      'vault.product': '', 'vault.title': 'INFO 금고', 'vault.subtitle': '유휴 USDT를 고정 기간 금고 플랜에 예치하고 7, 15, 30, 60, 180일 잠금 기간 이후 해제할 수 있습니다.', 'vault.estimatedApr': '예상 APR 12.4%', 'vault.myVault': '내 금고', 'vault.accruedYield': '누적 수익', 'vault.infBoost': 'INF 부스트', 'vault.tvl': '금고 TVL', 'vault.yieldCurve': '수익률 곡선', 'vault.dailySettlement': '일일 정산', 'vault.rules': '금고 규칙', 'vault.terms': '잠금 기간', 'vault.yieldSettlement': '수익 정산', 'vault.withdraw': '출금', 'vault.afterLock': '잠금 만료 후 출금 가능', 'vault.creditsBoost': 'Credits 부스트', 'vault.longerBoost': '기간이 길수록 부스트가 높아집니다', 'vault.ledger': '금고 원장', 'vault.manage': '금고 관리', 'vault.deposit': '예치', 'vault.withdrawAction': '출금', 'vault.lockTerm': '잠금 기간', 'vault.amount': '금액', 'vault.confirmDeposit': '예치 확인', 'vault.confirmWithdraw': '출금 확인', 'vault.depositNote': 'USDT를 INFO 금고에 {days}일 동안 잠급니다.', 'vault.withdrawNote': '잠금 해제된 USDT를 사용 가능 잔액으로 이동합니다.', 'vault.account': '내 금고 계정', 'vault.available': '사용 가능', 'vault.principal': '원금', 'vault.claimableYield': '수령 가능 수익', 'vault.currentTerm': '현재 기간', 'vault.unlockDate': '해제일', 'vault.afterDeposit': '예치 후 표시', 'vault.noMovements': '아직 금고 내역이 없습니다.',
      'insurance.eyebrow': '', 'insurance.title': 'INFO Alpha 보험', 'insurance.subtitle': '예측 주문 시 선택적으로 보험을 구매할 수 있습니다. 검증된 손실이 발생하면 보험 풀 일정에 따라 수령 가능한 USDT가 지급됩니다.', 'insurance.tradeCover': '보험 포함 거래', 'insurance.pool': '보험 풀', 'insurance.activeCover': '활성 보장', 'insurance.claimable': '수령 가능', 'insurance.payoutRatio': '지급 비율', 'insurance.nodes': '지급 노드', 'insurance.loadNodes': '테스트 노드 불러오기', 'insurance.node': '노드', 'insurance.source': '출처', 'insurance.premium': '보험료', 'insurance.maxCover': '최대 보장', 'insurance.thisPeriod': '이번 회차', 'insurance.status': '상태', 'insurance.flow': '보험 흐름', 'insurance.step1': '1. 주문 시 가입', 'insurance.step1Body': '예측 주문과 함께 보험료를 지불합니다', 'insurance.step2': '2. 손실 확인', 'insurance.step2Body': '오라클 또는 관리자 정산이 적격 손실을 표시합니다', 'insurance.step3': '3. 노드 생성', 'insurance.step3Body': '내부 지급 증빙이며 온체인 NFT가 아닙니다', 'insurance.step4': '4. 지급 일정', 'insurance.step4Body': '풀 건전성과 사용자 위험 등급에 따라 지급됩니다', 'insurance.poolHealth': '풀 건전성', 'insurance.premiumIncome': '보험료 수입', 'insurance.pendingPayout': '지급 대기', 'insurance.singleMax': '단일 주문 최대 보장', 'insurance.payoutCycle': '지급 주기', 'insurance.productRule': '상품 규칙', 'insurance.ruleBody': '보험 노드는 내부 지급 증빙입니다. NFT가 아니며 양도할 수 없습니다. 지급은 정산 결과, 풀 건전성, 사용자 위험 점수, 주문 유형에 따라 달라집니다.', 'insurance.claimResult': '수령 결과', 'insurance.noClaim': '아직 수령 작업이 없습니다.', 'insurance.empty': '아직 보험 노드가 없습니다. 시장 페이지에서 보험 주문을 선택하세요.', 'insurance.claim': '수령'
    },
    vi: {
      'common.backDashboard': 'Quay lại tài khoản', 'common.openAssets': 'Mở tài sản',
      'vault.product': '', 'vault.title': 'INFO Vault', 'vault.subtitle': 'Gửi USDT nhàn rỗi vào các gói vault có kỳ hạn và mở khóa sau 7, 15, 30, 60 hoặc 180 ngày.', 'vault.estimatedApr': 'APR ước tính 12,4%', 'vault.myVault': 'Vault của tôi', 'vault.accruedYield': 'Lợi suất tích lũy', 'vault.infBoost': 'Tăng tốc INF', 'vault.tvl': 'TVL vault', 'vault.yieldCurve': 'Đường cong lợi suất', 'vault.dailySettlement': 'Quyết toán hằng ngày', 'vault.rules': 'Quy tắc vault', 'vault.terms': 'Kỳ hạn khóa', 'vault.yieldSettlement': 'Quyết toán lợi suất', 'vault.withdraw': 'Rút', 'vault.afterLock': 'Rút sau khi hết khóa', 'vault.creditsBoost': 'Tăng Credits', 'vault.longerBoost': 'Kỳ hạn càng dài, hệ số càng cao', 'vault.ledger': 'Sổ cái vault', 'vault.manage': 'Quản lý vault', 'vault.deposit': 'Gửi', 'vault.withdrawAction': 'Rút', 'vault.lockTerm': 'Kỳ hạn khóa', 'vault.amount': 'Số tiền', 'vault.confirmDeposit': 'Xác nhận gửi', 'vault.confirmWithdraw': 'Xác nhận rút', 'vault.depositNote': 'Khóa USDT trong INFO Vault trong {days} ngày.', 'vault.withdrawNote': 'Chuyển USDT đã mở khóa về số dư khả dụng.', 'vault.account': 'Tài khoản vault của tôi', 'vault.available': 'Khả dụng', 'vault.principal': 'Gốc', 'vault.claimableYield': 'Lợi suất có thể nhận', 'vault.currentTerm': 'Kỳ hạn hiện tại', 'vault.unlockDate': 'Ngày mở khóa', 'vault.afterDeposit': 'Hiển thị sau khi gửi', 'vault.noMovements': 'Chưa có giao dịch vault.',
      'insurance.eyebrow': '', 'insurance.title': 'Bảo hiểm INFO Alpha', 'insurance.subtitle': 'Có thể mua bảo hiểm tùy chọn khi đặt lệnh dự đoán. Nếu vị thế lỗ đã được xác minh, USDT có thể nhận sẽ được giải ngân theo lịch của quỹ bảo hiểm.', 'insurance.tradeCover': 'Giao dịch kèm bảo hiểm', 'insurance.pool': 'Quỹ bảo hiểm', 'insurance.activeCover': 'Bảo hiểm hiệu lực', 'insurance.claimable': 'Có thể nhận', 'insurance.payoutRatio': 'Tỷ lệ chi trả', 'insurance.nodes': 'Nút chi trả', 'insurance.loadNodes': 'Tải nút thử nghiệm', 'insurance.node': 'Nút', 'insurance.source': 'Nguồn', 'insurance.premium': 'Phí bảo hiểm', 'insurance.maxCover': 'Bảo hiểm tối đa', 'insurance.thisPeriod': 'Kỳ này', 'insurance.status': 'Trạng thái', 'insurance.flow': 'Quy trình bảo hiểm', 'insurance.step1': '1. Đặt lệnh', 'insurance.step1Body': 'Thanh toán phí bảo hiểm cùng lệnh dự đoán', 'insurance.step2': '2. Xác minh lỗ', 'insurance.step2Body': 'Oracle hoặc quản trị đánh dấu khoản lỗ đủ điều kiện', 'insurance.step3': '3. Tạo nút', 'insurance.step3Body': 'Chứng từ chi trả nội bộ, không phải NFT on-chain', 'insurance.step4': '4. Lịch chi trả', 'insurance.step4Body': 'Giải ngân theo sức khỏe quỹ và cấp rủi ro người dùng', 'insurance.poolHealth': 'Sức khỏe quỹ', 'insurance.premiumIncome': 'Doanh thu phí', 'insurance.pendingPayout': 'Chi trả chờ xử lý', 'insurance.singleMax': 'Bảo hiểm tối đa mỗi lệnh', 'insurance.payoutCycle': 'Chu kỳ chi trả', 'insurance.productRule': 'Quy tắc sản phẩm', 'insurance.ruleBody': 'Nút bảo hiểm là chứng từ chi trả nội bộ. Chúng không phải NFT và không thể chuyển nhượng. Chi trả phụ thuộc vào kết quả quyết toán, sức khỏe quỹ, điểm rủi ro người dùng và loại lệnh.', 'insurance.claimResult': 'Kết quả nhận', 'insurance.noClaim': 'Chưa có thao tác nhận.', 'insurance.empty': 'Chưa có nút bảo hiểm. Hãy chọn bảo hiểm khi đặt lệnh trên trang thị trường.', 'insurance.claim': 'Nhận'
    },
    id: {
      'common.backDashboard': 'Kembali ke akun', 'common.openAssets': 'Buka aset',
      'vault.product': '', 'vault.title': 'INFO Vault', 'vault.subtitle': 'Setorkan USDT menganggur ke paket vault berjangka dan buka setelah 7, 15, 30, 60, atau 180 hari.', 'vault.estimatedApr': 'Estimasi APR 12,4%', 'vault.myVault': 'Vault saya', 'vault.accruedYield': 'Imbal hasil akrual', 'vault.infBoost': 'Boost INF', 'vault.tvl': 'TVL vault', 'vault.yieldCurve': 'Kurva imbal hasil', 'vault.dailySettlement': 'Penyelesaian harian', 'vault.rules': 'Aturan vault', 'vault.terms': 'Tenor lock', 'vault.yieldSettlement': 'Penyelesaian imbal hasil', 'vault.withdraw': 'Tarik', 'vault.afterLock': 'Dapat ditarik setelah lock berakhir', 'vault.creditsBoost': 'Boost Credits', 'vault.longerBoost': 'Tenor lebih panjang memberi boost lebih tinggi', 'vault.ledger': 'Buku besar vault', 'vault.manage': 'Kelola vault', 'vault.deposit': 'Setor', 'vault.withdrawAction': 'Tarik', 'vault.lockTerm': 'Tenor lock', 'vault.amount': 'Jumlah', 'vault.confirmDeposit': 'Konfirmasi setor', 'vault.confirmWithdraw': 'Konfirmasi tarik', 'vault.depositNote': 'Mengunci USDT selama {days} hari di INFO Vault.', 'vault.withdrawNote': 'Memindahkan USDT yang sudah terbuka kembali ke saldo tersedia.', 'vault.account': 'Akun vault saya', 'vault.available': 'Tersedia', 'vault.principal': 'Pokok', 'vault.claimableYield': 'Imbal hasil dapat diklaim', 'vault.currentTerm': 'Tenor saat ini', 'vault.unlockDate': 'Tanggal unlock', 'vault.afterDeposit': 'Ditampilkan setelah setor', 'vault.noMovements': 'Belum ada mutasi vault.',
      'insurance.eyebrow': '', 'insurance.title': 'INFO Alpha Insurance', 'insurance.subtitle': 'Beli perlindungan opsional bersama order prediksi. Jika posisi mengalami kerugian terverifikasi, USDT yang dapat diklaim dirilis sesuai jadwal pool asuransi.', 'insurance.tradeCover': 'Trading dengan proteksi', 'insurance.pool': 'Pool asuransi', 'insurance.activeCover': 'Proteksi aktif', 'insurance.claimable': 'Dapat diklaim', 'insurance.payoutRatio': 'Rasio pembayaran', 'insurance.nodes': 'Node pembayaran', 'insurance.loadNodes': 'Muat node uji', 'insurance.node': 'Node', 'insurance.source': 'Sumber', 'insurance.premium': 'Premi', 'insurance.maxCover': 'Proteksi maksimum', 'insurance.thisPeriod': 'Periode ini', 'insurance.status': 'Status', 'insurance.flow': 'Alur asuransi', 'insurance.step1': '1. Penempatan order', 'insurance.step1Body': 'Bayar premi bersama order prediksi', 'insurance.step2': '2. Verifikasi kerugian', 'insurance.step2Body': 'Oracle atau admin menandai kerugian yang memenuhi syarat', 'insurance.step3': '3. Node dibuat', 'insurance.step3Body': 'Kredensial pembayaran internal, bukan NFT on-chain', 'insurance.step4': '4. Jadwal pembayaran', 'insurance.step4Body': 'Dirilis berdasarkan kesehatan pool dan tier risiko pengguna', 'insurance.poolHealth': 'Kesehatan pool', 'insurance.premiumIncome': 'Pendapatan premi', 'insurance.pendingPayout': 'Pembayaran tertunda', 'insurance.singleMax': 'Proteksi maksimum per order', 'insurance.payoutCycle': 'Siklus pembayaran', 'insurance.productRule': 'Aturan produk', 'insurance.ruleBody': 'Node asuransi adalah kredensial pembayaran internal. Bukan NFT dan tidak dapat dipindahtangankan. Pembayaran bergantung pada hasil penyelesaian, kesehatan pool, skor risiko pengguna, dan jenis order.', 'insurance.claimResult': 'Hasil klaim', 'insurance.noClaim': 'Belum ada tindakan klaim.', 'insurance.empty': 'Belum ada node asuransi. Pilih asuransi saat membuat order dari halaman market.', 'insurance.claim': 'Klaim'
    }
  };
  Object.entries(pageTranslations).forEach(([locale, values]) => Object.assign(dict[locale], values));

  const orderTranslations = {
    en: {
      'order.place': 'Place order',
      'order.buy': 'Buy',
      'order.balance': 'Available balance',
      'order.oneTap': 'Quick order',
      'order.insurance': 'Alpha Insurance',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': 'Place another order',
      'order.regionCheck': 'Region check required',
      'order.loginToTrade': 'Log in / Sign up',
      'order.signInToViewBalance': 'Sign in to view balance',
      'order.depositToTrade': 'Deposit USDT',
      'order.insufficientBalance': 'Insufficient available balance.',
      'order.marketClosed': 'Market closed',
      'order.awaitingSettlement': 'Trading is closed. Settlement will update after the result is confirmed.',
      'order.regionUnavailable': 'Trading is not available in your region.',
      'order.checkRegion': 'Region unavailable',
      'order.latestPosition': 'Latest position',
      'order.ruleYesNo': 'YES/NO market',
      'order.ruleCrypto': 'Up/Down market',
      'order.ruleScore': 'Fixed score odds; no sell',
      'order.scoreInfo': 'Correct score uses fixed odds. After buying, this position cannot be sold before settlement.',
      'order.cryptoInfo': 'Crypto markets use Up / Down outcomes.',
      'order.yesNoInfo': 'Markets use YES / NO outcomes.',
      'order.confirmTitle': 'Confirm order',
      'order.market': 'Market',
      'order.pick': 'Pick',
      'order.amount': 'Amount',
      'order.potentialReturn': 'Potential return',
      'order.tradeRule': 'Trade rule',
      'order.confirmPlace': 'Confirm and place',
      'order.note': 'Order uses your internal USDT balance. Winning settlement returns payout to available balance.',
      'order.open': 'Open',
      'order.placed': 'Order placed',
      'order.failed': 'Order failed'
    },
    'zh-CN': {
      'order.place': '下单',
      'order.buy': '买入',
      'order.balance': '可用余额',
      'order.oneTap': '快捷下单',
      'order.insurance': 'Alpha 保险',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': '继续下单',
      'order.regionCheck': '需要完成地区检查',
      'order.loginToTrade': '登录 / 注册',
      'order.signInToViewBalance': '登录后查看余额',
      'order.depositToTrade': '充值 USDT',
      'order.insufficientBalance': '可用余额不足。',
      'order.marketClosed': '市场已截止',
      'order.awaitingSettlement': '交易已截止，结果确认后会自动结算。',
      'order.regionUnavailable': '当前地区暂不支持交易。',
      'order.checkRegion': '地区暂不可用',
      'order.latestPosition': '最新持仓',
      'order.ruleYesNo': 'YES/NO 市场',
      'order.ruleCrypto': '上涨/下跌市场',
      'order.ruleScore': '固定比分赔率；不可卖出',
      'order.scoreInfo': '比分采用固定赔率。买入后不能卖出，只能等待结算。',
      'order.cryptoInfo': '加密市场使用上涨 / 下跌方向。',
      'order.yesNoInfo': '该市场使用 YES / NO 结果。',
      'order.confirmTitle': '确认订单',
      'order.market': '市场',
      'order.pick': '选择',
      'order.amount': '金额',
      'order.potentialReturn': '预计返还',
      'order.tradeRule': '交易规则',
      'order.confirmPlace': '确认下单',
      'order.note': '订单使用你的内部 USDT 余额。赢单结算后，返还金额进入可用余额。',
      'order.open': '未结算',
      'order.placed': '下单成功',
      'order.failed': '下单失败'
    },
    ja: {
      'order.place': '注文する',
      'order.buy': '購入',
      'order.balance': '利用可能残高',
      'order.oneTap': 'クイック注文',
      'order.insurance': 'Alpha 保険',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': '続けて注文',
      'order.regionCheck': '地域確認が必要です',
      'order.loginToTrade': 'ログイン / 登録',
      'order.signInToViewBalance': 'ログインすると残高を確認できます',
      'order.depositToTrade': 'USDT を入金',
      'order.insufficientBalance': '利用可能残高が不足しています。',
      'order.marketClosed': 'マーケット終了',
      'order.awaitingSettlement': '取引は終了しました。結果確認後に決済されます。',
      'order.regionUnavailable': 'お住まいの地域では取引できません。',
      'order.checkRegion': '地域対象外',
      'order.latestPosition': '最新ポジション',
      'order.ruleYesNo': 'YES/NO マーケット',
      'order.ruleCrypto': 'Up/Down マーケット',
      'order.ruleScore': '固定スコアオッズ・売却不可',
      'order.scoreInfo': '正確スコアは固定オッズです。購入後は決済まで売却できません。',
      'order.cryptoInfo': '暗号資産マーケットは Up / Down で取引します。',
      'order.yesNoInfo': 'このマーケットは YES / NO で取引します。',
      'order.confirmTitle': '注文確認',
      'order.market': 'マーケット',
      'order.pick': '選択',
      'order.amount': '金額',
      'order.potentialReturn': '想定リターン',
      'order.tradeRule': '取引ルール',
      'order.confirmPlace': '確認して注文',
      'order.note': '注文は内部 USDT 残高を使用します。勝利時の決済金は利用可能残高に反映されます。',
      'order.open': '未決済',
      'order.placed': '注文しました',
      'order.failed': '注文失敗'
    },
    ko: {
      'order.place': '주문하기',
      'order.buy': '매수',
      'order.balance': '사용 가능 잔액',
      'order.oneTap': '빠른 주문',
      'order.insurance': 'Alpha 보험',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': '추가 주문',
      'order.regionCheck': '지역 확인 필요',
      'order.loginToTrade': '로그인 / 가입',
      'order.signInToViewBalance': '로그인 후 잔액을 확인하세요',
      'order.depositToTrade': 'USDT 입금',
      'order.insufficientBalance': '사용 가능 잔액이 부족합니다.',
      'order.marketClosed': '마켓 마감',
      'order.awaitingSettlement': '거래가 마감되었습니다. 결과 확인 후 정산됩니다.',
      'order.regionUnavailable': '현재 지역에서는 거래할 수 없습니다.',
      'order.checkRegion': '지역 이용 불가',
      'order.latestPosition': '최근 포지션',
      'order.ruleYesNo': 'YES/NO 마켓',
      'order.ruleCrypto': 'Up/Down 마켓',
      'order.ruleScore': '고정 스코어 배당 · 매도 불가',
      'order.scoreInfo': '정확한 스코어는 고정 배당입니다. 매수 후 정산 전에는 매도할 수 없습니다.',
      'order.cryptoInfo': '암호화폐 마켓은 Up / Down 결과를 사용합니다.',
      'order.yesNoInfo': '이 마켓은 YES / NO 결과를 사용합니다.',
      'order.confirmTitle': '주문 확인',
      'order.market': '마켓',
      'order.pick': '선택',
      'order.amount': '금액',
      'order.potentialReturn': '예상 반환',
      'order.tradeRule': '거래 규칙',
      'order.confirmPlace': '확인 후 주문',
      'order.note': '주문은 내부 USDT 잔액을 사용합니다. 승리 정산금은 사용 가능 잔액으로 반영됩니다.',
      'order.open': '미정산',
      'order.placed': '주문 완료',
      'order.failed': '주문 실패'
    },
    vi: {
      'order.place': 'Đặt lệnh',
      'order.buy': 'Mua',
      'order.balance': 'Số dư khả dụng',
      'order.oneTap': 'Đặt nhanh',
      'order.insurance': 'Alpha Insurance',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': 'Đặt lệnh khác',
      'order.regionCheck': 'Cần kiểm tra khu vực',
      'order.loginToTrade': 'Đăng nhập / Đăng ký',
      'order.signInToViewBalance': 'Đăng nhập để xem số dư',
      'order.depositToTrade': 'Nạp USDT',
      'order.insufficientBalance': 'Số dư khả dụng không đủ.',
      'order.marketClosed': 'Thị trường đã đóng',
      'order.awaitingSettlement': 'Giao dịch đã đóng. Hệ thống sẽ quyết toán sau khi xác nhận kết quả.',
      'order.regionUnavailable': 'Khu vực của bạn hiện chưa hỗ trợ giao dịch.',
      'order.checkRegion': 'Khu vực chưa hỗ trợ',
      'order.latestPosition': 'Vị thế mới nhất',
      'order.ruleYesNo': 'Thị trường YES/NO',
      'order.ruleCrypto': 'Thị trường Up/Down',
      'order.ruleScore': 'Odds tỷ số cố định; không thể bán',
      'order.scoreInfo': 'Tỷ số chính xác dùng odds cố định. Sau khi mua, vị thế không thể bán trước khi quyết toán.',
      'order.cryptoInfo': 'Thị trường crypto sử dụng kết quả Up / Down.',
      'order.yesNoInfo': 'Thị trường này sử dụng kết quả YES / NO.',
      'order.confirmTitle': 'Xác nhận lệnh',
      'order.market': 'Thị trường',
      'order.pick': 'Lựa chọn',
      'order.amount': 'Số tiền',
      'order.potentialReturn': 'Lợi nhuận dự kiến',
      'order.tradeRule': 'Quy tắc giao dịch',
      'order.confirmPlace': 'Xác nhận đặt lệnh',
      'order.note': 'Lệnh sử dụng số dư USDT nội bộ. Khi thắng, khoản quyết toán sẽ về số dư khả dụng.',
      'order.open': 'Đang mở',
      'order.placed': 'Đã đặt lệnh',
      'order.failed': 'Đặt lệnh thất bại'
    },
    id: {
      'order.place': 'Pasang order',
      'order.buy': 'Beli',
      'order.balance': 'Saldo tersedia',
      'order.oneTap': 'Order cepat',
      'order.insurance': 'Alpha Insurance',
      'order.infCredits': 'INF Credits',
      'order.placeAnother': 'Pasang order lagi',
      'order.regionCheck': 'Pemeriksaan wilayah diperlukan',
      'order.loginToTrade': 'Masuk / Daftar',
      'order.signInToViewBalance': 'Masuk untuk melihat saldo',
      'order.depositToTrade': 'Deposit USDT',
      'order.insufficientBalance': 'Saldo tersedia tidak mencukupi.',
      'order.marketClosed': 'Pasar ditutup',
      'order.awaitingSettlement': 'Trading sudah ditutup. Settlement diperbarui setelah hasil dikonfirmasi.',
      'order.regionUnavailable': 'Trading belum tersedia di wilayah Anda.',
      'order.checkRegion': 'Wilayah tidak tersedia',
      'order.latestPosition': 'Posisi terbaru',
      'order.ruleYesNo': 'Pasar YES/NO',
      'order.ruleCrypto': 'Pasar Up/Down',
      'order.ruleScore': 'Odds skor tetap; tidak dapat dijual',
      'order.scoreInfo': 'Skor tepat memakai odds tetap. Setelah membeli, posisi tidak dapat dijual sebelum settlement.',
      'order.cryptoInfo': 'Pasar kripto menggunakan hasil Up / Down.',
      'order.yesNoInfo': 'Pasar ini menggunakan hasil YES / NO.',
      'order.confirmTitle': 'Konfirmasi order',
      'order.market': 'Pasar',
      'order.pick': 'Pilihan',
      'order.amount': 'Jumlah',
      'order.potentialReturn': 'Potensi hasil',
      'order.tradeRule': 'Aturan trading',
      'order.confirmPlace': 'Konfirmasi dan pasang',
      'order.note': 'Order menggunakan saldo USDT internal. Settlement menang akan masuk ke saldo tersedia.',
      'order.open': 'Terbuka',
      'order.placed': 'Order berhasil',
      'order.failed': 'Order gagal'
    }
  };
  Object.entries(orderTranslations).forEach(([locale, values]) => Object.assign(dict[locale], values));

  const accountTranslations = {
    en: {
      'account.eyebrow': '', 'account.title': 'Account overview',
      'account.subtitle': 'Manage USDT balances, prediction positions, INFO Vault, Alpha Insurance, and INF Credits unlock progress.',
      'account.depositWithdraw': 'Deposit / Withdraw', 'account.availableBalance': 'Available balance',
      'account.frozenOrders': 'Frozen in orders', 'account.vaultBalance': 'Vault balance', 'account.infCredits': 'INF Credits',
      'account.currentPositions': 'Current positions', 'account.viewAll': 'View all', 'account.unlock': 'INF Credits unlock',
      'account.cumulativeVolume': 'Cumulative volume', 'account.activeDays': 'Active days', 'account.vaultLock': 'Vault lock',
      'account.unlockableAmount': 'Unlockable amount', 'account.quickActions': 'Quick actions',
      'account.assetsDesc': 'Deposit, withdraw, and internal balances', 'account.positionsDesc': 'Orders, PnL, and settlement status',
      'account.rewardsDesc': 'Mining, tasks, and referrals', 'account.vaultDesc': 'USDT yield with INF Credits boost',
      'account.insuranceDesc': 'Claim nodes and insurance cover', 'account.activeCover': 'Active cover',
      'account.poolHealth': 'Pool health', 'account.healthy': 'Healthy', 'account.openInsuranceNodes': 'Open insurance nodes',
      'assets.eyebrow': '', 'assets.title': 'Assets',
      'assets.subtitle': 'Manage USDT deposits, withdrawals, available balance, vault funds, and claimable payouts.',
      'assets.available': 'Available', 'assets.frozen': 'Frozen', 'assets.vault': 'Vault', 'assets.claimable': 'Claimable',
      'assets.deposit': 'USDT deposit', 'assets.depositAddress': 'Deposit address', 'assets.confirmDepositAmount': 'Confirm deposit amount',
      'assets.depositNote': 'Deposits credit the internal USDT ledger after chain confirmation. Production will assign a unique address per user and reconcile every transfer.',
      'assets.ledgerEntries': 'Ledger entries', 'assets.refreshLedger': 'Refresh ledger', 'assets.withdrawal': 'USDT withdrawal',
      'assets.withdrawAddress': 'Withdrawal address', 'assets.withdrawPlaceholder': 'Paste USDT address', 'assets.amount': 'Amount',
      'assets.submitWithdrawal': 'Submit withdrawal', 'assets.withdrawNote': 'Withdrawals are created from your internal USDT balance first. A later backend service will sign and broadcast hot-wallet transfers.',
      'assets.withdrawStatus': 'Withdrawal status', 'assets.accountBuckets': 'Account buckets',
      'positions.eyebrow': '', 'positions.title': 'Positions',
      'positions.subtitle': 'Track football YES/NO, correct-score fixed-odds positions, crypto Up/Down trades, potential returns, and insurance cover.',
      'positions.continueTrading': 'Continue trading', 'positions.totalStaked': 'Total staked', 'positions.potentialReturn': 'Potential return',
      'positions.insuredAmount': 'Insured amount', 'positions.open': 'Open', 'positions.settled': 'Settled', 'positions.insured': 'Insured',
      'rewards.eyebrow': '', 'rewards.title': 'INF Rewards',
      'rewards.subtitle': 'Trading mining, vault boost, Alpha Insurance boost, referrals, and task rewards are aggregated here. Credits are locked until unlock conditions are met.',
      'rewards.claimUnlocked': 'Claim unlocked INF', 'rewards.totalCredits': 'Total Credits', 'rewards.unlocked': 'Unlocked',
      'rewards.todayAdded': 'Today added', 'rewards.referralRebate': 'Referral rebate', 'rewards.unlockConditions': 'Unlock conditions',
      'rewards.tradingVolume': 'Cumulative trading volume', 'rewards.vaultDuration': 'Vault balance duration',
      'rewards.validReferrals': 'Valid referrals', 'rewards.ledger': 'Reward ledger', 'rewards.openPositions': 'Open positions',
      'rewards.tasks': 'Tasks', 'rewards.miningWeights': 'Mining weights', 'rewards.tradingFee': 'Trading fee',
      'rewards.marketActivity': 'Market activity', 'rewards.insuranceParticipation': 'Insurance participation',
      'rewards.referralLink': 'Referral link', 'rewards.referralNote': 'A valid referral counts after the invited user completes a deposit and first trade.',
      'rewards.leaderboard': 'Leaderboard', 'rewards.you': 'You',
      'rewards.vaultDays': '18 days',
      'table.market': 'Market', 'table.pick': 'Pick', 'table.amount': 'Amount', 'table.potentialReturn': 'Potential return',
      'table.status': 'Status', 'table.type': 'Type', 'table.note': 'Note', 'table.time': 'Time',
      'table.infCredits': 'INF Credits', 'table.insurance': 'Insurance', 'table.rule': 'Rule', 'table.source': 'Source',
      'table.credits': 'Credits', 'table.multiplier': 'Multiplier',
      'state.noActivePositions': 'No active positions yet. Open a market and place your first order.',
      'state.noPositions': 'No {status} positions yet. Place an order from a market page.',
      'state.noLedger': 'No ledger entries yet. Simulate a deposit or place an order.',
      'state.noWithdrawals': 'No withdrawal requests.',
      'state.noRewards': 'No rewards yet. Trade, deposit into vault, or invite users to earn INF Credits.',
      'status.booked': 'Booked', 'status.confirmed': 'Confirmed', 'status.pendingReview': 'Pending review',
      'status.open': 'Open', 'status.settled': 'Settled', 'status.insured': 'Insured', 'status.won': 'Won', 'status.lost': 'Lost',
      'rule.openMarket': 'Open market', 'rule.noSellBeforeSettlement': 'No sell before settlement',
      'reward.orderReward': 'Order reward', 'reward.vaultBoost': 'INFO Vault boost', 'reward.insuranceBoost': 'Alpha Insurance boost',
      'reward.referralRebate': 'Referral rebate', 'reward.daily': 'Daily', 'reward.campaign': 'Campaign',
      'ledger.tradingMiningReward': 'Trading mining reward',
      'task.firstOrder': 'Place first prediction order', 'task.tradeVolume': 'Trade 10,000 USDT volume',
      'task.depositVault': 'Deposit into INFO Vault', 'task.useInsurance': 'Use Alpha Insurance',
      'task.inVault': 'in vault', 'task.insuranceNodes': 'insurance nodes', 'common.copy': 'Copy', 'common.copied': 'Copied',
      'common.done': 'Done', 'common.open': 'Open', 'rewards.claimQueued': 'INF claim queued',
      'static.activeDaysValue': '18 / 30 days', 'static.validRefsValue': '7 / 10 users'
    },
    'zh-CN': {
      'account.eyebrow': '', 'account.title': '账户总览', 'account.subtitle': '管理 USDT 余额、预测持仓、INFO 金库、Alpha 保险和 INF Credits 解锁进度。', 'account.depositWithdraw': '充值 / 提现', 'account.availableBalance': '可用余额', 'account.frozenOrders': '订单冻结', 'account.vaultBalance': '金库余额', 'account.infCredits': 'INF Credits', 'account.currentPositions': '当前持仓', 'account.viewAll': '查看全部', 'account.unlock': 'INF Credits 解锁', 'account.cumulativeVolume': '累计交易量', 'account.activeDays': '活跃天数', 'account.vaultLock': '金库锁仓', 'account.unlockableAmount': '可解锁额度', 'account.quickActions': '快捷操作', 'account.assetsDesc': '充值、提现和内部余额', 'account.positionsDesc': '订单、盈亏和结算状态', 'account.rewardsDesc': '挖矿、任务和邀请', 'account.vaultDesc': 'USDT 收益与 INF Credits 加成', 'account.insuranceDesc': '赔付节点和保险保障', 'account.activeCover': '生效保额', 'account.poolHealth': '保险池状态', 'account.healthy': '健康', 'account.openInsuranceNodes': '打开保险节点',
      'assets.eyebrow': '', 'assets.title': '资产', 'assets.subtitle': '管理 USDT 充值、提现、可用余额、金库资金和可领取金额。', 'assets.available': '可用', 'assets.frozen': '冻结', 'assets.vault': '金库', 'assets.claimable': '可领取', 'assets.deposit': 'USDT 充值', 'assets.depositAddress': '充值地址', 'assets.confirmDepositAmount': '确认充值金额', 'assets.depositNote': '链上确认后，充值会记入你的 USDT 余额。正式环境会为每个用户分配独立地址并对账每笔转账。', 'assets.ledgerEntries': '资产流水', 'assets.refreshLedger': '刷新流水', 'assets.withdrawal': 'USDT 提现', 'assets.withdrawAddress': '提现地址', 'assets.withdrawPlaceholder': '粘贴 USDT 地址', 'assets.amount': '金额', 'assets.submitWithdrawal': '提交提现', 'assets.withdrawNote': '提现申请提交后，系统会完成审核并广播转账。', 'assets.withdrawStatus': '提现状态', 'assets.accountBuckets': '账户余额',
      'positions.eyebrow': '', 'positions.title': '持仓', 'positions.subtitle': '查看足球 YES/NO、固定赔率比分、加密 Up/Down 交易、潜在回报和保险保障。', 'positions.continueTrading': '继续交易', 'positions.totalStaked': '累计投入', 'positions.potentialReturn': '潜在回报', 'positions.insuredAmount': '已保险金额', 'positions.open': '未结算', 'positions.settled': '已结算', 'positions.insured': '已保险',
      'rewards.eyebrow': '', 'rewards.title': 'INF 奖励', 'rewards.subtitle': '交易挖矿、金库加成、Alpha 保险加成、邀请和任务奖励都会汇总在这里。Credits 在满足解锁条件前保持锁定。', 'rewards.claimUnlocked': '领取已解锁 INF', 'rewards.totalCredits': 'Credits 总额', 'rewards.unlocked': '已解锁', 'rewards.todayAdded': '今日新增', 'rewards.referralRebate': '邀请返佣', 'rewards.unlockConditions': '解锁条件', 'rewards.tradingVolume': '累计交易量', 'rewards.vaultDuration': '金库余额时长', 'rewards.validReferrals': '有效邀请', 'rewards.ledger': '奖励流水', 'rewards.openPositions': '打开持仓', 'rewards.tasks': '任务', 'rewards.miningWeights': '挖矿权重', 'rewards.tradingFee': '交易手续费', 'rewards.marketActivity': '市场活跃度', 'rewards.insuranceParticipation': '保险参与', 'rewards.referralLink': '邀请链接', 'rewards.referralNote': '被邀请用户完成充值和首笔交易后，才计为有效邀请。', 'rewards.leaderboard': '排行榜', 'rewards.you': '你',
      'table.market': '市场', 'table.pick': '选择', 'table.amount': '金额', 'table.potentialReturn': '潜在回报', 'table.status': '状态', 'table.type': '类型', 'table.note': '备注', 'table.time': '时间', 'table.infCredits': 'INF Credits', 'table.insurance': '保险', 'table.rule': '规则', 'table.source': '来源', 'table.credits': 'Credits', 'table.multiplier': '倍数',
      'state.noActivePositions': '暂无进行中的持仓。打开市场并完成第一笔下单。', 'state.noPositions': '暂无{status}持仓。请从市场页下单。', 'state.noLedger': '暂无账本流水。充值或下单后会显示在这里。', 'state.noWithdrawals': '暂无提现申请。', 'state.noRewards': '暂无奖励。交易、存入金库或邀请用户可获得 INF Credits。',
      'status.booked': '已入账', 'status.confirmed': '已确认', 'status.pendingReview': '待审核', 'status.open': '未结算', 'status.settled': '已结算', 'status.insured': '已保险', 'status.won': '已赢', 'status.lost': '已输',
      'rule.openMarket': '可交易市场', 'rule.noSellBeforeSettlement': '结算前不可卖出', 'reward.orderReward': '订单奖励', 'reward.vaultBoost': 'INFO 金库加成', 'reward.insuranceBoost': 'Alpha 保险加成', 'reward.referralRebate': '邀请返佣', 'reward.daily': '每日', 'reward.campaign': '活动', 'ledger.tradingMiningReward': '交易挖矿奖励', 'task.firstOrder': '完成首笔预测订单', 'task.tradeVolume': '交易量达到 10,000 USDT', 'task.depositVault': '存入 INFO 金库', 'task.useInsurance': '使用 Alpha 保险', 'task.inVault': '在金库中', 'task.insuranceNodes': '个保险节点', 'common.copy': '复制', 'common.copied': '已复制', 'common.done': '已完成', 'common.open': '未完成', 'rewards.claimQueued': 'INF 领取已排队', 'static.activeDaysValue': '18 / 30 天', 'static.validRefsValue': '7 / 10 人'
    }
  };
  accountTranslations.ja = Object.assign({}, accountTranslations.en, { 'account.title': 'アカウント概要', 'assets.title': '資産', 'positions.title': 'ポジション', 'rewards.title': 'INF 報酬', 'rewards.eyebrow': '', 'account.eyebrow': '', 'assets.eyebrow': '', 'positions.eyebrow': '', 'account.depositWithdraw': '入金 / 出金', 'positions.continueTrading': '取引を続ける', 'rewards.claimUnlocked': '解除済み INF を請求', 'account.currentPositions': '現在のポジション', 'account.quickActions': 'クイック操作', 'assets.deposit': 'USDT 入金', 'assets.withdrawal': 'USDT 出金', 'assets.ledgerEntries': '資産履歴', 'assets.withdrawStatus': '出金ステータス', 'rewards.unlockConditions': '解除条件', 'rewards.ledger': '報酬履歴', 'rewards.tasks': 'タスク', 'table.market': 'マーケット', 'table.pick': '選択', 'table.amount': '金額', 'table.status': 'ステータス', 'common.copy': 'コピー', 'common.copied': 'コピー済み', 'common.done': '完了', 'common.open': '未完了' });
  accountTranslations.ko = Object.assign({}, accountTranslations.en, { 'account.title': '계정 개요', 'assets.title': '자산', 'positions.title': '포지션', 'rewards.title': 'INF 리워드', 'rewards.eyebrow': '', 'account.eyebrow': '', 'assets.eyebrow': '', 'positions.eyebrow': '', 'account.depositWithdraw': '입금 / 출금', 'positions.continueTrading': '거래 계속하기', 'rewards.claimUnlocked': '잠금 해제 INF 수령', 'account.currentPositions': '현재 포지션', 'account.quickActions': '빠른 작업', 'assets.deposit': 'USDT 입금', 'assets.withdrawal': 'USDT 출금', 'assets.ledgerEntries': '자산 내역', 'assets.withdrawStatus': '출금 상태', 'rewards.unlockConditions': '잠금 해제 조건', 'rewards.ledger': '리워드 내역', 'rewards.tasks': '작업', 'table.market': '마켓', 'table.pick': '선택', 'table.amount': '금액', 'table.status': '상태', 'common.copy': '복사', 'common.copied': '복사됨', 'common.done': '완료', 'common.open': '미완료' });
  accountTranslations.vi = Object.assign({}, accountTranslations.en, { 'account.title': 'Tổng quan tài khoản', 'assets.title': 'Tài sản', 'positions.title': 'Vị thế', 'rewards.title': 'Thưởng INF', 'rewards.eyebrow': '', 'account.eyebrow': '', 'assets.eyebrow': '', 'positions.eyebrow': '', 'account.depositWithdraw': 'Nạp / Rút', 'positions.continueTrading': 'Tiếp tục giao dịch', 'rewards.claimUnlocked': 'Nhận INF đã mở khóa', 'account.currentPositions': 'Vị thế hiện tại', 'account.quickActions': 'Thao tác nhanh', 'assets.deposit': 'Nạp USDT', 'assets.withdrawal': 'Rút USDT', 'assets.ledgerEntries': 'Lịch sử tài sản', 'assets.withdrawStatus': 'Trạng thái rút', 'rewards.unlockConditions': 'Điều kiện mở khóa', 'rewards.ledger': 'Sổ thưởng', 'rewards.tasks': 'Nhiệm vụ', 'table.market': 'Thị trường', 'table.pick': 'Lựa chọn', 'table.amount': 'Số tiền', 'table.status': 'Trạng thái', 'common.copy': 'Sao chép', 'common.copied': 'Đã sao chép', 'common.done': 'Hoàn tất', 'common.open': 'Chưa xong' });
  accountTranslations.id = Object.assign({}, accountTranslations.en, { 'account.title': 'Ringkasan akun', 'assets.title': 'Aset', 'positions.title': 'Posisi', 'rewards.title': 'Reward INF', 'rewards.eyebrow': '', 'account.eyebrow': '', 'assets.eyebrow': '', 'positions.eyebrow': '', 'account.depositWithdraw': 'Deposit / Tarik', 'positions.continueTrading': 'Lanjut trading', 'rewards.claimUnlocked': 'Klaim INF terbuka', 'account.currentPositions': 'Posisi saat ini', 'account.quickActions': 'Aksi cepat', 'assets.deposit': 'Deposit USDT', 'assets.withdrawal': 'Penarikan USDT', 'assets.ledgerEntries': 'Riwayat aset', 'assets.withdrawStatus': 'Status penarikan', 'rewards.unlockConditions': 'Syarat unlock', 'rewards.ledger': 'Buku reward', 'rewards.tasks': 'Tugas', 'table.market': 'Pasar', 'table.pick': 'Pilihan', 'table.amount': 'Jumlah', 'table.status': 'Status', 'common.copy': 'Salin', 'common.copied': 'Disalin', 'common.done': 'Selesai', 'common.open': 'Belum selesai' });
  Object.assign(accountTranslations.ja, { 'account.subtitle': 'USDT 残高、予測ポジション、INFO 金庫、Alpha 保険、INF Credits の解除進捗を管理します。', 'assets.subtitle': 'USDT の入金、出金、利用可能残高、金庫資金、請求可能な支払いを管理します。', 'positions.subtitle': 'サッカーの YES/NO、固定オッズの正確スコア、暗号資産 Up/Down、想定リターン、保険カバーを確認できます。', 'rewards.subtitle': '取引マイニング、金庫ブースト、Alpha 保険ブースト、紹介、タスク報酬をここに集約します。Credits は解除条件を満たすまでロックされます。', 'account.availableBalance': '利用可能残高', 'account.frozenOrders': '注文中の凍結額', 'account.vaultBalance': '金庫残高', 'account.unlock': 'INF Credits 解除', 'account.cumulativeVolume': '累計取引量', 'account.activeDays': 'アクティブ日数', 'account.vaultLock': '金庫ロック', 'account.unlockableAmount': '解除可能額', 'assets.available': '利用可能', 'assets.frozen': '凍結中', 'assets.vault': '金庫', 'assets.claimable': '請求可能', 'assets.depositAddress': '入金アドレス', 'assets.confirmDepositAmount': '入金額を確認', 'assets.withdrawAddress': '出金アドレス', 'assets.submitWithdrawal': '出金を申請', 'positions.totalStaked': '累計投入額', 'positions.potentialReturn': '想定リターン', 'positions.insuredAmount': '保険対象額', 'positions.open': '未決済', 'positions.settled': '決済済み', 'positions.insured': '保険付き', 'rewards.totalCredits': 'Credits 合計', 'rewards.unlocked': '解除済み', 'rewards.todayAdded': '本日の追加', 'rewards.referralRebate': '紹介リベート', 'rewards.tradingVolume': '累計取引量', 'rewards.vaultDuration': '金庫残高の継続期間', 'rewards.validReferrals': '有効な紹介', 'rewards.miningWeights': 'マイニング比率', 'rewards.referralLink': '紹介リンク', 'rewards.leaderboard': 'ランキング', 'rewards.you': 'あなた', 'rewards.openPositions': 'ポジションを開く', 'rewards.vaultDays': '18 日', 'auth.backMarkets': 'マーケットへ戻る', 'table.source': 'ソース', 'table.multiplier': '倍率', 'table.time': '時刻', 'reward.orderReward': '注文報酬', 'reward.vaultBoost': 'INFO 金庫ブースト', 'reward.insuranceBoost': 'Alpha 保険ブースト', 'reward.referralRebate': '紹介リベート', 'reward.daily': '毎日', 'reward.campaign': 'キャンペーン', 'task.firstOrder': '最初の予測注文を行う', 'task.tradeVolume': '取引量 10,000 USDT を達成', 'task.depositVault': 'INFO 金庫に預け入れる', 'task.useInsurance': 'Alpha 保険を利用する', 'task.inVault': '金庫内', 'task.insuranceNodes': '保険ノード', 'rewards.tradingFee': '取引手数料', 'rewards.marketActivity': '市場アクティビティ', 'rewards.insuranceParticipation': '保険参加', 'rewards.referralNote': '招待されたユーザーが入金と初回取引を完了すると、有効な紹介としてカウントされます。', 'static.activeDaysValue': '18 / 30 日', 'static.validRefsValue': '7 / 10 人' });
  Object.assign(accountTranslations.ko, { 'account.subtitle': 'USDT 잔액, 예측 포지션, INFO 금고, Alpha 보험, INF Credits 잠금 해제 진행 상황을 관리합니다.', 'assets.subtitle': 'USDT 입금, 출금, 사용 가능 잔액, 금고 자금, 수령 가능 금액을 관리합니다.', 'positions.subtitle': '축구 YES/NO, 고정 배당 정확한 스코어, 암호화폐 Up/Down 거래, 예상 수익과 보험 보장을 확인합니다.', 'rewards.subtitle': '거래 마이닝, 금고 부스트, Alpha 보험 부스트, 추천 및 작업 리워드가 이곳에 집계됩니다. Credits는 조건 충족 전까지 잠깁니다.', 'account.availableBalance': '사용 가능 잔액', 'account.frozenOrders': '주문 동결', 'account.vaultBalance': '금고 잔액', 'account.unlock': 'INF Credits 잠금 해제', 'account.cumulativeVolume': '누적 거래량', 'account.activeDays': '활동 일수', 'account.vaultLock': '금고 잠금', 'account.unlockableAmount': '잠금 해제 가능 금액', 'assets.available': '사용 가능', 'assets.frozen': '동결', 'assets.vault': '금고', 'assets.claimable': '수령 가능', 'assets.depositAddress': '입금 주소', 'assets.confirmDepositAmount': '입금 금액 확인', 'assets.withdrawAddress': '출금 주소', 'assets.submitWithdrawal': '출금 신청', 'positions.totalStaked': '총 투입액', 'positions.potentialReturn': '예상 수익', 'positions.insuredAmount': '보험 적용 금액', 'positions.open': '미정산', 'positions.settled': '정산됨', 'positions.insured': '보험 적용', 'rewards.totalCredits': 'Credits 합계', 'rewards.unlocked': '잠금 해제됨', 'rewards.todayAdded': '오늘 추가', 'rewards.referralRebate': '추천 리베이트', 'rewards.tradingVolume': '누적 거래량', 'rewards.vaultDuration': '금고 잔액 유지 기간', 'rewards.validReferrals': '유효 추천', 'rewards.miningWeights': '마이닝 가중치', 'rewards.referralLink': '추천 링크', 'rewards.leaderboard': '리더보드', 'rewards.you': '나', 'rewards.openPositions': '포지션 열기', 'table.source': '출처', 'table.multiplier': '배수', 'table.time': '시간', 'reward.orderReward': '주문 리워드', 'reward.vaultBoost': 'INFO 금고 부스트', 'reward.insuranceBoost': 'Alpha 보험 부스트', 'reward.referralRebate': '추천 리베이트', 'reward.daily': '매일', 'reward.campaign': '캠페인', 'static.activeDaysValue': '18 / 30일', 'static.validRefsValue': '7 / 10명' });
  Object.assign(accountTranslations.vi, { 'account.subtitle': 'Quản lý số dư USDT, vị thế dự đoán, INFO Vault, Alpha Insurance và tiến độ mở khóa INF Credits.', 'assets.subtitle': 'Quản lý nạp, rút USDT, số dư khả dụng, tiền trong vault và khoản có thể nhận.', 'positions.subtitle': 'Theo dõi YES/NO bóng đá, tỷ số chính xác theo odds cố định, giao dịch crypto Up/Down, lợi nhuận tiềm năng và bảo hiểm.', 'rewards.subtitle': 'Trading mining, boost vault, boost Alpha Insurance, giới thiệu và nhiệm vụ được tổng hợp tại đây. Credits bị khóa cho đến khi đạt điều kiện mở khóa.', 'account.availableBalance': 'Số dư khả dụng', 'account.frozenOrders': 'Đang khóa trong lệnh', 'account.vaultBalance': 'Số dư vault', 'account.unlock': 'Mở khóa INF Credits', 'account.cumulativeVolume': 'Khối lượng tích lũy', 'account.activeDays': 'Ngày hoạt động', 'account.vaultLock': 'Khóa vault', 'account.unlockableAmount': 'Có thể mở khóa', 'assets.available': 'Khả dụng', 'assets.frozen': 'Đang khóa', 'assets.vault': 'Vault', 'assets.claimable': 'Có thể nhận', 'assets.depositAddress': 'Địa chỉ nạp', 'assets.confirmDepositAmount': 'Xác nhận số tiền nạp', 'assets.withdrawAddress': 'Địa chỉ rút', 'assets.submitWithdrawal': 'Gửi yêu cầu rút', 'positions.totalStaked': 'Tổng đã đặt', 'positions.potentialReturn': 'Lợi nhuận tiềm năng', 'positions.insuredAmount': 'Số tiền bảo hiểm', 'positions.open': 'Đang mở', 'positions.settled': 'Đã quyết toán', 'positions.insured': 'Có bảo hiểm', 'rewards.totalCredits': 'Tổng Credits', 'rewards.unlocked': 'Đã mở khóa', 'rewards.todayAdded': 'Thêm hôm nay', 'rewards.referralRebate': 'Hoàn thưởng giới thiệu', 'rewards.tradingVolume': 'Khối lượng giao dịch tích lũy', 'rewards.validReferrals': 'Giới thiệu hợp lệ', 'rewards.miningWeights': 'Trọng số mining', 'rewards.referralLink': 'Liên kết giới thiệu', 'rewards.leaderboard': 'Bảng xếp hạng', 'rewards.you': 'Bạn' });
  Object.assign(accountTranslations.vi, { 'rewards.vaultDuration': 'Thời lượng số dư vault', 'rewards.openPositions': 'Mở vị thế', 'table.source': 'Nguồn', 'table.multiplier': 'Hệ số', 'table.time': 'Thời gian', 'reward.orderReward': 'Thưởng lệnh', 'reward.vaultBoost': 'Boost INFO Vault', 'reward.insuranceBoost': 'Boost Alpha Insurance', 'reward.referralRebate': 'Hoàn thưởng giới thiệu', 'reward.daily': 'Hằng ngày', 'reward.campaign': 'Chiến dịch', 'static.activeDaysValue': '18 / 30 ngày', 'static.validRefsValue': '7 / 10 người dùng' });
  Object.assign(accountTranslations.id, { 'account.subtitle': 'Kelola saldo USDT, posisi prediksi, INFO Vault, Alpha Insurance, dan progres unlock INF Credits.', 'assets.subtitle': 'Kelola deposit, penarikan USDT, saldo tersedia, dana vault, dan payout yang dapat diklaim.', 'positions.subtitle': 'Pantau YES/NO sepak bola, skor tepat fixed-odds, trading crypto Up/Down, potensi hasil, dan proteksi asuransi.', 'rewards.subtitle': 'Trading mining, boost vault, boost Alpha Insurance, referral, dan reward tugas dikumpulkan di sini. Credits tetap terkunci sampai syarat unlock terpenuhi.', 'account.availableBalance': 'Saldo tersedia', 'account.frozenOrders': 'Dibekukan di order', 'account.vaultBalance': 'Saldo vault', 'account.unlock': 'Unlock INF Credits', 'account.cumulativeVolume': 'Volume kumulatif', 'account.activeDays': 'Hari aktif', 'account.vaultLock': 'Lock vault', 'account.unlockableAmount': 'Jumlah dapat di-unlock', 'assets.available': 'Tersedia', 'assets.frozen': 'Dibekukan', 'assets.vault': 'Vault', 'assets.claimable': 'Dapat diklaim', 'assets.depositAddress': 'Alamat deposit', 'assets.confirmDepositAmount': 'Konfirmasi jumlah deposit', 'assets.withdrawAddress': 'Alamat penarikan', 'assets.submitWithdrawal': 'Kirim penarikan', 'positions.totalStaked': 'Total stake', 'positions.potentialReturn': 'Potensi hasil', 'positions.insuredAmount': 'Jumlah diasuransikan', 'positions.open': 'Terbuka', 'positions.settled': 'Selesai', 'positions.insured': 'Diasuransikan', 'rewards.totalCredits': 'Total Credits', 'rewards.unlocked': 'Ter-unlock', 'rewards.todayAdded': 'Ditambah hari ini', 'rewards.referralRebate': 'Rebate referral', 'rewards.tradingVolume': 'Volume trading kumulatif', 'rewards.validReferrals': 'Referral valid', 'rewards.miningWeights': 'Bobot mining', 'rewards.referralLink': 'Link referral', 'rewards.leaderboard': 'Papan peringkat', 'rewards.you': 'Anda' });
  Object.assign(accountTranslations.id, { 'rewards.vaultDuration': 'Durasi saldo vault', 'rewards.openPositions': 'Buka posisi', 'table.source': 'Sumber', 'table.multiplier': 'Pengali', 'table.time': 'Waktu', 'reward.orderReward': 'Reward order', 'reward.vaultBoost': 'Boost INFO Vault', 'reward.insuranceBoost': 'Boost Alpha Insurance', 'reward.referralRebate': 'Rebate referral', 'reward.daily': 'Harian', 'reward.campaign': 'Kampanye', 'static.activeDaysValue': '18 / 30 hari', 'static.validRefsValue': '7 / 10 pengguna' });
  Object.entries(accountTranslations).forEach(([locale, values]) => Object.assign(dict[locale], values));


  const adminTranslations = {
    en: {
      'admin.brand': 'Admin', 'admin.nav.operations': 'Operations', 'admin.nav.dashboard': 'Dashboard', 'admin.nav.football': 'Football import', 'admin.nav.markets': 'Markets', 'admin.nav.odds': 'Odds', 'admin.nav.settlement': 'Settlement', 'admin.nav.withdrawals': 'Withdrawals', 'admin.nav.risk': 'Risk', 'admin.nav.exposure': 'Exposure', 'admin.nav.ledger': 'Ledger Audit', 'admin.nav.insurance': 'Insurance Pool',
      'admin.search': 'Search users, markets, tx ids', 'admin.openSite': 'Open site', 'admin.operator': 'Operator console', 'admin.eyebrow': 'Central operations', 'admin.title': 'Operations Dashboard', 'admin.subtitle': 'Market creation, fixed pool odds, correct-score lines, settlement, ledger audit, withdrawals, and risk controls.', 'admin.createMarket': 'Create market',
      'admin.metric.volume': '24h Volume', 'admin.metric.exposure': 'Open Exposure', 'admin.metric.vault': 'Vault TVL', 'admin.metric.pool': 'Insurance Pool', 'admin.metric.withdrawals': 'Pending Withdrawals',
      'admin.football.title': 'Football collection', 'admin.football.subtitle': 'Automatically collects Polymarket, Kalshi, and API-Football soccer games, removes duplicates, and publishes match markets to the football channel.', 'admin.preview': 'Preview', 'admin.runNow': 'Run now', 'admin.publishSelected': 'Publish selected', 'admin.sources': 'Sources', 'admin.sourcesValue': 'Polymarket soccer games / Kalshi soccer / API-Football', 'admin.autoCollection': 'Auto collection', 'admin.waitingRun': 'Waiting for first run', 'admin.autoOdds': 'Auto odds', 'admin.autoOddsValue': 'Poisson + Dixon-Coles model, 25 score lines, YES/NO repricing', 'admin.autoSettlement': 'Auto settlement', 'admin.autoSettlementValue': 'Pull result 30 minutes after match window, then settle open positions',
      'admin.markets.title': 'Markets', 'admin.export': 'Export', 'admin.settlement.title': 'Settlement queue', 'admin.runOracle': 'Run oracle', 'admin.withdrawals.title': 'Withdrawal review', 'admin.refresh': 'Refresh', 'admin.exposure.title': 'Risk exposure',
      'admin.table.market': 'Market', 'admin.table.type': 'Type', 'admin.table.volume': 'Volume', 'admin.table.exposure': 'Exposure', 'admin.table.status': 'Status', 'admin.table.result': 'Result', 'admin.table.source': 'Source', 'admin.table.userAddress': 'User / Address', 'admin.table.amount': 'Amount', 'admin.table.risk': 'Risk', 'admin.table.stake': 'Stake', 'admin.table.potentialPayout': 'Potential payout',
      'admin.create.title': 'Create market', 'admin.field.marketTitle': 'Market title', 'admin.field.league': 'League', 'admin.field.type': 'Type', 'admin.type.football': 'Football', 'admin.type.crypto': 'Crypto', 'admin.field.homeUp': 'Home / Up', 'admin.field.awayDown': 'Away / Down', 'admin.field.homeYes': 'Home YES', 'admin.field.drawYes': 'Draw YES', 'admin.field.awayYes': 'Away YES', 'admin.saveDraft': 'Save draft market',
      'admin.odds.title': 'Odds editor', 'admin.autoReprice': 'Auto reprice football', 'admin.publishResultOdds': 'Publish result odds', 'admin.score.title': 'Correct score odds', 'admin.score.lines': '25 lines', 'admin.publishScoreOdds': 'Publish score odds',
      'admin.audit.title': 'Ledger audit', 'admin.audit.internal': 'Internal balance', 'admin.audit.custody': 'On-chain custody', 'admin.audit.diff': 'Diff', 'admin.audit.last': 'Last reconcile', 'admin.riskLimits.title': 'Risk limits', 'admin.riskLimits.pretrade': 'Pre-trade', 'admin.riskLimits.maxOrder': 'Max order', 'admin.riskLimits.userOpenPayout': 'User open payout', 'admin.riskLimits.marketPayout': 'Market payout', 'admin.riskLimits.scorePayout': 'Correct score payout', 'admin.riskLimits.save': 'Save risk limits', 'admin.log.title': 'Operator log'
    },
    'zh-CN': {
      'admin.brand': '后台', 'admin.nav.operations': '运营', 'admin.nav.dashboard': '看板', 'admin.nav.football': '足球采集', 'admin.nav.markets': '市场', 'admin.nav.odds': '赔率', 'admin.nav.settlement': '结算', 'admin.nav.withdrawals': '提现', 'admin.nav.risk': '风控', 'admin.nav.exposure': '敞口', 'admin.nav.ledger': '账务核对', 'admin.nav.insurance': '保险池',
      'admin.search': '搜索用户、市场、交易编号', 'admin.openSite': '打开前台', 'admin.operator': '运营控制台', 'admin.eyebrow': '运营管理', 'admin.title': '运营看板', 'admin.subtitle': '管理市场创建、固定赔率、比分盘口、赛果结算、账务核对、提现审核和风险控制。', 'admin.createMarket': '创建市场',
      'admin.metric.volume': '24小时交易量', 'admin.metric.exposure': '未结算敞口', 'admin.metric.vault': '金库 TVL', 'admin.metric.pool': '保险池', 'admin.metric.withdrawals': '待处理提现',
      'admin.football.title': '足球比赛采集', 'admin.football.subtitle': '自动采集 Polymarket、Kalshi 和 API-Football 的足球比赛，去重后发布到足球频道。', 'admin.preview': '预览', 'admin.runNow': '立即运行', 'admin.publishSelected': '发布选中', 'admin.sources': '来源', 'admin.sourcesValue': 'Polymarket 足球 / Kalshi 足球 / API-Football', 'admin.autoCollection': '自动采集', 'admin.waitingRun': '等待首次运行', 'admin.autoOdds': '自动赔率', 'admin.autoOddsValue': 'Poisson + Dixon-Coles 模型，25 个比分盘口，YES/NO 自动重算', 'admin.autoSettlement': '自动结算', 'admin.autoSettlementValue': '比赛结束窗口后 30 分钟拉取赛果，并结算未结订单',
      'admin.markets.title': '市场', 'admin.export': '导出', 'admin.settlement.title': '结算队列', 'admin.runOracle': '运行预言机', 'admin.withdrawals.title': '提现审核', 'admin.refresh': '刷新', 'admin.exposure.title': '风险敞口',
      'admin.table.market': '市场', 'admin.table.type': '类型', 'admin.table.volume': '交易量', 'admin.table.exposure': '敞口', 'admin.table.status': '状态', 'admin.table.result': '结果', 'admin.table.source': '来源', 'admin.table.userAddress': '用户 / 地址', 'admin.table.amount': '金额', 'admin.table.risk': '风险', 'admin.table.stake': '下注额', 'admin.table.potentialPayout': '潜在赔付',
      'admin.create.title': '创建市场', 'admin.field.marketTitle': '市场标题', 'admin.field.league': '联赛', 'admin.field.type': '类型', 'admin.type.football': '足球', 'admin.type.crypto': '加密', 'admin.field.homeUp': '主队 / 上涨', 'admin.field.awayDown': '客队 / 下跌', 'admin.field.homeYes': '主胜 YES', 'admin.field.drawYes': '平局 YES', 'admin.field.awayYes': '客胜 YES', 'admin.saveDraft': '保存草稿市场',
      'admin.odds.title': '赔率编辑', 'admin.autoReprice': '自动重算足球赔率', 'admin.publishResultOdds': '发布胜平负赔率', 'admin.score.title': '比分赔率', 'admin.score.lines': '25 个盘口', 'admin.publishScoreOdds': '发布比分赔率',
      'admin.audit.title': '账务核对', 'admin.audit.internal': '平台余额', 'admin.audit.custody': '链上托管', 'admin.audit.diff': '差额', 'admin.audit.last': '最后核对', 'admin.riskLimits.title': '风控限额', 'admin.riskLimits.pretrade': '交易前', 'admin.riskLimits.maxOrder': '单笔最高', 'admin.riskLimits.userOpenPayout': '用户未结赔付', 'admin.riskLimits.marketPayout': '市场赔付', 'admin.riskLimits.scorePayout': '比分赔付', 'admin.riskLimits.save': '保存风控限额', 'admin.log.title': '运营日志'
    },
    ja: {}, ko: {}, vi: {}, id: {}
  };
  adminTranslations.ja = { ...adminTranslations.en, 'admin.brand': 'Admin', 'admin.nav.operations': 'Operations', 'admin.nav.dashboard': 'Dashboard', 'admin.nav.football': 'Football import', 'admin.title': 'Operations Dashboard', 'admin.search': 'Search users, markets, tx ids', 'admin.openSite': 'Open site', 'admin.operator': 'Operator console' };
  adminTranslations.ko = { ...adminTranslations.en, 'admin.brand': 'Admin', 'admin.nav.operations': 'Operations', 'admin.nav.dashboard': 'Dashboard', 'admin.nav.football': 'Football import', 'admin.title': 'Operations Dashboard', 'admin.search': 'Search users, markets, tx ids', 'admin.openSite': 'Open site', 'admin.operator': 'Operator console' };
  adminTranslations.vi = { ...adminTranslations.en, 'admin.brand': 'Admin', 'admin.nav.operations': 'Operations', 'admin.nav.dashboard': 'Dashboard', 'admin.nav.football': 'Football import', 'admin.title': 'Operations Dashboard', 'admin.search': 'Search users, markets, tx ids', 'admin.openSite': 'Open site', 'admin.operator': 'Operator console' };
  adminTranslations.id = { ...adminTranslations.en, 'admin.brand': 'Admin', 'admin.nav.operations': 'Operasi', 'admin.nav.dashboard': 'Dashboard', 'admin.nav.football': 'Impor sepak bola', 'admin.title': 'Dashboard Operasi', 'admin.search': 'Cari pengguna, pasar, id transaksi', 'admin.openSite': 'Buka situs', 'admin.operator': 'Konsol operator' };
  Object.entries(adminTranslations).forEach(([locale, values]) => Object.assign(dict[locale], values));

  const entityMap = {
    'zh-CN': {
      EPL: '英超', 'Premier League': '英超', 'English Premier League': '英超', 'UEFA Champions League': '欧冠', 'Champions League': '欧冠',
      'UEFA Europa League': '欧联杯', 'Serie A': '意甲', 'La Liga': '西甲', Bundesliga: '德甲', 'Major League Soccer': '美职联',
      Allsvenskan: '瑞典超', 'Brasileiro Serie A': '巴甲', Crypto: '加密市场', Soccer: '足球',
      Arsenal: '阿森纳', Chelsea: '切尔西', Tottenham: '热刺', Liverpool: '利物浦', Burnley: '伯恩利',
      Bournemouth: '伯恩茅斯', Brighton: '布莱顿', 'Crystal Palace': '水晶宫', 'Aston Villa': '阿斯顿维拉', Brentford: '布伦特福德',
      Sunderland: '桑德兰', Everton: '埃弗顿', 'West Ham': '西汉姆联', 'Leeds United': '利兹联', Fulham: '富勒姆', Newcastle: '纽卡斯尔',
      Wolverhampton: '狼队', Forest: '诺丁汉森林', Nottingham: '诺丁汉森林', 'Nottingham Forest': '诺丁汉森林',
      'Man Utd': '曼联', 'Manchester United': '曼联', 'Man City': '曼城', 'Manchester City': '曼城',
      Ajax: '阿贾克斯', Groningen: '格罗宁根', Utrecht: '乌得勒支', Heerenveen: '海伦芬',
      PSG: '巴黎圣日耳曼', Barcelona: '巴塞罗那', Valencia: '瓦伦西亚', 'Celta Vigo': '塞尔塔', Sevilla: '塞维利亚',
      'Real Betis': '皇家贝蒂斯', Levante: '莱万特', 'Real Madrid': '皇家马德里', Bilbao: '毕尔巴鄂竞技', Girona: '赫罗纳',
      Elche: '埃尔切', Getafe: '赫塔菲', Osasuna: '奥萨苏纳', Mallorca: '马略卡', Oviedo: '奥维耶多', Villarreal: '比利亚雷亚尔',
      Atletico: '马德里竞技', Espanyol: '西班牙人', 'Real Sociedad': '皇家社会', Alaves: '阿拉维斯', Vallecano: '巴列卡诺',
      Flamengo: '弗拉门戈', Palmeiras: '帕尔梅拉斯', Mirassol: '米拉索尔', Fluminense: '弗鲁米嫩塞', Vitoria: '维多利亚',
      'Brøndby IF': '布隆德比', 'FC København': '哥本哈根', 'FC Copenhagen': '哥本哈根', 'Ind. Medellin': '麦德林独立', 'Independiente Medellin': '麦德林独立',
      'Maghreb AS de Fès': '马格里布菲斯', 'IR Tanger': '丹吉尔伊蒂哈德', 'Kawkab AC': '卡夫卡布', 'COD Meknès': '梅克内斯', 'US Yacoub El Mansour': '雅各布曼苏尔', 'Union Touarga': '图阿尔格联盟',
      Internacional: '巴西国际', 'Sao Paulo': '圣保罗', Botafogo: '博塔弗戈', Cruzeiro: '克鲁塞罗', Chapecoense: '沙佩科恩斯',
      'Vasco da Gama': '瓦斯科达伽马', Bragantino: '布拉干蒂诺', Remo: '瑞模贝雷', Paranaense: '巴拉纳竞技', Gremio: '格雷米奥',
      Santos: '桑托斯', Corinthians: '科林蒂安', 'Atletico Mineiro': '米内罗竞技', Coritiba: '科里蒂巴', Bahia: '巴伊亚',
      'Orgryte IS': '奥尔格里特', 'IFK Goteborg': '哥德堡', Seoul: '首尔', Anyang: '安养',
      Up: '上涨', Down: '下跌', Home: '主胜', Draw: '平局', Away: '客胜', Outcome: '结果'
    },
    ja: { EPL: 'プレミアリーグ', 'Premier League': 'プレミアリーグ', 'UEFA Champions League': 'UEFAチャンピオンズリーグ', Crypto: '暗号資産', Soccer: 'サッカー', Arsenal: 'アーセナル', Chelsea: 'チェルシー', Tottenham: 'トッテナム', Liverpool: 'リバプール', Ajax: 'アヤックス', Groningen: 'フローニンゲン', Utrecht: 'ユトレヒト', Heerenveen: 'ヘーレンフェーン', 'Man Utd': 'マンチェスター・ユナイテッド', 'Man City': 'マンチェスター・シティ', Forest: 'ノッティンガム・フォレスト', Home: 'ホーム勝利', Draw: '引き分け', Away: 'アウェイ勝利' },
    ko: { EPL: '프리미어리그', 'Premier League': '프리미어리그', 'UEFA Champions League': 'UEFA 챔피언스리그', Crypto: '암호화폐', Soccer: '축구', Arsenal: '아스널', Chelsea: '첼시', Tottenham: '토트넘', Liverpool: '리버풀', Ajax: '아약스', Groningen: '흐로닝언', Utrecht: '위트레흐트', Heerenveen: '헤이렌베인', 'Man Utd': '맨체스터 유나이티드', 'Man City': '맨체스터 시티', Forest: '노팅엄 포레스트', Home: '홈 승', Draw: '무승부', Away: '원정 승' },
    vi: { EPL: 'Ngoại hạng Anh', 'Premier League': 'Ngoại hạng Anh', 'UEFA Champions League': 'UEFA Champions League', Crypto: 'Crypto', Soccer: 'Bóng đá', Ajax: 'Ajax', Groningen: 'Groningen', Utrecht: 'Utrecht', Heerenveen: 'Heerenveen', Home: 'Chủ nhà thắng', Draw: 'Hòa', Away: 'Khách thắng' },
    id: { EPL: 'Premier League', 'Premier League': 'Premier League', 'UEFA Champions League': 'UEFA Champions League', Crypto: 'Kripto', Soccer: 'Sepak bola', Ajax: 'Ajax', Groningen: 'Groningen', Utrecht: 'Utrecht', Heerenveen: 'Heerenveen', Home: 'Tuan rumah menang', Draw: 'Seri', Away: 'Tamu menang' }
  };

  const exact = {
    'zh-CN': {
      'Project': '项目', 'Admin': '后台', 'Operations': '运营', 'Markets': '市场', 'Odds': '赔率', 'Settlement': '结算', 'Withdrawals': '提现', 'Risk': '风控', 'Exposure': '敞口',
      'Create market': '创建市场', 'Market': '市场', 'Type': '类型', 'Volume': '交易量', 'Status': '状态', 'Time': '时间', 'Note': '备注', 'Risk': '风险', 'Amount': '金额', 'Assets': '资产', 'Connect wallet': '连接钱包',
      'Available': '可用', 'Frozen': '冻结', 'Vault': '金库', 'Claimable': '可领取', 'Copy': '复制', 'Copied': '已复制', 'Confirm': '确认', 'Positions': '持仓', 'Rewards': '奖励', 'Insurance': '保险',
      'Open': '未结算', 'Settled': '已结算', 'Insured': '已保险', 'Booked': '已入账', 'booked': '已入账', 'active': '生效中', 'pending_review': '待审核',
      'Legal': '法律', 'User Agreement': '用户协议', 'Privacy Policy': '隐私政策', 'Deposit': '充值', 'Withdraw': '提现', 'Trade': '交易', 'Activity': '动态', 'My': '我的', 'All': '全部', 'Football': '足球', 'Top Markets': '热门市场',
      'No ledger entries yet. Simulate a deposit or place an order.': '暂无账本记录。充值或下单后会显示在这里。',
      'No withdrawal requests.': '暂无提现申请。',
      'No active positions yet. Open a market and place your first order.': '暂无进行中的持仓。打开一个市场并完成第一笔下单。',
      'No rewards yet. Trade, deposit into vault, or invite users to earn INF Credits.': '暂无奖励。交易、存入金库或邀请用户可获得 INF Credits。',
      'Open market': '可交易市场', 'no sell before settlement': '结算前不可卖出', 'Fixed odds score market; no sell before settlement': '固定赔率比分市场，结算前不可卖出',
      'Order reward': '订单奖励', 'INFO Vault boost': 'INFO 金库加成', 'Alpha Insurance boost': 'Alpha 保险加成', 'Referral rebate': '邀请返佣',
      'Daily': '每日', 'Campaign': '活动', 'Done': '已完成'
      ,
      'Back to login': '返回登录',
      'These terms describe account access, prediction trading, internal ledger balances, vault plans, insurance cover, and withdrawal review.': '本协议说明账户访问、预测交易、内部账本余额、金库计划、保险保障和提现审核规则。',
      '1. Eligibility': '1. 用户资格',
      'Users must satisfy applicable age, account security, sanctions, and platform safety requirements before trading or using vault and insurance products.': '用户在交易或使用金库、保险产品前，需满足适用年龄、账户安全、制裁限制和平台安全要求。',
      '2. Prediction Trading': '2. 预测交易',
      'Markets are event-based prediction contracts. Football match-result and correct-score markets use YES / NO outcomes. Correct-score positions use fixed odds and cannot be sold before settlement.': '市场是基于事件结果的预测合约。足球胜平负和比分市场使用 YES / NO 结果。比分持仓采用固定赔率，结算前不能卖出。',
      '3. Internal Ledger': '3. 内部账本',
      "Trading, settlement, rewards, vault accounting, and insurance nodes are maintained in the platform's internal ledger. On-chain operations are limited to supported deposits, withdrawals, and token claims.": '交易、结算、奖励、金库记账和保险节点均记录在平台内部账本中。链上仅处理支持的充值、提现和代币领取。',
      '4. Risk and Compliance': '4. 风险与合规',
      'The platform may reject orders, review withdrawals, or suspend accounts to protect user balances, platform solvency, and account security.': '为保护用户余额、平台偿付能力和账户安全，平台可拒绝订单、审核提现或暂停账户。',
      '5. No Investment Advice': '5. 非投资建议',
      'Market information, odds, and rewards are provided for trading functionality only and are not financial, legal, tax, or investment advice.': '市场信息、赔率和奖励仅用于交易功能展示，不构成金融、法律、税务或投资建议。',
      'This policy explains how infomarket.ai handles account data, wallet data, trading records, and internal ledger events.': '本政策说明 infomarket.ai 如何处理账户数据、钱包数据、交易记录和内部账本事件。',
      '1. Data We Collect': '1. 我们收集的数据',
      'We may collect account identifiers, email addresses, wallet addresses, device information, trading activity, ledger events, risk signals, and support records.': '我们可能收集账户标识、邮箱地址、钱包地址、设备信息、交易活动、账本事件、风险信号和客服记录。',
      '2. How Data Is Used': '2. 数据用途',
      'Data is used to operate accounts, process orders and withdrawals, provide rewards, manage vault and insurance products, prevent fraud, meet compliance obligations, and improve product reliability.': '数据用于运营账户、处理订单和提现、发放奖励、管理金库和保险产品、防范欺诈、满足合规义务并提升产品可靠性。',
      '3. Wallet and Chain Data': '3. 钱包与链上数据',
      'Wallet addresses and supported on-chain transactions may be visible on public blockchains. Internal ledger balances remain platform records and are subject to audit and risk review.': '钱包地址和支持的链上交易可能在公共区块链上可见。内部账本余额属于平台记录，并接受审计和风险复核。',
      '4. Retention and Security': '4. 留存与安全',
      'The platform uses retention controls, encryption, access controls, audit logging, and incident response procedures to protect user records.': '平台通过留存控制、加密、访问控制、审计日志和事件响应流程保护用户记录。',
      '5. User Rights': '5. 用户权利',
      'Users may request access, correction, deletion, or restriction where applicable law grants those rights, subject to compliance and fraud-prevention requirements.': '在适用法律允许的范围内，用户可申请访问、更正、删除或限制处理相关数据，但需满足合规和反欺诈要求。'
    },
    ja: {}, ko: {}, vi: {}, id: {}
  };

  Object.entries({ ja: 'zh-CN', ko: 'zh-CN', vi: 'zh-CN', id: 'zh-CN' }).forEach(([locale]) => {
    exact[locale] = exact[locale] || {};
  });
  Object.keys(dict).forEach((locale) => {
    if (locale === 'en') return;
    exact[locale] ||= {};
    Object.keys(en).forEach((key) => { exact[locale][en[key]] ||= dict[locale][key]; });
  });

  function getLang() {
    const saved = localStorage.getItem(storageKey);
    if (dict[saved]) return saved;
    const browser = navigator.language || 'en';
    if (browser.startsWith('zh')) return 'zh-CN';
    if (browser.startsWith('ja')) return 'ja';
    if (browser.startsWith('ko')) return 'ko';
    if (browser.startsWith('vi')) return 'vi';
    if (browser.startsWith('id')) return 'id';
    return 'en';
  }
  function t(key) { return dict[getLang()]?.[key] || dict.en[key] || key; }
  function entity(value) {
    const text = String(value || '');
    return entityMap[getLang()]?.[text] || text;
  }
  function outcome(value) {
    const text = String(value || '');
    const key = { YES: 'market.yes', Yes: 'market.yes', yes: 'market.yes', NO: 'market.no', No: 'market.no', no: 'market.no', UP: 'market.up', Up: 'market.up', up: 'market.up', DOWN: 'market.down', Down: 'market.down', down: 'market.down', Home: 'market.home', HOME: 'market.home', Draw: 'market.draw', DRAW: 'market.draw', Away: 'market.away', AWAY: 'market.away' }[text];
    return key ? t(key) : entity(text);
  }
  function marketTitle(market) {
    if (!market) return '';
    if (market.type === 'football' && market.home && market.away) return `${entity(market.home.name)} VS ${entity(market.away.name)}`;
    return String(market.title || '').replace(/\b(.+?)\s+vs\s+(.+?)\b/i, (_, home, away) => `${entity(home.trim())} VS ${entity(away.trim())}`);
  }
  function translateText(text) {
    const raw = String(text || '');
    const trimmed = raw.trim();
    if (!trimmed || getLang() === 'en') return raw;
    const translated = exact[getLang()]?.[trimmed];
    return translated ? raw.replace(trimmed, translated) : raw;
  }
  function selector() {
    const current = getLang();
    const options = languages.map(([code, label]) => `<option value="${code}"${code === current ? ' selected' : ''}>${label}</option>`).join('');
    return `<label class="language-control compact" title="${t('lang.label')}" aria-label="${t('lang.label')}"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h14M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5M10 2.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg><select data-language-select aria-label="${t('lang.label')}">${options}</select></label>`;
  }
  function translateStaticText(root) {
    if (getLang() === 'en' || !document.body) return;
    const scope = root.body || root;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (parent?.closest?.('[data-no-auto-i18n]')) return NodeFilter.FILTER_REJECT;
        if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = translateText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
    scope.querySelectorAll?.('input[placeholder], textarea[placeholder]').forEach((node) => node.setAttribute('placeholder', translateText(node.getAttribute('placeholder'))));
  }
  function apply(root = document) {
    document.documentElement.lang = getLang();
    let hasUser = false;
    try { hasUser = Boolean(JSON.parse(localStorage.getItem('infomarket.user') || 'null')); } catch (_) {}
    root.querySelectorAll?.('[data-i18n]').forEach((node) => {
      if (hasUser && node.hasAttribute('data-auth-action')) return;
      node.textContent = t(node.dataset.i18n);
    });
    root.querySelectorAll?.('[data-i18n-placeholder]').forEach((node) => node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder)));
    root.querySelectorAll?.('[data-auth-label]').forEach((node) => {
      const key = node.dataset.authLabelKey;
      if (key) node.dataset.authLabel = t(key);
    });
    root.querySelectorAll?.('[data-language-select]').forEach((select) => {
      select.value = getLang();
      select.onchange = () => { localStorage.setItem(storageKey, select.value); location.reload(); };
    });
    translateStaticText(root === document ? document : root);
  }
  let observer;
  function observe() {
    if (observer || !document.body) return;
    observer = new MutationObserver((mutations) => {
      if (getLang() === 'en') return;
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) apply(node);
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) node.nodeValue = translateText(node.nodeValue);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.InfoMarketI18n = { languages, getLang, t, entity, outcome, marketTitle, translateText, selector, apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { apply(); observe(); });
  else { apply(); observe(); }
})();



