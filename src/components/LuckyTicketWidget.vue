<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import HistoryChips from './HistoryChips.vue'

const { showResult, slowHide, hideInstant, show } = useResultStrip()

const rolling = ref(false)
const digits = ref<number[]>([])
const displayDigits = ref<number[]>([0, 0, 0, 0, 0, 0])

interface TicketRecord {
  digits: number[]
  lucky: boolean
}

const history = ref<TicketRecord[]>([])

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

  let ticks = 0
  const interval = setInterval(() => {
    displayDigits.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
    ticks++
    if (ticks >= 15) {
      clearInterval(interval)
      displayDigits.value = finalDigits
      digits.value = finalDigits
      history.value.unshift({ digits: finalDigits, lucky: isLucky(finalDigits) })
      rolling.value = false
      show()
    }
  }, 60)
}

function clear() {
  if (rolling.value) return
  digits.value = []
  displayDigits.value = [0, 0, 0, 0, 0, 0]
  history.value = []
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
    title: l ? `Счастливый! ${sum(d, 0, 3)} = ${sum(d, 3, 6)}` : `${sum(d, 0, 3)} ≠ ${sum(d, 3, 6)}`,
  }))
)
</script>

<template>
  <div class="widget">
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
        <template v-if="lucky">СЧАСТЛИВЫЙ! {{ sum1 }} = {{ sum2 }}</template>
        <template v-else>{{ sum1 }} ≠ {{ sum2 }}</template>
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
  margin-top: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  min-height: 1.75rem;
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

.result-strip.lucky {
  color: var(--color-accent);
}

.action-row {
  margin-bottom: 1.75rem;
}
</style>
