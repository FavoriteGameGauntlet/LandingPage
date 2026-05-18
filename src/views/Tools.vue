<script lang="ts">
export default { name: 'Tools' }
</script>

<script setup lang="ts">
import { ref } from 'vue'
import CardTabs from '../components/CardTabs.vue'
import CoinFlipWidget from '../components/CoinFlipWidget.vue'
import DiceRollerWidget from '../components/DiceRollerWidget.vue'
import SpinningWheelWidget from '../components/SpinningWheelWidget.vue'
const tools = [
  { id: 'dice', label: 'Кубики' },
  { id: 'coin', label: 'Монетка' },
  { id: 'wheel', label: 'Колесо' },
  { id: 'links', label: 'Материалы' },
]

const active = ref('')
</script>

<template>
  <CardTabs :items="tools" v-model="active" :toggleable="true" />
  <div class="panel">
    <div v-show="active === 'dice'"><DiceRollerWidget /></div>
    <div v-show="active === 'coin'"><CoinFlipWidget /></div>
    <div v-show="active === 'wheel'"><SpinningWheelWidget /></div>
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
