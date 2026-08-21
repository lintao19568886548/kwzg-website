<script setup>
import { siteConfig } from '~/config/site'

usePageSeo({
  title: '隐私政策',
  description: '了解瞰维智管官网预约演示所收集的信息、使用目的、保存边界与联系渠道。',
})

const sections = [
  { id: 'scope', title: '我们收集的信息', text: '预约演示表单收集姓名、手机号、园区数量、隐私同意时间和隐私政策版本。系统还会为限流生成不可逆摘要，但不在限流记录中保存完整手机号或 IP。' },
  { id: 'purpose', title: '使用目的', text: '上述信息仅用于联系预约演示及相关服务，由官网独立线索后台的单管理员查看和跟进。预约提交不向企业微信、短信或邮件系统发送通知。' },
  { id: 'storage', title: '保存与安全', text: '预约信息保存到官网独立数据库，与 yizuw.cn 生产系统完全隔离。管理员会话令牌只以摘要形式保存，管理接口需要服务端鉴权、同源和 CSRF 校验。' },
  { id: 'sharing', title: '共享边界', text: '当前功能不将预约信息写入 yizuw.cn，不描述或执行不存在的第三方自动共享。若未来处理方式发生变化，将先更新说明并完成必要审核。' },
  { id: 'rights', title: '查询、更正与删除', text: `如需查询、更正或删除预约信息，可致电 ${siteConfig.contact.phone}，或通过“${siteConfig.wecom.displayName}”企业微信联系。` },
  { id: 'review', title: '上线前审核', text: '本政策与 Stage 2 当前实现保持一致；正式上线前仍需由网站运营方完成最终人工隐私文本审核，并确认保存期限等运营规则。' },
]

const activeSection = ref(sections[0].id)
const sectionElements = ref([])
let sectionObserver

onMounted(() => {
  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (visible?.target?.id) activeSection.value = visible.target.id
  }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.4, 0.8] })
  sectionElements.value.forEach(element => sectionObserver.observe(element))
})

onBeforeUnmount(() => sectionObserver?.disconnect())
</script>

<template>
  <div class="kw-stage2-page kw-privacy-page">
    <section class="kw-stage2-hero kw-privacy-hero">
      <div class="kw-container"><div v-reveal><UiBaseTag>Privacy</UiBaseTag><h1>隐私政策</h1><p>本说明对应官网预约演示与单管理员线索后台的当前实际处理方式，不包含不存在的第三方共享或自动通知。</p></div></div>
    </section>

    <section class="kw-section">
      <div class="kw-container kw-privacy-layout">
        <nav v-reveal aria-label="隐私政策章节"><strong>阅读位置</strong><a v-for="(section, index) in sections" :key="section.id" :href="`#${section.id}`" :class="{ 'is-active': activeSection === section.id }"><span>0{{ index + 1 }}</span>{{ section.title }}</a></nav>
        <div class="kw-policy-content">
          <article v-for="section in sections" :id="section.id" :key="section.id" ref="sectionElements" v-reveal><h2>{{ section.title }}</h2><p>{{ section.text }}</p></article>
          <aside v-reveal class="kw-policy-contact"><strong>联系渠道</strong><a :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a><span>{{ siteConfig.wecom.displayName }}</span><small>企业微信认证主体：{{ siteConfig.wecom.verification }}</small></aside>
        </div>
      </div>
    </section>
  </div>
</template>
