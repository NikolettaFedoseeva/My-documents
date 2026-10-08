import { API_BASE_URL, getAuthHeaders } from '@/shared/api'

export interface RemoteUserProgressDto {
  userId: string
  completedChapterIds: string[]
  favoritedChapterIds: string[]
  flashcardsMasteredIds: string[]
  xp: number
  currentStreak: number
  lastActiveDate: string
}

const PROGRESS_API_URL = `${API_BASE_URL}/progress`

export class DocProgressApiService {
  private static getHeaders(): HeadersInit {
    return getAuthHeaders()
  }

  private static hasAuth(): boolean {
    try {
      return Boolean(localStorage.getItem('lern_token'))
    } catch {
      return false
    }
  }

  /**
   * Получение прогресса текущего авторизованного пользователя с сервера Supabase
   */
  static async fetchMyProgress(): Promise<RemoteUserProgressDto | null> {
    if (!this.hasAuth()) return null

    try {
      const response = await fetch(`${PROGRESS_API_URL}/me`, {
        headers: this.getHeaders(),
      })
      if (response.ok) {
        return (await response.json()) as RemoteUserProgressDto
      }
    } catch (e) {
      // Игнорируем сетевые ошибки, продолжая работу офлайн
    }
    return null
  }

  /**
   * Переключение статуса прохождения главы на бэкенде
   */
  static async syncToggleChapter(chapterId: string): Promise<boolean> {
    if (!this.hasAuth()) return false

    try {
      const response = await fetch(`${PROGRESS_API_URL}/toggle-chapter`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ chapterId }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Начисление бонусного опыта на бэкенде (комбо и тренажеры)
   */
  static async syncBonusXp(amount: number): Promise<boolean> {
    if (!this.hasAuth() || amount <= 0) return false

    try {
      const response = await fetch(`${PROGRESS_API_URL}/xp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Фиксация освоенной 3D-флешкарты в облаке
   */
  static async syncMasterFlashcard(flashcardId: string): Promise<boolean> {
    if (!this.hasAuth()) return false

    try {
      const response = await fetch(`${PROGRESS_API_URL}/master-flashcard`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ flashcardId }),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
