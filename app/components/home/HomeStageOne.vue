<script setup>
import HomeMagneticParticleField from '~/components/effects/HomeMagneticParticleField.vue'
import { siteConfig } from '~/config/site'
import { verifiedCapabilities } from '~/data/verified-capabilities'

const publicModules = verifiedCapabilities.map(capability => ({
  key: capability.id,
  label: capability.title,
  icon: capability.icon,
  group: '已核实能力',
  pageVerified: true,
  summary: capability.value,
}))

const parks = [
  {
    name: '同富园区',
    location: '东莞',
    images: ['/assets/cases/tongfu-main.webp'],
  },
  {
    name: '佛山乐从园区',
    location: '佛山',
    images: ['/assets/cases/foshan-lecong-01.webp', '/assets/cases/foshan-lecong-03.webp'],
  },
  { name: '深圳坑梓园区', location: '深圳', images: ['/assets/cases/shenzhen-kengzi-01.webp'] },
  { name: '新塘西州', location: '广州', images: ['/assets/cases/xintang-xizhou-01.webp'] },
  { name: '高埗同兴园区', location: '东莞', images: ['/assets/cases/gaobu-tongxing-01.webp'] },
]

const problems = [
  { icon: 'users', number: '01', title: '招商信息是否散落在微信或个人手机中？' },
  { icon: 'building', number: '02', title: '查询客户、合同和账单时是否需要反复询问？' },
  { icon: 'wallet', number: '03', title: '查看账单状态是否仍然依赖人工临时整理？' },
  { icon: 'clipboard', number: '04', title: '报修事项是否缺少统一记录和持续跟进？' },
  { icon: 'chart', number: '05', title: '查看园区经营情况时是否需要临时找人做表？' },
]

const loops = [
  {
    label: '招商管理',
    title: '客户列表与客户详情，各有清晰边界',
    description: '客户列表用于筛选和查看阶段，客户详情用于核对需求与已经存在的跟进记录。',
    steps: ['招商客户', '客户详情', '合同管理', '账单管理'],
  },
  {
    label: '经营台账',
    title: '合同管理与账单管理，分别保留真实口径',
    description: '经营总览作为集中入口，报修工单作为独立服务支线，不拼接成虚构自动流程。',
    steps: ['经营总览', '报修工单'],
  },
]

const interfaces = [
  { type: 'overview', title: '园区经营总览', copy: '对应工作台中的运营总览页，呈现应收、实收、待收余额、在租面积与待办信息。' },
  { type: 'leasing-list', title: '招商客户', copy: '按真实客户列表页的信息层级，呈现筛选项、阶段状态与列表字段。' },
  { type: 'followup', title: '客户详情', copy: '对应单个客户详情页，保留需求、招商阶段、房源推荐与跟进记录。' },
  { type: 'contract', title: '合同管理', copy: '对应合同管理页，呈现主体、状态、到期情况与筛选项。' },
  { type: 'bill', title: '账单管理', copy: '对应账单管理页，呈现应收、实收、未收与收款状态。' },
  { type: 'repair', title: '报修工单', copy: '对应报修工单页，呈现台账、搜索、状态筛选与处理状态。' },
]

const deployment = [
  { icon: 'cloud', title: '云端 SaaS', text: '根据确认的园区范围、使用岗位和资料情况安排使用准备。' },
  { icon: 'server', title: '私有化部署评估', text: '服务器、数据库、网络、安全与运维责任需经技术评估后确认。' },
  { icon: 'monitor', title: 'PC 管理后台', text: '面向老板和管理团队，集中处理经营与管理工作。' },
]
</script>

