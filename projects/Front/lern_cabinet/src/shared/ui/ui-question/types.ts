export interface QuestionOption {
  id: string
  label: string
  text: string
}

export type QuestionState = 'idle' | 'selected' | 'correct' | 'wrong'
