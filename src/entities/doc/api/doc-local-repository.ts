import type {
  DocCategory,
  DocItem,
  CourseCodex,
  CreateDocDto,
  UpdateDocDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateCourseDto,
  UpdateCourseDto,
} from '../types'
import type { DocRepository } from './doc-repository.interface'
import { MOCK_COURSES } from './mock-data'

const STORAGE_KEY_COURSES = 'lern_courses_codex_v2'
const OLD_STORAGE_KEY_CATEGORIES = 'lern_author_codex_v1'

/**
 * Вспомогательная генерация уникального идентификатора
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
}

/**
 * Генерация человекочитаемого slug из заголовка
 */
function generateSlug(title: string): string {
  const cyrillicToLatinMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }

  return title
    .toLowerCase()
    .trim()
    .split('')
    .map((char) => cyrillicToLatinMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `course-${Date.now().toString(36)}`
}

/**
 * Локальная реализация репозитория мультикурсовой базы знаний.
 * Обеспечивает сохранение неограниченного числа курсов, модулей и статей в LocalStorage
 * с автоматической миграцией старых данных и fallback на богатые демонстрационные курсы.
 */
export class DocLocalRepository implements DocRepository {
  private cache: CourseCodex[] | null = null

  /**
   * Загрузка курсов из LocalStorage с миграцией
   */
  private loadData(): CourseCodex[] {
    if (this.cache) {
      return this.cache
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_COURSES)
      if (raw) {
        const parsed = JSON.parse(raw) as CourseCodex[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache = parsed
          return this.cache
        }
      }

      // Проверка миграции из предыдущей версии хранилища (v1: только категории)
      const oldRaw = localStorage.getItem(OLD_STORAGE_KEY_CATEGORIES)
      if (oldRaw) {
        const oldCategories = JSON.parse(oldRaw) as DocCategory[]
        if (Array.isArray(oldCategories) && oldCategories.length > 0) {
          const defaultCourses = JSON.parse(JSON.stringify(MOCK_COURSES)) as CourseCodex[]
          defaultCourses[0].modules = oldCategories
          this.cache = defaultCourses
          this.saveData(this.cache)
          return this.cache
        }
      }
    } catch (err) {
      console.warn('[DocLocalRepository] Ошибка чтения LocalStorage, используем дефолтные курсы:', err)
    }

