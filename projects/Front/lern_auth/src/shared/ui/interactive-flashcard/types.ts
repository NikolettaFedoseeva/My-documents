export interface QuestionData {
  id: string | number
  category: string
  section: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  answer: string
  hint?: string
}
