# 瞰维智管官网上线前总审计

## 审计基线

- 审计日期：2026-08-22（Asia/Shanghai）
- 分支：`feature/stage-2-content-leads-admin`
- 审计实际基线：`b7586b5d983e1f3286aceaa5e6ac6573177cbc51`
- 基线说明：本轮从品牌开场提交继续内容融合，完整保留已有未提交成果；没有 reset、checkout、clean 或 amend。
- 审计开始工作区：保留既有未提交成果
- 生产系统请求：0
- 生产写操作：0

## 审计范围

覆盖 Git 与敏感文件、13 个公开路由、2 个后台路由、案例与系统界面真实性、动效、Logo/二维码/资质、预约入库、后台认证与会话、MariaDB 迁移、Docker、Nginx/HTTPS 模板、安全响应头、SEO、隐私、备份恢复、回滚、性能资源和可访问性代码边界。

## 发现问题与修复

1. 应用容器启动时执行迁移，多副本可能并发。已改为独立 `migrate` 服务，应用启动不再迁移，并增加 MariaDB advisory lock。
2. 数据库会话时区没有显式固定。应用与迁移连接均设置 `+00:00` 和 `utf8mb4`，Compose 数据库使用 UTC；界面仍按中文本地格式显示。
3. 可信来源变量未接入。表单与后台写请求现在接受请求自身 origin 或 `NUXT_TRUSTED_ORIGINS` 中的精确 origin；非法配置返回稳定错误且不输出值。
4. Session 与限流记录缺少维护策略。新增绝对过期/撤销会话清理和过期限流桶清理，并补充相应索引。
5. `.gitignore`、`.dockerignore` 对日志、备份、SQL、数据库目录和 raw 构建上下文覆盖不足。现已补齐；最终镜像检查未包含 Git、env、raw、tests、docs、private-reference 或 incoming。
6. 后台详情抽屉缺少 Esc、焦点循环、焦点返回和背景滚动锁。现已补齐，且避免 admin layout 中嵌套 `main`。
7. 隐私页联系区缺少法定公司名称和地址。已使用统一站点配置补齐。
8. 首页首屏以下园区图与企业微信二维码使用 eager。已改为 lazy，不改变二维码像素。
9. 缺少受索引开关控制的 `robots.txt`、受限 sitemap 和自定义 404。现已增加；sitemap 只含 13 个公开营销路由，不含 `/call`、后台和 API。
10. CSP、HSTS、canonical 和预渲染 noindex 属于构建期配置。Docker builder 现接受显式构建参数；部署文档要求构建值与运行时值一致，切换索引/HSTS 必须生成新不可变镜像。
11. 生产 Compose、Nginx、环境清单、部署、回滚与数据库备份恢复流程缺失。已新增模板和文档，未写入服务器地址、证书、私钥或真实密钥。
12. 原安全扫描覆盖面有限。现同时检查跟踪的 env/备份/日志/生成目录、私有目录、生产系统调用、生产截图、远程图片、敏感日志和 TypeScript 源码。
13. 容器网络在 MariaDB 停止后会返回 `EAI_AGAIN`，此前未被数据库错误归一化覆盖。已通过独立故障探针确认错误形态，精确映射为 `DATABASE_UNAVAILABLE` 503，并增加回归测试；未知应用异常仍返回 500。

## 本地验证证据

### 代码、构建与依赖

- `npm run lint`：PASS
- `npm run test`：PASS；本地 139 项通过、9 项数据库用例按环境跳过；显式重建测试镜像后，隔离容器内 148/148 项通过，其中包含真实 MariaDB 集成测试
- `npm run build`：PASS；14 个配置路由（13 个公开营销路由及 `/call`）全部预渲染成功
- `npm run security:scan`：PASS
- `npm audit --omit=dev --audit-level=high`：0 vulnerabilities
- `npm audit --audit-level=high`：0 vulnerabilities
- 客户案例 WebP、企业资质 WebP、电话 PNG 均由测试检查无 EXIF/GPS/XMP 等发布元数据；电话二维码在原始、168、160、128 像素测试下均解码为 `https://yizuw.org/call`
- 企业微信二维码由本地解码器识别成功；未伪造微信真机扫码结果

### Docker、数据库与 API

`npm run audit:local` 最终返回 PASS。它使用随机临时凭证创建 `kwzg_prelaunch_audit` 和 `kwzg_prelaunch_restore` 两个独立项目，未复用现有卷。验证结果：

