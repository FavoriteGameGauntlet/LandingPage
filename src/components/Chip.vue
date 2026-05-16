<script setup lang="ts">
defineProps<{
  player: string
  character: string
  clan?: string
}>()
</script>

<template>
  <div class="chip">
    <span class="chip-primary">{{ clan ?? character }}</span>
    <span class="chip-secondary">{{ clan ? character : player }}</span>
    <span v-if="clan" class="chip-tertiary">{{ player }}</span>
  </div>
</template>

<style scoped>
.chip {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 4px;
  background: var(--color-control-bg);
  border: 1px solid var(--color-bg-secondary);
}

.chip-primary {
  font-size: 0.9em;
  font-weight: 700;
  color: var(--color-primary);
}

.chip-secondary {
  font-size: 0.75em;
  color: var(--color-primary);
  opacity: 0.55;
}

.chip-tertiary {
  font-size: 0.7em;
  color: var(--color-primary);
  opacity: 0.55;
}
</style>
