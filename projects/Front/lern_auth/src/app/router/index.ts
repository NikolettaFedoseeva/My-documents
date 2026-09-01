import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { AuthPage } from '@/pages/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'auth',
    component: AuthPage,
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