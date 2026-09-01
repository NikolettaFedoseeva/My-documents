import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { UiKitPage, LandingPage } from '@/pages'
import { WorkspacePage } from '@/domains/app-workspace'
import { AuthPage } from '@/pages/auth'
import { AdminPage } from '@/pages/admin'

// Smart Fallback Component Wrapper for Module Federation
const loadRemoteWithFallback = (remoteImporter: () => Promise<any>, fallbackComponent: any) => {
  return defineAsyncComponent({
    loader: () =>
      remoteImporter().catch((err) => {
        console.warn('[Module Federation] Remote microfrontend server unavailable. Using local fallback component.', err)
        return { default: fallbackComponent }
      }),
  })
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: WorkspacePage,
  },
  {
    path: '/landing',
    name: 'landing',
    component: loadRemoteWithFallback(() => import('lern_landing/LandingPage'), LandingPage),
  },
  {
    path: '/auth',
    name: 'auth',
    component: loadRemoteWithFallback(() => import('lern_auth/AuthPage'), AuthPage),
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: loadRemoteWithFallback(() => import('lern_cabinet/CabinetPage'), WorkspacePage),
  },
  {
    path: '/admin',
    name: 'admin',
    component: loadRemoteWithFallback(() => import('lern_admin/AdminPage'), AdminPage),
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