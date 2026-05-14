<script lang="ts">
export default { name: 'Tools' }
</script>

<script setup lang="ts">
import { ref } from 'vue'
import CoinFlipWidget from '../components/CoinFlipWidget.vue'
import DiceRollerWidget from '../components/DiceRollerWidget.vue'

const tools = [
  { id: 'dice', label: 'Бросить кубик' },
  { id: 'coin', label: 'Подбросить монетку' },
  { id: 'links', label: 'Материалы' },
]

const active = ref('dice')
</script>

<template>
  <h1>Инструменты</h1>
  <div class="tabs">
    <button
      v-for="tool in tools"
      :key="tool.id"
      class="tab"
      :class="{ active: active === tool.id }"
      @click="active = tool.id"
    >{{ tool.label }}</button>
  </div>
  <div class="panel">
    <div v-show="active === 'dice'"><DiceRollerWidget /></div>
    <div v-show="active === 'coin'"><CoinFlipWidget /></div>
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
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 10px 22px;
  background: rgb(from var(--color-accent-blue) r g b / 0.18);
  border: none;
  color: var(--color-text);
  font-size: 1em;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
}

@media (max-width: 600px) {
  .tab {
    flex: 1 1 100%;
  }
}

.tab:hover {
  background: rgb(from var(--color-accent-blue) r g b / 0.35);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.4);
}

.tab.active {
  background: rgb(from var(--color-accent-purple) r g b / 0.45);
  color: var(--color-accent-cyan);
  font-weight: 600;
  box-shadow: 0 4px 16px rgb(from var(--color-accent-cyan) r g b / 0.25);
}

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
}
</style>
