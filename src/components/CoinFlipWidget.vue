<script setup lang="ts">
import { ref } from 'vue'
import headsRaw from '../assets/icons/heads.svg?raw'
import tailsRaw from '../assets/icons/tails.svg?raw'

function prepareCoinSvg(raw: string): string {
  return raw.replace(/<path /, '<path fill="currentColor" ')
}

const headsSvg = prepareCoinSvg(headsRaw)
const tailsSvg = prepareCoinSvg(tailsRaw)

type Side = 'heads' | 'tails'

const rotation = ref(0)
const flipping = ref(false)
const result = ref<Side | null>(null)
const history = ref<Side[]>([])

function flip() {
  if (flipping.value) return
  flipping.value = true
  result.value = null

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
  }, 1500)
}

function clear() {
  if (flipping.value) return
  result.value = null
  history.value = []
}
</script>

<template>
  <div class="widget">
  <div class="coin-scene">
    <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }" :class="{ flippable: !flipping, virgin: history.length === 0 }" @click="flip">
      <div class="face heads">
        <span v-if="history.length > 0" class="coin-icon" v-html="headsSvg"/>
      </div>
      <div class="face tails">
        <span v-if="history.length > 0" class="coin-icon" v-html="tailsSvg"/>
      </div>
    </div>
  </div>

  <div class="action-row">
    <button class="flip-btn" :disabled="flipping" @click="flip">
      {{ flipping ? 'Крутится...' : 'Бросить' }}
    </button>
    <button class="clear-btn" :disabled="flipping || history.length === 0" @click="clear">
      Очистить
    </button>
  </div>

  <div v-if="history.length > 0" class="history">
    <span
      v-for="(side, i) in history"
      :key="i"
      class="chip"
      :class="side"
    >{{ side === 'heads' ? 'Орел' : 'Решка' }}</span>
  </div>
  </div>
</template>

<style scoped>
.widget {
  max-width: 450px;
  margin: 0 auto;
}

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

.action-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.action-row button {
  flex: 1;
}

.flip-btn {
  padding: 0.55em 2.5em;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.flip-btn:hover:not(:disabled) {
  background: rgb(from var(--color-primary) r g b / 0.12);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.flip-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.clear-btn {
  padding: 0.55em 1.5em;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--color-bg-secondary);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  opacity: 0.7;
}

.clear-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  opacity: 1;
}

.clear-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.25em 0.65em;
  border: 1px solid rgb(from var(--color-control-bg) r g b / 0.4);
  border-radius: 4px;
  font-size: 0.95rem;
  background: transparent;
}

.chip.heads {
  color: var(--color-primary);
  border-color: rgb(from var(--color-primary) r g b / 0.5);
  background: rgb(from var(--color-primary) r g b / 0.07);
}

.chip.tails {
  color: var(--color-accent);
  border-color: rgb(from var(--color-accent) r g b / 0.5);
  background: rgb(from var(--color-accent) r g b / 0.07);
}
</style>
