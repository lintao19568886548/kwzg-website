# 快鲸式清晰浏览体验排版基准

## 1. 审计范围与边界

本轮只参考 `https://www.kuaijing.cn/` 的字号层级、行高、内容宽度、留白与静止文字稳定性。没有复制参考站的代码、组件、图片、Logo、颜色、文案或品牌设计，官网继续使用瞰维智管的深蓝、朱砂红与暖白体系。

参考页与本地前后对比截图保存在 `private-reference/kuaijing-typography-qa/`。该目录由 `private-reference/` 规则统一忽略，不属于发布资源，也不进入 Git。

## 2. 快鲸页面实测指标

实测日期：2026-08-24。桌面视口为 1440 × 1000，设备像素比 1，页面缩放 100%。

| 项目 | 实测值 |
| --- | ---: |
| 页头高度 | 80px |
| 导航字号 | 18px |
| 首屏主标题 | 50px / 700 |
| 首屏正文 | 18px / 30px / 400 |
| 区块标题 | 38px / 700 |
| 区块说明 | 16px / 32px / 400 |
| 主内容宽度 | 1300px |
| 中文字距 | normal |
| 静止文字 transform | none |
| 静止文字 filter | none |
| 静止文字 opacity | 1 |

参考站当前页面计算样式中的中文字体为 `Microsoft YaHei`。本项目没有照搬参考站的字体声明，而是明确建立 Windows 优先、跨平台回退的中文字体栈。

值得借鉴的是大标题、舒展行高、较宽内容区、明确层级以及动画完成后文字回到普通渲染层。没有照搬过浅正文、小于 14px 的辅助文字、参考站品牌色、视觉素材及任何具体页面结构。

## 3. 瞰维智管最终字体规范

全站最终字体栈：

```css
"Microsoft YaHei UI",
"Microsoft YaHei",
"PingFang SC",
"Noto Sans CJK SC",
"Source Han Sans SC",
Arial,
sans-serif
```

Windows 字体注册表确认 `Microsoft YaHei UI` 与 `Microsoft YaHei` 的常规、粗体文件均存在；浏览器 `document.fonts.check()` 对两个字体及中文样本文字均返回 `true`。在当前 Windows 环境中，首选实际生效字体记录为 `Microsoft YaHei UI`。

| 使用位置 | 桌面端 | 移动端 | 字重 |
| --- | --- | --- | ---: |
| 全站正文 | 17px / 30px | 16px / 28px | 400 |
| 页头导航 | 16px / 24px | 16px / 24px | 400 / 当前项 700 |
| Logo 副宣传语 | 13px / 18px | 13px / 18px | 400 |
| 首页主标题 | 50px / 62px | 36px / 46px | 700 |
| 首页主说明 | 18px / 32px | 16px / 28px | 400 |
| 区块标题 | 38px / 50px | 30px / 40px | 700 |
| 区块说明 | 17px / 30px | 16px / 28px | 400 |
| 卡片标题 | 21px / 32px | 19px / 28px | 700 |
| 卡片正文 | 16px / 28px | 16px / 28px | 400 |
| 功能标签页 | 20px / 32px | 17px / 26px | 400 / 当前项 700 |
| 辅助文字 | 最低 14px / 22px | 最低 14px / 22px | 400 / 700 |
| 系统演示文字 | 最低 14px / 22px | 最低 14px / 22px | 400 |
| 系统关键数字 | 最低 20px / 30px | 最低 20px / 30px | 700 |

全站只在计算样式中使用 400 与 700 两档字重，禁用字体合成。中文使用整数像素字号、`letter-spacing: normal`、无文字阴影，正文采用不透明深蓝灰色。

## 4. 宽度与阅读节奏

- 桌面内容最大宽度为 1280px，左右安全边距 24px。
- 移动端左右边距为 20px。
- 桌面公共区块上下间距为 104px；移动端为 72px。
- 首页首屏正文和重点说明最大宽度为 620px。
- 普通区块说明最大宽度为 780px。
- 桌面页头总高度为 80px；移动页头总高度为 68px。
- 首页桌面首屏采用 600px 文案列与剩余系统预览列，标题保持两行，系统关键数字不截断。
- 系统预览采用 Vue/CSS 与安全演示数据，关键内容使用 2 × 2 指标布局，不对完整后台做 `transform: scale()` 缩放。

## 5. 动效清晰度规则

- 页面和区块入场完成后，文字自身及祖先的 `transform`、`filter` 均恢复为 `none`，`opacity` 恢复为 `1`，`will-change` 恢复为 `auto`。
- 文字卡片的悬停反馈只使用边框、背景和阴影，不整体移动或缩放文字层。
- 动态感继续由磁吸粒子、纹样网格、朱砂强调线、装饰伪元素、图标和背景承担。
- `?motion=off`、`prefers-reduced-motion: reduce` 下正文、导航、表单、系统演示与联系方式保持完整可用。
- 九个系统模块、演示数据、高清弹窗和品牌开场均保留；生产截图未进入公开资源。

## 6. 响应式与运行时验收

浏览器自动扫描覆盖 14 个公开路由，在 1440、1024、768、390 四种宽度共执行 56 组检查：

- 路由可渲染：56 / 56。
- 错误视口：0。
- 横向溢出：0。
- 非整数可见字号：0。
- 非正常中文字距：0。
- 辅助文字低于 14px：0（Logo 副宣传语按设计规范为 13px）。
- 系统演示最小字号：14px；系统关键数字最小字号：20px。
- 动画关闭且页面稳定后，静止文字自身 transform 失败：0。
- 静止文字祖先 transform 失败：0。
- filter、低透明度、zoom、`will-change: transform` 失败：0。
- 纯色内容区自动对比度检查失败：0；图片覆盖与渐变深色区同时通过截图复核。
- 本地字体请求：0；未引入字体文件、远程字体或字体 CDN。
- 页面继续保留 `noindex`。

Windows 当前显示 DPI 为 96（100%）。内置浏览器在 DPR 1、页面缩放 100% 下完成自动与截图验收。当前环境无法连接真实 Windows Chrome 与 Edge 浏览器实例，因此 Chrome 100%、Edge 100% 与 Windows 显示缩放 125% 仍标记为 `UNVERIFIED`，不能据此创建提交。

## 7. 验收截图

- `private-reference/kuaijing-typography-qa/reference-desktop.png`
- `private-reference/kuaijing-typography-qa/home-before-1440.png`
- `private-reference/kuaijing-typography-qa/home-after-1440.png`
- `private-reference/kuaijing-typography-qa/products-after-1440.png`
- `private-reference/kuaijing-typography-qa/cases-after-1440.png`
- `private-reference/kuaijing-typography-qa/home-after-1024.png`
- `private-reference/kuaijing-typography-qa/home-after-768.png`
- `private-reference/kuaijing-typography-qa/home-after-390.png`
- `private-reference/kuaijing-typography-qa/typography-before-after.png`
