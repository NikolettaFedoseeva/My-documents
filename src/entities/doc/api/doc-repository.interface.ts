import type { DocCategory, DocItem, CreateDocDto, UpdateDocDto, CreateCategoryDto, UpdateCategoryDto } from '../types'

/**
 * Интерфейс репозитория управления базой знаний.
 * Позволяет работать как с локальным хранилищем (LocalStorage / Mocks),
 * так и легко переключиться на реальный бэкенд (REST API / Supabase).
 */
export interface DocRepository {
  /** Получить все модули и статьи */
  getCategories(): Promise<DocCategory[]>

  /** Получить конкретную статью по идентификатору */
  getDocById(id: string): Promise<DocItem | null>

  /** Создать новый модуль / категорию */
  createCategory(dto: CreateCategoryDto): Promise<DocCategory>

  /** Обновить данные модуля / категории */
  updateCategory(id: string, dto: UpdateCategoryDto): Promise<DocCategory>

  /** Удалить модуль со всеми статьями */
  deleteCategory(id: string): Promise<void>

  /** Создать новую главу / статью */
  createDoc(dto: CreateDocDto): Promise<DocItem>

  /** Обновить существующую главу / статью */
  updateDoc(id: string, dto: UpdateDocDto): Promise<DocItem>

  /** Удалить главу / статью */
  deleteDoc(id: string): Promise<void>

  /** Сбросить базу данных к исходным демонстрационным материалам */
  resetToDefaults(): Promise<DocCategory[]>
}
