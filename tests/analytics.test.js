const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { loadStore, root } = require("./helpers/miniprogram");
const analyticsPath = path.join(root, "miniprogram/utils/analytics.js");

function loadAnalytics(initialStorage = {}) {
  const { storage } = loadStore(initialStorage);
  delete require.cache[require.resolve(analyticsPath)];
  return { analytics: require(analyticsPath), storage };
}

test("渠道参数只接受白名单并识别好友群聊场景", () => {
  const { analytics } = loadAnalytics();
  assert.equal(analytics.captureEntry({ query: { src: "xiaohongshu" } }), "xiaohongshu");
  assert.equal(analytics.captureEntry({ query: { src: "<script>" } }), "unknown");
  assert.equal(analytics.captureEntry({ scene: 1007, query: {} }), "wechat_friend");
  assert.equal(analytics.captureEntry({ scene: 1008, query: {} }), "wechat_group");
});

test("区间边界保持稳定", () => {
  const { analytics } = loadAnalytics();
  assert.equal(analytics.durationBucket(59), "lt_1m");
  assert.equal(analytics.durationBucket(60), "1m_5m");
  assert.equal(analytics.durationBucket(3600), "gte_1h");
  assert.equal(analytics.moneyBucket(0.99), "lt_1");
  assert.equal(analytics.moneyBucket(100), "gte_100");
  assert.equal(analytics.unlockBucket(18), "18");
});

test("匿名事件只上报允许字段和区间数据", () => {
  const { analytics, storage } = loadAnalytics();
  analytics.captureEntry({ query: { src: "video_account" } });
  const sent = analytics.report("timer_complete", {
    activity: "meal",
    duration_bucket: "5m_15m",
    money_bucket: "5_20",
    salary: 12000,
    money: 8.88,
    alias: "不应上传"
  });
  assert.equal(sent, true);
  assert.deepEqual(storage.analyticsEvents[0].data, {
    channel: "video_account",
    version: "1.0.5",
    activity: "meal",
    duration_bucket: "5m_15m",
    money_bucket: "5_20"
  });
});
