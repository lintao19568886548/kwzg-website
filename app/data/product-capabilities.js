export const capabilityStatuses = Object.freeze({
  live: Object.freeze({
    id: 'live',
    label: '已上线',
    description: '标准系统中已经存在真实页面或可用流程，具体数据与权限以实际账号为准。',
  }),
  config: Object.freeze({
    id: 'config',
    label: '按项目配置',
    description: '能力已经具备，需要结合园区资料、合同费用、组织岗位、审批和权限规则进行配置。',
  }),
  integration: Object.freeze({
    id: 'integration',
    label: '评估接入',
    description: '需要核对服务器、硬件型号、接口协议、网络环境、厂商配合和客户授权。',
  }),
  planned: Object.freeze({
    id: 'planned',
    label: '规划中',
    description: '属于产品路线图方向，当前不作为标准功能承诺，也不展示成可操作后台。',
  }),
})

const feature = (name, status, sourceType, sourceReference, boundary = '') => Object.freeze({
  name,
  status,
  sourceType,
  sourceReference,
  boundary,
})

const live = (name, sourceReference, boundary = '') => feature(name, 'live', 'E2', sourceReference, boundary)
const config = (name, sourceReference, boundary = '') => feature(name, 'config', 'E2', sourceReference, boundary)
const integration = (name, sourceReference, boundary = '') => feature(name, 'integration', 'E2', sourceReference, boundary)
const planned = (name, sourceReference = '产品规划资料', boundary = '') => feature(name, 'planned', 'E3', sourceReference, boundary)

const sharedCta = Object.freeze({ label: '预约演示', to: '/demo' })

