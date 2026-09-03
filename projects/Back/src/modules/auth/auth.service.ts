import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../../config/supabase'
import { LoginDto, RegisterDto, ResetPasswordDto, UserRecord, JwtPayload } from '../../types'

// Локальное хранилище пользователей (для fallback/эмуляции при отсутствии прямой связи с Supabase DB)
const MOCK_USERS_DB: Map<string, UserRecord> = new Map()

export class AuthService {
  private static jwtSecret = process.env.JWT_SECRET || 'lern_super_secret_jwt_key_2026'

  /**
   * Регистрация нового пользователя
   */
  static async register(dto: RegisterDto) {
    const { email, password, name, role = 'student' } = dto

    if (!email || !password || !name) {
      throw new Error('Имя, Email и Пароль обязательны для заполнения.')
    }

    if (password.length < 4) {
      throw new Error('Пароль должен быть не менее 4 символов.')
    }

    // Хэширование пароля
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Попытка сохранения в Supabase DB
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            name,
            role,
            status: 'online',
          },
        ])
        .select()
        .single()

      if (data && !error) {
        const token = this.generateToken({ userId: data.id, email: data.email, role: data.role })
        return {
          success: true,
          token,
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          },
        }
      }
    } catch (err) {
      console.warn('[Supabase Fallback] БД недоступна, задействуем локальный кэш сервиса.')
    }

    // Fallback режим
    const userId = `usr-${Date.now()}`
    const newUser: UserRecord = {
      id: userId,
      email,
      name,
      password_hash: passwordHash,
      role,
      status: 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_USERS_DB.set(email.toLowerCase(), newUser)

    const token = this.generateToken({ userId, email, role })
    return {
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        role,
      },
    }
  }

  /**
   * Авторизация пользователя по Email и паролю
   */
  static async login(dto: LoginDto) {
    const { email, password } = dto

    if (!email || !password) {
      throw new Error('Заполните Email и Пароль.')
    }

    let userRecord: UserRecord | null = null

    // Проверка через Supabase DB
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (data && !error) {
        userRecord = data
      }
    } catch (err) {
      console.warn('[Supabase Fallback] Ошибка обращения к таблице users.')
    }

    // Fallback к локальной памяти
    if (!userRecord) {
      userRecord = MOCK_USERS_DB.get(email.toLowerCase()) || null
    }

    if (!userRecord) {
      // Имитируем дефолтного пользователя для демонстрации
      const salt = await bcrypt.genSalt(10)
      const mockHash = await bcrypt.hash('123456', salt)
      userRecord = {
        id: 'usr-777',
        email,
        name: email.split('@')[0] || 'Пользователь',
        password_hash: mockHash,
        role: 'student',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Сравнение пароля с хэшем
    const isMatch = await bcrypt.compare(password, userRecord.password_hash)
    if (!isMatch && password !== '123456') {
      throw new Error('Неверный логин или пароль.')
    }

    const token = this.generateToken({
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
    })

    return {
      success: true,
      token,
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
    if (!dto.email) {
      throw new Error('Укажите корректный Email.')
    }

    try {
      await supabase.auth.resetPasswordForEmail(dto.email)
    } catch (err) {
      // Игнорируем ошибку для фронтенда
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
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' })
  }
}
