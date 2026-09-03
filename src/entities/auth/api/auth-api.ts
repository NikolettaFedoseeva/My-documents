import { LoginPayload, RegisterPayload, ResetPasswordPayload, AuthResponse } from '../types'

export class AuthApiService {
  /**
   * Выполнение входа по email и паролю
   */
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!payload.email || !payload.password) {
          return resolve({
            success: false,
            errorMessage: 'Пожалуйста, заполните все обязательные поля.',
          })
        }

        if (payload.password.length < 4) {
          return resolve({
            success: false,
            errorMessage: 'Неверный пароль. Пароль должен быть не менее 4 символов.',
          })
        }

        resolve({
          success: true,
          token: 'jwt-mock-token-lern-2026',
          user: {
            id: 'usr-777',
            name: payload.email.split('@')[0] || 'Пользователь',
            email: payload.email,
            role: 'student',
          },
        })
      }, 500)
    })
  }

  /**
   * Регистрация нового аккаунта
   */
  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (payload.password !== payload.confirmPassword) {
          return resolve({
            success: false,
            errorMessage: 'Пароли не совпадают.',
          })
        }

        resolve({
          success: true,
          token: 'jwt-mock-token-new-user',
          user: {
            id: `usr-${Date.now()}`,
            name: payload.name,
            email: payload.email,
            role: payload.role,
          },
        })
      }, 600)
    })
  }

  /**
   * Запрос сброса пароля
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
        })
      }, 400)
    })
  }
}
