const versionInfo = require("./version");

const CHANNEL_KEY = "moli-entry-channel-v1";
const ALLOWED_CHANNELS = new Set([
  "wechat_friend",
  "wechat_group",
  "moments",
  "xiaohongshu",
  "video_account",
  "official_account",
  "organic",
  "unknown"
]);

const EVENT_FIELDS = {
  onboarding_view: [],
  onboarding_complete: [],
  timer_start: ["activity"],
  timer_complete: ["activity", "duration_bucket", "money_bucket"],
  timer_restore: ["activity", "duration_bucket"],
  timer_cancel: ["activity"],
  report_share_open: ["activity", "money_bucket"],
  stats_view: ["period"],
  achievement_view: ["unlock_bucket"],
  record_delete: ["activity"]
};

function normalizeChannel(value) {
  if (value === undefined || value === null || value === "") return "organic";
  const channel = String(value).trim().slice(0, 32);
  return ALLOWED_CHANNELS.has(channel) ? channel : "unknown";
}

function captureEntry(options = {}) {
  const query = options.query && typeof options.query === "object" ? options.query : {};
  const scene = Number(options.scene);
  let channel;
  if (scene === 1008 || scene === 1044) channel = "wechat_group";
  else if (scene === 1007) channel = "wechat_friend";
  else if (query.src !== undefined && query.src !== "") channel = normalizeChannel(query.src);
  else {
    try {
      channel = normalizeChannel(wx.getStorageSync(CHANNEL_KEY));
    } catch (error) {
      channel = "organic";
    }
  }
  try {
    wx.setStorageSync(CHANNEL_KEY, channel);
  } catch (error) {
    // 渠道统计失败不能影响小程序启动。
  }
  return channel;
}

function getChannel() {
  try {
    return normalizeChannel(wx.getStorageSync(CHANNEL_KEY));
  } catch (error) {
    return "organic";
  }
}

function durationBucket(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 60) return "lt_1m";
  if (value < 300) return "1m_5m";
  if (value < 900) return "5m_15m";
  if (value < 1800) return "15m_30m";
  if (value < 3600) return "30m_1h";
  return "gte_1h";
}

function moneyBucket(money) {
  const value = Number(money);
  if (!Number.isFinite(value) || value < 1) return "lt_1";
  if (value < 5) return "1_5";
  if (value < 20) return "5_20";
  if (value < 50) return "20_50";
  if (value < 100) return "50_100";
  return "gte_100";
}

function unlockBucket(count) {
  const value = Math.max(0, Math.floor(Number(count) || 0));
  if (value === 0) return "0";
  if (value <= 5) return "1_5";
  if (value <= 12) return "6_12";
  if (value <= 17) return "13_17";
  return "18";
}

function sanitizeValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return String(value === undefined || value === null ? "" : value).slice(0, 32);
}

function report(eventName, data = {}) {
  const fields = EVENT_FIELDS[eventName];
  if (!fields || typeof wx === "undefined" || typeof wx.reportAnalytics !== "function") return false;
  const payload = {
    channel: getChannel(),
    version: versionInfo.CURRENT_VERSION
  };
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      payload[field] = sanitizeValue(data[field]);
    }
  });
  try {
    wx.reportAnalytics(eventName, payload);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  captureEntry,
  durationBucket,
  getChannel,
  moneyBucket,
  normalizeChannel,
  report,
  unlockBucket,
  ALLOWED_CHANNELS
};
