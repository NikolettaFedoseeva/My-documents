import type {
  DocCategory,
  DocItem,
  DocFeedbackPayload,
  CreateDocDto,
  UpdateDocDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types'
import type { DocRepository } from './doc-repository.interface'
import { DocLocalRepository } from './doc-local-repository'

// Экземпляр репозитория базы знаний.
// В будущем при переходе на бэкенд достаточно подставить:
// const repository: DocRepository = new DocSupabaseRepository()
const repository: DocRepository = new DocLocalRepository()

export class DocApiService {
  static async getCategories(): Promise<DocCategory[]> {
    return repository.getCategories()
  }

  static async getDocById(id: string): Promise<DocItem | null> {
    return repository.getDocById(id)
  }

  static async createCategory(dto: CreateCategoryDto): Promise<DocCategory> {
    return repository.createCategory(dto)
  }

  static async updateCategory(id: string, dto: UpdateCategoryDto): Promise<DocCategory> {
    return repository.updateCategory(id, dto)
  }

  static async deleteCategory(id: string): Promise<void> {
    return repository.deleteCategory(id)
  }

  static async createDoc(dto: CreateDocDto): Promise<DocItem> {
    return repository.createDoc(dto)
  }

  static async updateDoc(id: string, dto: UpdateDocDto): Promise<DocItem> {
    return repository.updateDoc(id, dto)
  }

  static async deleteDoc(id: string): Promise<void> {
    return repository.deleteDoc(id)
  }

  static async resetToDefaults(): Promise<DocCategory[]> {
    return repository.resetToDefaults()
  }

  static async submitFeedback(payload: DocFeedbackPayload): Promise<{ success: boolean }> {
    return Promise.resolve({ success: true })
  }
}

export { repository as docRepository }
export * from './doc-repository.interface'
export * from './doc-local-repository'
export * from './mock-data'
