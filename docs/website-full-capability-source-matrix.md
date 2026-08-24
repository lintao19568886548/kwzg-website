# 瞰维智管官网完整能力来源矩阵

- 更新日期：2026-08-24
- 产品负责人最新确认：`PRODUCT_OWNER_CONFIRMED=YES`
- 公开完成状态：`PUBLIC_AVAILABILITY=AVAILABLE`
- 统一数据源：`app/data/product-capabilities.js`
- 能力总数：206
- 公开原则：功能完成状态与交付方式分离；缺少独立页面截图只影响视觉证据，不影响产品能力是否完成。
- 原始《瞰维智管产品介绍（详细客户版）》PDF：本机指定位置未找到，不能伪记为已读取；本轮依据产品负责人最新确认、现有 206 项能力清单、真实系统菜单和本地脱敏截图完成重构。

## 数据字段

| 字段 | 取值 | 含义 |
| --- | --- | --- |
| `availability` | `available` | 产品能力已经完善，可以对外介绍 |
| `deliveryMode` | `standard` | 标准软件能力 |
| `deliveryMode` | `configuration` | 根据园区规则、资料、岗位或权限配置 |
| `deliveryMode` | `integration` | 根据设备、协议、接口或网络环境实施 |
| `deliveryMode` | `private-deployment` | 云端私有化部署或指定环境交付 |
| `productOwnerConfirmed` | `true` | 产品负责人本次明确确认 |

需要配置、接口实施或云端私有化部署均不代表功能尚未完成。官网不再把截图证据等级转换为功能完成状态。

## 十二个产品板块

| 产品板块 | PRODUCT_OWNER_CONFIRMED | PUBLIC_AVAILABILITY | DELIVERY_MODE | SCREENSHOT_EVIDENCE | PUBLIC_VISUAL_ASSET |
| --- | --- | --- | --- | --- | --- |
| 经营驾驶舱与数据地图 | YES | AVAILABLE | standard / configuration | 经营总览页面＋数据地图页面 | `operations-overview.webp`、`data-map.webp` |
| 资产、房源与租赁 | YES | AVAILABLE | standard / configuration | 园区管理页面＋租赁菜单 | `leasing-management.webp` |
| 招商与客户管理 | YES | AVAILABLE | standard / configuration | 招商客户列表＋客户详情 | `investment-management.webp` |
| 合同管理 | YES | AVAILABLE | standard / configuration | 合同管理页面 | `leasing-management.webp`（关联租赁域） |
| 账单、财务与回款 | YES | AVAILABLE | standard / configuration | 账单管理页面＋财务菜单 | `finance-management.webp` |
| 物业、报修与维护 | YES | AVAILABLE | standard / configuration | 报修工单页面＋维护菜单 | `maintenance-management.webp` |
| 设备、巡检与能耗 | YES | AVAILABLE | configuration / integration | 设备总览页面＋设备管理菜单 | `equipment-management.webp` |
| 人事、考勤与审批 | YES | AVAILABLE | configuration | 人事总览页面＋经营总览待办 | `human-resources.webp` |
| 门禁和通行 | YES | AVAILABLE | configuration / integration | 车辆出入管理页面＋门禁管理菜单 | `access-control.webp` |
| AI智能增强 | YES | AVAILABLE | configuration | 产品负责人确认；不以虚构后台证明 | 业务流程与能力卡，不伪装为截图 |
| 权限、安全与部署 | YES | AVAILABLE | configuration / private-deployment | 角色菜单、测试及部署文档 | 技术底座关系图 |
| 软硬件接入 | YES | AVAILABLE | integration | 设备总览页面＋设备菜单＋产品负责人确认 | `equipment-management.webp` |

## 七大首页能力域映射

| 首页能力域 | 关联产品板块 | 首页入口 |
| --- | --- | --- |
| 经营决策 | 经营驾驶舱与数据地图 | `#home-domain-decision` |
| 招商与租赁 | 资产、房源与租赁；招商与客户管理 | `#home-domain-leasing` |
| 合同、账单与财务 | 合同管理；账单、财务与回款 | `#home-domain-finance` |
| 园区服务 | 物业、报修与维护 | `#home-domain-service` |
| 设备、巡检、能耗与门禁 | 设备、巡检与能耗；门禁和通行 | `#home-domain-iot` |
| 人事与组织协同 | 人事、考勤与审批 | `#home-domain-organization` |
| AI、软硬件、安全与部署 | AI智能增强；权限、安全与部署；软硬件接入 | `#home-domain-technology` |

## 边界

- 206 项能力全部为 `available`，页面展示的差异仅为交付方式。
- AI 不替代招商、财务、工程或管理人员的最终判断；OCR 保留人工复核。
- 软硬件启用范围取决于设备型号、协议、网络、接口、厂商配合与授权。
- SaaS、指定服务器、指定数据库和云端私有化部署环境的责任边界以项目方案为准。
- 官网不承诺具体出租率、回款率、收入增长或零故障等结果。
- 系统截图只作为真实模块与页面结构的视觉证据；公开版本必须脱敏、去元数据并通过人工复查。
- 首页九个系统模块均使用各自独立页面证据；公开图只展示完全不透明脱敏后的派生版本，不借用其他模块界面。

`LATEST_PRODUCT_OWNER_CONFIRMATION_APPLIED=PASS`

`PUBLIC_AVAILABILITY=AVAILABLE`

`COMPLETED_FEATURES_MARKED_PLANNED=0`
