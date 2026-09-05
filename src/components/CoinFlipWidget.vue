<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import headsRaw from '../assets/icons/coin-flip/heads.svg?raw'
import tailsRaw from '../assets/icons/coin-flip/tails.svg?raw'
import tossSound from '../assets/sounds/coin-flip/coin-toss.ogg'
import spinSound from '../assets/sounds/coin-flip/coin-flipping.ogg'
import dropSound from '../assets/sounds/coin-flip/coin-drop.ogg'
import HistoryChips from './HistoryChips.vue'

function prepareCoinSvg(raw: string): string {
  return raw.replace(/<path /, '<path fill="currentColor" ')
}

const headsSvg = prepareCoinSvg(headsRaw)
const tailsSvg = prepareCoinSvg(tailsRaw)

type Side = 'heads' | 'tails'

const { showResult, slowHide, hideInstant, show } = useResultStrip()

const tossAudio = new Audio(tossSound)
tossAudio.volume = 0.3

// Подброс успевает отзвучать целиком, и только потом монета начинает крутиться
const TOSS_MS = 260

const spinAudio = new Audio(spinSound)
spinAudio.volume = 0.3

// Длительность файла вращения: под неё подгоняется каждый оборот монеты
const SPIN_SECONDS = 0.83
const spinTimers: ReturnType<typeof setTimeout>[] = []

const dropAudio = new Audio(dropSound)
dropAudio.volume = 0.3

// Длительность полёта монеты — та же, что у transition в .coin
const FLIP_MS = 1500
// Удар слышен чуть раньше, чем монета встаёт
const DROP_LEAD_MS = 50
let dropTimer: ReturnType<typeof setTimeout> | null = null

const audios = [tossAudio, spinAudio, dropAudio]

// Виджет монтируется вместе со всей страницей инструментов, поэтому ничего не тянем заранее:
// файлы подгружаются, когда вкладку открыли, и глушатся, когда с неё ушли
for (const audio of audios) audio.preload = 'none'

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let warmed = false

function warm() {
  if (warmed) return
  warmed = true
  for (const audio of audios) {
    audio.preload = 'auto'
    audio.load()
  }
}

// Гасим только звук: таймеры, которые доводят поворот и результат, должны отработать,
// иначе монета останется в старом положении, а в историю уже попадёт выпавшая сторона
function silence() {
  stopSpin()
  if (dropTimer) { clearTimeout(dropTimer); dropTimer = null }
  tossAudio.pause()
  dropAudio.pause()
}

// Монета летит по transition: transform 1.5s cubic-bezier(0.15, 0, 0.25, 1) — она тормозит,
// поэтому обороты неравные и момент каждого приходится считать по этой же кривой
const EASE = { x1: 0.15, y1: 0, x2: 0.25, y2: 1 }

function bezier(c1: number, c2: number, u: number) {
  const v = 1 - u
  return 3 * v * v * u * c1 + 3 * v * u * u * c2 + u * u * u
}

function bezierSlope(c1: number, c2: number, u: number) {
  const v = 1 - u
  return 3 * v * v * c1 + 6 * v * u * (c2 - c1) + 3 * u * u * (1 - c2)
}

// В какой момент полёта монета проходит заданную долю всего поворота
function timeAtRotation(part: number) {
  let u = part
  for (let i = 0; i < 8; i++) {
    const dy = bezierSlope(EASE.y1, EASE.y2, u)
    if (dy === 0) break
    u -= (bezier(EASE.y1, EASE.y2, u) - part) / dy
  }
  return bezier(EASE.x1, EASE.x2, Math.min(1, Math.max(0, u))) * FLIP_MS
}

// На каждый оборот — один проход файла, сжатый или растянутый под длительность этого оборота
function scheduleSpin(turn: number) {
  const bounds = [0]
  for (let angle = 360; angle < turn; angle += 360) bounds.push(timeAtRotation(angle / turn))
  bounds.push(FLIP_MS)

  for (let i = 0; i < bounds.length - 1; i++) {
    const start = bounds[i]!
    const rate = SPIN_SECONDS * 1000 / (bounds[i + 1]! - start)
    spinTimers.push(setTimeout(() => {
      spinAudio.playbackRate = rate
      play(spinAudio)
    }, TOSS_MS + start))
  }
}

function play(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

const rotation = ref(0)
const flipping = ref(false)
const noTransition = ref(false)
const result = ref<Side | null>(null)
const history = ref<Side[]>([])

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
  const turn = delta + (4 + Math.floor(Math.random() * 4)) * 360

  play(tossAudio)
  setTimeout(() => { rotation.value += turn }, TOSS_MS)
  scheduleSpin(turn)
  dropTimer = setTimeout(() => play(dropAudio), TOSS_MS + FLIP_MS - DROP_LEAD_MS)

  setTimeout(() => {
    result.value = side
    history.value.unshift(side)
    flipping.value = false
    stopSpin()
    show()
  }, TOSS_MS + FLIP_MS)
}

function stopSpin() {
  for (const timer of spinTimers) clearTimeout(timer)
  spinTimers.length = 0
  spinAudio.pause()
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

const historyItems = computed(() =>
  history.value.map(side => ({
    label: side === 'heads' ? 'Орел' : 'Решка',
    variant: (side === 'heads' ? 'primary' : 'accent') as 'primary' | 'accent',
  }))
)
</script>

<template>
  <div class="widget" ref="root">
  <div class="coin-scene">
    <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }" :class="{ flippable: !flipping, virgin: history.length === 0, 'no-transition': noTransition }" @click="flip">
      <div class="face heads">
        <span v-if="history.length > 0 || flipping" class="coin-icon" v-html="headsSvg"/>
      </div>
      <div class="face tails">
        <span v-if="history.length > 0 || flipping" class="coin-icon" v-html="tailsSvg"/>
      </div>
    </div>
    <div class="result-strip" :class="{ visible: showResult, 'slow-hide': slowHide, tails: result === 'tails' }">
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
  position: relative;
  margin-bottom: 2rem;
}

.coin {
  position: relative;
  margin: 0 auto;
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
  inset: 0;
  box-sizing: border-box;
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

.result-strip.tails {
  color: var(--color-accent);
}

.action-row {
  margin-bottom: 1.75rem;
}
</style>
