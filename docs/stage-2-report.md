# 瞰维智管官网 Stage 2 验收报告

- 验收日期：2026-08-21
- 基线提交：`981d2c752c2746f849c20402a7b5e84592a521c2`
- 工作分支：`feature/stage-2-content-leads-admin`
- 技术栈：Nuxt 4.5.2、Vue 3、JavaScript、Nitro Node Server
- 数据库：Knex 3 + mysql2 + MariaDB 11.4.5；官网独立数据库
- 发布状态：仅本地构建和隔离容器验收，未推送、未部署、未修改 DNS

## 1. 页面与内容

- 七个公开主路由 `/`、`/products`、`/solutions`、`/cases`、`/about`、`/demo`、`/privacy` 与五个案例详情路由均返回 HTTP 200；无效案例 slug 返回 404。
- `/admin/login` 返回 HTTP 200；未登录访问 `/admin/leads` 跳转登录，未登录管理 API 返回 401。
- 产品展示仅包含溯源矩阵通过的园区经营总览、招商客户、客户详情、合同管理、账单管理和报修工单。
- 待租厂房、房态矩阵、独立员工移动工作台和虚构设备巡检未进入公开内容。
- 产品方已确认 AI 招商匹配为现有能力；官网在独立区域标注“现有能力”，但在缺少独立页面截图证据时不展示具体字段、按钮、匹配结果或可操作界面。
- 案例列表与独立详情页只公开同富、佛山乐从、深圳坑梓、新塘西州和高埗同兴五个园区；新塘西州使用 replacement，佛山九江与旧第九张均未进入发布目录或相关推荐。
- 联系信息、Logo、企业微信二维码和 `noindex, nofollow` 保持 Stage 1 已验收状态。

## 2. 预约与后台

- `POST /api/demo-requests` 只接收姓名、手机号、园区数量与隐私同意，并在独立数据库成功写入后返回成功。
- 实现 JSON 与请求体限制、字段白名单、规范化、蜜罐、最短填写时间、IP + 手机号摘要限流、幂等键和并发重复抑制。
- 单管理员凭证仅从服务器环境变量读取；密码采用 Argon2id 哈希，会话原始令牌不进入数据库。
- 后台支持服务端分页、搜索、状态与日期筛选、白名单排序、详情、状态、纯文本备注和安全 CSV 导出。
- 更新使用事务、并发版本和审计记录；没有删除、批量修改、员工分配或通知功能。
- 管理 API 每次服务端鉴权；登录、退出、更新与导出验证同源和 CSRF；后台响应禁止缓存。

## 3. 数据与部署边界

- 版本化迁移共 1 个，建立 `leads`、`lead_audit`、`admin_sessions`、`rate_limits` 与必要索引、枚举、唯一键和外键。
- 在全新 MariaDB 11.4.5 空库完成迁移、重复迁移、事务回滚、迁移回滚重放、`utf8mb4` 与非 root 账号检查。
- Docker 使用固定 Node 22.22.2 与 MariaDB 11.4.5 镜像；应用以非 root 用户运行。
- MariaDB 不发布 3306；数据库仅接入内部网络，应用同时接入内部网络和用于本机端口映射的应用网络。
- 本地 Compose 项目固定为 `kwzg_stage2_test`；本轮为复核真实 Node Server 与数据库闭环，应用和数据库容器保留为健康状态，应用仅绑定 `127.0.0.1:3212`，数据库卷未删除，未执行全局 prune。隔离集成测试另用 `kwzg_stage2_isolated`，完成后只清理该临时项目。
- 官网源码没有连接或调用 `yizuw.cn` API；产品界面溯源仍以已审计的 `yizuw.cn` 为依据，“登录系统”链接按最新确认统一指向 `https://yz.furong.org`，本地验收未访问该外部地址。

## 4. 测试结果

