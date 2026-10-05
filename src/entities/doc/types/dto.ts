import type { DocSectionContent, DocFlashcardData, DocQuiz } from './index'

export interface CreateCategoryDto {
  title: string
  code?: string
  icon?: string
  description?: string
}

export interface UpdateCategoryDto {
  title?: string
  code?: string
  icon?: string
  description?: string
}

export interface CreateDocDto {
  categoryId: string
  title: string
  code?: string
  description: string
  authorName?: string
  authorRole?: string
  readTimeMinutes?: number
  tags?: string[]
  sections: DocSectionContent[]
  flashcard?: DocFlashcardData
  quiz?: DocQuiz
}

export interface UpdateDocDto {
  categoryId?: string
  title?: string
  code?: string
  description?: string
  authorName?: string
  authorRole?: string
  readTimeMinutes?: number
  tags?: string[]
  sections?: DocSectionContent[]
  flashcard?: DocFlashcardData
  quiz?: DocQuiz
}
