<script lang="ts">
export default { name: 'Tools' }
</script>

<script setup lang="ts">
import { ref } from 'vue'
import CardTabs from '../components/CardTabs.vue'
import CoinFlipWidget from '../components/CoinFlipWidget.vue'
import DiceRollerWidget from '../components/DiceRollerWidget.vue'
import SpinningWheelWidget from '../components/SpinningWheelWidget.vue'
import RandomMovieWidget from '../components/RandomMovieWidget.vue'
import FortuneBallWidget from '../components/FortuneBallWidget.vue'
import RandomCardWidget from '../components/RandomCardWidget.vue'
import HashImageWidget from '../components/HashImageWidget.vue'
import GameCoverWidget from '../components/GameCoverWidget.vue'
import TarotCardWidget from '../components/TarotCardWidget.vue'
import LuckyTicketWidget from '../components/LuckyTicketWidget.vue'
import RpsLsWidget from '../components/RpsLsWidget.vue'
const tools = [
  { id: 'fortune', label: 'Волшебный шар' },
  { id: 'card', label: 'Игральные карты' },
  { id: 'images', label: 'Картинка по хэшу' },
  { id: 'tarot', label: 'Карты Таро' },
  { id: 'rpsls',  label: 'КНБЯК' },
  { id: 'wheel', label: 'Колесо фортуны' },
  { id: 'dice', label: 'Кубики' },
  { id: 'links', label: 'Материалы' },
  { id: 'coin', label: 'Монетка' },
  { id: 'gamecover', label: 'Обложка игры' },
  { id: 'movie', label: 'Случайный фильм' },
  { id: 'ticket', label: 'Счастливый билет' },
]

const active = ref('')
</script>

<template>
  <CardTabs :items="tools" v-model="active" :toggleable="true" />
  <div class="panel">
    <div v-show="active === 'dice'"><DiceRollerWidget /></div>
    <div v-show="active === 'coin'"><CoinFlipWidget /></div>
    <div v-show="active === 'wheel'"><SpinningWheelWidget /></div>
    <div v-show="active === 'movie'"><RandomMovieWidget /></div>
    <div v-show="active === 'card'"><RandomCardWidget /></div>
    <div v-show="active === 'fortune'"><FortuneBallWidget /></div>
    <div v-show="active === 'images'"><HashImageWidget /></div>
    <div v-show="active === 'gamecover'"><GameCoverWidget /></div>
    <div v-show="active === 'tarot'"><TarotCardWidget /></div>
    <div v-show="active === 'ticket'"><LuckyTicketWidget /></div>
    <div v-show="active === 'rpsls'"><RpsLsWidget /></div>
    <div v-show="active === 'links'" class="link-wrap">
      <div class="link-entry">
        <a href="https://disk.yandex.ru/d/vw1yjwiCdIUsRg" target="_blank" class="item-link">Материалы за все сезоны</a>
      </div>
      <div class="link-entry">
        <a href="https://disk.yandex.ru/d/h78NiH8P9jdoEQ" target="_blank" class="item-link">Программы и списки</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  padding: 8px 0;
  min-height: 200px;
}

.link-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-link {
  font-size: 1em;
  display: inline-block;
  color: var(--color-primary);
}

</style>
