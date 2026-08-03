const DEFAULT_SHARE_TITLE = "今天值多少钱";

Page({
  data: {
    h5Url: "",
    lastWebViewUrl: ""
  },

  onLoad(options) {
    const app = getApp();
    const configuredUrl = app.globalData.h5Url || "";
    const previewUrl = options.url ? decodeURIComponent(options.url) : "";

    this.setData({
      h5Url: previewUrl || configuredUrl
    });
  },

  onWebViewLoad(event) {
    this.setData({
      lastWebViewUrl: event.detail.src || ""
    });
  },

  onWebViewError(event) {
    console.warn("H5 页面加载失败", event.detail);
  },

  onWebViewMessage(event) {
    console.log("收到 H5 消息", event.detail);
  },

  onShareAppMessage(options) {
    const sharedUrl = options.webViewUrl || this.data.lastWebViewUrl || this.data.h5Url;

    return {
      title: DEFAULT_SHARE_TITLE,
      path: sharedUrl
        ? `/pages/webview/index?url=${encodeURIComponent(sharedUrl)}`
        : "/pages/webview/index"
    };
  }
});
