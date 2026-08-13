const test = require("node:test");
const assert = require("node:assert/strict");

const { loadPage } = require("./helpers/miniprogram");

const homePage = "miniprogram/pages/home/index.js";

test("首页今日累计只展示当前功能的数据", () => {
  const { page, store } = loadPage(homePage);
  const now = Date.now();
  store.saveSessions([
    { activity: "toilet", seconds: 30, money: 0.5, at: now },
    { activity: "meal", seconds: 90, money: 1.5, at: now },
    { activity: "nap", seconds: 120, money: 2, at: now }
  ]);
  page.data.activeActivity = "meal";
  page.data.goal = store.goalPresets[0];
  page.renderTotals();
  assert.deepEqual(page.data.today, { count: 1, secondsText: "1分钟", moneyText: "￥1.50" });
  assert.equal(page.data.goalMoneyText, "￥4.00 / ￥3.00");
  assert.equal(page.data.todayActivities.find((item) => item.key === "toilet").secondsText, "30秒");
  assert.equal(page.data.todayActivities.find((item) => item.key === "nap").secondsText, "2分钟");
});

test("启动计时时生成四种钞票与当前活动金币", () => {
  const { page, store } = loadPage(homePage);
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  global.setInterval = () => 99;
  global.clearInterval = () => {};
  try {
    page.rates = store.getRates(store.defaultProfile);
    page.data.activity = store.activities.meal;
    page.startTimer();
    assert.equal(page.data.rewardItems.length, 18);
    assert.equal(page.data.rewardItems.filter((item) => item.kind === "coin").length, 6);
    assert.equal(page.data.rewardItems.filter((item) => item.kind === "bill").length, 12);
    assert.ok(page.data.rewardItems.filter((item) => item.kind === "coin").every((item) => item.src.endsWith("meal-coin.png")));
    assert.deepEqual(new Set(page.data.rewardItems.filter((item) => item.kind === "bill").map((item) => item.src)).size, 4);
  } finally {
    page.clearTimer();
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});

test("结束计时只写入当前活动并生成专属结算页", () => {
  const { page, store } = loadPage(homePage);
  page.rates = store.getRates(store.defaultProfile);
  page.data.activeActivity = "nap";
  page.data.activity = store.activities.nap;
  page.data.goal = store.goalPresets[1];
  page.startedAt = Date.now() - 3100;
  page.activeSecondRate = page.rates.second;
  page.data.running = true;
  page.timerId = null;
  page.stopTimer();
  const sessions = store.getSessions();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].activity, "nap");
  assert.equal(sessions[0].seconds, 3);
  assert.match(sessions[0].id, /^session_/);
  assert.equal(page.data.reportSessionId, sessions[0].id);
  assert.equal(page.data.report.activityKey, "nap");
  assert.equal(page.data.report.mascot, "/assets/activity-mascots/nap-report-v1.png");
  assert.equal(page.data.showReport, true);
  assert.equal(page.data.today.count, 1);
  assert.equal(page.data.today.secondsText, "3秒");
});

