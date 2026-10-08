import { supabaseAdmin } from '../../config/supabase'

export class ProgressService {
  static async getUserProgress(userId: string) {
    let { data, error } = await supabaseAdmin.from('user_progress').select('*').eq('user_id', userId).single()

    if (!data) {
      const created = await supabaseAdmin
        .from('user_progress')
        .insert([
          {
            user_id: userId,
            completed_chapter_ids: [],
            favorited_chapter_ids: [],
            flashcards_mastered_ids: [],
            xp: 100,
            current_streak: 1,
            last_active_date: new Date().toISOString().split('T')[0],
          },
        ])
        .select()
        .single()
      data = created.data
    }

    return {
      userId: data.user_id,
      completedChapterIds: Array.isArray(data.completed_chapter_ids) ? data.completed_chapter_ids : [],
      favoritedChapterIds: Array.isArray(data.favorited_chapter_ids) ? data.favorited_chapter_ids : [],
      flashcardsMasteredIds: Array.isArray(data.flashcards_mastered_ids) ? data.flashcards_mastered_ids : [],
      xp: data.xp || 0,
      currentStreak: data.current_streak || 1,
      lastActiveDate: data.last_active_date,
    }
  }

  static async toggleChapterCompleted(userId: string, chapterId: string) {
    const cur = await this.getUserProgress(userId)
    const set = new Set(cur.completedChapterIds)
    let gainedXp = 0

    if (set.has(chapterId)) {
      set.delete(chapterId)
    } else {
      set.add(chapterId)
      gainedXp = 50
    }

    const updatedArray = Array.from(set)
    const newXp = cur.xp + gainedXp
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1)

    await supabaseAdmin
      .from('user_progress')
      .update({
        completed_chapter_ids: updatedArray,
        xp: newXp,
        last_active_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    await supabaseAdmin
      .from('users')
      .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
      .eq('id', userId)

    return {
      completedChapterIds: updatedArray,
      xp: newXp,
      level: newLevel,
      gainedXp,
    }
  }

  static async addBonusXp(userId: string, amount: number) {
    const cur = await this.getUserProgress(userId)
    const newXp = cur.xp + Math.max(0, amount)
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1)

    await supabaseAdmin
      .from('user_progress')
      .update({
        xp: newXp,
        last_active_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    await supabaseAdmin
      .from('users')
      .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
      .eq('id', userId)

    return { xp: newXp, level: newLevel, added: amount }
  }

  static async masterFlashcard(userId: string, flashcardId: string) {
    const cur = await this.getUserProgress(userId)
    const set = new Set(cur.flashcardsMasteredIds)
    set.add(flashcardId)

    const updatedArray = Array.from(set)
    await supabaseAdmin
      .from('user_progress')
      .update({
        flashcards_mastered_ids: updatedArray,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return { flashcardsMasteredIds: updatedArray }
  }
}
