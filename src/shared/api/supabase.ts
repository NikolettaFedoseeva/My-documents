import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL || 'https://gywehqprnrnxqxtxskyf.supabase.co'
export const SUPABASE_ANON_KEY = process.env.VUE_APP_SUPABASE_ANON_KEY || 'sb_publishable_xJQtwKzq7pBmVOZGRcF4VQ_hyYhcU7N'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)