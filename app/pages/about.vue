<script setup>
import { siteConfig } from '~/config/site'

usePageSeo({
  title: '关于我们',
  description: `了解瞰维智管与${siteConfig.company.legalName}科技型中小企业入库登记信息，并通过官方电话或企业微信联系我们。`,
})
</script>

<template>
  <div class="kw-about-page kw-stage2-page">
    <section class="kw-about-hero">
      <div class="kw-container kw-about-hero__grid">
        <div class="kw-about-hero__copy">
          <UiBaseTag v-reveal>关于瞰维智管</UiBaseTag>
          <h1 v-reveal="80">让园区经营管理<br>更清楚、更协同</h1>
          <p v-reveal="160">瞰维智管面向工业园区、厂房和仓库，将经营总览、招商客户、合同、账单与报修工单放进清晰的管理界面，帮助管理团队看见进度、核对状态、处理待办。</p>
          <BrandLogo v-reveal="240" with-tagline />
        </div>

        <aside v-reveal:right class="kw-about-brand" aria-label="品牌与企业主体">
          <BrandLogo with-tagline />
          <div><small>企业主体</small><strong>{{ siteConfig.company.legalName }}</strong></div>
          <p>围绕工业园区、厂房和仓库经营管理场景，持续推进产品研发与应用。</p>
        </aside>
      </div>
    </section>

    <QualificationSection mode="detail" />

    <section class="kw-section kw-about-contact-section" aria-labelledby="about-contact-title">
      <div class="kw-container kw-about-contact-grid">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">官方联系</span>
          <h2 id="about-contact-title">联系我们</h2>
          <p>通过官方电话或企业微信联系瞰维智管，沟通园区经营管理数字化需求。</p>
        </div>
        <aside v-reveal:right class="kw-about-contact">
          <address>
            <div><small>公司主体</small><strong>{{ siteConfig.company.legalName }}</strong></div>
            <div class="kw-contact-action"><small>联系电话</small><a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a></div>
            <div class="kw-contact-action"><small>联系地址</small><strong>{{ siteConfig.contact.address }}</strong></div>
            <div><small>官方网站</small><a class="kw-about-contact__site" :href="siteConfig.siteUrl">yizuw.org</a></div>
            <div><small>系统登录</small><a class="kw-about-contact__site" :href="siteConfig.systemUrl" target="_blank" rel="noopener noreferrer nofollow">yz.furong.org</a></div>
          </address>
          <HomeQrPlaceholder />
        </aside>
      </div>
    </section>

    <section class="kw-section kw-about-boundary" aria-labelledby="about-boundary-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">我们坚持</span><h2 id="about-boundary-title">清楚地表达已经具备的能力</h2><p>官网系统界面全部来自已核实真实页面，并使用演示数据重构；不以虚构资历、规模或经营数字建立信任。</p></div>
        <div class="kw-about-values">
          <article v-reveal class="kw-stage2-card"><span>01</span><h3>真实溯源</h3><p>每个公开系统面板都有真实菜单和页面证据。</p></article>
          <article v-reveal="80" class="kw-stage2-card"><span>02</span><h3>边界清楚</h3><p>规划能力与已经上线的系统能力分开表达。</p></article>
          <article v-reveal="160" class="kw-stage2-card"><span>03</span><h3>数据克制</h3><p>公开页面不使用客户经营数据或生产系统截图。</p></article>
        </div>
      </div>
    </section>
  </div>
</template>
