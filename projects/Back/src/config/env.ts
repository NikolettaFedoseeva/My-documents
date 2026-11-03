import dotenv from 'dotenv'

dotenv.config()

/** Минимальная длина JWT-секрета (защита от слабых и угадываемых значений) */
const MIN_JWT_SECRET_LENGTH = 32

/**
 * Читает обязательную переменную окружения.
 * Запасных значений нет намеренно: сервер не должен стартовать с небезопасной конфигурацией.
 */
const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`[env] Не задана обязательная переменная окружения ${name}. См. .env.example`)
  }
  return value.trim()
}

const jwtSecret = requireEnv('JWT_SECRET')
if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
  throw new Error(`[env] JWT_SECRET слишком короткий: нужно минимум ${MIN_JWT_SECRET_LENGTH} символов`)
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  /** За обратным прокси (nginx, Render и т.п.) нужно TRUST_PROXY=1, иначе лимиты запросов считаются по IP прокси */
  trustProxy: process.env.TRUST_PROXY === '1',
  jwtSecret,
  /** Срок жизни токена доступа (формат jsonwebtoken: 15m, 12h, 1d) */
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1d').trim(),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:1000,http://localhost:8080')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const
