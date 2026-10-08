import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DocApiService } from '@/entities/doc'
import { useUserSessionStore } from '@/entities/user'
import type { CommandItem, CommandCategory } from '../types'

// Глобальное разделяемое состояние
const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const registeredCommands = ref<CommandItem[]>([])
const isLoading = ref(false)

export function useCommandPalette() {
  const router = useRouter()
  const sessionStore = useUserSessionStore()

  // #region Методы открытия/закрытия
  const open = () => {
    isOpen.value = true
    searchQuery.value = ''
    selectedIndex.value = 0
    loadCatalogItems()
  }

  const close = () => {
    isOpen.value = false
    searchQuery.value = ''
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
  // #endregion Методы открытия/закрытия

  // #region Сбор команд и сущностей
  const loadCatalogItems = async () => {
    isLoading.value = true
    try {
      const items: CommandItem[] = []

      // 1. Системные действия и навигация
      items.push(
        {
          id: 'act-home',
          title: 'Главная страница',
          description: 'Перейти на титульный экран платформы LERN',
          category: 'navigation',
          categoryLabel: '🧭 Навигация',
          icon: '🏠',
          shortcut: 'G H',
          action: () => {
            router.push('/')
            close()
          },
        },
        {
          id: 'act-courses',
          title: 'Каталог всех курсов',
          description: 'Выбрать образовательную программу и трек',
          category: 'navigation',
          categoryLabel: '🧭 Навигация',
          icon: '📚',
          action: () => {
            router.push('/courses')
            close()
          },
        },
        {
          id: 'act-docs',
          title: 'Справочник Bookish Codex',
          description: 'Открыть академическую читалку знаний с пергаментными листами',
          category: 'navigation',
          categoryLabel: '🧭 Навигация',
          icon: '📖',
          action: () => {
            router.push('/docs')
            close()
          },
        },
        {
          id: 'act-cabinet',
          title: 'Личный кабинет студента',
          description: 'Курсы в процессе, задания, опыт, стрики и статистика',
          category: 'navigation',
          categoryLabel: '🧭 Навигация',
          icon: '🎓',
          action: () => {
            router.push('/cabinet')
            close()
          },
        },
        {
          id: 'act-trainer',
          title: 'Тренажер долговременной памяти Active Recall',
          description: 'Запустить 3D-фокус тренировку флешкарт со звуковыми эффектами',
          category: 'actions',
          categoryLabel: '⚡ Быстрые действия',
          icon: '🧠',
          badge: 'Focus Mode',
          keywords: ['флешкарты', 'карточки', 'память', 'повторение', 'звук'],
          action: () => {
            // Переход в читалку или запуск
            router.push('/docs')
            close()
          },
        },
        {
          id: 'act-assignments',
          title: 'Мои лабораторные и задания',
          description: 'Сдать код на проверку или посмотреть оценки преподавателя',
          category: 'actions',
          categoryLabel: '⚡ Быстрые действия',
          icon: '📝',
          badge: '+XP',
          keywords: ['домашка', 'лаба', 'практика', 'проверка'],
          action: () => {
            router.push({ path: '/cabinet', query: { tab: 'assignments' } })
            close()
          },
        },
        {
          id: 'act-ui-kit',
          title: 'Витрина компонентов UI Kit',
          description: 'Интерактивная галерея дизайн-системы LERN Platform',
          category: 'navigation',
          categoryLabel: '🧭 Навигация',
          icon: '🎨',
          action: () => {
            router.push('/ui-kit')
            close()
          },
        }
      )

      if (sessionStore.isAuthor) {
        items.push({
          id: 'act-author',
          title: 'Студия автора курсов',
          description: 'Конструктор глав, 3D-флешкарт и импорт/экспорт JSON',
          category: 'actions',
          categoryLabel: '⚡ Быстрые действия',
          icon: '✍️',
          badge: 'Автор',
          action: () => {
            router.push('/author')
            close()
          },
        })
      }

      if (sessionStore.isAdmin) {
        items.push({
          id: 'act-admin',
          title: 'Панель администратора платформы',
          description: 'Управление пользователями, ролями, банами и курсами',
          category: 'actions',
          categoryLabel: '⚡ Быстрые действия',
          icon: '👑',
          badge: 'Админ',
          action: () => {
            router.push('/admin')
            close()
          },
        })
      }

      // 2. Получение реальных курсов и глав из DocApiService
      const courses = await DocApiService.getCourses()
      for (const course of courses) {
        items.push({
          id: `course-${course.id}`,
          title: course.title,
          description: course.description || `Курс дисциплины • ${course.category || 'Программирование'}`,
          category: 'courses',
          categoryLabel: '📚 Дисциплины и курсы',
          icon: course.icon || '📘',
          badge: course.level ? course.level.toUpperCase() : 'КУРС',
          keywords: [course.slug, ...(course.tags || [])],
          action: () => {
            router.push({ path: '/docs', query: { course: course.slug || course.id } })
            close()
          },
        })

        const modules = course.modules || (course as any).categories || []
        if (Array.isArray(modules)) {
          for (const cat of modules) {
            if (Array.isArray(cat.items)) {
              for (const doc of cat.items) {
                items.push({
                  id: `doc-${doc.id}`,
                  title: doc.title,
                  description: `${course.title} ➔ ${cat.title}`,
                  category: 'chapters',
                  categoryLabel: '📖 Главы и темы',
                  icon: '📄',
                  badge: `${doc.readTimeMinutes || 5} мин`,
                  keywords: [doc.slug || doc.id, cat.title, ...(doc.tags || [])],
                  action: () => {
                    router.push({
                      path: '/docs',
                      query: {
                        course: course.slug || course.id,
                        doc: doc.id,
                      },
                    })
                    close()
                  },
                })
              }
            }
          }
        }
      }

      registeredCommands.value = items
    } catch (e) {
      console.warn('[CommandPalette] Ошибка загрузки элементов:', e)
    } finally {
      isLoading.value = false
    }
  }
  // #endregion Сбор команд и сущностей

  // #region Фильтрация и поиск
  const filteredItems = computed<CommandItem[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) {
      return registeredCommands.value
    }

    return registeredCommands.value.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q) || false
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q)) || false
      return matchTitle || matchDesc || matchKeywords
    })
  })

  // Сгруппированные по категориям
  const groupedItems = computed<Record<CommandCategory, CommandItem[]>>(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      actions: [],
      courses: [],
      chapters: [],
      navigation: [],
    }

    for (const item of filteredItems.value) {
      if (groups[item.category]) {
        groups[item.category].push(item)
      }
    }

    return groups
  })
  // #endregion Фильтрация и поиск

  // #region Навигация с клавиатуры
  const selectNext = () => {
    if (filteredItems.value.length === 0) return
    selectedIndex.value = (selectedIndex.value + 1) % filteredItems.value.length
  }

  const selectPrev = () => {
    if (filteredItems.value.length === 0) return
    selectedIndex.value =
      (selectedIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length
  }

  const executeSelected = () => {
    const item = filteredItems.value[selectedIndex.value]
    if (item) {
      item.action()
    }
  }

  const executeItem = (item: CommandItem) => {
    item.action()
  }

  const onKeydown = (e: KeyboardEvent) => {
    // Глобальное сочетание Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      toggle()
      return
    }

    if (!isOpen.value) return

    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectNext()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectPrev()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeSelected()
    }
  }

  watch(searchQuery, () => {
    selectedIndex.value = 0
  })

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })
  // #endregion Навигация с клавиатуры

  return {
    isOpen,
    searchQuery,
    selectedIndex,
    isLoading,
    filteredItems,
    groupedItems,
    open,
    close,
    toggle,
    selectNext,
    selectPrev,
    executeSelected,
    executeItem,
  }
}
