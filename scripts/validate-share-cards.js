const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const miniRoot = path.join(root, "miniprogram");
const userDataRoot = path.join(os.tmpdir(), `paid-wish-share-${process.pid}`);

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

function cleanUserData() {
  fs.rmSync(userDataRoot, { recursive: true, force: true });
  fs.mkdirSync(userDataRoot, { recursive: true });
}

function clearRequireCache(file) {
  const pagePath = path.join(root, file);
  const shareImagePath = path.join(miniRoot, "utils/share-image.js");
  delete require.cache[require.resolve(pagePath)];
  delete require.cache[require.resolve(shareImagePath)];
}

function makeFileSystemManager(options = {}) {
  return {
    accessSync(filePath) {
      fs.accessSync(filePath);
    },
    readFileSync(filePath) {
      if (options.failPackageRead) throw new Error("模拟代码包图片读取失败");
      const packagePath = filePath.replace(/^\//, "");
      return fs.readFileSync(path.join(miniRoot, packagePath));
    },
    writeFileSync(filePath, data) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(data));
    }
  };
}

function installWx(options = {}) {
  global.wx = {
    env: { USER_DATA_PATH: userDataRoot },
    getFileSystemManager() {
      return makeFileSystemManager(options);
    },
    getStorageSync() { return ""; },
    setStorageSync() {},
    removeStorageSync() {},
    hideTabBar() {},
    showTabBar() {},
    showToast() {},
    navigateTo() {}
  };
}

function loadPage(file, options) {
  let pageConfig;
  cleanUserData();
  installWx(options);
  clearRequireCache(file);
  global.Page = (config) => { pageConfig = config; };
  require(path.join(root, file));
  if (!pageConfig) throw new Error(`${file} 没有注册 Page`);
  return pageConfig;
}

function assertShare(pageFile, data, expectedFileName) {
  const page = loadPage(pageFile);
  const result = page.onShareAppMessage.call({ data });
  if (!result || !result.imageUrl) {
    throw new Error(`${pageFile} 没有返回 imageUrl: ${JSON.stringify(result)}`);
  }
  if (!result.imageUrl.startsWith(userDataRoot)) {
    throw new Error(`${pageFile} imageUrl 必须是用户目录本地路径: ${result.imageUrl}`);
  }
  if (path.basename(result.imageUrl) !== expectedFileName) {
    throw new Error(`${pageFile} imageUrl 文件名不符合预期: ${result.imageUrl}`);
  }
  if (!fs.existsSync(result.imageUrl)) throw new Error(`${pageFile} imageUrl 文件不存在: ${result.imageUrl}`);
  const size = readJpegSize(result.imageUrl);
  const bytes = fs.statSync(result.imageUrl).size;
  if (size.width !== 500 || size.height !== 400) {
    throw new Error(`${result.imageUrl} 尺寸错误: ${size.width}x${size.height}`);
  }
  if (bytes > 128 * 1024) throw new Error(`${result.imageUrl} 超过 128KB: ${bytes}`);
  return { title: result.title, imageUrl: result.imageUrl, bytes };
}

function assertNoBrokenFallback() {
  const page = loadPage("miniprogram/pages/home/index.js", { failPackageRead: true });
  const result = page.onShareAppMessage.call({
    data: {
      report: { activityKey: "toilet", title: "本次带薪拉屎", moneyText: "￥0.04" },
      activeActivity: "toilet"
    }
  });
  if (Object.prototype.hasOwnProperty.call(result, "imageUrl")) {
    throw new Error(`图片复制失败时不应返回破图路径: ${JSON.stringify(result)}`);
  }
  return { title: result.title, imageUrl: "页面截图兜底" };
}

const results = [
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "toilet", title: "本次带薪拉屎", moneyText: "￥0.04" }, activeActivity: "toilet" }, "toilet-20260805d.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "meal", title: "本次带薪吃饭", moneyText: "￥0.04" }, activeActivity: "meal" }, "meal-20260805d.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "nap", title: "本次带薪睡觉", moneyText: "￥0.04" }, activeActivity: "nap" }, "nap-20260805d.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: { activityKey: "custom", title: "本次自定义摸鱼", moneyText: "￥0.04" }, activeActivity: "custom" }, "custom-20260805d.jpg"),
  assertShare("miniprogram/pages/home/index.js", { report: {}, activeActivity: "toilet" }, "toilet-20260805d.jpg"),
  assertShare("miniprogram/pages/stats/index.js", { periodLabel: "今日", summary: { moneyText: "￥0.04" } }, "general-20260805d.jpg"),
  assertShare("miniprogram/pages/achievements/index.js", { unlockedCount: 3 }, "general-20260805d.jpg"),
  assertNoBrokenFallback()
];

fs.rmSync(userDataRoot, { recursive: true, force: true });
console.log(JSON.stringify(results, null, 2));
