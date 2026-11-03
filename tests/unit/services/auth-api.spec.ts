import { AuthApiService } from '@/entities/auth/api/auth-api'
import { makeResponse, mockFetch, mockNetworkDown } from '../helpers/fetch-mock'

const loginPayload = { email: 'a@b.ru', password: 'secret123', rememberMe: false }

describe('AuthApiService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    test('успешный вход сохраняет токен и возвращает пользователя', async () => {
      mockFetch().mockResolvedValue(
        makeResponse({
          json: { success: true, token: 'jwt-1', user: { id: '1', name: 'A', email: 'a@b.ru', role: 'student' } },
        }),
      )
      const res = await AuthApiService.login(loginPayload)
      expect(res.success).toBe(true)
      expect(res.user?.role).toBe('student')
      expect(localStorage.getItem('lern_token')).toBe('jwt-1')
    })

    test('неверный пароль: токен не сохраняется, возвращается ошибка сервера', async () => {
      mockFetch().mockResolvedValue(
        makeResponse({ ok: false, status: 400, json: { success: false, errorMessage: 'Неверный логин или пароль.' } }),
      )
      const res = await AuthApiService.login(loginPayload)
      expect(res.success).toBe(false)
      expect(res.errorMessage).toBe('Неверный логин или пароль.')
      expect(localStorage.getItem('lern_token')).toBeNull()
    })

    test('БЕЗОПАСНОСТЬ: при недоступном сервере вход НЕ эмулируется', async () => {
      mockNetworkDown()
      const res = await AuthApiService.login({ ...loginPayload, email: 'admin@x.ru' })
      expect(res.success).toBe(false)
      expect(res.user).toBeUndefined()
      expect(localStorage.getItem('lern_token')).toBeNull()
    })

    test('пустые поля отклоняются без запроса к серверу', async () => {
      const fetchMock = mockFetch()
      const res = await AuthApiService.login({ email: '', password: '', rememberMe: false })
      expect(res.success).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    const registerPayload = {
      name: 'Аня',
      email: 'anya@b.ru',
      password: 'password1',
      confirmPassword: 'password1',
      role: 'student' as const,
    }

    test('несовпадающие пароли отклоняются без запроса к серверу', async () => {
      const fetchMock = mockFetch()
      const res = await AuthApiService.register({ ...registerPayload, confirmPassword: 'other' })
      expect(res.success).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('успешная регистрация сохраняет токен', async () => {
      mockFetch().mockResolvedValue(
        makeResponse({
          json: { success: true, token: 'jwt-2', user: { id: '2', name: 'Аня', email: 'anya@b.ru', role: 'student' } },
        }),
      )
      const res = await AuthApiService.register(registerPayload)
      expect(res.success).toBe(true)
      expect(localStorage.getItem('lern_token')).toBe('jwt-2')
    })

    test('БЕЗОПАСНОСТЬ: при недоступном сервере аккаунт НЕ создаётся локально', async () => {
      mockNetworkDown()
      const res = await AuthApiService.register(registerPayload)
      expect(res.success).toBe(false)
      expect(localStorage.getItem('lern_token')).toBeNull()
      expect(localStorage.getItem('lern_admin_users_v1')).toBeNull()
    })
  })

  describe('resetPassword и logout', () => {
    test('сброс пароля обращается к /auth/forgot-password', async () => {
      const fetchMock = mockFetch()
      fetchMock.mockResolvedValue(makeResponse({ json: { success: true } }))
      await AuthApiService.resetPassword({ email: 'a@b.ru' })
      expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/forgot-password$/)
    })

    test('сбой сети при сбросе пароля возвращает ошибку, а не ложный успех', async () => {
      mockNetworkDown()
      const res = await AuthApiService.resetPassword({ email: 'a@b.ru' })
      expect(res.success).toBe(false)
    })

    test('logout удаляет токен', () => {
      localStorage.setItem('lern_token', 'x')
      AuthApiService.logout()
      expect(localStorage.getItem('lern_token')).toBeNull()
    })
  })
})
