const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const dataPath = path.join(root, "miniprogram/utils/data.js");
const shareImagePath = path.join(root, "miniprogram/utils/share-image.js");

function installWx(initialStorage = {}) {
  const storage = new Map(Object.entries(initialStorage));
  global.wx = {
    env: {},
    getStorageSync(key) {
      return storage.has(key) ? storage.get(key) : "";
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    removeStorageSync(key) {
      storage.delete(key);
    },
    hideTabBar() {},
    showTabBar() {},
    showToast() {},
    navigateTo() {},
    navigateBack() {},
    showModal() {}
  };
  return storage;
}

function clearModule(file) {
  delete require.cache[require.resolve(file)];
}

function loadStore(initialStorage = {}) {
  const storage = installWx(initialStorage);
  clearModule(dataPath);
  return { store: require(dataPath), storage };
}

function assignPath(target, pathText, value) {
  const parts = pathText.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
}

function loadPage(relativePath, initialStorage = {}) {
  const storage = installWx(initialStorage);
  clearModule(dataPath);
  clearModule(shareImagePath);
  const pagePath = path.join(root, relativePath);
  clearModule(pagePath);

  let pageConfig;
  global.Page = (config) => {
    pageConfig = config;
  };
  require(pagePath);
  if (!pageConfig) throw new Error(`${relativePath} 没有注册 Page`);

  const page = Object.assign({}, pageConfig, {
    data: structuredClone(pageConfig.data)
  });
  page.setData = function setData(patch) {
    Object.entries(patch).forEach(([key, value]) => assignPath(this.data, key, value));
  };

  return { page, storage, store: require(dataPath) };
}

module.exports = { loadPage, loadStore, root };
