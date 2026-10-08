/**
 * Типы данных командной палитры и глобального поиска (Spotlight / Ctrl+K)
 */

export type CommandCategory = 'actions' | 'courses' | 'chapters' | 'navigation'

export interface CommandItem {
  id: string
  title: string
  description?: string
  category: CommandCategory
  categoryLabel: string
  icon: string
  badge?: string
  shortcut?: string
  keywords?: string[]
  action: () => void
}
