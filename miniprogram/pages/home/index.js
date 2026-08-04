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
    tagline: store.copyLines.home[0],
    activityHint: store.activities.toilet.hint,
    sceneLine: store.activities.toilet.sceneLine,
    onboardingSubtitle: store.copyLines.onboarding[0],
    goalNote: store.copyLines.goals.notes[0],
    todayNote: store.copyLines.todayNotes[0],
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
    customGoalDraft: { label: "自定义目标", target: 50 },
    showGoalEditor: false,
    ledgerEntries: [],
    ledgerFeedback: "挣的、花的、浪费的都在这里单独记清楚。",
    showLedgerEditor: false,
    ledgerEditor: {},
    ledgerModeOptions: [],
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
      goal: store.getGoal(),
      ledgerEntries: this.makeLedgerRows(store.getLedgerEntries())
    });
    this.renderTotals();
  },

  refreshCopy() {
    const activity = this.data.activity || store.activities.toilet;
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
    const activity = store.activities[key];
    if (!activity) return;
    this.setData({
      activeActivity: key,
      activity,
      activityHint: store.pickLine(activity.hints, this.data.activityHint),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine),
      liveLine: store.pickLine(activity.idleLines, this.data.liveLine)
    });
    this.renderTotals();
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
        mascot: `/assets/activity-mascots/${activity.key}-report-v1.png`,
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
    const active = grouped[this.data.activeActivity];
    const total = store.aggregate(sessions);
    const goal = this.data.goal;
    const progress = Math.min(100, Math.round((total.money / goal.target) * 100));
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
    if (goalId === "custom") {
      this.openGoalEditor();
      return;
    }
    const goal = store.goalPresets.find((item) => item.id === goalId);
    if (!goal) return;
    const savedGoal = store.saveGoal(goalId);
    this.setData({ goal: savedGoal });
    this.renderTotals();
  },

  openGoalEditor() {
    const goal = this.data.goal;
    this.setData({
      showGoalEditor: true,
      customGoalDraft: {
        label: goal.id === "custom" ? goal.label : "自定义目标",
        target: goal.id === "custom" ? goal.target : 50
      }
    });
  },

  onGoalInput(event) {
    const field = event.currentTarget.dataset.field;
    const customGoalDraft = Object.assign({}, this.data.customGoalDraft, {
      [field]: event.detail.value
    });
    this.setData({ customGoalDraft });
  },

  saveCustomGoal() {
    const draft = this.data.customGoalDraft;
    const goal = store.saveGoal({
      id: "custom",
      label: draft.label,
      target: draft.target,
      stamp: "定"
    });
    this.setData({ goal, showGoalEditor: false });
    this.renderTotals();
    wx.showToast({ title: "愿望已更新", icon: "success" });
  },

  closeGoalEditor() {
    this.setData({ showGoalEditor: false });
  },

  makeLedgerRows(entries) {
    return entries.map((entry) => Object.assign({}, entry, {
      summary: store.formatLedgerSummary(entry)
    }));
  },

  openLedgerEditor(event) {
    const kind = event.currentTarget.dataset.kind;
    const entry = store.getLedgerEntries().find((item) => item.kind === kind);
    const module = store.ledgerModules[kind] || store.ledgerModules.commute;
    if (!entry || !module) return;
    this.setData({
      showLedgerEditor: true,
      ledgerFeedback: entry.copy,
      ledgerModeOptions: module.modes,
      ledgerEditor: Object.assign({}, entry, {
        dialogTitle: module.dialogTitle,
        subtitle: module.subtitle,
        note: module.note,
        titlePlaceholder: module.titlePlaceholder,
        modeLabel: store.getLedgerModeConfig(entry.kind, entry.mode).label,
        unit: store.getLedgerModeConfig(entry.kind, entry.mode).unit
      })
    });
  },

  onLedgerInput(event) {
    const field = event.currentTarget.dataset.field;
    const ledgerEditor = Object.assign({}, this.data.ledgerEditor, {
      [field]: event.detail.value
    });
    this.setData({ ledgerEditor });
  },

  selectLedgerMode(event) {
    const mode = event.currentTarget.dataset.mode;
    const current = this.data.ledgerEditor;
    const modeConfig = store.getLedgerModeConfig(current.kind, mode);
    this.setData({
      ledgerEditor: Object.assign({}, current, {
        mode,
        value: modeConfig.defaultValue,
        copy: modeConfig.defaultCopy,
        modeLabel: modeConfig.label,
        unit: modeConfig.unit
      }),
      ledgerFeedback: modeConfig.defaultCopy
    });
  },

  saveLedgerEditor() {
    const editor = this.data.ledgerEditor;
    const entries = store.saveLedgerEntry({
      kind: editor.kind,
      title: editor.title,
      mode: editor.mode,
      value: editor.value,
      copy: editor.copy
    });
    const saved = entries.find((entry) => entry.kind === editor.kind);
    this.setData({
      showLedgerEditor: false,
      ledgerEntries: this.makeLedgerRows(entries),
      ledgerFeedback: saved ? saved.copy : this.data.ledgerFeedback
    });
    wx.showToast({ title: "账单已更新", icon: "success" });
  },

  closeLedgerEditor() {
    this.setData({ showLedgerEditor: false });
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
