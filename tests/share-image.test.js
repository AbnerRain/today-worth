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
