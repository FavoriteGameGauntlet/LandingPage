<script setup lang="ts">
import { ref } from 'vue'
import rulesIcon from '../assets/icons/rules.svg?raw'
import toolsIcon from '../assets/icons/tools.svg?raw'
import gamesIcon from '../assets/icons/games.svg?raw'
import seasonsIcon from '../assets/icons/seasons.svg?raw'

const s3 = import.meta.env.VITE_S3_BASE_URL

const style = getComputedStyle(document.documentElement)
const COLORS = ['--color-grad-1', '--color-grad-2', '--color-grad-3', '--color-grad-4', '--color-grad-5', '--color-grad-6', '--color-grad-7']
  .map(v => style.getPropertyValue(v).trim())
const ICON_COLORS = COLORS.slice(0, 4)

function randomGradient(palette = COLORS): string {
  const shuffled = [...palette].sort(() => Math.random() - 0.5)
  const angle = Math.floor(Math.random() * 360)
  return `conic-gradient(from ${angle}deg, ${shuffled.join(', ')}, ${shuffled[0]})`
}

const cardGradients = Array.from({ length: 4 }, () => randomGradient())
const iconGradients = Array.from({ length: 4 }, () => randomGradient(ICON_COLORS))

const introVisible = ref(true)
const introExiting = ref(false)


function enterSite() {
  if (introExiting.value) return
  introExiting.value = true
  setTimeout(() => { introVisible.value = false }, 700)
}
</script>

<template>
  <Transition name="intro">
    <div v-if="introVisible" class="intro" :class="{ exiting: introExiting }">
      <div class="intro-glitch" :class="{ active: !introExiting }">
        <div class="intro-glitch__layer intro-glitch__layer--1"></div>
        <div class="intro-glitch__layer intro-glitch__layer--2"></div>
        <div class="intro-glitch__layer intro-glitch__layer--3"></div>
        <div class="intro-glitch__flash"></div>
      </div>
      <div class="intro-logo-wrap" :class="{ active: !introExiting }" @click="enterSite">
        <img :src="`${s3}/logos/fggw3.webp`" alt="FGG Logo" class="intro-logo" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--1" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--2" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--3" />
      </div>
    </div>
  </Transition>

  <div class="main">
    <section class="hero" :class="{ revealed: !introVisible }">
      <div class="hero-bg" :style="{ backgroundImage: `url(${s3}/posters/fggw3.webp)` }"></div>
      <h1 class="hero-title">Favorite Game Gauntlet</h1>
      <section class="cards">
        <div class="card-wrap" :style="{ background: cardGradients[0] }">
          <router-link to="/rules" class="card">
            <div class="card-header">
              <div class="card-title">Правила</div>
              <div class="card-icon" :style="{ background: iconGradients[0] }"><span class="icon-inner" v-html="rulesIcon"></span></div>
            </div>
            <div class="card-desc">Всё, что нужно знать перед игрой</div>
          </router-link>
        </div>
        <div class="card-wrap" :style="{ background: cardGradients[1] }">
          <router-link to="/tools" class="card">
            <div class="card-header">
              <div class="card-title">Инструменты</div>
              <div class="card-icon" :style="{ background: iconGradients[1] }"><span class="icon-inner" v-html="toolsIcon"></span></div>
            </div>
            <div class="card-desc">Рандомайзеры и утилиты для игры</div>
          </router-link>
        </div>
        <div class="card-wrap" :style="{ background: cardGradients[2] }">
          <router-link to="/games" class="card">
            <div class="card-header">
              <div class="card-title">Игры</div>
              <div class="card-icon" :style="{ background: iconGradients[2] }"><span class="icon-inner" v-html="gamesIcon"></span></div>
            </div>
            <div class="card-desc">Все игры, участвовавшие в ивенте</div>
          </router-link>
        </div>
        <div class="card-wrap" :style="{ background: cardGradients[3] }">
          <router-link to="/seasons" class="card">
            <div class="card-header">
              <div class="card-title">Сезоны</div>
              <div class="card-icon" :style="{ background: iconGradients[3] }"><span class="icon-inner" v-html="seasonsIcon"></span></div>
            </div>
            <div class="card-desc">История и составы всех прошедших сезонов</div>
          </router-link>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
/* ── INTRO ────────────────────────────────────────────────────── */

