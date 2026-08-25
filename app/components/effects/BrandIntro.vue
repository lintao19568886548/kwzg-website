<script setup>
import BrandIntroParticles from '~/components/effects/BrandIntroParticles.vue'
import { useBrandIntro } from '~/composables/useBrandIntro'

const brandLogoSource = '/assets/logo/kwzg-logo-symbol.png'

const {
  active,
  compact,
  exiting,
  handleCanvasUnavailable,
  reducedMotion,
  rendered,
  skip,
} = useBrandIntro()

function handleSkip(event) {
  skip({ focusMain: event.detail === 0 })
}
</script>

<template>
  <div
    v-if="rendered"
    class="kw-brand-intro"
    :class="{
      'is-active': active,
      'is-compact': compact,
      'is-reduced': reducedMotion,
      'is-skipping': exiting,
    }"
    data-brand-intro
    data-kwzg-brand-intro
  >
    <div class="kw-brand-intro__visual" aria-hidden="true">
      <div class="kw-brand-intro__door kw-brand-intro__door--left" />
      <div class="kw-brand-intro__door kw-brand-intro__door--right" />
      <div class="kw-brand-intro__grid" />
      <BrandIntroParticles
        :active="active && !exiting && !reducedMotion"
        :compact="compact"
        :reduced="reducedMotion"
        @unavailable="handleCanvasUnavailable"
      />

      <div class="kw-brand-intro__content">
        <div class="kw-brand-intro__seal">
          <span />
          <img
            :src="brandLogoSource"
            alt=""
            width="300"
            height="300"
            decoding="sync"
            fetchpriority="high"
          >
        </div>
        <div class="kw-brand-intro__name">瞰维智管</div>
        <div class="kw-brand-intro__tagline">
          <span>告别事务缠身，</span>
          <span><span class="kw-brand-intro__accent">指尖掌控全局</span></span>
        </div>
      </div>

      <div class="kw-brand-intro__opening-line" />
    </div>

    <button
      type="button"
      class="kw-brand-intro__skip"
      aria-label="跳过品牌开场，进入首页"
      @click="handleSkip"
    >
      跳过
      <span aria-hidden="true">→</span>
    </button>
  </div>
</template>

<style scoped>
.kw-brand-intro {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: none;
  min-width: 20rem;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  color: #F7F2E8;
  background: transparent;
  pointer-events: auto;
  animation: kw-brand-intro-failsafe 4.8s steps(1, end) forwards;
  isolation: isolate;
}

:global(html[data-kwzg-intro='show'] [data-kwzg-brand-intro]) {
  display: block;
}

:global(html:not([data-kwzg-intro='show']) [data-kwzg-brand-intro]) {
  display: none;
}

