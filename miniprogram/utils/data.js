const PROFILE_KEY = "time-payslip-profile-v1";
const SESSIONS_KEY = "time-payslip-sessions-v1";
const GOAL_KEY = "time-payslip-goal-v1";
const CUSTOM_ACTIVITY_KEY = "time-payslip-custom-activity-v1";
const LEGACY_LEDGER_KEY = "time-payslip-ledger-v1";

const copyLines = {
  home: [
    "时间既然卖了，记得知道卖了多少钱。",
    "工位不动，账本要动；每秒都别白送。",
    "上班卖的是时间，下班带走的是账。",
    "今天的摸鱼不打烊，先把单价算明白。",
    "工资是月底到账，价值从现在开始跳动。",
    "你交付了八小时，至少要看见它值多少。",
    "老板买走的是时间，别忘了给它开张发票。",
    "摸鱼不是消失，是把松弛也记进履历。",
    "今天不问忙不忙，先问这一分钟值几毛。",
    "每次暂停都算数，每次回血都有凭据。"
  ],
  onboarding: [
    "填好工资，让每一次摸鱼都有价格。",
    "先给时间贴个价，之后每秒都看得见。",
    "工资不是秘密，单价才是摸鱼的底气。",
    "把月薪换算成每秒，今天就开始明算账。",
    "你的时间值得被标价，也值得被好好花掉。"
  ],
  goals: {
    progress: [
      "老板赞助还在路上，先把下一杯快乐攒出来。",
      "距离目标只差一点点，继续让时间替你付款。",
      "每多记一秒，愿望单就少一点距离。",
      "今天的回本进度，正在安静地往前走。",
      "这不是消费，是把带薪时间兑换成小确幸。"
    ],
    complete: [
      "目标已被老板买单，今天可以理直气壮。",
      "愿望单成功结算，带薪时间没有白过。",
      "这笔快乐已经到账，剩下的时间继续攒。",
      "恭喜回本，今天的摸鱼基金正式转正。"
    ],
    notes: [
      "把工资换成一点具体的快乐",
      "今天想让老板赞助什么",
      "每个目标都值得认真摸鱼",
      "愿望不大，账要算清"
    ]
  },
  todayNotes: [
    "只算当前模式，账目不串线",
    "今天这条线的专属进度",
    "每种放松，各自单独结算",
    "当前功能的时间账本"
  ],
  stats: [
    "每一笔带薪时间，都有出处。",
    "工资条不只看月底，也要看今天。",
    "把忙碌拆成数字，才知道自己卖了多少。",
    "时间花到哪里，收入就从哪里长出来。",
    "别让辛苦只剩感觉，给它留一份明细。",
    "今天的每一分钟，都应该在账上有名字。",
    "统计不是复盘摸鱼，是盘点自己的时间资产。",
    "看清每笔收入，才知道哪种放松最划算。"
  ],
  statsContributionNotes: [
    "三类贡献分开看",
    "今天的时间流向",
    "各功能独立记账",
    "老板的钱花得明白"
  ],
  statsRecordNotes: [
    "最近 8 笔",
    "最新到账记录",
    "时间账本流水",
    "刚刚发生的收入"
  ],
  achievements: [
    "上班没有白上，章也不能白盖。",
    "每次带薪完成，都是履历上的一枚小章。",
    "成就不是虚荣，是你摸鱼过的证据。",
    "把零碎时间攒起来，履历自然会发光。",
    "今天解锁哪一章，交给下一次带薪行动。",
    "老板只看工时，我们还要看自己的战绩。"
  ],
  achievementProgress: [
    "三条功能线，分别记功。",
    "每种放松都有自己的履历进度。",
    "章可以慢慢盖，进度不会凭空消失。",
    "总账看全局，分线看真章。"
  ],
  settings: [
    "先填工资，再算每一秒。",
    "把时间标价，摸鱼才有财务自由的方向。",
    "工资条的第一步，是知道自己的分钟值多少。",
    "参数越准确，每一次带薪暂停越有底气。",
    "先把单价算清楚，快乐才好报销。"
  ],
  privacy: [
    "数据只保存在你的手机里，工资和记录不上传。",
    "这是你的私人时间账本，当前版本只在本机保存。",
    "工资信息仅用于计算单价，不会离开这台手机。",
    "本机记账，放心摸鱼；数据不会自动发给老板。"
  ],
  emptyStats: [
    "还没有记录，先去首页赚下第一笔。",
    "账本还空着，去选一项带薪活动开张吧。",
    "第一笔时间工资，正在首页等你签收。",
    "没有数据也没关系，今天从一秒开始。"
  ]
};

