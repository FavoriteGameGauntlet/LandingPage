<script setup lang="ts">
const props = defineProps<{
  items: { id: string; label: string }[]
  modelValue: string
  toggleable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function select(id: string) {
  if (props.toggleable && props.modelValue === id) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', id)
  }
}
</script>

<template>
  <div class="card-tabs">
    <button
      v-for="item in items"
      :key="item.id"
      class="card-tab"
      :class="{ active: modelValue === item.id }"
      @click="select(item.id)"
    >{{ item.label }}</button>
  </div>
</template>

<style scoped>
.card-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 24px;
}

.card-tab {
  --tab-padding: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--tab-padding);
  background: var(--color-control-bg);
  border: 1px solid var(--color-bg-secondary);
  color: var(--color-primary);
  font-size: 1.05em;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.card-tab:hover {
  background: var(--color-control-bg-hover);
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.4);
}

.card-tab.active {
  border-color: var(--color-bg-secondary);
  border-left-color: var(--color-accent);
  border-left-width: 3px;
  padding-left: calc(var(--tab-padding) - 2px);
  color: var(--color-accent);
  background: rgb(from var(--color-accent) r g b / 0.08);
}
</style>
