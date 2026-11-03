import { LoginPayload, RegisterPayload, ResetPasswordPayload, AuthResponse } from '../types'
import { API_BASE_URL } from '@/shared/api'

const AUTH_API_URL = `${API_BASE_URL}/auth`
const TOKEN_KEY = 'lern_token'
const NETWORK_ERROR_MESSAGE = 'Сервер недоступен. Проверьте соединение и попробуйте позже.'

/**
 * Сервис аутентификации.
 * Работает только с реальным бэкендом: при сетевой ошибке вход и регистрация
 * НЕ эмулируются, пользователь получает понятное сообщение.
 */
export class AuthApiService {
  /**
   * Отправка JSON-запроса к auth API и разбор ответа
   */
  private static async post(path: string, body: unknown): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await response.json()) as AuthResponse
    if (response.ok && data.success) {
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
      }
      return data
    }
    return { success: false, errorMessage: data.errorMessage || 'Ошибка запроса' }
  }

  /**
   * Выполнение входа по email и паролю
   */
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!payload.email || !payload.password) {
      return { success: false, errorMessage: 'Пожалуйста, заполните все обязательные поля.' }
    }
    try {
      return await AuthApiService.post('/login', payload)
    } catch (err) {
      return { success: false, errorMessage: NETWORK_ERROR_MESSAGE }
    }
  }

  /**
   * Регистрация нового аккаунта
   */
  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (payload.password !== payload.confirmPassword) {
      return { success: false, errorMessage: 'Пароли не совпадают.' }
    }
    try {
      return await AuthApiService.post('/register', payload)
    } catch (err) {
      return { success: false, errorMessage: NETWORK_ERROR_MESSAGE }
    }
  }

  /**
   * Запрос сброса пароля
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    try {
      return await AuthApiService.post('/forgot-password', payload)
    } catch (err) {
      return { success: false, errorMessage: NETWORK_ERROR_MESSAGE }
    }
  }

  /**
   * Выход: удаляет токен из хранилища
   */
  static logout(): void {
    localStorage.removeItem(TOKEN_KEY)
  }
}
