<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useCardLeave, GATHER_MS, SWEEP_MS } from '../composables/useCardLeave'
import { useCardSounds } from '../composables/useCardSounds'
import NumberStepper from './NumberStepper.vue'
import CountSlider from './CountSlider.vue'

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

const { clearStart, clearEnd, onLeave } = useCardLeave()
const { playFlip, playLeave } = useCardSounds()

// A card turns over once it has landed: the entrance itself runs 250ms
const REVEAL_MS = 320

const cardCount = ref(1)
const maxCount = 10

let uidCounter = 0
let dealTimer: ReturnType<typeof setTimeout> | null = null
const buffer = ref([...CARDS])
const history = ref<TarotCard[]>([])

function pickCards() {
  // Clicking again during the pause would cancel the pending deal, and the cards it had
  // already taken out of the deck would never reach the history
  if (dealTimer) return
  const drawn: TarotCard[] = []
  for (let i = 0; i < cardCount.value; i++) {
    if (buffer.value.length === 0) buffer.value = [...CARDS]
    const idx = Math.floor(Math.random() * buffer.value.length)
    const picked = buffer.value.splice(idx, 1)[0]!
    drawn.push({ ...picked, uid: uidCounter++, revealed: false })
  }
  const overflow = history.value.length + drawn.length - 10
  if (overflow > 0) {
    history.value.splice(history.value.length - overflow, overflow)
    playLeave(overflow)
    // The deal waits out the cards leaving rather than landing on the same frame, and a
    // lone card skips the gather it has no one to gather with
    dealTimer = setTimeout(() => deal(drawn), overflow > 1 ? GATHER_MS + SWEEP_MS : SWEEP_MS)
  } else {
    deal(drawn)
  }
}

function deal(drawn: TarotCard[]) {
  dealTimer = null
  history.value.unshift(...drawn)
  drawn.forEach((card, i) => {
    setTimeout(() => {
      const found = history.value.find(c => c.uid === card.uid)
      if (found) {
        found.revealed = true
        playFlip()
      }
    }, REVEAL_MS + i * 100)
  })
}

function clearHistory() {
  if (dealTimer) { clearTimeout(dealTimer); dealTimer = null }
  clearStart()
  history.value = []
  buffer.value = [...CARDS]
  nextTick(clearEnd)
}
</script>

<template>
  <div class="widget" ref="root">
    <div class="controls">
      <div class="options">
        <div class="option-row">
          <span class="option-label">Количество</span>
          <NumberStepper v-model="cardCount" :min="1" :max="maxCount" />
        </div>

        <CountSlider v-model="cardCount" :min="1" :max="maxCount" />
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
