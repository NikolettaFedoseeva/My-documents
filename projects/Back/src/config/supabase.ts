import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Публичный клиент с проверкой RLS
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

// Сервисный / административный клиент для защищенного бэкенда (полный доступ к БД)
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
