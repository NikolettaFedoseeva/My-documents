import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/entities/notification/model/use-notification-store'

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  test('инициализируется с дефолтными уведомлениями', () => {
    const store = useNotificationStore()
    expect(store.notifications.length).toBeGreaterThan(0)
    expect(store.unreadCount).toBeGreaterThanOrEqual(0)
  })

  test('добавляет новое уведомление и увеличивает unreadCount', () => {
    const store = useNotificationStore()
    const initialUnread = store.unreadCount

    store.addNotification({
      title: 'Новый тест',
      message: 'Тестовое уведомление',
      type: 'achievement',
      showToast: false,
    })

    expect(store.unreadCount).toBe(initialUnread + 1)
    expect(store.notifications[0].title).toBe('Новый тест')
  })

  test('помечает все уведомления как прочитанные (markAllAsRead)', () => {
    const store = useNotificationStore()
    expect(store.unreadCount).toBeGreaterThan(0)

    store.markAllAsRead()
    expect(store.unreadCount).toBe(0)
  })

  test('удаляет выбранное уведомление', () => {
    const store = useNotificationStore()
    const countBefore = store.notifications.length
    const firstId = store.notifications[0].id

    store.removeNotification(firstId)
    expect(store.notifications.length).toBe(countBefore - 1)
    expect(store.notifications.find((n) => n.id === firstId)).toBeUndefined()
  })

  test('добавляет и удаляет всплывающий тост (Toast)', () => {
    const store = useNotificationStore()
    expect(store.toasts).toHaveLength(0)

    store.addToast({
      title: 'Успех',
      message: 'Операция выполнена',
      type: 'success',
      duration: 0,
    })

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].title).toBe('Успех')
    expect(store.toasts[0].type).toBe('success')

    store.removeToast(store.toasts[0].id)
    expect(store.toasts).toHaveLength(0)
  })
})
