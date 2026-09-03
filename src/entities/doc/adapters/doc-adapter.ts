import { DocItem, DocTocItem } from '../types'

export class DocAdapter {
  /**
   * Извлечение оглавления TOC из секций статьи
   */
  static extractToc(doc: DocItem): DocTocItem[] {
    if (!doc || !doc.sections) return []
    return doc.sections.map((section) => ({
      id: section.id,
      title: section.title,
      level: section.level,
    }))
  }

  /**
   * Форматирование даты изменения статьи
   */
  static formatDate(dateString: string): string {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }
}
