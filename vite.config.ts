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
            import { defineComponent, h, onMounted, nextTick, ref } from 'vue'
            export const frontmatter = ${JSON.stringify(frontmatter)}
            export default defineComponent({
              name: 'MarkdownPost',
              setup() {
                const root = ref(null)
                onMounted(async () => {
                  await nextTick()
                  root.value?.querySelectorAll(':is(h1,h2,h3,h4,h5,h6)[id]').forEach(heading => {
                    const btn = document.createElement('button')
                    btn.className = 'anchor-copy-btn'
                    btn.textContent = '#'
                    btn.setAttribute('aria-label', 'Скопировать ссылку на раздел')
                    btn.addEventListener('click', () => {
                      history.pushState(null, '', '#' + heading.id)
                      heading.scrollIntoView({ behavior: 'smooth' })
                    })
                    heading.appendChild(btn)
                  })
                  const hash = decodeURIComponent(window.location.hash)
                  if (hash) {
                    const el = document.querySelector(hash)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }
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