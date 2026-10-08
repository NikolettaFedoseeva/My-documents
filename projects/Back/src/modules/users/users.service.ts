import { supabaseAdmin } from '../../config/supabase'

export class UsersService {
  static async getAllUsers(params: { search?: string; role?: string }) {
    let query = supabaseAdmin
      .from('users')
      .select('id, email, name, role, avatar, status, xp, level, is_banned, unread_notifications_count, created_at')
      .order('created_at', { ascending: false })

    if (params.role) {
      query = query.eq('role', params.role)
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    return (data || []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      xp: u.xp,
      level: u.level,
      isBanned: u.is_banned,
      unreadNotificationsCount: u.unread_notifications_count,
      createdAt: u.created_at?.split('T')[0] || u.created_at,
    }))
  }

  static async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, avatar, status, xp, level, is_banned, unread_notifications_count, created_at')
      .eq('id', id)
      .single()

    if (error || !data) throw new Error('Пользователь не найден')
    return {
      ...data,
      isBanned: data.is_banned,
      unreadNotificationsCount: data.unread_notifications_count,
    }
  }

  static async updateRole(id: string, role: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async toggleBan(id: string, isBanned: boolean) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_banned: isBanned, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async updateProfile(id: string, payload: { name?: string; avatar?: string }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...(payload.name && { name: payload.name.trim() }),
        ...(payload.avatar && { avatar: payload.avatar }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async deleteUser(id: string) {
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  }
}
