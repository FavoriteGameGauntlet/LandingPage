<script setup lang="ts">
import { ref, computed } from 'vue'
import HistoryChips from './HistoryChips.vue'
import d4Raw  from '../assets/icons/d4.svg?raw'
import d6Raw  from '../assets/icons/d6.svg?raw'
import d8Raw  from '../assets/icons/d8.svg?raw'
import d10Raw from '../assets/icons/d10.svg?raw'
import d12Raw from '../assets/icons/d12.svg?raw'
import d20Raw from '../assets/icons/d20.svg?raw'

function extractPathD(raw: string): string {
  return raw.match(/\bd="([^"]+)"/)?.[1] ?? ''
}

const diceTypes = [4, 6, 8, 10, 12, 20] as const
type DieType = typeof diceTypes[number]

const counts = ref<Record<DieType, number>>({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 })
const results = ref<{ type: DieType; value: number }[]>([])
const rolling = ref(false)

function addDie(type: DieType) {
  if (counts.value[type] < 10) counts.value[type]++
}

function removeDie(event: MouseEvent, type: DieType) {
  event.preventDefault()
  if (counts.value[type] > 0) counts.value[type]--
}

const modifier = ref(0)

const totalDice = computed(() => diceTypes.reduce((sum, t) => sum + counts.value[t], 0))
const diceSum = computed(() => results.value.reduce((sum, r) => sum + r.value, 0))
const total = computed(() => diceSum.value + modifier.value)
const resultItems = computed(() => results.value.map(r => ({ label: `d${r.type}: ${r.value}` })))

function clear() {
  diceTypes.forEach(t => counts.value[t] = 0)
  results.value = []
  modifier.value = 0
}

function roll() {
  if (totalDice.value === 0 || rolling.value) return
  rolling.value = true
  results.value = []
  setTimeout(() => {
    const newResults: { type: DieType; value: number }[] = []
    for (const type of diceTypes) {
      for (let i = 0; i < counts.value[type]; i++) {
        newResults.push({ type, value: Math.floor(Math.random() * type) + 1 })
      }
    }
    results.value = newResults
    rolling.value = false
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
  <div class="dice-selector">
    <button
      v-for="type in diceTypes"
      :key="type"
      class="die-btn"
      :class="{ active: counts[type] > 0, rolling }"
      @click="addDie(type)"
      @contextmenu="removeDie($event, type)"
    >
      <svg viewBox="18 18 64 64" class="die-svg">
        <path :d="dieShapes[type]" fill-rule="evenodd" clip-rule="evenodd" />
      </svg>
      <span class="die-count" v-if="counts[type] > 0">×{{ counts[type] }}</span>
      <span class="die-count placeholder" v-else>&nbsp;</span>
    </button>
  </div>

  <div class="modifier-row">
    <label class="modifier-label">Модификатор</label>
    <div class="modifier-control">
      <button class="modifier-btn" @click="modifier = Math.max(-1000, modifier - 1)">−</button>
      <input
        v-model.lazy.number="modifier"
        type="number"
        min="-1000"
        max="1000"
        class="modifier-input"
        @change="modifier = Math.min(1000, Math.max(-1000, modifier || 0))"
      />
      <button class="modifier-btn" @click="modifier = Math.min(1000, modifier + 1)">+</button>
    </div>
  </div>

  <div class="action-row">
    <button class="btn-primary" :disabled="totalDice === 0 || rolling" @click="roll">
      {{ rolling ? 'Бросаем...' : 'Бросить' }}
    </button>
    <button class="btn-secondary" :disabled="totalDice === 0 && results.length === 0 && modifier === 0" @click="clear">
      Очистить
    </button>
  </div>

  <div v-if="results.length > 0" class="results">
    <HistoryChips :items="resultItems" />
    <div class="total" v-if="results.length > 1 || modifier !== 0">
      Итого: {{ total }}
    </div>
  </div>
  </div>
</template>

<style scoped>
.dice-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 4.5rem;
  margin-bottom: 1.5rem;
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
  gap: 0.1rem;
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

.die-svg path {
  fill: transparent;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linejoin: round;
  transition: fill 0.2s, stroke 0.2s;
}


.die-count {
  font-size: 20px;
  color: var(--color-accent);
  font-weight: 600;
  min-height: 1.2em;
}

.die-count.placeholder {
  visibility: hidden;
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

.modifier-control {
  display: flex;
  align-items: center;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.modifier-control:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgb(from var(--color-primary) r g b / 0.4);
}

.modifier-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 1.1rem;
  padding: 0.25em 0.6em;
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
  transition: color 0.2s, background 0.2s;
}

.modifier-btn:hover {
  color: var(--color-accent);
  background: rgb(from var(--color-primary) r g b / 0.08);
}


.modifier-input {
  width: 52px;
  padding: 0.3em 0;
  color: var(--color-text);
  background: transparent;
  border: none;
  border-left: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-right: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  font-size: 1rem;
  font-family: inherit;
  text-align: center;
}

.modifier-input:focus {
  outline: none;
}

.modifier-input::-webkit-inner-spin-button,
.modifier-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.modifier-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.action-row {
  margin-bottom: 1.75rem;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.total {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
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