export const productCapabilities = Object.freeze([
  Object.freeze({
    id: 'operations', slug: 'operations', group: '经营决策', productSection: '经营驾驶舱与数据地图', name: '经营驾驶舱与数据地图', shortName: '经营决策', status: 'live', icon: 'chart',
    sourceType: 'E2', sourceReference: '00-menu-full-01.png、00-menu-full-02.png、01-operation-overview.png',
    heroValue: '老板一屏看经营，让关键回款、出租和待办信息更早进入管理视野。',
    customerProblem: '经营数据散在表格和不同岗位手中，临时汇总慢，关键事项容易错过。',
    systemAction: '以园区经营总览为统一入口，汇总应收、实收、待收、在租面积、回款进度和跨模块待办；数据地图及扩展汇总按项目状态呈现。',
    businessValue: '帮助管理层减少临时报表和反复询问，让经营判断更及时。',
    features: Object.freeze([
      live('运营总览', '01-operation-overview.png'), live('累计应收', '01-operation-overview.png'), live('累计实收', '01-operation-overview.png'), live('待收余额', '01-operation-overview.png'), live('回款完成度', '01-operation-overview.png'), live('在租面积', '01-operation-overview.png'), live('租赁客户', '01-operation-overview.png'), live('经营回款脉搏', '01-operation-overview.png', '只展示当前口径，不承诺预测趋势'), live('经营待办', '01-operation-overview.png'), live('合同到期', '01-operation-overview.png'), config('合同递增', '00-menu-full-02.png 与经营总览待办结构', '递增规则按合同项目配置'), live('未收租', '01-operation-overview.png'), live('维护工单', '01-operation-overview.png'), live('报销待办', '01-operation-overview.png'), live('考勤异常', '01-operation-overview.png'), config('空置情况', '01-operation-overview.png 与 02-vacant-factory-list.png'), config('数据地图', '00-menu-full-01.png', '页面内容随园区资产资料配置'), config('经营报表', '00-menu-full-01.png、00-menu-full-02.png'), planned('多园区汇总'), config('风险提醒', '01-operation-overview.png', '只基于已配置规则形成提醒，不作经营结果保证'),
    ]),
    roles: Object.freeze(['园区老板 / 股东', '运营负责人', '财务负责人']), relatedCapabilities: Object.freeze(['assets', 'contracts', 'billing', 'maintenance', 'people']), screenshots: Object.freeze(['overview']), interfaceType: 'overview',
    boundary: '汇总口径、提醒范围和可见园区受数据配置与权限控制；不承诺自动经营决策或经营结果。', cta: sharedCta,
    seoTitle: '园区经营驾驶舱与数据地图', seoDescription: '了解瞰维智管如何汇总园区经营、回款、出租和待办信息。',
  }),
  Object.freeze({
    id: 'assets', slug: 'assets', group: '招商与租赁', productSection: '资产、房源与租赁', name: '资产、房源与租赁', shortName: '资产房源', status: 'config', icon: 'building',
    sourceType: 'E2', sourceReference: '00-menu-full-01.png、02-vacant-factory-list.png',
    heroValue: '把园区、厂房和租赁状态建立成持续可维护的资产底账。', customerProblem: '房源信息靠个人表格维护，空置和到期状态难以及时同步给招商团队。',
    systemAction: '按园区资料建立资产层级、租户和租赁状态，并将可招商、在租、到期等信息与招商和合同环节衔接。', businessValue: '支持团队更早发现空置和到期机会，推动房源信息统一。',
    features: Object.freeze([
      config('园区', '02-vacant-factory-list.png'), planned('楼栋'), planned('楼层'), config('房源', '00-menu-full-01.png：房源管理、待租厂房'), config('面积', '02-vacant-factory-list.png'), planned('用途'), planned('租赁价格'), config('可租', '02-vacant-factory-list.png'), config('在租', '01-operation-overview.png'), config('空置', '01-operation-overview.png'), planned('锁定'), config('即将到期', '04-contract-list.png'), planned('续租'), planned('退租'), planned('重新招商'), live('在租面积', '01-operation-overview.png'), live('租赁客户', '01-operation-overview.png'), live('空置厂房待办', '01-operation-overview.png'), config('租户管理', '00-menu-full-01.png'), config('园区管理', '02-vacant-factory-list.png'),
    ]),
    roles: Object.freeze(['资产管理人员', '招商人员', '园区负责人']), relatedCapabilities: Object.freeze(['leasing-crm', 'contracts', 'operations']), screenshots: Object.freeze([]),
    boundary: '资产层级、面积、价格和状态需按客户现有资料配置；官网不展示未经证明的房态矩阵。', cta: sharedCta,
    seoTitle: '园区资产房源与租赁管理', seoDescription: '了解园区、厂房、房源、租户和租赁状态如何统一管理。',
  }),
  Object.freeze({
    id: 'leasing-crm', slug: 'leasing-crm', group: '招商与租赁', productSection: '招商与客户管理', name: '招商与客户管理', shortName: '招商客户', status: 'live', icon: 'users',
    sourceType: 'E2', sourceReference: '03-leasing-customer-list.png、03-followup-detail.png、00-menu-full-01.png',
    heroValue: '从客户线索到跟进、带看和报价，让招商过程不再只留在个人微信里。', customerProblem: '线索、需求和跟进记录分散，客户交接时容易遗漏下一步行动。',
    systemAction: '统一维护客户档案、需求、招商阶段、负责人、跟进与带看入口，并按园区和阶段查询客户。', businessValue: '帮助招商团队提高响应与交接效率，推动空置房源更早进入招商。',
    features: Object.freeze([
      live('客户线索', '03-leasing-customer-list.png'), live('客户档案', '03-leasing-customer-list.png'), live('联系人', '03-leasing-customer-list.png'), config('客户来源', '00-menu-full-01.png：中介档案'), live('客户需求', '03-followup-detail.png'), live('意向面积', '03-followup-detail.png'), live('意向区域', '03-leasing-customer-list.png'), live('跟进记录', '03-followup-detail.png'), live('下一步跟进', '03-followup-detail.png'), live('看房', '03-followup-detail.png：记带看按钮'), live('报价', '03-followup-detail.png：建报价按钮'), planned('异议'), config('渠道管理', '00-menu-full-01.png：中介档案'), config('到期招商', '04-contract-list.png 与招商菜单', '需配置合同到期与招商规则'), config('招商过程', '03-leasing-customer-list.png'), live('客户详情', '03-followup-detail.png'), config('报价审批', '00-menu-full-01.png'), config('中介档案', '00-menu-full-01.png'), config('招商报表', '00-menu-full-02.png'),
    ]),
    roles: Object.freeze(['招商人员', '招商主管', '园区负责人']), relatedCapabilities: Object.freeze(['assets', 'contracts', 'ai']), screenshots: Object.freeze(['leasing-list', 'followup']), interfaceType: 'leasing-list',
    boundary: '页面记录用于人员跟进与判断；不承诺自动成交，不以规划中的 AI 结果替代招商人员决策。', cta: sharedCta,
    seoTitle: '园区招商与客户管理', seoDescription: '了解招商客户、需求、跟进、带看、报价和渠道信息的管理方式。',
  }),
  Object.freeze({
    id: 'contracts', slug: 'contracts', group: '招商与租赁', productSection: '合同管理', name: '合同管理', shortName: '租赁合同', status: 'live', icon: 'clipboard',
    sourceType: 'E2', sourceReference: '04-contract-list.png、01-operation-overview.png', heroValue: '让合同状态、到期和关键收费规则进入统一台账与待办。',
    customerProblem: '合同附件、到期和递增规则依赖个人记忆，容易出现漏查、晚跟进和口径争议。', systemAction: '按园区、交易类型和状态管理合同台账，并将到期与项目配置的递增规则纳入提醒。', businessValue: '帮助管理人员更早关注续租、退租和收费规则，减少业务遗漏。',
    features: Object.freeze([
      live('合同档案', '04-contract-list.png'), planned('补充协议'), planned('合同附件'), planned('合同条款'), planned('免租期'), config('租金递增', '01-operation-overview.png：合同递增提醒', '需按合同规则配置'), planned('保证金'), live('合同到期', '04-contract-list.png'), config('合同递增提醒', '01-operation-overview.png'), planned('续租'), planned('退租'), planned('合同变更'), config('合同与房源关联', '04-contract-list.png 与租赁菜单', '需配置资产与合同数据'), config('合同与账单关联', '04-contract-list.png 与 04-bill-payment.png', '需配置费用与账期规则'),
    ]),
    roles: Object.freeze(['合同管理员', '园区负责人', '财务人员']), relatedCapabilities: Object.freeze(['assets', 'billing', 'operations']), screenshots: Object.freeze(['contract']), interfaceType: 'contract',
    boundary: '合同条款、费用、提醒和权限按项目配置；官网不宣称未经核验的自动签约或审批。', cta: sharedCta,
    seoTitle: '园区租赁合同管理', seoDescription: '了解合同台账、状态、到期与项目配置提醒。',
  }),
  Object.freeze({
    id: 'billing', slug: 'billing', group: '账务与财务', productSection: '账单、财务与回款', name: '账单、财务与回款', shortName: '账务回款', status: 'live', icon: 'wallet',
    sourceType: 'E2', sourceReference: '04-bill-payment.png、00-menu-full-02.png、01-operation-overview.png', heroValue: '应收、实收、待收和回款进度更清楚，减少漏账、漏催和重复对账。',
    customerProblem: '费用、账单、收款和欠费信息分散，财务与业务难以快速核对同一口径。', systemAction: '以账单台账汇总应收、实收、未收和收款状态，并通过项目配置承接费用、结转、催收和报销流程。', businessValue: '帮助团队加快核对与跟进，让回款风险更早进入待办。',
    features: Object.freeze([
      config('收费项目', '04-bill-payment.png', '费用结构按合同和项目配置'), live('应收', '04-bill-payment.png'), live('实收', '04-bill-payment.png'), live('待收', '04-bill-payment.png'), live('账单', '04-bill-payment.png'), config('费用明细', '04-bill-payment.png'), planned('账单调整'), config('收款', '04-bill-payment.png'), planned('核销'), config('欠费台账', '04-bill-payment.png'), config('催缴记录', '04-bill-payment.png：催收短信按钮', '发送渠道和内容需项目确认'), planned('承诺付款日'), planned('账龄分析'), live('回款进度', '01-operation-overview.png'), live('未收租提醒', '01-operation-overview.png'), config('报销', '00-menu-full-02.png'), config('财务审批', '00-menu-full-02.png：报销审核'), planned('凭证和票据'), config('账期结转', '00-menu-full-02.png'), config('财务管理', '00-menu-full-02.png'),
    ]),
    roles: Object.freeze(['财务人员', '园区负责人', '老板 / 股东']), relatedCapabilities: Object.freeze(['contracts', 'operations', 'people']), screenshots: Object.freeze(['bill']), interfaceType: 'bill',
    boundary: '费用、账期、审批和催收规则按项目配置；系统帮助跟进回款，但不保证租户付款。', cta: sharedCta,
    seoTitle: '园区账单财务与回款管理', seoDescription: '了解账单、应收、实收、待收、回款和报销审批的状态边界。',
  }),
  Object.freeze({
    id: 'maintenance', slug: 'maintenance', group: '园区服务', productSection: '物业、报修与维护', name: '物业、报修与维护', shortName: '报修维护', status: 'live', icon: 'wrench',
    sourceType: 'E2', sourceReference: '05-inspection-list.png、01-operation-overview.png、00-menu-full-02.png', heroValue: '让报修有记录、进度有人跟、完成结果可以回看。',
    customerProblem: '报修和维护事项依靠口头或群消息传递，责任、进度和历史容易断层。', systemAction: '统一登记、筛选和查看报修工单状态，并将消防、变压器、电梯等维护模块按项目配置纳入管理。', businessValue: '帮助物业与工程团队减少遗漏，让服务过程和历史更清楚。',
    features: Object.freeze([
      live('报修登记', '05-inspection-list.png：新增工单按钮'), config('工单受理', '05-inspection-list.png 页面说明'), config('派单', '05-inspection-list.png 页面说明'), live('处理进度', '05-inspection-list.png'), config('维修记录', '05-inspection-list.png'), live('完工记录', '05-inspection-list.png：已完成状态'), planned('时效跟踪'), planned('超时提醒'), planned('回访或评价'), config('维护工单', '01-operation-overview.png'), planned('维护历史'), config('待办和责任人', '01-operation-overview.png', '责任人与权限按组织配置'), config('消防管理', '00-menu-full-02.png'), config('变压器管理', '00-menu-full-02.png'), config('电梯管理', '00-menu-full-02.png'),
    ]),
    roles: Object.freeze(['物业人员', '工程人员', '园区负责人']), relatedCapabilities: Object.freeze(['devices', 'access', 'operations']), screenshots: Object.freeze(['repair']), interfaceType: 'repair',
    boundary: '当前公开真实界面是报修工单；巡检、维保和设备联动不冒充为同一页面。', cta: sharedCta,
    seoTitle: '园区物业报修与维护管理', seoDescription: '了解报修登记、处理状态、维护事项和服务留痕。',
  }),
  Object.freeze({
    id: 'devices', slug: 'devices', group: '园区服务', productSection: '设备、巡检与能耗', name: '设备、巡检与能耗', shortName: '设备能耗', status: 'config', icon: 'cpu',
    sourceType: 'E2', sourceReference: '00-menu-full-01.png、00-menu-full-02.png', heroValue: '把设备、水电表和维护事项纳入统一数字台账，支持工程团队持续管理。',
    customerProblem: '设备档案、抄表、维保和异常信息分散，出现故障时难以快速追溯历史。', systemAction: '系统菜单覆盖设备总览、智能水电表、摄像头、门禁与边缘设备；具体巡检、能耗和联动能力按项目或接入条件分层。', businessValue: '帮助工程团队减少重复登记，更早发现设备与能耗异常线索。',
    features: Object.freeze([
      config('设备档案', '00-menu-full-01.png：设备总览'), config('设备分类', '00-menu-full-01.png：设备管理'), config('设备状态', '00-menu-full-01.png：设备总览'), planned('巡检计划'), planned('巡检任务'), planned('维保计划'), config('年检提醒', '00-menu-full-02.png：消防、变压器、电梯管理', '提醒规则按项目配置'), planned('故障记录'), config('维修记录', '05-inspection-list.png'), planned('配件记录'), planned('生命周期台账'), planned('设备异常'), config('设备待办', '01-operation-overview.png'), config('水表', '00-menu-full-01.png：智能水电表管理'), config('电表', '00-menu-full-01.png：智能水电表管理'), config('表计档案', '00-menu-full-01.png：智能水电表管理'), planned('抄表'), planned('读数'), planned('图片凭证'), planned('费用关联'), planned('用量趋势'), planned('异常提醒'), planned('分摊'), planned('对账'), planned('OCR识别'), integration('智能水电表接入', '00-menu-full-01.png', '需核对表计型号、协议与网络'), integration('能耗设备接入', '产品规划资料', '需核对设备与采集协议'),
    ]),
    roles: Object.freeze(['工程人员', '物业人员', '财务人员']), relatedCapabilities: Object.freeze(['maintenance', 'billing', 'hardware']), screenshots: Object.freeze([]),
    boundary: '设备页面菜单不等于任何品牌硬件均可接入；巡检、OCR、趋势和控制需按各自状态确认。', cta: sharedCta,
    seoTitle: '园区设备巡检与水电能耗管理', seoDescription: '了解设备台账、水电表、维保、能耗与硬件接入的状态。',
  }),
  Object.freeze({
    id: 'people', slug: 'people', group: '组织协同', productSection: '人事、考勤与审批', name: '人事、考勤与审批', shortName: '组织协同', status: 'config', icon: 'users',
    sourceType: 'E2', sourceReference: '00-menu-full-02.png、01-operation-overview.png', heroValue: '把人员、考勤、工资、审批和经营待办放进统一组织规则中。',
    customerProblem: '岗位、考勤、工资与报销分散处理，异常和待办依赖主管逐人催办。', systemAction: '系统菜单覆盖人事管理、工资管理、角色管理、报销与审核，并在经营总览中形成考勤异常和报销待办。', businessValue: '帮助主管减少重复核对，让人员责任、异常和审批进度更清楚。',
    features: Object.freeze([
      config('人员档案', '00-menu-full-02.png：人事管理'), planned('组织信息'), planned('岗位'), planned('排班'), planned('打卡'), planned('请假'), planned('加班'), live('考勤异常', '01-operation-overview.png'), planned('考勤汇总'), config('工资规则', '00-menu-full-02.png：工资管理'), config('工资核算', '00-menu-full-02.png：工资管理'), planned('工资条'), config('人事待办', '01-operation-overview.png'), config('费用申请', '00-menu-full-02.png：报销管理'), config('审批流程', '00-menu-full-02.png：报销审核、角色管理'), config('报销申请', '00-menu-full-02.png：报销管理'), live('待处理报销', '01-operation-overview.png'), config('审批记录', '00-menu-full-02.png：报销审核'), planned('凭证归档'), planned('票据归档'), planned('OCR识别'), planned('重复票据提示'), planned('金额或类别异常提示'), config('角色管理', '00-menu-full-02.png'),
    ]),
    roles: Object.freeze(['人事人员', '部门主管', '财务人员']), relatedCapabilities: Object.freeze(['billing', 'operations', 'security']), screenshots: Object.freeze([]),
    boundary: '组织、工资、审批和权限规则需按客户制度配置；规划中的 OCR 与异常识别不作为当前标准能力。', cta: sharedCta,
    seoTitle: '园区人事考勤与审批管理', seoDescription: '了解人员、考勤、工资、报销和审批能力的项目配置边界。',
  }),
  Object.freeze({
    id: 'access', slug: 'access', group: '园区服务', productSection: '门禁和通行', name: '门禁和通行', shortName: '门禁通行', status: 'config', icon: 'shield',
    sourceType: 'E2', sourceReference: '00-menu-full-01.png、00-menu-full-02.png', heroValue: '将车辆、访客与门禁权限放在同一管理边界中，减少线下登记断层。',
    customerProblem: '车辆、访客和人员权限分散登记，通行信息难以统一查询和追溯。', systemAction: '系统菜单覆盖车辆出入、访客管理、访客登记与门禁设备；权限、记录与设备联动按项目配置或接入评估。', businessValue: '帮助物业团队提高登记与查询效率，为异常通行核对保留依据。',
    features: Object.freeze([
      config('人员权限', '00-menu-full-02.png：角色管理、门禁管理'), config('门禁权限', '00-menu-full-01.png：门禁设备管理'), config('通行权限', '00-menu-full-02.png：门禁管理'), config('通行记录', '00-menu-full-02.png：车辆出入管理、访客登记'), config('访客', '00-menu-full-02.png：访客管理'), planned('门禁事件'), planned('异常通行'), integration('门禁设备', '00-menu-full-01.png：门禁设备管理', '需核对型号、协议和网络'), config('车辆出入管理', '00-menu-full-02.png'), config('访客管理', '00-menu-full-02.png'), config('访客登记', '00-menu-full-02.png'),
    ]),
    roles: Object.freeze(['物业人员', '门岗人员', '园区负责人']), relatedCapabilities: Object.freeze(['hardware', 'security', 'maintenance']), screenshots: Object.freeze([]),
    boundary: '门禁权限和通行规则需按园区制度配置；设备控制能力必须先完成型号、协议和安全评估。', cta: sharedCta,
    seoTitle: '园区门禁车辆与访客管理', seoDescription: '了解车辆出入、访客登记、门禁权限与设备接入边界。',
  }),
  Object.freeze({
    id: 'ai', slug: 'ai', group: '智能与技术', productSection: 'AI智能增强', name: 'AI智能增强', shortName: 'AI能力', status: 'config', icon: 'network',
    sourceType: 'E2/E3', sourceReference: '产品方确认（AI招商匹配）与产品规划资料', heroValue: '让 AI 处理重复识别、内容辅助与异常线索，为人员判断提供参考。',
    customerProblem: '重复录入、催缴沟通、票据检查和经营分析耗时，异常往往发现得较晚。', systemAction: 'AI 能力逐项分层；已确认的招商匹配按项目数据和规则配置，其余方向明确标记规划中，不制作虚假操作界面。', businessValue: '帮助减少重复工作、提高查询分析效率，并让异常线索更早进入人工判断。',
    features: Object.freeze([
      config('AI招商匹配', '产品方于 2026-08-21 明确确认为现有能力', '不展示未经页面核实的字段、结果和操作记录'), planned('AI催缴内容'), planned('OCR水电表识别'), planned('OCR票据识别'), planned('AI异常告警'), planned('AI租金分析'), planned('AI经营助手'), planned('AI经营问答'), planned('AI票据检查'),
    ]),
    roles: Object.freeze(['招商人员', '财务人员', '园区管理层']), relatedCapabilities: Object.freeze(['leasing-crm', 'billing', 'devices']), screenshots: Object.freeze([]),
    boundary: 'AI 不替代人员最终判断，不保证识别绝对准确、租户付款或经营结果；涉及外部模型时需明确数据边界并支持关闭。', cta: sharedCta,
    seoTitle: '园区 AI 智能增强能力', seoDescription: '查看 AI 招商、催缴、OCR、异常与经营分析的逐项状态。',
  }),
  Object.freeze({
    id: 'security', slug: 'security', group: '智能与技术', productSection: '权限、安全与部署', name: '权限、安全与部署', shortName: '权限部署', status: 'config', icon: 'server',
    sourceType: 'E2', sourceReference: '00-menu-full-02.png、项目安全测试与部署文档', heroValue: '让不同园区、部门和岗位在明确权限与部署边界下使用同一套系统。',
    customerProblem: '不同角色的数据范围和操作责任不清，部署、备份与恢复边界缺少统一约定。', systemAction: '基于用户角色和项目资料配置访问范围；SaaS、私有化、服务器、数据库、网络与备份责任按交付条件分层确认。', businessValue: '支持组织协同与业务留痕，降低越权和部署责任不清带来的管理风险。',
    features: Object.freeze([
      config('用户和角色', '00-menu-full-02.png：角色管理'), config('园区权限', '00-menu-full-02.png：角色管理'), planned('部门权限'), planned('岗位权限'), planned('操作日志'), config('业务留痕', '现有页面列表与记录结构'), config('数据备份', 'docs/database-backup-restore.md', '频率与责任需项目确认'), config('数据恢复', 'docs/database-backup-restore.md', '需按受控流程验证'), config('AI数据边界', 'docs/website-requirements.md', '按项目和模型使用方式确认'), live('SaaS', '当前系统访问形态与实施文档'), integration('私有化部署', 'docs/deployment-runbook.md', '按服务器、数据库、网络、安全与运维责任评估'), integration('指定服务器', 'docs/deployment-runbook.md'), integration('指定数据库或网络环境', 'docs/deployment-runbook.md'), config('多园区隔离', '系统统计空间与角色菜单证据', '隔离范围需按组织和权限配置'),
    ]),
    roles: Object.freeze(['系统管理员', '园区负责人', 'IT / 信息化负责人']), relatedCapabilities: Object.freeze(['people', 'hardware', 'operations']), screenshots: Object.freeze([]),
    boundary: '不使用“银行级安全”“绝不丢失”等绝对表述；备份、恢复与私有化责任以项目方案为准。', cta: sharedCta,
    seoTitle: '园区系统权限安全与部署', seoDescription: '了解用户角色、权限、SaaS、私有化、备份与恢复边界。',
  }),
  Object.freeze({
    id: 'hardware', slug: 'hardware', group: '智能与技术', productSection: '软硬件接入', name: '软硬件接入', shortName: '硬件接入', status: 'integration', icon: 'cpu',
    sourceType: 'E2/E3', sourceReference: '00-menu-full-01.png 与产品规划资料', heroValue: '让现有设备与新系统在明确协议、安全和责任边界下逐步连接。',
    customerProblem: '园区设备品牌、协议和网络环境不一，直接承诺接入容易带来安全与交付风险。', systemAction: '先核对型号、API 或 SDK、网络、厂商配合和客户授权，再确定采集、联调和控制范围。', businessValue: '支持客户复用合适的现有设备，降低重复建设和接口不确定性。',
    features: Object.freeze([
      integration('智能水电表', '00-menu-full-01.png：智能水电表管理'), integration('门禁设备', '00-menu-full-01.png：门禁设备管理'), integration('视频监控', '00-menu-full-01.png：摄像头管理'), integration('能耗设备', '产品规划资料'), integration('推荐合作商设备', '产品规划资料'), integration('客户已有设备', '产品规划资料'), integration('混合接入', '产品规划资料'), integration('接口评估', '产品规划资料'), integration('设备联调', '产品规划资料'), integration('数据采集', '00-menu-full-01.png：边缘计算设备'), integration('控制能力评估', '产品规划资料'), integration('摄像头管理', '00-menu-full-01.png'), integration('边缘计算设备', '00-menu-full-01.png'),
    ]),
    roles: Object.freeze(['IT / 信息化负责人', '工程人员', '设备厂商']), relatedCapabilities: Object.freeze(['devices', 'access', 'security']), screenshots: Object.freeze([]),
    boundary: '最终接入范围取决于设备型号、协议、API 或 SDK、网络环境、厂商配合和客户授权；不承诺任何品牌一定可接入。', cta: sharedCta,
    seoTitle: '园区软硬件与第三方接口接入', seoDescription: '了解智能表计、门禁、视频、边缘设备和第三方接口的评估接入流程。',
  }),
])

