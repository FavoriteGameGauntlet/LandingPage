<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import externalLinkIcon from '../assets/icons/external-link.svg?raw'

const s3 = import.meta.env.VITE_S3_BASE_URL

const version = ref('')
const releaseUrl = ref('')
const releaseDate = ref('')

type OsKey = 'windows' | 'macos' | 'linux'

const assets: Record<OsKey, string | null> = {
  windows: 'FavoriteGameGauntlet_x64-setup.exe',
  macos: null,
  linux: null,
}

const OS_LABELS: Record<OsKey, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const selectedOs = ref<OsKey>('windows')

const downloadUrl = computed(() => {
  const file = assets[selectedOs.value]
  return file
    ? `https://github.com/FavoriteGameGauntlet/Application/releases/latest/download/${file}`
    : undefined
})

const osMenuOpen = ref(false)
const osDropdown = ref<HTMLElement | null>(null)

function selectOs(os: OsKey) {
  if (!assets[os]) return
  selectedOs.value = os
  osMenuOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (osDropdown.value && !osDropdown.value.contains(e.target as Node)) {
    osMenuOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  try {
    const res = await fetch('https://api.github.com/repos/FavoriteGameGauntlet/Application/releases/latest')
    if (!res.ok) return
    const data = await res.json()
    version.value = String(data.tag_name ?? '').replace(/^v/, '')
    releaseUrl.value = data.html_url ?? ''
    releaseDate.value = data.published_at
      ? new Date(data.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : ''
  } catch {
    // version badge is optional, silently skip on failure
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="app-download">
    <div class="side">
      <img :src="`${s3}/logos/fggw3.webp`" alt="Logo" class="logo" />
      <div class="meta">
        <span v-if="version" class="version">Версия {{ version }}</span>
        <span v-if="releaseDate">{{ releaseDate }}</span>
        <a v-if="releaseUrl" :href="releaseUrl" target="_blank" class="release-link">
          Описание релиза
          <span class="link-icon" v-html="externalLinkIcon"></span>
        </a>
      </div>
    </div>
    <div class="main">
      <h1>Приложение FGG</h1>
      <div class="download-group">
        <a class="download-btn" :href="downloadUrl">Скачать</a>
        <div class="os-dropdown" ref="osDropdown">
          <button
            type="button"
            class="os-select-btn"
            aria-haspopup="listbox"
            :aria-expanded="osMenuOpen"
            @click="osMenuOpen = !osMenuOpen"
            @keydown.escape="osMenuOpen = false"
          >
            <span class="os-label">{{ OS_LABELS[selectedOs] }}</span>
            <span class="chevron" :class="{ open: osMenuOpen }">▾</span>
          </button>
          <ul v-if="osMenuOpen" class="os-menu" role="listbox">
            <li
              v-for="os in (['windows', 'macos', 'linux'] as const)"
              :key="os"
              role="option"
              class="os-option"
              :class="{ active: selectedOs === os, disabled: !assets[os] }"
              :aria-selected="selectedOs === os"
              :aria-disabled="!assets[os]"
              @click="selectOs(os)"
            >{{ OS_LABELS[os] }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-download {
  display: flex;
  gap: 4rem;
  max-width: 900px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex-shrink: 0;
  width: 180px;
}

.logo {
  display: block;
  width: 100%;
  height: auto;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.version {
  color: var(--color-accent);
}

.release-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  color: var(--color-primary);
}

.link-icon {
  display: inline-flex;
  width: 0.85em;
  height: 0.85em;
}

.link-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: currentColor;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.main h1 {
  margin: 0;
  font-size: 2rem;
}

.download-group {
  display: inline-flex;
  border: 2px solid var(--color-primary);
  border-radius: 4px;
}

.download-btn {
  padding: 0.55em 2.5em;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
  border-radius: 4px 0 0 4px;
  transition: background 0.2s, color 0.2s;
}

.download-btn:hover {
  background: rgb(from var(--color-primary) r g b / 0.12);
  color: var(--color-accent);
}

.download-btn:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent);
}

.os-dropdown {
  position: relative;
}

.os-select-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 12rem;
  background: transparent;
  border: none;
  border-left: 1px solid rgb(from var(--color-primary) r g b / 0.3);
  color: var(--color-primary);
  padding: 0.55em 2.75em 0.55em 1.5em;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: background 0.2s, color 0.2s;
}

.os-select-btn:hover {
  background: rgb(from var(--color-primary) r g b / 0.12);
  color: var(--color-accent);
}

.os-select-btn:focus-visible {
  outline: none;
}

.chevron {
  position: absolute;
  right: 0.75em;
  font-size: 0.75em;
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.os-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  background: transparent;
  border: 2px solid var(--color-primary);
  border-radius: 4px;
  z-index: 10;
}

.os-option {
  padding: 0.5em 1em;
  border-radius: 3px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.os-option:hover:not(.disabled) {
  background: rgb(from var(--color-primary) r g b / 0.12);
  color: var(--color-accent);
  text-shadow: 0 0 0.5em currentColor;
}

.os-option.active {
  color: var(--color-primary);
}

.os-option.disabled {
  color: rgb(from var(--color-primary) r g b / 0.35);
  cursor: not-allowed;
}

@media (max-width: 620px) {
  .app-download {
    flex-direction: column;
    align-items: center;
  }

  .side,
  .main {
    align-items: center;
    text-align: center;
  }
}
</style>