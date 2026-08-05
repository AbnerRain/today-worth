const store = require("../../utils/data");

Page({
  data: {
    profile: store.defaultProfile,
    preview: {},
    pageSubtitle: store.copyLines.settings[0],
    privacyNote: store.copyLines.privacy[0]
  },

  onLoad() {
    const profile = store.getProfile();
    this.setData({ profile });
    this.updatePreview(profile);
  },

  onShow() {
    this.setData({
      pageSubtitle: store.pickLine(store.copyLines.settings, this.data.pageSubtitle),
      privacyNote: store.pickLine(store.copyLines.privacy, this.data.privacyNote)
    });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    const profile = Object.assign({}, this.data.profile, { [field]: event.detail.value });
    this.setData({ profile });
    this.updatePreview(profile);
  },

  updatePreview(profile) {
    const rates = store.getRates(profile);
    this.setData({
      preview: {
        hour: store.formatMoney(rates.hour),
        minute: store.formatMoney(rates.minute),
        second: `￥${rates.second.toFixed(3)}`
      }
    });
  },

  save() {
    const profile = store.saveProfile(this.data.profile);
    this.setData({ profile });
    wx.showToast({ title: "工资条已更新", icon: "success" });
    setTimeout(() => wx.navigateBack(), 600);
  },

  clearData() {
    wx.showModal({
      title: "清空本机数据？",
      content: "工资设置、计时记录和愿望目标都会被清除，且无法恢复。",
      confirmText: "确认清空",
      confirmColor: "#d83a34",
      success: (result) => {
        if (!result.confirm) return;
        store.clearAllData();
        this.setData({ profile: store.defaultProfile });
        this.updatePreview(store.defaultProfile);
        wx.showToast({ title: "已清空", icon: "success" });
      }
    });
  }
});
