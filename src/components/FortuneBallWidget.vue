<script setup lang="ts">
import { ref, computed } from 'vue'
import HistoryChips from './HistoryChips.vue'

type Variant = 'primary' | 'accent' | null

interface Answer {
  text: string
  variant: Variant
}

const answers: Answer[] = [
  { text: 'Да, без сомнений', variant: 'primary' },
  { text: 'Определенно да', variant: 'primary' },
  { text: 'Все указывает на это', variant: 'primary' },
  { text: 'Можешь рассчитывать', variant: 'primary' },
  { text: 'Скорее всего', variant: 'primary' },
  { text: 'Знаки благоприятны', variant: 'primary' },
  { text: 'Спроси позже', variant: null },
  { text: 'Трудно сказать', variant: null },
  { text: 'Картина туманна', variant: null },
  { text: 'Сосредоточся и спроси снова', variant: null },
  { text: 'Лучше не знать', variant: null },
  { text: 'Не рассчитывай', variant: 'accent' },
  { text: 'Очень сомнительно', variant: 'accent' },
  { text: 'Источники говорят — нет', variant: 'accent' },
  { text: 'Перспективы туманны', variant: 'accent' },
  { text: 'Нет', variant: 'accent' },
  { text: 'Звезды на твоей стороне', variant: 'primary' },
  { text: 'Смело действуй', variant: 'primary' },
  { text: 'Удача улыбается тебе', variant: 'primary' },
  { text: 'Все сложится наилучшим образом', variant: 'primary' },
  { text: 'Да', variant: 'primary' },
  { text: 'Сомнений нет', variant: 'primary' },
  { text: 'Звезды молчат', variant: null },
  { text: 'Туман скрывает ответ', variant: null },
  { text: 'Время покажет', variant: null },
  { text: 'Спроси иначе', variant: null },
  { text: 'Судьба еще не решила', variant: null },
  { text: 'Не время', variant: 'accent' },
  { text: 'Силы не на твоей стороне', variant: 'accent' },
  { text: 'Знаки неблагоприятны', variant: 'accent' },
  { text: 'Лучше откажись', variant: 'accent' },
  { text: 'Маловероятно', variant: 'accent' },
]

const result = ref<Answer | null>(null)
const revealing = ref(false)
const showAnswer = ref(false)
const slowHide = ref(false)
const history = ref<Answer[]>([])
let revealTimer: ReturnType<typeof setTimeout> | null = null

function hideInstant() {
  if (revealTimer) { clearTimeout(revealTimer); revealTimer = null }
  slowHide.value = false
  showAnswer.value = false
}

function ask() {
  if (revealing.value) return
  revealing.value = true
  hideInstant()

  setTimeout(() => {
    const answer = answers[Math.floor(Math.random() * answers.length)] as Answer
    result.value = answer
    history.value.unshift(answer)
    revealing.value = false
    showAnswer.value = true
    revealTimer = setTimeout(() => {
      slowHide.value = true
      showAnswer.value = false
      setTimeout(() => { slowHide.value = false }, 300)
    }, 4000)
  }, 1500)
}

function clear() {
  if (revealing.value) return
  result.value = null
  history.value = []
  hideInstant()
}

const historyItems = computed(() =>
  history.value.map(a => ({ label: a.text }))
)
</script>

<template>
  <div class="widget">
    <div class="ball-scene">
      <div
        class="ball"
        :class="{ revealing, active: history.length > 0 }"
        @click="ask"
      >
        <div class="ball-shine" />
        <div class="ball-inner">
          <transition name="answer" :duration="{ enter: 500, leave: slowHide ? 300 : 0 }">
            <div
              v-if="showAnswer && result"
              class="answer-text"
              :class="{ primary: result.variant === 'primary', accent: result.variant === 'accent' }"
            >
              {{ result.text }}
            </div>
            <div v-else-if="revealing" class="swirl">✦</div>
            <div v-else class="idle-symbol">8</div>
          </transition>
        </div>
      </div>
    </div>

    <div class="action-row">
      <button class="btn-primary" :disabled="revealing" @click="ask">
        {{ revealing ? 'Шар думает...' : 'Спросить' }}
      </button>
      <button class="btn-secondary" :disabled="revealing || history.length === 0" @click="clear">
        Очистить
      </button>
    </div>

    <HistoryChips :items="historyItems" />
  </div>
</template>

<style scoped>
.ball-scene {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.ball {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 33%,
    #3a1010 0%,
    var(--color-bg-secondary) 50%,
    #070404 100%
  );
  box-shadow:
    0 0 18px rgb(from var(--color-primary) r g b / 0.22),
    0 0 50px rgb(from var(--color-primary) r g b / 0.08),
    inset 0 0 35px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  transition: box-shadow 0.35s, transform 0.35s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.ball:hover:not(.revealing) {
  box-shadow:
    0 0 28px rgb(from var(--color-primary) r g b / 0.4),
    0 0 70px rgb(from var(--color-primary) r g b / 0.18),
    inset 0 0 35px rgba(0, 0, 0, 0.75);
}

.ball.revealing {
  cursor: default;
  box-shadow:
    0 0 40px rgb(from var(--color-primary) r g b / 0.55),
    0 0 90px rgb(from var(--color-primary) r g b / 0.25),
    inset 0 0 25px rgb(from var(--color-primary) r g b / 0.08);
  animation: pulse 0.9s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.ball.active:not(.revealing) {
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    box-shadow:
      0 0 18px rgb(from var(--color-primary) r g b / 0.22),
      0 0 50px rgb(from var(--color-primary) r g b / 0.08),
      inset 0 0 35px rgba(0, 0, 0, 0.75);
  }
  50% {
    box-shadow:
      0 0 28px rgb(from var(--color-primary) r g b / 0.35),
      0 0 65px rgb(from var(--color-primary) r g b / 0.15),
      inset 0 0 35px rgba(0, 0, 0, 0.75);
  }
}

.ball-shine {
  position: absolute;
  top: 13%;
  left: 20%;
  width: 32%;
  height: 22%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.1),
    transparent 70%
  );
  pointer-events: none;
}

.ball-inner {
  position: relative;
  width: 62%;
  height: 62%;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.55), transparent 70%);
}

.idle-symbol,
.swirl,
.answer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.idle-symbol {
  font-size: 3.2em;
  font-weight: 900;
  color: var(--color-primary);
  opacity: 0.3;
  font-family: Georgia, serif;
  line-height: 1;
}

.swirl {
  font-size: 1.8em;
  color: var(--color-accent);
  opacity: 0.8;
  animation: spin 1.1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.answer-text {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-primary);
  text-shadow: 0 0 12px rgb(from var(--color-primary) r g b / 0.6);
  padding: 0.4em;
}

.answer-enter-active {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.answer-leave-active {
  transition: opacity 0.3s ease-in, transform 0.3s ease-in;
}

.answer-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.85);
}

.answer-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.action-row {
  margin-bottom: 1.75rem;
}
</style>
