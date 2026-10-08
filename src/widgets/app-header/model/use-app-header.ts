import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme, type AppTheme } from '@/shared/lib/theme'
import { useUserSessionStore } from '@/entities/user'
import type { NavLink } from './types'

export function useAppHeader() {
  const route = useRoute()
  const router = useRouter()
  const sessionStore = useUserSessionStore()
  const { currentTheme, themes, setTheme, initTheme } = useTheme()

  // #region refs
  const isMobileMenuOpen = ref<boolean>(false)
  // #endregion refs

  // #region Navigation Items (RBAC Dynamic)
  const navLinks = computed<NavLink[]>(() => {
    const list: NavLink[] = [
      { title: 'Главная', path: '/' },
      { title: 'Курсы', path: '/courses', icon: '📚' },
      { title: 'Справочник', path: '/docs', icon: '📖' },
    ]

    if (sessionStore.isAuthor) {
      list.push({ title: 'Студия автора', path: '/author', icon: '✍️' })
    }

    if (sessionStore.isAdmin) {
      list.push({ title: 'Панель админа', path: '/admin', icon: '👑' })
    }

    if (sessionStore.isAuthenticated) {
      list.push({
        title: `Кабинет (${sessionStore.currentUser.name})`,
        path: '/cabinet',
        icon: '👤',
        isHighlight: true,
      })
    } else {
      list.push({ title: 'Войти в Кабинет', path: '/auth', icon: '🔑', isHighlight: true })
    }

    return list
  })
  // #endregion Navigation Items


  // #region computed
  const currentPath = computed<string>(() => route.path)

  const activeThemeObj = computed(() => {
    return themes.find((t) => t.id === currentTheme.value) || themes[0]
  })
  // #endregion computed

  // #region Функции
  const navigateTo = (path: string): void => {
    isMobileMenuOpen.value = false
    router.push(path)
  }

  const toggleMobileMenu = (): void => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = (): void => {
    isMobileMenuOpen.value = false
  }

  const selectTheme = (themeId: AppTheme): void => {
    setTheme(themeId)
  }
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    initTheme()
  })
  // #endregion Хуки жизненного цикла

  return {
    navLinks,
    currentPath,
    isMobileMenuOpen,
    currentTheme,
    themes,
    activeThemeObj,
    navigateTo,
    toggleMobileMenu,
    closeMobileMenu,
    selectTheme,
  }
}
