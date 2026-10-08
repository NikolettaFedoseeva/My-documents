export interface DocTocItem {
  id: string
  title: string
  level: number
}

export interface DocSectionContent {
  id: string
  title: string
  level: number
  text: string
  codeSnippet?: {
    language: string
    code: string
    filename?: string
  }
  callout?: {
    type: 'info' | 'warning' | 'tip' | 'note'
    message: string
  }
}

export interface DocFlashcardData {
  id: string | number
  category: string
  section: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  answer: string
  hint?: string
}

export type DocFlashcard = DocFlashcardData

export interface DocQuizOption {
  id: string
  label: string
  text: string
}

export interface DocQuiz {
  question: string
  options: DocQuizOption[]
  correctId: string
  explanation?: string
}

export interface DocItem {
  id: string
  categoryId: string
  code?: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
    role: string
  }
  updatedAt: string
  readTimeMinutes: number
  tags: string[]
  sections: DocSectionContent[]
  usefulCount: number
  notUsefulCount: number
  status?: 'completed' | 'in-progress' | 'locked'
  flashcard?: DocFlashcardData
  quiz?: DocQuiz
}

export interface DocCategory {
  id: string
  code?: string
  title: string
  icon: string
  description: string
  items: DocItem[]
  progressPercent?: number
}

export interface DocFeedbackPayload {
  docId: string
  isUseful: boolean
}

export type DocStatus = 'completed' | 'in-progress' | 'locked'

export interface DocChapterProgress {
  docId: string
  status: DocStatus
  isRead: boolean
  flashcardMastered: boolean
  quizCompleted: boolean
  selectedQuizAnswerId: string | null
  lastVisitedAt: number
}

export interface DocProgressStorageData {
  version: number
  chapters: Record<string, DocChapterProgress>
  totalXp: number
  lastActiveDocId: string | null
  completedDocIds: string[]
  streakDays: number
  lastActivityDate: string
}

export interface CourseCodex {
  id: string
  slug: string
  title: string
  description: string
  category: string
  icon: string
  level: 'beginner' | 'intermediate' | 'advanced'
  author: {
    id?: string
    name: string
    avatar?: string
    role?: string
  }
  tags: string[]
  isPublished: boolean
  modules: DocCategory[]
  totalChapters?: number
  estimatedHours?: number
  createdAt: string
  updatedAt: string
}

export interface DocBookmark {
  id: string
  docId: string
  docTitle: string
  courseSlug: string
  courseTitle: string
  chapterCode?: string
  createdAt: string
}

export interface DocMarginNote {
  id: string
  docId: string
  sectionIndex?: number
  selectedText?: string
  noteText: string
  color: 'amber' | 'cyan' | 'emerald' | 'purple'
  createdAt: string
}

export * from './dto'

