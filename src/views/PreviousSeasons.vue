<script setup lang="ts">
import { ref } from 'vue'

interface Video {
  title: string
  url: string
  true?: boolean
}

interface Season {
  name: string
  link: string
  videos: Video[]
}

const seasons: Season[] = [
  {
    name: 'FGG 2',
    link: 'https://docs.google.com/spreadsheets/d/1PvToVnWcyW4-3M2jDRuTFthg2ypbCfWyzqsp0HjATz4',
    videos: []
  },
  {
    name: 'FGG 3',
    link: 'https://docs.google.com/spreadsheets/d/1Whmr71SdLHuleYlPSEndmsNmrjXzgXA5bykaHNaGJcg',
    videos: []
  },
  {
    name: 'FGG 4',
    link: 'https://docs.google.com/spreadsheets/d/10qmqTpqhvLj5UVXEshyM2G7Bm1OSwGvUJib-UkgPUd0',
    videos: []
  },
  {
    name: 'FGG 5',
    link: 'https://docs.google.com/spreadsheets/d/1WXjNhHQZdE9hOCGOE0dHQcWQs_1oTgIv6-EyjOzUQ18',
    videos: []
  },
  {
    name: 'FGGW 1',
    link: 'https://docs.google.com/spreadsheets/d/1n9GQN-BfXG1raE17xQP0ja9vqb52AgSfs3YGxq1od80',
    videos: [
      { title: 'Финальный выбор', url: '/videos/fggw1-final-choice.mp4' },
      { title: 'Финал: Перепрограммирование', url: '/videos/fggw1-reprogramming-final.mp4', true: true },
      { title: 'Финал: Самоуничтожение', url: '/videos/fggw1-self-destruction-final.mp4' }
    ]
  },
  {
    name: 'FGGW 2',
    link: 'https://docs.google.com/spreadsheets/d/1z-oFb87xGjrXHSoe2FvMNVC5RSMTY3T3Q6PGfu-xD8U',
    videos: [
      { title: 'Интро', url: '/videos/fggw2-intro.mp4' },
      { title: 'Конец первого акта', url: '/videos/fggw2-first-act-ending.mp4' },
      { title: 'Финал', url: '/videos/fggw2-fake-final.mp4' },
      { title: 'Финал', url: '/videos/fggw2-final.mp4', true: true }
    ]
  }
]

const openSet = ref(new Set<number>())

function toggle(index: number) {
  if (openSet.value.has(index)) {
    openSet.value.delete(index)
  } else {
    openSet.value.add(index)
  }
  openSet.value = new Set(openSet.value)
}

</script>

<template>
  <h1>Предыдущие сезоны</h1>
  <div class="seasons">
    <div v-for="(season, index) in seasons" :key="season.name" class="season">
      <button class="season-header" :class="{ open: openSet.has(index) }" @click="toggle(index)">
        <span>{{ season.name }}</span>
        <span class="chevron">▾</span>
      </button>
      <div class="season-body" :class="{ open: openSet.has(index) }">
        <a :href="season.link" target="_blank" class="season-link">Таблица сезона</a>
        <div v-if="season.videos.length" class="videos">
          <div v-for="video in season.videos" :key="video.url" class="video-item">
            <p class="video-caption">
              {{ video.title }}
              <span v-if="video.true" class="tag-true">Истинный</span>
            </p>
            <div class="video-wrapper">
              <video controls preload="none" :src="video.url"></video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seasons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.season-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgb(from var(--color-accent-blue) r g b / 0.3);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.season-header:hover {
  background: rgb(from var(--color-accent-blue) r g b / 0.5);
}

.season-header.open {
  border-bottom-color: transparent;
  background: rgb(from var(--color-accent-purple) r g b / 0.4);
}

.chevron {
  display: inline-block;
  transition: transform 0.25s ease;
  font-size: 1.2em;
  line-height: 1;
}

.season-header.open .chevron {
  transform: rotate(-180deg);
}

.season-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
  border: 1px solid var(--color-border);
  border-top: none;
}

.season-body.open {
  max-height: 4000px;
}

.season-link {
  display: inline-block;
  margin: 16px;
  font-size: 1em;
}

.videos {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 16px;
}

.video-caption {
  margin: 0 0 8px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-true {
  font-size: 0.75em;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(from var(--color-accent-purple) r g b / 0.3);
  border: 1px solid var(--color-accent-purple);
  color: var(--color-text);
}

.video-wrapper video {
  width: 100%;
  max-height: 480px;
  display: block;
}
</style>