.kw-brand-intro.is-skipping {
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.kw-brand-intro__visual,
.kw-brand-intro__door,
.kw-brand-intro__grid {
  position: absolute;
  inset: 0;
}

.kw-brand-intro__visual {
  overflow: hidden;
  pointer-events: none;
}

.kw-brand-intro__door {
  z-index: 1;
  width: 50.2%;
  background:
    radial-gradient(circle at 50% 46%, rgba(178, 138, 80, 0.1), transparent 16rem),
    linear-gradient(135deg, #001A43, #002359);
}

.kw-brand-intro__door::after {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  background-image:
    linear-gradient(45deg, transparent 47.5%, rgba(247, 242, 232, 0.16) 48% 52%, transparent 52.5%),
    linear-gradient(-45deg, transparent 47.5%, rgba(247, 242, 232, 0.16) 48% 52%, transparent 52.5%);
  background-size: 3.5rem 3.5rem;
  content: '';
}

.kw-brand-intro__door--left {
  right: auto;
  transform-origin: left center;
}

.kw-brand-intro__door--right {
  left: auto;
  transform-origin: right center;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__door--left {
  animation: kw-brand-intro-door-left 700ms cubic-bezier(0.76, 0, 0.24, 1) 3550ms both;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__door--right {
  animation: kw-brand-intro-door-right 700ms cubic-bezier(0.76, 0, 0.24, 1) 3550ms both;
}

.kw-brand-intro__grid {
  z-index: 2;
  opacity: 0;
  background:
    linear-gradient(rgba(247, 242, 232, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(247, 242, 232, 0.055) 1px, transparent 1px);
  background-size: 4rem 4rem;
  mask-image: radial-gradient(circle at center, #000, transparent 72%);
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__grid {
  animation: kw-brand-intro-grid 3.2s ease 100ms both;
}

.kw-brand-intro__content {
  position: absolute;
  z-index: 4;
  inset: 0;
  display: grid;
  width: min(calc(100% - 3rem), 50rem);
  height: max-content;
  margin: auto;
  justify-items: center;
  text-align: center;
  transform: none;
}

.kw-brand-intro__seal {
  position: relative;
  display: grid;
  width: clamp(5rem, 8vw, 6.75rem);
  margin-bottom: clamp(1rem, 2vw, 1.35rem);
  opacity: 0;
  place-items: center;
  transform: scale(0.96);
  aspect-ratio: 1;
}

.kw-brand-intro__seal span {
  position: absolute;
  inset: -1.1rem;
  border: 1px solid rgba(201, 86, 67, 0.44);
  border-radius: 50%;
  opacity: 0;
}

.kw-brand-intro__seal img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__seal {
  animation: kw-brand-intro-seal 550ms cubic-bezier(0.22, 1, 0.36, 1) 600ms both;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__seal span {
  animation: kw-brand-intro-ring 720ms ease-out 620ms both;
}

.kw-brand-intro__name {
  color: #FCFAF5;
  font-size: clamp(2.4rem, 5.3vw, 4.85rem);
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.08;
  opacity: 0;
  clip-path: inset(0 100% 0 0);
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__name {
  animation: kw-brand-intro-name 550ms cubic-bezier(0.22, 1, 0.36, 1) 850ms both;
}

.kw-brand-intro__tagline {
  display: grid;
  margin-top: clamp(1.25rem, 2.6vw, 1.8rem);
  color: rgba(247, 242, 232, 0.88);
  font-size: clamp(1rem, 1.8vw, 1.35rem);
  font-weight: 500;
  letter-spacing: 0.075em;
  line-height: 1.85;
}

.kw-brand-intro__tagline > span {
  display: block;
  opacity: 0;
  transform: translateY(10px);
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__tagline > span:first-child {
  animation: kw-brand-intro-copy 450ms ease-out 1150ms both;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__tagline > span:last-child {
  animation: kw-brand-intro-copy 500ms ease-out 1400ms both;
}

.kw-brand-intro__accent {
  color: #E17A68;
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__content {
  animation: kw-brand-intro-content-exit 300ms ease 3350ms both;
}

.kw-brand-intro__opening-line {
  position: absolute;
  z-index: 5;
  top: 50%;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #C95643 18% 82%, transparent);
  opacity: 0;
  transform: translate(-50%, -50%);
}

.kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__opening-line {
  animation: kw-brand-intro-opening-line 520ms ease-out 3450ms both;
}

.kw-brand-intro__skip {
  position: absolute;
  z-index: 8;
  top: max(1.25rem, env(safe-area-inset-top));
  right: max(1.25rem, env(safe-area-inset-right));
  display: inline-flex;
  min-width: 4.5rem;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.85rem;
  border: 1px solid rgba(247, 242, 232, 0.3);
  border-radius: 0.35rem;
  color: rgba(252, 250, 245, 0.82);
  background: rgba(0, 26, 67, 0.42);
  cursor: pointer;
  gap: 0.45rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.kw-brand-intro__skip:hover {
  border-color: rgba(201, 86, 67, 0.78);
  color: #FFFFFF;
  background: rgba(168, 58, 42, 0.55);
}

.kw-brand-intro__skip:focus-visible {
  outline: 3px solid #C95643;
  outline-offset: 3px;
}

.kw-brand-intro.is-reduced .kw-brand-intro__grid,
.kw-brand-intro.is-reduced .kw-brand-intro-particles,
.kw-brand-intro.is-reduced .kw-brand-intro__opening-line {
  display: none;
}

.kw-brand-intro.is-reduced .kw-brand-intro__seal,
.kw-brand-intro.is-reduced .kw-brand-intro__name,
.kw-brand-intro.is-reduced .kw-brand-intro__tagline > span {
  opacity: 1;
  clip-path: none;
  transform: none;
}

@keyframes kw-brand-intro-grid {
  0% { opacity: 0; }
  18%, 82% { opacity: 0.34; }
  100% { opacity: 0; }
}

@keyframes kw-brand-intro-seal {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}

@keyframes kw-brand-intro-ring {
  0% { opacity: 0; transform: scale(0.72); }
  35% { opacity: 0.62; }
  100% { opacity: 0; transform: scale(1.35); }
}

@keyframes kw-brand-intro-name {
  from { opacity: 0; clip-path: inset(0 100% 0 0); }
  to { opacity: 1; clip-path: inset(0); }
}

@keyframes kw-brand-intro-copy {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

@keyframes kw-brand-intro-content-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes kw-brand-intro-opening-line {
  0% { width: 0; opacity: 0; }
  35% { opacity: 1; }
  100% { width: 100%; opacity: 0; }
}

@keyframes kw-brand-intro-door-left {
  from { transform: none; }
  to { transform: translateX(-100%); }
}

@keyframes kw-brand-intro-door-right {
  from { transform: none; }
  to { transform: translateX(100%); }
}

@keyframes kw-brand-intro-failsafe {
  0%, 99% { visibility: visible; opacity: 1; pointer-events: auto; }
  100% { visibility: hidden; opacity: 0; pointer-events: none; }
}

@keyframes kw-brand-intro-reduced-failsafe {
  0%, 70% { visibility: visible; opacity: 1; pointer-events: auto; }
  100% { visibility: hidden; opacity: 0; pointer-events: none; }
}

@media (max-width: 48rem), (pointer: coarse), (update: slow) {
  .kw-brand-intro {
    animation-duration: 3.8s;
  }

  .kw-brand-intro__door::after {
    opacity: 0.08;
    background-size: 3rem 3rem;
  }

  .kw-brand-intro__content {
    width: min(calc(100% - 2.5rem), 27rem);
    transform: none;
  }

  .kw-brand-intro__seal {
    width: clamp(4.75rem, 22vw, 5.75rem);
  }

  .kw-brand-intro__name {
    font-size: clamp(2.25rem, 12vw, 3.25rem);
    letter-spacing: 0.11em;
  }

  .kw-brand-intro__tagline {
    margin-top: 1.1rem;
    font-size: clamp(0.95rem, 4.5vw, 1.1rem);
    letter-spacing: 0.035em;
    line-height: 1.75;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__seal {
    animation-delay: 450ms;
    animation-duration: 500ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__seal span {
    animation-delay: 470ms;
    animation-duration: 560ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__name {
    animation-delay: 650ms;
    animation-duration: 400ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__tagline > span:first-child {
    animation-delay: 800ms;
    animation-duration: 360ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__tagline > span:last-child {
    animation-delay: 1020ms;
    animation-duration: 360ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__content {
    animation-delay: 2600ms;
    animation-duration: 240ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__opening-line {
    animation-delay: 2700ms;
    animation-duration: 430ms;
  }

  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__door--left,
  .kw-brand-intro.is-active:not(.is-reduced) .kw-brand-intro__door--right {
    animation-delay: 2750ms;
    animation-duration: 550ms;
  }

  .kw-brand-intro__skip {
    top: calc(max(0.8rem, env(safe-area-inset-top)) + 0.25rem);
    right: max(0.8rem, env(safe-area-inset-right));
    min-width: 4.25rem;
    min-height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kw-brand-intro {
    animation-name: kw-brand-intro-reduced-failsafe;
    animation-duration: 900ms;
    animation-timing-function: ease;
  }

  .kw-brand-intro *,
  .kw-brand-intro *::before,
  .kw-brand-intro *::after {
    animation: none !important;
    transition: none !important;
  }

  .kw-brand-intro__grid,
  .kw-brand-intro-particles,
  .kw-brand-intro__opening-line {
    display: none;
  }

  .kw-brand-intro__seal,
  .kw-brand-intro__name,
  .kw-brand-intro__tagline > span {
    opacity: 1;
    clip-path: none;
    transform: none;
  }
}

:global(html[data-motion='off'] [data-kwzg-brand-intro]) {
  animation-name: kw-brand-intro-reduced-failsafe;
  animation-duration: 900ms;
  animation-timing-function: ease;
}

:global(html[data-motion='off'] [data-kwzg-brand-intro] *),
:global(html[data-motion='off'] [data-kwzg-brand-intro] *::before),
:global(html[data-motion='off'] [data-kwzg-brand-intro] *::after) {
  animation: none !important;
  transition: none !important;
}

:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro__grid),
:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro-particles),
:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro__opening-line) {
  display: none;
}

:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro__seal),
:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro__name),
:global(html[data-motion='off'] [data-kwzg-brand-intro] .kw-brand-intro__tagline > span) {
  opacity: 1;
  clip-path: none;
  transform: none;
}
</style>
