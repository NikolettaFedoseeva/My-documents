import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { authRouter } from './modules/auth/auth.controller'
import { usersRouter } from './modules/users/users.controller'
import { coursesRouter } from './modules/courses/courses.controller'
import { progressRouter } from './modules/progress/progress.controller'
import { assignmentsRouter } from './modules/assignments/assignments.controller'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS Конфигурация для фронтенд микрофронтендов LERN
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:1000,http://localhost:8080').split(',')
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lern Platform Backend API Server active with Supabase Cloud DB 🚀',
    supabaseUrl: process.env.SUPABASE_URL,
    timestamp: new Date().toISOString(),
  })
})

// Подключение роутеров API
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/progress', progressRouter)
app.use('/api/assignments', assignmentsRouter)

app.listen(PORT, () => {
  console.log(`🚀 Lern Backend API Server running at http://localhost:${PORT}`)
  console.log(`☁️ Supabase Cloud DB: ${process.env.SUPABASE_URL}`)
})