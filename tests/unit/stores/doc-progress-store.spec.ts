import { setActivePinia, createPinia } from 'pinia'
import { useDocProgressStore } from '@/entities/doc/model/doc-progress-store'

// Мокаем удаленный API-сервис прогресса, чтобы тесты работали локально и изолированно
jest.mock('@/entities/doc/api/doc-progress-api', () => ({
  DocProgressApiService: {
    fetchMyProgress: jest.fn().mockResolvedValue({
      totalXp: 0,
      streakDays: 1,
      completedChapterIds: [],
      flashcardsMasteredIds: [],
    }),
    syncToggleChapter: jest.fn().mockResolvedValue({ success: true }),
    syncBonusXp: jest.fn().mockResolvedValue({ success: true }),
    syncMasterFlashcard: jest.fn().mockResolvedValue({ success: true }),
  },
}))

describe('Doc Progress Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  test('инициализируется с 0 завершенных глав и уровнем 1', () => {
    const store = useDocProgressStore()
    expect(store.completedChaptersCount).toBe(0)
    expect(store.totalXp).toBe(0)
    expect(store.userLevel).toBe(1)
  })

  test('переключает статус завершения главы (toggleCompleteDoc)', () => {
    const store = useDocProgressStore()
    const docId = 'chapter-vue-reactive'

    expect(store.isCompleted(docId)).toBe(false)

    // Завершаем главу
    store.toggleCompleteDoc(docId)
    expect(store.isCompleted(docId)).toBe(true)
    expect(store.completedChaptersCount).toBe(1)
    expect(store.totalXp).toBeGreaterThanOrEqual(50)

    // Отменяем завершение
    store.toggleCompleteDoc(docId)
    expect(store.isCompleted(docId)).toBe(false)
    expect(store.completedChaptersCount).toBe(0)
  })

  test('начисляет бонусный опыт и пересчитывает уровень пользователя', () => {
    const store = useDocProgressStore()
    expect(store.userLevel).toBe(1)

    // Добавляем 250 XP
    store.addBonusXp(250)
    expect(store.totalXp).toBe(250)
    // 250 XP / 100 = 2.5 -> Уровень 3
    expect(store.userLevel).toBe(3)
  })

  test('фиксирует выученную флешкарту Active Recall (rateFlashcard с know)', () => {
    const store = useDocProgressStore()
    const docId = 'chapter-ts-generics'

    expect(store.isFlashcardMastered(docId)).toBe(false)

    // Оценка 'know' помечает флешкарту как освоенную
    store.rateFlashcard(docId, 'know')
    expect(store.isFlashcardMastered(docId)).toBe(true)
    expect(store.masteredFlashcardsCount).toBe(1)
  })

  test('сохраняет ответ на тест (submitQuiz)', () => {
    const store = useDocProgressStore()
    const docId = 'quiz-fsd-slices'
    const optionId = 'opt-correct-answer'

    store.submitQuiz(docId, optionId, true)
    expect(store.isQuizPassed(docId)).toBe(true)
    expect(store.getQuizAnswer(docId)).toBe(optionId)
    expect(store.completedQuizzesCount).toBe(1)
  })
})
