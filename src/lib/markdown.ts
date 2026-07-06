import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

export const md = new MarkdownIt()
md.use(anchor, {
  permalink: anchor.permalink.headerLink(),
  slugify: (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, '-'),
})
