import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lern Platform Backend API Server active 🚀' })
})

app.get('/api/topics', (req, res) => {
  res.json([
    { id: 'topic-1', title: 'watch и watchEffect', section: 'Vue 3', progress: 62 },
    { id: 'topic-2', title: 'Введение в Composition API', section: 'Vue 3', progress: 100 },
    { id: 'topic-3', title: 'Глубокое наблюдение', section: 'Vue 3', progress: 25 },
  ])
})

app.listen(PORT, () => {
  console.log(Backend API Server running at http://localhost:\)
})