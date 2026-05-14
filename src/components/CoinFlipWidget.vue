<script setup lang="ts">
import { ref } from 'vue'

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
  <div class="coin-scene">
    <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }" :class="{ flippable: !flipping, virgin: history.length === 0 }" @click="flip">
      <div class="face heads"><span class="face-label">{{ history.length === 0 ? '?' : 'Орел' }}</span></div>
      <div class="face tails"><span class="face-label">Решка</span></div>
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
}

.face.heads {
  background: var(--color-accent-cyan);
  transform: translateZ(1px);
  box-shadow: 0 0 1.5em var(--color-accent-cyan), 0 0 3em rgb(from var(--color-accent-cyan) r g b / 0.4);
}

.coin.virgin .face.heads {
  background: var(--color-border);
  box-shadow: none;
}

.face.tails {
  background: var(--color-accent-magenta);
  transform: rotateY(180deg) translateZ(1px);
  box-shadow: 0 0 1.5em var(--color-accent-magenta), 0 0 3em rgb(from var(--color-accent-magenta) r g b / 0.4);
}

.face-label {
  color: var(--color-bg);
  font-size: 1.3em;
  font-weight: 700;
  pointer-events: none;
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
  border: 2px solid var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.flip-btn:hover:not(:disabled) {
  background: rgb(from var(--color-accent-cyan) r g b / 0.12);
  border-color: var(--color-accent-magenta);
  color: var(--color-accent-magenta);
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
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  opacity: 0.7;
}

.clear-btn:hover:not(:disabled) {
  border-color: var(--color-accent-magenta);
  color: var(--color-accent-magenta);
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
  border: 1px solid rgb(from var(--color-accent-blue) r g b / 0.4);
  border-radius: 4px;
  font-size: 0.95rem;
  background: transparent;
  color: var(--color-text);
}

.chip.heads {
  color: var(--color-accent-cyan);
  border-color: rgb(from var(--color-accent-cyan) r g b / 0.5);
  background: rgb(from var(--color-accent-cyan) r g b / 0.07);
  box-shadow: 0 0 0.4em rgb(from var(--color-accent-cyan) r g b / 0.25);
  text-shadow: 0 0 0.5em var(--color-accent-cyan);
}

.chip.tails {
  color: var(--color-accent-magenta);
  border-color: rgb(from var(--color-accent-magenta) r g b / 0.5);
  background: rgb(from var(--color-accent-magenta) r g b / 0.07);
  box-shadow: 0 0 0.4em rgb(from var(--color-accent-magenta) r g b / 0.25);
  text-shadow: 0 0 0.5em var(--color-accent-magenta);
}
</style>
