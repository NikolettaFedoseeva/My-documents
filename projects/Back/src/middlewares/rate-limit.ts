import rateLimit from 'express-rate-limit'

const tooMany = (message: string) => ({ success: false, errorMessage: message })

/** Вход: 10 неудачных попыток за 15 минут с одного IP (успешные не считаются) */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Слишком много попыток входа. Попробуйте через 15 минут.'),
})

/** Регистрация: 10 аккаунтов в час с одного IP */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Слишком много регистраций с вашего адреса. Попробуйте позже.'),
})

/** Сброс пароля: 5 запросов в час с одного IP */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Слишком много запросов на сброс пароля. Попробуйте позже.'),
})
