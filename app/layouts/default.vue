<template>
  <div class="kw-site-shell">
    <a class="kw-skip-link" href="#main-content">跳到主要内容</a>
    <span id="kw-scroll-sentinel" class="kw-scroll-sentinel" aria-hidden="true" />
    <SiteHeader />

    <main id="main-content" tabindex="-1">
      <slot />
    </main>

    <SiteFooter v-reveal />
    <FloatingContactBar />
  </div>
</template>
