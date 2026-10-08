import { Router, Request, Response } from 'express'
import { UsersService } from './users.service'
import { authMiddleware, requireRoles, AuthenticatedRequest } from '../../middlewares/auth.middleware'

export const usersRouter = Router()

usersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query
    const users = await UsersService.getAllUsers({
      search: search as string,
      role: role as string,
    })
    res.json(users)
  } catch (err: any) {
    res.status(500).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UsersService.getUserById(req.params.id)
    res.json(user)
  } catch (err: any) {
    res.status(404).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.patch('/:id/role', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const user = await UsersService.updateRole(req.params.id, req.body.role)
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.patch('/:id/ban', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const user = await UsersService.toggleBan(req.params.id, Boolean(req.body.isBanned))
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.patch('/:id/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UsersService.updateProfile(req.params.id, req.body)
    res.json({ success: true, user })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})

usersRouter.delete('/:id', authMiddleware, requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await UsersService.deleteUser(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, errorMessage: err.message })
  }
})
