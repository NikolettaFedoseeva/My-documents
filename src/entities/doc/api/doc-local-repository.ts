import type {
  DocCategory,
  DocItem,
  CreateDocDto,
  UpdateDocDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types'
import type { DocRepository } from './doc-repository.interface'
import { MOCK_CATEGORIES } from './mock-data'

const STORAGE_KEY = 'lern_author_codex_v1'

/**
 * Вспомогательная генерация уникального идентификатора
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
}

/**
 * Локальная реализация репозитория базы знаний.
 * Обеспечивает сохранение созданных автором модулей и статей в LocalStorage
 * с автоматическим слиянием и fallback на базовые демонстрационные материалы.
 */
export class DocLocalRepository implements DocRepository {
  private cache: DocCategory[] | null = null

  /**
   * Загрузка категорий из LocalStorage или исходных моков
   */
  private loadData(): DocCategory[] {
    if (this.cache) {
      return this.cache
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DocCategory[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache = parsed
          return this.cache
        }
      }
    } catch (err) {
      console.warn('[DocLocalRepository] Ошибка чтения LocalStorage, используем базовые моки:', err)
    }

    // Клонируем дефолтные категории
    this.cache = JSON.parse(JSON.stringify(MOCK_CATEGORIES))
    this.saveData(this.cache!)
    return this.cache!
  }

  /**
   * Сохранение категорий в LocalStorage
   */
  private saveData(categories: DocCategory[]): void {
    this.cache = categories
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
    } catch (err) {
      console.warn('[DocLocalRepository] Не удалось записать в LocalStorage:', err)
    }
  }

  async getCategories(): Promise<DocCategory[]> {
    const data = this.loadData()
    return Promise.resolve(JSON.parse(JSON.stringify(data)))
  }

  async getDocById(id: string): Promise<DocItem | null> {
    const data = this.loadData()
    const all = data.flatMap((c) => c.items)
    const found = all.find((d) => d.id === id) || null
    return Promise.resolve(found ? JSON.parse(JSON.stringify(found)) : null)
  }

  async createCategory(dto: CreateCategoryDto): Promise<DocCategory> {
    const categories = this.loadData()
    const nextIndex = categories.length + 1
    const code = dto.code || (nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`)

    const newCategory: DocCategory = {
      id: generateId('cat'),
      code,
      title: dto.title.trim(),
      icon: dto.icon || '📁',
      description: dto.description || '',
      items: [],
      progressPercent: 0,
    }

    categories.push(newCategory)
    this.saveData(categories)
    return Promise.resolve(JSON.parse(JSON.stringify(newCategory)))
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<DocCategory> {
    const categories = this.loadData()
    const target = categories.find((c) => c.id === id)
    if (!target) {
      throw new Error(`Модуль с id="${id}" не найден`)
    }

    if (dto.title !== undefined) target.title = dto.title.trim()
    if (dto.code !== undefined) target.code = dto.code.trim()
    if (dto.icon !== undefined) target.icon = dto.icon.trim()
    if (dto.description !== undefined) target.description = dto.description.trim()

    this.saveData(categories)
    return Promise.resolve(JSON.parse(JSON.stringify(target)))
  }

  async deleteCategory(id: string): Promise<void> {
    let categories = this.loadData()
    categories = categories.filter((c) => c.id !== id)
    this.saveData(categories)
    return Promise.resolve()
  }

  async createDoc(dto: CreateDocDto): Promise<DocItem> {
    const categories = this.loadData()
    const category = categories.find((c) => c.id === dto.categoryId)
    if (!category) {
      throw new Error(`Категория с id="${dto.categoryId}" не найдена`)
    }

    const nextItemIndex = category.items.length + 1
    const code = dto.code || `${category.code || '01'}.${nextItemIndex}`

    const newDoc: DocItem = {
      id: generateId('doc'),
      categoryId: dto.categoryId,
      code,
      title: dto.title.trim(),
      description: dto.description.trim(),
      author: {
        name: dto.authorName || 'Автор курса',
        role: dto.authorRole || 'Преподаватель',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      updatedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: dto.readTimeMinutes || 3,
      tags: dto.tags && dto.tags.length > 0 ? dto.tags : ['Новое'],
      usefulCount: 0,
      notUsefulCount: 0,
      status: 'in-progress',
      sections: dto.sections || [],
      flashcard: dto.flashcard,
      quiz: dto.quiz,
    }

    category.items.push(newDoc)
    this.saveData(categories)
    return Promise.resolve(JSON.parse(JSON.stringify(newDoc)))
  }

  async updateDoc(id: string, dto: UpdateDocDto): Promise<DocItem> {
    const categories = this.loadData()
    let foundDoc: DocItem | null = null
    let sourceCategory: DocCategory | null = null

    for (const cat of categories) {
      const idx = cat.items.findIndex((item) => item.id === id)
      if (idx !== -1) {
        foundDoc = cat.items[idx]
        sourceCategory = cat
        break
      }
    }

    if (!foundDoc || !sourceCategory) {
      throw new Error(`Глава с id="${id}" не найдена`)
    }

    // Если меняется категория — перемещаем главу
    if (dto.categoryId && dto.categoryId !== sourceCategory.id) {
      const targetCat = categories.find((c) => c.id === dto.categoryId)
      if (!targetCat) {
        throw new Error(`Целевая категория с id="${dto.categoryId}" не найдена`)
      }
      sourceCategory.items = sourceCategory.items.filter((item) => item.id !== id)
      foundDoc.categoryId = dto.categoryId
      targetCat.items.push(foundDoc)
    }

    // Обновляем поля
    if (dto.title !== undefined) foundDoc.title = dto.title.trim()
    if (dto.code !== undefined) foundDoc.code = dto.code.trim()
    if (dto.description !== undefined) foundDoc.description = dto.description.trim()
    if (dto.readTimeMinutes !== undefined) foundDoc.readTimeMinutes = dto.readTimeMinutes
    if (dto.tags !== undefined) foundDoc.tags = dto.tags
    if (dto.sections !== undefined) foundDoc.sections = dto.sections
    if (dto.flashcard !== undefined) foundDoc.flashcard = dto.flashcard
    if (dto.quiz !== undefined) foundDoc.quiz = dto.quiz
    foundDoc.updatedAt = new Date().toISOString().split('T')[0]

    this.saveData(categories)
    return Promise.resolve(JSON.parse(JSON.stringify(foundDoc)))
  }

  async deleteDoc(id: string): Promise<void> {
    const categories = this.loadData()
    for (const cat of categories) {
      const idx = cat.items.findIndex((item) => item.id === id)
      if (idx !== -1) {
        cat.items.splice(idx, 1)
        this.saveData(categories)
        return Promise.resolve()
      }
    }
    return Promise.resolve()
  }

  async resetToDefaults(): Promise<DocCategory[]> {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn(e)
    }
    this.cache = JSON.parse(JSON.stringify(MOCK_CATEGORIES))
    this.saveData(this.cache!)
    return Promise.resolve(JSON.parse(JSON.stringify(this.cache)))
  }
}
