<script lang="ts">
export default { name: 'RuleDoc' }

declare global {
  interface Window {
    __fromInternalLink?: boolean
  }
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { md } from '../lib/markdown'
import { ruleManifest } from '../rules/manifest'

const props = defineProps<{ slug: string }>()

const s3 = import.meta.env.VITE_S3_BASE_URL

const loading = ref(true)
const notFound = ref(false)
const error = ref<string | null>(null)
const html = ref('')
const root = ref<HTMLElement | null>(null)

const router = useRouter()
const route = useRoute()

const BOM = '﻿'

const stripBom = (raw: string) => raw.startsWith(BOM) ? raw.slice(BOM.length) : raw

const highlightHash = (hash: string) => {
  if (!hash) return
  const id = decodeURIComponent(hash.startsWith('#') ? hash.slice(1) : hash)
  const el = document.getElementById(id)
  if (!el) return
  el.classList.remove('highlight-target')
  void el.offsetWidth
  el.classList.add('highlight-target')
  el.addEventListener('animationend', () => el.classList.remove('highlight-target'), { once: true })
}

const wirePostContent = async () => {
  await nextTick()

  root.value?.querySelectorAll<HTMLElement>(':is(h1,h2,h3,h4,h5,h6)[id]').forEach((heading, index) => {
    if (index === 0) {
      heading.style.scrollMarginTop = '0'
      heading.querySelector('a[href]')?.removeAttribute('href')
      return
    }
    const btn = document.createElement('button')
    btn.className = 'anchor-copy-btn'
    btn.textContent = '#'
    btn.setAttribute('aria-label', 'Скопировать ссылку на раздел')
    btn.addEventListener('click', () => {
      history.pushState(null, '', '#' + heading.id)
      heading.scrollIntoView({ behavior: 'smooth' })
      highlightHash('#' + heading.id)
    })
    heading.appendChild(btn)
  })

  root.value?.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
    const href = link.getAttribute('href')
    if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('mailto:')) {
      link.addEventListener('click', e => {
        e.preventDefault()
        window.__fromInternalLink = true
        router.push(href)
      })
    }
  })

  if (window.location.hash) {
    const hash = window.location.hash
    setTimeout(() => {
      const id = decodeURIComponent(hash.slice(1))
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }, 0)
    highlightHash(hash)
  } else if (window.__fromInternalLink) {
    const first = root.value?.querySelector(':is(h1,h2,h3,h4,h5,h6)[id]')
    if (first) highlightHash('#' + first.id)
  }
  window.__fromInternalLink = false
}

let controller: AbortController | null = null
const htmlCache = new Map<string, string>()

const load = async () => {
  controller?.abort()
  error.value = null
  notFound.value = false

  if (!ruleManifest.some(rule => rule.slug === props.slug)) {
    notFound.value = true
    loading.value = false
    return
  }

  const cached = htmlCache.get(props.slug)
  if (cached) {
    html.value = cached
    loading.value = false
    await wirePostContent()
    return
  }

  loading.value = true
  controller = new AbortController()

  try {
    const res = await fetch(`${s3}/rules/${props.slug}.md`, { signal: controller.signal, cache: 'no-cache' })
    if (!res.ok) throw new Error(`Ошибка ${res.status}`)
    const raw = await res.text()
    html.value = md.render(stripBom(raw))
    htmlCache.set(props.slug, html.value)
    loading.value = false
    await wirePostContent()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Ошибка'
    loading.value = false
  }
}

onMounted(load)
onUnmounted(() => controller?.abort())

watch(() => route.hash, async (hash) => {
  await nextTick()
  highlightHash(hash)
})
</script>

<template>
  <template v-if="loading" />
  <p v-else-if="notFound">Раздел не найден.</p>
  <div v-else-if="error" class="rule-error">
    <p class="error-text">{{ error }}</p>
    <button class="btn-secondary" type="button" @click="load">Повторить</button>
  </div>
  <div v-else class="post-content" ref="root" v-html="html"></div>
</template>
