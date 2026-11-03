import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { FakeDb } from './fake-supabase'

/** Подмена клиента БД на in-memory (вызывать через jest.mock в начале теста) */
export const getDb = (): FakeDb => require('../../../src/config/supabase').supabaseAdmin as FakeDb

export const TEST_PASSWORD = 'password123'

export const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'usr-student-1',
  email: 'student@lern.ru',
  name: 'Студент',
  role: 'student',
  status: 'online',
  is_banned: false,
  xp: 100,
  level: 1,
  unread_notifications_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  password_hash: bcrypt.hashSync(TEST_PASSWORD, 4),
  ...overrides,
})

export const seedDefaultUsers = (): void => {
  getDb().seed('users', [
    makeUser(),
    makeUser({ id: 'usr-admin-1', email: 'admin@lern.ru', name: 'Админ', role: 'admin' }),
    makeUser({ id: 'usr-author-1', email: 'author@lern.ru', name: 'Автор', role: 'author' }),
    makeUser({ id: 'usr-teacher-1', email: 'teacher@lern.ru', name: 'Учитель', role: 'teacher' }),
  ])
}

/** Выпускает токен так же, как это делает сервер */
export const tokenFor = (userId: string, role = 'student', email = 'x@lern.ru'): string =>
  jwt.sign({ userId, email, role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })

export const bearer = (token: string): { Authorization: string } => ({ Authorization: `Bearer ${token}` })
