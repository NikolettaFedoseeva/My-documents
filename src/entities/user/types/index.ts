export type UserRole = 'student' | 'teacher' | 'admin' | 'guest'
export type UserStatus = 'online' | 'busy' | 'offline'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  status: UserStatus
  unreadNotificationsCount: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
}
