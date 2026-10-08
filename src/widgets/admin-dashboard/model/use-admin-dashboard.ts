import { ref, computed, onMounted } from 'vue'
import { User, UserRole, UserApiService } from '@/entities/user'
import { CourseCodex, DocApiService, useDocProgressStore } from '@/entities/doc'

export type AdminTab = 'users' | 'courses' | 'analytics' | 'settings'

const SETTINGS_KEY = 'lern_admin_system_settings_v1'

export interface SystemSettings {
  registrationEnabled: boolean
  defaultRole: UserRole
  maintenanceMode: boolean
  requireEmailVerification: boolean
  maxUploadSizeMb: number
}

const DEFAULT_SETTINGS: SystemSettings = {
  registrationEnabled: true,
  defaultRole: 'student',
  maintenanceMode: false,
  requireEmailVerification: false,
  maxUploadSizeMb: 25,
}

export function useAdminDashboard() {
  const progressStore = useDocProgressStore()

  // #region refs
  const activeTab = ref<AdminTab>('users')
  const isLoading = ref<boolean>(true)
  const notificationText = ref<string>('')

  // Пользователи
  const users = ref<User[]>([])
  const userSearch = ref<string>('')
  const userRoleFilter = ref<string>('all')

  // Курсы
  const courses = ref<CourseCodex[]>([])
  const courseSearch = ref<string>('')
  const courseStatusFilter = ref<string>('all')

  // Системные настройки
  const settings = ref<SystemSettings>({ ...DEFAULT_SETTINGS })
  // #endregion refs

  // #region computed
  const filteredUsers = computed<User[]>(() => {
    let list = users.value
    const q = userSearch.value.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      )
    }
    if (userRoleFilter.value !== 'all') {
      list = list.filter((u) => u.role === userRoleFilter.value)
    }
    return list
  })

  const filteredCourses = computed<CourseCodex[]>(() => {
    let list = courses.value
    const q = courseSearch.value.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.author.name.toLowerCase().includes(q)
      )
    }
    if (courseStatusFilter.value === 'published') {
      list = list.filter((c) => c.isPublished)
    } else if (courseStatusFilter.value === 'draft') {
      list = list.filter((c) => !c.isPublished)
    }
    return list
  })

  // Аналитические показатели
  const totalUsersCount = computed(() => users.value.length)
  const studentsCount = computed(() => users.value.filter((u) => u.role === 'student').length)
  const authorsCount = computed(() => users.value.filter((u) => u.role === 'author' || u.role === 'teacher').length)
  const adminsCount = computed(() => users.value.filter((u) => u.role === 'admin').length)

  const totalCoursesCount = computed(() => courses.value.length)
  const publishedCoursesCount = computed(() => courses.value.filter((c) => c.isPublished).length)
  const totalChaptersCount = computed(() =>
    courses.value.reduce((sum, c) => sum + (c.totalChapters || 0), 0)
  )
  const completedChaptersCount = computed(() => progressStore.completedChaptersCount)
  const totalMasteredFlashcards = computed(() => progressStore.masteredFlashcardsCount)
  // #endregion computed

  // #region Функции
  const showNotification = (msg: string): void => {
    notificationText.value = msg
    setTimeout(() => {
      if (notificationText.value === msg) {
        notificationText.value = ''
      }
    }, 3500)
  }

  const loadData = async (): Promise<void> => {
    isLoading.value = true
    try {
      const [usersData, coursesData] = await Promise.all([
        UserApiService.getAllUsers(),
        DocApiService.getCourses(),
      ])
      users.value = usersData
      courses.value = coursesData

      // Загрузка настроек
      const rawSettings = localStorage.getItem(SETTINGS_KEY)
      if (rawSettings) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) }
      }
    } catch (err) {
      console.error('[useAdminDashboard] Ошибка загрузки данных админки:', err)
    } finally {
      isLoading.value = false
    }
  }

  const changeUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      const updated = await UserApiService.updateUserRole(userId, newRole)
      const index = users.value.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users.value[index] = updated
      }
      showNotification(`Роль пользователя ${updated.name} успешно изменена на «${newRole}»`)
    } catch (err) {
      console.error('Ошибка изменения роли:', err)
    }
  }

  const toggleUserBan = async (userId: string): Promise<void> => {
    try {
      const updated = await UserApiService.toggleUserBan(userId)
      const index = users.value.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users.value[index] = updated
      }
      showNotification(
        updated.isBanned
          ? `Пользователь ${updated.name} заблокирован`
          : `Пользователь ${updated.name} разблокирован`
      )
    } catch (err) {
      console.error('Ошибка блокировки пользователя:', err)
    }
  }

  const toggleCoursePublish = async (courseId: string): Promise<void> => {
    const course = courses.value.find((c) => c.id === courseId)
    if (!course) return
    try {
      const updated = await DocApiService.updateCourse(courseId, {
        isPublished: !course.isPublished,
      })
      const index = courses.value.findIndex((c) => c.id === courseId)
      if (index !== -1) {
        courses.value[index] = updated
      }
      showNotification(
        updated.isPublished
          ? `Курс «${updated.title}» опубликован и доступен всем студентам`
          : `Курс «${updated.title}» снят с публикации (переведен в черновик)`
      )
    } catch (err) {
      console.error('Ошибка модерации курса:', err)
    }
  }

  const deleteCourse = async (courseId: string): Promise<void> => {
    const course = courses.value.find((c) => c.id === courseId)
    if (!course) return
    try {
      await DocApiService.deleteCourse(courseId)
      courses.value = courses.value.filter((c) => c.id !== courseId)
      showNotification(`Курс «${course.title}» успешно удален`)
    } catch (err) {
      console.error('Ошибка удаления курса:', err)
    }
  }

  const saveSettings = (): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    showNotification('Системные настройки успешно сохранены')
  }

  const resetAllDemoData = (): void => {
    localStorage.removeItem('lern_courses_codex_v2')
    localStorage.removeItem('lern_admin_users_v1')
    localStorage.removeItem('lern_doc_progress_v1')
    showNotification('Демо-данные сброшены к начальным. Перезагрузка...')
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  }
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    loadData()
  })
  // #endregion Хуки жизненного цикла

  return {
    activeTab,
    isLoading,
    notificationText,
    users,
    userSearch,
    userRoleFilter,
    filteredUsers,
    courses,
    courseSearch,
    courseStatusFilter,
    filteredCourses,
    settings,
    totalUsersCount,
    studentsCount,
    authorsCount,
    adminsCount,
    totalCoursesCount,
    publishedCoursesCount,
    totalChaptersCount,
    completedChaptersCount,
    totalMasteredFlashcards,
    changeUserRole,
    toggleUserBan,
    toggleCoursePublish,
    deleteCourse,
    saveSettings,
    resetAllDemoData,
  }
}
