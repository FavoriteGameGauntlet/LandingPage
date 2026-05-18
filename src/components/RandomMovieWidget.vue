<script setup lang="ts">
import { ref } from 'vue'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_API_KEY as string
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w200'

const headers = { Authorization: `Bearer ${TMDB_TOKEN}` }

interface Movie {
  title: string
  releaseDate: string
  rating: number
  posterPath: string | null
}

type RawMovie = { title: string; release_date: string; vote_average: number; poster_path: string | null }

const loading = ref(false)
const error = ref<string | null>(null)
const history = ref<Movie[]>([])
const buffer = ref<RawMovie[]>([])

function toMovie(raw: RawMovie): Movie {
  const date = new Date(raw.release_date)
  return {
    title: raw.title,
    releaseDate: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    rating: Math.round(raw.vote_average * 10) / 10,
    posterPath: raw.poster_path,
  }
}

async function fetchRandomMovie() {
  if (buffer.value.length === 0) {
    loading.value = true
    error.value = null
    try {
      const randomPage = Math.floor(Math.random() * 500) + 1
      const res = await fetch(
        `${TMDB_BASE}/discover/movie?vote_count.gte=100&sort_by=popularity.desc&page=${randomPage}`,
        { headers }
      )
      if (!res.ok) throw new Error('Ошибка запроса к TMDB')
      const data = await res.json()
      buffer.value = data.results as RawMovie[]
      if (!buffer.value.length) throw new Error('Нет фильмов в ответе')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Неизвестная ошибка'
      loading.value = false
      return
    }
    loading.value = false
  }

  const idx = Math.floor(Math.random() * buffer.value.length)
  const picked = buffer.value.splice(idx, 1)[0]
  history.value.unshift(toMovie(picked))
}
</script>

<template>
  <div class="widget">
    <div class="action-row">
      <button class="btn-primary" :disabled="loading" @click="fetchRandomMovie">
        {{ loading ? 'Загрузка...' : 'Случайный' }}
      </button>
      <button class="btn-secondary" :disabled="loading || history.length === 0" @click="history = []">
        Очистить
      </button>
    </div>

    <div v-if="error" class="error-text">{{ error }}</div>

    <div class="history">
      <div v-for="(movie, i) in history" :key="i" class="movie-card">
        <img
          v-if="movie.posterPath"
          :src="`${TMDB_IMG}${movie.posterPath}`"
          :alt="movie.title"
          class="movie-poster"
        />
        <div class="movie-info">
          <div class="movie-title">{{ movie.title }}</div>
          <div class="movie-meta">
            <span>{{ movie.releaseDate }}</span>
            <span>★ {{ movie.rating }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-row {
  margin-bottom: 1.75rem;
}

.error-text {
  color: var(--color-accent);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.history {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.movie-card {
  border-radius: 8px;
  border: 1px solid var(--color-primary);
  background: rgb(from var(--color-primary) r g b / 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  object-fit: cover;
  display: block;
}

.movie-info {
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.movie-title {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1;
}
</style>
