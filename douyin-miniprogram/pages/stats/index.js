const store = require("../../utils/data");
const shareImage = require("../../utils/share-image");
const analytics = require("../../utils/analytics");

const periodLabels = { day: "今天", week: "本周", month: "本月", career: "全部" };
const benchmarks = [
  { price: 0.5, label: "购物袋到账" },
  { price: 1, label: "打印一张纸" },
  { price: 2, label: "茶叶蛋到手" },
  { price: 3, label: "矿泉水回血" },
  { price: 5, label: "烤肠加餐局" },
  { price: 8, label: "柠檬水自由" },
  { price: 12, label: "手抓饼回血" },
  { price: 18, label: "冰美式续命" },
  { price: 25, label: "工作餐到账" },
  { price: 35, label: "奶茶加料局" },
  { price: 50, label: "电影票半张" },
  { price: 60, label: "双人快餐局" },
  { price: 88, label: "外卖硬菜局" },
  { price: 120, label: "单人火锅局" },
  { price: 150, label: "理发焕新局" },
  { price: 200, label: "朋友小聚局" },
  { price: 300, label: "按摩放松局" },
  { price: 500, label: "演出看台票" },
  { price: 800, label: "周末酒店一晚" },
  { price: 1200, label: "短途周边游" }
];

Page({
  data: {
    periods: [
      { key: "day", label: "日" },
      { key: "week", label: "周" },
      { key: "month", label: "月" },
      { key: "career", label: "生涯" }
    ],
    activePeriod: "day",
    periodLabel: "今天",
    pageSubtitle: store.copyLines.stats[0],
    contributionNote: store.copyLines.statsContributionNotes[0],
    recordsNote: store.copyLines.statsRecordNotes[0],
    emptyText: store.copyLines.emptyStats[0],
    summary: {},
    verdict: {},
    contributions: [],
    records: [],
    showRecordDetail: false,
    selectedRecord: {}
  },

  onShow() {
    shareImage.preloadShareImages(["general"]);
    this.refreshCopy();
    this.renderStats();
    analytics.report("stats_view", { period: this.data.activePeriod });
  },

  selectPeriod(event) {
    this.setData({
      activePeriod: event.currentTarget.dataset.period,
      pageSubtitle: store.pickLine(store.copyLines.stats, this.data.pageSubtitle),
      contributionNote: store.pickLine(store.copyLines.statsContributionNotes, this.data.contributionNote),
      recordsNote: store.pickLine(store.copyLines.statsRecordNotes, this.data.recordsNote)
    });
    this.renderStats();
    analytics.report("stats_view", { period: this.data.activePeriod });
  },

  refreshCopy() {
    this.setData({
      pageSubtitle: store.pickLine(store.copyLines.stats, this.data.pageSubtitle),
      contributionNote: store.pickLine(store.copyLines.statsContributionNotes, this.data.contributionNote),
      recordsNote: store.pickLine(store.copyLines.statsRecordNotes, this.data.recordsNote),
      emptyText: store.pickLine(store.copyLines.emptyStats, this.data.emptyText)
    });
  },

  renderStats() {
    const sessions = store.getPeriodSessions(store.getSessions(), this.data.activePeriod);
    const total = store.aggregate(sessions);
    const grouped = store.groupByActivity(sessions);
    const activities = store.getActivities();
    const contributions = store.getActivityList().map((activity) => {
      const item = grouped[activity.key];
      return {
        key: activity.key,
        label: activity.label,
        stamp: activity.stamp,
        moneyText: store.formatMoney(item.money),
        secondsText: store.formatDuration(item.seconds),
        countText: `${item.count}次`,
        percent: total.money > 0 ? Math.round((item.money / total.money) * 100) : 0,
        color: activity.color
      };
    });
    this.setData({
      periodLabel: periodLabels[this.data.activePeriod],
      summary: {
        count: total.count,
        secondsText: store.formatDuration(total.seconds),
        moneyText: store.formatMoney(total.money)
      },
      verdict: this.makeVerdict(total.money),
      contributions,
      emptyText: store.pickLine(store.copyLines.emptyStats, this.data.emptyText),
      records: sessions.slice().sort((a, b) => b.at - a.at).slice(0, 8).map((session) => {
        const activity = activities[session.activity] || activities.toilet;
        const date = new Date(session.at);
        return {
          id: session.id,
          sessionId: session.id,
          stamp: activity.stamp,
          label: activity.fullLabel,
          activity: session.activity,
          time: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
          startedText: this.formatDateTime(session.startedAt),
          endedText: this.formatDateTime(session.endedAt),
          secondsText: store.formatDuration(session.seconds),
          moneyText: store.formatMoney(session.money)
        };
      })
    });
  },

  formatDateTime(value) {
    const date = new Date(Number(value) || Date.now());
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  },

  openRecordDetail(event) {
    const sessionId = event.currentTarget.dataset.id;
    const record = this.data.records.find((item) => item.sessionId === sessionId);
    if (!record) return;
    this.setData({ showRecordDetail: true, selectedRecord: record });
  },

  closeRecordDetail() {
    this.setData({ showRecordDetail: false, selectedRecord: {} });
  },

  deleteSelectedRecord() {
    const record = this.data.selectedRecord;
    if (!record.sessionId) return;
    tt.showModal({
      title: "删除这条记录？",
      content: "删除后，统计、愿望单和成就都会同步更新。",
      confirmText: "确认删除",
      confirmColor: "#d83a34",
      success: (result) => {
        if (!result.confirm) return;
        const deleted = store.deleteSessionById(record.sessionId);
        if (!deleted) {
          tt.showToast({ title: "记录已经不存在", icon: "none" });
          this.closeRecordDetail();
          this.renderStats();
          return;
        }
        analytics.report("record_delete", { activity: deleted.activity });
        this.closeRecordDetail();
        this.renderStats();
        tt.showToast({ title: "记录已删除", icon: "success" });
      }
    });
  },

  blockBubble() {},

  makeVerdict(money) {
    if (money <= 0) return { label: "还没开始薅", detail: "完成一次计时再换算" };
    const matched = benchmarks.slice().reverse().find((item) => money >= item.price);
    if (!matched) return { label: "硬币正在加载", detail: `距购物袋到账还差 ${store.formatMoney(0.5 - money)}` };
    return {
      label: matched.label,
      detail: `对标 ${store.formatMoney(matched.price)}，结余 ${store.formatMoney(money - matched.price)}`
    };
  },

  onShareAppMessage() {
    const shareMessage = {
      title: `我的摸力全开：${this.data.periodLabel}已赚${this.data.summary.moneyText || "￥0.00"}`,
      path: "/pages/home/index?from=stats&src=douyin_friend"
    };
    const imageUrl = shareImage.getShareImageUrl("general");
    if (imageUrl) shareMessage.imageUrl = imageUrl;
    return shareMessage;
  }
});
