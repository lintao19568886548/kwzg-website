<script setup>
import { siteConfig } from '~/config/site'

usePageSeo({
  title: '关于我们',
  description: `了解瞰维智管与${siteConfig.company.legalName}，并通过官方电话或企业微信联系我们。`,
})
</script>

<template>
  <div class="kw-about-page">
    <section class="kw-about-hero">
      <div class="kw-container kw-about-hero__grid">
        <div class="kw-about-hero__copy">
          <UiBaseTag>关于瞰维智管</UiBaseTag>
          <h1>让园区经营管理<br>更清楚、更协同</h1>
          <p>瞰维智管面向工业园区、厂房和仓库，将经营总览、招商客户、合同、账单与报修工单放进清晰的管理界面，帮助管理团队看见进度、核对状态、处理待办。</p>
          <BrandLogo with-tagline />
        </div>

        <aside class="kw-about-contact" aria-labelledby="about-contact-title">
          <span>官方联系</span>
          <h2 id="about-contact-title">联系我们</h2>
          <address>
            <div>
              <small>公司主体</small>
              <strong>{{ siteConfig.company.legalName }}</strong>
            </div>
            <div>
              <small>联系电话</small>
              <a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a>
            </div>
            <div>
              <small>联系地址</small>
              <strong>{{ siteConfig.contact.address }}</strong>
            </div>
            <div>
              <small>官方网站</small>
              <a class="kw-about-contact__site" :href="siteConfig.siteUrl">yizuw.org</a>
            </div>
            <div>
              <small>系统登录</small>
              <a class="kw-about-contact__site" :href="siteConfig.systemUrl">yizuw.cn</a>
            </div>
          </address>
          <HomeQrPlaceholder />
        </aside>
      </div>
    </section>
  </div>
</template>
