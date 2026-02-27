import {createRouter, createWebHistory} from 'vue-router'
import Main from './views/Main.vue'
import Download from './views/Download.vue'
import Rules from './views/Rules.vue'
import UsefuleLinks from './views/UsefulLinks.vue'
import PreviousSeasons from './views/PreviousSeasons.vue'

const routes = [
    {path: '/', name: 'main', component: Main},
    {path: '/download', name: 'download', component: Download},
    {path: '/rules', name: 'rules', component: Rules},
    {path: '/useful-links', name: 'useful-links', component: UsefuleLinks},
    {path: '/previous-seasons', name: 'previous-seasons', component: PreviousSeasons},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router