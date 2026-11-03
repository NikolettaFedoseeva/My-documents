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

describe('CORS', () => {
  test('чужой origin → 403, а не 500', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://evil.com')
    expect(res.status).toBe(403)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  test('разрешённый origin проходит и получает заголовок', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:1000')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:1000')
  })

  test('origin, похожий на разрешённый, не проходит', async () => {
    for (const origin of ['http://localhost:1000.evil.com', 'https://localhost:1000', 'http://localhost:10000']) {
      expect((await request(app).get('/api/health').set('Origin', origin)).status).toBe(403)
    }
  })

  test('запрос без Origin (curl, сервер-сервер) проходит', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200)
  })

  test('preflight с чужого origin отклоняется', async () => {
    const res = await request(app)
      .options('/api/users')
      .set('Origin', 'http://evil.com')
      .set('Access-Control-Request-Method', 'DELETE')
    expect(res.status).toBe(403)
  })
})

describe('заголовки и ошибки', () => {
  test('helmet выставляет защитные заголовки, x-powered-by скрыт', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  test('неизвестный маршрут API → 404 в JSON', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  test('битый JSON → 400', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email": ')
    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toContain('JSON')
  })

  test('слишком большое тело → 413', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a'.repeat(3 * 1024 * 1024) })
    expect(res.status).toBe(413)
  })
})

describe('поиск пользователей', () => {
  const admin = () => bearer(tokenFor('usr-admin-1', 'admin'))

  test('символы фильтра PostgREST вырезаются из поискового запроса', async () => {
    await request(app).get('/api/users').query({ search: 'a,role.eq.admin),(x' }).set(admin())
    const filter = getDb().orFilters.at(-1) as string
    expect(filter).not.toMatch(/[(),]\w*role\.eq/)
    // в части с шаблоном не должно остаться скобок и лишних запятых, кроме разделителя двух условий
    const [nameCond, emailCond] = filter.split(',email.')
    expect(nameCond).not.toMatch(/[()]/)
    expect(emailCond).not.toMatch(/[(),]/)
  })

  test('поиск по кириллице и email сохраняется', async () => {
    await request(app).get('/api/users').query({ search: 'Иван@mail.ru' }).set(admin())
    expect(getDb().orFilters.at(-1)).toContain('Иван@mail.ru')
  })

  test('слишком длинный запрос обрезается', async () => {
    await request(app).get('/api/users').query({ search: 'x'.repeat(500) }).set(admin())
    expect((getDb().orFilters.at(-1) as string).length).toBeLessThan(200)
  })

  test('массив в параметре search не ломает сервер', async () => {
    const res = await request(app).get('/api/users?search=a&search=b').set(admin())
    expect(res.status).toBe(200)
  })
})
