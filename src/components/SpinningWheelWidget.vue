<script setup lang="ts">
import { ref, computed } from 'vue'

const MAX_ITEMS = 20
const R = 185
const TEXT_R = 128
const SPIN_MS = 4000

const items = ref<string[]>([])
const newItemText = ref('')
const spinning = ref(false)
const result = ref<string | null>(null)
const rotation = ref(0)
const history = ref<string[]>([])

const canSpin = computed(() => items.value.length >= 2 && !spinning.value)

function addItem() {
  const text = newItemText.value.trim()
  if (!text || items.value.length >= MAX_ITEMS) return
  items.value.push(text)
  newItemText.value = ''
  result.value = null
}

function removeItem(index: number) {
  if (spinning.value) return
  items.value.splice(index, 1)
  result.value = null
}

function spin() {
  if (!canSpin.value) return
  spinning.value = true
  result.value = null

  const n = items.value.length
  const winIndex = Math.floor(Math.random() * n)
  const sectorAngle = 360 / n
  const winMid = winIndex * sectorAngle + sectorAngle / 2
  const targetMod = (360 - winMid + 360) % 360
  const currentMod = ((rotation.value % 360) + 360) % 360
  let delta = (targetMod - currentMod + 360) % 360
  if (delta < 5) delta += sectorAngle
  const extraSpins = 5 + Math.floor(Math.random() * 4)
  const finalRotation = rotation.value + extraSpins * 360 + delta
  rotation.value = finalRotation

  // Determine which sector is actually at the top after animation
  const finalMod = ((finalRotation % 360) + 360) % 360
  const topAngle = (360 - finalMod + 360) % 360
  const actualWinIndex = Math.floor(topAngle / sectorAngle) % n

  setTimeout(() => {
    result.value = items.value[actualWinIndex]
    history.value.unshift(items.value[actualWinIndex])
    spinning.value = false
  }, SPIN_MS)
}

function polar(angleDeg: number, radius = R) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: +(radius * Math.cos(rad)).toFixed(2), y: +(radius * Math.sin(rad)).toFixed(2) }
}

function sectorPath(i: number) {
  const n = items.value.length
  const sa = 360 / n
  const s = polar(i * sa)
  const e = polar((i + 1) * sa)
  const large = sa > 180 ? 1 : 0
  return `M0,0 L${s.x},${s.y} A${R},${R} 0 ${large} 1 ${e.x},${e.y} Z`
}

function textTransform(i: number) {
  const n = items.value.length
  const sa = 360 / n
  const mid = i * sa + sa / 2
  const { x, y } = polar(mid, TEXT_R)
  return `translate(${x},${y}) rotate(${mid})`
}

