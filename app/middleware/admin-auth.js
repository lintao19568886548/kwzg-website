export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    // Route guards only need to validate the server-side session. Rotating the
    // CSRF token here would invalidate the token held by the mounted admin
    // layout before the destination page can submit its first write.
    await $fetch('/api/admin/session', { headers, query: { check: '1' } })
  } catch (error) {
    const statusCode = error?.statusCode || error?.response?.status
    if (statusCode !== 401) {
      throw createError({
        statusCode: statusCode === 503 ? 503 : 502,
        statusMessage: 'Admin Service Unavailable',
        message: '后台服务暂时不可用，请稍后重试。',
      })
    }
    const redirect = to.fullPath.startsWith('/admin') && to.fullPath !== '/admin/login' ? to.fullPath : '/admin'
    return navigateTo({ path: '/admin/login', query: { redirect } })
  }
})