export const capabilityFeatureIndex = Object.freeze(productCapabilities.flatMap(group => (
  group.features.map(item => Object.freeze({ ...item, groupId: group.id, groupName: group.name }))
)))

export const systemMenuAudit = Object.freeze([
  Object.freeze({ group: '工作台', module: '运营总览', items: ['运营总览'] }),
  Object.freeze({ group: '工作台', module: '数据地图', items: ['数据地图'] }),
  Object.freeze({ group: '业务模块', module: '设备管理', items: ['设备总览', '智能水电表管理', '摄像头管理', '门禁设备管理', '边缘计算设备'] }),
  Object.freeze({ group: '业务模块', module: '租赁', items: ['园区管理', '待租厂房', '租户管理', '合同管理'] }),
  Object.freeze({ group: '业务模块', module: '招商管理', items: ['房源管理', '招商客户', '跟进带看', '报价审批', '中介档案', '招商报表'] }),
  Object.freeze({ group: '业务模块', module: '人事', items: ['人事管理', '工资管理', '角色管理'] }),
  Object.freeze({ group: '业务模块', module: '财务', items: ['财务管理', '账单管理', '账期结转', '报销管理', '报销审核'] }),
  Object.freeze({ group: '业务模块', module: '门禁管理', items: ['车辆出入管理', '访客管理', '访客登记'] }),
  Object.freeze({ group: '业务模块', module: '维护管理', items: ['消防管理', '变压器管理', '电梯管理', '报修工单'] }),
])

