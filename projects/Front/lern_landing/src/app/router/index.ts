import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { LandingPage } from '@/pages/landing'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router