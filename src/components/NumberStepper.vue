<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  inputWidth?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function clamp(val: number) {
  const v = isNaN(val) ? 0 : val
  return Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, v))
}

function update(val: number) {
  emit('update:modelValue', clamp(val))
}

function onChange(e: Event) {
  update(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="stepper">
    <button type="button" class="stepper-btn" @click="update(modelValue - 1)">−</button>
    <input
      :value="modelValue"
      type="number"
      :min="min"
      :max="max"
      class="stepper-input"
      :style="{ width: inputWidth ?? '40px' }"
      @change="onChange"
    />
    <button type="button" class="stepper-btn" @click="update(modelValue + 1)">+</button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: stretch;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.stepper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgb(from var(--color-primary) r g b / 0.4);
}

.stepper-btn {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--color-primary);
  padding: 0.25em 0.6em;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
  transition: background 0.15s;
}

.stepper-btn:hover {
  background: rgb(from var(--color-primary) r g b / 0.1);
}

.stepper-input {
  padding: 0.3em 0;
  background: transparent;
  border: none;
  border-left: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-right: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  text-align: center;
}

.stepper-input:focus {
  outline: none;
}

.stepper-input::-webkit-inner-spin-button,
.stepper-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.stepper-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