| 门禁 | 结果 |
| --- | --- |
| ESLint | PASS |
| Nuxt 生产构建 | PASS；七个公开主路由与五个案例详情页预渲染成功 |
| JavaScript 测试 | PASS；本机无数据库运行 84 项通过、9 个数据库项按条件跳过；隔离 MariaDB 环境完整运行 12 个测试文件、92/92 项通过，包含数据库初始审计失败回滚与可信代理来源测试 |
| API E2E | PASS；12 个公开路由客服栏、后台隐藏、认证授权、表单、幂等、限流、CSRF、同源、并发、XSS 与 CSV 均通过 |
| Docker build | PASS |
| Docker Compose config | PASS |
| 依赖审计 | PASS；`npm audit --audit-level=high` 为 0 vulnerabilities |
| 敏感信息扫描 | PASS；扫描 153 个项目文件 |
| Git 私有目录检查 | PASS；`private-reference/` 与 `incoming/` 被忽略且跟踪文件为 0 |
| Git diff | PASS；`git diff --check` 无错误 |

API 与数据库测试覆盖正常与非法提交、超长和多余字段、隐私、蜜罐、过快提交、重复与并发、请求体超限、429、数据库事务、错误账号和密码、暴力尝试、伪造/轮换/过期/注销会话、CSRF 缺失或错误、跨域、分页和排序上限、SQL 注入输入、XSS 备注、非法状态、并发冲突、未登录导出与 CSV 公式注入。

## 5. 响应式、动效与无障碍

- 1440、1024、768、390 四档检查完成，七个公开主页面、五个案例详情页和后台无横向溢出。
- 移动菜单、案例画廊、预约表单、后台登录、线索列表与详情抽屉可用。
- 画廊支持键盘方向键、ESC、打开后聚焦和关闭后恢复焦点。
- 七个公开页面均具有统一进入、滚动、交互与专属动效；后台具有克制的状态反馈。
- `prefers-reduced-motion` 与 `?motion=off` 均关闭非必要运动，关闭后隐藏内容数量为 0。
- 未引入重型动画依赖；持续动画在不可见、移动降级或标签隐藏时暂停。
- 浏览器控制台错误为 0，Hydration 错误为 0，横向溢出为 0。

## 6. 客户案例专项验收

- `/cases` 使用统一数据源、本地地区筛选和五张整卡可点击案例卡片；东莞、佛山、深圳、广州筛选结果正确。
- 五个 `/cases/[slug]` 页面具有独立 SEO、canonical、唯一 H1、面包屑、授权实景主视觉、差异化正文、相关功能展示、定性管理价值、键盘画廊、上下案例导航与预约入口。
- 五个详情正文均为 350～600 个中文字符；客户证言、未核实经营指标、百分比成果、上线时间、项目周期和 ROI 数量均为 0。
- 系统展示只复用溯源矩阵已通过的六类真实页面；生产截图与真实客户数据数量均为 0。
- 分类切换、卡片错峰、详情分层进入、阅读进度、桌面轻视差、界面标签切换和画廊过渡已纳入统一动效；移动端、减少动态与 `?motion=off` 正常降级。
- Headless Chrome 直接访问五个详情页均正常，筛选、详情链接、上下导航、画廊焦点与 ESC 恢复、404、四档响应式通过，浏览器错误为 0。

## 7. 全站右侧悬浮客服栏专项验收

- 组件位于 `app/components/FloatingContactBar.vue` 与 `app/components/ContactPopover.vue`，样式集中在 `app/assets/css/floating-contact.css`，只在 `app/layouts/default.vue` 挂载一次。
- 公开显示路由为 `/`、`/products`、`/solutions`、`/cases`、五个 `/cases/[slug]`、`/about`、`/demo`、`/privacy`，共 12/12；`/admin/login`、`/admin/leads` 及所有 `/admin` 前缀默认不渲染，打印样式隐藏。
- 企业微信二维码继续使用 `/assets/wecom-qrcode/kwzg-wecom-qr.png`；电话二维码位于 `/assets/contact/kwzg-phone-call-qr.png`，离线生成尺寸 512×512。微信对直接 `tel:` 二维码兼容不稳定，因此采用 `PHONE_QR_MODE=HTTPS_CALL_LANDING_PAGE`，当前编码内容严格为 `https://yizuw.org/call`，不含查询、追踪参数或第三方跳转。
- 本地 `jsQR` 识别结果：企业微信原图 PASS；电话原图、页面实际 168px、160px 与 128px 均 PASS；电话 PNG 不含 EXIF、文本或其他无关元数据块。
- 桌面支持悬停和点击，面板互斥、150ms 移动容错、再次点击、页面空白、Esc 与路由切换关闭；电话数字同时保留 `tel:18028231766` 备用链接。
- 移动联系客服使用对话框、遮罩、背景滚动锁定、焦点循环与关闭后焦点回归；移动电话入口为真实 `tel:` 链接，不要求扫描本机屏幕，不自动拨号。
- 返回顶部阈值为 520px，进度环读取真实滚动比例；监听为 passive 并通过 `requestAnimationFrame` 节流。正常模式平滑返回，减少动态与关闭动效模式即时返回。
- 1440、1024、768、390 共 48 个公开路由视图均显示 1 个客服栏，无横向溢出、主要 CTA 重叠或越出视口；移动弹窗、二维码与安全区完整，浏览器错误与 Hydration 错误均为 0。
- 键盘 Tab、Enter/Space、Esc、`aria-expanded`、`aria-controls`、对话框语义、焦点回归和不少于 44px 的触摸目标均通过组件与浏览器测试。
- 悬浮栏数据库写入、Cookie、LocalStorage、远程二维码服务、第三方客服服务、外部行为日志和生产系统请求均为 0；本轮未访问 `yizuw.cn`。

