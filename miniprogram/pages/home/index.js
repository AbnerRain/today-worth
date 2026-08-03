const store = require("../../utils/data");

const moneyBillAssets = [
  "/assets/money-rain/time-100.png",
  "/assets/money-rain/break-50.png",
  "/assets/money-rain/desk-20.png",
  "/assets/money-rain/off-10.png"
];

Page({
  data: {
    activities: store.activityList,
    activeActivity: "toilet",
    activity: store.activities.toilet,
    running: false,
    timerText: "00:00:00",
    liveMoney: "￥0.00",
    liveLine: store.activities.toilet.idle,
    rates: {},
    today: { count: 0, secondsText: "0秒", moneyText: "￥0.00" },
    todayActivities: [],
    goalPresets: store.goalPresets,
    goal: store.goalPresets[1],
    goalMoneyText: "￥0.00 / ￥18.00",
    goalProgress: 0,
    goalStatus: "开始一次带薪活动，向冰美式发起冲击。",
    showReport: false,
    report: {},
    rewardItems: [],
    profileMeta: {},
    showOnboarding: false,
    onboardingProfile: store.defaultProfile,
    onboardingPreview: {}
  },

  onLoad() {
    this.startedAt = 0;
    this.timerId = null;
    const profile = store.getProfile();
    this.setData({
      showOnboarding: !store.hasProfile(),
      onboardingProfile: profile,
      onboardingPreview: this.makeRatePreview(profile)
    });
  },

  onShow() {
    this.refreshData();
    if (this.data.running) this.tick();
  },

  onUnload() {
    this.clearTimer();
  },

  refreshData() {
    const profile = store.getProfile();
    const rates = store.getRates(profile);
    const showOnboarding = !store.hasProfile();
    this.profile = profile;
    this.rates = rates;
    if (showOnboarding) wx.hideTabBar({ animation: false });
    else wx.showTabBar({ animation: false });
    this.setData({
      rates: {
        hour: store.formatMoney(rates.hour),
        minute: store.formatMoney(rates.minute),
        second: `￥${rates.second.toFixed(3)}`
      },
      profileMeta: {
        alias: profile.alias,
        detail: `月薪 ${store.formatMoney(profile.salary)} · ${profile.workdays}天 × ${profile.hours}小时`
      },
      showOnboarding,
      goal: store.getGoal()
    });
    this.renderTotals();
  },

  selectActivity(event) {
    if (this.data.running) return;
    const key = event.currentTarget.dataset.key;
    const activity = store.activities[key];
    if (!activity) return;
    this.setData({
      activeActivity: key,
      activity,
      liveLine: activity.idle
    });
    this.renderTotals();
  },

  toggleTimer() {
    if (this.data.running) this.stopTimer();
    else this.startTimer();
  },

  startTimer() {
    this.startedAt = Date.now();
    const rewardItems = Array.from({ length: 18 }, (_, index) => {
      const isCoin = index % 3 === 1;
      return {
        id: `${this.startedAt}-${index}`,
        kind: isCoin ? "coin" : "bill",
        src: isCoin
          ? this.data.activity.coin
          : moneyBillAssets[index % moneyBillAssets.length]
      };
    });
    this.setData({
      running: true,
      liveLine: this.data.activity.running,
      rewardItems
    });
    this.tick();
    this.timerId = setInterval(() => this.tick(), 250);
  },

  tick() {
    if (!this.startedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    this.setData({
      timerText: store.formatClock(elapsed),
      liveMoney: store.formatMoney(elapsed * this.rates.second)
    });
  },

  stopTimer() {
    const seconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
    const money = seconds * this.rates.second;
    const activity = this.data.activity;
    const finishedAt = Date.now();
    store.addSession({ activity: activity.key, seconds, money, at: finishedAt });
    const todayKey = store.getDateKey(finishedAt);
    const todayActivitySessions = store.getSessions().filter((session) => (
      session.activity === activity.key && store.getDateKey(session.at) === todayKey
    ));
    const todayActivityTotal = store.aggregate(todayActivitySessions);
    this.clearTimer();
    this.startedAt = 0;
    this.setData({
      running: false,
      timerText: "00:00:00",
      liveMoney: "￥0.00",
      liveLine: activity.done,
      rewardItems: [],
      showReport: true,
      report: {
        activityKey: activity.key,
        stamp: activity.stamp,
        title: `本次${activity.fullLabel}`,
        secondsText: store.formatDuration(seconds),
        moneyText: store.formatMoney(money),
        quote: activity.done,
        reportKicker: activity.reportKicker,
        reportTag: activity.reportTag,
        reportSfx: activity.reportSfx,
        reportCaption: activity.reportCaption,
        todayCountText: `${todayActivityTotal.count}次`,
        todaySecondsText: store.formatDuration(todayActivityTotal.seconds)
      }
    });
    this.renderTotals();
  },

  clearTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  },

  renderTotals() {
    const todayKey = store.getDateKey();
    const sessions = store.getSessions().filter((session) => store.getDateKey(session.at) === todayKey);
    const grouped = store.groupByActivity(sessions);
    const active = grouped[this.data.activeActivity];
    const total = store.aggregate(sessions);
    const goal = this.data.goal;
    const progress = Math.min(100, Math.round((total.money / goal.target) * 100));
    const remaining = Math.max(0, goal.target - total.money);
    const todayActivities = store.activityList.map((activity) => ({
      key: activity.key,
      label: activity.label,
      stamp: activity.stamp,
      active: activity.key === this.data.activeActivity,
      countText: `${grouped[activity.key].count}次`,
      secondsText: store.formatDuration(grouped[activity.key].seconds),
      moneyText: store.formatMoney(grouped[activity.key].money)
    }));
    this.setData({
      today: {
        count: active.count,
        secondsText: store.formatDuration(active.seconds),
        moneyText: store.formatMoney(active.money)
      },
      todayActivities,
      goalMoneyText: `${store.formatMoney(total.money)} / ${store.formatMoney(goal.target)}`,
      goalProgress: progress,
      goalStatus: remaining < 0.005
        ? `今天的${goal.label}由老板买单。`
        : `还差 ${store.formatMoney(remaining)}，继续带薪就能拿下。`
    });
  },

  selectGoal(event) {
    const goalId = event.currentTarget.dataset.id;
    const goal = store.goalPresets.find((item) => item.id === goalId);
    if (!goal) return;
    store.saveGoal(goalId);
    this.setData({ goal });
    this.renderTotals();
  },

  openSettings() {
    wx.navigateTo({ url: "/pages/settings/index" });
  },

  onOnboardingInput(event) {
    const field = event.currentTarget.dataset.field;
    const profile = Object.assign({}, this.data.onboardingProfile, {
      [field]: event.detail.value
    });
    this.setData({
      onboardingProfile: profile,
      onboardingPreview: this.makeRatePreview(profile)
    });
  },

  makeRatePreview(profile) {
    const rates = store.getRates(profile);
    return {
      hour: store.formatMoney(rates.hour),
      minute: store.formatMoney(rates.minute),
      second: `￥${rates.second.toFixed(3)}`
    };
  },

  saveOnboarding() {
    const profile = store.saveProfile(this.data.onboardingProfile);
    this.setData({
      onboardingProfile: profile,
      showOnboarding: false
    });
    wx.showTabBar({ animation: false });
    this.refreshData();
    wx.showToast({ title: "工资条已生成", icon: "success" });
  },

  closeReport() {
    this.setData({ showReport: false });
  },

  blockBubble() {},

  onShareAppMessage() {
    const report = this.data.report;
    return {
      title: report.title
        ? `${report.title}，赚了${report.moneyText}`
        : "时间工资条：算算你上班每分钟值多少钱",
      path: "/pages/home/index?from=share"
    };
  }
});
