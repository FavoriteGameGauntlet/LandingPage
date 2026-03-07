declare module '*.md' {
    import { DefineComponent } from 'vue'
    export const frontmatter: {
        title?: string
        date?: string
        tags?: string[]
        [key: string]: any
    }
    const component: DefineComponent<{}, {}, any>
    export default component
}