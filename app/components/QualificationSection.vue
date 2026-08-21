<script setup>
import { computed, ref, shallowRef } from 'vue'
import { siteConfig } from '~/config/site'

const props = defineProps({
  mode: {
    type: String,
    default: 'compact',
    validator: value => ['compact', 'detail'].includes(value),
  },
})

const lightboxOpen = ref(false)
const lightboxTrigger = shallowRef(null)
const isDetail = computed(() => props.mode === 'detail')
const qualification = siteConfig.qualification

function openQualification(event) {
  lightboxTrigger.value = event.currentTarget
  lightboxOpen.value = true
}
</script>

<template>
  <section
    class="kw-section kw-qualification"
    :class="`kw-qualification--${mode}`"
    :aria-labelledby="`qualification-${mode}-title`"
    :data-qualification-section="mode"
  >
    <div class="kw-container">
      <article class="kw-qualification-card">
        <button
          v-reveal:left
          type="button"
          class="kw-qualification-media"
          aria-label="查看科技型中小企业资质大图"
          @click="openQualification"
        >
          <picture>
            <source v-if="isDetail" media="(max-width: 48rem)" :srcset="qualification.coverImage">
            <img
              :src="isDetail ? qualification.detailImage : qualification.coverImage"
              :alt="isDetail ? qualification.detailAlt : qualification.coverAlt"
              :width="isDetail ? 1800 : 1500"
              :height="isDetail ? 1890 : 1000"
              loading="lazy"
              decoding="async"
            >
          </picture>
          <span>查看大图 <span aria-hidden="true">↗</span></span>
        </button>

        <div class="kw-qualification-content">
          <div v-if="!isDetail" v-reveal="80" class="kw-qualification-heading">
            <span class="kw-section-kicker">QUALIFICATION</span>
            <small>企业资质</small>
            <h2 :id="`qualification-${mode}-title`">以技术能力，服务园区经营管理</h2>
            <p>东莞市宜租网络科技有限公司已完成科技型中小企业入库登记，持续推进园区经营管理数字化产品建设。</p>
          </div>
          <div v-else v-reveal="80" class="kw-qualification-heading">
            <span class="kw-section-kicker">企业资质</span>
            <h2 :id="`qualification-${mode}-title`">企业资质与技术实力</h2>
            <p>东莞市宜租网络科技有限公司已完成科技型中小企业入库登记。公司围绕工业园区、厂房和仓库经营管理场景，持续推进瞰维智管的产品研发与应用。</p>
          </div>

          <div v-reveal="140" class="kw-qualification-name">
            <UiLinearIcon name="check" :size="20" />
            <div><small>资质名称</small><h3>{{ qualification.name }}</h3></div>
          </div>

          <dl class="kw-qualification-facts">
            <div v-if="isDetail" v-reveal="180">
              <dt>企业名称</dt>
              <dd>{{ qualification.company }}</dd>
            </div>
            <div v-reveal="220">
              <dt>入库登记编号</dt>
              <dd class="kw-qualification-number">{{ qualification.registrationNumber }}</dd>
            </div>
            <div v-reveal="260">
              <dt>监督机构</dt>
              <dd>{{ qualification.authority }}</dd>
            </div>
            <div v-reveal="300">
              <dt>登记日期</dt>
              <dd>{{ qualification.registrationDate }}</dd>
            </div>
          </dl>

          <p v-if="isDetail" v-reveal="340" class="kw-qualification-note">资质信息以证书及登记材料载明内容为准。</p>
          <button v-reveal="380" type="button" class="kw-qualification-button" @click="openQualification">
            查看资质 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </article>
    </div>

    <CredentialLightbox
      v-model:open="lightboxOpen"
      :image="qualification.detailImage"
      :alt="qualification.detailAlt"
      title="科技型中小企业资质展示"
      :return-focus-to="lightboxTrigger"
    />
  </section>
</template>
