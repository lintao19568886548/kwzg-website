# 瞰维智管官方网站

这是 `yizuw.org` 官网的独立 Nuxt 项目基线，与 `yizuw.cn` 生产系统隔离。

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
npm run build
```

`NUXT_PUBLIC_INDEXABLE` 默认关闭，避免阶段性环境被搜索引擎收录；正式上线前需在经过发布审批的环境中显式设置为 `true`。

## 当前边界

- 只完成项目基线和临时占位页面。
- 不部署，不修改 DNS，不连接或操作 `yizuw.cn` 生产系统。
- 不在仓库中保存真实账号、密码、二维码或经营数据。

