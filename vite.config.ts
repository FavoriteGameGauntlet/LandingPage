import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import fs from 'node:fs'

const md = new MarkdownIt()

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
        if (!id.endsWith('.md')) return

        const raw = fs.readFileSync(id, 'utf-8')
        const { data: frontmatter, content } = matter(raw)
        const html = md.render(content)

        return {
          code: `
            import { defineComponent, h } from 'vue'
            export const frontmatter = ${JSON.stringify(frontmatter)}
            export default defineComponent({
              name: 'MarkdownPost',
              setup() {
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