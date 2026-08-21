<script setup>
import { caseStudies, getCaseStudy } from '~/data/cases'

const route = useRoute()
const item = getCaseStudy(String(route.params.slug))

if (!item) {
  throw createError({ statusCode: 404, message: '未找到该客户案例' })
}

usePageSeo({
  title: item.seoTitle,
  description: item.seoDescription,
  image: item.coverImage,
})

const currentIndex = caseStudies.findIndex(caseItem => caseItem.slug === item.slug)
const previousCase = caseStudies[(currentIndex - 1 + caseStudies.length) % caseStudies.length]
const nextCase = caseStudies[(currentIndex + 1) % caseStudies.length]
const readingProgress = ref(0)
const heroImage = ref(null)
let frameId

function updateReadingState() {
  frameId = undefined
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0

  if (!heroImage.value || window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const offset = Math.max(-12, Math.min(12, window.scrollY * 0.025))
  heroImage.value.style.setProperty('--kw-case-parallax', `${offset}px`)
}

function requestReadingUpdate() {
  if (!frameId) frameId = window.requestAnimationFrame(updateReadingState)
}

onMounted(() => {
  updateReadingState()
  window.addEventListener('scroll', requestReadingUpdate, { passive: true })
  window.addEventListener('resize', requestReadingUpdate, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestReadingUpdate)
  window.removeEventListener('resize', requestReadingUpdate)
  if (frameId) window.cancelAnimationFrame(frameId)
})
</script>

<template>
  <div class="kw-stage2-page kw-case-detail">
    <div class="kw-reading-progress" aria-hidden="true"><span :style="{ width: `${readingProgress}%` }" /></div>

    <div class="kw-container">
      <nav class="kw-breadcrumb" aria-label="面包屑">
        <ol><li><NuxtLink to="/">首页</NuxtLink></li><li><NuxtLink to="/cases">客户案例</NuxtLink></li><li aria-current="page">{{ item.name }}</li></ol>
      </nav>
    </div>

    <section class="kw-case-detail-hero" aria-labelledby="case-title">
      <div class="kw-container kw-case-detail-hero__grid">
        <div v-reveal class="kw-case-detail-hero__copy">
          <span class="kw-section-kicker">{{ item.region }} · Customer story</span>
          <h1 id="case-title">{{ item.name }}<small>{{ item.title }}</small></h1>
          <p>{{ item.summary }}</p>
          <UiBaseButton to="/demo" size="large">预约演示 <span aria-hidden="true">→</span></UiBaseButton>
        </div>
        <figure v-reveal:right class="kw-case-detail-hero__media">
          <img ref="heroImage" :src="item.coverImage" :alt="item.gallery[0].alt" width="1200" height="750" fetchpriority="high">
          <figcaption>{{ item.gallery[0].caption }}</figcaption>
        </figure>
      </div>
    </section>

    <aside class="kw-container kw-case-disclosure">案例内容基于已授权园区名称、实景图片及瞰维智管已核实功能整理，不披露客户经营数据。</aside>

    <section class="kw-section kw-case-overview" aria-labelledby="case-overview-title">
      <div class="kw-container kw-case-reading-grid">
        <div v-reveal class="kw-case-section-heading"><span>01</span><div><small>CASE OVERVIEW</small><h2 id="case-overview-title">案例应用概览</h2></div></div>
        <div class="kw-case-prose"><p v-for="paragraph in item.overview" :key="paragraph" v-reveal>{{ paragraph }}</p></div>
      </div>
    </section>

    <section class="kw-section kw-case-scenes" aria-labelledby="case-scenes-title">
      <div class="kw-container">
        <div v-reveal class="kw-case-section-heading"><span>02</span><div><small>MANAGEMENT SCENES</small><h2 id="case-scenes-title">管理场景</h2></div></div>
        <div class="kw-case-scene-grid">
          <article v-for="(scene, index) in item.managementScenes" :key="scene.title" v-reveal :style="{ '--kw-reveal-delay': `${index * 70}ms` }">
            <span>{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ scene.title }}</h3><p>{{ scene.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-case-system" aria-labelledby="case-functions-title">
      <div class="kw-container">
        <div v-reveal class="kw-case-section-heading kw-case-section-heading--light"><span>03</span><div><small>VERIFIED PRODUCT UI</small><h2 id="case-functions-title">相关功能展示</h2></div></div>
        <p v-reveal class="kw-case-system__intro">以下界面分别对应溯源矩阵已经通过的真实系统页面，仅进行视觉优化并使用演示数据。</p>
        <CasesCaseFunctionShowcase v-reveal :functions="item.relatedFunctions" />
      </div>
    </section>

    <section class="kw-section kw-case-value" aria-labelledby="case-value-title">
      <div class="kw-container kw-case-reading-grid">
        <div v-reveal class="kw-case-section-heading"><span>04</span><div><small>MANAGEMENT VALUE</small><h2 id="case-value-title">管理价值</h2></div></div>
        <ul>
          <li v-for="(value, index) in item.valueDirections" :key="value" v-reveal :style="{ '--kw-reveal-delay': `${index * 70}ms` }"><span aria-hidden="true">✓</span>{{ value }}</li>
        </ul>
      </div>
    </section>

    <section class="kw-section kw-case-gallery-section" aria-labelledby="case-gallery-title">
      <div class="kw-container">
        <div v-reveal class="kw-case-section-heading"><span>05</span><div><small>PARK GALLERY</small><h2 id="case-gallery-title">园区实景画廊</h2></div></div>
        <div v-reveal>
          <CasesCaseGallery :name="item.name" :images="item.gallery" />
        </div>
      </div>
    </section>

    <div class="kw-container">
      <CasesCaseNavigation v-reveal :previous-case="previousCase" :next-case="nextCase" />
      <CasesCaseDemoCta />
    </div>
  </div>
</template>
