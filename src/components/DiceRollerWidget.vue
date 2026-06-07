<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import HistoryChips from './HistoryChips.vue'
import NumberStepper from './NumberStepper.vue'
import d4Raw  from '../assets/icons/dice-roller/d4.svg?raw'
import d6Raw  from '../assets/icons/dice-roller/d6.svg?raw'
import d8Raw  from '../assets/icons/dice-roller/d8.svg?raw'
import d10Raw from '../assets/icons/dice-roller/d10.svg?raw'
import d12Raw from '../assets/icons/dice-roller/d12.svg?raw'
import d20Raw from '../assets/icons/dice-roller/d20.svg?raw'

function extractPathD(raw: string): string {
  return raw.match(/\bd="([^"]+)"/)?.[1] ?? ''
}

const diceTypes = [4, 6, 8, 10, 12, 20] as const
type DieType = typeof diceTypes[number]

const { showResult, slowHide, hideInstant, show } = useResultStrip()

const counts = ref<Record<DieType, number>>({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 })
const results = ref<{ type: DieType; value: number }[]>([])
const rolling = ref(false)
interface RollRecord { total: number; breakdown: { type: DieType; value: number }[]; modifier: number }
const rollHistory = ref<RollRecord[]>([])

function addDie(type: DieType) {
  if (counts.value[type] < 10) counts.value[type]++
}

function removeDie(event: MouseEvent, type: DieType) {
  event.preventDefault()
  if (counts.value[type] > 0) counts.value[type]--
}

const modifier = ref(0)

const totalDice = computed(() => diceTypes.reduce((sum, t) => sum + counts.value[t], 0))
const historyItems = computed(() => rollHistory.value.map(r => {
  const parts = r.breakdown.map(d => `d${d.type}: ${d.value}`).join('\n')
  const mod = r.modifier !== 0 ? `\nмод: ${r.modifier > 0 ? '+' : ''}${r.modifier}` : ''
  return { label: String(r.total), title: parts + mod }
}))

function clear() {
  diceTypes.forEach(t => counts.value[t] = 0)
  results.value = []
  rollHistory.value = []
  modifier.value = 0
  hideInstant()
}

function roll() {
  if (totalDice.value === 0 || rolling.value) return
  rolling.value = true
  results.value = []
  hideInstant()
  setTimeout(() => {
    const newResults: { type: DieType; value: number }[] = []
    for (const type of diceTypes) {
      for (let i = 0; i < counts.value[type]; i++) {
        newResults.push({ type, value: Math.floor(Math.random() * type) + 1 })
      }
    }
    results.value = newResults
    const rollTotal = newResults.reduce((s, r) => s + r.value, 0) + modifier.value
    rollHistory.value.unshift({ total: rollTotal, breakdown: newResults, modifier: modifier.value })
    rolling.value = false
    show()
  }, 500)
}

const dieShapes: Record<DieType, string> = {
  4:  extractPathD(d4Raw),
  6:  extractPathD(d6Raw),
  8:  extractPathD(d8Raw),
  10: extractPathD(d10Raw),
  12: extractPathD(d12Raw),
  20: extractPathD(d20Raw),
}
</script>

<template>
  <div class="widget">
  <div class="dice-area">
    <div class="dice-selector">
      <div v-for="type in ([4, 6, 8] as DieType[])" :key="type" class="die-wrap">
        <h3 class="die-label">d{{ type }}</h3>
        <button class="die-btn" :class="{ active: counts[type] > 0, rolling }" @click="addDie(type)" @contextmenu="removeDie($event, type)">
          <svg viewBox="18 18 64 64" class="die-svg"><path :d="dieShapes[type]" fill-rule="evenodd" clip-rule="evenodd"/></svg>
        </button>
        <span class="die-count" v-if="counts[type] > 0">×{{ counts[type] }}</span>
        <span class="die-count zero" v-else>×0</span>
      </div>
    </div>
    <div class="result-strip" :class="{ visible: showResult, 'slow-hide': slowHide }">{{ rollHistory[0]?.total }}</div>
    <div class="dice-selector">
      <div v-for="type in ([10, 12, 20] as DieType[])" :key="type" class="die-wrap">
        <h3 class="die-label">d{{ type }}</h3>
        <button class="die-btn" :class="{ active: counts[type] > 0, rolling }" @click="addDie(type)" @contextmenu="removeDie($event, type)">
          <svg viewBox="18 18 64 64" class="die-svg"><path :d="dieShapes[type]" fill-rule="evenodd" clip-rule="evenodd"/></svg>
        </button>
        <span class="die-count" v-if="counts[type] > 0">×{{ counts[type] }}</span>
        <span class="die-count zero" v-else>×0</span>
      </div>
    </div>
  </div>

  <div class="modifier-row">
    <label class="modifier-label">Модификатор</label>
    <NumberStepper v-model="modifier" :min="-1000" :max="1000" input-width="52px" />
  </div>

  <div class="action-row">
    <button class="btn-primary" :disabled="totalDice === 0 || rolling" @click="roll">
      {{ rolling ? 'Бросаем...' : 'Бросить' }}
    </button>
    <button class="btn-secondary" :disabled="totalDice === 0 && results.length === 0 && modifier === 0" @click="clear">
      Очистить
    </button>
  </div>

  <div v-if="rollHistory.length > 0" class="results">
    <HistoryChips :items="historyItems" />
  </div>
  </div>
</template>

<style scoped>
.dice-area {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.dice-selector {
  display: flex;
  justify-content: center;
  column-gap: 4.5rem;
}

.result-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  min-height: calc(1.5rem * 1.2 + 0.6em);
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

.die-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.die-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-primary);
  transition: color 0.2s;
  user-select: none;
  -webkit-user-select: none;
}

.die-btn:hover {
  color: var(--color-text);
}

.die-btn:hover .die-svg path {
  filter: drop-shadow(0 0 0.35em var(--color-text));
}


.die-btn.active {
  color: var(--color-accent);
}

.die-btn.active .die-svg path {
  fill: rgb(from var(--color-accent) r g b / 0.12);
  stroke: var(--color-accent);
}

.die-btn.active:hover .die-svg path {
  stroke: var(--color-accent);
  fill: rgb(from var(--color-accent) r g b / 0.12);
}

.die-btn.active:hover .die-svg path {
  filter: drop-shadow(0 0 0.35em var(--color-accent));
}

.die-btn.rolling {
  animation: die-shake 0.5s ease-in-out;
}

.die-svg {
  width: 72px;
  height: 72px;
}

.die-label {
  color: var(--color-primary);
  margin: 0;
}

.die-svg path {
  fill: transparent;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linejoin: round;
  transition: fill 0.2s, stroke 0.2s;
}


.die-count {
  font-size: 1.1rem;
  color: var(--color-accent);
  font-weight: 600;
  min-height: 1.2em;
}

.die-count.zero {
  color: var(--color-primary) !important;
}

.modifier-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modifier-label {
  font-size: 0.95rem;
  opacity: 0.75;
}


.action-row {
  margin-bottom: 1.75rem;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-strip {
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
}

@keyframes die-shake {
  0%   { transform: rotate(0deg)   scale(1); }
  20%  { transform: rotate(-12deg) scale(1.08); }
  40%  { transform: rotate(12deg)  scale(0.95); }
  60%  { transform: rotate(-8deg)  scale(1.04); }
  80%  { transform: rotate(6deg)   scale(0.98); }
  100% { transform: rotate(0deg)   scale(1); }
}
</style>
