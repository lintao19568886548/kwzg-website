export default defineNuxtRouteMiddleware(async () => {
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    await $fetch('/api/admin/session', { headers })
  } catch {
    return navigateTo('/admin/login')
  }
})
