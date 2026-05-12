<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'

interface RuleMeta {
  slug: string
  title: string
  path: string
}

const mdFiles = import.meta.glob<{
  frontmatter: { title?: string; date?: string; published?: boolean }
}>('../rules/*.md')

const rules = ref<RuleMeta[]>([])

onMounted(async () => {
  const loaded = await Promise.all(
    Object.entries(mdFiles).map(async ([path, load]) => {
      const mod = await load()
      const match = path.match(/\/([^/]+)\.md$/)
      if (!match) return null
      if (mod.frontmatter?.published === false) return null
      const slug = match[1] as string
      return {
        slug,
        title: mod.frontmatter?.title ?? slug.replace(/-/g, ' '),
        path: `/rules/${slug}`,
      } satisfies RuleMeta
    })
  )
  rules.value = loaded
    .filter((r): r is RuleMeta => r !== null)
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
})

const route = useRoute()
const isIndividualRule = computed(() => route.path !== '/rules')
const currentSlug = computed(() => route.path.split('/').pop() ?? '')
</script>

<template>
  <div class="rules-layout" :class="{ 'with-sidebar': isIndividualRule }">
    <aside v-if="isIndividualRule" class="rules-sidebar">
      <nav>
        <RouterLink
          v-for="rule in rules"
          :key="rule.slug"
          :to="rule.path"
          :class="{ active: rule.slug === currentSlug }"
        >{{ rule.title }}</RouterLink>
      </nav>
    </aside>
    <div class="rules-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.rules-layout {
  display: contents;
}

/* Fixed sidebar on wide viewports — doesn't affect content layout at all */
@media (min-width: 1100px) {
  .rules-sidebar {
    position: fixed;
    top: 5rem;
    /* Right edge of sidebar = left edge of centered 680px content - gap */
    right: calc(50vw + 340px + 1.5rem);
    width: 200px;
  }

  .rules-sidebar nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    border-right: 1px solid var(--color-border);
    padding-right: 1rem;
  }
}

/* Horizontal nav bar above content on narrow viewports */
@media (max-width: 1099px) {
  .rules-sidebar {
    margin-bottom: 1.25rem;
  }

  .rules-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.75rem;
  }
}

.rules-sidebar a {
  color: var(--color-nav-link);
  text-decoration: none;
  font-size: 0.9em;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color 0.15s;
  white-space: nowrap;
}

.rules-sidebar a:hover {
  color: var(--color-nav-link-hover);
}

.rules-sidebar a.active {
  color: var(--color-text);
  background: rgb(from var(--color-accent-blue) r g b / 0.3);
}
</style>