### 7.1 微信兼容拨号中转页

- 微信扫码出现“网络出错，无法显示该页面”的根因不是二维码损坏，而是二维码已正确指向正式官网 `/call`，当前阶段按要求未部署 `yizuw.org`，公开 HTTPS 页面尚不可达。
- `/call` 使用无全站导航、页脚和悬浮客服栏的极轻量独立页面；服务端 HTML 直接包含紧凑 Logo、电话、真实 `tel:` 备用按钮、返回官网入口和拨号确认说明，GET、刷新、预渲染与 Node Server 路由均纳入本地验收。
- 页面只在 `MicroMessenger`、Android、iPhone、iPad 或其他 Mobile User-Agent 上进行一次客户端渐进增强式 `tel:` 尝试；桌面端不自动唤起。代码不循环、不调用 API、不写 Cookie、LocalStorage 或数据库，也不判断或宣称拨号成功。
- “立即拨打”真实链接始终可见；自动尝试后只提示“如未自动唤起，请点击‘立即拨打’”。移动端官网悬浮电话入口仍直接使用 `tel:18028231766`，桌面端二维码才使用 `https://yizuw.org/call`。
- `/call` 永久设置 HTML `noindex, nofollow` 及 `X-Robots-Tag`，不受官网未来是否开放索引影响；标题为“电话咨询｜瞰维智管”，描述为“拨打瞰维智管电话18028231766，咨询园区管理数字化解决方案。”。
- 桌面二维码弹窗使用“微信扫码拨打电话”和准确的手机确认说明；本地预览提示只在开发模式渲染，生产构建 DOM 不包含该提示。
- 本地完成二维码原图、160px、128px 解码，`/call` HTTP 200、四档响应式、桌面与三类移动 UA 代码路径、一次拨号上限、永久兜底、减少动态、键盘、控制台、Hydration、外部请求与数据库写入检查。模拟 UA 只证明代码路径，不代表微信真机通过。

上线后验收清单（本 Stage 2 不执行）：

1. `https://yizuw.org/` 与 `https://yizuw.org/call` 返回 200，HTTPS 证书有效且无重定向循环。
2. 页面不跳转或请求 `yizuw.cn`，电话始终为 `18028231766`。
3. 分别使用 iPhone 微信、Android 微信、iPhone 系统相机和 Android 系统相机扫码。
4. 核对系统拨号确认；自动唤起被拦截时，点击“立即拨打”仍可进入拨号确认。
5. 只有完成部署与真机检查后，才可将下列三个 `DEFERRED_NOT_DEPLOYED` 改为 `PASS`。

## 8. 科技型中小企业资质专项验收

