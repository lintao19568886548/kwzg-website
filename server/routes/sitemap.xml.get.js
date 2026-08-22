const publicRoutes = [
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
  '/privacy',
]

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')
  const urls = publicRoutes.map(route => `  <url><loc>${escapeXml(`${siteUrl}${route}`)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
