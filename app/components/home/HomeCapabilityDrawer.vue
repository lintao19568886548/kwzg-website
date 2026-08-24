<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { deliveryModes, getCapability, homeCapabilityDomains } from '~/data/product-capabilities'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const query = ref('')
const role = ref('')
const deliveryMode = ref('')
const dialog = ref(null)
const closeButton = ref(null)
let previousFocus
let previousOverflow = ''
let previousBackgroundAriaHidden = null

const domainItems = computed(() => homeCapabilityDomains.map(domain => ({
  ...domain,
  features: domain.capabilityIds.flatMap(id => (getCapability(id)?.features || []).map(feature => ({ ...feature, capability: getCapability(id)?.shortName, roles: getCapability(id)?.roles || [] }))).filter(item => {
    const keywordMatch = !query.value || `${item.name}${item.capability}`.toLowerCase().includes(query.value.toLowerCase())
    const roleMatch = !role.value || item.roles.some(itemRole => itemRole.includes(role.value))
    const modeMatch = !deliveryMode.value || item.deliveryMode === deliveryMode.value
    return keywordMatch && roleMatch && modeMatch
  }),
})))

const roles = ['老板', '园区经理', '招商', '财务', '物业', '人事']

function close() { emit('close') }
function getFocusableElements() {
  if (!dialog.value) return []
  return [...dialog.value.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')]
}

function restorePageState() {
  document.body.style.overflow = previousOverflow
  const background = document.getElementById('__nuxt')
  if (background) {
    if (previousBackgroundAriaHidden === null) background.removeAttribute('aria-hidden')
    else background.setAttribute('aria-hidden', previousBackgroundAriaHidden)
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = getFocusableElements()
  if (!focusable.length) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.open, async (value) => {
  if (value) {
    previousFocus = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const background = document.getElementById('__nuxt')
    previousBackgroundAriaHidden = background?.getAttribute('aria-hidden') ?? null
    background?.setAttribute('aria-hidden', 'true')
    await nextTick()
    closeButton.value?.focus()
  } else {
    restorePageState()
    previousFocus?.focus?.()
  }
})

onBeforeUnmount(restorePageState)
</script>

<template>
  <Teleport to="body"><Transition name="kw-drawer"><div v-if="open" class="kw-capability-drawer" role="presentation" @keydown="onKeydown"><button class="kw-capability-drawer__backdrop" type="button" aria-label="关闭全部能力" @click="close" /><section ref="dialog" class="kw-capability-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1"><header><div><span>完整产品能力</span><h2 id="drawer-title">查看全部 {{ domainItems.reduce((sum, domain) => sum + domain.features.length, 0) }} 项匹配能力</h2></div><button ref="closeButton" type="button" aria-label="关闭完整能力清单" @click="close">×</button></header><div class="kw-capability-drawer__filters"><label><span>搜索</span><input v-model="query" type="search" placeholder="搜索功能名称"></label><label><span>岗位</span><select v-model="role"><option value="">全部岗位</option><option v-for="item in roles" :key="item" :value="item">{{ item }}</option></select></label><label><span>交付方式</span><select v-model="deliveryMode"><option value="">全部方式</option><option v-for="meta in deliveryModes" :key="meta.id" :value="meta.id">{{ meta.label }}</option></select></label></div><div class="kw-capability-drawer__domains"><details v-for="domain in domainItems" :key="domain.id" open><summary>{{ domain.name }} <span>{{ domain.features.length }}</span></summary><div><article v-for="item in domain.features" :key="`${domain.id}-${item.capability}-${item.name}`"><strong>{{ item.name }}</strong><span>{{ item.capability }}</span><small>{{ deliveryModes[item.deliveryMode]?.label }}</small></article><p v-if="!domain.features.length">当前筛选条件下没有匹配能力。</p></div></details></div></section></div></Transition></Teleport>
</template>
