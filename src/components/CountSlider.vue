<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  min: number
  max: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const sliderPercent = computed(() => (props.modelValue - props.min) / (props.max - props.min) * 100)

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <input
    :value="modelValue"
    type="range"
    :min="min"
    :max="max"
    class="count-slider"
    @input="onInput"
  />
</template>

<style scoped>
.count-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) calc(v-bind('sliderPercent') * 1%),
    rgb(from var(--color-primary) r g b / 0.2) calc(v-bind('sliderPercent') * 1%),
    rgb(from var(--color-primary) r g b / 0.2) 100%
  );
  outline: none;
  cursor: pointer;
}

.count-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 6px;
  height: 18px;
  border-radius: 2px;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

.count-slider:hover::-webkit-slider-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}

.count-slider::-moz-range-thumb {
  width: 6px;
  height: 18px;
  border-radius: 2px;
  border: none;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

.count-slider:hover::-moz-range-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}
</style>
