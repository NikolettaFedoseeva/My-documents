import { DocFlashcardData } from '@/entities/doc'

export interface DeckCard {
  docId: string
  docTitle: string
  courseTitle: string
  courseId: string
  flashcard: DocFlashcardData
  isMastered: boolean
}

export type FlashcardRating = 'repeat' | 'doubt' | 'know'

export interface TrainingSessionStats {
  totalCards: number
  knownCount: number
  doubtCount: number
  repeatCount: number
  combo: number
  maxCombo: number
  earnedXp: number
  durationSeconds: number
}
