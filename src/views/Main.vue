<script setup lang="ts">
import appIcon from '../assets/icons/app.svg?raw'
import rulesIcon from '../assets/icons/rules.svg?raw'
import toolsIcon from '../assets/icons/tools.svg?raw'
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
</script>

<template>
  <div class="main">
    <section class="hero" :style="{ backgroundImage: `url(${s3}/posters/fggw3.webp)` }">
      <h1 class="hero-title">Favorite Game Gauntlet</h1>
      <img :src="`${s3}/logos/fggw3.webp`" alt="FGG Logo" class="hero-logo" />
      <section class="cards">
        <div class="card-wrap" :style="{ background: cardGradients[0] }">
          <router-link to="/app" class="card">
            <div class="card-header">
              <div class="card-title">Приложение</div>
              <div class="card-icon" :style="{ background: iconGradients[0] }"><span class="icon-inner" v-html="appIcon"></span></div>
            </div>
            <div class="card-desc">Запусти игровой трекер и следи за ходом партии</div>
          </router-link>
        </div>
        <div class="card-wrap" :style="{ background: cardGradients[1] }">
          <router-link to="/rules" class="card">
            <div class="card-header">
              <div class="card-title">Правила</div>
              <div class="card-icon" :style="{ background: iconGradients[1] }"><span class="icon-inner" v-html="rulesIcon"></span></div>
            </div>
            <div class="card-desc">Всё, что нужно знать перед игрой</div>
          </router-link>
        </div>
        <div class="card-wrap" :style="{ background: cardGradients[2] }">
          <router-link to="/tools" class="card">
            <div class="card-header">
              <div class="card-title">Инструменты</div>
              <div class="card-icon" :style="{ background: iconGradients[2] }"><span class="icon-inner" v-html="toolsIcon"></span></div>
            </div>
            <div class="card-desc">Кубики, монетка и колесо фортуны</div>
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

  background-size: cover;
  background-position: center;

  position: relative;
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

.hero-logo {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -55%);
  height: clamp(25rem, 60vw, 45rem);
  object-fit: contain;
  z-index: 2;
}

.hero-title {
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
