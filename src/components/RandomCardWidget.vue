<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Card {
  rank: string
  suit: string
  suitSymbol: string
  svgName: string
  color: 'red' | 'black'
  uid: number
}

const RANKS_36 = [
  { rank: 'A', name: 'ace' },
  { rank: '6', name: '6' },
  { rank: '7', name: '7' },
  { rank: '8', name: '8' },
  { rank: '9', name: '9' },
  { rank: '10', name: '10' },
  { rank: 'J', name: 'jack' },
  { rank: 'Q', name: 'queen' },
  { rank: 'K', name: 'king' },
]

const RANKS_52 = [
  { rank: 'A', name: 'ace' },
  { rank: '2', name: '2' },
  { rank: '3', name: '3' },
  { rank: '4', name: '4' },
  { rank: '5', name: '5' },
  { rank: '6', name: '6' },
  { rank: '7', name: '7' },
  { rank: '8', name: '8' },
  { rank: '9', name: '9' },
  { rank: '10', name: '10' },
  { rank: 'J', name: 'jack' },
  { rank: 'Q', name: 'queen' },
  { rank: 'K', name: 'king' },
]

const SUITS: { suit: string; symbol: string; name: string; color: 'red' | 'black' }[] = [
  { suit: 'Червы',  symbol: '♥', name: 'hearts',   color: 'red' },
  { suit: 'Бубны',  symbol: '♦', name: 'diamonds', color: 'red' },
  { suit: 'Трефы',  symbol: '♣', name: 'clubs',    color: 'black' },
  { suit: 'Пики',   symbol: '♠', name: 'spades',   color: 'black' },
]

const deckSize = ref<36 | 52>(36)

function buildDeck(): Omit<Card, 'uid'>[] {
  const ranks = deckSize.value === 36 ? RANKS_36 : RANKS_52
  const deck: Omit<Card, 'uid'>[] = []
  for (const s of SUITS) {
    for (const r of ranks) {
      deck.push({
        rank: r.rank,
        suit: s.suit,
        suitSymbol: s.symbol,
        svgName: `${r.name}_${s.name}`,
        color: s.color,
      })
    }
  }
  return deck
}

function setDeckSize(size: 36 | 52) {
  if (deckSize.value === size) return
  deckSize.value = size
  if (cardCount.value > size) cardCount.value = size
  clearHistory()
}

const cardCount = ref(1)
const maxCount = computed(() => Math.min(20, deckSize.value))
const sliderPercent = computed(() => (cardCount.value - 1) / (maxCount.value - 1) * 100)

function setCount(val: number) {
  cardCount.value = Math.min(maxCount.value, Math.max(1, val || 1))
}

function onCountChange(e: Event) {
  setCount(Number((e.target as HTMLInputElement).value))
}

let uidCounter = 0
const buffer = ref<Omit<Card, 'uid'>[]>(buildDeck())
const history = ref<Card[]>([])

function pickCards() {
  const drawn: Card[] = []
  for (let i = 0; i < cardCount.value; i++) {
    if (buffer.value.length === 0) buffer.value = buildDeck()
    const idx = Math.floor(Math.random() * buffer.value.length)
    const picked = buffer.value.splice(idx, 1)[0]
    if (picked) drawn.push({ ...picked, uid: uidCounter++ })
  }
  history.value.unshift(...drawn)
  while (history.value.length > 20) history.value.pop()
}

let clearing = false

function clearHistory() {
  clearing = true
  history.value = []
  buffer.value = buildDeck()
  nextTick(() => { clearing = false })
}

const imgErrors = ref<Set<string>>(new Set())

function onImgError(svgName: string) {
  imgErrors.value = new Set([...imgErrors.value, svgName])
}

interface LeavingItem { el: HTMLElement; left: number; top: number; w: number; done: () => void }
const leavingBatch: LeavingItem[] = []
let leavingScheduled = false

function onLeave(el: Element, done: () => void) {
  if (clearing) { done(); return }
  const htmlEl = el as HTMLElement
  const rect = htmlEl.getBoundingClientRect()
  const parentRect = htmlEl.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 }

  leavingBatch.push({
    el: htmlEl,
    left: rect.left - parentRect.left,
    top: rect.top - parentRect.top,
    w: rect.width,
    done,
  })

  if (!leavingScheduled) {
    leavingScheduled = true
    queueMicrotask(() => {
      leavingScheduled = false
      animateLeaving([...leavingBatch])
      leavingBatch.length = 0
    })
  }
}

