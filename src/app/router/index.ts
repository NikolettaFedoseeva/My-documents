import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import LandingPage from '@/pages/landing'
import CabinetPage from '@/pages/cabinet'
import AuthPage from '@/pages/auth'
import AdminPage from '@/pages/admin'
import { UiKitPage } from '@/pages/ui-kit'
import { WorkspacePage } from '@/domains/app-workspace'

const loadRemoteWithFallback = (remoteImporter: () => Promise<any>, fallbackComponent: any) => {
  return defineAsyncComponent({
    loader: async () => {
      try {
        const mod = await remoteImporter()
        if (mod && mod.default) {
          return mod.default.default ? mod.default.default : mod.default
        }
        return mod || fallbackComponent
      } catch (err) {
        console.warn('[Module Federation] Remote server unavailable. Using fallback component.', err)
        return fallbackComponent
      }
    },
  })
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landing',
    component: loadRemoteWithFallback(() => import('lern_landing/LandingPage'), LandingPage),
  },
  {
    path: '/docs',
    name: 'docs',
    component: WorkspacePage,
  },
  {
    path: '/auth',
    name: 'auth',
    component: loadRemoteWithFallback(() => import('lern_auth/AuthPage'), AuthPage),
  },
  {
    path: '/cabinet',
    name: 'cabinet',
    component: loadRemoteWithFallback(() => import('lern_cabinet/CabinetPage'), CabinetPage),
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