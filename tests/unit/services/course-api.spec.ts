import { CourseApiService } from '@/entities/course/api/course-api'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

const STORAGE_KEY = 'lern_user_assignments_v1'

const makeAssignment = (overrides: Record<string, unknown> = {}) => ({
  id: 'a1',
  title: 'Лабораторная',
  status: 'todo',
  ...overrides,
})

describe('CourseApiService (задания)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAssignments', () => {
    test('берёт задания с сервера и кэширует', async () => {
      mockFetch().mockResolvedValue(makeResponse({ json: [makeAssignment(), makeAssignment({ id: 'a2' })] }))
      const items = await CourseApiService.getAssignments()
      expect(items).toHaveLength(2)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)).toHaveLength(2)
    })

    test('при недоступном сервере использует кэш', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment({ id: 'cached' })]))
      mockNetworkDown()
      const items = await CourseApiService.getAssignments()
      expect(items[0].id).toBe('cached')
    })

    test('без сервера и без кэша возвращает начальный набор', async () => {
      mockNetworkDown()
      const items = await CourseApiService.getAssignments()
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('submitAssignment', () => {
    test('отправляет решение на сервер и обновляет кэш', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment()]))
      const fetchMock = mockFetch()
      fetchMock
        .mockResolvedValueOnce(makeResponse({ json: { assignment: makeAssignment({ status: 'review' }) } }))
        .mockResolvedValue(makeResponse({ ok: false, status: 500 })) // getAssignments внутри sync → кэш
      const res = await CourseApiService.submitAssignment('a1', { repoUrl: 'https://github.com/u/r' })
      expect(res.status).toBe('review')
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toMatch(/\/assignments\/a1\/submit$/)
      expect(JSON.parse(init.body)).toEqual({ repoUrl: 'https://github.com/u/r' })
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)[0].status).toBe('review')
    })

    test('офлайн: переводит задание в «на проверке» локально', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment()]))
      mockNetworkDown()
      const res = await CourseApiService.submitAssignment('a1', { code: 'console.log(1)', notes: 'готово' })
      expect(res.status).toBe('review')
      expect(res.submission?.code).toBe('console.log(1)')
    })

    test('несуществующее задание → ошибка', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment()]))
      mockNetworkDown()
      await expect(CourseApiService.submitAssignment('нет', {})).rejects.toThrow('Задание не найдено')
    })
  })

  describe('gradeAssignment', () => {
    test('отправляет PATCH с оценкой', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment({ status: 'review' })]))
      const fetchMock = mockFetch()
      fetchMock
        .mockResolvedValueOnce(makeResponse({ json: { assignment: makeAssignment({ status: 'passed', score: 90 }) } }))
        .mockResolvedValue(makeResponse({ ok: false, status: 500 }))
      const res = await CourseApiService.gradeAssignment('a1', { status: 'passed', score: 90, comment: 'Отлично' })
      expect(res.status).toBe('passed')
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toMatch(/\/assignments\/a1\/grade$/)
      expect(init.method).toBe('PATCH')
    })

    test('офлайн: сохраняет оценку и отзыв локально', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makeAssignment({ status: 'review' })]))
      mockNetworkDown()
      const res = await CourseApiService.gradeAssignment('a1', { status: 'rejected', score: 40, comment: 'Доработать' })
      expect(res.status).toBe('rejected')
      expect(res.score).toBe(40)
      expect(res.mentorFeedback?.comment).toBe('Доработать')
    })
  })
})
