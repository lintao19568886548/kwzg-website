export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')

  if (!config.public.indexable) {
    return 'User-agent: *\nDisallow: /\n'
  }

  return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /call\nSitemap: ${config.public.siteUrl}/sitemap.xml\n`
})
