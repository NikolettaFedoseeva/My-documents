import { UserApiService } from '@/entities/user/api/user-api'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

const STORAGE_KEY = 'lern_admin_users_v1'

const serverUsers = [
  { id: 'u1', name: 'Анна', email: 'anna@t.ru', role: 'student', isBanned: false },
  { id: 'u2', name: 'Борис', email: 'boris@t.ru', role: 'author', isBanned: false },
]

describe('UserApiService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAllUsers', () => {
    test('берёт список с сервера и кэширует его в localStorage', async () => {
      mockFetch().mockResolvedValue(makeResponse({ json: serverUsers }))
      const users = await UserApiService.getAllUsers()
      expect(users).toHaveLength(2)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)).toHaveLength(2)
    })

    test('при недоступном сервере отдаёт кэш из localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUsers))
      mockNetworkDown()
      const users = await UserApiService.getAllUsers()
      expect(users.map((u) => u.id)).toEqual(['u1', 'u2'])
    })

    test('без сервера и без кэша отдаёт начальный набор и сохраняет его', async () => {
      mockNetworkDown()
      const users = await UserApiService.getAllUsers()
      expect(users.length).toBeGreaterThan(0)
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })

    test('повреждённый кэш не роняет загрузку', async () => {
      localStorage.setItem(STORAGE_KEY, '{broken')
      mockNetworkDown()
      const users = await UserApiService.getAllUsers()
      expect(users.length).toBeGreaterThan(0)
    })
  })

  describe('updateUserRole', () => {
    test('отправляет PATCH на /users/:id/role и возвращает обновлённого пользователя', async () => {
      const fetchMock = mockFetch()
      fetchMock
        .mockResolvedValueOnce(makeResponse({ json: { user: { ...serverUsers[0], role: 'author' } } }))
        .mockResolvedValue(makeResponse({ json: serverUsers }))
      const user = await UserApiService.updateUserRole('u1', 'author')
      expect(user.role).toBe('author')
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toMatch(/\/users\/u1\/role$/)
      expect(init.method).toBe('PATCH')
      expect(JSON.parse(init.body)).toEqual({ role: 'author' })
    })

    test('неизвестный пользователь без связи с сервером → ошибка', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUsers))
      mockNetworkDown()
      await expect(UserApiService.updateUserRole('нет-такого', 'admin')).rejects.toThrow('не найден')
    })
  })

  describe('toggleUserBan', () => {
    test('отправляет инвертированное состояние блокировки', async () => {
      const fetchMock = mockFetch()
      fetchMock
        .mockResolvedValueOnce(makeResponse({ json: serverUsers })) // getAllUsers
        .mockResolvedValueOnce(makeResponse({ json: { user: { ...serverUsers[0], isBanned: true } } }))
      const user = await UserApiService.toggleUserBan('u1')
      expect(user.isBanned).toBe(true)
      const body = JSON.parse(fetchMock.mock.calls[1][1].body)
      expect(body).toEqual({ isBanned: true })
    })
  })

  describe('getCurrentUser', () => {
    test('с токеном запрашивает /auth/me', async () => {
      localStorage.setItem('lern_token', 't')
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse({ json: { user: serverUsers[0] } }))
      const user = await UserApiService.getCurrentUser()
      expect(user?.id).toBe('u1')
      expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/me$/)
    })
  })
})