async function animateLeaving(batch: LeavingItem[]) {
  batch.forEach(({ el, left, top, w }) => {
    el.style.position = 'absolute'
    el.style.left = `${left}px`
    el.style.top = `${top}px`
    el.style.width = `${w}px`
    el.style.margin = '0'
  })

  const target = batch.reduce((a, b) =>
    b.top > a.top || (b.top === a.top && b.left > a.left) ? b : a
  )

  const phase1 = batch
    .filter(it => it !== target)
    .map(it =>
      it.el.animate(
        [
          { transform: 'translate(0,0)', opacity: '1' },
          { transform: `translate(${target.left - it.left}px, ${target.top - it.top}px)`, opacity: '0.7' },
        ],
        { duration: 180, easing: 'ease-in', fill: 'forwards' }
      )
    )

  await Promise.all(phase1.map(a => a.finished))

  batch.forEach(({ el }) => {
    el.style.left = `${target.left}px`
    el.style.top  = `${target.top}px`
  })
  phase1.forEach(a => a.cancel())

  await Promise.all(batch.map(({ el }) =>
    el.animate(
      [
        { opacity: '0.7', transform: 'translateX(0)' },
        { opacity: '0',   transform: `translateX(${target.w + 12}px)` },
      ],
      { duration: 280, easing: 'ease-in' }
    ).finished
  ))

  batch.forEach(({ done }) => done())
}
</script>

<template>
  <div class="widget">
    <div class="controls">
      <div class="options">
      <div class="option-row">
        <span class="option-label">Колода</span>
        <div class="deck-toggle">
          <button class="deck-btn" :class="{ active: deckSize === 36 }" @click="setDeckSize(36)">36</button>
          <button class="deck-btn" :class="{ active: deckSize === 52 }" @click="setDeckSize(52)">52</button>
        </div>
      </div>

      <div class="option-row">
        <span class="option-label">Количество</span>
        <div class="modifier-control">
          <button class="modifier-btn" @click="setCount(cardCount - 1)">−</button>
          <input
            :value="cardCount"
            type="number"
            :min="1"
            :max="maxCount"
            class="modifier-input"
            @change="onCountChange"
          />
          <button class="modifier-btn" @click="setCount(cardCount + 1)">+</button>
        </div>
      </div>

      <input
        :value="cardCount"
        type="range"
        :min="1"
        :max="maxCount"
        class="count-slider"
        @input="setCount(Number(($event.target as HTMLInputElement).value))"
      />
      </div>

      <div class="action-row">
        <button class="btn-primary" @click="pickCards">Вытянуть</button>
        <button class="btn-secondary" :disabled="history.length === 0" @click="clearHistory">
          Очистить
        </button>
      </div>
    </div>

    <TransitionGroup name="card" tag="div" class="history" @leave="onLeave">
      <div v-for="card in history" :key="card.uid" class="card-item" :class="card.color">
        <img
          v-if="!imgErrors.has(card.svgName)"
          :src="`/cards/${card.svgName}.svg`"
          :alt="`${card.rank} ${card.suit}`"
          class="card-svg"
          @error="onImgError(card.svgName)"
        />
        <div v-else class="card-fallback">
          <span class="card-rank">{{ card.rank }}</span>
          <span class="card-symbol">{{ card.suitSymbol }}</span>
        </div>
        <div class="card-label">{{ card.rank }} {{ card.suitSymbol }}</div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.widget {
  max-width: none;
  margin: 0;
}

.controls {
  width: 450px;
  margin: 0 auto;
}

.options {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-label {
  font-size: 0.95rem;
  opacity: 0.75;
  min-width: 90px;
}

.deck-toggle {
  display: flex;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.deck-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
}

.deck-btn:not(:last-child) {
  border-right: 1px solid rgb(from var(--color-primary) r g b / 0.3);
}

.deck-btn.active {
  background: rgb(from var(--color-primary) r g b / 0.15);
  border-color: var(--color-primary);
  border-right-color: transparent;
  color: var(--color-primary);
  opacity: 1;
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
  padding: 0.3em 0.6em;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s;
}

.modifier-btn:hover {
  background: rgb(from var(--color-primary) r g b / 0.1);
}

.modifier-input {
  width: 40px;
  padding: 0.3em 0;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.95rem;
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

.count-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) calc(v-bind('sliderPercent') * 1%),
    rgb(from var(--color-primary) r g b / 0.2) calc(v-bind('sliderPercent') * 1%),
    rgb(from var(--color-primary) r g b / 0.2) 100%
  );
  outline: none;
  cursor: pointer;
}

.count-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 6px;
  height: 18px;
  border-radius: 2px;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

.count-slider:hover::-webkit-slider-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}

.count-slider::-moz-range-thumb {
  width: 6px;
  height: 18px;
  border-radius: 2px;
  border: none;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

.count-slider:hover::-moz-range-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}

.action-row {
  margin-bottom: 1.75rem;
}

.history {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.75rem;
}

.card-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  transition-delay: 180ms;
}

.card-move {
  transition: transform 0.46s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.92);
}

.card-item {
  border-radius: 8px;
  border: 1px solid currentColor;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.card-item.red {
  color: var(--color-primary);
  background: rgb(from var(--color-primary) r g b / 0.08);
}

.card-item.black {
  color: var(--color-accent);
  background: rgb(from var(--color-accent) r g b / 0.08);
}

.card-svg {
  width: 100%;
  display: block;
  aspect-ratio: 2 / 3;
  object-fit: contain;
}

.card-fallback {
  width: 100%;
  aspect-ratio: 2 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.card-rank {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.card-symbol {
  font-size: 1.75rem;
  line-height: 1;
}

.card-label {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.5rem;
  opacity: 0.75;
}
</style>