- 原始 JPEG 由用户提供并授权展示，路径为 `incoming/tech-sme-2026-original.jpg`，尺寸 4000×2992，SHA-256 为 `3B1357A25AF602F07B3A9CBF50BD35C4D2BB55119C58E4B4A80ADFF2497A787B`；相同哈希副本归档于 `assets/raw/certifications/tech-sme-2026-original.jpg`。
- 原图逐字核对结果与确认事实一致：科技型中小企业、东莞市宜租网络科技有限公司、`2026441901A0001155`、广东省科学技术厅、2026年8月11日，差异数量为 0。
- 公开封面 `public/assets/certifications/tech-sme-2026-cover.webp` 为 1500×1000，完成牌匾区域裁切、透视校正与轻度亮度/饱和度/对比度/锐度调整；公开详情图 `public/assets/certifications/tech-sme-2026-detail.webp` 为 1800×1890，保留牌匾和证书关系并裁去部分环境。
- 两张 WebP 均由本地 Sharp 脚本生成，不调用图片处理服务，不使用生成式 AI、扩图、文字重绘或徽标修改；EXIF、GPS、ICC、IPTC 与 XMP 元数据均不存在。
- 资质事实统一维护在 `app/config/site.js`；首页在最终预约 CTA 之前使用 `compact` 模式，关于页在公司介绍之后、联系方式之前使用 `detail` 模式。
- 资质大图弹窗支持真实按钮、遮罩、关闭按钮、Esc、Tab 焦点约束、焦点回归、背景滚动锁定、背景 `aria-hidden`/`inert`、路由切换关闭，层级高于悬浮客服栏。
- 图片使用明确宽高、懒加载、异步解码与 `object-fit: contain`；移动端关于页改用封面派生图，详情图只在大图弹窗打开后加载。
- 1440、1024、768、390 四档首页与关于页均无横向溢出，编号不撑破卡片，图片和弹窗不超出视口，关闭按钮可见，悬浮客服栏与资质按钮重叠数量为 0。
- 资质相关误导宣传、虚构认证、虚构奖项、图片文字变更、公开 raw 引用、远程资质图片和生产系统请求均为 0；本轮未访问 `yizuw.cn`。

## 9. 顶部首页导航专项验收

- 桌面页头、移动菜单、首页入口、页脚与关于页的“登录系统”统一读取 `siteConfig.systemUrl`，当前目标为 `https://yz.furong.org`；链接继续使用新窗口及 `noopener noreferrer nofollow`，测试只检查静态目标、不访问外部站点。
- 全局 `SiteHeader.vue` 的单一导航数组同时服务桌面与移动端，最终顺序为：首页 `/`、产品能力 `/products`、解决方案 `/solutions`、客户案例 `/cases`、关于我们 `/about`；右侧登录系统与预约演示行为、安全属性和样式保持不变。
- 首页使用 Nuxt 内部路由且只在 `route.path === '/'` 时激活；产品、解决方案和关于页使用对应路由激活；`/cases` 与五个案例详情子路由只激活“客户案例”；`/demo` 与 `/privacy` 不错误激活主栏目。
- 桌面与移动端当前链接均设置 `aria-current="page"`，激活项同时使用深蓝加粗文字与砖红下划线/侧边线；减少动态与 `?motion=off` 直接显示最终状态。
- 从产品、解决方案、案例列表、五个案例详情、关于、预约和隐私共 11 个页面点击首页，均通过客户端路由返回 `/`、回到顶部且没有整页刷新；首页再次点击在正常模式平滑回顶、减少动态时立即回顶。
- 页头完整紧凑 Logo 使用 `<NuxtLink to="/">`，可点击区域覆盖图标和品牌名，`aria-label` 为“瞰维智管官网首页”；案例详情面包屑的首页与客户案例均为 Nuxt 内部链接，当前案例使用 `aria-current="page"`。
- 移动菜单首页位于第一项，点击后立即关闭；菜单支持 Esc 关闭并恢复按钮焦点、点击页头外关闭，菜单按钮 `aria-expanded` 状态正确。
- Headless Chrome 在 1440、1024、768、390 四档实测：桌面导航不换行，移动断点正确，Logo 不变形，登录/预约不重叠，页面横向溢出为 0；浏览器错误和 Hydration 错误均为 0。
- 导航测试共 17 项，覆盖顺序、严格激活、五个案例子路由、同页回顶、移动关闭、焦点、Logo 和面包屑；未访问 `yizuw.cn`，生产请求和写操作均为 0。

## 10. 预约演示数据库紧急修复验收

