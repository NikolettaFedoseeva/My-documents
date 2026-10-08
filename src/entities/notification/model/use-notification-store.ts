import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AppNotification, ToastMessage, NotificationType } from '../types'

const STORAGE_KEY = 'lern_notifications_v1'

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🏆 Новое достижение!',
    message: 'Вы разблокировали значок «Первый Шаг 👣» за успешное прочтение первой главы.',
    type: 'achievement',
    timestamp: '10 минут назад',
    isRead: false,
    link: '/cabinet',
  },
  {
    id: 'notif-2',
    title: '📝 Лабораторная проверена',
    message: 'Ментор оценил вашу работу «Кастомный стор на Pinia» на Отлично (95/100). +200 XP начислено!',
    type: 'assignment',
    timestamp: '1 час назад',
    isRead: false,
    link: '/cabinet',
  },
  {
    id: 'notif-3',
    title: '🔥 Стрик активности продлён',
    message: 'Вы учитесь уже 4 дня подряд без единого пропуска. Рекорд близко!',
    type: 'warning',
    timestamp: 'Вчера',
    isRead: true,
    link: '/cabinet',
  },
  {
    id: 'notif-4',
    title: '👋 Добро пожаловать в LERN Codex',
    message: 'Изучайте курсы, тренируйте память в 3D Active Recall и экспериментируйте в песочнице кода!',
    type: 'info',
    timestamp: '2 дня назад',
    isRead: true,
  },
]

export const useNotificationStore = defineStore('notification', () => {
  // #region state
  const notifications = ref<AppNotification[]>([])
  const toasts = ref<ToastMessage[]>([])
  // #endregion state

  // #region init
  const loadNotifications = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        notifications.value = JSON.parse(raw)
      } else {
        notifications.value = [...INITIAL_NOTIFICATIONS]
        saveNotifications()
      }
    } catch {
      notifications.value = [...INITIAL_NOTIFICATIONS]
    }
  }

  const saveNotifications = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (e) {
      console.error('Ошибка сохранения уведомлений:', e)
    }
  }

  loadNotifications()
  // #endregion init

  // #region computed
  const unreadCount = computed<number>(() => {
    return notifications.value.filter((n) => !n.isRead).length
  })

  const sortedNotifications = computed<AppNotification[]>(() => {
    return [...notifications.value].reverse()
  })
  // #endregion computed

  // #region actions
  const addToast = (payload: {
    title: string
    message: string
    type?: 'success' | 'info' | 'warning' | 'error'
    duration?: number
  }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const duration = payload.duration ?? 4000
    const newToast: ToastMessage = {
      id,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'info',
      duration,
    }

    toasts.value.push(newToast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const addNotification = (payload: {
    title: string
    message: string
    type: NotificationType
    link?: string
    showToast?: boolean
  }) => {
    const id = `notif-${Date.now()}`
    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newNotif: AppNotification = {
      id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      timestamp: `Сегодня, ${timestamp}`,
      isRead: false,
      link: payload.link,
    }

    notifications.value.unshift(newNotif)
    saveNotifications()

    if (payload.showToast !== false) {
      let toastType: 'success' | 'info' | 'warning' | 'error' = 'info'
      if (payload.type === 'achievement' || payload.type === 'success') toastType = 'success'
      else if (payload.type === 'warning') toastType = 'warning'
      else if (payload.type === 'error') toastType = 'error'

      addToast({
        title: payload.title,
        message: payload.message,
        type: toastType,
      })
    }
  }

  const markAsRead = (id: string) => {
    const target = notifications.value.find((n) => n.id === id)
    if (target) {
      target.isRead = true
      saveNotifications()
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      n.isRead = true
    })
    saveNotifications()
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
    saveNotifications()
  }

  const clearAllNotifications = () => {
    notifications.value = []
    saveNotifications()
  }
  // #endregion actions

  return {
    notifications,
    toasts,
    unreadCount,
    sortedNotifications,
    addToast,
    removeToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  }
})
