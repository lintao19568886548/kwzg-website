# 瞰维智管官网 Stage 1.1 与 Stage 1 收口报告

- 验收日期：2026-08-21
- 项目目录：`D:\kwzg-websit`
- 起始提交：`26ec8133efa3031e770dc654e3e5a162c9c423ac`
- 系统审计方式：只读取 `private-reference/yizuw-ui/` 中的本地脱敏截图；本轮未访问 `yizuw.cn`
- 生产写操作：0
- 最终结论：**PASS**

## 1. Stage 1.1 系统界面溯源

- 实际核对脱敏截图：10 张。
- 可辨识功能菜单：32 项（不计分组标题）。
- 实际核对页面：8 个。
- 已验证公开界面：园区经营总览、招商客户、客户详情、合同管理、账单管理、报修工单。
- 内部待补证：待租厂房/可租房源列表、独立员工移动工作台。
- 公开 `UNVERIFIED` 页面：0。
- 公开无证据页面：0。
- `docs/system-ui-source-matrix.md` 总结论：PASS。

已删除或修正的无证据内容：

- 删除待租厂房/可租房源列表、房态矩阵、楼栋房间行、发布状态与相关按钮。
- 删除独立员工移动工作台、手机设备模型、员工任务入口和已上线表述。
- 删除经营总览中的虚构趋势图、空置厂房数量、本周招商新增和具体园区任务名称。
- 将招商客户看板改为真实列表页结构，删除企业名称、面积需求卡片和虚构跟进提示。
- 将合同与账单拆成两个独立页面面板，不再合并为单一财务流程。
- 将“设备巡检”修正为有截图证据的“报修工单”，删除虚构巡检记录、执行人员和计划时间。
- AI 招商匹配保留在独立规划区并标注“规划中”，未进入真实系统界面组。

所有公开系统界面均由 Vue、JavaScript 和 CSS 使用演示数据重构；本地脱敏截图未复制到 `public/`、`assets/` 或构建发布目录。

## 2. 品牌与联系信息

- 品牌：瞰维智管。
- 法定主体：东莞市宜租网络科技有限公司。
- 电话：`18028231766`，拨号链接为 `tel:18028231766`。
- 地址：广东省东莞市高埗镇北王路高埗段5号。
- 官网：`https://yizuw.org`。
- 系统登录：`https://yizuw.cn`，仅作为静态链接；验收未点击、未请求。
- 联系信息集中维护于 `app/config/site.js`，已应用于页脚、关于我们、预约演示、首页 CTA 和移动端菜单。
- 页头仅使用图形＋“瞰维智管”的紧凑横版，不显示宣传语。
- 页脚与关于区域使用完整宣传语版：“给园区管理装上大脑和翅膀，少操心，赚更多。”
- 公开 Logo 横版、深色反白版、带宣传语版、图形版和 PNG/ICO favicon 均来自原位图的透明派生；棋盘格伪透明背景已清理，原几何与字形未重绘。
- 页面中不存在“待上线前确认”联系方式占位。

## 3. 企业微信二维码

- 原始交接文件：`incoming/kwzg-wecom-qr-original.png`，496×391；`incoming/` 已被 Git 忽略。
- 非公开原图副本：`assets/raw/wecom-qrcode/kwzg-wecom-qr-original.png`。
- 公开派生文件：`public/assets/wecom-qrcode/kwzg-wecom-qr.png`，207×207 PNG。
- 处理方式：只裁切外部说明区域；未缩放、未重绘、未改色、未拉伸，完整保留二维码及静区。
- 本地识别：原图 PASS、裁切版 PASS、128×128 页面显示尺寸 PASS；三者识别内容一致。
- 页面文字：瞰维智管官方客服。
- 认证说明：企业微信认证主体：宜租网络。

`QR_CODE=PASS`

## 4. 园区案例素材

