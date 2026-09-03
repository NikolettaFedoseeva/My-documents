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

export interface DocItem {
  id: string
  categoryId: string
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
}

export interface DocCategory {
  id: string
  title: string
  icon: string
  description: string
  items: DocItem[]
}

export interface DocFeedbackPayload {
  docId: string
  isUseful: boolean
}
