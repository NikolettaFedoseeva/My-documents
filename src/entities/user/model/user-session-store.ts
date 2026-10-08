import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole, Permission, RoleInfo } from '../types'

export const ROLES_LIST: RoleInfo[] = [
  {
    role: 'guest',
    name: 'Гость',
    icon: '👤',
    description: 'Публичный просмотр каталога и открытых глав кодексов',
    badgeVariant: 'default',
  },
  {
    role: 'student',
    name: 'Студент',
    icon: '🎓',
    description: 'Изучение курсов, 3D-тренажёры, сохранение XP и стриков',
    badgeVariant: 'primary',
  },
  {
    role: 'author',
    name: 'Автор курсов',
    icon: '✍️',
    description: 'Студия автора, создание дисциплин, модулей и флешкарт',
    badgeVariant: 'purple',
  },
  {
    role: 'admin',
    name: 'Администратор',
    icon: '👑',
    description: 'Полный доступ: админ-панель, все курсы и настройки платформы',
    badgeVariant: 'danger',
  },
]

export const PRESET_USERS: Record<UserRole, User> = {
  guest: {
    id: 'usr-guest',
    name: 'Гость платформы',
    email: 'guest@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    role: 'guest',
    status: 'online',
    unreadNotificationsCount: 0,
    xp: 0,
    level: 1,
  },
  student: {
    id: 'usr-student-1',
    name: 'Алексей Смирнов',
    email: 'student@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    role: 'student',
    status: 'online',
    unreadNotificationsCount: 2,
    xp: 350,
    level: 2,
  },
  author: {
    id: 'usr-author-1',
    name: 'Елена Ветрова',
    email: 'author@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    role: 'author',
    status: 'online',
    unreadNotificationsCount: 5,
    xp: 1450,
    level: 6,
  },
  teacher: {
    id: 'usr-author-1',
    name: 'Елена Ветрова (Преподаватель)',
    email: 'author@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    role: 'author',
    status: 'online',
    unreadNotificationsCount: 5,
    xp: 1450,
    level: 6,
  },
  admin: {
    id: 'usr-admin-1',
    name: 'Николай Админ',
    email: 'admin@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    role: 'admin',
    status: 'online',
    unreadNotificationsCount: 9,
    xp: 5200,
    level: 12,
  },
}

const STORAGE_KEY = 'lern_user_session_v1'

export const useUserSessionStore = defineStore('userSession', () => {
  // #region State
  const currentUser = ref<User>(PRESET_USERS.student)
  // #endregion State

  // #region Computed
  const currentRole = computed<UserRole>(() => currentUser.value.role)

  const isAuthenticated = computed<boolean>(() => currentUser.value.role !== 'guest')

  const isStudent = computed<boolean>(() => currentUser.value.role === 'student')

  const isAuthor = computed<boolean>(() => {
    const role = currentUser.value.role
    return role === 'author' || role === 'teacher' || role === 'admin'
  })

  const isAdmin = computed<boolean>(() => currentUser.value.role === 'admin')

  const currentRoleInfo = computed<RoleInfo>(() => {
    return ROLES_LIST.find((r) => r.role === currentRole.value) || ROLES_LIST[0]
  })
  // #endregion Computed

  // #region Permissions Matrix
  const rolePermissions: Record<UserRole, Permission[]> = {
    guest: ['view_courses'],
    student: ['view_courses', 'study_courses'],
    author: ['view_courses', 'study_courses', 'create_courses', 'edit_own_courses'],
    teacher: ['view_courses', 'study_courses', 'create_courses', 'edit_own_courses'],
    admin: [
      'view_courses',
      'study_courses',
      'create_courses',
      'edit_own_courses',
      'manage_all_courses',
      'manage_users',
      'access_admin_panel',
    ],
  }

  const can = (permission: Permission): boolean => {
    const perms = rolePermissions[currentRole.value] || []
    return perms.includes(permission)
  }

  const hasRole = (allowedRoles: (UserRole | string)[]): boolean => {
    if (allowedRoles.includes(currentRole.value)) return true
    // Админ имеет доступ везде
    if (currentUser.value.role === 'admin') return true
    // Автор имеет доступ там, где разрешен teacher
    if (currentUser.value.role === 'author' && allowedRoles.includes('teacher')) return true
    if (currentUser.value.role === 'teacher' && allowedRoles.includes('author')) return true
    return false
  }
  // #endregion Permissions Matrix

  // #region Actions
  const initSession = (): void => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as User
        if (parsed && parsed.role) {
          currentUser.value = parsed
          return
        }
      }
    } catch (e) {
      console.warn('[UserSessionStore] Ошибка гидрации сессии из LocalStorage:', e)
    }
    // По умолчанию авторизован студент
    currentUser.value = PRESET_USERS.student
  }

  const switchRole = (role: UserRole): void => {
    const preset = PRESET_USERS[role] || PRESET_USERS.student
    currentUser.value = { ...preset }
    saveSession()
  }

  const loginAs = (user: User): void => {
    currentUser.value = { ...user }
    saveSession()
  }

  const logout = (): void => {
    currentUser.value = { ...PRESET_USERS.guest }
    saveSession()
  }

  const saveSession = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value))
    } catch (e) {
      console.warn('[UserSessionStore] Ошибка сохранения сессии в LocalStorage:', e)
    }
  }
  // #endregion Actions

  // Автоинициализация при старте
  initSession()

  return {
    // State & Computed
    currentUser,
    currentRole,
    currentRoleInfo,
    isAuthenticated,
    isStudent,
    isAuthor,
    isAdmin,
    rolesList: ROLES_LIST,

    // Permissions check
    can,
    hasRole,

    // Actions
    initSession,
    switchRole,
    loginAs,
    logout,
  }
})
