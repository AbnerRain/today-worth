const VERSION_HISTORY = [
  {
    version: "1.0.4",
    date: "2026.08.11",
    title: "动效回归",
    summary: "恢复拉屎、吃饭、睡觉的小狗动画，以及虚拟钞票和专属金币雨。"
  },
  {
    version: "1.0.3",
    date: "2026.08.06",
    title: "功能补全",
    summary: "加入自定义摸鱼、微信分享卡片、更多成就，并完善首页排版。"
  },
  {
    version: "1.0.2",
    date: "2026.08.03",
    title: "体验升级",
    summary: "增加首次引导、移动端适配、活动动画和各模式专属结算页。"
  },
  {
    version: "1.0.1",
    date: "2026.08.03",
    title: "原生首版",
    summary: "完成工资换算、带薪计时、数据统计、成就与本机数据保存。"
  }
];

const CURRENT_VERSION = VERSION_HISTORY[0].version;

module.exports = {
  CURRENT_VERSION,
  VERSION_HISTORY: VERSION_HISTORY.map((item, index) => Object.assign({}, item, { isCurrent: index === 0 }))
};
