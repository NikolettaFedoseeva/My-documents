import { Router, Response } from 'express'
import { ProgressService } from './progress.service'
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware'

export const progressRouter = Router()

/** Максимум XP за один запрос: ограничивает накрутку (по-хорошему начисление должно считаться на сервере) */
const MAX_XP_PER_REQUEST = 100

const clampXpAmount = (raw: unknown): number => {
  const amount = Math.floor(Number(raw))
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.min(amount, MAX_XP_PER_REQUEST)
}

progressRouter.use(authMiddleware)

progressRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, errorMessage: 'Не авторизован' })
    const progress = await ProgressService.getUserProgress(userId)
    res.json(progress)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

progressRouter.post('/toggle-chapter', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, errorMessage: 'Не авторизован' })
    const result = await ProgressService.toggleChapterCompleted(userId, req.body.chapterId)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

progressRouter.post('/xp', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, errorMessage: 'Не авторизован' })
    const result = await ProgressService.addBonusXp(userId, clampXpAmount(req.body.amount))
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

progressRouter.post('/master-flashcard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, errorMessage: 'Не авторизован' })
    const result = await ProgressService.masterFlashcard(userId, req.body.flashcardId)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
