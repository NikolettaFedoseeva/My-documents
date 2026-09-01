import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { UiKitPage } from '@/pages'
import { WorkspacePage } from '@/domains/app-workspace'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: WorkspacePage,
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspacePage,
  },
  {
    path: '/ui-kit',
    name: 'ui-kit',
    component: UiKitPage,
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