const activities = {
  toilet: {
    key: "toilet",
    label: "拉屎",
    fullLabel: "带薪拉屎",
    stamp: "WC",
    english: "TOILET",
    hint: "肠道健康也算现金流",
    idle: "点击开始，把松弛时间记进账本。",
    running: "老板正在为你的肠道健康买单。",
    sceneLine: "坐稳别急，这段工时正在自动入账。",
    hints: ["肠道健康也算现金流", "坐一会儿也是时间资产", "身体要放松，账本要清醒", "工位之外，也有带薪项目"],
    idleLines: ["点击开始，把松弛时间记进账本。", "准备好了吗？这次放松也要按秒计价。", "坐稳以后，时间工资马上开工。", "给肠道一点空间，也给自己一笔收入。"],
    runningLines: ["老板正在为你的肠道健康买单。", "坐稳别急，这段时间正在自动入账。", "这一趟不算离岗，算一笔身体维护费。", "请放心释放，计时器正在替你记账。"],
    sceneLines: ["坐稳别急，这段工时正在自动入账。", "身体在清空，工资条在增加。", "这一格留给肠道，另一格留给收入。", "厕所门一关，时间账本就开始工作。"],
    doneLines: ["冲水完成，这笔钱很有味道。", "项目顺利收尾，身体和余额都松快了。", "这一趟已结算，厕所里的时间也有发票。", "肠道清空一格，余额悄悄长了一格。"],
    reportQuotes: ["肠道清空一格，余额悄悄长了一格。", "这笔收入略有味道，但绝对来路清楚。", "短暂离席，换来一笔明明白白的时间工资。", "身体得到释放，工资条完成记账。"],
    reportCaptions: ["冲水完成，今天的松弛时间已经入账。", "离开工位几分钟，也要把价值带回来。", "这笔钱很有味道，但每一分都有出处。"],
    mascot: "/assets/activity-mascots/toilet-base-v1.png",
    stopText: "冲水结算",
    done: "冲水完成，这笔钱很有味道。",
    reportKicker: "肠道项目 · 已结算",
    reportTag: "冲水到账",
    reportSfx: "FLUSH!",
    reportCaption: "冲水完成，今天的松弛时间已经入账。",
    color: "#bff5df"
  },
  meal: {
    key: "meal",
    label: "吃饭",
    fullLabel: "带薪吃饭",
    stamp: "饭",
    english: "DINING",
    hint: "午饭不是暂停，是带薪补给",
    idle: "开饭后，每一口都开始计价。",
    running: "这口饭由工作时间买单。",
    sceneLine: "每一口都是带薪补给，慢慢吃也算工时。",
    hints: ["午饭不是暂停，是带薪补给", "先吃饱，再和下午硬碰硬", "饭点到了，能量账本开张", "每一口都值得被认真结算"],
    idleLines: ["开饭后，每一口都开始计价。", "准备好了吗？这一餐也可以带薪享用。", "先让胃坐下，计时器随后开工。", "饭点不是空白，是一段补给工时。"],
    runningLines: ["这口饭由工作时间买单。", "老板赞助本餐，慢慢吃不用赶。", "筷子在动，时间工资也在动。", "热量正在进入，收入正在到账。"],
    sceneLines: ["每一口都是带薪补给，慢慢吃也算工时。", "饭在变少，工资条在变长。", "先把能量补上，再继续面对工位。", "这一餐不只是午休，是身体的续费提醒。"],
    doneLines: ["光盘入账，午休终于有了回报。", "饭吃饱了，收入也顺手记上了。", "本餐顺利结算，下午的电量已补满。", "这一口没有白吃，时间工资已经到账。"],
    reportQuotes: ["饭吃饱了，收入也顺手记上了。", "一顿饭的时间，也可以成为今天的回血记录。", "光盘是态度，入账是证据。", "老板买单的不是热量，是你用掉的时间。"],
    reportCaptions: ["饭点不打折，每一口都已经记进时间工资条。", "吃饱再开工，今天的能量账已经对上了。", "这顿饭有热气，也有一笔清楚的时间收入。"],
    mascot: "/assets/activity-mascots/meal-base-v1.png",
    stopText: "吃饱结算",
    done: "光盘入账，午休终于有了回报。",
    reportKicker: "能量补给 · 已结算",
    reportTag: "光盘到账",
    reportSfx: "YUM!",
    reportCaption: "饭点不打折，每一口都已经记进时间工资条。",
    color: "#fff0a6"
  },
  nap: {
    key: "nap",
    label: "睡觉",
    fullLabel: "带薪睡觉",
    stamp: "ZZ",
    english: "NAP",
    hint: "闭眼充电，醒来结算",
    idle: "闭眼以后，睡眠收益开始计算。",
    running: "眼睛闭上了，收益没有。",
    sceneLine: "人已充电，工资计时器还醒着。",
    hints: ["闭眼充电，醒来结算", "睡眠也是生产力，先给自己充电", "人可以离线，工资不能停机", "把困意变成一段可见收入"],
    idleLines: ["闭眼以后，睡眠收益开始计算。", "准备好了吗？这觉也要按秒结算。", "枕头已经就位，时间工资即将启动。", "先睡一会儿，醒来看看赚了多少。"],
    runningLines: ["眼睛闭上了，收益没有。", "人已进入省电模式，工资计时器仍在工作。", "安心睡，老板正在为这段恢复买单。", "呼吸放慢一点，收入正在稳定增长。"],
    sceneLines: ["人已充电，工资计时器还醒着。", "梦里可以放空，账上不能空白。", "被窝负责恢复，工资条负责记录。", "这一觉不偷懒，是给下午续上一格电。"],
    doneLines: ["充电完成，精神和余额一起回血。", "睡醒结算，这段离线时间也有价值。", "电量恢复，时间工资准时到账。", "这一觉没有白睡，余额和状态都更新了。"],
    reportQuotes: ["这一觉没有白睡，余额和状态都更新了。", "闭眼是为了恢复，入账是为了证明。", "梦可以不记得，时间工资不能漏记。", "睡眠完成一次充电，工资条完成一次结算。"],
    reportCaptions: ["这一觉没有白睡，精神和余额一起回血。", "被窝里也有生产力，醒来就能看到记录。", "休息不是暂停人生，是给下一段工作充电。"],
    mascot: "/assets/activity-mascots/nap-base-v1.png",
    stopText: "睡醒结算",
    done: "充电完成，精神和余额一起回血。",
    reportKicker: "精神充电 · 已结算",
    reportTag: "醒来到账",
    reportSfx: "Zzz...",
    reportCaption: "这一觉没有白睡，精神和余额一起回血。",
    color: "#cbe8ff"
  }
};

