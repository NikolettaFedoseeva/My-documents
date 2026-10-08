export type AuthMode = 'login' | 'register' | 'forgot'

export interface LoginPayload {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'student' | 'author' | 'teacher'
}

export interface ResetPasswordPayload {
  email: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    name: string
    email: string
    role: import('@/entities/user').UserRole
    avatar?: string
    xp?: number
    level?: number
  }
  errorMessage?: string
}
