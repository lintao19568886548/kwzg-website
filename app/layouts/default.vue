<template>
  <div class="kw-site-shell">
    <a class="kw-skip-link" href="#main-content">跳到主要内容</a>
    <SiteHeader />

    <main id="main-content">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
