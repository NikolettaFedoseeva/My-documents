import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      errorMessage: 'Доступ запрещен. Отсутствует или неверный токен авторизации.',
    })
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET || 'lern_super_secret_jwt_key_2026'

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      errorMessage: 'Недействительный или истекший токен доступа.',
    })
  }
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, errorMessage: 'Пользователь не авторизован' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        errorMessage: `Доступ запрещен. Необходима роль: ${allowedRoles.join(', ')}`,
      })
    }

    next()
  }
}