- 修复前按当时实际本地运行方式复现：`POST /api/demo-requests` 返回 HTTP 503，稳定错误码为 `DATABASE_UNAVAILABLE`，带安全请求 ID；响应耗时 104ms。根因是本地 Node 运行环境没有配置或启动官网独立 MariaDB 连接，并非前端字段校验或静态站点伪成功。
- 修复保持 Nuxt Node Server + 官网独立 MariaDB 架构，没有改用 LocalStorage、SessionStorage、JSON 文件、内存或生产系统；本地 `.env` 被 Git 忽略，只保存本地随机凭据，`.env.example` 只含占位符。
- 接口增加公开表单同源校验、可信代理白名单、稳定数据库错误分类、成功请求 ID、错误响应禁缓存和稳定错误码日志；前端分别处理字段、429、503、网络、重复和未知错误，数据库事务完成后才显示“预约提交成功”。
- 正常本地验收数据写入结果：HTTP 201、线索 1、初始 `created` 审计 1、初始状态“待跟进”；相同幂等键重试返回 200，快速双击最终记录数为 1。
- 人工停止本地独立数据库后，接口返回 HTTP 503 与 `DATABASE_UNAVAILABLE`，虚假成功为 0；恢复并通过健康检查后，同一验收请求返回 201，线索和初始审计仍各为 1，无半写入。
- 迁移在现有库重复执行两次均应用 0 个新文件；独立空库完成首次迁移、重复迁移、索引/外键/枚举、非 root 账号、`utf8mb4`、事务失败回滚和迁移回滚重放。
- 官网后台完成本地登录、搜索、状态筛选、日期筛选、列表手机号脱敏、详情与初始状态核对；完整测试手机号在应用容器日志中的出现次数为 0，稳定数据库错误码可关联请求日志。
- 无头 Chrome 在 1440、1024、768、390 四档验证预约表单、字段错误、真实请求期间的“提交中…”禁用状态、数据库成功后的成功态与减少动态效果；横向溢出、Hydration 错误和控制台错误均为 0。
- 修改范围：`.env.example`、`app/pages/demo.vue`、`app/utils/demo-form.js`、`docker-compose.yml`、`nuxt.config.js`、`server/api/demo-requests.js`、`server/middleware/request-log.js`、`server/utils/business-error.js`、`server/utils/database.js`、`server/utils/security.js` 及对应 API、单元和数据库集成测试。
- 全程仅访问本机 `127.0.0.1` 与本地 Docker 网络；企业微信、短信、邮件通知均为 0，`yizuw.cn` 请求和生产写操作均为 0。

## 11. 最终门禁

