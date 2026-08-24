# 首页系统能力截图来源矩阵

- 审计日期：2026-08-24
- 来源：`private-reference/yizuw-ui/` 中现有本地脱敏截图
- 本轮浏览器访问：0
- 生产写操作：0
- 原始生产截图进入 Git：0
- 公开派生规则：现有不透明遮盖复核、固定 1440×810、WebP、去元数据、单张不超过 350KB。

> 当前首页九个模块均已有各自的独立页面证据。2026-08-24 新增的数据地图、设备总览、人事总览与车辆出入管理截图由用户提供，生产数值及账号身份均使用完全不透明遮盖后再生成公开 WebP 派生图。

| 系统模块 | 页面名称 | 页面路由 | 截图时间 | 原始文件 | 公开文件 | 脱敏项目 | 演示数据 | 官网展示位置 | 审核结果 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 运营总览 | 园区经营总览 | 未采集 | 2026-08-21 | `01-operation-overview.png` | `operations-overview.webp` | 空间、用户、金额、面积、客户数量与待办数据均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 数据地图 | 数据地图 | 未采集 | 2026-08-24 | `user-supplied-2026-08-24/data-map-original.png` | `data-map.webp` | 所有节点数量、关联数量、员工及考勤统计均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 设备管理 | 设备总览 | 未采集 | 2026-08-24 | `user-supplied-2026-08-24/equipment-overview-original.png` | `equipment-management.webp` | 设备、接入及分类数量与右上角账号身份均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 租赁 | 园区管理 | 未采集 | 2026-08-21 | `02-vacant-factory-list.png` | `leasing-management.webp` | 园区、地址、负责人、面积和出租数据均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 招商管理 | 招商客户 | 未采集 | 2026-08-21 | `03-leasing-customer-list.png` | `investment-management.webp` | 客户、联系人、电话、负责人和统计数据均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 人事 | 人事总览 | 未采集 | 2026-08-24 | `user-supplied-2026-08-24/hr-overview-original.png` | `human-resources.webp` | 员工、账号、考勤、请假及关联统计均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 财务 | 账单管理 | 未采集 | 2026-08-21 | `04-bill-payment.png` | `finance-management.webp` | 园区、租户、项目、金额、账期和用户均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 门禁管理 | 车辆出入管理 | 未采集 | 2026-08-24 | `user-supplied-2026-08-24/access-control-original.png` | `access-control.webp` | 页面统计数值与右上角账号身份均为不透明遮盖；截图无车辆记录 | 否 | 首页“九个真实系统模块” | PASS（页面级） |
| 维护管理 | 报修工单 | 未采集 | 2026-08-21 | `05-inspection-list.png` | `maintenance-management.webp` | 工单数量、园区和用户均为不透明遮盖 | 否 | 首页“九个真实系统模块” | PASS（页面级） |

## 公开审核门禁

- 公开前必须再次确认所有遮盖为完全不透明矩形。
- 公开图不得包含账号、Cookie、Token、手机号、真实客户、金额、合同号、地址或通行人员身份。
- 新增四张页面证据只保留截图已证明的字段、按钮、状态和页面关系，不扩写截图未出现的流程。
- 所有公开派生图必须保持生产数值和账号身份完全不可读，不使用模糊遮盖。
- 运行时不得请求 `yizuw.cn`。

`SYSTEM_SCREENSHOT_AUDIT=PASS`

`PRODUCTION_WRITE_ACTIONS=0`

`RAW_PRODUCTION_IMAGES_TRACKED=0`
