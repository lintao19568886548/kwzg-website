<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const leasingStages = [
  ['跟进中', '12'],
  ['新客户', '4'],
  ['需求确认', '3'],
  ['已推荐房源', '2'],
  ['已带看', '2'],
  ['报价谈判', '1'],
  ['已签约', '1'],
]

const detailFields = [
  '需求面积',
  '租金预算',
  '使用用途',
  '预计入驻',
  '需求功率',
  '层高 / 承重要求',
  '下次跟进',
  '最近跟进',
]

const contractStates = [
  ['合同主体', '18'],
  ['生效中', '12'],
  ['90 天内到期', '3'],
  ['已过期', '3'],
  ['在租面积', '28,600 ㎡'],
]

const billStates = [
  ['总体回款率', '86%'],
  ['未收敞口', '8.2 万'],
  ['应收总额', '126.8 万'],
  ['实收总额', '118.6 万'],
  ['当前筛选未收', '3.2 万'],
  ['多收金额', '0.6 万'],
]
</script>

<template>
  <div class="kw-interface-source">
    <div class="kw-interface" :class="`kw-interface--${type}`">
      <div class="kw-interface__chrome">
        <div class="kw-interface__dots" aria-hidden="true"><i /><i /><i /></div>
        <strong>{{ title }}</strong>
        <UiBaseTag tone="demo">演示数据</UiBaseTag>
      </div>

      <div v-if="type === 'leasing-list'" class="kw-source-ui">
        <div class="kw-source-heading">
          <div><span>招商管理</span><h4>招商客户</h4></div>
          <span class="kw-source-action">新建客户</span>
        </div>
        <div class="kw-source-stats kw-source-stats--leasing">
          <div v-for="item in leasingStages" :key="item[0]">
            <span>{{ item[0] }}</span><strong>{{ item[1] }}</strong><small>演示统计</small>
          </div>
        </div>
        <div class="kw-source-filters">
          <span>企业 / 联系人 / 电话 / 行业</span><span>意向园区</span><span>招商阶段</span><span>负责人</span><em>重置筛选</em>
        </div>
        <div class="kw-source-table">
          <div class="kw-source-row kw-source-row--leasing">
            <strong>客户</strong><strong>需求</strong><strong>阶段 / 意向</strong><strong>负责人</strong><strong>下次跟进</strong><strong>最近跟进</strong><strong>操作</strong>
          </div>
          <p>此处仅展示字段结构，不使用真实客户资料。</p>
        </div>
      </div>

      <div v-else-if="type === 'followup'" class="kw-source-ui">
        <div class="kw-source-heading">
          <div class="kw-source-tags"><span>新客户</span><span>B · 一般</span></div>
          <div class="kw-source-actions"><span>编辑档案</span><span>记跟进</span><span>记带看</span><span class="is-primary">建报价</span></div>
        </div>
        <div class="kw-source-detail-grid">
          <div v-for="field in detailFields" :key="field"><span>{{ field }}</span><strong>演示数据</strong></div>
        </div>
        <div class="kw-source-stage">
          <strong>招商阶段</strong><span>新客户</span><em>保存阶段</em>
        </div>
        <div class="kw-source-detail-panels">
          <div><strong>房源匹配与推荐</strong><span>保存推荐</span><p>保留真实页面的信息区，不展示生产数据。</p></div>
          <div><strong>跟进记录</strong><p>使用空状态演示页面结构。</p></div>
        </div>
      </div>

      <div v-else-if="type === 'contract'" class="kw-source-ui">
        <div class="kw-source-heading">
          <div><span>租赁</span><h4>合同管理</h4></div>
          <div class="kw-source-actions"><span>批量到期提醒</span><span class="is-primary">新增合同</span></div>
        </div>
        <div class="kw-source-stats kw-source-stats--five">
          <div v-for="item in contractStates" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}</strong><small>演示统计</small></div>
        </div>
        <div class="kw-source-filters"><span>合同方 / 电话 / 地址</span><span>园区</span><span>交易类型</span><span>合同状态</span><em>重置筛选</em></div>
        <div class="kw-source-table"><div class="kw-source-row kw-source-row--contract"><strong>合同台账</strong><strong>生效中</strong><strong>90 天内到期</strong><strong>已过期</strong><strong>在租面积</strong></div><p>此处仅展示字段结构，不使用真实合同资料。</p></div>
      </div>

      <div v-else-if="type === 'bill'" class="kw-source-ui">
        <div class="kw-source-heading">
          <div><span>财务</span><h4>账单管理</h4></div>
          <div class="kw-source-actions"><span>催收短信</span><span>导出 Excel</span><span class="is-primary">新增总账单</span></div>
        </div>
        <div class="kw-source-stats kw-source-stats--bill">
          <div v-for="item in billStates" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}</strong><small>演示统计</small></div>
        </div>
        <div class="kw-source-statuses"><span>未收款</span><span>部分收款</span><span>已收款</span><span>多收</span></div>
        <div class="kw-source-filters"><span>园区</span><span>项目名称</span><span>租户名称</span><span>收款状态</span><em>重置筛选</em></div>
        <div class="kw-source-table"><div class="kw-source-row kw-source-row--bill"><strong>园区 / 项目</strong><strong>租户</strong><strong>电费</strong><strong>水费</strong><strong>租金</strong><strong>应收</strong><strong>实收</strong><strong>未收</strong><strong>状态</strong></div><p>此处仅展示字段结构，不使用真实账单资料。</p></div>
      </div>

      <div v-else class="kw-source-ui">
        <div class="kw-source-heading">
          <div><span>维护管理</span><h4>报修工单</h4></div>
          <span class="kw-source-action">新增工单</span>
        </div>
        <div class="kw-source-stats kw-source-stats--repair">
          <div><span>当前台账</span><strong>8</strong><small>演示统计</small></div>
          <div><span>已完成</span><strong>5</strong><small>演示统计</small></div>
          <div><span>待处理 / 进行中</span><strong>3</strong><small>演示统计</small></div>
        </div>
        <div class="kw-source-filters"><span>编号、园区、厂房或内容</span><span>全部状态</span></div>
        <div class="kw-source-table"><div class="kw-source-row kw-source-row--repair"><strong>报修工单台账</strong><strong>待处理</strong><strong>进行中</strong><strong>已完成</strong></div><p>暂无演示工单记录。</p></div>
      </div>
    </div>

  </div>
</template>
