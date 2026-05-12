<script setup lang="ts">

import {onMounted, ref} from 'vue'

interface PostMeta {
  path: string
  slug: string
  title: string
  date: string
  tags: string[]
}

const mdFiles = import.meta.glob<{
  frontmatter: { title?: string; date?: string; tags?: string[]; published?: boolean }
}>('../rules/*.md')

const rules = ref<PostMeta[]>([])

onMounted(async () => {
  const loaded = await Promise.all(
      Object.entries(mdFiles).map(async ([path, load]) => {
        const mod = await load()
        const match = path.match(/\/([^/]+)\.md$/)
        if (!match) return null
        if (mod.frontmatter?.published === false) return null

        const slug = match[1] as string
        return {
          path: `/rules/${slug}`,
          slug,
          title: mod.frontmatter?.title ?? slug.replace(/-/g, ' '),
          date: mod.frontmatter?.date ?? '',
          tags: mod.frontmatter?.tags ?? [],
        } satisfies PostMeta
      })
  )
  rules.value = loaded
      .filter((p): p is PostMeta => p !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
})
</script>

<template>
  <div class="wrapper">
    <h1>Страницы с правилами</h1>
    <ul>
      <li v-for="rule in rules" :key="rule.slug">
        <RouterLink :to="rule.path">{{ rule.title }}</RouterLink>
        <span v-if="rule.date" class="date"> — {{ rule.date }}</span>
        <span v-for="tag in rule.tags" :key="tag" class="tag">{{ tag }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
ul {
  text-align: start;
  font-size: 20px;
}

a {
  color: var(--color-nav-link);
  text-decoration: none;
}

a:hover {
  color: var(--color-nav-link-hover);
}

li {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

li p {
  margin: 0;
  opacity: 0.5;
}
</style>