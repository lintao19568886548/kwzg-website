export function usePageSeo({ title, description, image = '' }) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const canonicalUrl = computed(() => (
    new URL(route.path, config.public.siteUrl).toString()
  ))
  const robots = String(config.public.indexable) === 'true'
    ? 'index, follow'
    : 'noindex, nofollow'
  const socialImage = image ? new URL(image, config.public.siteUrl).toString() : undefined

  useSeoMeta({
    title,
    description,
    robots,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogImage: socialImage,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: socialImage,
  })

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })
}
