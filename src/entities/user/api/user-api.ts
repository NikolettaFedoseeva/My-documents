import { User, NotificationItem } from '../types'

const MOCK_USER: User = {
  id: 'usr-777',
  name: 'Николай Админ',
  email: 'admin@lern.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'admin',
  status: 'online',
  unreadNotificationsCount: 3,
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Проверка лабораторной',
    message: 'Преподаватель проверил вашу работу по Vue 3 и FSD.',
    createdAt: '10 мин назад',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Новый курс',
    message: 'Доступен новый интерактивный курс "Advanced TypeScript".',
    createdAt: '1 час назад',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Обновление платформы',
    message: 'Платформа LERN обновлена до версии v2.4.0.',
    createdAt: 'Вчера',
    isRead: false,
  },
]

const STORAGE_KEY_ADMIN_USERS = 'lern_admin_users_v1'

const INITIAL_USERS: User[] = [
  {
    id: 'usr-777',
    name: 'Николай Админ',
    email: 'admin@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    status: 'online',
    unreadNotificationsCount: 3,
    xp: 450,
    level: 5,
    createdAt: '2026-08-01',
    isBanned: false,
  },
  {
    id: 'usr-101',
    name: 'Алексей Смирнов',
    email: 'alex.author@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'author',
    status: 'online',
    unreadNotificationsCount: 1,
    xp: 1200,
    level: 12,
    createdAt: '2026-08-10',
    isBanned: false,
  },
  {
    id: 'usr-102',
    name: 'Дарья Волкова',
    email: 'daria.student@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'student',
    status: 'online',
    unreadNotificationsCount: 0,
    xp: 680,
    level: 7,
    createdAt: '2026-08-25',
    isBanned: false,
  },
  {
    id: 'usr-103',
    name: 'Михаил Архитектор',
    email: 'mikhail.pg@lern.dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    role: 'teacher',
    status: 'busy',
    unreadNotificationsCount: 2,
    xp: 950,
    level: 10,
    createdAt: '2026-09-01',
    isBanned: false,
  },
  {
    id: 'usr-104',
    name: 'Екатерина Новикова',
    email: 'katya.guest@mail.ru',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    role: 'guest',
    status: 'offline',
    unreadNotificationsCount: 0,
    xp: 50,
    level: 1,
    createdAt: '2026-10-02',
    isBanned: false,
  },
]

const API_BASE_URL = 'http://localhost:5000/api/users'

export class UserApiService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('lern_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  /**
   * Получение данных текущего пользователя
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('lern_token')
      if (token) {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: this.getAuthHeaders(),
        })
        if (response.ok) {
          const data = await response.json()
          if (data.user) return data.user
        }
      }
    } catch (e) {
      // Fallback
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_USER })
      }, 150)
    })
  }

  /**
   * Получение списка всех пользователей платформы (для панели администратора)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        const users = await response.json()
        if (Array.isArray(users)) {
          return users
        }
      }
    } catch (e) {
      // Fallback
    }

    return new Promise((resolve) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            resolve(parsed)
            return
          }
        }
      } catch (err) {
        console.warn('[UserApiService] Ошибка чтения пользователей:', err)
      }

      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(INITIAL_USERS))
      resolve(JSON.parse(JSON.stringify(INITIAL_USERS)))
    })
  }

  /**
   * Обновление роли пользователя
   */
  static async updateUserRole(userId: string, newRole: import('../types').UserRole): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/role`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) return data.user
      }
    } catch (e) {
      // Fallback
    }

    const users = await this.getAllUsers()
    const target = users.find((u) => u.id === userId)
    if (!target) {
      throw new Error(`Пользователь с id ${userId} не найден`)
    }
    target.role = newRole
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users))
    return target
  }

  /**
   * Переключение блокировки пользователя
   */
  static async toggleUserBan(userId: string): Promise<User> {
    const users = await this.getAllUsers()
    const target = users.find((u) => u.id === userId)
    const newBanState = !target?.isBanned

    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/ban`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isBanned: newBanState }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) return data.user
      }
    } catch (e) {
      // Fallback
    }

    if (!target) {
      throw new Error(`Пользователь с id ${userId} не найден`)
    }
    target.isBanned = newBanState
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users))
    return target
  }

  /**
   * Получение списка уведомлений
   */
  static async getNotifications(): Promise<NotificationItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_NOTIFICATIONS])
      }, 150)
    })
  }
}
