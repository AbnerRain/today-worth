const store = require("../../utils/data");

const periodLabels = { day: "今天", week: "本周", month: "本月", career: "全部" };
const benchmarks = [
  { price: 0.5, label: "购物袋有着落" },
  { price: 1, label: "打印店单页王" },
  { price: 3, label: "矿泉水到手" },
  { price: 8, label: "蜜雪入账" },
  { price: 18, label: "咖啡续命局" },
  { price: 25, label: "工作餐回血" },
  { price: 60, label: "双人快餐局" },
  { price: 120, label: "单人火锅局" },
  { price: 800, label: "周末酒店一晚" }
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
    summary: {},
    verdict: {},
    contributions: [],
    records: []
  },

  onShow() {
    this.renderStats();
  },

  selectPeriod(event) {
    this.setData({ activePeriod: event.currentTarget.dataset.period });
    this.renderStats();
  },

  renderStats() {
    const sessions = store.getPeriodSessions(store.getSessions(), this.data.activePeriod);
    const total = store.aggregate(sessions);
    const grouped = store.groupByActivity(sessions);
    const contributions = store.activityList.map((activity) => {
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
      records: sessions.slice().sort((a, b) => b.at - a.at).slice(0, 8).map((session) => {
        const activity = store.activities[session.activity] || store.activities.toilet;
        const date = new Date(session.at);
        return {
          id: `${session.at}-${session.activity}`,
          stamp: activity.stamp,
          label: activity.fullLabel,
          time: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
          secondsText: store.formatDuration(session.seconds),
          moneyText: store.formatMoney(session.money)
        };
      })
    });
  },

  makeVerdict(money) {
    if (money <= 0) return { label: "还没开始薅", detail: "完成一次计时再换算" };
    const matched = benchmarks.slice().reverse().find((item) => money >= item.price);
    if (!matched) return { label: "硬币正在加载", detail: `距购物袋还差 ${store.formatMoney(0.5 - money)}` };
    return {
      label: matched.label,
      detail: `参考 ${store.formatMoney(matched.price)}，还剩 ${store.formatMoney(money - matched.price)}`
    };
  },

  onShareAppMessage() {
    return {
      title: `我的时间工资条：${this.data.periodLabel}已赚${this.data.summary.moneyText || "￥0.00"}`,
      path: "/pages/home/index?from=stats"
    };
  }
});
