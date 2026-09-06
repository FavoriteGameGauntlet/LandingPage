<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import rulesIcon from '../assets/icons/rules.svg?raw'
import toolsIcon from '../assets/icons/tools.svg?raw'
import gamesIcon from '../assets/icons/games.svg?raw'
import seasonsIcon from '../assets/icons/seasons.svg?raw'
import volumeIcon from '../assets/icons/game/volume.svg?raw'
import muteIcon from '../assets/icons/game/mute.svg?raw'
import glitchSound from '../assets/sounds/glitch.ogg'
import whooshSound from '../assets/sounds/whoosh.ogg'
import swipeSound from '../assets/sounds/swipe.ogg'

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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const glitchAudio = new Audio(glitchSound)
glitchAudio.volume = 0.175

const whooshAudio = new Audio(whooshSound)
whooshAudio.volume = 0.175

const swipeAudio = new Audio(swipeSound)
swipeAudio.volume = 0.15

// Nothing is fetched up front; each sound is warmed shortly before it is needed
for (const audio of [glitchAudio, whooshAudio, swipeAudio]) audio.preload = 'none'

function warm(audio: HTMLAudioElement) {
  audio.preload = 'auto'
  audio.load()
}

// Only the glitch needs asking: it runs before any click, and the autoplay policy keeps the page
// silent until one happens. Everything from the reveal on is unlocked by the click on the logo.
const glitchSoundEnabled = ref(false)

function toggleGlitchSound() {
  glitchSoundEnabled.value = !glitchSoundEnabled.value
  if (glitchSoundEnabled.value) warm(glitchAudio)
  else glitchAudio.pause()
}

function play(audio: HTMLAudioElement, rate: number) {
  audio.currentTime = 0
  audio.playbackRate = rate
  audio.play().catch(() => {})
}

// The four card ticks overlap, so each needs its own element
function playTick(rate: number) {
  const tick = swipeAudio.cloneNode() as HTMLAudioElement
  tick.volume = swipeAudio.volume
  play(tick, rate)
}

function playReveal() {
  if (reducedMotion) return
  // Double click runs the reveal 3x faster; speeding the cues up keeps them in sync
  const rate = fastReveal.value ? 3 : 1
  play(whooshAudio, rate)
  // Offsets are the card-rise delays from the CSS below
  for (const delay of [400, 520, 640, 760]) {
    cueTimers.push(setTimeout(() => playTick(rate), delay / rate))
  }
}

function playGlitchSound() {
  if (reducedMotion || !glitchSoundEnabled.value) return
  play(glitchAudio, 1)
}

const introVisible = ref(true)
const introExiting = ref(false)
const glitchActive = ref(false)
const fastReveal = ref(false)

let glitchTimer: ReturnType<typeof setTimeout> | null = null
let exitTimer: ReturnType<typeof setTimeout> | null = null
const cueTimers: ReturnType<typeof setTimeout>[] = []

function scheduleGlitch() {
  const delay = 2000 + Math.random() * 3000
  glitchTimer = setTimeout(() => {
    if (!introVisible.value) return
    glitchActive.value = true
    playGlitchSound()
    setTimeout(() => {
      glitchActive.value = false
      scheduleGlitch()
    }, 2686)
  }, delay)
}

onMounted(() => {
  glitchActive.value = true
  playGlitchSound()
  setTimeout(() => {
    glitchActive.value = false
    scheduleGlitch()
  }, 2686)
})
onUnmounted(() => {
  if (glitchTimer) clearTimeout(glitchTimer)
  for (const t of cueTimers) clearTimeout(t)
  glitchAudio.pause()
  whooshAudio.pause()
})

function revealHero() {
  introVisible.value = false
  playReveal()
}

function enterSite() {
  if (introExiting.value) return
  introExiting.value = true
  glitchActive.value = false
  if (glitchTimer) clearTimeout(glitchTimer)
  // This click is also the gesture that unlocks audio, so pull the reveal cues in now
  warm(whooshAudio)
  warm(swipeAudio)
  exitTimer = setTimeout(() => { revealHero() }, 700)
}

