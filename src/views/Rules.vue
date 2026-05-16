<script lang="ts">
export default { name: 'Rules' }
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'

interface RuleMeta {
  slug: string
  title: string
  path: string
}

const frontmatters = import.meta.glob<{ title?: string; date?: string; published?: boolean }>(
  '../rules/*.md',
  { eager: true, query: '?frontmatter', import: 'default' }
)

const rules = ref<RuleMeta[]>(
  Object.entries(frontmatters)
    .flatMap(([path, fm]) => {
      const match = path.match(/\/([^/]+)\.md$/)
      if (!match || fm?.published === false) return []
      const slug = match[1] as string
      return [{
        slug,
        title: fm?.title ?? slug.replace(/-/g, ' '),
        path: `/rules/${slug}`,
      } satisfies RuleMeta]
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
)

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
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.rules-content {
  flex: 1;
  min-width: 0;
}

.rules-content :deep(:is(h1, h2, h3, h4, h5, h6)) {
  color: inherit;
}


/* Sticky sidebar on wide viewports */
@media (min-width: 861px) {
  .rules-sidebar {
    flex-shrink: 0;
    width: 200px;
    position: sticky;
    top: 5rem;
    padding-top: 2.5rem;
  }

  .rules-sidebar nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    border-right: 1px solid var(--color-primary);
    padding-right: 1rem;
  }
}

/* Horizontal nav bar above content on narrow viewports */
@media (max-width: 860px) {
  .rules-layout {
    flex-direction: column;
    gap: 0;
  }

  .rules-sidebar {
    width: 100%;
    margin-bottom: 1.25rem;
  }

  .rules-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    border-bottom: 1px solid var(--color-primary);
    padding-bottom: 0.75rem;
  }

  .rules-content :deep(.post-content) {
    margin-top: 0;
  }

  .rules-content :deep(:is(h1, h2, h3, h4, h5, h6):first-child) {
    margin-top: 0;
  }
}

.rules-sidebar a {
  font-size: 0.9em;
  color: var(--color-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}

.rules-sidebar a.active {
  color: var(--color-accent);
  border-left: 2px solid var(--color-accent);
  padding-left: calc(0.4rem - 2px);
}
</style>
