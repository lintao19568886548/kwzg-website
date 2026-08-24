# 官网完整能力内容来源矩阵

- 更新日期：2026-08-24
- 原始《瞰维智管产品介绍（详细客户版）》PDF：指定路径及允许搜索范围内未找到
- PDF 读取状态：`PDF_SOURCE_READ=FAIL`
- 排版参考：`kwzg_website_content_integration_plan (1).pdf` 仅作历史排版参考，不再决定功能删减或完成状态
- 最新产品负责人确认：`PRODUCT_OWNER_CONFIRMED=YES`
- 当前统一能力数据：`app/data/product-capabilities.js`
- 当前公开能力总数：206

## 判定原则

1. 不能把未找到的原始详细版 PDF 伪记为已读取，也不能声称已经完成 PDF 条目逐页映射。
2. 产品负责人已明确确认统一数据源中的 206 项能力均已完善，公开完成状态统一为 `available`。
3. `standard`、`configuration`、`integration`、`private-deployment` 只表示交付方式，不表示功能尚未完成。
4. 页面截图证据用于证明真实系统模块、页面结构、字段、筛选项、按钮和状态；缺少某项独立截图不降低产品能力完成状态。
5. 系统截图展示与能力介绍分开审核：有页面证据的模块可以使用脱敏派生图，没有页面证据的能力只能使用文字、架构图或流程图，不伪装成真实后台。

## 十二个产品板块

| 产品板块 | 产品负责人确认 | 公开完成状态 | 主要交付方式 | 首页能力域 | 视觉证据 |
| --- | --- | --- | --- | --- | --- |
| 经营驾驶舱与数据地图 | YES | AVAILABLE | standard / configuration | 经营决策 | 经营总览、数据地图 |
| 资产、房源与租赁 | YES | AVAILABLE | configuration | 招商与租赁 | 园区管理 |
| 招商与客户管理 | YES | AVAILABLE | standard / configuration | 招商与租赁 | 招商客户、客户详情 |
| 合同管理 | YES | AVAILABLE | standard / configuration | 合同、账单与财务 | 合同管理 |
| 账单、财务与回款 | YES | AVAILABLE | standard / configuration | 合同、账单与财务 | 账单管理 |
| 物业、报修与维护 | YES | AVAILABLE | standard / configuration | 园区服务 | 报修工单 |
| 设备、巡检与能耗 | YES | AVAILABLE | configuration / integration | 设备、巡检、能耗与门禁 | 设备总览 |
| 人事、考勤与审批 | YES | AVAILABLE | configuration | 人事与组织协同 | 人事总览 |
| 门禁和通行 | YES | AVAILABLE | configuration / integration | 设备、巡检、能耗与门禁 | 车辆出入管理 |
| AI 智能增强 | YES | AVAILABLE | configuration | AI、软硬件、安全与部署 | 能力流程，不伪装为系统截图 |
| 权限、安全与部署 | YES | AVAILABLE | configuration / private-deployment | AI、软硬件、安全与部署 | 能力关系与实施边界 |
| 软硬件接入 | YES | AVAILABLE | integration | AI、软硬件、安全与部署 | 设备总览与接入边界 |

## 首页内容映射

| 内容层 | 统一数据源 | 首页组件 | 结论 |
| --- | --- | --- | --- |
| 四大经营结果 | `operationValuePoints` | `HomeBusinessValue.vue` | PASS |
| 三层能力架构 | `capabilityArchitecture` | `HomeCapabilityArchitecture.vue` | PASS |
| 三条业务闭环 | `businessFlows` | `HomeBusinessLoops.vue` | PASS |
| 七大完整能力域 | `homeCapabilityDomains` | `HomeCapabilityPanorama.vue` | PASS |
| 九个真实系统模块 | `systemShowcaseModules` | `HomeSystemModuleShowcase.vue` | PASS |
| 206 项完整能力 | `capabilityFeatureIndex` | `HomeCapabilityDrawer.vue` | PASS |
| 六种岗位视图 | `roleSolutions` | `HomeRoleSolutions.vue` | PASS |
| AI 智能增强 | `productCapabilities.ai` | `HomeAiCapabilities.vue` | PASS |
| 软硬件、安全与部署 | `productCapabilities.hardware/security` | `HomeTechnologyFoundation.vue` | PASS |

## 真实性与公开边界

- 九个首页系统模块均有各自的页面级证据，公开派生图及脱敏记录见 `docs/homepage-capability-screen-source-matrix.md`。
- 原始截图和内部处理文件只保存在被 Git 忽略的 `private-reference/`，不进入发布目录或提交。
- AI 能力作为已完善产品能力介绍，但没有被制作成虚构的系统页面、匹配结果或自动执行记录。
- 软硬件接入与云端私有化部署保留设备型号、协议、网络、服务器、数据库和实施范围等交付条件。
- 官网不使用真实经营数据，不承诺出租率、回款率、收入增长、零空置或零欠费等具体结果。
- 预约演示继续写入官网独立数据库，不调用或写入 `yizuw.cn`。

## 审核结论

- 统一能力数据覆盖：`206 / 206`
- 已完善能力被标记为未完成：`0`
- 首页旧功能展示引用：`0`
- 公开脱敏系统图：`9`
- 原始详细版 PDF 逐页映射：因源文件缺失，当前不能判定 PASS

`PDF_CONTENT_MATRIX=PARTIAL`

`PDF_SOURCE_READ=FAIL`

`LATEST_PRODUCT_OWNER_CONFIRMATION_APPLIED=PASS`
