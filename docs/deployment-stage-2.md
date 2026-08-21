# Stage 2 Linux + Docker 准备说明

本文件只记录部署准备，不代表已经部署。Stage 2 不操作服务器、DNS、证书或生产数据。

## 必需环境变量

- `NUXT_DATABASE_URL`：官网独立 MariaDB/MySQL 连接，必须使用非 root 专用用户。
- `NUXT_ADMIN_USERNAME`：单管理员用户名。
- `NUXT_ADMIN_PASSWORD_HASH`：通过 `npm run admin:hash` 交互生成的 Argon2id 哈希。
- `NUXT_SESSION_PASSWORD`：至少 32 字节的随机服务器密钥。
- `NUXT_TRUSTED_PROXY_ADDRESSES`：可选，仅填写实际可信反向代理的直连 IP，逗号分隔；为空时忽略客户端提交的 `X-Forwarded-For`。
- `NUXT_PUBLIC_SITE_URL`：正式环境为 `https://yizuw.org`。
- `NUXT_PUBLIC_INDEXABLE`：正式上线人工验收前保持 `false`。
- `NUXT_ENABLE_HSTS`：只有 HTTPS 和反向代理确认正确后才允许设为 `true`。

密码不得作为命令行参数传给哈希脚本，不得写入 Dockerfile、Compose 默认值或 Git。

## 本地 Compose 验证

1. 在未跟踪的 `.env` 中填写 Compose 与 Nuxt 必需变量。
2. 使用固定项目名：`docker compose -p kwzg_stage2_test config`。
3. 构建：`docker compose -p kwzg_stage2_test build`。
4. 启动测试服务：`docker compose -p kwzg_stage2_test up -d`。
5. 应用启动前依次验证环境、执行迁移，再启动 Nitro Node Server。
6. 仅清理本任务资源：`docker compose -p kwzg_stage2_test down -v`。禁止全局 prune。

MariaDB 服务不发布 3306 端口，只接入内部网络供应用访问；应用同时接入内部数据库网络和用于绑定本机 HTTP 端口的应用网络。应用容器使用 Node 官方镜像中的非 root `node` 用户。

## 迁移与健康检查

- `npm run db:migrate` 使用版本化 Knex 迁移；新空库与重复执行必须通过。
- `/api/health` 只返回数据库可用状态，不泄露连接、版本、表结构或凭证。
- 数据库失败时预约接口返回统一错误，前端不得显示成功。
- 已知连接、权限、库缺失和迁移缺失使用不泄露内部结构的稳定 503 错误码；未知应用错误保持 500，不得将所有异常误报为数据库故障。
- `POST /api/demo-requests` 必须由同源页面发起；正式环境只接受当前请求自身的 `https://yizuw.org` 来源，不允许 `*` 或任意 Origin。
- 成功响应只返回 `success` 与安全请求 ID；线索和初始审计在同一事务内完成后才返回 201。

## 回滚

- 应用回滚使用已验证的上一镜像版本，不修改 DNS。
- 数据库回滚前必须完成备份和人工审批；不得因应用回滚自动删除线索。
- `npm run db:rollback` 只用于隔离测试库验证迁移可逆性，生产环境不得无备份执行。
