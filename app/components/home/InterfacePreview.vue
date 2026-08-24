<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const interfaceConfigs = {
  'leasing-list': {
    section: '招商管理',
    fields: [
      ['跟进中', '12'],
      ['新客户', '4'],
      ['需求确认', '3'],
      ['已推荐房源', '2'],
      ['已带看', '2'],
      ['已签约', '1'],
    ],
  },
  followup: {
    section: '招商管理',
    fields: [
      ['需求面积', '演示数据'],
      ['租金预算', '演示数据'],
      ['使用用途', '演示数据'],
      ['预计入驻', '演示数据'],
      ['下次跟进', '演示数据'],
      ['最近跟进', '演示数据'],
    ],
  },
  contract: {
    section: '租赁',
    fields: [
      ['合同主体', '18'],
      ['生效中', '12'],
      ['90 天内到期', '3'],
      ['已过期', '3'],
      ['在租面积', '28,600 ㎡'],
    ],
  },
  bill: {
    section: '财务',
    fields: [
      ['总体回款率', '86%'],
      ['未收敞口', '8.2 万'],
      ['应收总额', '126.8 万'],
      ['实收总额', '118.6 万'],
      ['当前筛选未收', '3.2 万'],
      ['多收金额', '0.6 万'],
    ],
  },
  repair: {
    section: '维护管理',
    fields: [
      ['当前台账', '8'],
      ['已完成', '5'],
      ['待处理 / 进行中', '3'],
      ['检索范围', '编号 / 园区 / 厂房'],
      ['状态筛选', '全部状态'],
    ],
  },
}

const config = computed(() => interfaceConfigs[props.type] || interfaceConfigs.repair)
</script>

<template>
  <div class="kw-interface-source">
    <div class="kw-interface kw-interface--compact" :class="`kw-interface--${type}`">
      <div class="kw-interface__chrome">
        <div class="kw-interface__dots" aria-hidden="true"><i /><i /><i /></div>
        <strong>{{ title }}</strong>
        <UiBaseTag tone="demo">演示数据</UiBaseTag>
      </div>

      <div class="kw-source-ui kw-source-ui--compact">
        <div class="kw-source-heading">
          <div><span>{{ config.section }}</span><h4>{{ title }}</h4></div>
          <span class="kw-source-action">安全演示数据</span>
        </div>
        <div class="kw-interface-key-grid">
          <article v-for="field in config.fields" :key="field[0]">
            <span>{{ field[0] }}</span>
            <strong>{{ field[1] }}</strong>
            <small>演示字段</small>
          </article>
        </div>
        <p class="kw-interface-compact-note">仅展示 3–6 个经过核验的关键字段，不使用真实客户资料或生产经营数据。</p>
      </div>
    </div>
  </div>
</template>