- 固定版本 MariaDB 健康、应用容器非 root、数据库未发布主机端口：PASS
- 空库执行全部 2 个迁移、重复迁移、回滚后重放、`utf8mb4`、UTC、外键和索引：PASS
- 13 个公开路由 HTTP 200、无效案例 404、后台未认证边界、no-store/noindex、安全头：PASS
- 预约 201、1 条线索、1 条初始审计、幂等与并发去重、非法字段与隐私拒绝：PASS
- 后台登录、列表手机号脱敏、详情、状态/备注、CSRF、退出撤销、CSV 权限与公式注入防护：PASS
- 数据库停止时预约返回 503 且无成功体；数据库恢复后重新提交 201：PASS
- 一致性逻辑备份到 Git 忽略目录、恢复到新卷、迁移状态与线索/审计检查、恢复库后台可见：PASS
- 审计容器、专用卷和临时明文备份：已在 finally 中删除
- 运行镜像用户：`node`；大小约 153 MB；不含 raw、测试、文档、私有目录、env 或 Git：PASS

### 反向代理与发布模板

- `compose.production.yml config --quiet`：PASS（仅占位值，不启动服务）
- `nginx:1.27.4-alpine` 中使用临时自签证书和测试 upstream 执行 `nginx -t`：PASS
- 根域名/www 跳转、TLS 1.2/1.3、静态缓存、HTML no-cache、后台/API no-store、请求体与超时限制均已写入模板
- HSTS 默认关闭，待真实 HTTPS 与续期稳定后再通过新镜像和代理配置启用；不启用 preload

## 真实性与公开内容结论

- `SYSTEM_UI_SOURCE_MATRIX=PASS`
- 公开系统界面：园区经营总览、招商客户、客户详情、合同管理、账单管理、报修工单
- 公开未验证系统界面：0
- 生产系统截图：0
- 待租厂房/房态矩阵、独立员工移动工作台：只在内部矩阵保留 UNVERIFIED，公开为 0
- AI 招商匹配按 2026-08-22 官网内容融合方案标为“AI招商匹配 · 规划中”，且没有制作字段、按钮、结果或操作界面
- 当前登录系统静态目标按最新内容融合要求保持 `https://yizuw.cn`；审计未访问该地址
- 公开案例严格为 5 个；佛山九江、水印图和旧错误第九张公开引用为 0
- 资质名称、企业、编号、监督机构和日期与统一配置一致；误导性资质宣传为 0

## 浏览器与响应式门禁

- 官方应用内浏览器逐页检查首页、产品、解决方案、案例、实施服务、关于、预约、隐私、5 个案例详情、后台登录和 404 页面：PASS。
- 1440、1024、768、390 四个精确视口均由本地浏览器内核核对；`scrollWidth` 与 `clientWidth` 一致，横向溢出为 0。
- 390px 页头显示紧凑 Logo 与菜单按钮；移动菜单可展开，并包含“首页”“实施服务”“预约演示”和登录入口。
- `?motion=off` 与 `prefers-reduced-motion: reduce` 均使持续动画降级，正文、导航、表单和联系方式保持可见可用。
- 官方浏览器最初在后台登录页记录到一次 hydration mismatch，根因是嵌套链接；修复后使用全新标签页复查后台登录和 404，控制台错误与 hydration error 均为 0。
- 实施服务 FAQ 点击展开/收起正常，原生 `button` 与 `aria-expanded` 保留键盘语义；预约表单空提交显示四项明确文字错误，不用动画代替状态。
- 桌面端与移动端截图保存在 Git 忽略目录 `private-reference/content-integration-qa/`，未进入提交。

## 性能记录

- 未引入 Three.js 或重型动画依赖；动效基于 CSS 与 IntersectionObserver。
- 最近一次生产构建入口 CSS 约 139.70 kB（gzip 24.07 kB）；最大单个客户端 JS chunk 约 83.68 kB（gzip 30.84 kB）；Nitro 产物约 5.27 MB（gzip 1.67 MB）。
- 页面下方案例图、资质图和二维码使用显式尺寸与懒加载；首个案例详情主图保持高优先级。
- 本轮未将 Lighthouse 分数列为提交门禁，不填写未经测量的分数。

## 尚未执行的生产操作

- 未连接服务器，未部署，未推送，未修改 DNS。
- 未申请、上传或修改 TLS 证书，未启用 HSTS。
- 未访问 `yizuw.cn`，未访问登录系统外部目标，未连接生产数据库。
- 未开放搜索引擎索引，当前继续 noindex/nofollow。
- 微信 iOS/Android 真机扫码、Safari 真机、HTTPS 证书链和自动续期留待部署阶段。

## 审计结论

- 代码、API、数据库、备份恢复、Docker、Nginx、隐私和静态安全门禁：PASS
- 浏览器响应式、hydration、控制台、移动菜单、FAQ 与减少动态门禁：PASS
- 回滚准备：文档与不可变镜像流程已准备，生产演练未执行
- 最终是否可进入受控部署准备：YES（仍需独立完成真实服务器、证书、DNS 与生产环境变量审批）

```text
PRE_LAUNCH_AUDIT=PASS
READY_FOR_DEPLOYMENT=YES
COMMIT_CREATED=YES
```