.intro {
  --anim-duration: 4s;
  --anim-delay: 2s;

  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro.exiting {
  animation: intro-exit 0.7s cubic-bezier(0.4, 0, 0.6, 1) forwards;
}

@keyframes intro-exit {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

.intro-logo-wrap {
  --gap-h: 6px;
  --gap-v: 3px;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.intro-logo {
  height: clamp(20rem, 50vw, 38rem);
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
}

.intro-logo-wrap:hover .intro-logo {
  transform: scale(1.06);
}

.intro-logo-wrap:hover .intro-logo__layer,
.intro:has(.intro-logo-wrap:hover) .intro-glitch__layer,
.intro:has(.intro-logo-wrap:hover) .intro-glitch__flash {
  opacity: 0 !important;
}

/* ── GLITCH LAYERS ────────────────────────────────────────────── */

.intro-glitch {
  --gap-h: 10px;
  --gap-v: 5px;

  position: absolute;
  inset: 0;
  overflow: hidden;
}

.intro-logo__layer,
.intro-glitch__layer,
.intro-glitch__flash {
  position: absolute;
  top: calc(-1 * var(--gap-v));
  left: calc(-1 * var(--gap-h));
  width: calc(100% + var(--gap-h) * 2);
  height: calc(100% + var(--gap-v) * 2);
  opacity: 0;
}

.intro-logo__layer {
  object-fit: contain;
  pointer-events: none;
}

.intro-glitch__layer--1 { background-color: color-mix(in srgb, var(--color-accent) 90%, transparent); }
.intro-glitch__layer--2 { background-color: color-mix(in srgb, var(--color-accent) 55%, transparent); }
.intro-glitch__layer--3 { background-color: color-mix(in srgb, var(--color-accent) 25%, transparent); }

.intro-glitch__flash {
  background-color: #af4949;
  mix-blend-mode: overlay;
}

.intro-logo-wrap.active .intro-logo__layer,
.intro-glitch.active .intro-glitch__layer,
.intro-glitch.active .intro-glitch__flash {
  animation-duration: var(--anim-duration);
  animation-delay: var(--anim-delay);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.intro-logo-wrap.active .intro-logo__layer--1 { animation-name: glitch-anim-1; }
.intro-logo-wrap.active .intro-logo__layer--2 { animation-name: glitch-anim-2; }
.intro-logo-wrap.active .intro-logo__layer--3 { animation-name: glitch-anim-3; }

.intro-glitch.active .intro-glitch__layer--1 { animation-name: glitch-anim-1; }
.intro-glitch.active .intro-glitch__layer--2 { animation-name: glitch-anim-2; }
.intro-glitch.active .intro-glitch__layer--3 { animation-name: glitch-anim-3; }
.intro-glitch.active .intro-glitch__flash    { animation-name: glitch-anim-flash; }

@keyframes glitch-anim-1 {
  0% {
    opacity: 1;
    transform: translate3d(var(--gap-h), 0, 0);
    clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
  }
  2%    { clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%); }
  4%    { clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%); }
  6%    { clip-path: polygon(0 1%,  100% 1%,  100% 2%,  0 2%);  }
  8%    { clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%); }
  10%   { clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%); }
  12%   { clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%); }
  14%   { clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%); }
  16%   { clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%); }
  18%   { clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%); }
  20%   { clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%); }
  21.9% { opacity: 1; transform: translate3d(var(--gap-h), 0, 0); }
  22%, 100% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
    clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  }
}

@keyframes glitch-anim-2 {
  0% {
    opacity: 1;
    transform: translate3d(calc(-1 * var(--gap-h)), 0, 0);
    clip-path: polygon(0 25%, 100% 25%, 100% 30%, 0 30%);
  }
  3%    { clip-path: polygon(0 3%,  100% 3%,  100% 3%,  0 3%);  }
  5%    { clip-path: polygon(0 5%,  100% 5%,  100% 20%, 0 20%); }
  7%    { clip-path: polygon(0 20%, 100% 20%, 100% 20%, 0 20%); }
  9%    { clip-path: polygon(0 40%, 100% 40%, 100% 40%, 0 40%); }
  11%   { clip-path: polygon(0 52%, 100% 52%, 100% 59%, 0 59%); }
  13%   { clip-path: polygon(0 60%, 100% 60%, 100% 60%, 0 60%); }
  15%   { clip-path: polygon(0 75%, 100% 75%, 100% 75%, 0 75%); }
  17%   { clip-path: polygon(0 65%, 100% 65%, 100% 40%, 0 40%); }
  19%   { clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%); }
  20%   { clip-path: polygon(0 14%, 100% 14%, 100% 33%, 0 33%); }
  21.9% { opacity: 1; transform: translate3d(calc(-1 * var(--gap-h)), 0, 0); }
  22%, 100% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
    clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  }
}

