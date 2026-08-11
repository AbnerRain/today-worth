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
  page.timerId = null;
  page.stopTimer();
  const sessions = store.getSessions();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].activity, "nap");
  assert.equal(sessions[0].seconds, 3);
  assert.equal(page.data.report.activityKey, "nap");
  assert.equal(page.data.report.mascot, "/assets/activity-mascots/nap-report-v1.png");
  assert.equal(page.data.showReport, true);
  assert.equal(page.data.today.count, 1);
  assert.equal(page.data.today.secondsText, "3秒");
});
