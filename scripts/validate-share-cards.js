const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const miniRoot = path.join(root, "miniprogram");

function readJpegSize(file) {
  const buffer = fs.readFileSync(file);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error(`${file} 不是 JPG`);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`${file} JPG 标记异常`);
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5)
      };
    }
    offset += 2 + length;
  }
  throw new Error(`${file} 读取不到尺寸`);
}

function loadPage(file) {
  let pageConfig;
  global.wx = {
    getStorageSync() { return ""; },
    setStorageSync() {},
    removeStorageSync() {},
    hideTabBar() {},
    showTabBar() {},
    showToast() {},
    navigateTo() {}
  };
  global.Page = (config) => { pageConfig = config; };
  delete require.cache[require.resolve(file)];
  require(file);
  if (!pageConfig) throw new Error(`${file} 没有注册 Page`);
  return pageConfig;
}

function assertShare(pageFile, data, expectedImageUrl) {
  const page = loadPage(path.join(root, pageFile));
  const result = page.onShareAppMessage.call({ data });
  if (!result || result.imageUrl !== expectedImageUrl) {
    throw new Error(`${pageFile} imageUrl 不符合预期: ${JSON.stringify(result)}`);
  }
  if (result.imageUrl.startsWith("/") || result.imageUrl.includes("..")) {
    throw new Error(`${pageFile} imageUrl 必须是代码包根目录相对路径: ${result.imageUrl}`);
  }
  const imageFile = path.join(miniRoot, result.imageUrl);
  if (!fs.existsSync(imageFile)) throw new Error(`${pageFile} imageUrl 文件不存在: ${imageFile}`);
  const size = readJpegSize(imageFile);
  const bytes = fs.statSync(imageFile).size;
  if (size.width !== 500 || size.height !== 400) {
    throw new Error(`${imageFile} 尺寸错误: ${size.width}x${size.height}`);
  }
  if (bytes > 128 * 1024) throw new Error(`${imageFile} 超过 128KB: ${bytes}`);
  return { title: result.title, imageUrl: result.imageUrl, bytes };
}

const results = [
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "toilet", title: "本次带薪拉屎", moneyText: "￥0.04" }, activeActivity: "toilet" }, "assets/share-cards/toilet.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "meal", title: "本次带薪吃饭", moneyText: "￥0.04" }, activeActivity: "meal" }, "assets/share-cards/meal.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "nap", title: "本次带薪睡觉", moneyText: "￥0.04" }, activeActivity: "nap" }, "assets/share-cards/nap.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "custom", title: "本次自定义摸鱼", moneyText: "￥0.04" }, activeActivity: "custom" }, "assets/share-cards/custom.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: {}, activeActivity: "toilet" }, "assets/share-cards/toilet.jpg"),
  assertShare("miniprogram/pages/stats/index.js", { periodLabel: "今日", summary: { moneyText: "￥0.04" } }, "assets/share-cards/general.jpg"),
  assertShare("miniprogram/pages/achievements/index.js", { unlockedCount: 3 }, "assets/share-cards/general.jpg")
];

console.log(JSON.stringify(results, null, 2));