```text
STAGE_2_CONTENT=PASS
SYSTEM_UI_SOURCE_MATRIX=PASS
DB_ISOLATION=PASS
MIGRATION_TEST=PASS
PUBLIC_FORM_API=PASS
DEMO_FORM_DATABASE_CLOSURE=PASS
DATABASE_DOWN_STATUS=503
DATABASE_RECOVERY=PASS
PARTIAL_WRITES=0
FULL_PHONE_LOG_OCCURRENCES=0
IDEMPOTENCY=PASS
RATE_LIMIT=PASS
SERVER_VALIDATION=PASS
ADMIN_AUTH=PASS
ADMIN_API_AUTHORIZATION=PASS
SESSION_SECURITY=PASS
CSRF=PASS
SQL_INJECTION_TEST=PASS
XSS_TEST=PASS
CSV_FORMULA_INJECTION_TEST=PASS
LOG_REDACTION=PASS
SECRETS_SCAN=PASS
DOCKER_BUILD=PASS
DOCKER_COMPOSE_CONFIG=PASS
LINT=PASS
BUILD=PASS
TESTS=PASS
ROUTES=PASS
RESPONSIVE=PASS
HEADER_HOME_NAV=PASS
HEADER_NAV_ORDER=首页,产品能力,解决方案,客户案例,关于我们
HOME_NAV_TARGET=/
HOME_NAV_INTERNAL_ROUTING=PASS
HOME_NAV_DESKTOP=PASS
HOME_NAV_MOBILE=PASS
HOME_NAV_EXACT_ACTIVE=PASS
HOME_ACTIVE_ON_NON_HOME_ROUTES=0
MULTIPLE_ACTIVE_NAV_ITEMS=0
LOGO_HOME_LINK=PASS
BREADCRUMB_HOME_LINK=PASS
CASE_DETAIL_NAV_ACTIVE=PASS
MOBILE_MENU_CLOSE_AFTER_HOME=PASS
ARIA_CURRENT=PASS
FLOATING_CONTACT_BAR=PASS
QUALIFICATION_SECTION=PASS
QUALIFICATION_SOURCE_IMAGE=PASS
QUALIFICATION_CONTENT_ACCURACY=PASS
QUALIFICATION_LIGHTBOX=PASS
MISLEADING_QUALIFICATION_CLAIMS=0
FABRICATED_CERTIFICATIONS=0
FABRICATED_AWARDS=0
IMAGE_TEXT_MUTATIONS=0
PUBLIC_RAW_IMAGE_REFERENCES=0
REMOTE_QUALIFICATION_IMAGES=0
PUBLIC_ROUTES_WITH_CONTACT_BAR=12/12
ADMIN_ROUTES_WITH_CONTACT_BAR=0
WECOM_CONTACT=PASS
WECOM_QR_ORIGINAL=PASS
PHONE_CONTACT=PASS
PHONE_QR_MODE=HTTPS_CALL_LANDING_PAGE
PHONE_QR_ORIGINAL=PASS
PHONE_QR_160PX=PASS
PHONE_QR_128PX=PASS
PHONE_QR_CONTENT=https://yizuw.org/call
CALL_PAGE_ROUTE=/call
CALL_PAGE_LOCAL_HTTP=200
CALL_PAGE_LOCAL=PASS
CALL_PAGE_PRERENDER_OR_SERVER_ROUTE=PASS
CALL_PAGE_PHONE=18028231766
CALL_PAGE_PHONE_HREF=tel:18028231766
AUTO_DIAL_ATTEMPT=PASS
AUTO_DIAL_MAX_ATTEMPTS=1
FALLBACK_CALL_BUTTON=PASS
MOBILE_PHONE_HREF=tel:18028231766
MOBILE_DIRECT_CALL=PASS
DESKTOP_QR_POPUP=PASS
DEVELOPMENT_SCAN_NOTICE=PASS
DATABASE_WRITES_FROM_CALL_PAGE=0
EXTERNAL_CALL_SERVICES=0
PUBLIC_CALL_PAGE=DEFERRED_NOT_DEPLOYED
WECHAT_IOS_SCAN=DEFERRED_NOT_DEPLOYED
WECHAT_ANDROID_SCAN=DEFERRED_NOT_DEPLOYED
BACK_TO_TOP=PASS
SCROLL_PROGRESS=PASS
KEYBOARD_ACCESS=PASS
FOCUS_MANAGEMENT=PASS
SSR_SAFE=PASS
CONSOLE_ERRORS=0
EXTERNAL_QR_SERVICES=0
EXTERNAL_CONTACT_SERVICES=0
DATABASE_WRITES_FROM_CONTACT_BAR=0
CASE_LIST_PAGE=PASS
CASE_DETAIL_PAGES=5/5
CASE_FILTERS=PASS
CASE_NAVIGATION=PASS
CASE_MOTION=PASS
CASE_CONTENT_SAFETY=PASS
UNVERIFIED_CUSTOMER_METRICS=0
FABRICATED_CUSTOMER_TESTIMONIALS=0
PUBLIC_WATERMARKED_IMAGES=0
MOTION_SYSTEM=PASS
PUBLIC_ROUTES_WITH_MOTION=7/7
ADMIN_MOTION=PASS
REDUCED_MOTION=PASS
MOBILE_MOTION_FALLBACK=PASS
ANIMATION_PERFORMANCE=PASS
HYDRATION_ERRORS=0
HORIZONTAL_OVERFLOW=0
FABRICATED_SYSTEM_UI=0
PUBLIC_PRODUCTION_SCREENSHOTS=0
UNVERIFIED_PUBLIC_UI=0
PRODUCTION_CONNECTIONS=0
PRODUCTION_WRITE_ACTIONS=0
```

Stage 2 满足本地功能提交门禁。提交哈希由本报告所在的最终本地提交生成，并在任务交付报告中记录。
