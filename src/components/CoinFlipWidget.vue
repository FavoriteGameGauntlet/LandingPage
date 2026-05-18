<script setup lang="ts">
import { ref, computed } from 'vue'
import headsRaw from '../assets/icons/heads.svg?raw'
import tailsRaw from '../assets/icons/tails.svg?raw'
import HistoryChips from './HistoryChips.vue'

function prepareCoinSvg(raw: string): string {
  return raw.replace(/<path /, '<path fill="currentColor" ')
}

const headsSvg = prepareCoinSvg(headsRaw)
const tailsSvg = prepareCoinSvg(tailsRaw)

type Side = 'heads' | 'tails'

const rotation = ref(0)
const flipping = ref(false)
const noTransition = ref(false)
const result = ref<Side | null>(null)
const history = ref<Side[]>([])
const showResult = ref(false)
const slowHide = ref(false)
let resultTimer: ReturnType<typeof setTimeout> | null = null

function hideInstant() {
  if (resultTimer) { clearTimeout(resultTimer); resultTimer = null }
  slowHide.value = false
  showResult.value = false
}

function flip() {
  if (flipping.value) return
  flipping.value = true
  result.value = null
  hideInstant()

  const side: Side = Math.random() < 0.5 ? 'heads' : 'tails'
  const targetAngle = side === 'heads' ? 0 : 180
  const current = rotation.value % 360
  let delta = targetAngle - current
  if (delta <= 0) delta += 360
  rotation.value += delta + (4 + Math.floor(Math.random() * 4)) * 360

  setTimeout(() => {
    result.value = side
    history.value.unshift(side)
    flipping.value = false
    showResult.value = true
    resultTimer = setTimeout(() => {
      slowHide.value = true
      showResult.value = false
      setTimeout(() => { slowHide.value = false }, 400)
    }, 3000)
  }, 1500)
}

function clear() {
  if (flipping.value) return
  result.value = null
  history.value = []
  noTransition.value = true
  rotation.value = 0
  setTimeout(() => { noTransition.value = false }, 0)
  hideInstant()
}

const historyItems = computed(() =>
  history.value.map(side => ({
    label: side === 'heads' ? 'Орел' : 'Решка',
    variant: (side === 'heads' ? 'primary' : 'accent') as 'primary' | 'accent',
  }))
)
</script>

<template>
  <div class="widget">
  <div class="coin-scene">
    <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }" :class="{ flippable: !flipping, virgin: history.length === 0, 'no-transition': noTransition }" @click="flip">
      <div class="face heads">
        <span v-if="history.length > 0 || flipping" class="coin-icon" v-html="headsSvg"/>
      </div>
      <div class="face tails">
        <span v-if="history.length > 0 || flipping" class="coin-icon" v-html="tailsSvg"/>
      </div>
    </div>
    <div class="result-strip" :class="{ visible: showResult, 'slow-hide': slowHide }">
      {{ result === 'heads' ? 'Орел' : 'Решка' }}
    </div>
  </div>

  <div class="action-row">
    <button class="btn-primary" :disabled="flipping" @click="flip">
      {{ flipping ? 'Крутится...' : 'Бросить' }}
    </button>
    <button class="btn-secondary" :disabled="flipping || history.length === 0" @click="clear">
      Очистить
    </button>
  </div>

  <HistoryChips :items="historyItems" />
  </div>
</template>

<style scoped>
.coin-scene {
  perspective: 600px;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.coin {
  position: relative;
  width: 10em;
  height: 10em;
  transform-style: preserve-3d;
  transition: transform 1.5s cubic-bezier(0.15, 0, 0.25, 1);
}

.coin.no-transition {
  transition: none;
}

.coin.flippable {
  cursor: pointer;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border: 3px solid var(--color-primary);
}

.face.heads {
  transform: translateZ(1px);
  color: var(--color-primary);
}

.face.tails {
  transform: rotateY(180deg) translateZ(1px);
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: rgb(from var(--color-accent) r g b / 0.08);
}

.coin-icon {
  width: 55%;
  height: 55%;
  display: flex;
}

.coin-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.coin-scene {
  position: relative;
}

.result-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  padding: 0.5em 0;
  background: linear-gradient(
    to right,
    transparent,
    rgb(from var(--color-bg-secondary) r g b / 0.88) 17%,
    rgb(from var(--color-bg-secondary) r g b / 0.88) 83%,
    transparent
  );
  opacity: 0;
  pointer-events: none;
}

.result-strip.slow-hide {
  transition: opacity 0.4s;
}

.result-strip.visible {
  opacity: 1;
  transition: opacity 0.1s;
}

.action-row {
  margin-bottom: 1.75rem;
}
</style>
