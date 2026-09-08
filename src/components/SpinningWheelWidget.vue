<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import HistoryChips from './HistoryChips.vue'
import tickSound from '../assets/sounds/fortune-wheel/wheel-tick.ogg'
import dingSound from '../assets/sounds/fortune-wheel/small-bell-ding.ogg'

const MAX_ITEMS = 20
const R = 185
const TEXT_R = 128
const SPIN_MS = 4000
// The curve the wheel slows down on, mirroring the .wheel-group transition
const SPIN_EASE = [0.05, 0.5, 0.1, 1] as const

const { showResult, slowHide, hideInstant, show } = useResultStrip()

// A spin opens with twenty clicks a second, so one of them carries far less than a sound
// that plays on its own
const TICK_VOLUME = 0.15

const DING_VOLUME = 0.2

// The ding is heard slightly before the result lands
const DING_LEAD_MS = 50

// The pointer crosses hundreds of boundaries a second in the first moments of a spin. Closer
// together than this they stop reading as separate clicks anyway, and the file runs 140ms
const MIN_TICK_GAP_MS = 55

// Never played itself: the clicks overlap, so each one plays a clone of its own
const tickAudio = new Audio(tickSound)

const dingAudio = new Audio(dingSound)
dingAudio.volume = DING_VOLUME

const audios = [tickAudio, dingAudio]

// The widget mounts along with the whole tools page, so nothing is fetched up front:
// the files load once the tab is opened and are silenced once it is left
for (const audio of audios) audio.preload = 'none'

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let warmed = false

const ticks: HTMLAudioElement[] = []
const tickTimers: ReturnType<typeof setTimeout>[] = []
let dingTimer: ReturnType<typeof setTimeout> | null = null

function warm() {
  if (warmed) return
  warmed = true
  for (const audio of audios) {
    audio.preload = 'auto'
    audio.load()
  }
}

function play(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function bezier(a: number, b: number, u: number) {
  const v = 1 - u
  return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
}

// A click has to fall where the wheel actually is, and it turns on a CSS easing curve: for a
// fraction of the turn, find the point on the curve that reaches it and read off the time.
// The curve is monotone, so bisecting it is enough
function easedTime(progress: number) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (bezier(SPIN_EASE[1], SPIN_EASE[3], mid) < progress) lo = mid
    else hi = mid
  }
  return bezier(SPIN_EASE[0], SPIN_EASE[2], (lo + hi) / 2) * SPIN_MS
}

// A boundary passes the pointer on every multiple of a sector angle the wheel turns through,
// so the clicks thin out along with the wheel by themselves
function tickTimes(from: number, to: number, sectorAngle: number) {
  const times: number[] = []
  let last = -MIN_TICK_GAP_MS
  for (let edge = Math.floor(from / sectorAngle) + 1; edge <= Math.floor(to / sectorAngle); edge++) {
    const time = easedTime((edge * sectorAngle - from) / (to - from))
    if (time - last < MIN_TICK_GAP_MS) continue
    times.push(time)
    last = time
  }
  return times
}

// The file runs 140ms while the clicks come as close as 55ms apart, so a shared element would
// cut the previous one off. The detune keeps a fast run from reading as one machine gun
function playTick() {
  const tick = tickAudio.cloneNode() as HTMLAudioElement
  tick.volume = TICK_VOLUME
  tick.playbackRate = 0.94 + Math.random() * 0.12
  tick.addEventListener('ended', () => {
    const i = ticks.indexOf(tick)
    if (i !== -1) ticks.splice(i, 1)
  })
  ticks.push(tick)
  play(tick)
}

// Silence the sound only: the timer that carries the spin through to its result has to run,
// otherwise the wheel would be left without a winner
function silence() {
  for (const timer of tickTimers) clearTimeout(timer)
  tickTimers.length = 0
  if (dingTimer) { clearTimeout(dingTimer); dingTimer = null }
  dingAudio.pause()
  for (const tick of ticks) tick.pause()
  ticks.length = 0
}

const items = ref<string[]>([])
const newItemText = ref('')
const spinning = ref(false)
const result = ref<string | null>(null)
const rotation = ref(0)
const spinHistory = ref<string[]>([])

const canSpin = computed(() => items.value.length >= 2 && !spinning.value)

function addItem() {
  const text = newItemText.value.trim()
  if (!text || items.value.length >= MAX_ITEMS) return
  items.value.push(text)
  newItemText.value = ''
  result.value = null
  spinHistory.value = []
  hideInstant()
}

function removeItem(index: number) {
  if (spinning.value) return
  items.value.splice(index, 1)
  result.value = null
  spinHistory.value = []
  hideInstant()
}

function clear() {
  items.value = []
  result.value = null
  spinHistory.value = []
  hideInstant()
}


function spin() {
  if (!canSpin.value) return
  spinning.value = true
  result.value = null
  hideInstant()

  const n = items.value.length
  const winIndex = Math.floor(Math.random() * n)
  const sectorAngle = 360 / n
  const winMid = winIndex * sectorAngle + sectorAngle / 2
  const targetMod = (360 - winMid + 360) % 360
  const currentMod = ((rotation.value % 360) + 360) % 360
  let delta = (targetMod - currentMod + 360) % 360
  if (delta < 5) delta += sectorAngle
  const extraSpins = 5 + Math.floor(Math.random() * 4)
  const from = rotation.value
  const finalRotation = from + extraSpins * 360 + delta
  rotation.value = finalRotation

  // The previous spin's timers have all fired by now: a spin cannot start over another one
  tickTimers.length = 0
  for (const time of tickTimes(from, finalRotation, sectorAngle)) {
    tickTimers.push(setTimeout(playTick, time))
  }
  dingTimer = setTimeout(() => play(dingAudio), SPIN_MS - DING_LEAD_MS)

  // Determine which sector is actually at the top after animation
  const finalMod = ((finalRotation % 360) + 360) % 360
  const topAngle = (360 - finalMod + 360) % 360
  const actualWinIndex = Math.floor(topAngle / sectorAngle) % n

  setTimeout(() => {
    const winner = items.value[actualWinIndex] ?? null
    result.value = winner
    if (winner) spinHistory.value.unshift(winner)
    spinning.value = false
    show()
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

onMounted(() => {
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) warm()
    else silence()
  }, { rootMargin: '200px' })
  observer.observe(root.value!)
})

onUnmounted(() => {
  observer?.disconnect()
  silence()
})
</script>

<template>
  <div class="wheel-tool" ref="root">
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
              <g class="result-group" :class="{ visible: showResult, 'slow-hide': slowHide }">
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
          class="item-input themed-input"
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
  pointer-events: none;
}

.result-group.slow-hide {
  transition: opacity 0.4s;
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
