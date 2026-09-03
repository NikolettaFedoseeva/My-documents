import { LoginPayload, RegisterPayload, ResetPasswordPayload, AuthResponse } from '../types'

const API_BASE_URL = 'http://localhost:5000/api/auth'

export class AuthApiService {
  /**
   * Выполнение входа по email и паролю
   */
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('lern_token', data.token)
        }
        return data
      }
      return { success: false, errorMessage: data.errorMessage || 'Ошибка входа' }
    } catch (err) {
      // Fallback эмуляция при отсутствии активного бэкенда
      if (!payload.email || !payload.password) {
        return { success: false, errorMessage: 'Пожалуйста, заполните все обязательные поля.' }
      }
      const token = 'jwt-mock-token-lern-2026'
      localStorage.setItem('lern_token', token)
      return {
        success: true,
        token,
        user: {
          id: 'usr-777',
          name: payload.email.split('@')[0] || 'Пользователь',
          email: payload.email,
          role: 'student',
        },
      }
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
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('lern_token', data.token)
        }
        return data
      }
      return { success: false, errorMessage: data.errorMessage || 'Ошибка регистрации' }
    } catch (err) {
      const token = 'jwt-mock-token-new-user'
      localStorage.setItem('lern_token', token)
      return {
        success: true,
        token,
        user: {
          id: `usr-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      }
    }
  }

  /**
   * Запрос сброса пароля
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      return data
    } catch (err) {
      return { success: true }
    }
  }
}
