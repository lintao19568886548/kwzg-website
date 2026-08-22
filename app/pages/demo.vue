<script setup>
import { siteConfig } from '~/config/site'
import { describeDemoSubmissionError } from '~/utils/demo-form'

usePageSeo({
  title: '预约演示',
  description: '预约瞰维智管产品演示，信息仅保存到官网独立数据库供官网管理员跟进。',
})

const form = reactive({ name: '', phone: '', parkCount: '', privacy: false, companyWebsite: '' })
const errors = reactive({ name: '', phone: '', parkCount: '', privacy: '' })
const status = ref('idle')
const statusMessage = ref('')
let startedAt = Date.now()
let idempotencyKey = ''

function newSubmissionIdentity() {
  startedAt = Date.now()
  idempotencyKey = globalThis.crypto?.randomUUID?.().replaceAll('-', '') || `${Date.now()}${Math.random().toString(36).slice(2)}`
}

onMounted(newSubmissionIdentity)

function normalizePhoneForValidation(value) {
  let normalized = value.normalize('NFKC').replace(/[\s()-]/g, '')
  if (normalized.startsWith('0086')) normalized = normalized.slice(4)
  if (normalized.startsWith('+86')) normalized = normalized.slice(3)
  return normalized
}

function validate() {
  errors.name = form.name.trim() && form.name.trim().length <= 40 ? '' : '请输入不超过 40 字的姓名'
  errors.phone = /^1[3-9]\d{9}$/.test(normalizePhoneForValidation(form.phone)) ? '' : '请输入正确的大陆手机号，支持 +86'
  const count = Number(form.parkCount)
  errors.parkCount = Number.isInteger(count) && count >= 1 && count <= 999 ? '' : '请输入 1 至 999 的整数'
  errors.privacy = form.privacy ? '' : '请先阅读并同意隐私政策'
  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (status.value === 'submitting') return
  status.value = 'idle'
  statusMessage.value = ''
  if (!validate()) return
  if (!idempotencyKey) newSubmissionIdentity()

  status.value = 'submitting'
  try {
    await $fetch('/api/demo-requests', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': idempotencyKey },
      body: {
        name: form.name,
        phone: form.phone,
        parkCount: Number(form.parkCount),
        privacy: form.privacy,
        companyWebsite: form.companyWebsite,
        startedAt,
      },
    })
    status.value = 'success'
    statusMessage.value = '我们已收到您的预约信息，工作人员将尽快与您联系。'
    form.name = ''
    form.phone = ''
    form.parkCount = ''
    form.privacy = false
    newSubmissionIdentity()
  } catch (error) {
    const result = describeDemoSubmissionError(error, siteConfig.contact.phone)
    Object.assign(errors, result.fieldErrors)
    status.value = 'error'
    statusMessage.value = result.message
  }
}
</script>

