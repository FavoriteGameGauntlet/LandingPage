<script setup lang="ts">
defineProps<{
  items: { label: string; variant?: 'primary' | 'accent' }[]
}>()
</script>

<template>
  <div v-if="items.length > 0" class="history-chips">
    <span
      v-for="(item, i) in items"
      :key="i"
      class="chip"
      :class="item.variant ?? 'primary'"
    >{{ item.label }}</span>
  </div>
</template>

<style scoped>
.history-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
