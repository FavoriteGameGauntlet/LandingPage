import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

const mdFiles = import.meta.glob('./rules/*.md')

const ruleChildren: RouteRecordRaw[] = Object.entries(mdFiles).flatMap(([path, loader]) => {
    const name = path.match(/\/([^/]+)\.md$/)?.[1]
    if (!name) return []
    return [{ path: name, component: loader } as RouteRecordRaw]
})

const routes: RouteRecordRaw[] = [
    {path: '/', name: 'main', component: () => import('./views/Main.vue')},
    {path: '/app', name: 'app', component: () => import('./views/Application.vue')},
    {
        path: '/rules',
        component: () => import('./views/Rules.vue'),
        children: [
            {path: '', redirect: '/rules/Introduction'},
            ...ruleChildren,
        ],
    },
    {path: '/tools', name: 'tools', component: () => import('./views/Tools.vue')},
    {path: '/seasons', name: 'seasons', component: () => import('./views/Seasons.vue')},
]

const scrollPositions = new Map<string, number>()

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        if (to.path.startsWith('/rules/') && from.path.startsWith('/rules/')) return { top: 0 }
        const saved = scrollPositions.get(to.path)
        return { top: saved ?? 0 }
    },
})

router.beforeEach((_, from) => {
    scrollPositions.set(from.path, window.scrollY)
})

export default router
