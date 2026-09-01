import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { AdminPage } from '@/pages/admin'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'admin',
    component: AdminPage,
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