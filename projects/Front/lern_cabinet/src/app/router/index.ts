import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { CabinetPage } from '@/pages/cabinet'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'cabinet',
    component: CabinetPage,
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