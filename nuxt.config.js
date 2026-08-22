const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://yizuw.org'
const indexable = process.env.NUXT_PUBLIC_INDEXABLE === 'true'
const hstsEnabled = process.env.NUXT_ENABLE_HSTS === 'true'
const upgradeInsecureRequests = siteUrl.startsWith('https://') ? '; upgrade-insecure-requests' : ''
const brandIntroPrepaint = `(()=>{const root=document.documentElement;const key='kwzg_brand_intro_seen_v1';if(window.location.pathname!=='/'){root.dataset.kwzgIntro='skip';return}try{if(window.sessionStorage.getItem(key)){root.dataset.kwzgIntro='skip';return}window.sessionStorage.setItem(key,'1');root.dataset.kwzgIntro='show'}catch{root.dataset.kwzgIntro='skip'}})();`

const securityHeaders = {
  'Content-Security-Policy': `default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'${upgradeInsecureRequests}`,
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  ...(hstsEnabled ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}),
}

export default defineNuxtConfig({
  compatibilityDate: '2026-08-20',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@nuxt/eslint'],
  css: [
    '~/assets/css/main.css',
    '~/assets/css/stage1.css',
    '~/assets/css/stage1-sections.css',
    '~/assets/css/motion.css',
    '~/assets/css/stage2.css',
    '~/assets/css/floating-contact.css',
    '~/assets/css/qualification.css',
    '~/assets/css/modern-chinese.css',
    '~/assets/css/content-integration.css',
    '~/assets/css/full-capability.css',
  ],
  runtimeConfig: {
    databaseUrl: process.env.NUXT_DATABASE_URL || '',
    adminUsername: process.env.NUXT_ADMIN_USERNAME || '',
    adminPasswordHash: process.env.NUXT_ADMIN_PASSWORD_HASH || '',
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || '',
    trustedProxyAddresses: process.env.NUXT_TRUSTED_PROXY_ADDRESSES || '',
    trustedOrigins: process.env.NUXT_TRUSTED_ORIGINS || '',
    enableHsts: hstsEnabled,
    public: {
      siteUrl,
      indexable,
    },
  },
  app: {
    pageTransition: { name: 'kw-page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: '%s | 瞰维智管',
      meta: [
        { name: 'description', content: '瞰维智管连接园区招商、租赁、合同、账单、财务、设备、门禁、维护、人事和经营数据，让老板看清经营、团队协同执行。' },
        { name: 'theme-color', content: '#002359' },
        { property: 'og:site_name', content: '瞰维智管' },
        { property: 'og:locale', content: 'zh_CN' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          id: 'kwzg-brand-intro-prepaint',
          innerHTML: brandIntroPrepaint,
          tagPosition: 'head',
        },
      ],
    },
  },
  nitro: {
    routeRules: {
      '/**': { headers: securityHeaders },
      '/call': { headers: { ...securityHeaders, 'X-Robots-Tag': 'noindex, nofollow' } },
      '/admin/**': { headers: { ...securityHeaders, 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } },
      '/api/admin/**': { headers: { ...securityHeaders, 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } },
    },
    prerender: {
      routes: [
        '/',
        '/products',
        '/solutions',
        '/cases',
        '/cases/tongfu',
        '/cases/foshan-lecong',
        '/cases/shenzhen-kengzi',
        '/cases/xintang-xizhou',
        '/cases/gaobu-tongxing',
        '/service',
        '/about',
        '/demo',
        '/call',
        '/privacy',
      ],
    },
  },
})
