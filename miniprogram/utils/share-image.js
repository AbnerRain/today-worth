const SHARE_CARD_SOURCES = {
  toilet: "/assets/share-cards/toilet.jpg",
  meal: "/assets/share-cards/meal.jpg",
  nap: "/assets/share-cards/nap.jpg",
  custom: "/assets/share-cards/custom.jpg",
  general: "/assets/share-cards/general.jpg"
};

const SHARE_IMAGE_VERSION = "20260805e";
const preparedImages = {};
const REPORT_COLORS = {
  toilet: "#11a66a",
  meal: "#e85042",
  nap: "#2f6bff",
  custom: "#7357d9"
};

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

function parseMoneyText(moneyText) {
  const value = Number(String(moneyText || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatCompactMoney(moneyText) {
  const value = parseMoneyText(moneyText);
  if (value < 10000) return `￥${value.toFixed(2)}`;
  const divisor = value >= 100000000 ? 100000000 : 10000;
  const unit = divisor === 100000000 ? "亿" : "万";
  const amount = (value / divisor).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  return `￥${amount}${unit}`;
}

function measureTextWidth(context, text, fontSize) {
  context.font = `bold ${fontSize}px "Arial Black", sans-serif`;
  if (typeof context.measureText === "function") {
    const metrics = context.measureText(text);
    if (metrics && Number.isFinite(metrics.width)) return metrics.width;
  }
  return text.length * fontSize * 0.62;
}

function fitReportAmount(context, moneyText, maxWidth = 118) {
  let text = String(moneyText || "￥0.00");
  let fontSize = 27;
  while (fontSize > 14 && measureTextWidth(context, text, fontSize) > maxWidth) {
    fontSize -= 1;
  }
  if (measureTextWidth(context, text, fontSize) > maxWidth) {
    text = formatCompactMoney(text);
    fontSize = 20;
    while (fontSize > 14 && measureTextWidth(context, text, fontSize) > maxWidth) {
      fontSize -= 1;
    }
  }
  return { text, fontSize, width: measureTextWidth(context, text, fontSize) };
}

function drawReportAmount(context, activityKey, moneyText) {
  const fitted = fitReportAmount(context, moneyText);
  context.fillStyle = "#ffffff";
  context.fillRect(276, 210, 130, 35);
  context.fillStyle = REPORT_COLORS[getActivityKey(activityKey)] || REPORT_COLORS.custom;
  context.font = `bold ${fitted.fontSize}px "Arial Black", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(fitted.text, 341, 227);
}

function getCanvasNode(page) {
  if (!page || typeof wx === "undefined" || !wx.createSelectorQuery) return Promise.resolve(null);
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(page)
      .select("#reportShareCanvas")
      .fields({ node: true, size: true })
      .exec((result) => resolve(result && result[0] && result[0].node ? result[0].node : null));
  });
}

function loadCanvasImage(canvas, sourcePath) {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = sourcePath;
  });
}

function exportCanvas(canvas, page) {
  if (!wx.canvasToTempFilePath) return Promise.resolve("");
  return new Promise((resolve) => {
    wx.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width: 500,
      height: 400,
      destWidth: 500,
      destHeight: 400,
      fileType: "jpg",
      quality: 0.92,
      success: (result) => resolve(result.tempFilePath || ""),
      fail: () => resolve("")
    }, page);
  });
}

async function prepareReportShareImage(page, report = {}) {
  try {
    const canvas = await getCanvasNode(page);
    if (!canvas || !canvas.getContext || !canvas.createImage) return "";
    const activityKey = getActivityKey(report.activityKey);
    canvas.width = 500;
    canvas.height = 400;
    const context = canvas.getContext("2d");
    const template = await loadCanvasImage(canvas, getSourcePath(activityKey));
    context.clearRect(0, 0, 500, 400);
    context.drawImage(template, 0, 0, 500, 400);
    drawReportAmount(context, activityKey, report.moneyText);
    return exportCanvas(canvas, page);
  } catch (error) {
    return "";
  }
}

module.exports = {
  drawReportAmount,
  fitReportAmount,
  formatCompactMoney,
  getShareImageUrl,
  getSourcePath,
  preloadShareImages,
  prepareReportShareImage,
  prepareShareImage,
  SHARE_CARD_SOURCES
};
