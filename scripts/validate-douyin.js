const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const miniRoot = path.join(root, "douyin-miniprogram");
const errors = [];
const checks = [];

function record(condition, message) {
  if (condition) checks.push(message);
  else errors.push(message);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

record(fs.existsSync(miniRoot), "抖音小程序目录存在");

if (fs.existsSync(miniRoot)) {
  const appConfig = JSON.parse(read("douyin-miniprogram/app.json"));
  const projectConfig = JSON.parse(read("douyin-miniprogram/project.config.json"));
  const sourceFiles = walk(miniRoot).filter((file) => /\.(?:js|json|ttml|ttss)$/.test(file));
  const sourceText = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

  record(/^tt[a-z0-9]+$/i.test(projectConfig.appid), "抖音 AppID 格式正确");
  record(projectConfig.miniprogramRoot === "./", "抖音工程根目录配置正确");
  record(projectConfig.douyinProjectType === "native", "抖音工程类型为原生小程序");
  record(appConfig.window.navigationBarTitleText === "摸力全开", "抖音导航栏名称为摸力全开");
  record(sourceFiles.some((file) => file.endsWith(".ttml")), "抖音目录包含 TTML 页面");
  record(sourceFiles.some((file) => file.endsWith(".ttss")), "抖音目录包含 TTSS 样式");
  record(!sourceText.includes("wx.") && !sourceText.includes("wx:") && !/\bwx\b/.test(sourceText), "抖音源码不包含微信命名空间");
  record(!sourceText.includes(".wxml") && !sourceText.includes(".wxss"), "抖音源码不包含微信文件后缀");
  record(!sourceText.includes("微信好友") && !sourceText.includes("微信小程序") && !sourceText.includes("wechat_"), "抖音源码不包含微信平台文案和渠道值");
  record(!sourceText.includes("fade-show") && !sourceText.includes('open-type="feedback"'), "抖音模板不包含微信专属组件属性");
  record(sourceText.includes("tt.getStorageSync") && sourceText.includes("tt.setStorageSync"), "抖音版本使用 tt 本地存储接口");
  record(sourceText.includes("tt.reportAnalytics"), "抖音版本使用 tt 数据分析接口");
  record(sourceText.includes('open-type="share"') && sourceText.includes("onShareAppMessage"), "抖音版本保留分享入口与分享回调");

  appConfig.pages.forEach((page) => {
    ["js", "json", "ttml", "ttss"].forEach((extension) => {
      record(fs.existsSync(path.join(miniRoot, `${page}.${extension}`)), `抖音页面文件存在：${page}.${extension}`);
    });
  });

  const assetReferences = new Set(sourceText.match(/\/?assets\/[A-Za-z0-9._/-]+\.(?:png|jpg|jpeg|svg|gif)/g) || []);
  assetReferences.forEach((reference) => {
    const relative = reference.replace(/^\//, "");
    record(fs.existsSync(path.join(miniRoot, relative)), `抖音资源引用有效：${relative}`);
  });

  const packageBytes = walk(miniRoot).reduce((total, file) => total + fs.statSync(file).size, 0);
  record(packageBytes < 2 * 1024 * 1024, `抖音目录大小 ${(packageBytes / 1024 / 1024).toFixed(2)} MB，小于 2 MB`);
}

if (errors.length) {
  console.error("抖音版本结构检查失败：");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`抖音版本结构检查通过，共 ${checks.length} 项：`);
checks.forEach((message) => console.log(`- ${message}`));
