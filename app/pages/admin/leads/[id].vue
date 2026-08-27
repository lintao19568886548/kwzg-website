<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
usePageSeo({ title: '线索详情', description: '瞰维智管官网预约线索跟进时间线。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const route = useRoute()
const returnTo = computed(() => typeof route.query.returnTo === 'string' && route.query.returnTo.startsWith('/admin/leads') ? route.query.returnTo : '/admin/leads')
</script>

<template>
  <div class="kw-admin-main kw-admin-detail-page">
    <AdminLeadDetailPanel :lead-id="String(route.params.id)" :return-to="returnTo" />
  </div>
</template>
