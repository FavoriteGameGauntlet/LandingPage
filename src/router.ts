import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

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
    {path: '/', name: 'main', component: () => import('./views/Main.vue')},
    {path: '/download', name: 'download', component: () => import('./views/Download.vue')},
    {
        path: '/rules',
        component: () => import('./views/Rules.vue'),
        children: [
            {path: '', redirect: '/rules/Introduction'},
            ...ruleChildren,
        ],
    },
    {path: '/tools', name: 'tools', component: () => import('./views/Tools.vue')},
    {path: '/previous-seasons', name: 'previous-seasons', component: () => import('./views/PreviousSeasons.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
        if (!to.hash) return { top: 0 }
    },
})

export default router
