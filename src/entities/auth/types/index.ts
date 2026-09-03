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
  role: 'student' | 'teacher'
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
    role: string
  }
  errorMessage?: string
}
