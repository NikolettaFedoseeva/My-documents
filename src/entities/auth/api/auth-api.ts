import { LoginPayload, RegisterPayload, ResetPasswordPayload, AuthResponse } from '../types'
import { UserApiService, UserRole, User } from '@/entities/user'

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

      const allUsers = await UserApiService.getAllUsers()
      const normalizedEmail = payload.email.trim().toLowerCase()
      const foundUser = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail)

      if (foundUser) {
        if (foundUser.isBanned) {
          return {
            success: false,
            errorMessage: 'Учетная запись заблокирована администратором системы.',
          }
        }

        const token = `jwt-token-${foundUser.id}`
        localStorage.setItem('lern_token', token)
        return {
          success: true,
          token,
          user: {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            avatar: foundUser.avatar,
            xp: foundUser.xp,
            level: foundUser.level,
          },
        }
      }

      // Если аккаунт не найден, создаем профиль на лету с ролью на основе email
      let inferredRole: UserRole = 'student'
      if (normalizedEmail.includes('admin')) {
        inferredRole = 'admin'
      } else if (normalizedEmail.includes('author') || normalizedEmail.includes('teacher')) {
        inferredRole = 'author'
      }

      const token = 'jwt-mock-token-lern-2026'
      localStorage.setItem('lern_token', token)
      return {
        success: true,
        token,
        user: {
          id: `usr-${Date.now()}`,
          name: payload.email.split('@')[0] || 'Пользователь',
          email: payload.email,
          role: inferredRole,
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
      const token = `jwt-token-new-${Date.now()}`
      localStorage.setItem('lern_token', token)

      const targetRole: UserRole = payload.role === 'teacher' ? 'author' : (payload.role as UserRole)
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        role: targetRole,
        status: 'online',
        unreadNotificationsCount: 1,
        xp: 100,
        level: 1,
        createdAt: new Date().toISOString().split('T')[0],
        isBanned: false,
      }

      // Сохраняем в реестр пользователей платформы
      try {
        const users = await UserApiService.getAllUsers()
        users.push(newUser)
        localStorage.setItem('lern_admin_users_v1', JSON.stringify(users))
      } catch (e) {
        console.warn('Не удалось сохранить нового пользователя в админку:', e)
      }

      return {
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          xp: newUser.xp,
          level: newUser.level,
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
