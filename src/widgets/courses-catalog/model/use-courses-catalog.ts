import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DocApiService, type CourseCodex } from '@/entities/doc'

export function useCoursesCatalog() {
  const router = useRouter()

  // #region refs
  const courses = ref<CourseCodex[]>([])
  const searchQuery = ref<string>('')
  const selectedCategory = ref<string>('all')
  const selectedLevel = ref<string>('all')
  const isLoading = ref<boolean>(true)
  // #endregion refs

  // #region computed
  const categoriesList = computed<string[]>(() => {
    const set = new Set(courses.value.map((c) => c.category))
    return Array.from(set).filter(Boolean)
  })

  const filteredCourses = computed<CourseCodex[]>(() => {
    let list = courses.value

    if (selectedCategory.value !== 'all') {
      list = list.filter((c) => c.category === selectedCategory.value)
    }

    if (selectedLevel.value !== 'all') {
      list = list.filter((c) => c.level === selectedLevel.value)
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return list
  })

  const totalChapters = computed<number>(() => {
    return courses.value.reduce((sum, c) => sum + (c.totalChapters || 0), 0)
  })
  // #endregion computed

  // #region Функции
  const loadCourses = async (): Promise<void> => {
    isLoading.value = true
    try {
      const data = await DocApiService.getCourses()
      courses.value = data
    } catch (err) {
      console.error('[useCoursesCatalog] Ошибка загрузки курсов:', err)
    } finally {
      isLoading.value = false
    }
  }

  const openCourse = (courseId: string): void => {
    router.push({ path: '/docs', query: { course: courseId } })
  }

  const openAuthorStudio = (): void => {
    router.push('/author')
  }

  const getLevelLabel = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'Начинающий'
      case 'advanced':
        return 'Продвинутый'
      default:
        return 'Средний'
    }
  }
  // #endregion Функции

  onMounted(() => {
    loadCourses()
  })

  return {
    courses,
    searchQuery,
    selectedCategory,
    selectedLevel,
    isLoading,
    categoriesList,
    filteredCourses,
    totalChapters,
    openCourse,
    openAuthorStudio,
    getLevelLabel,
  }
}
