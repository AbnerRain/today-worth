const store = require("../../utils/data");

Page({
  data: {
    filters: [
      { key: "all", label: "全部" },
      { key: "toilet", label: "拉屎" },
      { key: "meal", label: "吃饭" },
      { key: "nap", label: "睡觉" }
    ],
    activeFilter: "all",
    pageSubtitle: store.copyLines.achievements[0],
    unlockedCount: 0,
    totalCount: store.achievements.length,
    completion: 0,
    passNote: store.copyLines.achievementProgress[0],
    activityProgress: [],
    badges: []
  },

  onShow() {
    this.setData({
      pageSubtitle: store.pickLine(store.copyLines.achievements, this.data.pageSubtitle),
      passNote: store.pickLine(store.copyLines.achievementProgress, this.data.passNote)
    });
    this.renderBadges();
  },

  selectFilter(event) {
    this.setData({
      activeFilter: event.currentTarget.dataset.filter,
      pageSubtitle: store.pickLine(store.copyLines.achievements, this.data.pageSubtitle),
      passNote: store.pickLine(store.copyLines.achievementProgress, this.data.passNote)
    });
    this.renderBadges();
  },

  renderBadges() {
    const grouped = store.groupByActivity(store.getSessions());
    const activityIndexes = {};
    const allBadges = store.achievements.map((badge, index) => {
      const current = grouped[badge.activity][badge.metric];
      const activity = store.activities[badge.activity];
      const unlocked = current >= badge.target;
      activityIndexes[badge.activity] = (activityIndexes[badge.activity] || 0) + 1;
      return {
        id: `${badge.activity}-${badge.metric}-${badge.target}`,
        index: String(index + 1).padStart(2, "0"),
        activity: badge.activity,
        activityLabel: activity.label,
        stamp: activity.stamp,
        color: activity.color,
        image: `/assets/achievement-badges/${badge.activity}-${String(activityIndexes[badge.activity]).padStart(2, "0")}.png`,
        title: badge.title,
        desc: badge.desc,
        unlocked,
        progress: Math.min(100, Math.round((current / badge.target) * 100)),
        progressText: unlocked ? "已收入摸鱼履历" : `${this.formatMetric(badge.metric, current)} / ${this.formatMetric(badge.metric, badge.target)}`
      };
    });
    const unlockedCount = allBadges.filter((badge) => badge.unlocked).length;
    const badges = this.data.activeFilter === "all"
      ? allBadges
      : allBadges.filter((badge) => badge.activity === this.data.activeFilter);
    const activityProgress = this.data.filters.filter((filter) => filter.key !== "all").map((filter) => {
      const activity = store.activities[filter.key];
      const items = allBadges.filter((badge) => badge.activity === filter.key);
      const unlocked = items.filter((badge) => badge.unlocked).length;
      const metrics = grouped[filter.key];
      return {
        key: filter.key,
        label: activity.label,
        stamp: activity.stamp,
        color: activity.color,
        unlocked,
        total: items.length,
        percent: Math.round((unlocked / items.length) * 100),
        detail: `${metrics.count}次 · ${store.formatDuration(metrics.seconds)}`
      };
    });
    this.setData({
      badges,
      unlockedCount,
      completion: Math.round((unlockedCount / allBadges.length) * 100),
      activityProgress,
      passNote: store.pickLine(store.copyLines.achievementProgress, this.data.passNote)
    });
  },

  formatMetric(metric, value) {
    if (metric === "seconds") return store.formatDuration(value);
    if (metric === "money") return store.formatMoney(value);
    return `${Math.round(value)}次`;
  },

  onShareAppMessage() {
    return {
      title: `我的摸鱼履历已解锁 ${this.data.unlockedCount} 枚成就`,
      path: "/pages/home/index?from=achievement",
      imageUrl: "/assets/share-card.png"
    };
  }
});
