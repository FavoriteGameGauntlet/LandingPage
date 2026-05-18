<script setup lang="ts">
import { ref } from 'vue'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string
const TMDB_BASE = 'https://api.themoviedb.org/3'

const year = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

interface MovieResult {
  title: string
  releaseYear: number
  passed: boolean
}

const result = ref<MovieResult | null>(null)

async function fetchRandomMovie(): Promise<{ title: string; releaseYear: number }> {
  const firstRes = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&vote_count.gte=100&sort_by=popularity.desc`
  )
  if (!firstRes.ok) throw new Error('Ошибка запроса к TMDB')
  const firstData = await firstRes.json()
  const totalPages = Math.min(firstData.total_pages as number, 500)
  const randomPage = Math.floor(Math.random() * totalPages) + 1

  const pageRes = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&vote_count.gte=100&sort_by=popularity.desc&page=${randomPage}`
  )
  if (!pageRes.ok) throw new Error('Ошибка запроса к TMDB')
  const pageData = await pageRes.json()
  const movies = pageData.results as { title: string; release_date: string }[]
  if (!movies.length) throw new Error('Нет фильмов в ответе')

  const movie = movies[Math.floor(Math.random() * movies.length)]
  const releaseYear = parseInt(movie.release_date.slice(0, 4), 10)
  return { title: movie.title, releaseYear }
}

async function check() {
  if (!year.value || loading.value) return
  loading.value = true
  error.value = null
  result.value = null

  try {
    const movie = await fetchRandomMovie()
    result.value = {
      title: movie.title,
      releaseYear: movie.releaseYear,
      passed: movie.releaseYear < year.value,
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Неизвестная ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="widget">
    <div class="year-row">
      <label class="year-label">Ваш год</label>
      <input
        v-model.number="year"
        type="number"
        min="1888"
        :max="new Date().getFullYear()"
        class="year-input"
        placeholder="Например, 2000"
        @keydown.enter="check"
      />
    </div>

    <div class="action-row">
      <button class="btn-primary" :disabled="!year || loading" @click="check">
        {{ loading ? 'Загрузка...' : 'Случайный фильм' }}
      </button>
    </div>

    <div v-if="error" class="error-text">{{ error }}</div>

    <div v-if="result" class="result-card" :class="result.passed ? 'pass' : 'fail'">
      <div class="movie-title">{{ result.title }}</div>
      <div class="movie-year">{{ result.releaseYear }}</div>
      <div class="verdict">{{ result.passed ? 'Раньше вашего года — зачёт!' : 'Позже вашего года — не зачёт.' }}</div>
    </div>
  </div>
</template>

<style scoped>
.year-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.year-label {
  font-size: 0.95rem;
  opacity: 0.75;
  white-space: nowrap;
}

.year-input {
  width: 130px;
  padding: 0.35em 0.6em;
  color: var(--color-text);
  background: transparent;
  border: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.year-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgb(from var(--color-primary) r g b / 0.4);
}

.year-input::-webkit-inner-spin-button,
.year-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.year-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.action-row {
  margin-bottom: 1.75rem;
}

.error-text {
  color: var(--color-accent);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.result-card {
  border-radius: 8px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid;
}

.result-card.pass {
  border-color: var(--color-primary);
  background: rgb(from var(--color-primary) r g b / 0.08);
}

.result-card.fail {
  border-color: var(--color-accent);
  background: rgb(from var(--color-accent) r g b / 0.08);
}

.movie-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.movie-year {
  font-size: 0.9rem;
  opacity: 0.7;
}

.verdict {
  margin-top: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
}

.result-card.pass .verdict {
  color: var(--color-primary);
}

.result-card.fail .verdict {
  color: var(--color-accent);
}
</style>
