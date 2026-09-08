<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import HistoryChips from './HistoryChips.vue'
import tearSound from '../assets/sounds/lucky-ticket/paper-tearing.ogg'
import reelsSound from '../assets/sounds/lucky-ticket/slot-machine-reels.ogg'
import stampSound from '../assets/sounds/lucky-ticket/rubber-stamp.ogg'
import chimeSound from '../assets/sounds/lucky-ticket/win-chime.ogg'

const { showResult, slowHide, hideInstant, show } = useResultStrip()

const TEAR_VOLUME = 0.25
// The reels run under everything else, so they sit below the sounds that land on top of them
const REELS_VOLUME = 0.2
const STAMP_VOLUME = 0.3
// The chime is the brightest of the four, so it needs the least to sit level with them
const CHIME_VOLUME = 0.2

// The digits are scrambled on every tick. The tear that opens the roll runs 0.31s, so the roll
// is given enough ticks for the reels to be heard spinning on their own once it has died away
const TICK_MS = 60
const TICKS = 20
const ROLL_MS = TICK_MS * TICKS

// The stamp is heard slightly before the digits land
const STAMP_LEAD_MS = 50

// The stamp comes down on the ticket first, and a win is answered a beat later
const CHIME_DELAY_MS = 250

const tearAudio = new Audio(tearSound)
tearAudio.volume = TEAR_VOLUME

const reelsAudio = new Audio(reelsSound)
reelsAudio.volume = REELS_VOLUME

const stampAudio = new Audio(stampSound)
stampAudio.volume = STAMP_VOLUME

const chimeAudio = new Audio(chimeSound)
chimeAudio.volume = CHIME_VOLUME

const audios = [tearAudio, reelsAudio, stampAudio, chimeAudio]

// The widget mounts along with the whole tools page, so nothing is fetched up front:
// the files load once the tab is opened and are silenced once it is left
for (const audio of audios) audio.preload = 'none'

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let warmed = false

let stampTimer: ReturnType<typeof setTimeout> | null = null
let chimeTimer: ReturnType<typeof setTimeout> | null = null

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

// Silence the sound only: the interval that carries the roll through to its digits has to run,
// otherwise the ticket would be left scrambling
function silence() {
  if (stampTimer) { clearTimeout(stampTimer); stampTimer = null }
  if (chimeTimer) { clearTimeout(chimeTimer); chimeTimer = null }
  for (const audio of audios) audio.pause()
}

const rolling = ref(false)
const digits = ref<number[]>([])
const displayDigits = ref<number[]>([0, 0, 0, 0, 0, 0])

interface TicketRecord {
  digits: number[]
  lucky: boolean
}

// Chips past this many are dropped off the end of the strip; the tally keeps counting
const MAX_HISTORY = 20

const history = ref<TicketRecord[]>([])
const score = ref({ lucky: 0, normal: 0 })

function sum(d: number[], from: number, to: number): number {
  return d.slice(from, to).reduce((a, b) => a + b, 0)
}

function isLucky(d: number[]): boolean {
  return sum(d, 0, 3) === sum(d, 3, 6)
}

function generate() {
  if (rolling.value) return
  rolling.value = true
  hideInstant()

  const finalDigits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
  const won = isLucky(finalDigits)

  play(tearAudio)
  play(reelsAudio)
  stampTimer = setTimeout(() => play(stampAudio), ROLL_MS - STAMP_LEAD_MS)
  // The digits are settled before they are shown, so the win is known from the outset and its
  // chime can be handed to silence() along with the rest of the roll
  if (won) {
    chimeTimer = setTimeout(() => play(chimeAudio), ROLL_MS + CHIME_DELAY_MS)
  }

  let ticks = 0
  const interval = setInterval(() => {
    displayDigits.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
    ticks++
    if (ticks >= TICKS) {
      clearInterval(interval)
      // slot-machine-reels.ogg runs on well past the roll and has no ending of its own, so it
      // is cut where the digits stop - under the stamp, which covers the cut
      reelsAudio.pause()
      displayDigits.value = finalDigits
      digits.value = finalDigits
      history.value.unshift({ digits: finalDigits, lucky: won })
      if (history.value.length > MAX_HISTORY) history.value.pop()
      if (won) score.value.lucky++
      else score.value.normal++
      rolling.value = false
      show()
    }
  }, TICK_MS)
}

function clear() {
  if (rolling.value) return
  digits.value = []
  displayDigits.value = [0, 0, 0, 0, 0, 0]
  history.value = []
  score.value = { lucky: 0, normal: 0 }
  hideInstant()
}

const lucky = computed(() =>
  digits.value.length === 6 ? isLucky(digits.value) : null
)

