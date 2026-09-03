import { Router, Response } from 'express'
import { AuthService } from './auth.service'
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware'

const router = Router()

/**
 * POST /api/auth/register - Регистрация нового пользователя
 */
router.post('/register', async (req, res) => {
  try {
    const result = await AuthService.register(req.body)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({
      success: false,
      errorMessage: err.message || 'Ошибка при регистрации.',
    })
  }
})

/**
 * POST /api/auth/login - Авторизация пользователя
 */
router.post('/login', async (req, res) => {
  try {
    const result = await AuthService.login(req.body)
    
    // Установка Refresh Token в Cookie
    res.cookie('refreshToken', result.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    })

    res.json(result)
  } catch (err: any) {
    res.status(400).json({
      success: false,
      errorMessage: err.message || 'Ошибка авторизации.',
    })
  }
})

/**
 * POST /api/auth/forgot-password - Запрос сброса пароля
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const result = await AuthService.resetPassword(req.body)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({
      success: false,
      errorMessage: err.message || 'Ошибка сброса пароля.',
    })
  }
})

/**
 * POST /api/auth/logout - Выход из аккаунта
 */
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken')
  res.json({ success: true, message: 'Выход выполнен успешно.' })
})

/**
 * GET /api/auth/me - Защищенный маршрут получения профиля по JWT
 */
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  })
})

export const authRouter = router
