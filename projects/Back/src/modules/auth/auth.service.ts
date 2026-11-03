import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase, supabaseAdmin } from '../../config/supabase'
import { env } from '../../config/env'
import { LoginDto, RegisterDto, ResetPasswordDto, UserRecord, JwtPayload, UserRole } from '../../types'

/** Роли, которые пользователь может выбрать сам при регистрации. admin/teacher назначаются только администратором. */
const SELF_REGISTER_ROLES: readonly UserRole[] = ['student', 'author']

const MIN_PASSWORD_LENGTH = 8
const BCRYPT_ROUNDS = 10
/** Код ошибки PostgreSQL «нарушение уникальности» */
const PG_UNIQUE_VIOLATION = '23505'

const normalizeEmail = (email: string): string => email.trim().toLowerCase()

export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static async register(dto: RegisterDto) {
    const name = (dto.name || '').trim()
    const email = normalizeEmail(dto.email || '')
    const password = dto.password || ''

    if (!email || !password || !name) {
      throw new Error('Имя, Email и Пароль обязательны для заполнения.')
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Пароль должен быть не менее ${MIN_PASSWORD_LENGTH} символов.`)
    }

    // Роль из запроса не доверяется: допускаем только безопасный белый список
    const requestedRole: UserRole = dto.role === 'teacher' ? 'author' : dto.role || 'student'
    const role: UserRole = SELF_REGISTER_ROLES.includes(requestedRole) ? requestedRole : 'student'

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash: passwordHash, name, role, status: 'online' }])
      .select()
      .single()

    if (error || !data) {
      if (error?.code === PG_UNIQUE_VIOLATION) {
        throw new Error('Пользователь с таким Email уже зарегистрирован.')
      }
      console.error('[AuthService.register] Ошибка БД:', error?.message)
      throw new Error('Не удалось создать аккаунт. Попробуйте позже.')
    }

    return {
      success: true,
      token: this.generateToken({ userId: data.id, email: data.email, role: data.role }),
      user: { id: data.id, name: data.name, email: data.email, role: data.role },
    }
  }

  /**
   * Авторизация пользователя по Email и паролю
   */
  static async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email || '')
    const password = dto.password || ''

    if (!email || !password) {
      throw new Error('Заполните Email и Пароль.')
    }

    const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).maybeSingle()

    if (error) {
      console.error('[AuthService.login] Ошибка БД:', error.message)
      throw new Error('Не удалось выполнить вход. Попробуйте позже.')
    }

    const userRecord = data as (UserRecord & { is_banned?: boolean }) | null

    // Одинаковое сообщение для «нет пользователя» и «неверный пароль» — не раскрываем, какие email существуют
    const isMatch = userRecord ? await bcrypt.compare(password, userRecord.password_hash) : false
    if (!userRecord || !isMatch) {
      throw new Error('Неверный логин или пароль.')
    }

    if (userRecord.is_banned) {
      throw new Error('Учетная запись заблокирована администратором системы.')
    }

    return {
      success: true,
      token: this.generateToken({ userId: userRecord.id, email: userRecord.email, role: userRecord.role }),
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
      },
    }
  }

  /**
   * Восстановление пароля
   */
  static async resetPassword(dto: ResetPasswordDto) {
    const email = normalizeEmail(dto.email || '')
    if (!email) {
      throw new Error('Укажите корректный Email.')
    }

    try {
      await supabase.auth.resetPasswordForEmail(email)
    } catch (err) {
      // Ошибку не раскрываем клиенту, чтобы нельзя было перебирать существующие email
    }

    return {
      success: true,
      message: 'Если такой Email существует, мы отправили инструкцию по сбросу пароля.',
    }
  }

  /**
   * Генерация JWT токена
   */
  private static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
  }
}
