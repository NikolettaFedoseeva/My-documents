import { DocProgressApiService } from '@/entities/doc/api/doc-progress-api'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

describe('DocProgressApiService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('без авторизации', () => {
    test('ни один метод не делает запросов к серверу', async () => {
      const fetchMock = mockFetch()
      expect(await DocProgressApiService.fetchMyProgress()).toBeNull()
      expect(await DocProgressApiService.syncToggleChapter('c1')).toBe(false)
      expect(await DocProgressApiService.syncBonusXp(50)).toBe(false)
      expect(await DocProgressApiService.syncMasterFlashcard('f1')).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('с авторизацией', () => {
    beforeEach(() => {
      localStorage.setItem('lern_token', 'jwt')
    })

    test('fetchMyProgress возвращает прогресс и шлёт Bearer-токен', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse({ json: { xp: 120, completedChapterIds: ['c1'] } }))
      const res = await DocProgressApiService.fetchMyProgress()
      expect(res?.xp).toBe(120)
      expect(fetchMock.mock.calls[0][1].headers['Authorization']).toBe('Bearer jwt')
    })

    test('fetchMyProgress при HTTP-ошибке и при сбое сети возвращает null', async () => {
      mockFetch().mockResolvedValue(makeResponse({ ok: false, status: 500 }))
      expect(await DocProgressApiService.fetchMyProgress()).toBeNull()
      mockNetworkDown()
      expect(await DocProgressApiService.fetchMyProgress()).toBeNull()
    })

    test('syncToggleChapter отправляет chapterId', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse())
      expect(await DocProgressApiService.syncToggleChapter('c7')).toBe(true)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toMatch(/\/progress\/toggle-chapter$/)
      expect(JSON.parse(init.body)).toEqual({ chapterId: 'c7' })
    })

    test('syncBonusXp не отправляет нулевые и отрицательные значения', async () => {
      const fetchMock = mockFetch()
      expect(await DocProgressApiService.syncBonusXp(0)).toBe(false)
      expect(await DocProgressApiService.syncBonusXp(-10)).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('syncBonusXp отправляет положительное значение', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse())
      expect(await DocProgressApiService.syncBonusXp(25)).toBe(true)
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ amount: 25 })
    })

    test('syncMasterFlashcard при сбое сети возвращает false', async () => {
      mockNetworkDown()
      expect(await DocProgressApiService.syncMasterFlashcard('f1')).toBe(false)
    })
  })
})
