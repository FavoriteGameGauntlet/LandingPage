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
            import { defineComponent, h, onMounted, nextTick } from 'vue'
            export const frontmatter = ${JSON.stringify(frontmatter)}
            export default defineComponent({
              name: 'MarkdownPost',
              setup() {
                onMounted(async () => {
                  await nextTick()
                  const hash = decodeURIComponent(window.location.hash)
                  if (hash) {
                    const el = document.querySelector(hash)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }
                })
                return () => h('div', {
                  class: 'post-content',
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