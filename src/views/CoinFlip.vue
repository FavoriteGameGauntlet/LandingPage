<script setup lang="ts">
import { ref } from 'vue'

type Side = 'heads' | 'tails'

const rotation = ref(0)
const flipping = ref(false)
const result = ref<Side | null>(null)

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
    flipping.value = false
  }, 1500)
}
</script>

<template>
  <h1>Подброс монеты</h1>

  <div class="coin-scene">
    <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }">
      <div class="face heads"><span class="face-label">Орёл</span></div>
      <div class="face tails"><span class="face-label">Решка</span></div>
    </div>
  </div>

  <div class="status-row">
    <span v-if="result" class="status" :class="result">
      {{ result === 'heads' ? 'Орёл' : 'Решка' }}
    </span>
    <span v-else class="status-hint">{{ flipping ? 'Летит...' : ' ' }}</span>
  </div>

  <div class="action-row">
    <button class="flip-btn" :disabled="flipping" @click="flip">
      {{ flipping ? 'Летит...' : (result ? 'Ещё раз' : 'Бросить') }}
    </button>
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
  box-shadow:
    0 0 0 6px var(--color-accent-purple),
    0 0 28px rgb(from var(--color-accent-cyan) r g b / 0.4);
  transform: translateZ(1px);
}

.face.tails {
  background: var(--color-accent-magenta);
  transform: rotateY(180deg) translateZ(1px);
  box-shadow:
    0 0 0 6px var(--color-accent-purple),
    0 0 28px rgb(from var(--color-accent-magenta) r g b / 0.4);
}

.face-label {
  color: var(--color-bg);
  font-size: 1.3em;
  font-weight: 700;
  pointer-events: none;
}


.status-row {
  text-align: center;
  min-height: 2rem;
  margin-bottom: 1.5rem;
}

.status {
  font-size: 1.3rem;
  font-weight: 700;
}

.status.heads {
  color: var(--color-accent-cyan);
}

.status.tails {
  color: var(--color-accent-magenta);
}

.status-hint {
  font-size: 1.1rem;
  opacity: 0.5;
}

.action-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
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
</style>
