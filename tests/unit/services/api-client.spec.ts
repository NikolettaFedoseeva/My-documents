import { getAuthHeaders, apiFetch } from '@/shared/api/config'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

describe('API-клиент (shared/api)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAuthHeaders', () => {
    test('без токена возвращает только Content-Type', () => {
      const headers = getAuthHeaders()
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers['Authorization']).toBeUndefined()
    })

    test('подставляет Bearer-токен из localStorage', () => {
      localStorage.setItem('lern_token', 'abc123')
      expect(getAuthHeaders()['Authorization']).toBe('Bearer abc123')
    })

    test('кастомные заголовки дополняют стандартные', () => {
      const headers = getAuthHeaders({ 'X-Test': '1' })
      expect(headers['X-Test']).toBe('1')
      expect(headers['Content-Type']).toBe('application/json')
    })
  })

  describe('apiFetch', () => {
    test('успешный ответ возвращает данные', async () => {
      mockFetch().mockResolvedValue(makeResponse({ json: { hello: 'world' } }))
      const res = await apiFetch<{ hello: string }>('/ping')
      expect(res.ok).toBe(true)
      expect(res.data).toEqual({ hello: 'world' })
    })

    test('HTTP-ошибка возвращает ok=false и текст ошибки сервера', async () => {
      mockFetch().mockResolvedValue(
        makeResponse({ ok: false, status: 403, json: { errorMessage: 'Доступ запрещен' } }),
      )
      const res = await apiFetch('/secret')
      expect(res.ok).toBe(false)
      expect(res.status).toBe(403)
      expect(res.error).toBe('Доступ запрещен')
    })

    test('сетевая ошибка не бросает исключение', async () => {
      mockNetworkDown()
      const res = await apiFetch('/ping')
      expect(res.ok).toBe(false)
      expect(res.status).toBe(0)
      expect(res.error).toBe('Failed to fetch')
    })

    test('относительный путь достраивается до API_BASE_URL', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse())
      await apiFetch('/users')
      expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/users$/)
    })
  })
})
