# 生产部署手册

目标站点为 `https://yizuw.org`。本手册是部署阶段操作清单，不代表本地审计已经连接服务器、修改 DNS、申请证书或部署。

## 部署前

1. 记录待部署 Git 提交和不可变镜像标签，确认不使用 `latest`。
2. 按《数据库备份与恢复》对官网独立数据库执行一致性备份，并验证备份可读。
3. 逐项完成《生产环境变量清单》，通过受限环境文件注入真实值。
4. 确认 DNS、根域名和 www 证书均由用户在部署窗口明确授权后处理。
5. 将 `deploy/nginx/yizuw.org.conf.example` 复制为部署主机上的实际配置文件；私钥和证书不进入仓库。
6. 本地或 CI 运行 `npm run lint`、`npm run test`、`npm run build`、`npm run security:scan` 和 `git diff --check`。
7. 在 GitHub Linux Runner 以指定提交构建 `kwzg-website:<不可变标签>`，显式传入 `NUXT_PUBLIC_SITE_URL=https://yizuw.org`、`NUXT_PUBLIC_INDEXABLE=false`、`NUXT_ENABLE_HSTS=false` 三个构建参数，并检查镜像用户不是 root。构建参数必须与运行时变量一致。
8. 构建机同时拉取固定版本 `mariadb:11.4.5`，使用 `docker save | gzip` 打包应用与数据库镜像，校验 SHA-256 后通过 SSH 管道传输到服务器执行 `docker load`；生产服务器不得直连 Docker Hub 或 GHCR。
9. 官网只使用仓库专用 SSH 密钥；不得复用个人密钥或其他客户系统的 CI 密钥。

## 发布顺序

1. 启动 MariaDB，并确认只位于 Compose 内部网络、未发布 3306。
2. 只运行一个 `migrate` 服务。迁移脚本还会获取数据库 advisory lock，失败时停止发布，不启动应用副本。
3. 确认迁移完成后启动应用；应用启动不会自动执行迁移。
4. 应用健康后，将官网应用确认绑定在 `127.0.0.1:9000`，数据库不得发布 3306。
5. 只安装 `/etc/nginx/conf.d/yizuw-org.conf`，执行 `nginx -t && systemctl reload nginx`；测试或 reload 失败时立即恢复官网旧配置。禁止 restart，禁止修改其他站点文件。
6. 验证 HTTP 根域名、HTTP www 和 HTTPS www 均 301 到 `https://yizuw.org`，无重定向循环。
7. 验证 TLS 1.2/1.3、证书链、根域名与 www 覆盖，以及自动续期定时任务。

## 冒烟验收

1. 检查 13 个公开路由、无效案例 404、`/admin/login` 和未登录 `/admin/leads` 权限边界。
2. 检查 `/api/health`、静态资源、Logo、案例图、资质图和两个二维码。
3. 用专门的上线验收线索提交一次预约，确认 201、后台可见、重复提交不重复入库；完成后按运营流程标记或删除该测试数据。
4. 登录后台，检查列表脱敏、详情、状态与备注、CSV 权限和退出后会话失效。
5. 检查 `/call` 的电话、备用按钮和 noindex；再由用户用微信 iOS/Android 真机验证二维码跳转与系统拨号确认页。
6. 检查 CSP、nosniff、Referrer-Policy、Permissions-Policy、frame-ancestors、后台/API no-store。
7. 检查浏览器控制台、hydration、四档响应式、键盘焦点、减少动态效果和横向溢出。

## SEO 开放顺序

首次发布保持 `NUXT_PUBLIC_INDEXABLE=false`。只有部署验收通过且用户明确确认后：

1. 使用 `NUXT_PUBLIC_INDEXABLE=true` 构建新的不可变镜像，同时保持正式 site URL；更新镜像标签并重新创建应用容器。不能只修改运行时环境变量，因为预渲染页面的 meta 已在构建阶段固化。
2. 确认公开营销页面允许索引，`/admin/*`、API 和 `/call` 仍不进入 sitemap，后台和 `/call` 仍 noindex。
3. 检查 `robots.txt` 引用 `https://yizuw.org/sitemap.xml`，sitemap 只包含 12 个公开营销路由。
4. 再次检查每页标题、描述、canonical 和案例分享图。

## HSTS 与观察

- HTTPS 和自动续期稳定前，构建参数与运行时变量都保持 `NUXT_ENABLE_HSTS=false`，Nginx HSTS 行也保持注释。
- 稳定后使用 `NUXT_ENABLE_HSTS=true` 重新构建不可变镜像并开启一年期 HSTS；不直接启用 preload。
- 发布后观察健康检查、5xx、数据库连接、登录限流和迁移状态。日志不得包含请求正文、完整手机号、Cookie、Token、密码或数据库 URL。
- 验收全部完成后记录发布人、时间、提交、镜像标签、迁移批次和回滚点。

## 线索查询、更正与删除

用户通过官网公开电话或企业微信提出请求后，由授权管理员核验请求人与线索的关联，记录请求时间、范围和处理依据。更正应保留审计记录；删除必须先确认监管和业务保留要求，并通过受控数据库维护流程执行。CSV 临时导出完成后应从受限目录清除，不得进入 Git、聊天附件或公共目录。
