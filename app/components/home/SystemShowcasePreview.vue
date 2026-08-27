<script setup>
import { computed } from 'vue'
import { formatDemoNumber, publicSystemDemoData } from '~/data/public-system-demo-data'

const props = defineProps({
  module: { type: Object, required: true },
  modal: { type: Boolean, default: false },
})

defineEmits(['expand'])

const demo = publicSystemDemoData
const moduleId = computed(() => props.module.id)
const isOriginalScreenshot = computed(() => moduleId.value === 'data-map' && Boolean(props.module.image))
const money = value => `${Number(value).toFixed(1)}万`
const area = value => `${formatDemoNumber(value)}㎡`

const overviewMetrics = computed(() => [
  { label: '累计应收', value: `${money(demo.overview.receivable)}元` },
  { label: '累计实收', value: `${money(demo.overview.received)}元` },
  { label: '待收余额', value: `${money(demo.overview.outstanding)}元`, tone: 'red' },
  { label: '回款率', value: `${demo.overview.collectionRate.toFixed(1)}%` },
  { label: '可租面积', value: area(demo.overview.rentableArea) },
  { label: '在租面积', value: area(demo.overview.leasedArea) },
  { label: '空置面积', value: area(demo.overview.vacantArea), tone: 'red' },
  { label: '出租率', value: `${demo.overview.occupancyRate.toFixed(1)}%` },
  { label: '在租客户', value: `${demo.overview.leasedCustomers}家` },
])

const equipmentFields = computed(() => [
  ['设备编号', demo.equipment.primary.code],
  ['设备名称', demo.equipment.primary.name],
  ['设备类型', demo.equipment.primary.type],
  ['额定容量', demo.equipment.primary.capacity],
  ['所属区域', demo.equipment.primary.area],
  ['在线状态', demo.equipment.primary.onlineStatus],
  ['运行状态', demo.equipment.primary.runningStatus],
  ['最近巡检', demo.equipment.primary.lastInspection],
  ['下次巡检', demo.equipment.primary.nextInspection],
  ['负责人', demo.equipment.primary.owner],
])

const investmentFields = computed(() => [
  ['客户编号', demo.investment.lead.customerCode],
  ['项目名称', demo.investment.lead.projectName],
  ['联系人', demo.investment.lead.contact],
  ['联系方式', demo.investment.lead.phone],
  ['线索来源', demo.investment.lead.source],
  ['意向面积', demo.investment.lead.intendedArea],
  ['意向区域', demo.investment.lead.intendedRegion],
  ['客户阶段', demo.investment.lead.stage],
  ['客户等级', demo.investment.lead.grade],
  ['招商负责人', demo.investment.lead.owner],
  ['最近跟进', demo.investment.lead.lastFollowUp],
  ['下一步计划', `${demo.investment.lead.nextPlan} · ${demo.investment.lead.planDate}`],
])

const employeeFields = computed(() => [
  ['员工编号', demo.humanResources.employee.code],
  ['员工显示名称', demo.humanResources.employee.displayName],
  ['所属部门', demo.humanResources.employee.department],
  ['岗位', demo.humanResources.employee.position],
  ['在职状态', demo.humanResources.employee.employmentStatus],
  ['今日考勤', demo.humanResources.employee.attendanceToday],
])

const maintenanceFields = computed(() => [
  ['工单编号', demo.maintenance.order.orderCode],
  ['报修来源', demo.maintenance.order.source],
  ['报修位置', demo.maintenance.order.location],
  ['问题类型', demo.maintenance.order.issueType],
  ['紧急程度', demo.maintenance.order.urgency],
  ['当前状态', demo.maintenance.order.status],
  ['处理人员', demo.maintenance.order.assignee],
  ['提交时间', demo.maintenance.order.submittedAt],
  ['响应时间', demo.maintenance.order.respondedAt],
  ['计划完成', demo.maintenance.order.plannedCompletion],
])

