import { Router, Response } from 'express'
import { AssignmentsService } from './assignments.service'
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware'

export const assignmentsRouter = Router()

assignmentsRouter.use(authMiddleware)

// Получить все задания текущего пользователя
assignmentsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr-student-1'
    const items = await AssignmentsService.getUserAssignments(userId)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

// Отправить решение задания
assignmentsRouter.post('/:id/submit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr-student-1'
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
assignmentsRouter.patch('/:id/grade', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.body.userId || req.user?.userId || 'usr-student-1'
    const { status, score, comment, reviewerName } = req.body
    const updated = await AssignmentsService.gradeAssignment(userId, req.params.id, {
      status,
      score: Number(score) || 0,
      comment: comment || 'Работа проверена.',
      reviewerName,
    })
    res.json({ success: true, assignment: updated })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