function truncate(text: string) {
  const angle = 360 / items.value.length
  const max = angle > 60 ? 16 : angle > 36 ? 12 : angle > 22 ? 8 : 6
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

const labelSize = computed(() => {
  const angle = 360 / Math.max(items.value.length, 1)
  if (angle > 90) return 14
  if (angle > 45) return 13
  if (angle > 25) return 11
  return 9
})

// Cycling neon sector styles (3 colors)
const FILLS   = ['#0d3a50', '#2d1045', '#0d2238']
const STROKES = ['#0abdc6', '#711c91', '#ea00d9']
</script>

<template>
  <div class="wheel-tool">
    <!-- Left: wheel -->
    <div class="wheel-area">
      <div class="wheel-container">
        <svg viewBox="0 0 400 400" class="wheel-svg">
          <defs>
            <linearGradient id="wheel-result-bg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stop-color="#091833" stop-opacity="0"/>
              <stop offset="25%"  stop-color="#091833" stop-opacity="0.88"/>
              <stop offset="75%"  stop-color="#091833" stop-opacity="0.88"/>
              <stop offset="100%" stop-color="#091833" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <g transform="translate(200,200)">
            <!-- Empty state -->
            <template v-if="items.length === 0">
              <circle :r="R" fill="#0a1828" stroke="#133e7c" stroke-width="1.5"/>
              <text text-anchor="middle" dominant-baseline="middle" class="empty-label">
                Добавьте пункты
              </text>
            </template>

            <!-- Wheel -->
            <template v-else>
              <g class="wheel-group" :style="{ transform: `rotate(${rotation}deg)` }">
                <path
                  v-for="(item, i) in items"
                  :key="'s' + i"
                  :d="sectorPath(i)"
                  :fill="FILLS[i % FILLS.length]"
                  :stroke="STROKES[i % STROKES.length]"
                  stroke-width="1"
                />
                <text
                  v-for="(item, i) in items"
                  :key="'t' + i"
                  :transform="textTransform(i)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  :font-size="labelSize"
                  class="sector-label"
                >{{ truncate(item) }}</text>
                <!-- Center cap -->
                <circle r="18" fill="#091833" stroke="#0abdc6" stroke-width="2"/>
              </g>

              <!-- Fixed pointer -->
              <polygon points="0,-188 -7,-205 7,-205" class="pointer"/>

              <!-- Result strip (same pattern as DiceRoller) -->
              <template v-if="result && !spinning">
                <rect x="-185" y="-34" width="370" height="68" fill="url(#wheel-result-bg)"/>
                <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" class="result-label">
                  {{ result }}
                </text>
              </template>
            </template>
          </g>
        </svg>
      </div>

      <div class="wheel-actions">
        <button class="spin-btn" :disabled="!canSpin" @click="spin">
          {{ spinning ? 'Крутится...' : 'Крутить' }}
        </button>
        <button class="clear-btn" :disabled="spinning || (history.length === 0 && items.length === 0)" @click="history = []; result = null; items = []">
          Очистить
        </button>
      </div>

      <div v-if="history.length > 0" class="history">
        <span v-for="(h, i) in history" :key="i" class="chip">{{ h }}</span>
      </div>
    </div>

    <!-- Right: items panel -->
    <div class="items-panel">
      <div class="panel-header">
        <span class="panel-title">Пункты</span>
        <span class="item-count" :class="{ full: items.length >= MAX_ITEMS }">
          {{ items.length }}&thinsp;/&thinsp;{{ MAX_ITEMS }}
        </span>
      </div>

      <form class="add-form" @submit.prevent="addItem">
        <input
          v-model="newItemText"
          class="item-input"
          placeholder="Новый пункт..."
          :disabled="items.length >= MAX_ITEMS || spinning"
          maxlength="30"
        />
        <button
          type="submit"
          class="add-btn"
          :disabled="!newItemText.trim() || items.length >= MAX_ITEMS || spinning"
        >+</button>
      </form>

      <div class="items-list">
        <div v-for="(item, i) in items" :key="i" class="item-row">
          <span class="item-text" :title="item">{{ item }}</span>
          <button class="remove-btn" :disabled="spinning" @click="removeItem(i)">×</button>
        </div>
        <p v-if="items.length === 0" class="list-hint">Список пуст</p>
        <p v-else-if="items.length === 1" class="list-hint">Добавьте ещё хотя бы один пункт</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wheel-tool {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* ── Wheel area ── */

.wheel-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.wheel-container {
  position: relative;
  width: min(360px, calc(100vw - 4rem));
  aspect-ratio: 1;
}

.wheel-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.wheel-group {
  transition: transform 4s cubic-bezier(0.05, 0.5, 0.1, 1);
}

.empty-label {
  fill: rgb(from var(--color-accent-gray) r g b / 0.7);
  font-size: 18px;
  font-family: inherit;
}

.sector-label {
  fill: var(--color-text);
  font-family: inherit;
  font-weight: 500;
  pointer-events: none;
  text-shadow: none;
}

.pointer {
  fill: var(--color-accent-red);
  filter: drop-shadow(0 0 4px var(--color-accent-red));
}

/* ── Result strip ── */

.result-label {
  fill: var(--color-accent-red);
  font-size: 22px;
  font-family: inherit;
  font-weight: 700;
  filter: drop-shadow(0 0 6px var(--color-accent-red));
}

/* ── Wheel action buttons ── */

.wheel-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.wheel-actions button {
  flex: 1;
}

.spin-btn {
  padding: 0.55em 2.5em;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--color-accent-red);
  color: var(--color-accent-red);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.spin-btn:hover:not(:disabled) {
  background: rgb(from var(--color-accent-red) r g b / 0.12);
  border-color: var(--color-accent-white);
  color: var(--color-accent-white);
}

.spin-btn:disabled {
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
  border-color: var(--color-accent-white);
  color: var(--color-accent-white);
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
  max-width: min(360px, calc(100vw - 4rem));
}

.chip {
  padding: 0.25em 0.65em;
  border: 1px solid rgb(from var(--color-accent-red) r g b / 0.5);
  border-radius: 4px;
  font-size: 0.95rem;
  background: rgb(from var(--color-accent-red) r g b / 0.07);
  color: var(--color-accent-red);
  box-shadow: 0 0 0.4em rgb(from var(--color-accent-red) r g b / 0.25);
  text-shadow: 0 0 0.5em var(--color-accent-red);
}

/* ── Items panel ── */

.items-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent-red);
  text-shadow: 0 0 0.4em var(--color-accent-red);
}

