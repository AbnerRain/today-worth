const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { loadStore, root } = require("./helpers/miniprogram");

test("工资换算结果准确", () => {
  const { store } = loadStore();
  const rates = store.getRates({ salary: 12000, workdays: 20, hours: 8 });
  assert.equal(rates.hour, 75);
  assert.equal(rates.minute, 1.25);
  assert.equal(rates.second, 1.25 / 60);
});

test("用户资料会规范化并保存在本机", () => {
  const { store } = loadStore();
  const profile = store.saveProfile({ alias: "  工位隐士超长代号测试文字  ", salary: "9000", workdays: "21.5", hours: "7.5" });
  assert.equal(profile.alias, "工位隐士超长代号测试文字".slice(0, 12));
  assert.equal(profile.salary, 9000);
  assert.equal(profile.workdays, 21.5);
  assert.equal(profile.hours, 7.5);
  assert.deepEqual(store.getProfile(), profile);
  assert.equal(store.hasProfile(), true);
});

test("三种核心活动与自定义活动分别统计", () => {
  const { store } = loadStore();
  const sessions = [
    { activity: "toilet", seconds: 30, money: 0.5 },
    { activity: "meal", seconds: 60, money: 1 },
    { activity: "nap", seconds: 90, money: 1.5 },
    { activity: "custom", seconds: 120, money: 2 }
  ];
  const grouped = store.groupByActivity(sessions);
  assert.deepEqual(grouped.toilet, { count: 1, seconds: 30, money: 0.5 });
  assert.deepEqual(grouped.meal, { count: 1, seconds: 60, money: 1 });
  assert.deepEqual(grouped.nap, { count: 1, seconds: 90, money: 1.5 });
  assert.deepEqual(grouped.custom, { count: 1, seconds: 120, money: 2 });
  assert.deepEqual(store.aggregate(sessions), { count: 4, seconds: 300, money: 5 });
});

test("今日筛选不会混入历史记录", () => {
  const { store } = loadStore();
  const current = { activity: "toilet", seconds: 10, money: 0.1, at: Date.now() };
  const historical = { activity: "meal", seconds: 20, money: 0.2, at: Date.now() - 45 * 24 * 60 * 60 * 1000 };
  assert.deepEqual(store.getPeriodSessions([current, historical], "day"), [current]);
  assert.deepEqual(store.getPeriodSessions([current, historical], "career"), [current, historical]);
});

test("会话记录最多保留最近五千条", () => {
  const { store } = loadStore();
  const sessions = Array.from({ length: 5005 }, (_, index) => ({ at: index, seconds: 1, money: 1 }));
  store.saveSessions(sessions);
  const saved = store.getSessions();
  assert.equal(saved.length, 5000);
  assert.equal(saved[0].at, 5);
  assert.equal(saved[4999].at, 5004);
});

test("自定义活动会截断名称与标记并参与活动列表", () => {
  const { store } = loadStore();
  const activity = store.saveCustomActivity({ label: "开会摸鱼测试", stamp: "会议" });
  assert.equal(activity.label, "开会摸鱼测试".slice(0, 6));
  assert.equal(activity.stamp, "会议".slice(0, 2));
  assert.equal(activity.configured, true);
  assert.equal(store.getActivityList().length, 4);
});

test("随机文案切换时不会原样重复", () => {
  const { store } = loadStore();
  const lines = ["第一句", "第二句"];
  for (let index = 0; index < 10; index += 1) {
    assert.equal(store.pickLine(lines, "第一句"), "第二句");
  }
});

test("十八枚成就均有对应图片", () => {
  const { store } = loadStore();
  assert.equal(store.achievements.length, 18);
  const counters = {};
  store.achievements.forEach((achievement) => {
    counters[achievement.activity] = (counters[achievement.activity] || 0) + 1;
    const file = path.join(root, "miniprogram/assets/achievement-badges", `${achievement.activity}-${String(counters[achievement.activity]).padStart(2, "0")}.png`);
    assert.equal(fs.existsSync(file), true, `缺少成就图片：${file}`);
    assert.ok(fs.statSync(file).size > 0, `成就图片为空：${file}`);
  });
  assert.deepEqual(counters, { toilet: 6, meal: 6, nap: 6 });
});

test("金额与时长格式保持稳定", () => {
  const { store } = loadStore();
  assert.equal(store.formatMoney(0.286), "￥0.29");
  assert.equal(store.formatClock(3661), "01:01:01");
  assert.equal(store.formatDuration(59), "59秒");
  assert.equal(store.formatDuration(3661), "1小时1分钟");
});
