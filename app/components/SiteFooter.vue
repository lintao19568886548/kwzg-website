<script setup>
import { siteConfig } from '~/config/site'
</script>

<template>
  <footer class="kw-footer">
    <div class="kw-container kw-footer__main">
      <div class="kw-footer__brand">
        <BrandLogo inverse with-tagline />
        <p>面向工业园区的经营管理系统</p>
      </div>

      <div class="kw-footer__group">
        <h2>快速入口</h2>
        <NuxtLink to="/products">产品能力</NuxtLink>
        <NuxtLink to="/solutions">解决方案</NuxtLink>
        <NuxtLink to="/cases">客户案例</NuxtLink>
        <NuxtLink to="/demo">预约演示</NuxtLink>
      </div>

      <div class="kw-footer__group">
        <h2>联系我们</h2>
        <a :href="siteConfig.contact.phoneHref">电话咨询：{{ siteConfig.contact.phone }}</a>
        <p>联系地址：{{ siteConfig.contact.address }}</p>
        <a :href="siteConfig.siteUrl">官方网站：yizuw.org</a>
      </div>

      <div class="kw-footer__group">
        <h2>服务方式</h2>
        <p>云端 SaaS</p>
        <p>私有化部署</p>
        <a
          :href="siteConfig.systemUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >登录系统 ↗</a>
      </div>
    </div>

    <div class="kw-container kw-footer__bottom">
      <p>© 2026 {{ siteConfig.company.legalName }}</p>
      <div>
        <NuxtLink to="/privacy">隐私政策</NuxtLink>
        <a :href="siteConfig.siteUrl">yizuw.org</a>
      </div>
    </div>
  </footer>
</template>
