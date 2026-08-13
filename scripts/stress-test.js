const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");

const storage = new Map();
let analyticsCount = 0;
const context = {
  font: "",
  set fillStyle(value) {},
  set textAlign(value) {},
  set textBaseline(value) {},
  fillRect() {},
  fillText() {},
  clearRect() {},
  drawImage() {},
  measureText(text) {
    const fontSize = Number(this.font.match(/(\d+)px/)?.[1] || 27);
    return { width: text.length * fontSize * 0.62 };
  }
};
const canvas = {
  width: 0,
  height: 0,
  getContext() { return context; },
  createImage() {
    const image = {};
    Object.defineProperty(image, "src", {
      set() { queueMicrotask(() => image.onload()); }
    });
    return image;
  }
};

global.wx = {
  env: {},
  getStorageSync(key) { return storage.has(key) ? storage.get(key) : ""; },
  setStorageSync(key, value) { storage.set(key, value); },
  removeStorageSync(key) { storage.delete(key); },
  reportAnalytics() { analyticsCount += 1; },
  createSelectorQuery() {
    return {
      in() { return this; },
      select() { return this; },
      fields() { return this; },
      exec(callback) { queueMicrotask(() => callback([{ node: canvas }])); }
    };
  },
  canvasToTempFilePath(options) {
    queueMicrotask(() => options.success({ tempFilePath: `/tmp/share-${Math.random()}.jpg` }));
  }
};

const store = require("../miniprogram/utils/data");
const analytics = require("../miniprogram/utils/analytics");
const shareImage = require("../miniprogram/utils/share-image");

function runSync(label, count, task) {
  const startedAt = performance.now();
  task();
  return { label, count, elapsed: performance.now() - startedAt };
}

async function runAsync(label, count, task) {
  const startedAt = performance.now();
  await task();
  return { label, count, elapsed: performance.now() - startedAt };
}

async function main() {
  const results = [];
  const activityKeys = ["toilet", "meal", "nap", "custom"];
  const moneyValues = [0, 0.01, 999.99, 9999.99, 99999.99, 999999.99, 9999999.99, 999999999.99];

  results.push(runSync("5000条记录聚合与删除", 5000, () => {
    const now = Date.now();
    const sessions = Array.from({ length: 5000 }, (_, index) => ({
      id: `stress_${index}`,
      activity: activityKeys[index % activityKeys.length],
      startedAt: now - index * 1000 - 500,
      endedAt: now - index * 1000,
      seconds: 1,
      money: index / 100,
      rateSnapshot: index / 100,
      source: "timer",
      schemaVersion: 2,
      at: now - index * 1000
    }));
    store.saveSessions(sessions);
    assert.equal(store.aggregate(store.getSessions()).count, 5000);
    assert.equal(store.deleteSessionById("stress_2500").id, "stress_2500");
    assert.equal(store.getSessions().length, 4999);
  }));

  results.push(runSync("100万次金额格式化与绘制", 1000000, () => {
    for (let index = 0; index < 1000000; index += 1) {
      const moneyText = store.formatMoney(moneyValues[index % moneyValues.length]);
      shareImage.drawReportAmount(context, activityKeys[index % activityKeys.length], moneyText);
    }
  }));

  results.push(await runAsync("2万次分享卡生成模拟", 20000, async () => {
    const jobs = Array.from({ length: 20000 }, (_, index) => shareImage.prepareReportShareImage({}, {
      activityKey: activityKeys[index % activityKeys.length],
      moneyText: store.formatMoney(moneyValues[index % moneyValues.length])
    }));
    const paths = await Promise.all(jobs);
    assert.equal(paths.filter(Boolean).length, 20000);
  }));

  results.push(runSync("1000次匿名分析事件", 1000, () => {
    analytics.captureEntry({ query: { src: "video_account" } });
    for (let index = 0; index < 1000; index += 1) {
      analytics.report("timer_complete", {
        activity: activityKeys[index % activityKeys.length],
        duration_bucket: analytics.durationBucket(index),
        money_bucket: analytics.moneyBucket(index / 10)
      });
    }
    assert.equal(analyticsCount, 1000);
  }));

  results.push(runSync("100次开始结束撤销循环", 100, () => {
    store.saveSessions([]);
    for (let index = 0; index < 100; index += 1) {
      const timer = store.saveActiveTimer({
        id: `timer_stress_${index}`,
        activity: activityKeys[index % activityKeys.length],
        startedAt: Date.now() - 1000,
        secondRate: 0.02
      });
      assert.ok(timer);
      const session = store.addSession({
        activity: timer.activity,
        startedAt: timer.startedAt,
        endedAt: timer.startedAt + 1000,
        seconds: 1,
        money: 0.02,
        rateSnapshot: timer.secondRate
      });
      store.clearActiveTimer();
      assert.equal(store.deleteSessionById(session.id).id, session.id);
    }
    assert.equal(store.getSessions().length, 0);
    assert.equal(store.getActiveTimer(), null);
  }));

  console.table(results.map((item) => ({
    场景: item.label,
    数量: item.count,
    耗时毫秒: Number(item.elapsed.toFixed(2)),
    每秒处理量: Math.round(item.count / (item.elapsed / 1000))
  })));
  console.log("压力测试通过，共 5 个场景。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
