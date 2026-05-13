<script setup lang="ts">
import { ref, computed } from 'vue'

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

const dieShapes: Record<DieType, { points: string }> = {
  4:  { points: '50,8 92,92 8,92' },
  6:  { points: '8,8 92,8 92,92 8,92' },
  8:  { points: '50,8 80,20 92,50 80,80 50,92 20,80 8,50 20,20' },
  10: { points: '50,8 88,42 70,92 30,92 12,42' },
  12: { points: '50,8 92,38 76,92 24,92 8,38' },
  20: { points: '50,8 89,26 89,74 50,92 11,74 11,26' },
}
</script>

<template>
  <h1>Бросок кубиков</h1>

  <div class="dice-selector">
    <button
      v-for="type in diceTypes"
      :key="type"
      class="die-btn"
      :class="{ active: counts[type] > 0, rolling }"
      @click="addDie(type)"
      @contextmenu="removeDie($event, type)"
    >
      <svg viewBox="0 0 100 100" class="die-svg" overflow="visible">
        <defs>
          <linearGradient :id="`lbg-${type}`" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="var(--color-bg)" stop-opacity="0"/>
            <stop offset="30%"  stop-color="var(--color-bg)" stop-opacity="0.75"/>
            <stop offset="70%"  stop-color="var(--color-bg)" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="var(--color-bg)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon :points="dieShapes[type].points" />
        <rect x="-20" y="43" width="140" height="26" :fill="`url(#lbg-${type})`"/>
        <text x="50" y="56" text-anchor="middle" dominant-baseline="middle" class="die-label">
          d{{ type }}
        </text>
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
    <button class="roll-btn" :disabled="totalDice === 0 || rolling" @click="roll">
    {{ rolling ? 'Бросаем...' : 'Бросить' }}
    </button>
    <button class="clear-btn" :disabled="totalDice === 0 && results.length === 0 && modifier === 0" @click="clear">
      Очистить
    </button>
  </div>

  <div v-if="results.length > 0" class="results">
    <div class="result-chips">
      <span
        v-for="(r, i) in results"
        :key="i"
        class="chip"
      >
        d{{ r.type }}: {{ r.value }}
      </span>
    </div>
    <div class="total" v-if="results.length > 1 || modifier !== 0">
      Итого: {{ total }}
    </div>
  </div>
</template>

<style scoped>
.hint {
  margin: 0 0 1.25rem;
  font-size: 0.85rem;
  opacity: 0.6;
}

.dice-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  color: var(--color-accent-cyan);
  transition: color 0.2s;
  user-select: none;
  -webkit-user-select: none;
}

.die-btn:hover {
  color: var(--color-accent-magenta);
}

.die-btn.active .die-svg polygon {
  fill: rgb(from var(--color-accent-cyan) r g b / 0.12);
  stroke: var(--color-accent-cyan);
}

.die-btn.active:hover .die-svg polygon {
  stroke: var(--color-accent-magenta);
  fill: rgb(from var(--color-accent-magenta) r g b / 0.1);
}

.die-btn.rolling {
  animation: die-shake 0.5s ease-in-out;
}

.die-svg {
  width: 60px;
  height: 60px;
}

.die-svg polygon {
  fill: transparent;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linejoin: round;
  transition: fill 0.2s, stroke 0.2s;
}

.die-label {
  fill: currentColor;
  font-size: 32px;
  font-family: inherit;
  font-weight: 600;
  pointer-events: none;
}

.die-count {
  font-size: 20px;
  color: var(--color-accent-magenta);
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
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.modifier-control:focus-within {
  border-color: var(--color-accent-cyan);
}

.modifier-btn {
  background: transparent;
  border: none;
  color: var(--color-accent-cyan);
  font-size: 1.1rem;
  padding: 0.25em 0.6em;
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
  transition: color 0.2s, background 0.2s;
}

.modifier-btn:hover {
  color: var(--color-accent-magenta);
  background: rgb(from var(--color-accent-cyan) r g b / 0.08);
}

.modifier-input {
  width: 52px;
  padding: 0.3em 0;
  background: transparent;
  border: none;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  color: var(--color-text);
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
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.action-row button {
  flex: 1;
}

.roll-btn {
  display: block;
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

.roll-btn:hover:not(:disabled) {
  background: rgb(from var(--color-accent-cyan) r g b / 0.12);
  border-color: var(--color-accent-magenta);
  color: var(--color-accent-magenta);
}

.roll-btn:disabled {
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

.results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.25em 0.65em;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.95rem;
  background: rgb(from var(--color-accent-blue) r g b / 0.2);
  color: var(--color-text);
}

.total {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-accent-cyan);
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
