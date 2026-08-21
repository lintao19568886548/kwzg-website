<script setup>
import { siteConfig } from '~/config/site'

const parks = [
  {
    name: '同富园区',
    location: '东莞',
    images: ['/assets/cases/tongfu-01.webp', '/assets/cases/tongfu-02.webp', '/assets/cases/tongfu-03.webp'],
  },
  {
    name: '佛山乐从园区',
    location: '佛山',
    images: ['/assets/cases/foshan-lecong-01.webp', '/assets/cases/foshan-lecong-02.webp', '/assets/cases/foshan-lecong-03.webp'],
  },
  { name: '深圳坑梓园区', location: '深圳', images: ['/assets/cases/shenzhen-kengzi-01.webp'] },
  { name: '佛山九江园区', location: '佛山 · 图片待更新', images: [] },
  { name: '新塘西州', location: '广州', images: ['/assets/cases/xintang-xizhou-01.webp'] },
  { name: '高埗同兴园区', location: '东莞', images: ['/assets/cases/gaobu-tongxing-01.webp'] },
]

const problems = [
  { icon: 'wallet', number: '01', title: '累计应收、累计实收和待收余额能否一眼看清？' },
  { icon: 'users', number: '02', title: '招商客户处于哪个阶段，下一次跟进安排在何时？' },
  { icon: 'building', number: '03', title: '合同是否生效、临近到期或已经过期？' },
  { icon: 'clipboard', number: '04', title: '报修工单处于待处理、进行中还是已完成？' },
]

const loops = [
  {
    label: '招商管理',
    title: '客户列表与客户详情，各有清晰边界',
    description: '客户列表用于筛选和掌握阶段，客户详情用于查看需求并记录跟进、带看与报价。',
    steps: ['筛选客户', '查看阶段', '查看需求', '记录跟进', '记录带看', '保存阶段'],
  },
  {
    label: '经营台账',
    title: '合同管理与账单管理，分别保留真实口径',
    description: '合同页面关注主体、状态和在租面积；账单页面关注应收、实收与收款状态。',
    steps: ['合同主体', '合同状态', '在租面积', '应收总额', '实收总额', '收款状态'],
  },
]

const capabilities = [
  { icon: 'chart', title: '经营总览', text: '汇总累计应收、累计实收、待收余额、在租面积与待办事项。' },
  { icon: 'users', title: '招商客户', text: '按园区、阶段和负责人筛选客户，查看客户需求与跟进时间。' },
  { icon: 'search', title: '客户详情', text: '查看需求信息、招商阶段、房源推荐与跟进记录。' },
  { icon: 'building', title: '合同管理', text: '查看合同主体、生效状态、到期情况与在租面积。' },
  { icon: 'wallet', title: '账单管理', text: '查看应收、实收、未收敞口与账单收款状态。' },
  { icon: 'wrench', title: '报修工单', text: '按编号、园区或内容搜索，并区分待处理、进行中与已完成。' },
]

const interfaces = [
  { type: 'leasing-list', title: '招商客户', copy: '按真实客户列表页的信息层级，呈现筛选项、阶段状态与列表字段。' },
  { type: 'followup', title: '客户详情', copy: '对应单个客户详情页，保留需求、招商阶段、房源推荐与跟进记录。' },
  { type: 'contract', title: '合同管理', copy: '对应合同管理页，呈现主体、状态、到期情况与筛选项。' },
  { type: 'bill', title: '账单管理', copy: '对应账单管理页，呈现应收、实收、未收与收款状态。' },
  { type: 'repair', title: '报修工单', copy: '对应报修工单页，呈现台账、搜索、状态筛选与处理状态。' },
]

const deployment = [
  { icon: 'cloud', title: '云端 SaaS', text: '快速启用、持续更新，适合希望轻量上线的园区。' },
  { icon: 'server', title: '私有化部署', text: '支持按项目要求规划独立部署与交付边界。' },
  { icon: 'monitor', title: 'PC 管理后台', text: '面向老板和管理团队，集中处理经营与管理工作。' },
]
</script>

