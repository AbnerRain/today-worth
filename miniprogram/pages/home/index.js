const store = require("../../utils/data");

const moneyBillAssets = [
  "/assets/money-rain/time-100.png",
  "/assets/money-rain/break-50.png",
  "/assets/money-rain/desk-20.png",
  "/assets/money-rain/off-10.png"
];

const initialActivities = store.getActivities();
const initialActivity = initialActivities.toilet;

Page({
  data: {
    activities: store.getActivityList(),
    activeActivity: "toilet",
    activity: initialActivity,
    tagline: store.copyLines.home[0],
    activityHint: initialActivity.hint,
    sceneLine: initialActivity.sceneLine,
    onboardingSubtitle: store.copyLines.onboarding[0],
    goalNote: store.copyLines.goals.notes[0],
    todayNote: store.copyLines.todayNotes[0],
    running: false,
    timerText: "00:00:00",
    liveMoney: "￥0.00",
    liveLine: initialActivity.idle,
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
    onboardingPreview: {},
    showCustomActivityEditor: false,
    customActivityConfigured: Boolean(initialActivities.custom && initialActivities.custom.configured),
    customActivityDraft: { label: "", stamp: "" }
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
    this.refreshCopy();
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
    const activities = store.getActivities();
    const activeActivity = activities[this.data.activeActivity] ? this.data.activeActivity : "toilet";
    const activity = activities[activeActivity];
    this.profile = profile;
    this.rates = rates;
    if (showOnboarding) wx.hideTabBar({ animation: false });
    else wx.showTabBar({ animation: false });
    this.setData({
      activities: store.getActivityList(),
      customActivityConfigured: Boolean(activities.custom && activities.custom.configured),
      activeActivity,
      activity,
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
      goal: store.getGoal(),
      activityHint: activity.hint,
      sceneLine: activity.sceneLine,
      liveLine: this.data.running ? this.data.liveLine : activity.idle
    });
    this.renderTotals();
  },

  refreshCopy() {
    const activity = this.data.activity || store.getActivities().toilet;
    this.setData({
      tagline: store.pickLine(store.copyLines.home, this.data.tagline),
      activityHint: store.pickLine(activity.hints, this.data.activityHint),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine),
      onboardingSubtitle: store.pickLine(store.copyLines.onboarding, this.data.onboardingSubtitle),
      goalNote: store.pickLine(store.copyLines.goals.notes, this.data.goalNote),
      todayNote: store.pickLine(store.copyLines.todayNotes, this.data.todayNote)
    });
  },

  selectActivity(event) {
    if (this.data.running) return;
    const key = event.currentTarget.dataset.key;
    const activity = store.getActivities()[key];
    if (!activity) return;
    if (key === "custom" && !activity.configured) {
      this.openCustomActivityEditor();
      return;
    }
    this.setData({
      activeActivity: key,
      activity,
      activityHint: store.pickLine(activity.hints, this.data.activityHint),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine),
      liveLine: store.pickLine(activity.idleLines, this.data.liveLine)
    });
    this.renderTotals();
  },

  editActivity(event) {
    if (this.data.running) return;
    if (event.currentTarget.dataset.key === "custom") this.openCustomActivityEditor();
  },

  openCustomActivityEditor() {
    if (this.data.running) return;
    const activity = store.getCustomActivity();
    this.setData({
      showCustomActivityEditor: true,
      customActivityDraft: {
        label: activity.configured ? activity.label : "",
        stamp: activity.configured ? activity.stamp : ""
      }
    });
  },

  closeCustomActivityEditor() {
    this.setData({ showCustomActivityEditor: false });
  },

  onCustomActivityInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`customActivityDraft.${field}`]: event.detail.value });
  },

  saveCustomActivity() {
    const label = String(this.data.customActivityDraft.label || "").trim().slice(0, 6);
    const stamp = String(this.data.customActivityDraft.stamp || "").trim().slice(0, 2);
    if (!label) {
      wx.showToast({ title: "先填行为名称", icon: "none" });
      return;
    }
    const activity = store.saveCustomActivity({ label, stamp });
    this.setData({
      showCustomActivityEditor: false,
      activities: store.getActivityList(),
      customActivityConfigured: true,
      activeActivity: "custom",
      activity,
      activityHint: store.pickLine(activity.hints, this.data.activityHint),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine),
      liveLine: store.pickLine(activity.idleLines, this.data.liveLine)
    });
    this.renderTotals();
    wx.showToast({ title: "行为已保存", icon: "success" });
  },

  toggleTimer() {
    if (this.data.running) this.stopTimer();
    else this.startTimer();
  },

  startTimer() {
    this.startedAt = Date.now();
    const activity = this.data.activity;
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
      liveLine: store.pickLine(activity.runningLines, this.data.liveLine),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine),
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
    const quote = store.pickLine(activity.reportQuotes, this.data.report && this.data.report.quote);
    const reportCaption = store.pickLine(activity.reportCaptions, this.data.report && this.data.report.reportCaption);
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
      liveLine: store.pickLine(activity.doneLines, this.data.liveLine),
      rewardItems: [],
      showReport: true,
      report: {
        activityKey: activity.key,
        stamp: activity.stamp,
        title: `本次${activity.fullLabel}`,
        secondsText: store.formatDuration(seconds),
        moneyText: store.formatMoney(money),
        quote,
        reportKicker: activity.reportKicker,
        reportTag: activity.reportTag,
        reportSfx: activity.reportSfx,
        mascot: activity.reportMascot || `/assets/activity-mascots/${activity.key}-report-v1.png`,
        reportCaption,
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
    const active = grouped[this.data.activeActivity] || grouped.toilet;
    const total = store.aggregate(sessions);
    const goal = this.data.goal;
    const progress = Math.min(100, Math.round((total.money / goal.target) * 100));
    const todayActivities = store.getActivityList().map((activity) => ({
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
      goalStatus: this.makeGoalStatus(total.money, goal)
    });
  },

  makeGoalStatus(totalMoney, goal) {
    const remaining = Math.max(0, goal.target - totalMoney);
    if (remaining < 0.005) {
      return store.pickLine(store.copyLines.goals.complete, this.data.goalStatus);
    }
    const line = store.pickLine(store.copyLines.goals.progress, this.data.goalStatus);
    return `${line} 还差 ${store.formatMoney(remaining)}。`;
  },

  selectGoal(event) {
    const goalId = event.currentTarget.dataset.id;
    const goal = store.goalPresets.find((item) => item.id === goalId);
    if (!goal) return;
    const savedGoal = store.saveGoal(goalId);
    this.setData({ goal: savedGoal });
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
        : "摸力全开：算算你上班每分钟值多少钱",
      path: "/pages/home/index?from=share"
    };
  }
});
