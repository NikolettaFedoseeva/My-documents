import { Router, Request, Response } from 'express'
import { UsersService } from './users.service'
import {
  authMiddleware,
  requireRoles,
  requireSelfOrAdmin,
  AuthenticatedRequest,
} from '../../middlewares/auth.middleware'

export const usersRouter = Router()

// Все маршруты пользователей требуют входа
usersRouter.use(authMiddleware)

// Список пользователей — только администратору
usersRouter.get('/', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query
    const users = await UsersService.getAllUsers({
      search: typeof search === 'string' ? search : undefined,
      role: typeof role === 'string' ? role : undefined,
    })
    res.json(users)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

// Профиль — владельцу или администратору
usersRouter.get('/:id', requireSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const user = await UsersService.getUserById(req.params.id)
    res.json(user)
  } catch (err: any) {
    res.status(404).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.patch('/:id/role', requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.userId === req.params.id) {
    return res.status(400).json({ success: false, errorMessage: 'Нельзя изменить собственную роль.' })
  }
  try {
    const user = await UsersService.updateRole(req.params.id, req.body.role)
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.patch('/:id/ban', requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.userId === req.params.id) {
    return res.status(400).json({ success: false, errorMessage: 'Нельзя заблокировать самого себя.' })
  }
  try {
    const user = await UsersService.toggleBan(req.params.id, Boolean(req.body.isBanned))
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

// Редактировать профиль можно только свой (администратору — любой)
usersRouter.patch('/:id/profile', requireSelfOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UsersService.updateProfile(req.params.id, req.body)
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.delete('/:id', requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.userId === req.params.id) {
    return res.status(400).json({ success: false, errorMessage: 'Нельзя удалить самого себя.' })
  }
  try {
    await UsersService.deleteUser(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
