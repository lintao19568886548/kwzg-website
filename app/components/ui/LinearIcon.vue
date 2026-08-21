<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 24,
  },
})

const icons = {
  building: ['M4 21V5l8-3v19', 'M12 8h8v13', 'M7 7h2M7 11h2M7 15h2M15 11h2M15 15h2M2 21h20'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  wallet: ['M4 5h15a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12', 'M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z'],
  cpu: ['M9 9h6v6H9z', 'M4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2', 'M7 7h10v10H7z'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-5'],
  network: ['M12 5v4', 'M6 19v-4h12v4', 'M6 15v-3h12v3', 'M12 9v3', 'M4 19h4v3H4zM10 2h4v3h-4zM16 19h4v3h-4z'],
  search: ['m21 21-4.35-4.35', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z'],
  chart: ['M4 19V5', 'M4 19h16', 'm7 15 4-5 3 3 5-7'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z'],
  message: ['M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z', 'M8 9h8M8 13h5'],
  'arrow-up': ['m6 10 6-6 6 6', 'M12 4v16'],
  close: ['M6 6l12 12M18 6 6 18'],
  cloud: ['M17.5 19H6a4 4 0 0 1-.2-8A6 6 0 0 1 17 8a4.5 4.5 0 0 1 .5 9Z'],
  server: ['M4 4h16v6H4zM4 14h16v6H4z', 'M8 7h.01M8 17h.01'],
  monitor: ['M3 4h18v12H3z', 'M8 20h8M12 16v4'],
  mobile: ['M7 2h10v20H7z', 'M11 18h2'],
  wrench: ['M14.7 6.3a4 4 0 0 0-5-5l2.2 2.2-2.4 2.4L7.3 3.7a4 4 0 0 0 5 5L21 17.3 17.3 21l-8.6-8.7a4 4 0 0 0-5-5'],
  clipboard: ['M9 5H6a2 2 0 0 0-2 2v13h16V7a2 2 0 0 0-2-2h-3', 'M9 3h6v4H9z', 'm8 13 2 2 5-5'],
  check: ['m5 12 4 4L19 6'],
}

const paths = computed(() => icons[props.name] || icons.check)
</script>

<template>
  <svg
    class="kw-linear-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      v-for="path in paths"
      :key="path"
      :d="path"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