const sum1 = computed(() => digits.value.length === 6 ? sum(digits.value, 0, 3) : null)
const sum2 = computed(() => digits.value.length === 6 ? sum(digits.value, 3, 6) : null)

const historyItems = computed(() =>
  history.value.map(({ digits: d, lucky: l }) => ({
    label: `${d.slice(0, 3).join('')}-${d.slice(3).join('')}`,
    variant: (l ? 'accent' : 'primary') as 'primary' | 'accent',
    title: `${sum(d, 0, 3)} ${l ? '=' : '≠'} ${sum(d, 3, 6)}`,
  }))
)

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
  <div class="widget" ref="root">
    <div class="score-line">
      <div class="score-cell">
        <h3 class="score-label">Счастливые</h3>
      </div>
      <div class="score-cell">
        <h3 class="score-label">Несчастливые</h3>
      </div>
      <div class="score-divider"></div>
      <div class="score-cell"><span class="score-num">{{ score.lucky }}</span></div>
      <div class="score-cell"><span class="score-num">{{ score.normal }}</span></div>
    </div>

    <div class="ticket-scene">
      <div class="ticket" :class="{ lucky: lucky === true, normal: lucky === false }">
        <div class="ticket-half">
          <span
            v-for="(d, i) in displayDigits.slice(0, 3)"
            :key="i"
            class="digit"
            :class="{ rolling }"
          >{{ digits.length === 0 && !rolling ? '?' : d }}</span>
        </div>
        <div class="ticket-divider">—</div>
        <div class="ticket-half">
          <span
            v-for="(d, i) in displayDigits.slice(3, 6)"
            :key="i + 3"
            class="digit"
            :class="{ rolling }"
          >{{ digits.length === 0 && !rolling ? '?' : d }}</span>
        </div>
      </div>
      <div class="result-strip" :class="{ visible: showResult, 'slow-hide': slowHide, lucky: lucky === true }">
        <template v-if="lucky !== null">
          <span class="verdict">{{ lucky ? 'СЧАСТЛИВЫЙ' : 'НЕСЧАСТЛИВЫЙ' }}</span>
          <span class="sums">{{ sum1 }} {{ lucky ? '=' : '≠' }} {{ sum2 }}</span>
        </template>
      </div>
    </div>

    <div class="action-row">
      <button class="btn-primary" :disabled="rolling" @click="generate">
        {{ rolling ? 'Тянем...' : 'Вытянуть' }}
      </button>
      <button class="btn-secondary" :disabled="rolling || history.length === 0" @click="clear">
        Очистить
      </button>
    </div>

    <HistoryChips :items="historyItems" />
  </div>
</template>

<style scoped>
.score-line {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 1.5rem;
}

.score-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-divider {
  grid-column: 1 / -1;
  border-top: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  margin: 0.25rem 0;
}

.score-label {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.score-num {
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.ticket-scene {
  margin-bottom: 2rem;
  text-align: center;
}

.ticket {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.75rem;
  border: 2px solid var(--color-primary);
  background: var(--color-bg-secondary);
  transition: border-color 0.4s, box-shadow 0.4s;
}

.ticket.lucky {
  border-color: var(--color-accent);
  box-shadow: 0 0 20px rgb(from var(--color-accent) r g b / 0.2);
}

.ticket-half {
  display: flex;
  gap: 0.25rem;
}

.ticket-divider {
  font-size: 1.5rem;
  color: var(--color-primary);
  opacity: 0.4;
  margin: 0 0.25rem;
}

.digit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 3rem;
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
  border: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  background: rgb(from var(--color-primary) r g b / 0.06);
  transition: color 0.4s, border-color 0.4s, background 0.4s;
}

.ticket.lucky .digit {
  color: var(--color-accent);
  border-color: rgb(from var(--color-accent) r g b / 0.4);
  background: rgb(from var(--color-accent) r g b / 0.06);
}

.digit.rolling {
  animation: digit-flicker 0.12s step-end infinite;
}

@keyframes digit-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.result-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  min-height: 3.25rem;
  opacity: 0;
  pointer-events: none;
}

.verdict {
  font-size: 1.25rem;
  letter-spacing: 0.06em;
}

/* The sums are what the verdict is read off, so they sit under it rather than beside it */
.sums {
  font-size: 1rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

.result-strip.slow-hide {
  transition: opacity 0.4s;
}

.result-strip.visible {
  opacity: 1;
  transition: opacity 0.1s;
}

.result-strip.lucky {
  color: var(--color-accent);
}

.action-row {
  margin-bottom: 1.75rem;
}
</style>