const activityList = Object.keys(activities).map((key) => activities[key]);

function normalizeCustomActivityConfig(config = {}) {
  const label = String(config.label || "").trim().slice(0, 6);
  const stamp = String(config.stamp || "").trim().slice(0, 2) || label.slice(0, 1) || "+";
  return { label, stamp };
}

function makeCustomActivity(config = {}) {
  const normalized = normalizeCustomActivityConfig(config);
  const configured = Boolean(normalized.label);
  const label = configured ? normalized.label : "自定义";
  const fullLabel = configured ? `带薪${label}` : "自定义摸鱼";
  const stamp = configured ? normalized.stamp : "+";
  const idleLine = configured
    ? `点击开始，把${label}时间记进账本。`
    : "先设置一个摸鱼行为，再开始计时。";
  const runningLine = configured
    ? `老板正在为你的${label}时间买单。`
    : "设置好行为后，这段摸鱼也能入账。";
  const sceneLine = configured
    ? `${label}进行中，时间工资同步入账。`
    : "先定一个项目，再让时间开始赚钱。";
  const doneLine = configured
    ? `${label}结算完成，这笔带薪时间已入账。`
    : "自定义摸鱼已结算。";

  return {
    key: "custom",
    label,
    fullLabel,
    stamp,
    english: configured ? "自定义模式" : "点击设置",
    modeLabel: "自定义模式",
    configured,
    hint: configured ? `${label}也算带薪时间` : "把你的摸鱼项目也记进账本",
    idle: idleLine,
    running: runningLine,
    sceneLine,
    hints: configured
      ? [`${label}也算带薪时间`, "自己的摸鱼项目，自己记账", "固定项目之外，也要明算账", "这段松弛也有单价"]
      : ["把你的摸鱼项目也记进账本", "先设置一个专属摸鱼行为", "固定项目之外，留一个自定义槽位", "你的摸鱼项目，也可以按秒结算"],
    idleLines: [idleLine, "准备好了吗？这段时间也要按秒计价。", "自定义项目就位，时间工资马上开工。", "把这段松弛写进今天的账。"],
    runningLines: [runningLine, "别急着回工位，这段收入正在增长。", "自定义模式运行中，账本正在更新。", "每一秒都算数，这段摸鱼也不例外。"],
    sceneLines: [sceneLine, "工位可以暂时不动，账本继续往前走。", "这段自定义项目，正在变成可见收入。", "专属摸鱼时间，正在认真结算。"],
    doneLines: [doneLine, "项目收工，余额也顺手长了一点。", "这次摸鱼有名有姓，已经记进账本。", "自定义项目完成，今天的收入多了一笔。"],
    reportQuotes: [doneLine, "这笔收入来自你的专属摸鱼项目。", "固定项目之外，也有一段清楚的时间工资。", "摸鱼可以自定义，入账不能含糊。"],
    reportCaptions: [`${label}这段时间已经记进今天的工资条。`, "自定义项目已结算，统计页会同步记录。", "专属摸鱼项目完成，带薪时间没有白过。"],
    mascot: "/assets/activity-mascots/toilet-base-v1.png",
    reportMascot: "/assets/activity-mascots/toilet-report-v1.png",
    stopText: "结算",
    done: doneLine,
    reportKicker: configured ? `${label}项目 · 已结算` : "自定义项目 · 已结算",
    reportTag: "摸鱼到账",
    reportSfx: "DONE!",
    reportCaption: configured ? `${label}这段时间已经记进今天的工资条。` : "自定义项目已结算。",
    color: "#d9ccff"
  };
}

