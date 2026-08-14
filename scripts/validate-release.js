const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const miniRoot = path.join(root, "miniprogram");
const expectedVersion = "1.0.5";
const expectedAppId = "wx2eb22fe5dbb782d9";
const expectedName = "摸力全开";
const errors = [];
const checks = [];

function record(condition, message) {
  if (condition) checks.push(message);
  else errors.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const appConfig = JSON.parse(read("miniprogram/app.json"));
const projectConfig = JSON.parse(read("project.config.json"));
const packageConfig = JSON.parse(read("package.json"));
const versionSource = read("miniprogram/utils/version.js");

record(projectConfig.appid === expectedAppId, "正式 AppID 已锁定");
record(projectConfig.miniprogramRoot === "miniprogram/", "小程序根目录配置正确");
record(projectConfig.projectname === expectedName, "项目名称为摸力全开");
record(appConfig.window.navigationBarTitleText === expectedName, "导航栏名称为摸力全开");
record(versionSource.includes(`CURRENT_VERSION = \"${expectedVersion}\"`), "小程序版本号为 1.0.5");
record(packageConfig.version === expectedVersion, "测试清单版本号为 1.0.5");

appConfig.pages.forEach((page) => {
  ["js", "json", "wxml", "wxss"].forEach((extension) => {
    const file = path.join(miniRoot, `${page}.${extension}`);
    record(fs.existsSync(file), `页面文件存在：${page}.${extension}`);
  });
});

const sourceFiles = walk(miniRoot).filter((file) => /\.(?:js|json|wxml|wxss)$/.test(file));
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const assetReferences = new Set(sourceText.match(/\/?assets\/[A-Za-z0-9._/-]+\.(?:png|jpg|svg)/g) || []);
assetReferences.forEach((reference) => {
  const relative = reference.replace(/^\//, "");
  record(fs.existsSync(path.join(miniRoot, relative)), `资源引用有效：${relative}`);
});

const requiredAssets = [
  "assets/activity-mascots/toilet-base-v1.png",
  "assets/activity-mascots/meal-base-v1.png",
  "assets/activity-mascots/nap-base-v1.png",
  "assets/activity-mascots/toilet-report-v1.png",
  "assets/activity-mascots/meal-report-v1.png",
  "assets/activity-mascots/nap-report-v1.png",
  "assets/money-rain/time-100.png",
  "assets/money-rain/break-50.png",
  "assets/money-rain/desk-20.png",
  "assets/money-rain/off-10.png",
  "assets/reward-rain/toilet-coin.png",
  "assets/reward-rain/meal-coin.png",
  "assets/reward-rain/nap-coin.png"
];
requiredAssets.forEach((relative) => {
  const file = path.join(miniRoot, relative);
  record(fs.existsSync(file) && fs.statSync(file).size > 0, `发布资源完整：${relative}`);
});

const homeWxml = read("miniprogram/pages/home/index.wxml");
const homeWxss = read("miniprogram/pages/home/index.wxss");
const homeSource = read("miniprogram/pages/home/index.js");
const shareImageSource = read("miniprogram/utils/share-image.js");
const statsWxss = read("miniprogram/pages/stats/index.wxss");
const achievementsWxss = read("miniprogram/pages/achievements/index.wxss");
const dataSource = read("miniprogram/utils/data.js");
const analyticsSource = read("miniprogram/utils/analytics.js");
const statsSource = read("miniprogram/pages/stats/index.js");
record(homeWxml.includes('class="money-rain"') && homeWxml.includes('class="activity-motion motion-toilet"'), "首页包含钞票雨与活动动作层");
record(homeWxml.includes('id="reportShareCanvas"') && homeWxml.includes("{{report.moneyText}}"), "结算页包含动态金额分享画布与真实金额");
record(homeSource.includes("prepareReportShareImage") && shareImageSource.includes("drawReportAmount"), "结算分享卡会动态绘制本次金额");
record(["toilet", "meal", "nap"].every((key) => homeWxss.includes(`.motion-${key}`)), "三种核心活动均有动画样式");
record(homeWxss.includes("@keyframes reward-fall") && homeWxss.includes("animation: reward-fall linear infinite both"), "钞票雨使用连续下落动画");
record(!sourceText.includes("用膳"), "业务文案不再包含旧称用膳");
record(!sourceText.includes("scroll-x"), "核心页面没有横向滚动依赖");
record(statsWxss.includes(".period-button { flex: 1 1 0; width: 0; min-width: 0;"), "统计周期按钮可在小屏等分收缩");
record(achievementsWxss.includes(".filter-button { display: flex; flex: 1 1 0; width: 0; min-width: 0;"), "成就筛选按钮可在小屏等分收缩");
record(dataSource.includes("moli-active-timer-v1") && homeSource.includes("restoreTimer"), "活动计时支持本机恢复");
record(homeSource.includes("undoReport") && statsSource.includes("deleteSelectedRecord"), "单次记录支持撤销和删除");
record(homeWxss.includes(".share-button, .close-button, .undo-button") && homeWxss.includes("background: #fff1ef"), "结算撤销入口使用完整按钮样式");
record(dataSource.includes("CUSTOM_ACTIVITY_LABEL_MAX_LENGTH = 12") && homeWxml.includes('maxlength="{{customActivityLabelMaxLength}}"'), "自定义活动名称支持十二个汉字");
record(dataSource.includes("CUSTOM_ACTIVITY_LABEL_MAX_LENGTH = 12") && homeWxml.includes('value="{{customActivityDraft.stamp}}" maxlength="{{customActivityLabelMaxLength}}"'), "自定义按钮标记与行为名称统一支持十二个汉字");
record(shareImageSource.includes("measureText") && shareImageSource.includes("formatCompactMoney"), "分享金额按真实宽度自适应");
record(analyticsSource.includes("wx.reportAnalytics") && analyticsSource.includes("ALLOWED_CHANNELS"), "渠道与匿名分析已接入");
record(!analyticsSource.includes("salary") && !analyticsSource.includes("alias"), "匿名分析不包含工资与用户代号");
record(packageConfig.scripts["test:stress"] === "node scripts/stress-test.js", "压力测试命令已配置");

const goalSection = sourceText.match(/const goalPresets = \[([\s\S]*?)\];/)?.[1] || "";
record((goalSection.match(/id:/g) || []).length >= 6, "带薪愿望单至少包含六个目标");
record(goalSection.includes("周末电影"), "愿望单包含非餐饮目标");

const miniFiles = walk(miniRoot);
const packageBytes = miniFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
record(packageBytes < 2 * 1024 * 1024, `主包大小 ${(packageBytes / 1024 / 1024).toFixed(2)} MB，小于 2 MB`);

record(read("README.md").startsWith(`# ${expectedName}`), "README 使用当前产品名称");
record(read("docs/WECHAT_MINIPROGRAM_ONBOARDING.md").includes(`小程序名称：${expectedName}`), "上线清单使用当前产品名称");

if (errors.length) {
  console.error("发布前检查失败：");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`发布前检查通过，共 ${checks.length} 项：`);
checks.forEach((message) => console.log(`- ${message}`));
