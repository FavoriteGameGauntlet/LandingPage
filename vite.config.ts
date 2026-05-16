import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import matter from 'gray-matter'
import fs from 'node:fs'

const md = new MarkdownIt()
md.use(anchor, {
  permalink: anchor.permalink.headerLink(),
  slugify: (s) => String(s).trim().toLowerCase().replace(/\s+/g, '-'),
})

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  preview: {
    port: 5173,
  },
  plugins: [
    {
      name: 'vite-plugin-markdown',
      transform(_, id) {
        const [filePath, query] = id.split('?')
        if (!filePath.endsWith('.md')) return

        const raw = fs.readFileSync(filePath, 'utf-8')
        const { data: frontmatter, content } = matter(raw)

        if (query === 'frontmatter') {
          return { code: `export default ${JSON.stringify(frontmatter)}` }
        }

        const html = md.render(content)

        return {
          code: `
            import { defineComponent, h, onMounted, nextTick, ref, watch } from 'vue'
            import { useRouter, useRoute } from 'vue-router'
            export const frontmatter = ${JSON.stringify(frontmatter)}
            export default defineComponent({
              name: 'MarkdownPost',
              setup() {
                const root = ref(null)
                const router = useRouter()
                const route = useRoute()
                const highlightHash = (hash) => {
                  if (!hash) return
                  const id = decodeURIComponent(hash.startsWith('#') ? hash.slice(1) : hash)
                  const el = document.getElementById(id)
                  if (!el) return
                  el.classList.remove('highlight-target')
                  void el.offsetWidth
                  el.classList.add('highlight-target')
                  el.addEventListener('animationend', () => el.classList.remove('highlight-target'), { once: true })
                }
                onMounted(async () => {
                  await nextTick()
                  root.value?.querySelectorAll(':is(h1,h2,h3,h4,h5,h6)[id]').forEach((heading, index) => {
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
                  root.value?.querySelectorAll('a[href]').forEach(link => {
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
                    highlightHash(window.location.hash)
                  } else if (window.__fromInternalLink) {
                    const first = root.value?.querySelector(':is(h1,h2,h3,h4,h5,h6)[id]')
                    if (first) highlightHash('#' + first.id)
                  }
                  window.__fromInternalLink = false
                })
                watch(() => route.hash, async (hash) => {
                  await nextTick()
                  highlightHash(hash)
                })
                return () => h('div', {
                  class: 'post-content',
                  ref: root,
                  innerHTML: ${JSON.stringify(html)}
                })
              }
            })
          `,
        }
      },
    },
    vue(),
  ],
})