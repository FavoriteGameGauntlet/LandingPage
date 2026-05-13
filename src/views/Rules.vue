<script setup lang="ts">

import {ref} from 'vue'

interface PostMeta {
  path: string
  slug: string
  title: string
  date: string
  tags: string[]
}

const frontmatters = import.meta.glob<{ title?: string; date?: string; tags?: string[]; published?: boolean }>(
  '../rules/*.md',
  { eager: true, import: 'frontmatter' }
)

const rules = ref<PostMeta[]>(
  Object.entries(frontmatters)
    .flatMap(([path, fm]) => {
      const match = path.match(/\/([^/]+)\.md$/)
      if (!match || fm?.published === false) return []
      const slug = match[1] as string
      return [{
        path: `/rules/${slug}`,
        slug,
        title: fm?.title ?? slug.replace(/-/g, ' '),
        date: fm?.date ?? '',
        tags: fm?.tags ?? [],
      } satisfies PostMeta]
    })
    .sort((a, b) => b.date.localeCompare(a.date))
)
</script>

<template>
  <div class="wrapper">
    <h1>Страницы с правилами</h1>
    <ul class="page-list">
      <li v-for="rule in rules" :key="rule.slug">
        <RouterLink :to="rule.path">{{ rule.title }}</RouterLink>
        <span v-if="rule.date" class="date"> — {{ rule.date }}</span>
        <span v-for="tag in rule.tags" :key="tag" class="tag">{{ tag }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>