    // Инициализация дефолтными демонстрационными курсами
    this.cache = JSON.parse(JSON.stringify(MOCK_COURSES))
    this.saveData(this.cache!)
    return this.cache!
  }

  /**
   * Сохранение курсов в LocalStorage
   */
  private saveData(courses: CourseCodex[]): void {
    this.cache = courses
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses))
    } catch (err) {
      console.warn('[DocLocalRepository] Не удалось записать курсы в LocalStorage:', err)
    }
  }

  /**
   * Поиск целевого курса или возврат первого по умолчанию
   */
  private resolveCourse(courses: CourseCodex[], courseId?: string): CourseCodex {
    if (courseId) {
      const found = courses.find((c) => c.id === courseId || c.slug === courseId)
      if (found) return found
    }
    if (courses.length === 0) {
      throw new Error('В системе нет доступных курсов')
    }
    return courses[0]
  }

  // #region Методы работы с курсами
  async getCourses(): Promise<CourseCodex[]> {
    const courses = this.loadData()
    // Актуализируем количество глав перед отдачей
    courses.forEach((c) => {
      c.totalChapters = c.modules.reduce((sum, m) => sum + m.items.length, 0)
    })
    return Promise.resolve(JSON.parse(JSON.stringify(courses)))
  }

  async getCourseById(id: string): Promise<CourseCodex | null> {
    const courses = this.loadData()
    const found = courses.find((c) => c.id === id) || null
    if (found) {
      found.totalChapters = found.modules.reduce((sum, m) => sum + m.items.length, 0)
    }
    return Promise.resolve(found ? JSON.parse(JSON.stringify(found)) : null)
  }

  async getCourseBySlug(slug: string): Promise<CourseCodex | null> {
    const courses = this.loadData()
    const found = courses.find((c) => c.slug === slug || c.id === slug) || null
    if (found) {
      found.totalChapters = found.modules.reduce((sum, m) => sum + m.items.length, 0)
    }
    return Promise.resolve(found ? JSON.parse(JSON.stringify(found)) : null)
  }

  async createCourse(dto: CreateCourseDto): Promise<CourseCodex> {
    const courses = this.loadData()
    const slug = dto.slug ? generateSlug(dto.slug) : generateSlug(dto.title)

    // Первоначальный стартовый модуль
    const initialModule: DocCategory = {
      id: generateId('cat'),
      code: '01',
      title: 'Введение в курс',
      icon: '🚀',
      description: `Начальные сведения и базовые концепции курса "${dto.title}"`,
      progressPercent: 0,
      items: [],
    }

    const newCourse: CourseCodex = {
      id: generateId('course'),
      slug,
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category.trim() || 'Общие знания',
      icon: dto.icon || '📚',
      level: dto.level || 'intermediate',
      author: {
        name: dto.authorName || 'Преподаватель LERN',
        role: 'Автор курса',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      tags: dto.tags && dto.tags.length > 0 ? dto.tags : ['Новый курс'],
      isPublished: true,
      totalChapters: 0,
      estimatedHours: 2,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      modules: [initialModule],
    }

    courses.unshift(newCourse)
    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(newCourse)))
  }

  async updateCourse(id: string, dto: UpdateCourseDto): Promise<CourseCodex> {
    const courses = this.loadData()
    const target = courses.find((c) => c.id === id)
    if (!target) {
      throw new Error(`Курс с id="${id}" не найден`)
    }

    if (dto.title !== undefined) target.title = dto.title.trim()
    if (dto.slug !== undefined) target.slug = generateSlug(dto.slug)
    if (dto.description !== undefined) target.description = dto.description.trim()
    if (dto.category !== undefined) target.category = dto.category.trim()
    if (dto.icon !== undefined) target.icon = dto.icon.trim()
    if (dto.level !== undefined) target.level = dto.level
    if (dto.authorName !== undefined) target.author.name = dto.authorName.trim()
    if (dto.tags !== undefined) target.tags = dto.tags
    if (dto.isPublished !== undefined) target.isPublished = dto.isPublished
    target.updatedAt = new Date().toISOString().split('T')[0]

    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(target)))
  }

  async deleteCourse(id: string): Promise<void> {
    let courses = this.loadData()
    courses = courses.filter((c) => c.id !== id)
    this.saveData(courses)
    return Promise.resolve()
  }
  // #endregion Методы работы с курсами

  // #region Методы работы с модулями и главами
  async getCategories(courseId?: string): Promise<DocCategory[]> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    return Promise.resolve(JSON.parse(JSON.stringify(course.modules)))
  }

  async getDocById(id: string, courseId?: string): Promise<DocItem | null> {
    const courses = this.loadData()
    if (courseId) {
      const course = this.resolveCourse(courses, courseId)
      const all = course.modules.flatMap((c) => c.items)
      const found = all.find((d) => d.id === id) || null
      return Promise.resolve(found ? JSON.parse(JSON.stringify(found)) : null)
    }

    // Поиск по всем курсам
    for (const course of courses) {
      const all = course.modules.flatMap((c) => c.items)
      const found = all.find((d) => d.id === id)
      if (found) {
        return Promise.resolve(JSON.parse(JSON.stringify(found)))
      }
    }
    return Promise.resolve(null)
  }

  async createCategory(dto: CreateCategoryDto, courseId?: string): Promise<DocCategory> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    const nextIndex = course.modules.length + 1
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

    course.modules.push(newCategory)
    course.updatedAt = new Date().toISOString().split('T')[0]
    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(newCategory)))
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, courseId?: string): Promise<DocCategory> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    const target = course.modules.find((c) => c.id === id)
    if (!target) {
      throw new Error(`Модуль с id="${id}" не найден в курсе "${course.title}"`)
    }

    if (dto.title !== undefined) target.title = dto.title.trim()
    if (dto.code !== undefined) target.code = dto.code.trim()
    if (dto.icon !== undefined) target.icon = dto.icon.trim()
    if (dto.description !== undefined) target.description = dto.description.trim()
    course.updatedAt = new Date().toISOString().split('T')[0]

    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(target)))
  }

  async deleteCategory(id: string, courseId?: string): Promise<void> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    course.modules = course.modules.filter((c) => c.id !== id)
    course.updatedAt = new Date().toISOString().split('T')[0]
    this.saveData(courses)
    return Promise.resolve()
  }

  async createDoc(dto: CreateDocDto, courseId?: string): Promise<DocItem> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    const category = course.modules.find((c) => c.id === dto.categoryId)
    if (!category) {
      throw new Error(`Категория с id="${dto.categoryId}" не найдена в курсе "${course.title}"`)
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
        name: dto.authorName || course.author.name || 'Автор курса',
        role: dto.authorRole || course.author.role || 'Преподаватель',
        avatar: course.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
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
    course.totalChapters = course.modules.reduce((sum, m) => sum + m.items.length, 0)
    course.updatedAt = new Date().toISOString().split('T')[0]

    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(newDoc)))
  }

  async updateDoc(id: string, dto: UpdateDocDto, courseId?: string): Promise<DocItem> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    let foundDoc: DocItem | null = null
    let sourceCategory: DocCategory | null = null

    for (const cat of course.modules) {
      const idx = cat.items.findIndex((item) => item.id === id)
      if (idx !== -1) {
        foundDoc = cat.items[idx]
        sourceCategory = cat
        break
      }
    }

    if (!foundDoc || !sourceCategory) {
      throw new Error(`Глава с id="${id}" не найдена в курсе "${course.title}"`)
    }

    // Если меняется категория — перемещаем главу
    if (dto.categoryId && dto.categoryId !== sourceCategory.id) {
      const targetCat = course.modules.find((c) => c.id === dto.categoryId)
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
    course.updatedAt = new Date().toISOString().split('T')[0]

    this.saveData(courses)
    return Promise.resolve(JSON.parse(JSON.stringify(foundDoc)))
  }

  async deleteDoc(id: string, courseId?: string): Promise<void> {
    const courses = this.loadData()
    const course = this.resolveCourse(courses, courseId)
    for (const cat of course.modules) {
      const idx = cat.items.findIndex((item) => item.id === id)
      if (idx !== -1) {
        cat.items.splice(idx, 1)
        course.totalChapters = course.modules.reduce((sum, m) => sum + m.items.length, 0)
        course.updatedAt = new Date().toISOString().split('T')[0]
        this.saveData(courses)
        return Promise.resolve()
      }
    }
    return Promise.resolve()
  }

  async resetToDefaults(): Promise<CourseCodex[]> {
    try {
      localStorage.removeItem(STORAGE_KEY_COURSES)
      localStorage.removeItem(OLD_STORAGE_KEY_CATEGORIES)
    } catch (e) {
      console.warn(e)
    }
    this.cache = JSON.parse(JSON.stringify(MOCK_COURSES))
    this.saveData(this.cache!)
    return Promise.resolve(JSON.parse(JSON.stringify(this.cache)))
  }
  // #endregion Методы работы с модулями и главами
}
