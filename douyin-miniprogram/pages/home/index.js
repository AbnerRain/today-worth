const store = require("../../utils/data");
const shareImage = require("../../utils/share-image");
const analytics = require("../../utils/analytics");

const LONG_TIMER_SECONDS = 12 * 60 * 60;

const moneyBillAssets = [
  "/assets/money-rain/time-100.png",
  "/assets/money-rain/break-50.png",
  "/assets/money-rain/desk-20.png",
  "/assets/money-rain/off-10.png"
];

const coinAssetsByActivity = {
  toilet: ["/assets/reward-rain/toilet-coin.png"],
  meal: ["/assets/reward-rain/meal-coin.png"],
  nap: ["/assets/reward-rain/nap-coin.png"],
  custom: [
    "/assets/reward-rain/toilet-coin.png",
    "/assets/reward-rain/meal-coin.png",
    "/assets/reward-rain/nap-coin.png"
  ]
};

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
    reportSessionId: "",
    reportShareImageUrl: "",
    rewardItems: [],
    profileMeta: {},
    showOnboarding: false,
    onboardingProfile: store.defaultProfile,
    onboardingPreview: {},
    showCustomActivityEditor: false,
    customActivityConfigured: Boolean(initialActivities.custom && initialActivities.custom.configured),
    customActivityDraft: { label: "", stamp: "" },
    customActivityLabelMaxLength: store.CUSTOM_ACTIVITY_LABEL_MAX_LENGTH,
    customActivityStampMaxLength: store.CUSTOM_ACTIVITY_LABEL_MAX_LENGTH
  },

  onLoad() {
    this.startedAt = 0;
    this.timerId = null;
    shareImage.preloadShareImages(["toilet", "meal", "nap", "custom", "general"]);
    const profile = store.getProfile();
    const showOnboarding = !store.hasProfile();
    this.setData({
      showOnboarding,
      onboardingProfile: profile,
      onboardingPreview: this.makeRatePreview(profile)
    });
    if (showOnboarding) analytics.report("onboarding_view");
  },

  onShow() {
    this.refreshCopy();
    this.refreshData();
    if (!this.data.running) this.restoreTimer();
    if (this.data.running) {
      this.tick();
      this.ensureTimerInterval();
      if (this.wasHidden) {
        analytics.report("timer_restore", {
          activity: this.data.activity.key,
          duration_bucket: analytics.durationBucket(Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000)))
        });
      }
    }
    this.wasHidden = false;
  },

  onHide() {
    this.wasHidden = true;
    this.clearTimer();
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
    if (showOnboarding) tt.hideTabBar({ animation: false });
    else tt.showTabBar({ animation: false });
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
    const label = String(this.data.customActivityDraft.label || "")
      .trim()
      .slice(0, store.CUSTOM_ACTIVITY_LABEL_MAX_LENGTH);
    const stamp = String(this.data.customActivityDraft.stamp || "")
      .trim()
      .slice(0, store.CUSTOM_ACTIVITY_LABEL_MAX_LENGTH);
    if (!label) {
      tt.showToast({ title: "先填行为名称", icon: "none" });
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
    tt.showToast({ title: "行为已保存", icon: "success" });
  },

  toggleTimer() {
    if (this.data.running) this.stopTimer();
    else this.startTimer();
  },

  startTimer() {
    const activity = this.data.activity;
    const timer = store.saveActiveTimer({
      id: `timer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      activity: activity.key,
      startedAt: Date.now(),
      secondRate: this.rates.second,
      schemaVersion: 1
    });
    if (!timer) {
      tt.showToast({ title: "计时保存失败，请稍后重试", icon: "none" });
      return;
    }
    this.startedAt = timer.startedAt;
    this.activeTimerId = timer.id;
    this.activeSecondRate = timer.secondRate;
    const coinAssets = coinAssetsByActivity[activity.key] || coinAssetsByActivity.custom;
    const rewardItems = Array.from({ length: 18 }, (_, index) => {
      const isCoin = index % 3 === 1;
      return {
        id: `${this.startedAt}-${index}`,
        kind: isCoin ? "coin" : "bill",
        src: isCoin
          ? coinAssets[Math.floor(index / 3) % coinAssets.length]
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
    this.ensureTimerInterval();
    analytics.report("timer_start", { activity: activity.key });
  },

  restoreTimer() {
    const timer = store.getActiveTimer();
    if (!timer) return false;
    const activity = store.getActivities()[timer.activity];
    if (!activity) {
      store.clearActiveTimer();
      return false;
    }
    this.startedAt = timer.startedAt;
    this.activeTimerId = timer.id;
    this.activeSecondRate = timer.secondRate;
    const coinAssets = coinAssetsByActivity[activity.key] || coinAssetsByActivity.custom;
    const rewardItems = Array.from({ length: 18 }, (_, index) => {
      const isCoin = index % 3 === 1;
      return {
        id: `${timer.id}-${index}`,
        kind: isCoin ? "coin" : "bill",
        src: isCoin
          ? coinAssets[Math.floor(index / 3) % coinAssets.length]
          : moneyBillAssets[index % moneyBillAssets.length]
      };
    });
    this.setData({
      activeActivity: activity.key,
      activity,
      running: true,
      rewardItems,
      liveLine: store.pickLine(activity.runningLines, this.data.liveLine),
      sceneLine: store.pickLine(activity.sceneLines, this.data.sceneLine)
    });
    this.tick();
    this.ensureTimerInterval();
    analytics.report("timer_restore", {
      activity: activity.key,
      duration_bucket: analytics.durationBucket(Math.max(0, Math.floor((Date.now() - timer.startedAt) / 1000)))
    });
    return true;
  },

  ensureTimerInterval() {
    if (!this.timerId) this.timerId = setInterval(() => this.tick(), 250);
  },

  tick() {
    if (!this.startedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    this.setData({
      timerText: store.formatClock(elapsed),
      liveMoney: store.formatMoney(elapsed * (this.activeSecondRate || this.rates.second))
    });
  },

  stopTimer() {
    if (!this.startedAt || !this.data.running) return;
    if (Date.now() < this.startedAt) {
      tt.showToast({ title: "系统时间异常，请校准后重试", icon: "none" });
      return;
    }
    const seconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
    if (seconds > LONG_TIMER_SECONDS) {
      tt.showModal({
        title: "这次计时有点久",
        content: "本次记录持续时间较长，是否按完整时长结算？",
        confirmText: "完整结算",
        cancelText: "其他操作",
        success: (result) => {
          if (result.confirm) this.finishTimer(seconds);
          else this.confirmDiscardLongTimer();
        }
      });
      return;
    }
    this.finishTimer(seconds);
  },

  finishTimer(seconds) {
    if (!this.startedAt || !this.data.running || this.finishingTimer) return;
    this.finishingTimer = true;
    const money = seconds * (this.activeSecondRate || this.rates.second);
    const activity = this.data.activity;
    const quote = store.pickLine(activity.reportQuotes, this.data.report && this.data.report.quote);
    const reportCaption = store.pickLine(activity.reportCaptions, this.data.report && this.data.report.reportCaption);
    const finishedAt = Date.now();
    const session = store.addSession({
      activity: activity.key,
      startedAt: this.startedAt,
      endedAt: finishedAt,
      seconds,
      money,
      rateSnapshot: this.activeSecondRate || this.rates.second,
      at: finishedAt
    });
    const todayKey = store.getDateKey(finishedAt);
    const todayActivitySessions = store.getSessions().filter((session) => (
      session.activity === activity.key && store.getDateKey(session.at) === todayKey
    ));
    const todayActivityTotal = store.aggregate(todayActivitySessions);
    this.clearTimer();
    store.clearActiveTimer();
    this.startedAt = 0;
    this.activeTimerId = "";
    this.activeSecondRate = 0;
    const report = {
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
    };
    this.setData({
      running: false,
      timerText: "00:00:00",
      liveMoney: "￥0.00",
      liveLine: store.pickLine(activity.doneLines, this.data.liveLine),
      rewardItems: [],
      showReport: true,
      report,
      reportSessionId: session.id,
      reportShareImageUrl: ""
    }, () => {
      shareImage.prepareReportShareImage(this, report).then((imageUrl) => {
        const currentReport = this.data.report || {};
        if (currentReport.activityKey === report.activityKey && currentReport.moneyText === report.moneyText) {
          this.setData({ reportShareImageUrl: imageUrl });
        }
      });
    });
    this.renderTotals();
    analytics.report("timer_complete", {
      activity: activity.key,
      duration_bucket: analytics.durationBucket(seconds),
      money_bucket: analytics.moneyBucket(money)
    });
    this.finishingTimer = false;
  },

  confirmDiscardLongTimer() {
    tt.showModal({
      title: "继续还是放弃？",
      content: "继续计时会保留当前进度；放弃后本次不会生成记录。",
      confirmText: "放弃记录",
      confirmColor: "#d83a34",
      cancelText: "继续计时",
      success: (result) => {
        if (!result.confirm) return;
        const activity = this.data.activity;
        this.clearTimer();
        store.clearActiveTimer();
        this.startedAt = 0;
        this.activeTimerId = "";
        this.activeSecondRate = 0;
        this.setData({
          running: false,
          timerText: "00:00:00",
          liveMoney: "￥0.00",
          rewardItems: [],
          liveLine: store.pickLine(activity.doneLines, this.data.liveLine)
        });
      }
    });
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
    tt.navigateTo({ url: "/pages/settings/index" });
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
    tt.showTabBar({ animation: false });
    this.refreshData();
    tt.showToast({ title: "工资条已生成", icon: "success" });
    analytics.report("onboarding_complete");
  },

  closeReport() {
    this.setData({ showReport: false });
  },

  undoReport() {
    const sessionId = this.data.reportSessionId;
    if (!sessionId) {
      tt.showToast({ title: "记录已撤销", icon: "none" });
      return;
    }
    tt.showModal({
      title: "撤销本次记录？",
      content: "撤销后，首页累计、统计和成就都会同步更新。",
      confirmText: "确认撤销",
      confirmColor: "#d83a34",
      success: (result) => {
        if (!result.confirm) return;
        const deleted = store.deleteSessionById(sessionId);
        if (!deleted) {
          tt.showToast({ title: "记录已撤销", icon: "none" });
          this.setData({ showReport: false, reportSessionId: "" });
          return;
        }
        analytics.report("timer_cancel", { activity: deleted.activity });
        this.setData({
          showReport: false,
          report: {},
          reportSessionId: "",
          reportShareImageUrl: ""
        });
        this.renderTotals();
        tt.showToast({ title: "本次记录已撤销", icon: "success" });
      }
    });
  },

  blockBubble() {},

  onShareAppMessage(event = {}) {
    const report = this.data.report;
    const hasReport = Boolean(report.title && report.moneyText);
    const activityKey = report.activityKey || this.data.activeActivity;
    const shareMessage = {
      title: hasReport
        ? `${report.title}，赚了${report.moneyText}`
        : "摸力全开：算算你上班每分钟值多少钱",
      path: "/pages/home/index?from=share&src=douyin_friend"
    };
    if (hasReport && this.data.reportShareImageUrl) {
      shareMessage.imageUrl = this.data.reportShareImageUrl;
    } else if (!hasReport) {
      const imageUrl = shareImage.getShareImageUrl(activityKey);
      if (imageUrl) shareMessage.imageUrl = imageUrl;
    }
    if (hasReport && event.from === "button") {
      analytics.report("report_share_open", {
        activity: activityKey,
        money_bucket: analytics.moneyBucket(Number(String(report.moneyText).replace(/[^0-9.-]/g, "")))
      });
    }
    return shareMessage;
  }
});
