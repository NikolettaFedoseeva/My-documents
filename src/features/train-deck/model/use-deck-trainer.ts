import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DocApiService, useDocProgressStore } from '@/entities/doc'
import { DeckCard, FlashcardRating, TrainingSessionStats } from '../types'

export interface UseDeckTrainerOptions {
  courseId?: string
  onClose?: () => void
}

export function useDeckTrainer(options: UseDeckTrainerOptions = {}) {
  const progressStore = useDocProgressStore()

  // #region refs
  const cards = ref<DeckCard[]>([])
  const initialTotalCards = ref<number>(0)
  const currentIndex = ref<number>(0)
  const isFlipped = ref<boolean>(false)
  const isHintVisible = ref<boolean>(false)
  const isLoading = ref<boolean>(true)
  const isFinished = ref<boolean>(false)
  const timerSeconds = ref<number>(0)
  let timerInterval: ReturnType<typeof setInterval> | null = null

  const mistakeCards = ref<DeckCard[]>([])

  // Статистика
  const knownCount = ref<number>(0)
  const doubtCount = ref<number>(0)
  const repeatCount = ref<number>(0)
  const combo = ref<number>(0)
  const maxCombo = ref<number>(0)
  const earnedXp = ref<number>(0)
  // #endregion refs

  // #region computed
  const currentCard = computed<DeckCard | null>(() => {
    if (cards.value.length === 0 || currentIndex.value >= cards.value.length) {
      return null
    }
    return cards.value[currentIndex.value]
  })

  const progressPercent = computed<number>(() => {
    if (initialTotalCards.value === 0) return 0
    const answeredCount = knownCount.value + doubtCount.value
    return Math.min(100, Math.round((answeredCount / initialTotalCards.value) * 100))
  })

  const sessionStats = computed<TrainingSessionStats>(() => {
    return {
      totalCards: initialTotalCards.value,
      knownCount: knownCount.value,
      doubtCount: doubtCount.value,
      repeatCount: repeatCount.value,
      combo: combo.value,
      maxCombo: maxCombo.value,
      earnedXp: earnedXp.value,
      durationSeconds: timerSeconds.value,
    }
  })

  const formattedTimer = computed<string>(() => {
    const mins = Math.floor(timerSeconds.value / 60)
    const secs = timerSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })
  // #endregion computed

  // #region Функции
  const startTimer = (): void => {
    stopTimer()
    timerSeconds.value = 0
    timerInterval = setInterval(() => {
      timerSeconds.value += 1
    }, 1000)
  }

  const stopTimer = (): void => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const shuffleArray = <T>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  const loadCards = async (): Promise<void> => {
    isLoading.value = true
    try {
      const allCourses = await DocApiService.getCourses()
      const collected: DeckCard[] = []

      const targetCourses = options.courseId && options.courseId !== 'all'
        ? allCourses.filter((c) => c.id === options.courseId || c.slug === options.courseId)
        : allCourses

      for (const course of targetCourses) {
        for (const mod of course.modules || []) {
          for (const item of mod.items || []) {
            if (item.flashcard) {
              collected.push({
                docId: item.id,
                docTitle: item.title,
                courseTitle: course.title,
                courseId: course.id,
                flashcard: item.flashcard,
                isMastered: progressStore.isFlashcardMastered(item.id),
              })
            }
          }
        }
      }

      // Перемешиваем колоду
      const shuffled = shuffleArray(collected)
      cards.value = shuffled
      initialTotalCards.value = shuffled.length
      currentIndex.value = 0
      isFlipped.value = false
      isHintVisible.value = false
      isFinished.value = false

      // Сброс счетчиков
      knownCount.value = 0
      doubtCount.value = 0
      repeatCount.value = 0
      combo.value = 0
      maxCombo.value = 0
      earnedXp.value = 0
      mistakeCards.value = []

      if (shuffled.length > 0) {
        startTimer()
      }
    } catch (err) {
      console.error('[useDeckTrainer] Ошибка загрузки колоды карточек:', err)
    } finally {
      isLoading.value = false
    }
  }

  const flipCard = (): void => {
    isFlipped.value = !isFlipped.value
  }

  const toggleHint = (): void => {
    isHintVisible.value = !isHintVisible.value
  }

  const nextCard = (): void => {
    isFlipped.value = false
    isHintVisible.value = false
    currentIndex.value += 1

    if (currentIndex.value >= cards.value.length) {
      isFinished.value = true
      stopTimer()
      // Бонусный опыт за завершение всей тренировки (+50 XP)
      progressStore.addBonusXp(50)
      earnedXp.value += 50
    }
  }

  const rateCard = (rating: FlashcardRating): void => {
    const card = currentCard.value
    if (!card) return

    if (rating === 'know') {
      knownCount.value += 1
      combo.value += 1
      if (combo.value > maxCombo.value) {
        maxCombo.value = combo.value
      }

      // Базовые 25 XP + комбо бонус
      const comboBonus = Math.min(25, (combo.value - 1) * 5)
      const cardXp = 25 + comboBonus
      earnedXp.value += cardXp

      progressStore.rateFlashcard(card.docId, 'know')
      if (comboBonus > 0) {
        progressStore.addBonusXp(comboBonus)
      }
      nextCard()
    } else if (rating === 'doubt') {
      doubtCount.value += 1
      combo.value = 0
      const cardXp = 10
      earnedXp.value += cardXp

      progressStore.rateFlashcard(card.docId, 'doubt')
      progressStore.addBonusXp(cardXp)
      nextCard()
    } else if (rating === 'repeat') {
      repeatCount.value += 1
      combo.value = 0
      mistakeCards.value.push(card)

      progressStore.rateFlashcard(card.docId, 'repeat')
      // Добавляем карточку в конец колоды для закрепления
      cards.value.push(card)
      nextCard()
    }
  }

  const restartSession = (): void => {
    loadCards()
  }

  const repeatMistakes = (): void => {
    if (mistakeCards.value.length === 0) return
    const shuffled = shuffleArray(mistakeCards.value)
    cards.value = shuffled
    initialTotalCards.value = shuffled.length
    currentIndex.value = 0
    isFlipped.value = false
    isHintVisible.value = false
    isFinished.value = false

    knownCount.value = 0
    doubtCount.value = 0
    repeatCount.value = 0
    combo.value = 0
    maxCombo.value = 0
    mistakeCards.value = []

    startTimer()
  }

  // #region Обработка горячих клавиш
  const handleKeydown = (e: KeyboardEvent): void => {
    if (isFinished.value) return

    // Escape — закрыть модалку
    if (e.key === 'Escape') {
      if (options.onClose) options.onClose()
      return
    }

    // Пробел или Enter — перевернуть карту
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault()
      flipCard()
      return
    }

    // Буква H — подсказка
    if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
      toggleHint()
      return
    }

    // Оценка карточки (только когда она перевернута лицом к ответу)
    if (isFlipped.value) {
      if (e.key === '1' || e.key === 'ArrowLeft') {
        rateCard('repeat')
      } else if (e.key === '2' || e.key === 'ArrowDown') {
        rateCard('doubt')
      } else if (e.key === '3' || e.key === 'ArrowRight') {
        rateCard('know')
      }
    }
  }
  // #endregion Обработка горячих клавиш
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    loadCards()
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    stopTimer()
    window.removeEventListener('keydown', handleKeydown)
  })
  // #endregion Хуки жизненного цикла

  return {
    cards,
    initialTotalCards,
    currentIndex,
    currentCard,
    isFlipped,
    isHintVisible,
    isLoading,
    isFinished,
    progressPercent,
    formattedTimer,
    sessionStats,
    combo,
    mistakeCards,
    flipCard,
    toggleHint,
    rateCard,
    restartSession,
    repeatMistakes,
  }
}