function getCustomActivity() {
  const saved = wx.getStorageSync(CUSTOM_ACTIVITY_KEY);
  return makeCustomActivity(saved && typeof saved === "object" ? saved : {});
}

function saveCustomActivity(config) {
  const normalized = normalizeCustomActivityConfig(config);
  if (!normalized.label) {
    wx.removeStorageSync(CUSTOM_ACTIVITY_KEY);
    return getCustomActivity();
  }
  wx.setStorageSync(CUSTOM_ACTIVITY_KEY, normalized);
  return getCustomActivity();
}

function getActivities() {
  return Object.assign({}, activities, { custom: getCustomActivity() });
}

function getActivityList() {
  const allActivities = getActivities();
  return ["toilet", "meal", "nap", "custom"].map((key) => allActivities[key]);
}

function pickLine(lines = [], previous = "") {
  if (!lines.length) return "";
  if (lines.length === 1) return lines[0];
  const candidates = lines.filter((line) => line !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

const goalPresets = [
  { id: "water", label: "矿泉水", target: 3, stamp: "水" },
  { id: "coffee", label: "冰美式", target: 18, stamp: "咖" },
  { id: "meal", label: "工作餐", target: 25, stamp: "饭" },
  { id: "tea", label: "奶茶自由", target: 35, stamp: "茶" },
  { id: "hotpot", label: "一顿火锅", target: 120, stamp: "锅" },
  { id: "movie", label: "周末电影", target: 45, stamp: "影" }
];

const achievements = [
  { activity: "toilet", title: "屎无前例", desc: "完成第一次带薪拉屎", metric: "count", target: 1 },
  { activity: "toilet", title: "三顾茅庐", desc: "累计完成三次带薪拉屎", metric: "count", target: 3 },
  { activity: "toilet", title: "坐享其成", desc: "累计坐满十五分钟", metric: "seconds", target: 900 },
  { activity: "toilet", title: "薪想屎成", desc: "累计收益达到十元", metric: "money", target: 10 },
  { activity: "toilet", title: "五蹲俱全", desc: "累计完成五次带薪拉屎", metric: "count", target: 5 },
  { activity: "toilet", title: "日进蹲金", desc: "拉屎收益累计达到五十元", metric: "money", target: 50 },
  { activity: "meal", title: "饭来张口", desc: "完成第一次带薪吃饭", metric: "count", target: 1 },
  { activity: "meal", title: "再三添饭", desc: "累计完成三次带薪吃饭", metric: "count", target: 3 },
  { activity: "meal", title: "细嚼薪咽", desc: "累计吃满一小时", metric: "seconds", target: 3600 },
  { activity: "meal", title: "薪安理得", desc: "吃饭收益累计达到十元", metric: "money", target: 10 },
  { activity: "meal", title: "十全十美", desc: "累计完成十次带薪吃饭", metric: "count", target: 10 },
  { activity: "meal", title: "饭富自由", desc: "吃饭收益累计达到五十元", metric: "money", target: 50 },
  { activity: "nap", title: "一觉值千金", desc: "完成第一次带薪睡觉", metric: "count", target: 1 },
  { activity: "nap", title: "睡到薪来", desc: "累计完成三次带薪睡觉", metric: "count", target: 3 },
  { activity: "nap", title: "卧薪尝胆", desc: "累计睡满一小时", metric: "seconds", target: 3600 },
  { activity: "nap", title: "觉后余薪", desc: "睡觉收益累计达到十元", metric: "money", target: 10 },
  { activity: "nap", title: "十觉全能", desc: "累计完成十次带薪睡觉", metric: "count", target: 10 },
  { activity: "nap", title: "梦里生财", desc: "睡觉收益累计达到五十元", metric: "money", target: 50 }
];

const defaultProfile = {
  alias: "摸鱼群众",
  salary: 12000,
  workdays: 22,
  hours: 8
};

function normalizeProfile(profile = {}) {
  return {
    alias: String(profile.alias || defaultProfile.alias).trim().slice(0, 12) || defaultProfile.alias,
    salary: Math.max(1, Number(profile.salary) || defaultProfile.salary),
    workdays: Math.max(1, Number(profile.workdays) || defaultProfile.workdays),
    hours: Math.max(1, Number(profile.hours) || defaultProfile.hours)
  };
}

function hasProfile() {
  const saved = wx.getStorageSync(PROFILE_KEY);
  return Boolean(saved && typeof saved === "object");
}

function getProfile() {
  const saved = wx.getStorageSync(PROFILE_KEY);
  return normalizeProfile(Object.assign({}, defaultProfile, saved || {}));
}

function saveProfile(profile) {
  const normalized = normalizeProfile(profile);
  wx.setStorageSync(PROFILE_KEY, normalized);
  return normalized;
}

function getSessions() {
  const saved = wx.getStorageSync(SESSIONS_KEY);
  return Array.isArray(saved) ? saved : [];
}

function saveSessions(sessions) {
  wx.setStorageSync(SESSIONS_KEY, sessions.slice(-5000));
}

function addSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  return sessions;
}

function getGoal() {
  const saved = wx.getStorageSync(GOAL_KEY);
  if (saved && typeof saved === "object") {
    return normalizeGoal(saved);
  }
  return goalPresets.find((goal) => goal.id === saved) || goalPresets[1];
}

function normalizeGoal(goal = {}) {
  const preset = goalPresets.find((item) => item.id === goal.id);
  if (preset) return preset;
  return goalPresets[1];
}

function saveGoal(goal) {
  if (typeof goal === "string") {
    wx.setStorageSync(GOAL_KEY, goal);
    return getGoal();
  }
  const normalized = normalizeGoal(goal);
  wx.setStorageSync(GOAL_KEY, normalized);
  return normalized;
}

function getRates(profile = getProfile()) {
  const salary = Math.max(1, Number(profile.salary) || defaultProfile.salary);
  const workdays = Math.max(1, Number(profile.workdays) || defaultProfile.workdays);
  const hours = Math.max(1, Number(profile.hours) || defaultProfile.hours);
  const hour = salary / workdays / hours;
  return { hour, minute: hour / 60, second: hour / 3600 };
}

function getDateKey(value = Date.now()) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function aggregate(sessions) {
  return sessions.reduce((total, session) => {
    total.count += 1;
    total.seconds += Number(session.seconds) || 0;
    total.money += Number(session.money) || 0;
    return total;
  }, { count: 0, seconds: 0, money: 0 });
}

function groupByActivity(sessions) {
  const grouped = {};
  const allActivities = getActivities();
  getActivityList().forEach((activity) => {
    grouped[activity.key] = { count: 0, seconds: 0, money: 0 };
  });
  sessions.forEach((session) => {
    const key = allActivities[session.activity] ? session.activity : "toilet";
    grouped[key].count += 1;
    grouped[key].seconds += Number(session.seconds) || 0;
    grouped[key].money += Number(session.money) || 0;
  });
  return grouped;
}

function getPeriodSessions(sessions, period) {
  if (period === "career") return sessions.slice();
  const now = new Date();
  let start;
  if (period === "day") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    const mondayOffset = (now.getDay() + 6) % 7;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return sessions.filter((session) => Number(session.at) >= start.getTime());
}

function formatMoney(value) {
  return `￥${(Number(value) || 0).toFixed(2)}`;
}

function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const parts = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return parts.map((item) => String(item).padStart(2, "0")).join(":");
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  if (seconds < 60) return `${seconds}秒`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
}

function clearAllData() {
  wx.removeStorageSync(PROFILE_KEY);
  wx.removeStorageSync(SESSIONS_KEY);
  wx.removeStorageSync(GOAL_KEY);
  wx.removeStorageSync(CUSTOM_ACTIVITY_KEY);
  wx.removeStorageSync(LEGACY_LEDGER_KEY);
}

module.exports = {
  activities,
  activityList,
  getActivities,
  getActivityList,
  getCustomActivity,
  saveCustomActivity,
  goalPresets,
  achievements,
  copyLines,
  pickLine,
  defaultProfile,
  normalizeProfile,
  hasProfile,
  getProfile,
  saveProfile,
  getSessions,
  saveSessions,
  addSession,
  getGoal,
  normalizeGoal,
  saveGoal,
  getRates,
  getDateKey,
  aggregate,
  groupByActivity,
  getPeriodSessions,
  formatMoney,
  formatClock,
  formatDuration,
  clearAllData
};
