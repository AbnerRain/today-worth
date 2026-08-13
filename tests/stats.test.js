const test = require("node:test");
const assert = require("node:assert/strict");

const { loadPage } = require("./helpers/miniprogram");

const statsPage = "miniprogram/pages/stats/index.js";

test("收益明细可打开详情并只删除选中记录", () => {
  const { page, store, storage } = loadPage(statsPage);
  const first = store.addSession({
    activity: "toilet",
    startedAt: Date.now() - 62000,
    endedAt: Date.now() - 2000,
    seconds: 60,
    money: 1
  });
  const second = store.addSession({
    activity: "meal",
    startedAt: Date.now() - 31000,
    endedAt: Date.now() - 1000,
    seconds: 30,
    money: 0.5
  });
  page.renderStats();
  page.openRecordDetail({ currentTarget: { dataset: { id: first.id } } });
  assert.equal(page.data.showRecordDetail, true);
  assert.equal(page.data.selectedRecord.sessionId, first.id);
  global.wx.showModal = (options) => options.success({ confirm: true });
  page.deleteSelectedRecord();
  assert.equal(page.data.showRecordDetail, false);
  assert.equal(store.getSessionById(first.id), null);
  assert.equal(store.getSessionById(second.id).id, second.id);
  assert.equal(page.data.summary.count, 1);
  assert.equal(storage.analyticsEvents.at(-1).eventName, "record_delete");
});

test("取消删除不会改变记录", () => {
  const { page, store } = loadPage(statsPage);
  const saved = store.addSession({ activity: "nap", seconds: 10, money: 0.2, endedAt: Date.now() });
  page.renderStats();
  page.openRecordDetail({ currentTarget: { dataset: { id: saved.id } } });
  global.wx.showModal = (options) => options.success({ confirm: false });
  page.deleteSelectedRecord();
  assert.equal(store.getSessionById(saved.id).id, saved.id);
  assert.equal(page.data.showRecordDetail, true);
});