const compactFields = computed(() => ({
  operations: [
    ['累计应收', `${money(demo.overview.receivable)}元`],
    ['累计实收', `${money(demo.overview.received)}元`],
    ['待收余额', `${money(demo.overview.outstanding)}元`, 'alert'],
    ['在租面积', area(demo.overview.leasedArea)],
    ['回款率', `${demo.overview.collectionRate.toFixed(1)}%`],
    ['经营待办', `${demo.overview.uniqueTaskTotal}项`],
  ],
  'data-map': [
    ['园区楼栋', `${demo.buildings.length}栋`],
    ['可租面积', area(demo.overview.rentableArea)],
    ['在租面积', area(demo.overview.leasedArea)],
    ['空置面积', area(demo.overview.vacantArea), 'alert'],
    ['出租率', `${demo.overview.occupancyRate.toFixed(1)}%`],
    ['设备状态', demo.buildings[0].deviceStatus, 'ok'],
  ],
  equipment: [
    ['设备总数', `${demo.equipment.summary.total}台`],
    ['传感器', `${demo.equipment.summary.sensors}台`],
    ['执行终端', `${demo.equipment.summary.controllers}台`],
    ['在线设备', `${demo.equipment.summary.online}台`, 'ok'],
    ['设备类型', demo.equipment.primary.type],
    ['运行状态', demo.equipment.primary.runningStatus, 'ok'],
  ],
  leasing: [
    ['在租房源', `${area(demo.leasing[0].area)} · ${demo.leasing[0].status}`, 'ok'],
    ['空置房源', `${area(demo.leasing[1].area)} · ${demo.leasing[1].status}`, 'alert'],
    ['即将到期', `${area(demo.leasing[2].area)} · ${demo.leasing[2].contractStatus}`],
    ['计租方式', demo.leasing[0].billingMethod],
    ['下次账单日', demo.leasing[0].nextBillingDate],
    ['续租状态', demo.leasing[2].renewalStatus],
  ],
  investment: [
    ['项目名称', demo.investment.lead.projectName],
    ['线索来源', demo.investment.lead.source],
    ['意向面积', demo.investment.lead.intendedArea],
    ['客户阶段', demo.investment.lead.stage, 'ok'],
    ['客户等级', demo.investment.lead.grade],
    ['下一步计划', demo.investment.lead.nextPlan],
  ],
  'human-resources': [
    ['在职员工', `${demo.humanResources.stats.activeEmployees}人`],
    ['今日出勤', `${demo.humanResources.stats.presentToday}人`, 'ok'],
    ['今日请假', `${demo.humanResources.stats.leaveToday}人`],
    ['考勤异常', `${demo.humanResources.stats.attendanceExceptions}人`, 'alert'],
    ['所属部门', demo.humanResources.employee.department],
    ['在职状态', demo.humanResources.employee.employmentStatus, 'ok'],
  ],
  finance: [
    ['累计应收', money(demo.finance.receivable)],
    ['累计实收', money(demo.finance.received)],
    ['待收余额', money(demo.finance.outstanding), 'alert'],
    ['回款率', `${demo.finance.collectionRate.toFixed(1)}%`],
    ['演示账单', `${demo.finance.bills.length}条`],
    ['核销状态', demo.finance.bills[0].writeOffStatus, 'ok'],
  ],
  'access-control': [
    ['门禁点', demo.access.employeeRecord.accessPoint],
    ['人员类型', demo.access.employeeRecord.personType],
    ['验证方式', demo.access.employeeRecord.verification],
    ['通行结果', demo.access.employeeRecord.result, 'ok'],
    ['访客状态', demo.access.visitorRecord.status, 'ok'],
    ['车辆标识', demo.access.visitorRecord.vehicle],
  ],
  maintenance: [
    ['问题类型', demo.maintenance.order.issueType],
    ['报修位置', demo.maintenance.order.location],
    ['紧急程度', demo.maintenance.order.urgency],
    ['当前状态', demo.maintenance.order.status, 'ok'],
    ['提交时间', demo.maintenance.order.submittedAt],
    ['处理人员', demo.maintenance.order.assignee],
  ],
})[moduleId.value] || [])
</script>

