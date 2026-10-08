import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://gywehqprnrnxqxtxskyf.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'mock-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// Публичный клиент с проверкой RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Сервисный / административный клиент для защищенного бэкенда (полный доступ к БД)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
