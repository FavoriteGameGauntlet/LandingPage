<script setup lang="ts">
defineProps<{
  href?: string
}>()
</script>

<template>
  <a v-if="href" :href="href" class="neon-button"><slot /></a>
  <button v-else class="neon-button" v-bind="$attrs"><slot /></button>
</template>

<style scoped>
.neon-button {
  position: relative;
  display: inline-flex;
  padding: 0.5em 1em;
  justify-content: center;
  align-items: center;
  border: 4px solid var(--color-accent-magenta);
  border-radius: 0.25em;
  background-color: var(--color-bg);
  box-shadow: inset 0 0 0.5em 0 var(--color-accent-magenta), 0 0 0.5em 0 var(--color-accent-magenta);
  transition: box-shadow 200ms ease, background-color 200ms ease, color 200ms ease;
  color: var(--color-accent-magenta);
  font-size: 24px;
  font-weight: 400;
  font-family: inherit;
  text-decoration: none;
  text-transform: uppercase;
  text-shadow: 0 0 0.125em hsla(317, 0%, 100%, 0.5), 0 0 0.5em var(--color-accent-magenta);
  cursor: pointer;
}

.neon-button:hover:not(:disabled) {
  background-color: var(--color-accent-magenta);
  box-shadow: inset 0 0 0.5em 0 var(--color-accent-magenta), 0 0 2em 0 var(--color-accent-magenta);
  color: var(--color-bg);
  text-shadow: none;
}

.neon-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
