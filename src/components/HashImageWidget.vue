<script setup lang="ts">
import { ref, computed } from 'vue'

const S3 = import.meta.env.VITE_S3_BASE_URL

const input = ref('')
const imageUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const hasInvalidChars = computed(() => input.value.length > 0 && /[^a-zA-Z0-9]/.test(input.value))

function isValidHash(val: string): boolean {
  return /^[a-zA-Z0-9]{5,7}$/.test(val)
}

function onInput(e: Event) {
  input.value = (e.target as HTMLInputElement).value
}

async function tryLoad(hash: string): Promise<string> {
  const url = `${S3}/hash-images/${hash}.webp`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Изображение не найдено')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

async function search() {
  const hash = input.value.trim()
  if (!isValidHash(hash)) {
    error.value = 'Хэш: 5–6 букв и цифр'
    return
  }
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  error.value = null
  loading.value = true
  try {
    imageUrl.value = await tryLoad(hash)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="widget">
      <form class="search-row" @submit.prevent="search">
        <input
          class="hash-input themed-input"
          type="text"
          placeholder="Введите хэш картинки"
          :value="input"
          maxlength="7"
          :disabled="loading"
          @input="onInput"
        />
        <button class="btn-primary" type="submit" :disabled="loading || input.length < 5">
          {{ loading ? '...' : 'Найти' }}
        </button>
      </form>

      <div v-if="hasInvalidChars" class="hint-text">Допустимы только латинские буквы (a–z, A–Z) и цифры (0–9)</div>
      <div v-if="error" class="error-text">{{ error }}</div>
    </div>

    <div v-if="imageUrl" class="image-wrap">
      <img :src="imageUrl" alt="hash image" class="hash-image" />
    </div>
  </div>
</template>

<style scoped>
.search-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.hash-input {
  flex: 1;
}

.hint-text {
  font-size: 0.85rem;
  opacity: 0.65;
  margin-bottom: 0.75rem;
}

.error-text {
  color: var(--color-accent);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.image-wrap {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-primary);
  margin-top: 1.25rem;
}

.hash-image {
  display: block;
  width: 100%;
  height: auto;
}
</style>
