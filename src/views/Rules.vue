<script lang="ts">
export default { name: 'Rules' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { ruleManifest } from '../rules/manifest'

const rules = ruleManifest
  .filter(rule => rule.published !== false)
  .map(rule => ({ slug: rule.slug, title: rule.title, path: `/rules/${rule.slug}` }))

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
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.params.slug" />
      </RouterView>
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

<style>
.post-content {
  margin: 2rem 0;
  padding: 0;
  text-align: start;
  font-size: 1rem;
}

.post-content h1, .post-content h2, .post-content h3,
.post-content h4, .post-content h5, .post-content h6 {
  scroll-margin-top: 5rem;
}

.highlight-target {
  animation: highlight-fade 5s ease-out forwards;
  border-radius: 4px;
}

@keyframes highlight-fade {
  0%   { background-color: var(--color-control-bg-hover); }
  100% { background-color: transparent; }
}

.post-content :is(h1, h2, h3, h4, h5, h6) > a,
.post-content :is(h1, h2, h3, h4, h5, h6) > a:hover {
  color: inherit;
  text-shadow: none;
  cursor: default;
  pointer-events: none;
}

.anchor-copy-btn {
  display: inline;
  margin-left: 0.4em;
  font-size: 0.75em;
  font-weight: 400;
  color: var(--color-link);
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  vertical-align: middle;
  font-family: inherit;
  line-height: 1;
}

.post-content :is(h1, h2, h3, h4, h5, h6):hover .anchor-copy-btn,
.anchor-copy-btn:focus-visible {
  opacity: 1;
}

.post-content ul,
.post-content ol {
  padding-left: 2rem;
}

.post-content li {
  margin: 0.3rem 0;
}

.post-content code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.875rem;
  border: 1px solid var(--color-bg-secondary);
  border-radius: 3px;
  padding: 0.1em 0.4em;
}

.post-content pre {
  border: 1px solid var(--color-bg-secondary);
  border-radius: 4px;
  padding: 1rem 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.post-content pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
}
</style>
