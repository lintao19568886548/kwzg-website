const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const indexable = process.env.NUXT_PUBLIC_INDEXABLE === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-20',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
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
        { name: 'description', content: '瞰维智管官方网站项目基线。' },
        { name: 'theme-color', content: '#0D2A45' },
        { property: 'og:site_name', content: '瞰维智管' },
        { property: 'og:locale', content: 'zh_CN' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
