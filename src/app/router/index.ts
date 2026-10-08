import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import LandingPage from '@/pages/landing'
import CabinetPage from '@/pages/cabinet'
import AuthPage from '@/pages/auth'
import AdminPage from '@/pages/admin'
import { UiKitPage } from '@/pages/ui-kit'
import { DocsPage } from '@/pages/docs'
import { AuthorPage } from '@/pages/author'
import { CoursesPage } from '@/pages/courses'
import { ForbiddenPage } from '@/pages/forbidden'
import { useUserSessionStore } from '@/entities/user'

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
    meta: { title: 'Главная' },
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesPage,
    meta: { title: 'Каталог курсов' },
  },
  {
    path: '/catalog',
    redirect: '/courses',
  },
  {
    path: '/docs',
    name: 'docs',
    component: DocsPage,
    meta: { title: 'Справочник & Карта Знаний' },
  },
  {
    path: '/author',
    name: 'author',
    component: AuthorPage,
    meta: {
      requiresAuth: true,
      roles: ['author', 'teacher', 'admin'],
      title: 'Студия автора',
    },
  },
  {
    path: '/auth',
    name: 'auth',
    component: loadRemoteWithFallback(() => import('lern_auth/AuthPage'), AuthPage),
    meta: { title: 'Авторизация' },
  },
  {
    path: '/cabinet',
    name: 'cabinet',
    component: loadRemoteWithFallback(() => import('lern_cabinet/CabinetPage'), CabinetPage),
    meta: {
      requiresAuth: true,
      roles: ['student', 'author', 'teacher', 'admin'],
      title: 'Личный кабинет',
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: loadRemoteWithFallback(() => import('lern_admin/AdminPage'), AdminPage),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Панель администратора',
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenPage,
    meta: { title: 'Доступ ограничен (403)' },
  },
  {
    path: '/ui-kit',
    name: 'ui-kit',
    component: UiKitPage,
    meta: { title: 'UI Kit Showcase' },
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

// Navigation Guards: Проверка ролевой модели доступов (RBAC)
router.beforeEach((to, from, next) => {
  const sessionStore = useUserSessionStore()

  // 1. Проверка требования авторизации
  if (to.meta.requiresAuth && !sessionStore.isAuthenticated) {
    return next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  }

  // 2. Проверка соответствия ролям
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && allowedRoles.length > 0) {
    if (!sessionStore.hasRole(allowedRoles)) {
      return next({
        path: '/forbidden',
        query: {
          required: allowedRoles.join(','),
          redirect: to.fullPath,
        },
      })
    }
  }

  next()
})

export default router