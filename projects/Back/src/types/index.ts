export type UserRole = 'student' | 'teacher' | 'admin' | 'guest'
export type UserStatus = 'online' | 'busy' | 'offline'

export interface UserRecord {
  id: string
  email: string
  name: string
  password_hash: string
  role: UserRole
  status: UserStatus
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface ResetPasswordDto {
  email: string
}