export const megaMenuGroups = Object.freeze([
  Object.freeze({ name: '经营决策', items: ['operations'] }),
  Object.freeze({ name: '招商与租赁', items: ['assets', 'leasing-crm', 'contracts'] }),
  Object.freeze({ name: '账务与财务', items: ['billing'] }),
  Object.freeze({ name: '园区服务', items: ['maintenance', 'devices', 'access'] }),
  Object.freeze({ name: '组织协同', items: ['people'] }),
  Object.freeze({ name: '智能与技术', items: ['ai', 'security', 'hardware'] }),
])

export const operationValuePoints = Object.freeze([
  Object.freeze({ title: '提高出租率', text: '支持房源、招商、客户和合同信息协同，推动空置资产更早进入招商。', icon: 'building' }),
  Object.freeze({ title: '减少空置', text: '帮助管理层更早关注空置、到期与重新招商事项。', icon: 'search' }),
  Object.freeze({ title: '加快回款', text: '让应收、实收、待收和催缴进度更清楚，支持团队持续跟进。', icon: 'wallet' }),
  Object.freeze({ title: '降低遗漏', text: '把合同到期、未收租、报销和维护事项形成可追踪待办。', icon: 'clipboard' }),
  Object.freeze({ title: '提升协同', text: '让老板、招商、财务、物业、工程和人事围绕同一套数据工作。', icon: 'users' }),
  Object.freeze({ title: '控制风险', text: '支持关键状态与异常更早进入人员判断，不用个人记忆兜底。', icon: 'shield' }),
])