<template>
  <div class="kw-home">
    <section class="kw-home-hero">
      <div class="kw-home-hero__pattern" aria-hidden="true" />
      <div class="kw-container kw-home-hero__grid">
        <div class="kw-home-hero__copy">
          <UiBaseTag>面向工业园区的经营管理系统</UiBaseTag>
          <h1>让工业园区少空置，<br>让每一笔经营更清楚</h1>
          <p>
            瞰维智管面向工业园区、厂房和仓库，将经营总览、招商客户、合同、账单与报修工单放进清晰的管理界面，帮助管理团队看见进度、核对状态、处理待办。
          </p>
          <div class="kw-home-hero__actions">
            <UiBaseButton to="/demo" size="large">预约产品演示</UiBaseButton>
            <UiBaseButton :href="siteConfig.systemUrl" variant="outline" size="large">
              登录系统
              <span aria-hidden="true">↗</span>
            </UiBaseButton>
          </div>
          <ul class="kw-home-hero__facts" aria-label="产品交付信息">
            <li><UiLinearIcon name="monitor" :size="18" />PC 管理后台</li>
            <li><UiLinearIcon name="cloud" :size="18" />云端 SaaS＋私有化部署</li>
          </ul>
        </div>

        <HomeDashboardOverview />
      </div>
    </section>

    <section class="kw-section kw-trust-section" aria-labelledby="trust-title">
      <div class="kw-container">
        <div class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">园区实践</span>
            <h2 id="trust-title">真实园区，真实在用</h2>
          </div>
          <p>六个园区均已正式使用瞰维智管；仅展示已获授权的园区名称与实景，不公开出租率、租金、欠费或收入等经营数据。</p>
        </div>
        <div class="kw-park-grid">
          <HomeParkCard
            v-for="park in parks"
            :key="park.name"
            :name="park.name"
            :location="park.location"
            :images="park.images"
          />
        </div>
      </div>
    </section>

    <section class="kw-section kw-problems" aria-labelledby="problems-title">
      <div class="kw-container">
        <div class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">经营视角</span>
          <h2 id="problems-title">园区老板真正关心的问题</h2>
          <p>不是多一套菜单，而是随时能看清问题、找到进度、推动结果。</p>
        </div>
        <div class="kw-problem-grid">
          <UiBaseCard v-for="problem in problems" :key="problem.number">
            <div class="kw-problem-card__top">
              <span><UiLinearIcon :name="problem.icon" :size="25" /></span>
              <em>{{ problem.number }}</em>
            </div>
            <h3>{{ problem.title }}</h3>
          </UiBaseCard>
        </div>
      </div>
    </section>

    <section class="kw-section kw-loops" aria-labelledby="loops-title">
      <div class="kw-container">
        <div class="kw-section-heading">
          <span class="kw-section-kicker">真实页面边界</span>
          <h2 id="loops-title">每个管理页面，只表达能够核验的内容</h2>
          <p>招商客户、客户详情、合同管理和账单管理保持各自的信息口径，不把多个页面拼成一个虚构流程。</p>
        </div>
        <div class="kw-loop-grid">
          <article v-for="loop in loops" :key="loop.label" class="kw-loop-card">
            <div class="kw-loop-card__intro">
              <UiBaseTag :tone="loop.label === '招商管理' ? 'red' : 'blue'">{{ loop.label }}</UiBaseTag>
              <h3>{{ loop.title }}</h3>
              <p>{{ loop.description }}</p>
            </div>
            <ol>
              <li v-for="(step, index) in loop.steps" :key="step">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <strong>{{ step }}</strong>
              </li>
            </ol>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-capabilities" aria-labelledby="capabilities-title">
      <div class="kw-container">
        <div class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">产品能力</span>
            <h2 id="capabilities-title">围绕园区经营，形成六大能力</h2>
          </div>
          <NuxtLink class="kw-text-link" to="/products">查看产品能力 <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="kw-capability-grid">
          <article v-for="(item, index) in capabilities" :key="item.title" class="kw-capability-card">
            <span class="kw-capability-card__icon"><UiLinearIcon :name="item.icon" :size="27" /></span>
            <small>0{{ index + 1 }}</small>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-showcase" aria-labelledby="showcase-title">
      <div class="kw-container">
        <div class="kw-section-heading kw-section-heading--center kw-section-heading--light">
          <span class="kw-section-kicker">系统界面</span>
          <h2 id="showcase-title">让经营信息清楚地摆在眼前</h2>
          <p>以下每张界面均对应一个已经核验的真实系统页面，不使用生产截图或生产数据。</p>
        </div>
        <div class="kw-showcase-list">
          <article
            v-for="(item, index) in interfaces"
            :key="item.type"
            class="kw-showcase-item"
          >
            <div class="kw-showcase-item__copy">
              <span>0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.copy }}</p>
            </div>
            <HomeInterfacePreview :type="item.type" :title="item.title" />
          </article>
        </div>
        <p class="kw-showcase__notice">本界面基于瞰维智管现有功能进行视觉优化展示，使用演示数据，具体界面以实际交付版本为准。</p>
      </div>
    </section>

    <section class="kw-section kw-ai-section" aria-labelledby="ai-title">
      <div class="kw-container kw-ai-card">
        <div class="kw-ai-card__icon"><UiLinearIcon name="search" :size="34" /></div>
        <div class="kw-ai-card__copy">
          <UiBaseTag tone="planning">规划中</UiBaseTag>
          <span class="kw-section-kicker">下一步，让招商更智能</span>
          <h2 id="ai-title">AI 招商匹配</h2>
          <p>结合空置房源条件与客户需求，辅助招商人员发现更合适的匹配机会。</p>
          <strong>本能力属于产品规划，暂未作为当前正式功能交付。</strong>
        </div>
        <div class="kw-ai-card__visual" aria-hidden="true">
          <span>房源条件</span><i /><span>客户需求</span><i /><span>匹配建议</span>
        </div>
      </div>
    </section>

    <section class="kw-section kw-deployment" aria-labelledby="deployment-title">
      <div class="kw-container">
        <div class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">灵活交付</span>
          <h2 id="deployment-title">适配不同园区的使用与部署方式</h2>
          <p>以云端 SaaS 为主，同时支持按项目边界规划私有化部署，并通过 PC 管理后台承载经营管理工作。</p>
        </div>
        <div class="kw-deployment-grid">
          <article v-for="item in deployment" :key="item.title">
            <span><UiLinearIcon :name="item.icon" :size="28" /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-final-cta" aria-labelledby="cta-title">
      <div class="kw-final-cta__pattern" aria-hidden="true" />
      <div class="kw-container kw-final-cta__grid">
        <div>
          <span class="kw-section-kicker">预约沟通</span>
          <h2 id="cta-title">想先看看瞰维智管是否适合你的园区？</h2>
          <p>用一场产品演示，结合你的园区规模和管理方式，看看哪些经营问题可以先理清。</p>
          <div class="kw-final-cta__actions">
            <UiBaseButton to="/demo" size="large">预约产品演示</UiBaseButton>
            <a class="kw-final-cta__phone" :href="siteConfig.contact.phoneHref">
              <UiLinearIcon name="phone" :size="21" />电话咨询：{{ siteConfig.contact.phone }}
            </a>
          </div>
        </div>
        <HomeQrPlaceholder />
      </div>
    </section>
  </div>
</template>
