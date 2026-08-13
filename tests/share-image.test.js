const test = require("node:test");
const assert = require("node:assert/strict");

const shareImage = require("../miniprogram/utils/share-image");

test("四种分享卡都把真实金额绘制到本次入账区域", () => {
  const scenarios = [
    ["toilet", "￥0.31", "#11a66a"],
    ["meal", "￥1.28", "#e85042"],
    ["nap", "￥2.56", "#2f6bff"],
    ["custom", "￥8.88", "#7357d9"]
  ];

  scenarios.forEach(([activityKey, moneyText, color]) => {
    const operations = [];
    const context = {
      set fillStyle(value) { operations.push(["fillStyle", value]); },
      set font(value) { operations.push(["font", value]); },
      set textAlign(value) { operations.push(["textAlign", value]); },
      set textBaseline(value) { operations.push(["textBaseline", value]); },
      fillRect(...args) { operations.push(["fillRect", ...args]); },
      fillText(...args) { operations.push(["fillText", ...args]); }
    };
    shareImage.drawReportAmount(context, activityKey, moneyText);
    assert.deepEqual(operations.find((item) => item[0] === "fillRect"), ["fillRect", 276, 210, 130, 35]);
    assert.deepEqual(operations.find((item) => item[0] === "fillText"), ["fillText", moneyText, 341, 227]);
    assert.ok(operations.some((item) => item[0] === "fillStyle" && item[1] === color));
  });
});

test("边界金额会按实际宽度缩放或紧凑显示", () => {
  const values = [
    "￥0.00",
    "￥0.01",
    "￥999.99",
    "￥9999.99",
    "￥99999.99",
    "￥999999.99",
    "￥9999999.99",
    "￥999999999.99"
  ];
  const context = {
    font: "",
    measureText(text) {
      const size = Number(this.font.match(/(\d+)px/)?.[1] || 27);
      return { width: text.length * size * 0.62 };
    }
  };
  values.forEach((value) => {
    const fitted = shareImage.fitReportAmount(context, value);
    assert.ok(fitted.fontSize >= 14);
    assert.ok(fitted.width <= 118, `${value} 绘制宽度超出安全区`);
  });
  assert.equal(shareImage.formatCompactMoney("￥128360000"), "￥1.28亿");
  assert.equal(shareImage.formatCompactMoney("￥128360"), "￥12.84万");
});