export const businessFlows = Object.freeze([
  Object.freeze({ id: 'revenue', name: '经营主线', description: '从资产招商到合同、账单和回款，再回到续租、退租与重新招商。', steps: ['assets', 'leasing-crm', 'contracts', 'billing'] }),
  Object.freeze({ id: 'service', name: '服务支线', description: '从设备与维护进入报修处理和历史沉淀。', steps: ['devices', 'maintenance'] }),
  Object.freeze({ id: 'organization', name: '组织支线', description: '从人员与考勤进入审批报销，并回到经营待办。', steps: ['people', 'operations'] }),
])

export const roleSolutions = Object.freeze([
  Object.freeze({ id: 'owner', name: '园区老板 / 股东', headline: '一屏看清出租、回款与关键待办', description: '关注空置、应收实收、合同到期、多园区汇总与风险提醒。', capabilities: ['operations', 'assets', 'contracts', 'billing', 'security'] }),
  Object.freeze({ id: 'leasing', name: '招商人员', headline: '让房源、客户和跟进过程连续衔接', description: '围绕房源状态、客户需求、跟进带看、报价和到期招商推进工作。', capabilities: ['assets', 'leasing-crm', 'contracts', 'ai'] }),
  Object.freeze({ id: 'finance', name: '财务人员', headline: '让合同规则、账单与回款口径更清楚', description: '关注账单、应收实收、待收、催缴、报销票据和审批状态。', capabilities: ['contracts', 'billing', 'people', 'operations'] }),
  Object.freeze({ id: 'property', name: '物业与工程人员', headline: '让报修、维护、设备与通行事项可追踪', description: '围绕工单、设备、巡检维保、能耗和门禁通行持续处理。', capabilities: ['maintenance', 'devices', 'access', 'hardware'] }),
  Object.freeze({ id: 'hr', name: '人事和主管', headline: '让人员、考勤、工资与审批协同', description: '关注人员档案、考勤异常、工资规则、审批报销和组织权限。', capabilities: ['people', 'security', 'operations'] }),
])

