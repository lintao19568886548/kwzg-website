# 瞰维智管官方网站

这是 `yizuw.org` 官网的独立 Nuxt 项目，与 `yizuw.cn` 生产系统隔离。当前官网使用完整能力矩阵呈现园区经营决策、招商租赁、账务财务、园区服务、组织协同、AI、权限部署和软硬件接入，并继续保留独立预约入库、单管理员线索后台及客户案例详情体系。

## 本地运行

环境要求：Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

默认访问 `http://localhost:3000`。

## 质量检查

```bash
npm run lint
npm run test
npm run build
npm run security:scan
```

完整的隔离 Docker 验收可运行 `npm run audit:local`。该命令使用随机测试密钥创建 `kwzg_prelaunch_audit` 与 `kwzg_prelaunch_restore` 两个专用项目，验证空库迁移、API、数据库故障、备份恢复，并在结束时删除本次容器、卷和临时备份；不得在生产服务器或现有数据库上运行。

`NUXT_PUBLIC_INDEXABLE` 默认关闭，避免阶段性环境被搜索引擎收录；正式上线前需在经过发布审批的环境中显式设置为 `true`。

## 当前边界

- 已完成八个公开主页面（含实施服务页）、五个客户案例详情页、全站动效系统和预约演示服务端入库。
- 完整产品能力统一维护在 `app/data/product-capabilities.js`，每项能力和子功能都标注“已上线、按项目配置、评估接入、规划中”；真实后台界面仍只使用有页面证据的结构和演示数据重构，菜单级、硬件和规划能力使用状态卡或关系图，不伪装成后台截图。
- 已接入清理后的透明 Logo；页头使用无宣传语横版，页脚和品牌介绍使用完整宣传语版。
- 案例列表与详情只公开同富、佛山乐从、深圳坑梓、新塘西州和高埗同兴五个园区；佛山九江素材只留在非公开 raw 目录。
- 联系电话、联系地址和企业微信显示信息集中维护在 `app/config/site.js`；企业微信二维码和新塘西州实景已从 `incoming/` 核验后接入。
- 预约表单通过独立官网 API 写入独立 MariaDB/MySQL，并由单管理员后台查看和跟进；不发送企业微信通知。
- 能力审计优先复用 Git 忽略目录中的本地脱敏截图；只读浏览器审计不得执行新增、编辑、删除、保存、提交、审批、收款、核销、导入导出、设备控制或配置变更。
- 不部署，不修改 DNS，不推送远程仓库。
- 不在仓库中保存真实账号、密码或经营数据；仅保存用户已明确授权公开的联系信息和案例派生素材。

完整需求记录见 `docs/website-requirements.md`，历史界面来源审计见 `docs/system-ui-source-matrix.md`，完整能力与状态矩阵见 `docs/website-full-capability-source-matrix.md`。

生产部署必须按 `docs/production-env-checklist.md`、`docs/deployment-runbook.md`、`docs/database-backup-restore.md` 和 `docs/rollback-runbook.md` 执行；`compose.production.yml` 与 `deploy/nginx/yizuw.org.conf.example` 仅为模板，本仓库不包含生产密钥、证书、服务器地址或 DNS 操作。
