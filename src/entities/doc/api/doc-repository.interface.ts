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

/**
 * Интерфейс репозитория управления курсами и базой знаний.
 * Позволяет работать как с локальным хранилищем (LocalStorage / Mocks),
 * так и легко переключиться на реальный бэкенд (REST API / Supabase).
 */
export interface DocRepository {
  // #region Методы работы с курсами
  /** Получить все курсы платформы */
  getCourses(): Promise<CourseCodex[]>

  /** Получить курс по ID */
  getCourseById(id: string): Promise<CourseCodex | null>

  /** Получить курс по slug */
  getCourseBySlug(slug: string): Promise<CourseCodex | null>

  /** Создать новый курс */
  createCourse(dto: CreateCourseDto): Promise<CourseCodex>

  /** Обновить данные курса */
  updateCourse(id: string, dto: UpdateCourseDto): Promise<CourseCodex>

  /** Удалить курс со всеми модулями и главами */
  deleteCourse(id: string): Promise<void>
  // #endregion Методы работы с курсами

  // #region Методы работы с модулями и главами
  /** Получить все модули и статьи (опционально для конкретного курса) */
  getCategories(courseId?: string): Promise<DocCategory[]>

  /** Получить конкретную статью по идентификатору */
  getDocById(id: string, courseId?: string): Promise<DocItem | null>

  /** Создать новый модуль / категорию в курсе */
  createCategory(dto: CreateCategoryDto, courseId?: string): Promise<DocCategory>

  /** Обновить данные модуля / категории */
  updateCategory(id: string, dto: UpdateCategoryDto, courseId?: string): Promise<DocCategory>

  /** Удалить модуль со всеми статьями */
  deleteCategory(id: string, courseId?: string): Promise<void>

  /** Создать новую главу / статью в курсе */
  createDoc(dto: CreateDocDto, courseId?: string): Promise<DocItem>

  /** Обновить существующую главу / статью */
  updateDoc(id: string, dto: UpdateDocDto, courseId?: string): Promise<DocItem>

  /** Удалить главу / статью */
  deleteDoc(id: string, courseId?: string): Promise<void>

  /** Сбросить базу данных к исходным демонстрационным материалам */
  resetToDefaults(): Promise<CourseCodex[]>
  // #endregion Методы работы с модулями и главами
}

