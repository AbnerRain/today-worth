const SHARE_CARD_SOURCES = {
  toilet: "/assets/share-cards/toilet.jpg",
  meal: "/assets/share-cards/meal.jpg",
  nap: "/assets/share-cards/nap.jpg",
  custom: "/assets/share-cards/custom.jpg",
  general: "/assets/share-cards/general.jpg"
};

const SHARE_IMAGE_VERSION = "20260805e";
const preparedImages = {};

function getActivityKey(activityKey) {
  return SHARE_CARD_SOURCES[activityKey] ? activityKey : "general";
}

function getSourcePath(activityKey) {
  return SHARE_CARD_SOURCES[getActivityKey(activityKey)];
}

function canUseFileSystem() {
  return typeof wx !== "undefined" && wx.env && wx.env.USER_DATA_PATH && wx.getFileSystemManager;
}

function getTargetPath(sourcePath) {
  const fileName = sourcePath.split("/").pop().replace(".jpg", `-${SHARE_IMAGE_VERSION}.jpg`);
  return `${wx.env.USER_DATA_PATH}/${fileName}`;
}

function fileExists(manager, filePath) {
  try {
    manager.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function copyImageToUserData(manager, sourcePath, targetPath) {
  const sourceCandidates = [sourcePath, sourcePath.replace(/^\//, "")];
  for (let index = 0; index < sourceCandidates.length; index += 1) {
    try {
      const data = manager.readFileSync(sourceCandidates[index]);
      manager.writeFileSync(targetPath, data);
      if (fileExists(manager, targetPath)) return true;
    } catch (error) {
      // 不同基础库对代码包根路径解析有差异，继续尝试下一个候选路径。
    }
  }
  return false;
}

function prepareShareImage(activityKey) {
  const key = getActivityKey(activityKey);
  const sourcePath = getSourcePath(key);

  if (!canUseFileSystem()) {
    return sourcePath;
  }

  const manager = wx.getFileSystemManager();
  const cachedPath = preparedImages[key];
  if (cachedPath && fileExists(manager, cachedPath)) return cachedPath;

  const targetPath = getTargetPath(sourcePath);
  if (fileExists(manager, targetPath) || copyImageToUserData(manager, sourcePath, targetPath)) {
    preparedImages[key] = targetPath;
    return targetPath;
  }

  return "";
}

function preloadShareImages(activityKeys) {
  if (!Array.isArray(activityKeys)) return;
  activityKeys.forEach((activityKey) => {
    prepareShareImage(activityKey);
  });
}

function getShareImageUrl(activityKey) {
  const imageUrl = prepareShareImage(activityKey);
  if (!imageUrl) {
    return "";
  }
  return imageUrl;
}

module.exports = {
  getShareImageUrl,
  getSourcePath,
  preloadShareImages,
  prepareShareImage,
  SHARE_CARD_SOURCES
};
