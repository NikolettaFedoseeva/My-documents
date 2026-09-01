export interface TopicItem {
  id: string
  title: string
  category: string
  section: string
  readTime: string
  progress: number
  isCompleted: boolean
  codeSnippet?: string
  content: string
  quizCount: number
}

export type WorkspaceViewMode = 'search' | 'tree' | 'reader' | 'quiz'