export const parkTypeSolutions = Object.freeze([
  Object.freeze({ name: '工业园区', text: '覆盖招商租赁、合同账单、园区服务、设备门禁与组织协同。', capabilities: ['operations', 'assets', 'leasing-crm', 'contracts', 'billing', 'maintenance'] }),
  Object.freeze({ name: '厂房', text: '围绕厂房资产、空置招商、租赁合同、账单回款和维修服务。', capabilities: ['assets', 'leasing-crm', 'contracts', 'billing', 'maintenance'] }),
  Object.freeze({ name: '仓库', text: '聚焦仓库资产出租经营，不延伸为库存或物流运输系统。', capabilities: ['assets', 'contracts', 'billing', 'maintenance'] }),
  Object.freeze({ name: '产业园', text: '按项目配置多类资产、招商、财务、服务与组织权限。', capabilities: ['operations', 'assets', 'leasing-crm', 'security'] }),
  Object.freeze({ name: '物流园', text: '可围绕资产租赁、车辆访客与园区服务进行项目评估。', capabilities: ['assets', 'access', 'maintenance', 'hardware'] }),
  Object.freeze({ name: '写字楼', text: '可按合同收费、客户服务和门禁条件评估适用范围。', capabilities: ['contracts', 'billing', 'maintenance', 'access'] }),
  Object.freeze({ name: '多园区经营', text: '根据组织、权限、数据隔离和汇总口径进行项目配置。', capabilities: ['operations', 'security', 'billing'] }),
])

export const managementProblems = Object.freeze([
  '资产房源散在多份表格，空置变化不能及时同步',
  '招商线索和跟进记录留在个人微信，交接容易中断',
  '合同到期、递增和续退租依赖个人记忆',
  '账单、收款和欠费口径分散，漏账漏催难以及时发现',
  '报修与维护靠群消息推进，责任和进度不清楚',
  '设备、水电与维保记录分散，异常追溯费时',
  '车辆、访客和门禁权限线下登记，记录难统一',
  '考勤、工资和审批分散处理，主管重复催办',
  '老板临时要数时仍要找多人拼表，判断不够及时',
])

export function getCapability(id) {
  return productCapabilities.find(item => item.id === id)
}

export function getStatusMeta(status) {
  return capabilityStatuses[status] || capabilityStatuses.planned
}
