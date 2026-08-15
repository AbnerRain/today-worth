const store = require("../../utils/data");
const versionInfo = require("../../utils/version");

Page({
  data: {
    profile: store.defaultProfile,
    preview: {},
    currentVersion: versionInfo.CURRENT_VERSION,
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
    tt.showToast({ title: "工资条已更新", icon: "success" });
    setTimeout(() => tt.navigateBack(), 600);
  },

  openFeedback() {
    tt.showModal({
      title: "反馈建议",
      content: "抖音版反馈入口需要在开放平台配置完成后启用，请先通过小程序页面右上角菜单提交反馈。",
      showCancel: false
    });
  },

  clearData() {
    tt.showModal({
      title: "清空本机数据？",
      content: "工资设置、计时记录和愿望目标都会被清除，且无法恢复。",
      confirmText: "确认清空",
      confirmColor: "#d83a34",
      success: (result) => {
        if (!result.confirm) return;
        store.clearAllData();
        this.setData({ profile: store.defaultProfile });
        this.updatePreview(store.defaultProfile);
        tt.showToast({ title: "已清空", icon: "success" });
      }
    });
  }
});
