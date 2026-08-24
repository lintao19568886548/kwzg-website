const demoRecord = value => Object.freeze({ ...value, isDemo: true })

const receivable = 126.8
const received = 118.6
const outstanding = 8.2
const rentableArea = 33600
const leasedArea = 28560
const vacantArea = 5040

export const publicSystemDemoData = Object.freeze({
  meta: Object.freeze({
    parkName: '智造云谷示范园（演示）',
    period: '2026年8月（演示）',
    label: '真实系统界面 · 演示数据',
    badge: '演示数据',
    watermark: 'DEMO · 演示数据',
    privacyNotice: '本页面使用安全演示数据，不代表任何真实园区经营情况。',
    footerNotice: '界面结构与功能来自瞰维智管，数字和名称均为安全演示数据。',
  }),
  overview: Object.freeze({
    parkName: '智造云谷示范园（演示）',
    period: '2026年8月（演示）',
    rentableArea,
    leasedArea,
    vacantArea,
    occupancyRate: 85,
    receivable,
    received,
    outstanding,
    collectionRate: 93.5,
    leasedCustomers: 42,
    uniqueTaskTotal: 10,
  }),
  tasks: Object.freeze([
    demoRecord({ id: 'unpaid-rent', title: '未收租提醒', description: '存在余额的应收账单', count: 3 }),
    demoRecord({ id: 'contract-expiry', title: '合同到期提醒', description: '90天内到期合同', count: 2 }),
    demoRecord({ id: 'reimbursement', title: '待处理报销', description: '等待审批或复核', count: 1 }),
    demoRecord({ id: 'vacant-property', title: '空置厂房', description: '待招商房源', count: 2 }),
    demoRecord({ id: 'maintenance-order', title: '维护工单', description: '处理中或待验收', count: 2 }),
    demoRecord({ id: 'attendance', title: '考勤异常', description: '等待主管确认', count: 2 }),
  ]),
  buildings: Object.freeze([
    demoRecord({ id: 'A1', name: 'A1栋', rentableArea: 12000, leasedArea: 10200, vacantArea: 1800, occupancyRate: 85, floors: 4, rentalStatus: '部分空置', deviceStatus: '正常' }),
    demoRecord({ id: 'A2', name: 'A2栋', rentableArea: 9600, leasedArea: 7860, vacantArea: 1740, occupancyRate: 81.9, floors: 3, rentalStatus: '招商中', deviceStatus: '正常' }),
    demoRecord({ id: 'B1', name: 'B1栋', rentableArea: 12000, leasedArea: 10500, vacantArea: 1500, occupancyRate: 87.5, floors: 5, rentalStatus: '部分空置', deviceStatus: '正常' }),
  ]),
  equipment: Object.freeze({
    summary: Object.freeze({ total: 86, sensors: 81, controllers: 5, online: 84, normal: 83 }),
    primary: demoRecord({
      code: 'DEMO-TF-A1-01',
      name: 'A1栋1号变压器（演示）',
      type: '变压器',
      capacity: '800kVA',
      area: 'A1栋配电房',
      onlineStatus: '在线',
      runningStatus: '正常',
      lastInspection: '2026-08-18 09:20',
      nextInspection: '2026-08-25',
      owner: '设备管理员A（演示角色）',
    }),
    categories: Object.freeze([
      demoRecord({ name: '智能电表', count: 42, status: '在线' }),
      demoRecord({ name: '智能水表', count: 36, status: '在线' }),
      demoRecord({ name: '货梯', count: 2, status: '正常' }),
      demoRecord({ name: '消防设施', count: 4, status: '正常' }),
      demoRecord({ name: '门禁控制器', count: 2, status: '在线' }),
    ]),
  }),
  leasing: Object.freeze([
    demoRecord({
      id: 'leased',
      label: '在租房源',
      propertyCode: 'DEMO-A1-101',
      propertyType: '标准厂房',
      area: 2400,
      status: '在租',
      tenant: '精密制造租户A（演示）',
      contractCode: 'DEMO-LEASE-2026-001',
      billingMethod: '按面积计租',
      contractTerm: '2026-01-01 至 2027-12-31',
      nextBillingDate: '2026-09-01',
    }),
    demoRecord({
      id: 'vacant',
      label: '空置房源',
      propertyCode: 'DEMO-A2-306',
      propertyType: '标准厂房',
      area: 1740,
      status: '待租',
      leasingStatus: '推广中',
      viewingStatus: '可预约',
    }),
    demoRecord({
      id: 'expiring',
      label: '即将到期',
      propertyCode: 'DEMO-B1-208',
      propertyType: '标准厂房',
      area: 1500,
      status: '在租',
      contractStatus: '90天内到期',
      renewalStatus: '待确认',
    }),
  ]),
  investment: Object.freeze({
    lead: demoRecord({
      customerCode: 'DEMO-LEAD-026',
      projectName: '新能源汽车零部件项目（演示）',
      contact: '项目负责人A（演示角色）',
      phone: '188****0001（演示）',
      source: '官网预约',
      intendedArea: '3,000–4,000㎡',
      intendedRegion: 'A区',
      stage: '已带看',
      grade: '重点跟进',
      owner: '招商经理A（演示角色）',
      lastFollowUp: '2026-08-18',
      nextPlan: '发送报价方案',
      planDate: '2026-08-20',
      signed: false,
    }),
    stages: Object.freeze(['新线索', '已联系', '已带看', '已报价', '意向确认']),
  }),
  humanResources: Object.freeze({
    employee: demoRecord({
      code: 'DEMO-E013',
      displayName: '园区经理A（演示角色）',
      department: '园区运营部',
      position: '园区经理',
      employmentStatus: '在职',
      attendanceToday: '正常',
    }),
    stats: Object.freeze({ activeEmployees: 36, presentToday: 32, leaveToday: 2, attendanceExceptions: 2, pendingReimbursements: 1 }),
  }),
  finance: Object.freeze({
    receivable,
    received,
    outstanding,
    collectionRate: 93.5,
    bills: Object.freeze([
      demoRecord({ tenant: '精密制造租户A（演示）', contractCode: 'DEMO-LEASE-2026-001', billCode: 'DEMO-BILL-2026-0801', feeMonth: '2026-08', dueDate: '2026-08-05', receivable: 45, received: 45, outstanding: 0, paymentStatus: '已收清', writeOffStatus: '已核销', reminderStatus: '无需催缴' }),
      demoRecord({ tenant: '新材料租户B（演示）', contractCode: 'DEMO-LEASE-2026-002', billCode: 'DEMO-BILL-2026-0802', feeMonth: '2026-08', dueDate: '2026-08-05', receivable: 38, received: 30, outstanding: 8, paymentStatus: '部分收款', writeOffStatus: '部分核销', reminderStatus: '待跟进' }),
      demoRecord({ tenant: '仓储物流租户C（演示）', contractCode: 'DEMO-LEASE-2026-003', billCode: 'DEMO-BILL-2026-0803', feeMonth: '2026-08', dueDate: '2026-08-08', receivable: 26.8, received: 26.8, outstanding: 0, paymentStatus: '已收清', writeOffStatus: '已核销', reminderStatus: '无需催缴' }),
      demoRecord({ tenant: '装备制造租户D（演示）', contractCode: 'DEMO-LEASE-2026-004', billCode: 'DEMO-BILL-2026-0804', feeMonth: '2026-08', dueDate: '2026-08-10', receivable: 17, received: 16.8, outstanding: 0.2, paymentStatus: '部分收款', writeOffStatus: '部分核销', reminderStatus: '已提醒' }),
    ]),
  }),
  access: Object.freeze({
    employeeRecord: demoRecord({
      recordCode: 'DEMO-ACCESS-0818-007',
      personTag: '租户员工T023（演示标识）',
      personType: '租户员工',
      tenant: '精密制造租户A（演示）',
      accessPoint: 'A1栋东门',
      accessTime: '2026-08-18 10:26',
      verification: '员工授权',
      result: '正常通行',
    }),
    visitorRecord: demoRecord({
      visitorName: '访客V007（演示标识）',
      visitTarget: '精密制造租户A（演示）',
      vehicle: '演示车辆02',
      plate: '粤S·D***8',
      status: '已授权',
    }),
  }),
  maintenance: Object.freeze({
    order: demoRecord({
      orderCode: 'DEMO-WO-260818-003',
      source: '租户报修',
      location: 'A1栋101单元',
      issueType: '照明回路故障',
      urgency: '一般',
      status: '处理中',
      assignee: '维修技工A（演示角色）',
      submittedAt: '2026-08-18 09:10',
      respondedAt: '2026-08-18 09:18',
      plannedCompletion: '2026-08-18 11:30',
      propertyCode: 'DEMO-A1-101',
      tenant: '精密制造租户A（演示）',
      relatedDevice: 'A1栋照明配电回路（演示）',
    }),
    stages: Object.freeze(['已提交', '已接单', '处理中', '待验收', '已完成']),
  }),
})

export const publicSystemModuleIds = Object.freeze([
  'operations',
  'data-map',
  'equipment',
  'leasing',
  'investment',
  'human-resources',
  'finance',
  'access-control',
  'maintenance',
])

export function formatDemoNumber(value, digits = 0) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
