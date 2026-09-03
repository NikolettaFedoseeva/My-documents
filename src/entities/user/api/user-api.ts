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

export class UserApiService {
  /**
   * Получение данных текущего пользователя
   */
  static async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_USER })
      }, 300)
    })
  }

  /**
   * Получение списка уведомлений
   */
  static async getNotifications(): Promise<NotificationItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_NOTIFICATIONS])
      }, 250)
    })
  }
}
