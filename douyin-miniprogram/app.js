const versionInfo = require("./utils/version");
const analytics = require("./utils/analytics");

App({
  globalData: {
    appName: "摸力全开",
    version: versionInfo.CURRENT_VERSION,
    channel: "organic"
  },

  onLaunch(options) {
    this.globalData.channel = analytics.captureEntry(options);
  },

  onShow(options) {
    this.globalData.channel = analytics.captureEntry(options);
  }
});
