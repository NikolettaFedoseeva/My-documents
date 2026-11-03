import { DocHttpRepository } from '@/entities/doc/api/doc-http-repository'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

const serverCourse = { id: 'srv-1', slug: 'server-course', title: 'С сервера' }

describe('DocHttpRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getCourses', () => {
    test('возвращает курсы с сервера', async () => {
      mockFetch().mockResolvedValue(makeResponse({ json: [serverCourse] }))
      const courses = await new DocHttpRepository().getCourses()
      expect(courses).toHaveLength(1)
      expect(courses[0].slug).toBe('server-course')
    })

    test('при недоступном сервере отдаёт локальные курсы (offline-first)', async () => {
      mockNetworkDown()
      const courses = await new DocHttpRepository().getCourses()
      expect(courses.length).toBeGreaterThan(0)
      expect(courses.some((c) => c.id === 'srv-1')).toBe(false)
    })

    test('при ответе 500 отдаёт локальные курсы', async () => {
      mockFetch().mockResolvedValue(makeResponse({ ok: false, status: 500 }))
      const courses = await new DocHttpRepository().getCourses()
      expect(courses.length).toBeGreaterThan(0)
    })

    test('шлёт Bearer-токен, если пользователь авторизован', async () => {
      localStorage.setItem('lern_token', 'jwt')
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse({ json: [] }))
      await new DocHttpRepository().getCourses()
      expect(fetchMock.mock.calls[0][1].headers['Authorization']).toBe('Bearer jwt')
    })
  })

  describe('createCourse', () => {
    const dto = { title: 'Новый курс', slug: 'new-course', description: 'Описание', category: 'Frontend' } as never

    test('отправляет POST и возвращает созданный курс', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse({ json: { course: serverCourse } }))
      const course = await new DocHttpRepository().createCourse(dto)
      expect(course.id).toBe('srv-1')
      expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    })

    test('офлайн: создаёт курс локально', async () => {
      mockNetworkDown()
      const course = await new DocHttpRepository().createCourse(dto)
      expect(course.title).toBe('Новый курс')
      const all = await new DocHttpRepository().getCourses()
      expect(all.some((c) => c.title === 'Новый курс')).toBe(true)
    })
  })

  describe('getCategories', () => {
    test('офлайн: отдаёт локальные модули', async () => {
      mockNetworkDown()
      const categories = await new DocHttpRepository().getCategories()
      expect(Array.isArray(categories)).toBe(true)
    })
  })
})
