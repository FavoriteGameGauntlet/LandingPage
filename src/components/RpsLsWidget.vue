<script setup lang="ts">
import { ref } from 'vue'
import { useResultStrip } from '../composables/useResultStrip'
import rockSvg     from '../assets/icons/rpsls/rock.svg?raw'
import paperSvg    from '../assets/icons/rpsls/paper.svg?raw'
import scissorsSvg from '../assets/icons/rpsls/scissors.svg?raw'
import lizardSvg   from '../assets/icons/rpsls/lizard.svg?raw'
import spockSvg    from '../assets/icons/rpsls/spock.svg?raw'

type Choice = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock'
type Outcome = 'win' | 'lose' | 'draw'

interface ChoiceInfo {
  id: Choice
  label: string
  info: string
}

interface HistoryEntry {
  player: Choice
  computer: Choice
  outcome: Outcome
}

const svgMap: Record<Choice, string> = {
  rock:     rockSvg,
  paper:    paperSvg,
  scissors: scissorsSvg,
  lizard:   lizardSvg,
  spock:    spockSvg,
}

const choiceList: ChoiceInfo[] = [
  { id: 'rock',     label: 'Камень',  info: 'Побеждает:\n• Ящерица\n• Ножницы\n\nПроигрывает:\n• Бумага\n• Спок' },
  { id: 'paper',    label: 'Бумага',  info: 'Побеждает:\n• Камень\n• Спок\n\nПроигрывает:\n• Ножницы\n• Ящерица' },
  { id: 'scissors', label: 'Ножницы', info: 'Побеждает:\n• Бумага\n• Ящерица\n\nПроигрывает:\n• Камень\n• Спок' },
  { id: 'lizard',   label: 'Ящерица', info: 'Побеждает:\n• Бумага\n• Спок\n\nПроигрывает:\n• Камень\n• Ножницы' },
  { id: 'spock',    label: 'Спок',    info: 'Побеждает:\n• Ножницы\n• Камень\n\nПроигрывает:\n• Бумага\n• Ящерица' },
]

const beats: Record<Choice, [Choice, Choice]> = {
  rock:     ['lizard',   'scissors'],
  paper:    ['rock',     'spock'],
  scissors: ['paper',    'lizard'],
  lizard:   ['paper',    'spock'],
  spock:    ['scissors', 'rock'],
}

const outcomeLabels: Record<Outcome, string> = {
  win:  'Победа',
  lose: 'Поражение',
  draw: 'Ничья',
}

const { showResult, slowHide, hideInstant, show } = useResultStrip()

const playerChoice  = ref<Choice | null>(null)
const computerChoice = ref<Choice | null>(null)
const thinking  = ref(false)
const roundResult = ref<Outcome | null>(null)
const history = ref<HistoryEntry[]>([])
const score = ref({ player: 0, computer: 0, draw: 0 })

function resolve(player: Choice, computer: Choice): Outcome {
  if (player === computer) return 'draw'
  return beats[player].includes(computer) ? 'win' : 'lose'
}

function beatenBy(choice: Choice): Choice[] {
  return (Object.keys(beats) as Choice[]).filter(c => beats[c].includes(choice))
}

function getCpuChoice(): Choice {
  const last = history.value[0]
  if (!last || last.outcome === 'draw')
    return choiceList[Math.floor(Math.random() * choiceList.length)]?.id ?? 'rock'
  const counters = beatenBy(last.player)
  return counters[Math.floor(Math.random() * counters.length)] ?? 'rock'
}

function select(choice: Choice) {
  if (thinking.value) return
  playerChoice.value = choice
  computerChoice.value = null
  roundResult.value = null
  hideInstant()
}

function play() {
  if (!playerChoice.value || thinking.value) return
  const choice = playerChoice.value
  computerChoice.value = null
  roundResult.value = null
  hideInstant()
  thinking.value = true

  setTimeout(() => {
    const cpu = getCpuChoice()
    const outcome = resolve(choice, cpu)
    computerChoice.value = cpu
    roundResult.value = outcome
    thinking.value = false
    history.value.unshift({ player: choice, computer: cpu, outcome })
    if (history.value.length > 20) history.value.pop()
    if (outcome === 'win') score.value.player++
    else if (outcome === 'lose') score.value.computer++
    else score.value.draw++
    show()
  }, 700)
}

function clear() {
  playerChoice.value = null
  computerChoice.value = null
  roundResult.value = null
  thinking.value = false
  hideInstant()
  history.value = []
  score.value = { player: 0, computer: 0, draw: 0 }
}
</script>

