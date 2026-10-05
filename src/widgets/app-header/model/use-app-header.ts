import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme, type AppTheme } from '@/shared/lib/theme'
import type { NavLink } from './types'

export function useAppHeader() {
  const route = useRoute()
  const router = useRouter()
  const { currentTheme, themes, setTheme, initTheme } = useTheme()

  // #region refs
  const isMobileMenuOpen = ref<boolean>(false)
  // #endregion refs

  // #region Navigation Items
  const navLinks: NavLink[] = [
    { title: 'Главная', path: '/' },
    { title: 'Курсы', path: '/courses', icon: '📚' },
    { title: 'Справочник', path: '/docs', icon: '📖' },
    { title: 'Студия автора', path: '/author', icon: '✍️' },
    { title: 'Войти в Кабинет', path: '/auth', icon: '🔑', isHighlight: true },
  ]
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
