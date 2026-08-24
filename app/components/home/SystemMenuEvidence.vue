<script setup>
defineProps({
  moduleName: { type: String, required: true },
  items: { type: Array, required: true },
})
</script>

<template>
  <figure class="kw-menu-evidence" :aria-label="`${moduleName}真实系统菜单证据`">
    <div class="kw-menu-evidence__bar">
      <span /><span /><span />
      <small>瞰维智管 · 真实菜单结构</small>
    </div>
    <div class="kw-menu-evidence__body">
      <aside aria-hidden="true">
        <span>系统模块</span>
        <strong>{{ moduleName }}</strong>
        <small>MENU</small>
      </aside>
      <section>
        <span>菜单级证据</span>
        <h3>{{ moduleName }}</h3>
        <p>当前只展示已经核实的真实菜单名称，不借用其他模块页面。</p>
        <ul>
          <li v-for="(item, index) in items" :key="item">
            <small>{{ String(index + 1).padStart(2, '0') }}</small>
            <strong>{{ item }}</strong>
          </li>
        </ul>
        <em>独立页面截图待补充，不推断页面字段、按钮或状态。</em>
      </section>
    </div>
    <figcaption>该展示只证明模块名称与菜单结构，不代表独立页面界面。</figcaption>
  </figure>
</template>
