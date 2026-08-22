# 生产环境变量清单

本文件只记录变量名称、用途和验收规则。真实值必须通过服务器受限环境文件或密钥管理系统注入，不得写入 Git、镜像、Compose 文件、命令输出或工单正文。

## 必填变量

| 变量 | 作用 | 生产要求 |
| --- | --- | --- |
| `NODE_ENV` | Node 运行模式 | 固定为 `production` |
| `NUXT_DATABASE_URL` | 官网独立 MariaDB 连接 | 使用非 root 最小权限账号；仅可连接官网数据库；密码为高强度随机值 |
| `NUXT_ADMIN_USERNAME` | 单管理员账号 | 不使用默认名称，不公开 |
| `NUXT_ADMIN_PASSWORD_HASH` | 管理员密码摘要 | 仅接受 Argon2id；不得保存明文密码 |
| `NUXT_SESSION_PASSWORD` | Session、CSRF 与摘要密钥 | 至少 32 个高熵字符，建议 48 字节随机值；不得复用数据库密码 |
| `NUXT_PUBLIC_SITE_URL` | canonical 与公开链接根地址 | 固定为 `https://yizuw.org` |
| `NUXT_TRUSTED_ORIGINS` | 可提交表单和后台写请求的来源 | 固定为 `https://yizuw.org,https://www.yizuw.org` |
| `NUXT_TRUSTED_PROXY_ADDRESSES` | 允许提供客户端地址的受控代理 | 仅填写 Compose 内 Nginx 的实际来源地址；禁止通配 |

## Compose 与数据库变量

| 变量 | 生产要求 |
| --- | --- |
| `KWZG_DB_NAME` | 官网独立数据库名，不得指向现有业务系统数据库 |
| `KWZG_DB_USER` | 非 root 应用账号，仅具官网表所需权限 |
| `KWZG_DB_PASSWORD` | 独立高强度随机密码 |
| `KWZG_DB_ROOT_PASSWORD` | 仅用于数据库初始化和受控维护，不提供给应用 |
| `KWZG_IMAGE_TAG` | 固定为已验收提交或不可变发布标签，不使用 `latest` |
| `KWZG_TLS_DIR` | 服务器本地证书目录，只读挂载，不进入 Git |
| `KWZG_APP_PORT` | 仅本地 Compose 使用；生产应用不直接发布端口 |
| `KWZG_BUILD_SITE_URL` | 本地 Compose 的构建期 site URL；生产构建固定为 `https://yizuw.org` |

## 上线开关

- `NUXT_PUBLIC_INDEXABLE=false`：首次部署、HTTPS、表单与后台验收期间保持关闭。
- `NUXT_PUBLIC_INDEXABLE=true`：仅在用户明确确认开放索引后切换；切换后复核 `robots.txt`、`sitemap.xml`、canonical 与后台 `/call` 的 noindex。
- `NUXT_ENABLE_HSTS=false`：首次上线保持关闭。
- `NUXT_ENABLE_HSTS=true`：证书链、根域名/www 跳转和自动续期稳定验证后再开启；本项目不预设 preload。

`NUXT_PUBLIC_SITE_URL`、`NUXT_PUBLIC_INDEXABLE` 和 `NUXT_ENABLE_HSTS` 同时也是 Docker 构建参数。它们会影响预渲染 HTML、canonical 与静态路由响应头，构建值必须与运行时值一致；切换索引或 HSTS 时必须产生新的不可变镜像，不能只重启旧镜像。

## 启动前检查

1. 环境文件权限仅允许运维账号和容器运行账号读取。
2. 所有占位符已替换，且没有把真实值复制回 `.env.example`。
3. 数据库 URL 的用户名不是 root，主机不是公网数据库入口。
4. 管理员哈希以 `$argon2id$` 开头，Session 密钥长度达标。
5. 可信来源仅包含完整 HTTPS origin，不包含路径、通配符或本地地址。
6. `npm run security:scan`、`node scripts/validate-runtime.js` 均通过，输出只说明存在性与格式，不打印值。