- 新塘西州交接图：`incoming/case-xintang-xizhou-replacement.png`，800×533；只读取和复制，未移动、未覆盖交接文件。
- 新塘西州公开派生图：`public/assets/cases/xintang-xizhou-01.webp`，800×500 WebP，EXIF 条目为 0。
- 官网园区名称为“新塘西州”，仅引用上述新派生路径；未引用旧第 9 张 raw 路径。
- 佛山九江带 `ndocn.com` 水印的原图未进入公开目录，官网继续显示“图片待更新”。
- 其余公开园区图：同富 3 张、佛山乐从 3 张、深圳坑梓 1 张、高埗同兴 1 张。
- 公开内容不展示出租率、租金、欠费、收入或租户经营数据。

`CASE_ASSETS=PASS`

## 5. 隐私与发布目录

| 检查项 | 结果 |
| --- | --- |
| 发布目录中的生产系统截图 | 0 |
| 10 张本地脱敏截图与公开媒体哈希重合 | 0 |
| Git 跟踪的 `private-reference/` 文件 | 0 |
| Git 跟踪的 `incoming/` 文件 | 0 |
| 公开无证据系统界面 | 0 |
| TypeScript 源文件 | 0 |
| 生产 API 请求代码 | 0 |
| 远程图片引用 | 0 |
| Cookie、Token、LocalStorage 或凭据读写 | 0 |
| 真实客户经营数据 | 0 |
| 预约表单外部请求 | 0 |
| `noindex, nofollow` | PASS |

`private-reference/` 与 `incoming/` 均由 `.gitignore` 忽略；截图、采集清单、交接文件和本地验收工具均未被 Git 跟踪。

## 6. 质量、路由与响应式验收

| 检查项 | 结果 |
| --- | --- |
| `npm run lint` | PASS |
| `npm run build` | PASS；7 个页面及 payload 全部预渲染 |
| `git diff --check` | PASS |
| `/` | HTTP 200 |
| `/products` | HTTP 200 |
| `/solutions` | HTTP 200 |
| `/cases` | HTTP 200 |
| `/about` | HTTP 200 |
| `/demo` | HTTP 200 |
| `/privacy` | HTTP 200 |

本地构建产物只监听 `127.0.0.1`。使用独立无头 Chrome 临时配置精确设置 1440、1024、768、390 四档视口并逐张复查：

- 四档 `window.innerWidth`、`documentElement.clientWidth` 与页面 `scrollWidth` 一致，页面横向溢出均为 0。
- 1440、1024 显示桌面导航；768、390 显示移动菜单按钮。
- 390 下移动菜单能够打开，`aria-expanded=true`，电话入口为 `tel:18028231766`。
- 宽表的超宽内容只存在于组件内部横向滚动容器，不扩大页面宽度。
- 空表单显示姓名、手机号、园区数量、隐私同意四项错误；有效演示输入进入本地成功态。
- 表单验收期间外部资源来源为 0，源码无网络提交逻辑。

`ROUTES=PASS`，`RESPONSIVE=PASS`。

## 7. 提交门禁

| 门禁 | 结果 |
| --- | --- |
| `SYSTEM_UI_SOURCE_MATRIX` | PASS |
| `UNVERIFIED_PUBLIC_UI` | 0 |
| `UNSUPPORTED_PUBLIC_UI` | 0 |
| `PUBLIC_PRODUCTION_SCREENSHOTS` | 0 |
| `TRACKED_PRIVATE_FILES` | 0 |
| `CONTACT_INFORMATION` | PASS |
| `QR_CODE` | PASS |
| `LOGO_USAGE` | PASS |
| `LINT` | PASS |
| `BUILD` | PASS |
| `ROUTES` | PASS |
| `RESPONSIVE` | PASS |
| `PRODUCTION_WRITE_ACTIONS` | 0 |

全部提交门禁已满足。本报告与 Stage 1 成果一并纳入唯一的约定本地提交；不推送、不部署、不修改 DNS。

`STAGE_1=PASS`
