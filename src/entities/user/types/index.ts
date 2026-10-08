export type UserRole = 'guest' | 'student' | 'author' | 'teacher' | 'admin'
export type UserStatus = 'online' | 'busy' | 'offline'

export type Permission =
  | 'view_courses'
  | 'study_courses'
  | 'create_courses'
  | 'edit_own_courses'
  | 'manage_all_courses'
  | 'manage_users'
  | 'access_admin_panel'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  status: UserStatus
  unreadNotificationsCount: number
  xp?: number
  level?: number
}

export interface RoleInfo {
  role: UserRole
  name: string
  icon: string
  description: string
  badgeVariant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple'
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
}
