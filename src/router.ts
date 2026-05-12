import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Main from './views/Main.vue'
import Download from './views/Download.vue'
import Rules from './views/Rules.vue'
import UsefulLinks from './views/UsefulLinks.vue'
import PreviousSeasons from './views/PreviousSeasons.vue'

const routes = [
    {path: '/', name: 'main', component: Main},
    {path: '/download', name: 'download', component: Download},
    {path: '/rules', name: 'rules', component: Rules},
    {path: '/useful-links', name: 'useful-links', component: UsefulLinks},
    {path: '/previous-seasons', name: 'previous-seasons', component: PreviousSeasons},
]

const mdFiles = import.meta.glob<{
    default: object
    frontmatter: { title?: string; date?: string; tags?: string[] }
}>('./rules/*.md')

const ruleRoutes: RouteRecordRaw[] = Object.entries(mdFiles).map(([path, loader]) => {
    const name = path.match(/\/([^/]+)\.md$/)![1]
    return {
        path: `/rules/${name}`,
        component: loader,
        meta: { mdPath: path },
    } satisfies RouteRecordRaw
})

const router = createRouter({
    history: createWebHistory(),
    routes: [...routes, ...ruleRoutes],
    scrollBehavior(to) {
        if (!to.hash) return { top: 0 }
    },
})

export default router