.item-count {
  font-size: 0.85rem;
  opacity: 0.6;
}

.item-count.full {
  color: var(--color-accent-white);
  opacity: 1;
}

.add-form {
  display: flex;
  gap: 0.5rem;
}

.item-input {
  flex: 1;
  min-width: 0;
  padding: 0.4em 0.7em;
  background: transparent;
  border: 1px solid rgb(from var(--color-accent-red) r g b / 0.35);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: var(--color-accent-red);
  box-shadow: 0 0 0.5em rgb(from var(--color-accent-red) r g b / 0.35);
}

.item-input:disabled {
  opacity: 0.4;
}

.item-input::placeholder {
  color: rgb(from var(--color-text) r g b / 0.35);
}

.add-btn {
  padding: 0.4em 0.9em;
  font-size: 1.2rem;
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgb(from var(--color-accent-red) r g b / 0.5);
  border-radius: 4px;
  color: var(--color-accent-red);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: rgb(from var(--color-accent-red) r g b / 0.12);
  border-color: var(--color-accent-red);
}

.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 340px;
  overflow-y: auto;
}

.items-list::-webkit-scrollbar {
  width: 4px;
}

.items-list::-webkit-scrollbar-track {
  background: transparent;
}

.items-list::-webkit-scrollbar-thumb {
  background: rgb(from var(--color-accent-gray) r g b / 0.6);
  border-radius: 2px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35em 0.6em;
  border: 1px solid rgb(from var(--color-accent-gray) r g b / 0.35);
  border-radius: 4px;
  background: rgb(from var(--color-accent-gray) r g b / 0.08);
  transition: border-color 0.15s;
}

.item-row:hover {
  border-color: rgb(from var(--color-accent-red) r g b / 0.4);
}

.item-text {
  flex: 1;
  min-width: 0;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: rgb(from var(--color-text) r g b / 0.4);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.15em;
  transition: color 0.15s;
}

.remove-btn:hover:not(:disabled) {
  color: var(--color-accent-white);
}

.remove-btn:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.list-hint {
  font-size: 0.85rem;
  opacity: 0.45;
  padding: 0.25em 0.1em;
  margin: 0;
}

/* ── Responsive ── */

@media (max-width: 680px) {
  .wheel-tool {
    flex-direction: column;
    align-items: stretch;
  }

  .wheel-area {
    align-items: center;
  }

  .wheel-container {
    width: min(320px, calc(100vw - 2rem));
  }

  .items-list {
    max-height: 200px;
  }
}
</style>
