import { Router, Response } from 'express'
import { AssignmentsService } from './assignments.service'
import { authMiddleware, requireRoles, AuthenticatedRequest } from '../../middlewares/auth.middleware'

export const assignmentsRouter = Router()

assignmentsRouter.use(authMiddleware)

// Получить все задания текущего пользователя
assignmentsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const items = await AssignmentsService.getUserAssignments(userId)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

// Отправить решение задания
assignmentsRouter.post('/:id/submit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { repoUrl, code, notes } = req.body
    const updated = await AssignmentsService.submitAssignment(userId, req.params.id, {
      repoUrl,
      code,
      notes,
    })
    res.json({ success: true, assignment: updated })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

// Оценить задание ментором
assignmentsRouter.patch('/:id/grade', requireRoles('admin', 'teacher', 'author'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = typeof req.body.userId === 'string' && req.body.userId ? req.body.userId : req.user!.userId
    const { status, score, comment, reviewerName } = req.body
    if (status !== 'passed' && status !== 'rejected') {
      return res.status(400).json({ success: false, errorMessage: 'Статус должен быть passed или rejected.' })
    }
    const updated = await AssignmentsService.gradeAssignment(userId, req.params.id, {
      status,
      score: Math.min(100, Math.max(0, Number(score) || 0)),
      comment: comment || 'Работа проверена.',
      reviewerName,
    })
    res.json({ success: true, assignment: updated })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
