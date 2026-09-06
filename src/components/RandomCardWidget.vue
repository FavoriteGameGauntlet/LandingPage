<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useCardLeave, GATHER_MS, SWEEP_MS } from '../composables/useCardLeave'
import { useCardSounds } from '../composables/useCardSounds'
import NumberStepper from './NumberStepper.vue'
import CountSlider from './CountSlider.vue'
import heartsIcon from '../assets/icons/random-card/hearts.svg?raw'
import diamondsIcon from '../assets/icons/random-card/diamonds.svg?raw'
import clubsIcon from '../assets/icons/random-card/clubs.svg?raw'
import spadesIcon from '../assets/icons/random-card/spades.svg?raw'
import aceIcon from '../assets/icons/random-card/ace.svg?raw'
import n2Icon from '../assets/icons/random-card/2.svg?raw'
import n3Icon from '../assets/icons/random-card/3.svg?raw'
import n4Icon from '../assets/icons/random-card/4.svg?raw'
import n5Icon from '../assets/icons/random-card/5.svg?raw'
import n6Icon from '../assets/icons/random-card/6.svg?raw'
import n7Icon from '../assets/icons/random-card/7.svg?raw'
import n8Icon from '../assets/icons/random-card/8.svg?raw'
import n9Icon from '../assets/icons/random-card/9.svg?raw'
import n10Icon from '../assets/icons/random-card/10.svg?raw'
import jackIcon from '../assets/icons/random-card/jack.svg?raw'
import queenIcon from '../assets/icons/random-card/queen.svg?raw'
import kingIcon from '../assets/icons/random-card/king.svg?raw'

const SUIT_ICONS: Record<string, string> = {
  hearts: heartsIcon,
  diamonds: diamondsIcon,
  clubs: clubsIcon,
  spades: spadesIcon,
}

const RANK_ICONS: Record<string, string> = {
  ace: aceIcon,
  '2': n2Icon,
  '3': n3Icon,
  '4': n4Icon,
  '5': n5Icon,
  '6': n6Icon,
  '7': n7Icon,
  '8': n8Icon,
  '9': n9Icon,
  '10': n10Icon,
  jack: jackIcon,
  queen: queenIcon,
  king: kingIcon,
}

interface Card {
  rank: string
  rankName: string
  suit: string
  suitSymbol: string
  suitName: string
  svgName: string
  color: 'red' | 'black'
  uid: number
  revealed: boolean
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

function buildDeck(): Omit<Card, 'uid' | 'revealed'>[] {
  const ranks = deckSize.value === 36 ? RANKS_36 : RANKS_52
  const deck: Omit<Card, 'uid' | 'revealed'>[] = []
  for (const s of SUITS) {
    for (const r of ranks) {
      deck.push({
        rank: r.rank,
        rankName: r.name,
        suit: s.suit,
        suitSymbol: s.symbol,
        suitName: s.name,
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

const { clearStart, clearEnd, onLeave } = useCardLeave()
const { playFlip, playLeave } = useCardSounds()

// A card turns over once it has landed: the entrance itself runs 250ms
const REVEAL_MS = 320

let uidCounter = 0
let dealTimer: ReturnType<typeof setTimeout> | null = null
const buffer = ref<Omit<Card, 'uid' | 'revealed'>[]>(buildDeck())
const history = ref<Card[]>([])

function pickCards() {
  // Clicking again during the pause would cancel the pending deal, and the cards it had
  // already taken out of the deck would never reach the history
  if (dealTimer) return
  const drawn: Card[] = []
  for (let i = 0; i < cardCount.value; i++) {
    if (buffer.value.length === 0) buffer.value = buildDeck()
    const idx = Math.floor(Math.random() * buffer.value.length)
    const picked = buffer.value.splice(idx, 1)[0]
    if (picked) drawn.push({ ...picked, uid: uidCounter++, revealed: false })
  }
  const overflow = history.value.length + drawn.length - 20
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

function deal(drawn: Card[]) {
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
  buffer.value = buildDeck()
  nextTick(clearEnd)
}

const imgErrors = ref<Set<string>>(new Set())

function onImgError(svgName: string) {
  imgErrors.value = new Set([...imgErrors.value, svgName])
}
</script>

<template>
  <div class="widget" ref="root">
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
      <div v-for="card in history" :key="card.uid" class="card-item" :class="card.color">
        <div class="card-scene">
          <div class="card-3d" :class="{ revealed: card.revealed }">
            <div class="card-face card-back">
              <div class="back-inner" />
            </div>
            <div class="card-face card-front">
              <img
                v-if="!imgErrors.has(card.svgName)"
                :src="`/cards/${card.svgName}.svg`"
                :alt="`${card.rank} ${card.suit}`"
                class="card-svg"
                @error="onImgError(card.svgName)"
              />
              <div v-else class="card-fallback">
                <span class="card-rank-icon" v-html="RANK_ICONS[card.rankName]" />
                <span class="card-suit-icon" v-html="SUIT_ICONS[card.suitName]" />
              </div>
            </div>
          </div>
        </div>
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
  padding: 0.3em 0.8em;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
}

.deck-btn:not(:last-child) {
  border-right: 1px solid rgb(from var(--color-primary) r g b / 0.3);
}

.deck-btn:focus-visible {
  opacity: 1;
  outline-offset: -2px;
}

.deck-btn.active {
  background: rgb(from var(--color-primary) r g b / 0.15);
  border-color: var(--color-primary);
  border-right-color: transparent;
  color: var(--color-primary);
  opacity: 1;
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
}

.card-move {
  transition: transform 0.46s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.92);
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-item.red {
  color: var(--color-primary);
}

.card-item.black {
  color: var(--color-accent);
}

.card-scene {
  width: 100%;
  perspective: 320px;
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
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid currentColor;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-back {
  background: var(--color-bg-secondary);
  justify-content: center;
}

.back-inner {
  width: 55%;
  aspect-ratio: 1;
  border: 2px solid currentColor;
  border-radius: 3px;
  opacity: 0.35;
  transform: rotate(45deg);
  box-shadow: 0 0 0 5px currentColor;
  outline: 2px solid currentColor;
  outline-offset: 8px;
}

.card-front {
  transform: rotateY(180deg);
}

/* The tint the frame used to carry rides on the face itself, so it turns with the card */
.card-item.red .card-front {
  background: rgb(from var(--color-primary) r g b / 0.08);
}

.card-item.black .card-front {
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

.card-rank-icon,
.card-suit-icon {
  display: flex;
  width: 52px;
  height: 52px;
}

.card-rank-icon :deep(svg),
.card-suit-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
