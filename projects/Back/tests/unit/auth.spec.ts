import request from 'supertest'
import { app } from '../../src/app'
import { bearer, getDb, seedDefaultUsers, TEST_PASSWORD } from './helpers/test-app'

jest.mock('../../src/config/supabase', () => {
  const { createFakeSupabase } = require('./helpers/fake-supabase')
  const db = createFakeSupabase()
  return { supabaseAdmin: db, supabase: db }
})

// Лимиты запросов здесь отключены (их проверяет rate-limit.spec.ts), иначе серия регистраций упрётся в 429
jest.mock('../../src/middlewares/rate-limit', () => {
  const pass = (_req: unknown, _res: unknown, next: () => void) => next()
  return { loginLimiter: pass, registerLimiter: pass, forgotPasswordLimiter: pass }
})

beforeEach(() => {
  getDb().reset()
  seedDefaultUsers()
})

describe('POST /api/auth/register', () => {
  const valid = { name: 'Новый', email: 'new@lern.ru', password: TEST_PASSWORD }

  test('создаёт студента и возвращает токен без хеша пароля', async () => {
    const res = await request(app).post('/api/auth/register').send(valid)
    expect(res.status).toBe(201)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({ email: 'new@lern.ru', role: 'student' })
    expect(JSON.stringify(res.body)).not.toContain('password')
  })

  test.each(['admin', 'teacher', 'superuser', '', null])('роль %p при регистрации не даёт привилегий', async (role) => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, role })
    const expected = role === 'teacher' ? 'author' : 'student'
    expect(res.body.user.role).toBe(expected)
  })

  test('роль author разрешена', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, role: 'author' })
    expect(res.body.user.role).toBe('author')
  })

  test('пароль короче 8 символов отклоняется', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, password: '1234567' })
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('8')
  })

  test('обязательные поля', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.ru' })
    expect(res.status).toBe(400)
  })

  test('дубликат email (в том числе в другом регистре) отклоняется', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, email: '  STUDENT@lern.ru ' })
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('уже зарегистрирован')
  })

  test('email нормализуется (пробелы и регистр)', async () => {
    await request(app).post('/api/auth/register').send({ ...valid, email: '  MiXed@Lern.RU ' })
    expect(getDb().tables.users.some((u) => u.email === 'mixed@lern.ru')).toBe(true)
  })

  test('в БД сохраняется bcrypt-хеш, а не пароль', async () => {
    await request(app).post('/api/auth/register').send(valid)
    const stored = getDb().tables.users.find((u) => u.email === 'new@lern.ru')
    expect(stored?.password_hash).toMatch(/^\$2[aby]\$/)
    expect(stored?.password_hash).not.toContain(TEST_PASSWORD)
  })
})

describe('POST /api/auth/login', () => {
  const login = (email: string, password: string) => request(app).post('/api/auth/login').send({ email, password })

  test('верные данные → токен', async () => {
    const res = await login('student@lern.ru', TEST_PASSWORD)
    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({ id: 'usr-student-1', role: 'student' })
  })

  test('email не чувствителен к регистру и пробелам', async () => {
    expect((await login('  Student@LERN.ru ', TEST_PASSWORD)).status).toBe(200)
  })

  test('старый бэкдор 123456 не работает ни для одного аккаунта', async () => {
    for (const email of ['student@lern.ru', 'admin@lern.ru']) {
      expect((await login(email, '123456')).status).toBe(400)
    }
  })

  test('неизвестный email не создаёт пользователя и не пускает', async () => {
    const before = getDb().tables.users.length
    const res = await login('ghost@lern.ru', 'whatever123')
    expect(res.status).toBe(400)
    expect(getDb().tables.users).toHaveLength(before)
  })

  test('сообщение одинаково для неверного пароля и несуществующего email', async () => {
    const wrongPass = await login('student@lern.ru', 'wrong-password')
    const noUser = await login('ghost@lern.ru', 'wrong-password')
    expect(wrongPass.body.errorMessage).toBe(noUser.body.errorMessage)
  })

  test('заблокированный пользователь не входит, даже с верным паролем', async () => {
    getDb().tables.users.find((u) => u.id === 'usr-student-1')!.is_banned = true
    const res = await login('student@lern.ru', TEST_PASSWORD)
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('заблокирована')
  })

  test('пустые поля', async () => {
    expect((await login('', '')).status).toBe(400)
  })

  test('ошибка БД не раскрывается клиенту', async () => {
    getDb().failWith = { message: 'connection to 10.0.0.5 refused' }
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const res = await login('student@lern.ru', TEST_PASSWORD)
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.body)).not.toContain('10.0.0.5')
  })
})

describe('GET /api/auth/me', () => {
  test('без токена → 401', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401)
  })

  test('с токеном возвращает пользователя', async () => {
    const { body } = await request(app).post('/api/auth/login').send({ email: 'student@lern.ru', password: TEST_PASSWORD })
    const res = await request(app).get('/api/auth/me').set(bearer(body.token))
    expect(res.status).toBe(200)
    expect(res.body.user.userId).toBe('usr-student-1')
  })
})

describe('POST /api/auth/logout', () => {
  test('успешный выход', async () => {
    expect((await request(app).post('/api/auth/logout')).status).toBe(200)
  })

  test('вход не выставляет cookie с токеном', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'student@lern.ru', password: TEST_PASSWORD })
    expect(res.headers['set-cookie']).toBeUndefined()
  })
})