test("页面恢复后沿用开始时秒薪且不会创建重复计时器", () => {
  const startedAt = Date.now() - 61000;
  const { page, store } = loadPage(homePage);
  store.saveActiveTimer({ id: "timer_restore", activity: "meal", startedAt, secondRate: 0.5 });
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  let intervalCount = 0;
  global.setInterval = () => {
    intervalCount += 1;
    return 88;
  };
  global.clearInterval = () => {};
  try {
    assert.equal(page.restoreTimer(), true);
    page.ensureTimerInterval();
    assert.equal(page.data.running, true);
    assert.equal(page.data.activeActivity, "meal");
    assert.equal(page.activeSecondRate, 0.5);
    assert.equal(intervalCount, 1);
    assert.ok(Number(page.data.liveMoney.replace("￥", "")) >= 30);
  } finally {
    page.clearTimer();
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});

test("系统时间回拨时不会生成记录", () => {
  const { page, store } = loadPage(homePage);
  page.rates = store.getRates(store.defaultProfile);
  page.data.running = true;
  page.data.activity = store.activities.toilet;
  page.startedAt = Date.now() + 60000;
  page.stopTimer();
  assert.equal(store.getSessions().length, 0);
  assert.equal(page.data.running, true);
});

test("超过十二小时会先确认且取消后保持计时", () => {
  const { page, store } = loadPage(homePage);
  page.rates = store.getRates(store.defaultProfile);
  page.activeSecondRate = page.rates.second;
  page.data.running = true;
  page.data.activity = store.activities.nap;
  page.startedAt = Date.now() - 13 * 60 * 60 * 1000;
  const dialogs = [];
  global.wx.showModal = (options) => {
    dialogs.push(options.title);
    options.success({ confirm: false });
  };
  page.stopTimer();
  assert.deepEqual(dialogs, ["这次计时有点久", "继续还是放弃？"]);
  assert.equal(store.getSessions().length, 0);
  assert.equal(page.data.running, true);
});

test("结算页撤销只删除当前记录并刷新累计", () => {
  const { page, store } = loadPage(homePage);
  const keep = store.addSession({ activity: "meal", seconds: 60, money: 1, endedAt: Date.now() - 1000 });
  const undo = store.addSession({ activity: "toilet", seconds: 30, money: 0.5, endedAt: Date.now() });
  page.data.goal = store.goalPresets[0];
  page.data.reportSessionId = undo.id;
  page.data.report = { activityKey: "toilet" };
  global.wx.showModal = (options) => options.success({ confirm: true });
  page.undoReport();
  assert.equal(store.getSessions().length, 1);
  assert.equal(store.getSessions()[0].id, keep.id);
  assert.equal(page.data.showReport, false);
  assert.equal(page.data.goalMoneyText, "￥1.00 / ￥3.00");
});

test("四种结算分享均使用含真实金额的动态卡片", () => {
  const { page, store } = loadPage(homePage);
  const scenarios = [
    { key: "toilet", moneyText: "￥0.31" },
    { key: "meal", moneyText: "￥1.28" },
    { key: "nap", moneyText: "￥2.56" },
    { key: "custom", moneyText: "￥8.88" }
  ];

  scenarios.forEach(({ key, moneyText }) => {
    const activity = store.getActivities()[key];
    page.data.activeActivity = key;
    page.data.report = {
      activityKey: key,
      title: `本次${activity.fullLabel}`,
      moneyText
    };
    page.data.reportShareImageUrl = `/tmp/${key}-${moneyText}.jpg`;
    const result = page.onShareAppMessage();
    assert.equal(result.title, `本次${activity.fullLabel}，赚了${moneyText}`);
    assert.equal(result.imageUrl, `/tmp/${key}-${moneyText}.jpg`);
    assert.match(result.path, /src=wechat_friend/);
  });
});

test("动态分享卡生成失败时退回含金额的当前结算页截图", () => {
  const { page } = loadPage(homePage);
  page.data.activeActivity = "toilet";
  page.data.report = { activityKey: "toilet", title: "本次带薪拉屎", moneyText: "￥0.66" };
  page.data.reportShareImageUrl = "";
  const result = page.onShareAppMessage();
  assert.equal(result.title, "本次带薪拉屎，赚了￥0.66");
  assert.equal(Object.prototype.hasOwnProperty.call(result, "imageUrl"), false);
});

test("未结算时首页分享仍使用静态活动卡", () => {
  const { page } = loadPage(homePage);
  page.data.activeActivity = "toilet";
  page.data.report = {};
  const result = page.onShareAppMessage();
  assert.equal(result.title, "摸力全开：算算你上班每分钟值多少钱");
  assert.equal(result.imageUrl, "/assets/share-cards/toilet.jpg");
});
