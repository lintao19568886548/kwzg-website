<script setup>
import { siteConfig } from '~/config/site'

usePageSeo({
  title: '预约演示',
  description: '预约瞰维智管产品演示，了解工业园区经营总览、招商客户、合同、账单与报修工单。',
})

const form = reactive({
  name: '',
  phone: '',
  parkCount: '',
  privacy: false,
})
const errors = reactive({
  name: '',
  phone: '',
  parkCount: '',
  privacy: '',
})
const submitted = ref(false)

function validate() {
  errors.name = form.name.trim() ? '' : '请输入姓名'
  errors.phone = /^1[3-9]\d{9}$/.test(form.phone.trim()) ? '' : '请输入正确的 11 位手机号'
  errors.parkCount = Number(form.parkCount) >= 1 ? '' : '请输入大于 0 的园区数量'
  errors.privacy = form.privacy ? '' : '请先阅读并同意隐私政策'

  return !Object.values(errors).some(Boolean)
}

function handleSubmit() {
  submitted.value = false

  if (!validate()) {
    return
  }

  // TODO: 后续仅可接入经过安全与隐私评审的线索接收接口；Stage 1 严禁发送任何外部请求。
  submitted.value = true
}
</script>

<template>
  <div class="kw-demo-page">
    <section class="kw-demo-hero">
      <div class="kw-container kw-demo-hero__grid">
        <div class="kw-demo-hero__copy">
          <UiBaseTag>预约产品演示</UiBaseTag>
          <h1>结合你的园区，<br>看看经营管理怎么更清楚</h1>
          <p>填写三项基本信息即可完成当前页面校验。当前表单不会向任何外部接口发送信息。</p>
          <ul>
            <li><UiLinearIcon name="check" :size="18" />围绕园区实际经营问题沟通</li>
            <li><UiLinearIcon name="check" :size="18" />查看已完成溯源核验的真实系统页面</li>
            <li><UiLinearIcon name="check" :size="18" />了解云端 SaaS 与私有化部署方式</li>
          </ul>
          <address class="kw-contact-panel">
            <strong>直接联系官方客服</strong>
            <a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a>
            <span>{{ siteConfig.contact.address }}</span>
            <a class="kw-contact-panel__site" :href="siteConfig.siteUrl">官网：yizuw.org</a>
            <HomeQrPlaceholder />
          </address>
        </div>

        <div class="kw-demo-form-card">
          <div class="kw-demo-form-card__heading">
            <span>预约信息</span>
            <h2>预约演示</h2>
            <p>带 * 为必填项</p>
          </div>

          <form novalidate @submit.prevent="handleSubmit">
            <div class="kw-field" :class="{ 'has-error': errors.name }">
              <label for="demo-name">姓名 <span aria-hidden="true">*</span></label>
              <input
                id="demo-name"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="请输入姓名"
                :aria-describedby="errors.name ? 'demo-name-error' : undefined"
                :aria-invalid="Boolean(errors.name)"
              >
              <small v-if="errors.name" id="demo-name-error" role="alert">{{ errors.name }}</small>
            </div>

            <div class="kw-field" :class="{ 'has-error': errors.phone }">
              <label for="demo-phone">手机号 <span aria-hidden="true">*</span></label>
              <input
                id="demo-phone"
                v-model="form.phone"
                name="phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                maxlength="11"
                placeholder="请输入 11 位手机号"
                :aria-describedby="errors.phone ? 'demo-phone-error' : undefined"
                :aria-invalid="Boolean(errors.phone)"
              >
              <small v-if="errors.phone" id="demo-phone-error" role="alert">{{ errors.phone }}</small>
            </div>

            <div class="kw-field" :class="{ 'has-error': errors.parkCount }">
              <label for="demo-park-count">园区数量 <span aria-hidden="true">*</span></label>
              <input
                id="demo-park-count"
                v-model="form.parkCount"
                name="parkCount"
                type="number"
                inputmode="numeric"
                min="1"
                max="999"
                placeholder="例如：2"
                :aria-describedby="errors.parkCount ? 'demo-park-count-error' : undefined"
                :aria-invalid="Boolean(errors.parkCount)"
              >
              <small v-if="errors.parkCount" id="demo-park-count-error" role="alert">{{ errors.parkCount }}</small>
            </div>

            <div class="kw-consent" :class="{ 'has-error': errors.privacy }">
              <label>
                <input v-model="form.privacy" name="privacy" type="checkbox">
                <span>我已阅读并同意 <NuxtLink to="/privacy">《隐私政策》</NuxtLink></span>
              </label>
              <small v-if="errors.privacy" role="alert">{{ errors.privacy }}</small>
            </div>

            <button class="kw-button kw-button--primary kw-button--large kw-demo-submit" type="submit">
              完成预约校验
            </button>
            <p class="kw-demo-form-card__notice">此按钮仅执行前端校验，不会发送、保存或上传你填写的信息。</p>
          </form>

          <div v-if="submitted" class="kw-demo-success" role="status" aria-live="polite">
            <span><UiLinearIcon name="check" :size="22" /></span>
            <div>
              <strong>预约信息校验完成</strong>
              <p>信息未发送。如需沟通，可致电 <a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a>。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
