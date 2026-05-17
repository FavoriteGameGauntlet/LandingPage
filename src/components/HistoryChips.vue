<script setup lang="ts">
defineProps<{
  items: { label: string; variant?: 'primary' | 'accent'; title?: string }[]
}>()
</script>

<template>
  <div v-if="items.length > 0" class="history-chips">
    <span
      v-for="(item, i) in items"
      :key="i"
      class="chip-wrap"
    >
      <span class="chip" :class="item.variant ?? 'primary'">{{ item.label }}</span>
      <span v-if="item.title" class="chip-tooltip">{{ item.title }}</span>
    </span>
  </div>
</template>

<style scoped>
.history-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip-wrap {
  position: relative;
}

.chip-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: pre;
  font-size: 0.8rem;
  padding: 0.3em 0.7em;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  border: 1px solid rgb(from var(--color-primary) r g b / 0.35);
  color: var(--color-text);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
}

.chip-wrap:hover .chip-tooltip {
  opacity: 1;
}

.chip {
  padding: 0.25em 0.65em;
  border-radius: 4px;
  font-size: 0.95rem;
}

.chip.primary {
  color: var(--color-primary);
  border: 1px solid rgb(from var(--color-primary) r g b / 0.5);
  background: rgb(from var(--color-primary) r g b / 0.07);
}

.chip.accent {
  color: var(--color-accent);
  border: 1px solid rgb(from var(--color-accent) r g b / 0.5);
  background: rgb(from var(--color-accent) r g b / 0.07);
}
</style>
