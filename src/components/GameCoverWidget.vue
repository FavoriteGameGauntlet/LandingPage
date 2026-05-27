<script setup lang="ts">
import { ref } from 'vue'

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string
const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell'

const input = ref('')
const imageUrl = ref<string | null>(null)
const generatedFor = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function generate() {
  const name = input.value.trim()
  if (!name) return

  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  generatedFor.value = null
  error.value = null
  loading.value = true

  try {
    const res = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: `video game cover art for "${name}", digital painting, detailed, vibrant`, parameters: { width: 1024, height: 576 } }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Ошибка ${res.status}`)
    }
    const blob = await res.blob()
    imageUrl.value = URL.createObjectURL(blob)
    generatedFor.value = name
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
      <form class="search-row" @submit.prevent="generate">
        <input
          v-model="input"
          class="game-input"
          type="text"
          placeholder="Название игры"
          :disabled="loading"
        />
        <button class="btn-primary" type="submit" :disabled="loading || !input.trim()">
          {{ loading ? '...' : 'Создать' }}
        </button>
      </form>

      <div v-if="loading" class="hint-text">Генерация может занять несколько секунд...</div>
      <div v-if="error" class="error-text">{{ error }}</div>
    </div>

    <div v-if="imageUrl" class="image-wrap">
      <img :src="imageUrl" :alt="generatedFor ?? ''" class="cover-image" />
    </div>
  </div>
</template>

<style scoped>
.search-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.game-input {
  flex: 1;
  min-width: 0;
  padding: 0.4em 0.7em;
  font-size: 0.95rem;
  font-family: inherit;
  background: transparent;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.35);
  border-radius: 4px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.game-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgb(from var(--color-primary) r g b / 0.35);
}

.game-input:disabled {
  opacity: 0.4;
}

.game-input::placeholder {
  color: rgb(from var(--color-text) r g b / 0.35);
}

.hint-text {
  font-size: 0.85rem;
  opacity: 0.65;
}

.error-text {
  color: var(--color-accent);
  font-size: 0.9rem;
}

.image-wrap {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-primary);
  margin-top: 1.25rem;
}

.cover-image {
  display: block;
  width: 100%;
  height: auto;
}
</style>
