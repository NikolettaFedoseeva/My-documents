import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { authRouter } from './modules/auth/auth.controller'
import { usersRouter } from './modules/users/users.controller'
import { coursesRouter } from './modules/courses/courses.controller'
import { progressRouter } from './modules/progress/progress.controller'
import { assignmentsRouter } from './modules/assignments/assignments.controller'

/** Ошибка запрета CORS (отдельный класс, чтобы отвечать 403, а не 500) */
export class CorsDeniedError extends Error {
  constructor(origin: string) {
    super(`Origin ${origin} не разрешён политикой CORS`)
  }
}

export const app = express()

if (env.trustProxy) {
  app.set('trust proxy', 1)
}
app.disable('x-powered-by')

app.use(helmet())

// CORS: разрешены только origin-ы из белого списка (CORS_ORIGIN)
app.use(
  cors({
    origin: (origin, callback) => {
      // Запросы без Origin (curl, server-to-server) пропускаем, браузерные — только из белого списка
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new CorsDeniedError(origin))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Подключение роутеров API
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/progress', progressRouter)
app.use('/api/assignments', assignmentsRouter)

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, errorMessage: 'Маршрут не найден.' })
})

// Единый обработчик ошибок: в продакшене внутренние сообщения клиенту не отдаём
app.use((err: Error & { status?: number; type?: string }, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CorsDeniedError) {
    return res.status(403).json({ success: false, errorMessage: 'Источник запроса не разрешён.' })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, errorMessage: 'Некорректный JSON в теле запроса.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, errorMessage: 'Слишком большой запрос.' })
  }
  console.error('[server] Необработанная ошибка:', err)
  res.status(500).json({
    success: false,
    errorMessage: env.isProduction ? 'Внутренняя ошибка сервера.' : err.message,
  })
})
