const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://yizuw.org'
const indexable = process.env.NUXT_PUBLIC_INDEXABLE === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-20',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: [
    '~/assets/css/main.css',
    '~/assets/css/stage1.css',
    '~/assets/css/stage1-sections.css',
  ],
  runtimeConfig: {
    public: {
      siteUrl,
      indexable,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: '%s | 瞰维智管',
      meta: [
        { name: 'description', content: '瞰维智管面向工业园区、厂房和仓库，汇总经营总览、招商客户、合同、账单与报修工单。' },
        { name: 'theme-color', content: '#002359' },
        { property: 'og:site_name', content: '瞰维智管' },
        { property: 'og:locale', content: 'zh_CN' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/products',
        '/solutions',
        '/cases',
        '/about',
        '/demo',
        '/privacy',
      ],
    },
  },
})
