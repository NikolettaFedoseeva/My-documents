import request from 'supertest'
import { app } from '../../src/app'
import { getDb, seedDefaultUsers, TEST_PASSWORD } from './helpers/test-app'

jest.mock('../../src/config/supabase', () => {
  const { createFakeSupabase } = require('./helpers/fake-supabase')
  const db = createFakeSupabase()
  return { supabaseAdmin: db, supabase: db }
})

// Лимитеры хранят счётчики в памяти модуля, поэтому этот файл тестирует их отдельно от остальных
beforeEach(() => {
  getDb().reset()
  seedDefaultUsers()
})

describe('лимиты запросов', () => {
  test('успешные входы не расходуют лимит неудачных попыток', async () => {
    for (let i = 0; i < 12; i++) {
      const res = await request(app).post('/api/auth/login').send({ email: 'student@lern.ru', password: TEST_PASSWORD })
      expect(res.status).toBe(200)
    }
  })

  test('11-я неудачная попытка входа блокируется с 429, и верный пароль уже не помогает', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post('/api/auth/login').send({ email: 'admin@lern.ru', password: `wrong-${i}` })
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 10).every((s) => s === 400)).toBe(true)
    expect(statuses[10]).toBe(429)

    const correct = await request(app).post('/api/auth/login').send({ email: 'admin@lern.ru', password: TEST_PASSWORD })
    expect(correct.status).toBe(429)
    expect(correct.body.success).toBe(false)
  })

  test('регистрация ограничена 10 попытками в час', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Т', email: `bulk${i}@lern.ru`, password: TEST_PASSWORD })
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 10).every((s) => s === 201)).toBe(true)
    expect(statuses[10]).toBe(429)
  })

  test('сброс пароля ограничен 5 запросами в час', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'student@lern.ru' })
      statuses.push(res.status)
    }
    expect(statuses[5]).toBe(429)
    expect(statuses.slice(0, 5).every((s) => s !== 429)).toBe(true)
  })
})
