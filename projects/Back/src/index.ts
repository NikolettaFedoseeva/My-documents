import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { authRouter } from './modules/auth/auth.controller'

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
    message: 'Lern Platform Backend API Server active 🚀',
    supabaseUrl: process.env.SUPABASE_URL,
    timestamp: new Date().toISOString(),
  })
})

// Подключение роутера авторизации
app.use('/api/auth', authRouter)

app.get('/api/topics', (req, res) => {
  res.json([
    { id: 'topic-1', title: 'watch и watchEffect', section: 'Vue 3', progress: 62 },
    { id: 'topic-2', title: 'Введение в Composition API', section: 'Vue 3', progress: 100 },
    { id: 'topic-3', title: 'Глубокое наблюдение', section: 'Vue 3', progress: 25 },
  ])
})

app.listen(PORT, () => {
  console.log(`🚀 Lern Backend API Server running at http://localhost:${PORT}`)
})