<template>
  <div class="kw-home">
    <section v-motion-active class="kw-home-hero kw-tech-field">
      <div class="kw-home-hero__pattern" aria-hidden="true" />
      <HomeMagneticParticleField />
      <div class="kw-container kw-home-hero__grid">
        <div v-reveal class="kw-home-hero__copy">
          <UiBaseTag>面向工业园区的经营管理系统</UiBaseTag>
          <h1>让园区招商、合同、账单和服务管理更清楚</h1>
          <p>
            聚焦工业园区、厂房和仓库经营管理，帮助团队减少信息分散、重复查询和跟进遗漏。
          </p>
          <div class="kw-home-hero__actions">
            <UiBaseButton to="/demo" size="large">预约演示</UiBaseButton>
            <UiBaseButton to="/products" variant="outline" size="large">查看产品能力</UiBaseButton>
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

        <HomeDashboardOverview v-reveal:right floating />
      </div>
    </section>

    <section class="kw-section kw-trust-section" aria-labelledby="trust-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">园区实践</span>
            <h2 id="trust-title">真实园区，真实在用</h2>
          </div>
          <p>多个园区均已正式使用瞰维智管；仅展示本阶段纳入案例页的授权园区名称与实景，不公开出租率、租金、欠费或收入等经营数据。</p>
        </div>
        <div class="kw-park-grid">
          <HomeParkCard
            v-for="park in parks"
            :key="park.name"
            v-reveal
            :name="park.name"
            :location="park.location"
            :images="park.images"
          />
        </div>
      </div>
    </section>

    <section class="kw-section kw-problems" aria-labelledby="problems-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">本地自查</span>
          <h2 id="problems-title">园区经营管理是否需要进一步统一？</h2>
          <p>选择符合现状的项目，结果只在当前浏览器计算，不采集、不上传，也不估算经营损失。</p>
        </div>
        <ParkManagementCheck :questions="problems.map(problem => problem.title)" />
      </div>
    </section>

    <section class="kw-section kw-loops" aria-labelledby="loops-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">1＋4＋1 真实能力关系</span>
          <h2 id="loops-title">经营中心、业务主线与服务支线各有边界</h2>
          <p>关系图用于说明已核实页面之间的管理阅读路径，不代表存在未经核实的自动化流程。</p>
        </div>
        <VerifiedBusinessFlow />
        <div class="kw-loop-grid">
          <article v-for="loop in loops" :key="loop.label" v-reveal class="kw-loop-card">
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
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">产品能力</span>
            <h2 id="capabilities-title">围绕园区经营，形成六项已核实能力</h2>
          </div>
          <NuxtLink class="kw-text-link" to="/products">查看产品能力 <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="kw-capability-grid" aria-label="六项已核实能力概览">
          <article v-for="(module, index) in publicModules" :key="module.key" v-reveal class="kw-capability-card">
            <span class="kw-capability-card__icon"><UiLinearIcon :name="module.icon" :size="27" /></span>
            <small>{{ String(index + 1).padStart(2, '0') }}</small>
            <h3>{{ module.label }}</h3>
            <p>{{ module.summary }}</p>
            <em>{{ module.group }} · 页面已核实</em>
          </article>
        </div>
        <VerifiedCapabilityGrid compact />
        <BeforeAfterComparison />
      </div>
    </section>

    <section class="kw-section kw-showcase" aria-labelledby="showcase-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center kw-section-heading--light">
          <span class="kw-section-kicker">系统界面</span>
          <h2 id="showcase-title">让经营信息清楚地摆在眼前</h2>
          <p>以下展示只对应六项已经完成页面核验的能力，不使用生产截图或生产数据。</p>
        </div>
        <div v-reveal class="kw-showcase-modules">
          <div class="kw-showcase-module-grid" aria-label="瞰维智管六项公开能力">
            <article
              v-for="module in publicModules"
              :key="module.key"
              :class="{ 'has-verified-page': module.pageVerified }"
            >
              <span><UiLinearIcon :name="module.icon" :size="20" /></span>
              <div>
                <small>{{ module.group }}</small>
                <strong>{{ module.label }}</strong>
              </div>
              <em>界面已核验</em>
            </article>
          </div>
          <p>官网公开界面仅用于说明已经核实的字段、筛选条件与状态边界。</p>
        </div>
        <div class="kw-showcase-list">
          <article
            v-for="(item, index) in interfaces"
            :key="item.type"
            v-reveal
            class="kw-showcase-item"
          >
            <div class="kw-showcase-item__copy">
              <span>0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.copy }}</p>
            </div>
            <HomeDashboardOverview v-if="item.type === 'overview'" />
            <HomeInterfacePreview v-else :type="item.type" :title="item.title" />
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-ai-section" aria-labelledby="ai-title">
      <div v-reveal class="kw-container kw-ai-card">
        <div class="kw-ai-card__icon"><UiLinearIcon name="search" :size="34" /></div>
        <div class="kw-ai-card__copy">
          <UiBaseTag>规划中</UiBaseTag>
          <span class="kw-section-kicker">规划能力独立说明</span>
          <h2 id="ai-title">AI招商匹配 · 规划中</h2>
          <p>计划基于园区房源和招商客户需求提供辅助匹配，最终判断由工作人员完成。</p>
          <strong>规划方向不代表当前已经交付，不展示模拟系统界面，也不承诺上线日期。</strong>
        </div>
        <div class="kw-ai-card__visual" aria-hidden="true">
          <span>房源条件</span><i /><span>客户需求</span><i /><span>规划方向</span>
        </div>
      </div>
    </section>

    <section class="kw-section kw-deployment" aria-labelledby="deployment-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">灵活交付</span>
          <h2 id="deployment-title">适配不同园区的使用与部署方式</h2>
          <p>以云端 SaaS 使用为主；私有化方案需结合服务器、数据库、网络、安全与运维责任进行项目评估。</p>
        </div>
        <div class="kw-deployment-grid">
          <article v-for="item in deployment" :key="item.title" v-reveal>
            <span><UiLinearIcon :name="item.icon" :size="28" /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-home-service" aria-labelledby="home-service-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">实施服务预览</span>
            <h2 id="home-service-title">从真实演示到园区实际使用</h2>
          </div>
          <NuxtLink class="kw-text-link" to="/service">了解实施服务 <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <ImplementationTimeline compact />
      </div>
    </section>

    <section class="kw-section kw-home-faq" aria-labelledby="home-faq-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">常见问题</span>
            <h2 id="home-faq-title">先把能力、部署和结果边界说清楚</h2>
          </div>
          <NuxtLink class="kw-text-link" to="/service#faq">查看全部问题 <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <ServiceFaqAccordion :limit="4" />
      </div>
    </section>

    <QualificationSection mode="compact" />

    <section class="kw-final-cta" aria-labelledby="cta-title">
      <div class="kw-final-cta__pattern" aria-hidden="true" />
      <div v-reveal class="kw-container kw-final-cta__grid">
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
