export const systemModuleGroups = [
  {
    group: '工作台',
    items: [
      {
        key: 'operation-overview',
        label: '运营总览',
        icon: 'chart',
        active: true,
        pageVerified: true,
        summary: '汇总累计应收、累计实收、待收余额、在租面积与待办事项。',
      },
      {
        key: 'data-map',
        label: '数据地图',
        icon: 'network',
        pageVerified: false,
        summary: '真实系统菜单已确认；具体页面内容将在完成页面溯源后展示。',
      },
    ],
  },
  {
    group: '业务模块',
    items: [
      {
        key: 'device-management',
        label: '设备管理',
        icon: 'cpu',
        pageVerified: false,
        summary: '真实系统菜单已确认；具体页面内容将在完成页面溯源后展示。',
      },
      {
        key: 'leasing',
        label: '租赁',
        icon: 'building',
        pageVerified: true,
        summary: '已核实合同管理页面，可查看合同主体、状态、到期情况与在租面积。',
      },
      {
        key: 'leasing-management',
        label: '招商管理',
        icon: 'search',
        pageVerified: true,
        summary: '已核实招商客户与客户详情页面，可查看筛选、阶段、需求及跟进区域。',
      },
      {
        key: 'human-resources',
        label: '人事',
        icon: 'users',
        pageVerified: false,
        summary: '真实系统菜单已确认；具体页面内容将在完成页面溯源后展示。',
      },
      {
        key: 'finance',
        label: '财务',
        icon: 'wallet',
        pageVerified: true,
        summary: '已核实账单管理页面，可查看应收、实收、未收与收款状态。',
      },
      {
        key: 'access-control',
        label: '门禁管理',
        icon: 'shield',
        pageVerified: false,
        summary: '真实系统菜单已确认；具体页面内容将在完成页面溯源后展示。',
      },
      {
        key: 'maintenance',
        label: '维护管理',
        icon: 'wrench',
        pageVerified: true,
        summary: '已核实报修工单页面，可按条件查询并查看工单处理状态。',
      },
    ],
  },
]

export const systemModules = systemModuleGroups.flatMap(({ group, items }) => (
  items.map(item => ({ ...item, group }))
))
