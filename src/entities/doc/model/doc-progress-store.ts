import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocChapterProgress, DocProgressStorageData, DocStatus } from '../types'
import { DocProgressApiService } from '../api/doc-progress-api'

const STORAGE_KEY = 'lern_doc_progress_v1'
const STORAGE_VERSION = 1

/**
 * Получение текущей даты в формате YYYY-MM-DD
 */
function getTodayDateString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Создание пустой записи прогресса главы
 */
function createDefaultChapterProgress(docId: string): DocChapterProgress {
  return {
    docId,
    status: 'in-progress',
    isRead: false,
    flashcardMastered: false,
    quizCompleted: false,
    selectedQuizAnswerId: null,
    lastVisitedAt: Date.now(),
  }
}

export const useDocProgressStore = defineStore('doc-progress', () => {
  // #region State
  const chapters = ref<Record<string, DocChapterProgress>>({})
  const totalXp = ref<number>(0)
  const lastActiveDocId = ref<string | null>(null)
  const streakDays = ref<number>(1)
  const lastActivityDate = ref<string>(getTodayDateString())
  const isHydrated = ref<boolean>(false)
  // #endregion State

  // #region Getters
  /**
   * Получение прогресса конкретной главы
   */
  const getChapter = computed(() => {
    return (docId: string): DocChapterProgress => {
      return chapters.value[docId] || createDefaultChapterProgress(docId)
    }
  })

  /**
   * Проверка, пройдена ли глава
   */
  const isCompleted = computed(() => {
    return (docId: string): boolean => {
      return chapters.value[docId]?.status === 'completed'
    }
  })

  /**
   * Проверка, запомнена ли флешкарта главы
   */
  const isFlashcardMastered = computed(() => {
    return (docId: string): boolean => {
      return Boolean(chapters.value[docId]?.flashcardMastered)
    }
  })

  /**
   * Проверка, сдан ли тест главы
   */
  const isQuizPassed = computed(() => {
    return (docId: string): boolean => {
      return Boolean(chapters.value[docId]?.quizCompleted)
    }
  })

  /**
   * Сохраненный ответ пользователя на тест
   */
  const getQuizAnswer = computed(() => {
    return (docId: string): string | null => {
      return chapters.value[docId]?.selectedQuizAnswerId || null
    }
  })

  /**
   * Количество полностью завершенных глав
   */
  const completedChaptersCount = computed<number>(() => {
    return Object.values(chapters.value).filter((ch) => ch.status === 'completed').length
  })

  /**
   * Количество выученных 3D-флешкарт
   */
  const masteredFlashcardsCount = computed<number>(() => {
    return Object.values(chapters.value).filter((ch) => ch.flashcardMastered).length
  })

  /**
   * Количество решенных экспресс-тестов
   */
  const completedQuizzesCount = computed<number>(() => {
    return Object.values(chapters.value).filter((ch) => ch.quizCompleted).length
  })

  /**
   * Текущий уровень на основе накопленного XP (100 XP на каждый уровень)
   */
  const userLevel = computed<number>(() => {
    return Math.floor(totalXp.value / 100) + 1
  })

  /**
   * Опыт до следующего уровня
   */
  const xpToNextLevel = computed<number>(() => {
    const nextLevelTarget = userLevel.value * 100
    return nextLevelTarget - totalXp.value
  })

  /**
   * Расчет процента завершения для списка ID уроков (для категорий)
   */
  const getCategoryProgress = computed(() => {
    return (itemIds: string[]): number => {
      if (!itemIds || itemIds.length === 0) return 0
      const completed = itemIds.filter((id) => chapters.value[id]?.status === 'completed').length
      return Math.round((completed / itemIds.length) * 100)
    }
  })
  // #endregion Getters

  // #region Вспомогательные функции
  /**
   * Сохранение состояния в LocalStorage
   */
  const persist = (): void => {
    try {
      const completedList = Object.entries(chapters.value)
        .filter(([, ch]) => ch.status === 'completed')
        .map(([id]) => id)

      const payload: DocProgressStorageData = {
        version: STORAGE_VERSION,
        chapters: chapters.value,
        totalXp: totalXp.value,
        lastActiveDocId: lastActiveDocId.value,
        completedDocIds: completedList,
        streakDays: streakDays.value,
        lastActivityDate: lastActivityDate.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.warn('[DocProgressStore] Не удалось сохранить прогресс в localStorage:', err)
    }
  }

  /**
   * Загрузка состояния из LocalStorage
   */
  const hydrate = (): void => {
    if (isHydrated.value) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DocProgressStorageData>
        if (parsed.version === STORAGE_VERSION) {
          if (parsed.chapters) chapters.value = parsed.chapters
          if (typeof parsed.totalXp === 'number') totalXp.value = parsed.totalXp
          if (parsed.lastActiveDocId) lastActiveDocId.value = parsed.lastActiveDocId
          if (typeof parsed.streakDays === 'number') streakDays.value = parsed.streakDays
          if (parsed.lastActivityDate) lastActivityDate.value = parsed.lastActivityDate
        }
      }
    } catch (err) {
      console.warn('[DocProgressStore] Ошибка при чтении прогресса из localStorage:', err)
    } finally {
      isHydrated.value = true
      updateStreak()
      syncWithBackend()
    }
  }

  /**
   * Фоновая синхронизация с облачным сервером Supabase через REST API бэкенда
   */
  const syncWithBackend = async (): Promise<void> => {
    try {
      const remote = await DocProgressApiService.fetchMyProgress()
      if (!remote) return

      let hasChanges = false
      if (Array.isArray(remote.completedChapterIds)) {
        for (const docId of remote.completedChapterIds) {
          const ch = ensureChapter(docId)
          if (ch.status !== 'completed' || !ch.isRead) {
            ch.status = 'completed'
            ch.isRead = true
            hasChanges = true
          }
        }
      }

      if (Array.isArray(remote.flashcardsMasteredIds)) {
        for (const fId of remote.flashcardsMasteredIds) {
          const ch = ensureChapter(fId)
          if (!ch.flashcardMastered) {
            ch.flashcardMastered = true
            hasChanges = true
          }
        }
      }

      if (typeof remote.xp === 'number' && remote.xp > totalXp.value) {
        totalXp.value = remote.xp
        hasChanges = true
      }

      if (hasChanges) {
        persist()
      }
    } catch {
      // Игнорируем сетевые ошибки при оффлайне
    }
  }

  /**
   * Обновление ежедневного стрика активности
   */
  const updateStreak = (): void => {
    const today = getTodayDateString()
    const lastDate = lastActivityDate.value

    if (lastDate === today) {
      return
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastDate === yesterday) {
      streakDays.value += 1
    } else {
      streakDays.value = 1
    }

    lastActivityDate.value = today
    persist()
  }

  /**
   * Гарантирует наличие записи главы в хранилище
   */
  const ensureChapter = (docId: string): DocChapterProgress => {
    if (!chapters.value[docId]) {
      chapters.value[docId] = createDefaultChapterProgress(docId)
    }
    return chapters.value[docId]
  }

  /**
   * Проверка и авто-завершение главы при выполнении условий
   */
  const checkAutoCompletion = (docId: string): void => {
    const chapter = ensureChapter(docId)
    // Если флешкарта выучена и тест сдан (или прочитано) -> завершаем главу
    if (chapter.flashcardMastered && chapter.quizCompleted && chapter.status !== 'completed') {
      chapter.status = 'completed'
      totalXp.value += 50
    }
  }
  // #endregion Вспомогательные функции

  // #region Actions
  /**
   * Фиксация посещения / открытия главы
   */
  const visitDoc = (docId: string): void => {
    hydrate()
    const chapter = ensureChapter(docId)
    chapter.lastVisitedAt = Date.now()
    lastActiveDocId.value = docId
    persist()
  }

  /**
   * Оценка 3D-флешкарты пользователем
   */
  const rateFlashcard = (docId: string, rating: 'know' | 'doubt' | 'repeat'): void => {
    hydrate()
    const chapter = ensureChapter(docId)

    if (rating === 'know') {
      if (!chapter.flashcardMastered) {
        chapter.flashcardMastered = true
        totalXp.value += 50
        DocProgressApiService.syncMasterFlashcard(docId).catch(() => {})
      }
    } else {
      chapter.flashcardMastered = false
    }

    checkAutoCompletion(docId)
    persist()
  }

  /**
   * Отправка ответа на экспресс-тест квеста
   */
  const submitQuiz = (docId: string, answerId: string, isCorrect: boolean): void => {
    hydrate()
    const chapter = ensureChapter(docId)
    chapter.selectedQuizAnswerId = answerId

    if (isCorrect) {
      if (!chapter.quizCompleted) {
        chapter.quizCompleted = true
        totalXp.value += 100
        DocProgressApiService.syncBonusXp(100).catch(() => {})
      }
    } else {
      chapter.quizCompleted = false
    }

    checkAutoCompletion(docId)
    persist()
  }

  /**
   * Ручная отметка статуса изучения статьи
   */
  const toggleCompleteDoc = (docId: string): void => {
    hydrate()
    const chapter = ensureChapter(docId)

    if (chapter.status === 'completed') {
      chapter.status = 'in-progress'
      totalXp.value = Math.max(0, totalXp.value - 50)
    } else {
      chapter.status = 'completed'
      chapter.isRead = true
      totalXp.value += 50
    }

    DocProgressApiService.syncToggleChapter(docId).catch(() => {})
    persist()
  }

  /**
   * Начисление бонусного опыта (например, за тренировку карточек и комбо)
   */
  const addBonusXp = (amount: number): void => {
    hydrate()
    totalXp.value += Math.max(0, amount)
    DocProgressApiService.syncBonusXp(amount).catch(() => {})
    persist()
  }

  /**
   * Установка явного статуса для главы
   */
  const setDocStatus = (docId: string, status: DocStatus): void => {
    hydrate()
    const chapter = ensureChapter(docId)
    chapter.status = status
    persist()
  }

  /**
   * Полный сброс сохраненного прогресса
   */
  const resetProgress = (): void => {
    chapters.value = {}
    totalXp.value = 0
    lastActiveDocId.value = null
    streakDays.value = 1
    lastActivityDate.value = getTodayDateString()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn(e)
    }
  }
  // #endregion Actions

  // Автоматическая гидрация при первом использовании
  hydrate()

  return {
    chapters,
    totalXp,
    lastActiveDocId,
    streakDays,
    lastActivityDate,
    isHydrated,
    getChapter,
    isCompleted,
    isFlashcardMastered,
    isQuizPassed,
    getQuizAnswer,
    completedChaptersCount,
    masteredFlashcardsCount,
    completedQuizzesCount,
    userLevel,
    xpToNextLevel,
    getCategoryProgress,
    visitDoc,
    rateFlashcard,
    addBonusXp,
    submitQuiz,
    toggleCompleteDoc,
    setDocStatus,
    resetProgress,
    hydrate,
  }
})
