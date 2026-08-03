# 微信小程序接入准备清单

本文记录《今天值多少钱》从 H5 Demo 接入微信小程序的准备工作。

## 当前判断

当前仓库是静态 H5 原型，入口为 `index.html`、`styles.css`、`app.js`。最快上线方式是先做一个微信小程序外壳，用 `web-view` 承载已部署的 H5 页面。

这个方案有一个硬前提：`web-view` 不支持个人类型小程序，普通网页还需要在小程序管理后台配置业务域名。若主体是个人号，第一版应改走原生小程序迁移。

## 已准备内容

- `project.config.json`：微信开发者工具导入项目时使用。
- `miniprogram/app.json`：小程序页面与窗口配置。
- `miniprogram/pages/webview/index.*`：H5 承载页。
- `.gitignore`：忽略开发者工具个人配置文件。

## 还缺的信息

- 小程序 AppID：从微信公众平台的小程序后台获取。
- 正式名称：避开“工资”“金融”“到账”等可能触发资质审核的词。
- 小程序头像：使用已设计好的 512px 图标版本。
- 服务类目：建议优先选工具、效率、生活服务相关类目，按后台可选项为准。
- H5 正式域名：必须是 HTTPS，且能在小程序后台完成业务域名配置。
- 备案：按后台提示补齐。若使用中国大陆服务器域名，通常要先完成 ICP 备案。

## web-view 方案步骤

1. 把 H5 部署到正式 HTTPS 域名，例如 `https://your-domain.com/today-worth/`。
2. 在小程序后台配置业务域名，并按后台要求上传校验文件。
3. 把 `miniprogram/app.js` 里的 `h5Url` 改为正式地址。
4. 把 `project.config.json` 里的 `appid` 从 `touristappid` 改成真实 AppID。
5. 用微信开发者工具导入仓库根目录。
6. 在开发者工具里预览，确认首页、计时、统计、成就、分享都能正常使用。
7. 点击上传代码，去小程序后台提交审核。

## 原生迁移方案

如果主体是个人号，或业务域名短期内配不下来，就不要卡在 `web-view` 上。直接把 H5 的功能迁到原生小程序：

1. 先迁首页计时、工资设置和本地存储。
2. 再迁统计、成就、战报弹窗。
3. 最后接入小程序分享、用户身份和好友关系。

原生迁移会多花时间，但审核链路更稳，也更适合后续做好友互加、战报分享和小程序内数据能力。

## 官方文档

- 微信 `web-view` 组件：https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html
- 微信项目配置文件：https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html
- 微信开发者工具下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
