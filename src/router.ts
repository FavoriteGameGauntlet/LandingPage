import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
    {path: '/', name: 'main', component: () => import('./views/Main.vue')},
    {path: '/app', name: 'app', component: () => import('./views/Application.vue')},
    {
        path: '/rules',
        component: () => import('./views/Rules.vue'),
        children: [
            {path: '', redirect: '/rules/Introduction'},
            {path: ':slug', name: 'rule', component: () => import('./views/RuleDoc.vue'), props: true},
        ],
    },
    {path: '/tools', name: 'tools', component: () => import('./views/Tools.vue')},
    {path: '/games', name: 'games', component: { render: () => null }},
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
