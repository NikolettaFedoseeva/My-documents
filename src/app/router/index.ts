import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { UiKitPage } from '@/pages'
import { WorkspacePage } from '@/domains/app-workspace'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: WorkspacePage,
  },
  {
    path: '/landing',
    name: 'landing',
    component: defineAsyncComponent(() => import('lern_landing/LandingPage')),
  },
  {
    path: '/auth',
    name: 'auth',
    component: defineAsyncComponent(() => import('lern_auth/AuthPage')),
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspacePage,
  },
  {
    path: '/admin',
    name: 'admin',
    component: defineAsyncComponent(() => import('lern_admin/AdminPage')),
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