@keyframes glitch-anim-3 {
  0% {
    opacity: 1;
    transform: translate3d(0, calc(-1 * var(--gap-v)), 0) scale3d(-1, -1, 1);
    clip-path: polygon(0 1%, 100% 1%, 100% 3%, 0 3%);
  }
  1.5%  { clip-path: polygon(0 10%, 100% 10%, 100% 9%,  0 9%);  }
  2%    { clip-path: polygon(0 5%,  100% 5%,  100% 6%,  0 6%);  }
  2.5%  { clip-path: polygon(0 20%, 100% 20%, 100% 20%, 0 20%); }
  3%    { clip-path: polygon(0 10%, 100% 10%, 100% 10%, 0 10%); }
  5%    { clip-path: polygon(0 30%, 100% 30%, 100% 25%, 0 25%); }
  5.5%  { clip-path: polygon(0 15%, 100% 15%, 100% 16%, 0 16%); }
  7%    { clip-path: polygon(0 40%, 100% 40%, 100% 39%, 0 39%); }
  8%    { clip-path: polygon(0 20%, 100% 20%, 100% 21%, 0 21%); }
  9%    { clip-path: polygon(0 60%, 100% 60%, 100% 55%, 0 55%); }
  10.5% { clip-path: polygon(0 30%, 100% 30%, 100% 31%, 0 31%); }
  11%   { clip-path: polygon(0 70%, 100% 70%, 100% 69%, 0 69%); }
  13%   { clip-path: polygon(0 40%, 100% 40%, 100% 41%, 0 41%); }
  14%   { clip-path: polygon(0 80%, 100% 80%, 100% 75%, 0 75%); }
  14.5% { clip-path: polygon(0 50%, 100% 50%, 100% 51%, 0 51%); }
  15%   { clip-path: polygon(0 90%, 100% 90%, 100% 90%, 0 90%); }
  16%   { clip-path: polygon(0 60%, 100% 60%, 100% 60%, 0 60%); }
  18%   { clip-path: polygon(0 100%, 100% 100%, 100% 99%, 0 99%); }
  20%   { clip-path: polygon(0 70%, 100% 70%, 100% 71%, 0 71%); }
  21.9% { opacity: 1; transform: translate3d(0, calc(-1 * var(--gap-v)), 0) scale3d(-1, -1, 1); }
  22%, 100% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
    clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  }
}

@keyframes glitch-anim-flash {
  0%, 5%     { opacity: 0.2; transform: translate3d(var(--gap-h), var(--gap-v), 0); }
  5.5%, 100% { opacity: 0;   transform: translate3d(0, 0, 0); }
}

/* ── MAIN / HERO ──────────────────────────────────────────────── */

.main {
  margin-top: -1.5rem;
}

.hero {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  height: calc(100vh - 73px);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 2.5rem 1rem 2rem;

  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
  transform: scale(2.8);
  transform-origin: center 25%;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 0.45) 0%,
    transparent 30%,
    transparent 55%,
    rgb(0 0 0 / 0.75) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* ── HERO REVEAL ANIMATIONS ───────────────────────────────────── */

.hero.revealed .hero-bg {
  animation: bg-zoom-out 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bg-zoom-out {
  from { transform: scale(2.8); }
  to   { transform: scale(1); }
}

.hero.revealed .hero-title {
  animation: title-drop 0.55s ease-out 0.25s both;
}

.hero.revealed .card-wrap:nth-child(1) { animation: card-rise 0.5s ease-out 0.4s  both; }
.hero.revealed .card-wrap:nth-child(2) { animation: card-rise 0.5s ease-out 0.52s both; }
.hero.revealed .card-wrap:nth-child(3) { animation: card-rise 0.5s ease-out 0.64s both; }
.hero.revealed .card-wrap:nth-child(4) { animation: card-rise 0.5s ease-out 0.76s both; }

@keyframes title-drop {
  from { opacity: 0; transform: translateX(-50%) translateY(-18px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── HERO ELEMENTS ────────────────────────────────────────────── */

.hero-title {
  opacity: 0;
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  margin: 0;
  font-family: "Rubik Glitch", sans-serif;
  font-size: clamp(1.5rem, calc(100vw / 14), 6rem);
  white-space: nowrap;
  font-weight: 400;
  text-align: center;
  color: var(--color-card-fg);
}

/* ── CARDS ────────────────────────────────────────────────────── */

.cards {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(270px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1280px;
  padding: 0 1rem;
  box-sizing: border-box;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  flex: 1;
  border: none;
  border-radius: 3px;
  background: var(--color-card-bg);
  color: var(--color-card-fg);
  text-decoration: none;
}

.card-wrap {
  opacity: 0;
  padding: 1px;
  border-radius: 4px;
  display: flex;
}

.card:hover {
  background: var(--color-card-bg-hover);
}

.card:hover .card-title {
  color: var(--color-accent);
  text-shadow: 0 0 0.5em var(--color-accent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  padding: 1px;
  border-radius: 4px;
  display: flex;
  margin-right: -0.75rem;
}

.icon-inner {
  flex: 1;
  border-radius: 3px;
  background: var(--color-card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  color: var(--color-card-fg);
  box-sizing: border-box;
}

.icon-inner :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.card-title {
  font-family: var(--font-heading), sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-card-fg);
  transition: color 0.2s, text-shadow 0.2s;
}

.card-desc {
  font-size: 0.85rem;
  opacity: 0.65;
  line-height: 1.5;
  text-shadow: none;
}

@media (max-width: 1180px) {
  .cards {
    grid-template-columns: repeat(2, minmax(270px, 1fr));
  }
}

@media (max-width: 860px) {
}

@media (max-width: 620px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
