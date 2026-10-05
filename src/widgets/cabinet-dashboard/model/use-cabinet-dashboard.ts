import { ref, onMounted } from 'vue'
import { Course, AssignmentItem, Achievement, UserCabinetStats, CourseApiService } from '@/entities/course'
import { User, UserApiService } from '@/entities/user'
import { useDocProgressStore } from '@/entities/doc'

export type CabinetTab = 'courses' | 'assignments' | 'achievements' | 'settings'

export function useCabinetDashboard() {
  const progressStore = useDocProgressStore()

  // #region refs
  const activeTab = ref<CabinetTab>('courses')
  const user = ref<User | null>(null)
  const stats = ref<UserCabinetStats | null>(null)
  const courses = ref<Course[]>([])
  const assignments = ref<AssignmentItem[]>([])
  const achievements = ref<Achievement[]>([])
  const isLoading = ref<boolean>(true)
  // #endregion refs

  // #region Функции
  const loadCabinetData = async (): Promise<void> => {
    isLoading.value = true
    try {
      const [userData, statsData, coursesData, assignmentsData, achievementsData] = await Promise.all([
        UserApiService.getCurrentUser(),
        CourseApiService.getCabinetStats(),
        CourseApiService.getUserCourses(),
        CourseApiService.getAssignments(),
        CourseApiService.getAchievements(),
      ])

      user.value = userData
      if (user.value) {
        user.value.xp = (user.value.xp || 0) + progressStore.totalXp
        user.value.level = progressStore.userLevel
      }

      stats.value = statsData
      if (stats.value) {
        stats.value.streakDays = Math.max(stats.value.streakDays, progressStore.streakDays)
        stats.value.completedLessonsCount += progressStore.completedChaptersCount
      }

      courses.value = coursesData
      assignments.value = assignmentsData
      achievements.value = achievementsData
    } catch (err) {
      console.error('Ошибка загрузки данных кабинета:', err)
    } finally {
      isLoading.value = false
    }
  }

  const setTab = (tab: CabinetTab): void => {
    activeTab.value = tab
  }
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    loadCabinetData()
  })
  // #endregion Хуки жизненного цикла

  return {
    activeTab,
    user,
    stats,
    courses,
    assignments,
    achievements,
    isLoading,
    setTab,
  }
}