function enterSiteFast() {
  fastReveal.value = true
  if (!introExiting.value) {
    enterSite()
    if (exitTimer) clearTimeout(exitTimer)
    exitTimer = setTimeout(() => { revealHero() }, 233)
  } else if (exitTimer) {
    clearTimeout(exitTimer)
    exitTimer = setTimeout(() => { revealHero() }, 233)
  }
}
</script>

<template>
  <Transition name="intro">
    <div v-if="introVisible" class="intro" :class="{ exiting: introExiting, fast: fastReveal }">
      <div class="intro-glitch" :class="{ active: glitchActive && !introExiting }">
        <div class="intro-glitch__layer intro-glitch__layer--1"></div>
        <div class="intro-glitch__layer intro-glitch__layer--2"></div>
        <div class="intro-glitch__layer intro-glitch__layer--3"></div>
        <div class="intro-glitch__flash"></div>
      </div>
      <div class="intro-logo-wrap" :class="{ active: glitchActive && !introExiting }" @click="enterSite" @dblclick="enterSiteFast">
        <img :src="`${s3}/logos/fggw3.webp`" alt="FGG Logo" class="intro-logo" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--1" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--2" />
        <img :src="`${s3}/logos/fggw3.webp`" aria-hidden="true" class="intro-logo__layer intro-logo__layer--3" />
      </div>
      <div class="intro-sound-wrap">
        <span v-if="!glitchSoundEnabled" class="intro-sound-hint">звук глитча</span>
        <button class="intro-sound" :aria-label="glitchSoundEnabled ? 'Выключить звук глитча' : 'Включить звук глитча'" v-html="glitchSoundEnabled ? volumeIcon : muteIcon" @click="toggleGlitchSound"></button>
      </div>
    </div>
  </Transition>

  <div class="main">
    <section class="hero" :class="{ revealed: !introVisible, fast: fastReveal }">
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
  /* 22% of this is the visible glitch — matched to the 0.591s glitch.ogg */
  --anim-duration: 2.686s;

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

.intro.exiting.fast {
  animation-duration: 0.23s;
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

.intro-sound-wrap {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.intro-sound-hint {
  color: var(--color-primary);
  font-size: 1.1rem;
  opacity: 0.7;
  white-space: nowrap;
  pointer-events: none;
}

.intro-sound {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, transform 0.2s;
}

.intro-sound:hover {
  opacity: 1;
  transform: scale(1.1);
}

.intro-sound :deep(svg) {
  width: 4rem;
  height: 4rem;
  display: block;
  fill: var(--color-primary);
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
  animation-timing-function: linear;
  animation-iteration-count: 1;
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
  height: calc(100dvh - 73px);
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

/* ── HERO FAST REVEAL (3x speed on double-click) ─────────────── */

.hero.fast.revealed .hero-bg {
  animation-duration: 0.83s;
}
.hero.fast.revealed .hero-title {
  animation-duration: 0.18s;
  animation-delay: 0.08s;
}
.hero.fast.revealed .card-wrap:nth-child(1) { animation-duration: 0.17s; animation-delay: 0.13s; }
.hero.fast.revealed .card-wrap:nth-child(2) { animation-duration: 0.17s; animation-delay: 0.17s; }
.hero.fast.revealed .card-wrap:nth-child(3) { animation-duration: 0.17s; animation-delay: 0.21s; }
.hero.fast.revealed .card-wrap:nth-child(4) { animation-duration: 0.17s; animation-delay: 0.25s; }

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
  user-select: none;
  -webkit-user-select: none;
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

/* ── REDUCED MOTION ───────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .intro-logo-wrap.active .intro-logo__layer,
  .intro-glitch.active .intro-glitch__layer,
  .intro-glitch.active .intro-glitch__flash {
    animation: none;
  }

  .hero.revealed .hero-bg,
  .hero.revealed .hero-title,
  .hero.revealed .card-wrap {
    animation: none;
  }

  .hero.revealed .hero-bg {
    transform: scale(1);
  }

  .hero.revealed .hero-title,
  .hero.revealed .card-wrap {
    opacity: 1;
    transform: none;
  }
}
</style>