<template>
  <div class="kw-demo-page kw-stage2-page">
    <section class="kw-demo-hero">
      <div class="kw-container kw-demo-hero__grid">
        <div class="kw-demo-hero__copy">
          <UiBaseTag v-reveal>预约产品演示</UiBaseTag>
          <h1 v-reveal="80">结合你的园区，<br>看看经营管理怎么更清楚</h1>
          <p v-reveal="160">只填写姓名、手机号和园区数量。信息仅保存到官网独立数据库，供官网单管理员查看与跟进。</p>
          <ul v-reveal="220"><li><UiLinearIcon name="check" :size="18" />围绕园区实际经营问题沟通</li><li><UiLinearIcon name="check" :size="18" />查看真实系统页面与完整能力状态</li><li><UiLinearIcon name="check" :size="18" />不连接或写入 yizuw.cn 生产系统</li></ul>
          <address v-reveal="280" class="kw-contact-panel"><strong>直接联系官方客服</strong><a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a><span>{{ siteConfig.contact.address }}</span><HomeQrPlaceholder /></address>
        </div>

        <div v-reveal:right class="kw-demo-form-card" :class="`is-${status}`">
          <div class="kw-demo-form-card__heading"><span>预约信息</span><h2>预约演示</h2><p>带 * 为必填项</p></div>
          <form novalidate @submit.prevent="handleSubmit">
            <div class="kw-honeypot" aria-hidden="true"><label for="demo-company-website">公司网站</label><input id="demo-company-website" v-model="form.companyWebsite" name="companyWebsite" type="text" tabindex="-1" autocomplete="off"></div>
            <div class="kw-field" :class="{ 'has-error': errors.name }"><label for="demo-name">姓名 <span aria-hidden="true">*</span></label><input id="demo-name" v-model="form.name" name="name" type="text" autocomplete="name" maxlength="40" placeholder="请输入姓名" :aria-describedby="errors.name ? 'demo-name-error' : undefined" :aria-invalid="Boolean(errors.name)"><small v-if="errors.name" id="demo-name-error" role="alert">{{ errors.name }}</small></div>
            <div class="kw-field" :class="{ 'has-error': errors.phone }"><label for="demo-phone">手机号 <span aria-hidden="true">*</span></label><input id="demo-phone" v-model="form.phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="18" placeholder="例如：13800000000 或 +86 13800000000" :aria-describedby="errors.phone ? 'demo-phone-error' : undefined" :aria-invalid="Boolean(errors.phone)"><small v-if="errors.phone" id="demo-phone-error" role="alert">{{ errors.phone }}</small></div>
            <div class="kw-field" :class="{ 'has-error': errors.parkCount }"><label for="demo-park-count">园区数量 <span aria-hidden="true">*</span></label><input id="demo-park-count" v-model="form.parkCount" name="parkCount" type="number" inputmode="numeric" min="1" max="999" placeholder="例如：2" :aria-describedby="errors.parkCount ? 'demo-park-count-error' : undefined" :aria-invalid="Boolean(errors.parkCount)"><small v-if="errors.parkCount" id="demo-park-count-error" role="alert">{{ errors.parkCount }}</small></div>
            <div class="kw-consent" :class="{ 'has-error': errors.privacy }"><label><input v-model="form.privacy" name="privacy" type="checkbox"><span>我已阅读并同意 <NuxtLink to="/privacy">《隐私政策》</NuxtLink></span></label><small v-if="errors.privacy" role="alert">{{ errors.privacy }}</small></div>
            <button class="kw-button kw-button--primary kw-button--large kw-demo-submit" type="submit" :disabled="status === 'submitting'" :aria-busy="status === 'submitting'">{{ status === 'submitting' ? '提交中…' : '提交预约' }}</button>
            <p class="kw-demo-form-card__notice">写入成功后页面才会显示成功；不会发送企业微信、短信或邮件通知。</p>
          </form>
          <Transition name="kw-form-status" mode="out-in"><div v-if="status === 'success'" key="success" class="kw-demo-success" role="status" aria-live="polite"><span><UiLinearIcon name="check" :size="22" /></span><div><strong>预约提交成功</strong><p>{{ statusMessage }}</p></div></div><div v-else-if="status === 'error'" key="error" class="kw-demo-error" role="alert" aria-live="assertive"><strong>提交未完成</strong><p>{{ statusMessage }}</p></div></Transition>
        </div>
      </div>
    </section>

    <section class="kw-section kw-demo-next" aria-labelledby="demo-next-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">提交后会发生什么</span>
          <h2 id="demo-next-title">信息进入官网后台，再由工作人员联系</h2>
          <p>不会自动发送企业微信、短信或邮件，也不会自动写入 yizuw.cn 园区生产系统。</p>
        </div>
        <ol class="kw-demo-next__steps">
          <li v-reveal><span>01</span><strong>提交信息</strong><small>完成隐私同意</small></li>
          <li v-reveal="60"><span>02</span><strong>写入数据库</strong><small>官网独立存储</small></li>
          <li v-reveal="120"><span>03</span><strong>后台查看</strong><small>工作人员处理</small></li>
          <li v-reveal="180"><span>04</span><strong>电话联系</strong><small>不承诺固定时限</small></li>
          <li v-reveal="240"><span>05</span><strong>安排演示</strong><small>按园区场景沟通</small></li>
        </ol>
      </div>
    </section>
  </div>
</template>
