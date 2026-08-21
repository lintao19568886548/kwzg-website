# 瞰维智管官网 Stage 2 实施计划

- 基线提交：`981d2c752c2746f849c20402a7b5e84592a521c2`
- 工作分支：`feature/stage-2-content-leads-admin`
- 技术栈：Nuxt 4、Vue 3、JavaScript、Nitro Node Server
- 部署目标：Linux + Docker；本阶段不部署、不推送、不修改 DNS
- 数据边界：官网独立 MariaDB/MySQL，不连接、不调用、不修改 `yizuw.cn`

## 1. 页面范围

- 七个公开页面：`/`、`/products`、`/solutions`、`/cases`、`/about`、`/demo`、`/privacy`。
- 管理页面：`/admin/login`、`/admin/leads`。
- 首页保留 Stage 1 结构，只补齐正式内页入口、联系方式与统一动效。
- 产品页仅展示溯源矩阵已经通过的六项：园区经营总览、招商客户、客户详情与跟进、合同管理、账单管理、报修工单。
- 客户案例仅使用获授权且无水印的本地园区图片；不展示经营数字、评价、上线时间或效果承诺。

## 2. API 范围

- `POST /api/demo-requests`：预约提交，严格 JSON、白名单字段、前后端校验、蜜罐、最短填写时间、限流和幂等。
- `GET /api/admin/csrf`：登录前同源 CSRF 令牌。
- `POST /api/admin/login`、`POST /api/admin/logout`、`GET /api/admin/session`：单管理员登录与服务端会话。
- `GET /api/admin/leads`、`GET /api/admin/leads/:id`：服务端分页、筛选和详情。
- `PATCH /api/admin/leads/:id`：状态与纯文本备注更新，使用事务、并发版本和审计记录。
- `GET /api/admin/leads/export`：导出当前筛选结果，限制行数并防止 CSV 公式注入。
- 所有管理 API 每次请求均在服务端鉴权，写操作和导出同时验证 CSRF 与同源。

## 3. 数据模型与迁移

- 采用 `mysql2` 驱动与 Knex Query Builder/版本化迁移，统一参数化查询，字符集 `utf8mb4`。
- `leads`：UUID 主键、规范化手机号、园区数量、固定状态、备注、隐私同意、幂等标识、时间戳和并发版本。
- `lead_audit`：只保存操作类型、状态变化、是否修改备注和时间，不重复保存手机号或备注正文。
- `admin_sessions`：只保存会话令牌摘要与 CSRF 摘要，包含活动、空闲、绝对过期和注销时间。
- `rate_limits`：保存不可逆请求指纹及计数窗口，不保存完整手机号或 IP。
- 迁移必须在全新空库和重复执行场景通过；应用数据库账号不得为 root。

## 4. 安全边界

- 管理员用户名、Argon2id 密码哈希、会话密钥和数据库连接只来自服务器环境变量，无默认密码。
- Cookie 为 `HttpOnly`、`SameSite=Lax`、`Path=/`，生产 HTTPS 才启用 `Secure`；令牌不进入 URL、LocalStorage 或日志。
- 登录失败统一提示，登录和预约限流均使用服务端密钥生成的 IP/账号或 IP/手机号摘要。
- 管理操作验证 CSRF 与 Origin/Referer，同源响应不开放通配凭证 CORS。
- 统一安全响应头；HSTS 仅在明确启用的真实 HTTPS 环境开启。
- 错误响应不泄露 SQL、堆栈、路径、连接串或凭证；日志不记录完整请求体、手机号、Cookie 或 Authorization。

## 5. A+B 动效系统

- 集中维护持续时间、缓动、位移、透明度和层级变量；复用 `IntersectionObserver` 滚动出现指令。
- 七个公开页面均有页面过渡、内容出现、交互反馈与路由专属动效；后台仅使用状态、筛选、抽屉和保存反馈。
- 使用 `transform` 与 `opacity`，不创造任何字段、按钮、状态、图表或业务流程。
- 完整支持 `prefers-reduced-motion`、移动端降级、页面隐藏暂停和 `?motion=off` 稳定验收模式。
- JavaScript 或动效失效时，正文、导航、表单和联系方式保持可见可用。

## 6. 测试与验收

- 单元/服务测试覆盖校验、手机号规范化、幂等、限流、认证、会话、CSRF、分页白名单、状态白名单、并发更新、XSS 文本、CSV 公式注入与日志脱敏。
- 使用本任务独立 Compose 项目 `kwzg_stage2_test` 对真实 MariaDB 执行空库迁移、重复迁移、事务回滚、索引约束和 `utf8mb4` 检查。
- 运行 lint、build、完整测试、Docker build、Compose config、依赖审计、敏感信息扫描和 `git diff --check`。
- 验证九个页面路由、未登录跳转、管理 API 401/403、`no-store`、1440/1024/768/390 无横向溢出、减少动态与关闭动效模式。

## 7. 回滚方式

- 本阶段仅创建一个本地功能提交，不推送。需要回滚时由维护者在确认无后续依赖后使用 Git revert 创建反向提交，不删除数据库或生产数据。
- 数据库迁移包含可审查的 `down` 操作，但真实环境回滚前必须先备份并人工确认；本阶段只在任务专属测试库验证。
- Docker 测试仅清理 `kwzg_stage2_test` 创建的容器和卷，不执行全局 prune，不影响其他项目。
