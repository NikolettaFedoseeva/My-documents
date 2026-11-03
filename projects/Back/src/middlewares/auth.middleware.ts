import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'
import { env } from '../config/env'
import { supabaseAdmin } from '../config/supabase'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

const unauthorized = (res: Response, message: string) =>
  res.status(401).json({ success: false, errorMessage: message })

/**
 * Проверяет JWT и сверяет пользователя с базой.
 * Роль берётся из БД, а не из токена: заблокированный, удалённый или разжалованный
 * пользователь теряет доступ сразу, не дожидаясь истечения токена.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Доступ запрещен. Отсутствует или неверный токен авторизации.')
  }

  let decoded: JwtPayload
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], env.jwtSecret) as JwtPayload
  } catch {
    return unauthorized(res, 'Недействительный или истекший токен доступа.')
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role, is_banned')
    .eq('id', decoded.userId)
    .maybeSingle()

  if (error) {
    console.error('[authMiddleware] Ошибка БД:', error.message)
    return res.status(503).json({ success: false, errorMessage: 'Сервис временно недоступен.' })
  }
  if (!data) return unauthorized(res, 'Пользователь не найден. Войдите заново.')
  if (data.is_banned) {
    return res.status(403).json({ success: false, errorMessage: 'Учетная запись заблокирована.' })
  }

  req.user = { userId: data.id, email: data.email, role: data.role }
  next()
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

/** Доступ только владельцу ресурса (параметр :id) или администратору */
export function requireSelfOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return unauthorized(res, 'Пользователь не авторизован')
  if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
    return res.status(403).json({ success: false, errorMessage: 'Доступ запрещен.' })
  }
  next()
}
