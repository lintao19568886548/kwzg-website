<script setup>
import { siteConfig } from '~/config/site'

usePageSeo({
  title: '实施服务',
  description: '了解瞰维智管从需求沟通、真实系统演示到范围确认、培训试运行与上线复盘的实施方式、部署边界和常见问题。',
})
</script>

<template>
  <div class="kw-stage2-page kw-service-page">
    <section v-motion-active class="kw-stage2-hero kw-tech-field">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <UiBaseTag>实施服务</UiBaseTag>
          <h1>从系统演示到园区实际使用，把范围与边界先说清楚</h1>
          <p>根据园区规模、管理重点、现有资料和部署环境，共同确认适合的实施范围，不用固定周期或未经评估的承诺代替项目沟通。</p>
          <div class="kw-stage2-hero__actions">
            <UiBaseButton to="/demo" size="large">预约项目沟通</UiBaseButton>
            <a class="kw-text-link" :href="siteConfig.contact.phoneHref">电话咨询 {{ siteConfig.contact.phone }}</a>
          </div>
        </div>
        <aside v-reveal:right class="kw-stage2-hero__aside">
          <strong>服务原则</strong>
          <span>演示已上线页面</span>
          <span>配置组织与业务规则</span>
          <span>评估软硬件和部署条件</span>
          <span>规划能力单独说明</span>
        </aside>
      </div>
    </section>

    <section class="kw-section" aria-labelledby="readiness-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">实施前准备</span>
          <h2 id="readiness-title">开始前需要共同确认六类信息</h2>
          <p>资产范围、人员、资料和部署条件越清楚，越容易形成符合实际的项目方案。</p>
        </div>
        <ImplementationReadiness />
      </div>
    </section>

    <section class="kw-section kw-service-timeline" aria-labelledby="timeline-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center">
          <span class="kw-section-kicker">建议流程</span>
          <h2 id="timeline-title">六步推进，不预设固定周期</h2>
          <p>具体实施范围、数据处理、部署方式和服务周期，以双方确认的项目方案为准。</p>
        </div>
        <ImplementationTimeline />
      </div>
    </section>

    <section class="kw-section" aria-labelledby="scope-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">服务范围</span>
          <h2 id="scope-title">四种能力状态，对应四类实施边界</h2>
        </div>
        <ServiceScope />
      </div>
    </section>

    <section class="kw-section kw-service-deployment" aria-labelledby="deployment-boundary-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">部署与数据边界</span>
          <h2 id="deployment-boundary-title">部署方式需要结合实际环境确认</h2>
          <p>资料迁移前需检查字段、质量与完整性；硬件和第三方系统需核对协议、网络环境、安全要求和厂商配合。</p>
        </div>
        <DeploymentBoundary />
        <p class="kw-boundary-note">预约信息只保存到官网独立数据库供官网后台查看，不自动写入 yizuw.cn，也不自动发送企业微信、短信或邮件。</p>
      </div>
    </section>

    <section id="faq" class="kw-section kw-service-faq-section" aria-labelledby="faq-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">常见问题</span>
            <h2 id="faq-title">购买、部署和使用前常见的问题</h2>
          </div>
          <p>所有回答都以当前能力状态、项目配置与评估接入边界为准。</p>
        </div>
        <ServiceFaqAccordion />
      </div>
    </section>

    <section class="kw-final-cta" aria-labelledby="service-cta-title">
      <div v-reveal class="kw-container kw-final-cta__grid">
        <div>
          <span class="kw-section-kicker">项目沟通</span>
          <h2 id="service-cta-title">先确认您的园区场景和本期范围</h2>
          <p>预约后由工作人员从官网后台查看信息，再通过电话与您沟通，不承诺固定联系时限。</p>
          <div class="kw-final-cta__actions">
            <UiBaseButton to="/demo" size="large">预约项目沟通</UiBaseButton>
            <a class="kw-final-cta__phone" :href="siteConfig.contact.phoneHref">电话咨询：{{ siteConfig.contact.phone }}</a>
          </div>
        </div>
        <HomeQrPlaceholder />
      </div>
    </section>
  </div>
</template>
