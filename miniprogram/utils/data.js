const PROFILE_KEY = "time-payslip-profile-v1";
const SESSIONS_KEY = "time-payslip-sessions-v1";
const GOAL_KEY = "time-payslip-goal-v1";

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
    stopText: "冲水结算",
    done: "冲水完成，这笔钱很有味道。",
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
    stopText: "吃饱结算",
    done: "光盘入账，午休终于有了回报。",
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
    stopText: "睡醒结算",
    done: "充电完成，精神和余额一起回血。",
    color: "#cbe8ff"
  }
};

const activityList = Object.keys(activities).map((key) => activities[key]);

const goalPresets = [
  { id: "water", label: "矿泉水", target: 3, stamp: "水" },
  { id: "coffee", label: "冰美式", target: 18, stamp: "咖" },
  { id: "meal", label: "工作餐", target: 25, stamp: "饭" },
  { id: "tea", label: "奶茶自由", target: 35, stamp: "茶" },
  { id: "hotpot", label: "一顿火锅", target: 120, stamp: "锅" }
];

const achievements = [
  { activity: "toilet", title: "屎无前例", desc: "完成第一次带薪拉屎", metric: "count", target: 1 },
  { activity: "toilet", title: "三顾茅庐", desc: "累计完成三次带薪拉屎", metric: "count", target: 3 },
  { activity: "toilet", title: "坐享其成", desc: "累计坐满十五分钟", metric: "seconds", target: 900 },
  { activity: "toilet", title: "薪想屎成", desc: "累计收益达到十元", metric: "money", target: 10 },
  { activity: "meal", title: "饭来张口", desc: "完成第一次带薪吃饭", metric: "count", target: 1 },
  { activity: "meal", title: "再三添饭", desc: "累计完成三次带薪吃饭", metric: "count", target: 3 },
  { activity: "meal", title: "细嚼薪咽", desc: "累计吃满一小时", metric: "seconds", target: 3600 },
  { activity: "meal", title: "薪安理得", desc: "吃饭收益累计达到十元", metric: "money", target: 10 },
  { activity: "nap", title: "一觉值千金", desc: "完成第一次带薪睡觉", metric: "count", target: 1 },
  { activity: "nap", title: "睡到薪来", desc: "累计完成三次带薪睡觉", metric: "count", target: 3 },
  { activity: "nap", title: "卧薪尝胆", desc: "累计睡满一小时", metric: "seconds", target: 3600 },
  { activity: "nap", title: "觉后余薪", desc: "睡觉收益累计达到十元", metric: "money", target: 10 }
];

const defaultProfile = {
  alias: "摸鱼群众",
  salary: 12000,
  workdays: 22,
  hours: 8
};

function getProfile() {
  const saved = wx.getStorageSync(PROFILE_KEY);
  return Object.assign({}, defaultProfile, saved || {});
}

function saveProfile(profile) {
  wx.setStorageSync(PROFILE_KEY, Object.assign({}, defaultProfile, profile));
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
  return goalPresets.find((goal) => goal.id === saved) || goalPresets[1];
}

function saveGoal(goalId) {
  wx.setStorageSync(GOAL_KEY, goalId);
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
  activityList.forEach((activity) => {
    grouped[activity.key] = { count: 0, seconds: 0, money: 0 };
  });
  sessions.forEach((session) => {
    const key = activities[session.activity] ? session.activity : "toilet";
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
}

module.exports = {
  activities,
  activityList,
  goalPresets,
  achievements,
  defaultProfile,
  getProfile,
  saveProfile,
  getSessions,
  saveSessions,
  addSession,
  getGoal,
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
