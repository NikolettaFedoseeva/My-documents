import jwt from 'jsonwebtoken'
import request from 'supertest'
import { app } from '../../src/app'
import { bearer, getDb, seedDefaultUsers, tokenFor } from './helpers/test-app'

jest.mock('../../src/config/supabase', () => {
  const { createFakeSupabase } = require('./helpers/fake-supabase')
  const db = createFakeSupabase()
  return { supabaseAdmin: db, supabase: db }
})

beforeEach(() => {
  getDb().reset()
  seedDefaultUsers()
})

const student = () => bearer(tokenFor('usr-student-1', 'student'))
const admin = () => bearer(tokenFor('usr-admin-1', 'admin'))
const author = () => bearer(tokenFor('usr-author-1', 'author'))
const teacher = () => bearer(tokenFor('usr-teacher-1', 'teacher'))

describe('authMiddleware: проверка токена', () => {
  test('нет заголовка → 401', async () => {
    expect((await request(app).get('/api/users')).status).toBe(401)
  })

  test('схема не Bearer → 401', async () => {
    const res = await request(app).get('/api/users').set('Authorization', 'Basic abc')
    expect(res.status).toBe(401)
  })

  test('мусорный токен → 401', async () => {
    expect((await request(app).get('/api/users').set(bearer('not.a.jwt'))).status).toBe(401)
  })

  test('токен, подписанный чужим секретом → 401', async () => {
    const forged = jwt.sign({ userId: 'usr-admin-1', email: 'a@b.ru', role: 'admin' }, 'another-secret-another-secret-12345')
    expect((await request(app).get('/api/users').set(bearer(forged))).status).toBe(401)
  })

  test('токен без подписи (alg: none) → 401', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ userId: 'usr-admin-1', role: 'admin' })).toString('base64url')
    expect((await request(app).get('/api/users').set(bearer(`${header}.${payload}.`))).status).toBe(401)
  })

  test('просроченный токен → 401', async () => {
    const expired = jwt.sign({ userId: 'usr-admin-1', email: 'a@b.ru', role: 'admin' }, process.env.JWT_SECRET as string, {
      expiresIn: -10,
    })
    expect((await request(app).get('/api/users').set(bearer(expired))).status).toBe(401)
  })
})

describe('authMiddleware: сверка с базой', () => {
  test('роль берётся из БД, а не из токена: студент с токеном «admin» остаётся студентом', async () => {
    const res = await request(app).get('/api/users').set(bearer(tokenFor('usr-student-1', 'admin')))
    expect(res.status).toBe(403)
  })

  test('заблокированный пользователь теряет доступ сразу, с ещё действующим токеном', async () => {
    const headers = admin()
    expect((await request(app).get('/api/users').set(headers)).status).toBe(200)
    getDb().tables.users.find((u) => u.id === 'usr-admin-1')!.is_banned = true
    expect((await request(app).get('/api/users').set(headers)).status).toBe(403)
  })

  test('удалённый пользователь → 401', async () => {
    getDb().tables.users = getDb().tables.users.filter((u) => u.id !== 'usr-student-1')
    expect((await request(app).get('/api/progress/me').set(student())).status).toBe(401)
  })

  test('разжалованный админ сразу теряет права', async () => {
    const headers = admin()
    getDb().tables.users.find((u) => u.id === 'usr-admin-1')!.role = 'student'
    expect((await request(app).get('/api/users').set(headers)).status).toBe(403)
  })

  test('сбой БД → 503, а не пропуск запроса', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const headers = admin()
    getDb().failWith = { message: 'boom' }
    expect((await request(app).get('/api/users').set(headers)).status).toBe(503)
  })
})