<template>
  <div class="widget">
    <div class="score-line">
      <div class="score-cell">
        <h3 class="score-label">Победы</h3>
      </div>
      <div class="score-cell">
        <h3 class="score-label">Ничьи</h3>
      </div>
      <div class="score-cell">
        <h3 class="score-label">Поражения</h3>
      </div>
      <div class="score-divider"></div>
      <div class="score-cell"><span class="score-num">{{ score.player }}</span></div>
      <div class="score-cell"><span class="score-num">{{ score.draw }}</span></div>
      <div class="score-cell"><span class="score-num">{{ score.computer }}</span></div>
    </div>

    <div class="battle-wrap">
      <div class="battle-area">
        <div class="side player-side">
          <div class="choice-display" :class="{ active: playerChoice !== null }">
            <span v-if="playerChoice" class="choice-icon" v-html="svgMap[playerChoice]"></span>
            <span v-else class="choice-placeholder">?</span>
          </div>
          <div class="side-label">Ты</div>
        </div>

        <div class="middle">
          <div class="vs-label">VS</div>
        </div>

        <div class="side computer-side">
          <div class="choice-display" :class="{ active: computerChoice !== null, thinking }">
            <span v-if="computerChoice" class="choice-icon" v-html="svgMap[computerChoice]"></span>
            <span v-else class="choice-placeholder">?</span>
          </div>
          <div class="side-label">Компьютер</div>
        </div>
      </div>

      <div
        class="result-strip"
        :class="{ visible: showResult, 'slow-hide': slowHide, win: roundResult === 'win', lose: roundResult === 'lose' }"
      >{{ roundResult ? outcomeLabels[roundResult] : '' }}</div>
    </div>

    <div class="choices-row">
      <button
        v-for="c in choiceList"
        :key="c.id"
        class="choice-btn"
        :class="{ selected: playerChoice === c.id }"
        :disabled="thinking"
        @click="select(c.id)"
      >
        <span class="btn-icon" v-html="svgMap[c.id]"></span>
        <span class="btn-label">{{ c.label }}</span>
        <span class="info-wrap">
          <span class="info-icon">i</span>
          <span class="info-tooltip">{{ c.info }}</span>
        </span>
      </button>
    </div>

    <div class="action-row">
      <button class="btn-primary" :disabled="!playerChoice || thinking" @click="play">
        {{ thinking ? 'Думает...' : 'Сыграть' }}
      </button>
      <button class="btn-secondary" :disabled="history.length === 0 || thinking" @click="clear">
        Очистить
      </button>
    </div>

    <div v-if="history.length > 0" class="history-chips">
      <span
        v-for="(h, i) in history"
        :key="i"
        class="history-chip"
        :class="h.outcome"
        :title="outcomeLabels[h.outcome]"
      >
        <span class="chip-icon" v-html="svgMap[h.player]"></span>
        <span class="chip-icon" v-html="svgMap[h.computer]"></span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.widget {
  max-width: 600px;
}

.battle-wrap {
  position: relative;
  margin: 2rem 0;
  padding: 1.5rem 0;
}

.battle-area {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  min-height: 110px;
}

.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.choice-display {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.player-side .choice-display.active {
  border-color: var(--color-accent);
  box-shadow: 0 0 14px rgb(from var(--color-accent) r g b / 0.3);
}

.computer-side .choice-display.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 14px rgb(from var(--color-primary) r g b / 0.3);
}

.choice-display.thinking {
  border-color: var(--color-primary);
  animation: pulse-think 0.75s ease-in-out infinite;
}

@keyframes pulse-think {
  0%, 100% { box-shadow: 0 0 6px rgb(from var(--color-primary) r g b / 0.2); }
  50%       { box-shadow: 0 0 18px rgb(from var(--color-primary) r g b / 0.5); }
}

.choice-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-side .choice-icon   { color: var(--color-accent); }
.computer-side .choice-icon { color: var(--color-primary); }

.choice-icon :deep(svg),
.btn-icon :deep(svg),
.chip-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.choice-placeholder {
  font-size: 2.4rem;
  color: var(--color-primary);
  opacity: 0.2;
}

.side-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.45;
}

.middle {
  display: flex;
  align-items: center;
  min-width: 110px;
  justify-content: center;
}

.vs-label {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  opacity: 0.3;
}

.score-line {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 1rem;
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
}

.result-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
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

.result-strip.slow-hide { transition: opacity 0.4s; }
.result-strip.visible   { opacity: 1; transition: opacity 0.1s; }
.result-strip.win       { color: var(--color-accent); }

.choices-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.choice-btn {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.8rem 0.5rem;
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.12s;
  color: inherit;
  font-family: inherit;
}

.choice-btn:hover:not(:disabled) {
  background: var(--color-control-bg-hover);
  transform: translateY(-2px);
  text-shadow: none;
}

.choice-btn.selected {
  color: var(--color-accent);
  background: rgb(from var(--color-accent) r g b / 0.08);
}

.choice-btn:disabled {
  cursor: default;
  opacity: 0.65;
  transform: none;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.85;
}

.info-wrap {
  position: absolute;
  top: 4px;
  right: 4px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 0.6rem;
  font-style: italic;
  font-weight: 700;
  border: 1px solid var(--color-text);
  color: var(--color-text);
  opacity: 0.35;
  cursor: default;
  line-height: 1;
}

.info-wrap:hover .info-icon    { opacity: 0.75; }
.info-wrap:hover .info-tooltip { opacity: 1; }

.info-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: pre-line;
  text-align: left;
  font-size: 0.75rem;
  padding: 0.3em 0.7em;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  border: 1px solid rgb(from var(--color-primary) r g b / 0.35);
  color: var(--color-text);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 1;
}

.action-row {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.history-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.5);
  background: rgb(from var(--color-primary) r g b / 0.07);
  color: var(--color-primary);
}

.history-chip.win {
  border-color: rgb(from var(--color-accent) r g b / 0.5);
  background: rgb(from var(--color-accent) r g b / 0.07);
  color: var(--color-accent);
}

.history-chip.draw {
  opacity: 0.5;
}

.chip-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
}
</style>
