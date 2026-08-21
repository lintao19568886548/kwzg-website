const ssrDirective = {
  getSSRProps() {
    return {}
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', ssrDirective)
  nuxtApp.vueApp.directive('motion-active', ssrDirective)
})