<template>
  <figure
    class="kw-demo-interface"
    :class="[`kw-demo-interface--${moduleId}`, { 'is-modal': modal }]"
    :aria-label="isOriginalScreenshot ? `${module.name}真实系统数据界面` : `${module.name}安全演示数据界面`"
  >
    <div v-if="isOriginalScreenshot" class="kw-demo-interface__original-screenshot">
      <img
        :src="module.image"
        :alt="module.imageAlt || `${module.name}真实系统界面`"
        width="1904"
        height="942"
        :loading="modal ? 'eager' : 'lazy'"
        decoding="async"
      >
    </div>

    <template v-else>
      <header class="kw-demo-interface__chrome">
        <div class="kw-demo-interface__dots" aria-hidden="true"><i /><i /><i /></div>
        <div class="kw-demo-interface__identity">
          <small>{{ demo.overview.parkName }}</small>
          <strong>{{ module.name }}</strong>
        </div>
        <span class="kw-demo-interface__label" :title="demo.meta.privacyNotice">{{ demo.meta.label }}</span>
      </header>

      <div class="kw-demo-interface__body">
        <aside class="kw-demo-interface__sidebar" aria-label="系统模块导航示意">
          <strong>园区运营工作台</strong>
          <span>运营总览</span><span>数据地图</span><span>设备管理</span><span>租赁</span><span>招商管理</span><span>人事</span><span>财务</span><span>门禁管理</span><span>维护管理</span>
        </aside>

        <section class="kw-demo-interface__workspace">
          <div class="kw-demo-interface__heading">
            <div><small>工作台 / {{ module.name }}</small><h4>{{ module.name }}</h4></div>
            <span>{{ demo.overview.period }}</span>
          </div>

          <template v-if="!modal">
            <div class="kw-demo-compact-grid">
              <article
                v-for="field in compactFields"
                :key="field[0]"
                :class="{ 'is-alert': field[2] === 'alert', 'is-ok': field[2] === 'ok' }"
              >
                <span>{{ field[0] }}</span>
                <strong>{{ field[1] }}</strong>
                <small>安全演示数据</small>
              </article>
            </div>
            <p class="kw-demo-inline-note">当前预览仅保留 6 个关键字段；查看高清界面可阅读完整演示结构。</p>
          </template>

        <template v-else-if="moduleId === 'operations'">
          <div class="kw-demo-stat-grid kw-demo-stat-grid--overview">
            <article v-for="item in overviewMetrics" :key="item.label" :class="{ 'is-alert': item.tone === 'red' }"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>演示口径</small></article>
          </div>
          <div class="kw-demo-split">
            <section class="kw-demo-card">
              <div class="kw-demo-card__title"><strong>经营回款</strong><span>应收 / 实收 / 待收</span></div>
              <div class="kw-demo-bar-list">
                <div><span>累计应收</span><i><b style="width:100%" /></i><strong>{{ money(demo.overview.receivable) }}</strong></div>
                <div><span>累计实收</span><i><b :style="{ width: `${demo.overview.collectionRate}%` }" /></i><strong>{{ money(demo.overview.received) }}</strong></div>
                <div class="is-alert"><span>待收余额</span><i><b :style="{ width: `${100 - demo.overview.collectionRate}%` }" /></i><strong>{{ money(demo.overview.outstanding) }}</strong></div>
              </div>
              <p>回款率 <strong>{{ demo.overview.collectionRate.toFixed(1) }}%</strong></p>
            </section>
            <section class="kw-demo-card">
              <div class="kw-demo-card__title"><strong>经营待办</strong><span>{{ demo.overview.uniqueTaskTotal }}项（去重）</span></div>
              <ul class="kw-demo-task-list"><li v-for="task in demo.tasks" :key="task.id"><span>{{ task.title }}</span><small>{{ task.description }}</small><strong>{{ task.count }}</strong></li></ul>
            </section>
          </div>
        </template>

        <template v-else-if="moduleId === 'data-map'">
          <div class="kw-demo-map" aria-label="园区楼栋示意地图，不包含真实坐标">
            <article v-for="(building, index) in demo.buildings" :key="building.id" :class="`is-building-${index + 1}`">
              <span>{{ building.name }}</span><strong>{{ area(building.rentableArea) }}</strong><small>{{ building.floors }}层 · {{ building.deviceStatus }}</small>
            </article>
            <div class="kw-demo-map__road" aria-hidden="true">园区内部道路 · 演示示意</div>
          </div>
          <div class="kw-demo-table-wrap">
            <table class="kw-demo-table"><thead><tr><th>楼栋</th><th>可租面积</th><th>在租面积</th><th>空置面积</th><th>出租率</th><th>出租状态</th><th>设备状态</th></tr></thead><tbody><tr v-for="building in demo.buildings" :key="building.id"><td data-label="楼栋">{{ building.name }}</td><td data-label="可租面积">{{ area(building.rentableArea) }}</td><td data-label="在租面积">{{ area(building.leasedArea) }}</td><td data-label="空置面积">{{ area(building.vacantArea) }}</td><td data-label="出租率">{{ building.occupancyRate.toFixed(1) }}%</td><td data-label="出租状态"><span class="kw-demo-status">{{ building.rentalStatus }}</span></td><td data-label="设备状态"><span class="kw-demo-status is-ok">{{ building.deviceStatus }}</span></td></tr></tbody></table>
          </div>
          <p class="kw-demo-inline-note">仅展示楼栋、楼层、面积、出租状态和设备状态，不包含真实门牌号、坐标或GIS定位。</p>
        </template>

        <template v-else-if="moduleId === 'equipment'">
          <div class="kw-demo-stat-grid kw-demo-stat-grid--five"><article><span>设备总数</span><strong>{{ demo.equipment.summary.total }}</strong><small>演示台账</small></article><article><span>传感器</span><strong>{{ demo.equipment.summary.sensors }}</strong><small>演示台账</small></article><article><span>执行终端</span><strong>{{ demo.equipment.summary.controllers }}</strong><small>演示台账</small></article><article><span>在线设备</span><strong>{{ demo.equipment.summary.online }}</strong><small>演示状态</small></article><article><span>运行正常</span><strong>{{ demo.equipment.summary.normal }}</strong><small>演示状态</small></article></div>
          <section class="kw-demo-card"><div class="kw-demo-card__title"><strong>设备详情</strong><span class="kw-demo-status is-ok">{{ demo.equipment.primary.onlineStatus }} · {{ demo.equipment.primary.runningStatus }}</span></div><dl class="kw-demo-detail-grid"><div v-for="field in equipmentFields" :key="field[0]"><dt>{{ field[0] }}</dt><dd>{{ field[1] }}</dd></div></dl></section>
          <div class="kw-demo-device-list"><article v-for="item in demo.equipment.categories" :key="item.name"><strong>{{ item.name }}</strong><span>{{ item.count }}台</span><small>{{ item.status }}</small></article></div>
        </template>

        <template v-else-if="moduleId === 'leasing'">
          <div class="kw-demo-toolbar"><span>房源编号 / 楼栋 / 状态</span><button type="button" tabindex="-1">全部状态</button><button type="button" tabindex="-1">查询</button></div>
          <div class="kw-demo-record-grid kw-demo-record-grid--three"><article v-for="record in demo.leasing" :key="record.id" class="kw-demo-card"><div class="kw-demo-card__title"><strong>{{ record.label }}</strong><span class="kw-demo-status" :class="{ 'is-ok': record.status === '在租' }">{{ record.status }}</span></div><dl class="kw-demo-detail-list"><div><dt>房源编号</dt><dd>{{ record.propertyCode }}</dd></div><div><dt>房源类型</dt><dd>{{ record.propertyType }}</dd></div><div><dt>建筑面积</dt><dd>{{ area(record.area) }}</dd></div><div v-if="record.tenant"><dt>租户</dt><dd>{{ record.tenant }}</dd></div><div v-if="record.contractCode"><dt>合同编号</dt><dd>{{ record.contractCode }}</dd></div><div v-if="record.billingMethod"><dt>计租方式</dt><dd>{{ record.billingMethod }}</dd></div><div v-if="record.contractTerm"><dt>合同期限</dt><dd>{{ record.contractTerm }}</dd></div><div v-if="record.nextBillingDate"><dt>下次账单日</dt><dd>{{ record.nextBillingDate }}</dd></div><div v-if="record.leasingStatus"><dt>招商状态</dt><dd>{{ record.leasingStatus }}</dd></div><div v-if="record.viewingStatus"><dt>可带看状态</dt><dd>{{ record.viewingStatus }}</dd></div><div v-if="record.contractStatus"><dt>合同状态</dt><dd>{{ record.contractStatus }}</dd></div><div v-if="record.renewalStatus"><dt>续租状态</dt><dd>{{ record.renewalStatus }}</dd></div></dl></article></div>
        </template>

        <template v-else-if="moduleId === 'investment'">
          <div class="kw-demo-flow" aria-label="招商线索阶段"><span v-for="stage in demo.investment.stages" :key="stage" :class="{ 'is-current': stage === demo.investment.lead.stage }">{{ stage }}</span></div>
          <section class="kw-demo-card"><div class="kw-demo-card__title"><strong>招商客户详情</strong><span class="kw-demo-status">{{ demo.investment.lead.grade }}</span></div><dl class="kw-demo-detail-grid"><div v-for="field in investmentFields" :key="field[0]"><dt>{{ field[0] }}</dt><dd>{{ field[1] }}</dd></div></dl></section>
          <p class="kw-demo-inline-note">该演示线索尚未签约，不计入在租客户或财务账单。</p>
        </template>

        <template v-else-if="moduleId === 'human-resources'">
          <div class="kw-demo-stat-grid kw-demo-stat-grid--five"><article><span>在职员工</span><strong>{{ demo.humanResources.stats.activeEmployees }}人</strong><small>演示统计</small></article><article><span>今日出勤</span><strong>{{ demo.humanResources.stats.presentToday }}人</strong><small>演示统计</small></article><article><span>请假</span><strong>{{ demo.humanResources.stats.leaveToday }}人</strong><small>演示统计</small></article><article class="is-alert"><span>考勤异常</span><strong>{{ demo.humanResources.stats.attendanceExceptions }}人</strong><small>演示统计</small></article><article><span>待处理报销</span><strong>{{ demo.humanResources.stats.pendingReimbursements }}项</strong><small>演示统计</small></article></div>
          <section class="kw-demo-card"><div class="kw-demo-card__title"><strong>员工档案</strong><span class="kw-demo-status is-ok">{{ demo.humanResources.employee.employmentStatus }}</span></div><dl class="kw-demo-detail-grid"><div v-for="field in employeeFields" :key="field[0]"><dt>{{ field[0] }}</dt><dd>{{ field[1] }}</dd></div></dl></section>
          <p class="kw-demo-inline-note">仅使用岗位化演示标识，不展示个人照片、证件、银行卡、工资明细或轨迹。</p>
        </template>

        <template v-else-if="moduleId === 'finance'">
          <div class="kw-demo-stat-grid"><article><span>累计应收</span><strong>{{ money(demo.finance.receivable) }}</strong><small>演示账单合计</small></article><article><span>累计实收</span><strong>{{ money(demo.finance.received) }}</strong><small>演示账单合计</small></article><article class="is-alert"><span>待收余额</span><strong>{{ money(demo.finance.outstanding) }}</strong><small>演示账单合计</small></article><article><span>回款率</span><strong>{{ demo.finance.collectionRate.toFixed(1) }}%</strong><small>演示口径</small></article></div>
          <div class="kw-demo-table-wrap"><table class="kw-demo-table"><thead><tr><th>演示租户</th><th>账单编号</th><th>合同编号</th><th>费用月份</th><th>应收日期</th><th>应收</th><th>实收</th><th>待收</th><th>收款 / 核销 / 催缴</th></tr></thead><tbody><tr v-for="bill in demo.finance.bills" :key="bill.billCode"><td data-label="演示租户">{{ bill.tenant }}</td><td data-label="账单编号">{{ bill.billCode }}</td><td data-label="合同编号">{{ bill.contractCode }}</td><td data-label="费用月份">{{ bill.feeMonth }}</td><td data-label="应收日期">{{ bill.dueDate }}</td><td data-label="应收">{{ money(bill.receivable) }}</td><td data-label="实收">{{ money(bill.received) }}</td><td data-label="待收">{{ money(bill.outstanding) }}</td><td data-label="状态"><span class="kw-demo-status">{{ bill.paymentStatus }}</span> {{ bill.writeOffStatus }} · {{ bill.reminderStatus }}</td></tr></tbody></table></div>
        </template>

        <template v-else-if="moduleId === 'access-control'">
          <div class="kw-demo-toolbar"><span>通行时间 / 门禁点 / 人员类型</span><button type="button" tabindex="-1">全部状态</button><button type="button" tabindex="-1">查询</button></div>
          <div class="kw-demo-record-grid"><section class="kw-demo-card"><div class="kw-demo-card__title"><strong>人员通行记录</strong><span class="kw-demo-status is-ok">{{ demo.access.employeeRecord.result }}</span></div><dl class="kw-demo-detail-list"><div v-for="(value, key) in demo.access.employeeRecord" v-show="key !== 'isDemo'" :key="key"><dt>{{ ({ recordCode:'记录编号',personTag:'人员标识',personType:'人员类型',tenant:'所属租户',accessPoint:'门禁点',accessTime:'通行时间',verification:'验证方式',result:'通行结果' })[key] }}</dt><dd>{{ value }}</dd></div></dl></section><section class="kw-demo-card"><div class="kw-demo-card__title"><strong>访客记录</strong><span class="kw-demo-status">{{ demo.access.visitorRecord.status }}</span></div><dl class="kw-demo-detail-list"><div v-for="(value, key) in demo.access.visitorRecord" v-show="key !== 'isDemo'" :key="key"><dt>{{ ({ visitorName:'访客名称',visitTarget:'访问对象',vehicle:'车辆',plate:'车牌',status:'通行状态' })[key] }}</dt><dd>{{ value }}</dd></div></dl></section></div>
          <p class="kw-demo-inline-note">不展示人脸、真实姓名、真实手机号、完整车牌或精确人员轨迹。</p>
        </template>

        <template v-else-if="moduleId === 'maintenance'">
          <div class="kw-demo-flow" aria-label="工单处理阶段"><span v-for="stage in demo.maintenance.stages" :key="stage" :class="{ 'is-current': stage === demo.maintenance.order.status }">{{ stage }}</span></div>
          <section class="kw-demo-card"><div class="kw-demo-card__title"><strong>报修工单详情</strong><span class="kw-demo-status">{{ demo.maintenance.order.status }}</span></div><dl class="kw-demo-detail-grid"><div v-for="field in maintenanceFields" :key="field[0]"><dt>{{ field[0] }}</dt><dd>{{ field[1] }}</dd></div></dl></section>
          <div class="kw-demo-linkage"><span>关联房源 <strong>{{ demo.maintenance.order.propertyCode }}</strong></span><span>关联租户 <strong>{{ demo.maintenance.order.tenant }}</strong></span><span>关联设备 <strong>{{ demo.maintenance.order.relatedDevice }}</strong></span></div>
        </template>
      </section>
    </div>

    <div class="kw-demo-interface__watermark" aria-hidden="true">{{ demo.meta.watermark }}</div>
    </template>
    <figcaption>{{ isOriginalScreenshot ? '经用户授权原样展示真实数据地图页面与当前业务数据。' : demo.meta.footerNotice }}</figcaption>
    <button
      v-if="!modal"
      class="kw-demo-interface__expand"
      type="button"
      :aria-label="isOriginalScreenshot ? `查看${module.name}高清真实界面` : `查看${module.name}高清演示界面`"
      @click="$emit('expand')"
    >
      {{ isOriginalScreenshot ? '查看高清原图' : '查看高清界面' }} <span aria-hidden="true">↗</span>
    </button>
  </figure>
</template>
