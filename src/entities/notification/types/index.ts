export type NotificationType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'achievement'
  | 'quiz'
  | 'assignment'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  isRead: boolean
  link?: string
}

export interface ToastMessage {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}
