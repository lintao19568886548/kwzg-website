export function usePageSeo({ title, description }) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const canonicalUrl = computed(() => (
    new URL(route.path, config.public.siteUrl).toString()
  ))
  const robots = String(config.public.indexable) === 'true'
    ? 'index, follow'
    : 'noindex, nofollow'

  useSeoMeta({
    title,
    description,
    robots,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: canonicalUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
  })

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })
}

