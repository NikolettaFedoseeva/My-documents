import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserApiService } from '@/entities/user'

export interface NavLink {
  title: string
  path: string
  icon?: string
  requiresRole?: string
}

export function useAppHeader() {
  const route = useRoute()
  const router = useRouter()

  // #region refs
  const currentUser = ref<User | null>(null)
  const isMobileMenuOpen = ref<boolean>(false)
  const isSearchModalOpen = ref<boolean>(false)
  // #endregion refs

  // #region Navigation Items
  const navLinks: NavLink[] = [
    { title: 'Главная', path: '/', icon: '🏠' },
    { title: 'Документация', path: '/docs', icon: '📚' },
    { title: 'Кабинет', path: '/cabinet', icon: '👤' },
    { title: 'Админка', path: '/admin', icon: '⚙️', requiresRole: 'admin' },
    { title: 'UI Kit', path: '/ui-kit', icon: '🎨' },
  ]
  // #endregion Navigation Items

  // #region computed
  const visibleNavLinks = computed<NavLink[]>(() => {
    return navLinks.filter((link) => {
      if (!link.requiresRole) return true
      return currentUser.value?.role === link.requiresRole
    })
  })

  const currentPath = computed<string>(() => route.path)
  // #endregion computed

  // #region Функции
  const loadUser = async (): Promise<void> => {
    try {
      const user = await UserApiService.getCurrentUser()
      currentUser.value = user
    } catch (err) {
      console.error('Ошибка загрузки профиля в хедере:', err)
    }
  }

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

  const handleSearchTrigger = (): void => {
    isSearchModalOpen.value = true
  }

  const handleLogout = (): void => {
    currentUser.value = null
    navigateTo('/auth')
  }
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    loadUser()
  })
  // #endregion Хуки жизненного цикла

  return {
    currentUser,
    visibleNavLinks,
    currentPath,
    isMobileMenuOpen,
    isSearchModalOpen,
    navigateTo,
    toggleMobileMenu,
    closeMobileMenu,
    handleSearchTrigger,
    handleLogout,
  }
}
