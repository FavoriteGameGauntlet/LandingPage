<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const S3 = import.meta.env.VITE_S3_BASE_URL

interface TarotCard {
  id: string
  name: string
  uid: number
  revealed: boolean
}

const CARDS = [
  { id: 'the-fool', name: 'Шут' },
  { id: 'the-magician', name: 'Маг' },
  { id: 'the-high-priestess', name: 'Жрица' },
  { id: 'the-empress', name: 'Императрица' },
  { id: 'the-emperor', name: 'Император' },
  { id: 'the-hierophant', name: 'Иерофант' },
  { id: 'the-lovers', name: 'Влюблённые' },
  { id: 'the-chariot', name: 'Колесница' },
  { id: 'strength', name: 'Сила' },
  { id: 'the-hermit', name: 'Отшельник' },
  { id: 'wheel-of-fortune', name: 'Колесо Фортуны' },
  { id: 'justice', name: 'Справедливость' },
  { id: 'the-hanged-man', name: 'Повешенный' },
  { id: 'death', name: 'Смерть' },
  { id: 'temperance', name: 'Умеренность' },
  { id: 'the-devil', name: 'Дьявол' },
  { id: 'the-tower', name: 'Башня' },
  { id: 'the-star', name: 'Звезда' },
  { id: 'the-moon', name: 'Луна' },
  { id: 'the-sun', name: 'Солнце' },
  { id: 'judgement', name: 'Суд' },
  { id: 'the-world', name: 'Мир' },
]

const cardCount = ref(1)
const maxCount = 10
const sliderPercent = computed(() => (cardCount.value - 1) / (maxCount - 1) * 100)

function setCount(val: number) {
  cardCount.value = Math.min(maxCount, Math.max(1, val || 1))
}

function onCountChange(e: Event) {
  setCount(Number((e.target as HTMLInputElement).value))
}

let uidCounter = 0
const buffer = ref([...CARDS])
const history = ref<TarotCard[]>([])

function pickCards() {
  const drawn: TarotCard[] = []
  for (let i = 0; i < cardCount.value; i++) {
    if (buffer.value.length === 0) buffer.value = [...CARDS]
    const idx = Math.floor(Math.random() * buffer.value.length)
    const picked = buffer.value.splice(idx, 1)[0]!
    drawn.push({ ...picked, uid: uidCounter++, revealed: false })
  }
  history.value.unshift(...drawn)
  while (history.value.length > 10) history.value.pop()
  drawn.forEach((card, i) => {
    setTimeout(() => {
      const found = history.value.find(c => c.uid === card.uid)
      if (found) found.revealed = true
    }, 150 + i * 100)
  })
}

let clearing = false

function clearHistory() {
  clearing = true
  history.value = []
  buffer.value = [...CARDS]
  nextTick(() => { clearing = false })
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
      <div v-for="card in history" :key="card.uid" class="card-wrap">
        <div class="card-scene">
          <div class="card-3d" :class="{ revealed: card.revealed }">
            <div class="card-face card-back">
              <img :src="`${S3}/tarot/background.webp`" alt="" class="card-img" />
            </div>
            <div class="card-face card-front">
              <img :src="`${S3}/tarot/${card.id}.webp`" :alt="card.name" class="card-img" />
            </div>
          </div>
        </div>
        <div class="card-name" :class="{ visible: card.revealed }">{{ card.name }}</div>
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

.modifier-control {
  display: flex;
  align-items: stretch;
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
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--color-primary);
  padding: 0 0.6em;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem 0.75rem;
}

.card-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.card-move {
  transition: transform 0.46s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-14px) scale(0.9);
}

.card-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.card-scene {
  width: 100%;
  perspective: 700px;
}

.card-3d {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.card-3d.revealed {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.card-name {
  font-size: 0.72rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.35s ease 0.4s;
  color: var(--color-primary);
  line-height: 1.2;
}

.card-name.visible {
  opacity: 0.85;
}
</style>