describe('матрица прав: пользователи', () => {
  test.each([
    ['без токена', {}, 401],
    ['студент', null, 403],
    ['автор', null, 403],
    ['админ', null, 200],
  ])('GET /users: %s', async (label, headers, expected) => {
    const h = headers ?? { студент: student(), автор: author(), админ: admin() }[label as string]
    const res = await request(app).get('/api/users').set(h as Record<string, string>)
    expect(res.status).toBe(expected)
  })

  test('студент читает свой профиль, но не чужой', async () => {
    expect((await request(app).get('/api/users/usr-student-1').set(student())).status).toBe(200)
    expect((await request(app).get('/api/users/usr-admin-1').set(student())).status).toBe(403)
  })

  test('админ читает любой профиль', async () => {
    expect((await request(app).get('/api/users/usr-student-1').set(admin())).status).toBe(200)
  })

  test('студент правит свой профиль, но не чужой', async () => {
    const own = await request(app).patch('/api/users/usr-student-1/profile').set(student()).send({ name: 'Новое имя' })
    expect(own.status).toBe(200)
    const other = await request(app).patch('/api/users/usr-admin-1/profile').set(student()).send({ name: 'Взлом' })
    expect(other.status).toBe(403)
    expect(getDb().tables.users.find((u) => u.id === 'usr-admin-1')!.name).toBe('Админ')
  })

  test('профиль через PATCH не меняет роль, даже если её передали', async () => {
    await request(app).patch('/api/users/usr-student-1/profile').set(student()).send({ name: 'Х', role: 'admin', is_banned: false })
    expect(getDb().tables.users.find((u) => u.id === 'usr-student-1')!.role).toBe('student')
  })

  test('студент не меняет себе роль, не банит и не удаляет', async () => {
    expect((await request(app).patch('/api/users/usr-student-1/role').set(student()).send({ role: 'admin' })).status).toBe(403)
    expect((await request(app).patch('/api/users/usr-admin-1/ban').set(student()).send({ isBanned: true })).status).toBe(403)
    expect((await request(app).delete('/api/users/usr-admin-1').set(student())).status).toBe(403)
    expect(getDb().tables.users).toHaveLength(4)
  })

  test('админ меняет роль другому пользователю', async () => {
    const res = await request(app).patch('/api/users/usr-student-1/role').set(admin()).send({ role: 'author' })
    expect(res.status).toBe(200)
    expect(getDb().tables.users.find((u) => u.id === 'usr-student-1')!.role).toBe('author')
  })

  test.each(['superuser', '', undefined, 'ADMIN'])('недопустимая роль %p отклоняется', async (role) => {
    const res = await request(app).patch('/api/users/usr-student-1/role').set(admin()).send({ role })
    expect(res.status).toBe(400)
    expect(getDb().tables.users.find((u) => u.id === 'usr-student-1')!.role).toBe('student')
  })

  test('админ не может изменить роль, заблокировать или удалить самого себя', async () => {
    expect((await request(app).patch('/api/users/usr-admin-1/role').set(admin()).send({ role: 'student' })).status).toBe(400)
    expect((await request(app).patch('/api/users/usr-admin-1/ban').set(admin()).send({ isBanned: true })).status).toBe(400)
    expect((await request(app).delete('/api/users/usr-admin-1').set(admin())).status).toBe(400)
    expect(getDb().tables.users.some((u) => u.id === 'usr-admin-1')).toBe(true)
  })

  test('админ банит и удаляет другого пользователя', async () => {
    expect((await request(app).patch('/api/users/usr-student-1/ban').set(admin()).send({ isBanned: true })).status).toBe(200)
    expect(getDb().tables.users.find((u) => u.id === 'usr-student-1')!.is_banned).toBe(true)
    expect((await request(app).delete('/api/users/usr-student-1').set(admin())).status).toBe(200)
    expect(getDb().tables.users.some((u) => u.id === 'usr-student-1')).toBe(false)
  })

  test('ответы не содержат password_hash', async () => {
    const list = await request(app).get('/api/users').set(admin())
    const one = await request(app).get('/api/users/usr-student-1').set(admin())
    const role = await request(app).patch('/api/users/usr-student-1/role').set(admin()).send({ role: 'author' })
    for (const res of [list, one, role]) {
      expect(JSON.stringify(res.body)).not.toContain('password_hash')
    }
  })
})

describe('матрица прав: курсы', () => {
  test.each([
    ['POST /courses/import', 'post', '/api/courses/import'],
    ['POST /courses', 'post', '/api/courses'],
    ['PUT /courses/x', 'put', '/api/courses/x'],
    ['POST /courses/docs', 'post', '/api/courses/docs'],
    ['PUT /courses/docs/x', 'put', '/api/courses/docs/x'],
    ['POST /courses/categories', 'post', '/api/courses/categories'],
  ] as const)('%s: без токена 401, студенту 403', async (_name, method, path) => {
    expect((await request(app)[method](path).send({})).status).toBe(401)
    expect((await request(app)[method](path).set(student()).send({})).status).toBe(403)
  })

  test.each([
    ['DELETE /courses/x', '/api/courses/x'],
    ['DELETE /courses/docs/x', '/api/courses/docs/x'],
    ['DELETE /courses/categories/x', '/api/courses/categories/x'],
  ])('%s: только админ (автору 403)', async (_name, path) => {
    expect((await request(app).delete(path)).status).toBe(401)
    expect((await request(app).delete(path).set(student())).status).toBe(403)
    expect((await request(app).delete(path).set(author())).status).toBe(403)
  })

  test('автору импорт курса разрешён (проходит авторизацию и упирается лишь в пустые данные)', async () => {
    const res = await request(app).post('/api/courses/import').set(author()).send({})
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('Данные курса')
  })

  test('чтение курсов публично', async () => {
    getDb().seed('courses', [])
    getDb().seed('categories', [])
    expect((await request(app).get('/api/courses')).status).toBe(200)
  })
})

describe('матрица прав: задания и прогресс', () => {
  test('оценка задания: студенту 403, без токена 401', async () => {
    expect((await request(app).patch('/api/assignments/a1/grade').send({ status: 'passed' })).status).toBe(401)
    expect((await request(app).patch('/api/assignments/a1/grade').set(student()).send({ status: 'passed' })).status).toBe(403)
  })

  test.each([
    ['учитель', teacher],
    ['автор', author],
    ['админ', admin],
  ])('оценка задания: %s проходит авторизацию', async (_name, who) => {
    const res = await request(app).patch('/api/assignments/a1/grade').set(who()).send({ status: 'weird' })
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('passed')
  })

  test('задания и прогресс требуют входа', async () => {
    expect((await request(app).get('/api/assignments')).status).toBe(401)
    expect((await request(app).get('/api/progress/me')).status).toBe(401)
    expect((await request(app).post('/api/progress/xp').send({ amount: 10 })).status).toBe(401)
  })

  test('прогресс привязан к пользователю из токена, а не из тела запроса', async () => {
    const res = await request(app).get('/api/progress/me').set(student())
    expect(res.body.userId).toBe('usr-student-1')
  })
})

describe('начисление XP', () => {
  const addXp = (amount: unknown) => request(app).post('/api/progress/xp').set(student()).send({ amount })

  test('обычное начисление', async () => {
    const res = await addXp(30)
    expect(res.body.xp).toBe(130)
  })

  test('огромное значение ограничено 100 за запрос', async () => {
    const res = await addXp(999999)
    expect(res.body.xp).toBe(200)
  })

  test.each([-50, 0, 'abc', null, NaN, Infinity])('значение %p не меняет XP', async (amount) => {
    const res = await addXp(amount)
    expect(res.body.xp).toBe(100)
  })

  test('дробное значение округляется вниз', async () => {
    expect((await addXp(10.9)).body.xp).toBe(110)
  })
})
