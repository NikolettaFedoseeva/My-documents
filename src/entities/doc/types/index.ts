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
