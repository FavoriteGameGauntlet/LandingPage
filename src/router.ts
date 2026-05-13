import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Main from './views/Main.vue'
import Download from './views/Download.vue'
import Rules from './views/Rules.vue'
import RulesLayout from './views/RulesLayout.vue'
import UsefulLinks from './views/UsefulLinks.vue'
import PreviousSeasons from './views/PreviousSeasons.vue'

const mdFiles = import.meta.glob<{
    default: object
    frontmatter: { title?: string; date?: string; tags?: string[] }
}>('./rules/*.md')

const ruleChildren: RouteRecordRaw[] = Object.entries(mdFiles).flatMap(([path, loader]) => {
    const name = path.match(/\/([^/]+)\.md$/)?.[1]
    if (!name) return []
    return [{
        path: name,
        component: loader,
        meta: { mdPath: path },
    } as RouteRecordRaw]
})

const routes: RouteRecordRaw[] = [
    {path: '/', name: 'main', component: Main},
    {path: '/download', name: 'download', component: Download},
    {
        path: '/rules',
        component: RulesLayout,
        children: [
            {path: '', name: 'rules', component: Rules},
            ...ruleChildren,
        ],
    },
    {path: '/useful-links', name: 'useful-links', component: UsefulLinks},
    {path: '/previous-seasons', name: 'previous-seasons', component: PreviousSeasons},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
        if (!to.hash) return { top: 0 }
    },
})

export default router
