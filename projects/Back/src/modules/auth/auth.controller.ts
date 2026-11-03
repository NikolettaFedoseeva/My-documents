import { Router, Response } from 'express'
import { AuthService } from './auth.service'
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware'
import { loginLimiter, registerLimiter, forgotPasswordLimiter } from '../../middlewares/rate-limit'

const router = Router()

/**
 * POST /api/auth/register - Регистрация нового пользователя
 */
router.post('/register', registerLimiter, async (req, res) => {
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
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const result = await AuthService.login(req.body)
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
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
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
