<script setup lang="ts">
import { ref } from 'vue'
import CoinFlipWidget from '../components/CoinFlipWidget.vue'
import DiceRollerWidget from '../components/DiceRollerWidget.vue'

interface Link {
  label: string
  href: string
  note?: string
}

interface LinkGroup {
  title: string
  links: Link[]
}

const linkGroups: LinkGroup[] = [
  {
    title: 'Материалы',
    links: [
      { label: 'Материалы за все сезоны', href: 'https://disk.yandex.ru/d/vw1yjwiCdIUsRg' },
      { label: 'Программы и списки', href: 'https://disk.yandex.ru/d/h78NiH8P9jdoEQ' }
    ]
  }
]

const openSet = ref(new Set<string>())

function toggle(key: string) {
  if (openSet.value.has(key)) {
    openSet.value.delete(key)
  } else {
    openSet.value.add(key)
  }
  openSet.value = new Set(openSet.value)
}
</script>

<template>
  <h1>Полезные ссылки</h1>
  <div class="items">
    <div class="item">
      <button class="item-header" :class="{ open: openSet.has('dice') }" @click="toggle('dice')">
        <span>Бросить кубик</span>
        <span class="chevron">▾</span>
      </button>
      <div class="item-body" :class="{ open: openSet.has('dice') }">
        <div class="widget-wrap">
          <DiceRollerWidget />
        </div>
      </div>
    </div>

    <div class="item">
      <button class="item-header" :class="{ open: openSet.has('coin') }" @click="toggle('coin')">
        <span>Подбросить монетку</span>
        <span class="chevron">▾</span>
      </button>
      <div class="item-body" :class="{ open: openSet.has('coin') }">
        <div class="widget-wrap">
          <CoinFlipWidget />
        </div>
      </div>
    </div>

    <div
      v-for="group in linkGroups"
      :key="group.title"
      class="item"
    >
      <button class="item-header" :class="{ open: openSet.has(group.title) }" @click="toggle(group.title)">
        <span>{{ group.title }}</span>
        <span class="chevron">▾</span>
      </button>
      <div class="item-body" :class="{ open: openSet.has(group.title) }">
        <div class="link-wrap">
          <div v-for="link in group.links" :key="link.href" class="link-entry">
            <a :href="link.href" target="_blank" class="item-link">{{ link.label }}</a>
            <p v-if="link.note" class="note">{{ link.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgb(from var(--color-accent-blue) r g b / 0.3);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.item-header:hover {
  background: rgb(from var(--color-accent-blue) r g b / 0.5);
}

.item-header.open {
  border-bottom-color: transparent;
  background: rgb(from var(--color-accent-purple) r g b / 0.4);
  border-left-color: var(--color-accent-cyan);
  border-left-width: 3px;
  padding-left: calc(16px - 2px);
}

.chevron {
  display: inline-block;
  transition: transform 0.25s ease;
  font-size: 1.2em;
  line-height: 1;
}

.item-header.open .chevron {
  transform: rotate(-180deg);
}

.item-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
  border: 1px solid var(--color-border);
  border-top: none;
}

.item-body.open {
  max-height: 1200px;
}

.widget-wrap {
  padding: 16px;
}

.link-wrap {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-entry {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-link {
  display: inline-block;
  font-size: 1em;
}

.note {
  margin: 0;
  font-size: 0.8em;
  color: var(--color-text);
  opacity: 0.7;
  border-left: 2px solid var(--color-accent-cyan);
  padding-left: 0.5rem;
}
</style>
