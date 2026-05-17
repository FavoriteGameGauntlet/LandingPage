<script setup lang="ts">
import { ref, computed } from 'vue'
import HistoryChips from './HistoryChips.vue'

const MAX_ITEMS = 20
const R = 185
const TEXT_R = 128
const SPIN_MS = 4000

const items = ref<string[]>([])
const newItemText = ref('')
const spinning = ref(false)
const result = ref<string | null>(null)
const rotation = ref(0)
const spinHistory = ref<string[]>([])
const showResult = ref(false)
let resultTimer: ReturnType<typeof setTimeout> | null = null

const canSpin = computed(() => items.value.length >= 2 && !spinning.value)

function addItem() {
  const text = newItemText.value.trim()
  if (!text || items.value.length >= MAX_ITEMS) return
  items.value.push(text)
  newItemText.value = ''
  result.value = null
  spinHistory.value = []
  showResult.value = false
}

function removeItem(index: number) {
  if (spinning.value) return
  items.value.splice(index, 1)
  result.value = null
  spinHistory.value = []
  showResult.value = false
}

function clear() {
  items.value = []
  result.value = null
  spinHistory.value = []
  showResult.value = false
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
    const winner = items.value[actualWinIndex] ?? null
    result.value = winner
    if (winner) spinHistory.value.unshift(winner)
    spinning.value = false
    showResult.value = true
    if (resultTimer) clearTimeout(resultTimer)
    resultTimer = setTimeout(() => { showResult.value = false }, 3000)
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

const NUM_COLORS = 3

const sectorColors = computed(() => {
  const n = items.value.length
  if (n === 0) return []
  const colors: number[] = new Array(n)
  colors[0] = 0
  for (let i = 1; i < n; i++) {
    const forbidden = new Set([colors[i - 1]])
    if (i === n - 1) forbidden.add(colors[0])
    for (let c = 0; c < NUM_COLORS; c++) {
      if (!forbidden.has(c)) { colors[i] = c; break }
    }
  }
  return colors
})

const spinHistoryItems = computed(() => spinHistory.value.map(h => ({ label: h })))
</script>

<template>
  <div class="wheel-tool">
    <!-- Left: wheel -->
    <div class="wheel-area">
      <div class="wheel-container">
        <svg viewBox="0 0 400 400" class="wheel-svg">
          <defs>
            <linearGradient id="wheel-result-bg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stop-color="var(--color-bg-secondary)" stop-opacity="0"/>
              <stop offset="17%"  stop-color="var(--color-bg-secondary)" stop-opacity="0.88"/>
              <stop offset="83%"  stop-color="var(--color-bg-secondary)" stop-opacity="0.88"/>
              <stop offset="100%" stop-color="var(--color-bg-secondary)" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <g transform="translate(200,200)">
            <!-- Empty state -->
            <template v-if="items.length === 0">
              <circle :r="R" fill="var(--color-bg-secondary)" stroke="var(--color-primary)" stroke-width="3"/>
              <text text-anchor="middle" dominant-baseline="middle" class="empty-label">
                Добавьте пункты
              </text>
            </template>

            <!-- Wheel -->
            <template v-else>
              <g class="wheel-group" :style="{ transform: `rotate(${rotation}deg)` }">
                <path
                  v-for="(_, i) in items"
                  :key="'s' + i"
                  :d="sectorPath(i)"
                  :fill="`var(--color-wheel-fill-${sectorColors[i]})`"
                  stroke="var(--color-primary)"
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
                <circle r="18" fill="var(--color-bg-secondary)" stroke="var(--color-primary)" stroke-width="2"/>
              </g>

              <!-- Fixed pointer -->
              <polygon points="0,-188 -7,-205 7,-205" class="pointer"/>

              <!-- Result strip (same pattern as DiceRoller) -->
              <g class="result-group" :class="{ visible: showResult }">
                <rect x="-222" y="-34" width="444" height="68" fill="url(#wheel-result-bg)"/>
                <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" class="result-label">
                  {{ result }}
                </text>
              </g>
            </template>
          </g>
        </svg>
      </div>

      <div class="action-row">
        <button class="btn-primary" :disabled="!canSpin" @click="spin">
          {{ spinning ? 'Крутится...' : 'Крутить' }}
        </button>
        <button class="btn-secondary" :disabled="spinning || (spinHistory.length === 0 && items.length === 0)" @click="clear">
          Очистить
        </button>
      </div>

      <div v-if="spinHistory.length > 0" class="spinHistory-wrap">
        <HistoryChips :items="spinHistoryItems" />
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
          class="btn-primary"
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
  flex: 1;
  min-width: 0;
}

.wheel-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.wheel-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.wheel-group {
  transition: transform 4s cubic-bezier(0.05, 0.5, 0.1, 1);
}

.empty-label {
  fill: rgb(from var(--color-control-bg) r g b / 0.7);
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
  fill: var(--color-accent);
  filter: drop-shadow(0 0 4px var(--color-accent));
}

/* ── Result strip ── */

.result-group {
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

.result-group.visible {
  opacity: 1;
  transition: opacity 0.1s;
}

.result-label {
  fill: var(--color-primary);
  font-size: 22px;
  font-family: inherit;
  font-weight: 700;
}

/* ── Wheel action buttons ── */

.action-row {
  width: 100%;
}

.spinHistory-wrap {
  width: 100%;
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
  color: var(--color-heading);
}

.item-count {
  font-size: 0.85rem;
  opacity: 0.6;
}

.item-count.full {
  color: var(--color-accent);
  opacity: 1;
}

.add-form {
  display: flex;
  gap: 0.5rem;
}

.add-form .btn-primary:hover:not(:disabled) {
  background: var(--color-control-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.item-input {
  flex: 1;
  min-width: 0;
  padding: 0.4em 0.7em;
  background: transparent;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.35);
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgb(from var(--color-primary) r g b / 0.35);
}

.item-input:disabled {
  opacity: 0.4;
}

.item-input::placeholder {
  color: rgb(from var(--color-text) r g b / 0.35);
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
  background: rgb(from var(--color-control-bg) r g b / 0.6);
  border-radius: 2px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35em 0.6em;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.35);
  border-radius: 4px;
  background: rgb(from var(--color-control-bg) r g b / 0.08);
  transition: border-color 0.15s;
}

.item-row:hover {
  border-color: rgb(from var(--color-primary) r g b / 0.4);
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
  color: var(--color-primary);
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

@media (max-width: 860px) {
  .wheel-tool {
    flex-direction: column;
    align-items: stretch;
  }

  .wheel-area {
    align-items: center;
  }

  .wheel-container {
    width: 100%;
  }

  .items-list {
    max-height: 200px;
  }
}
</style>
