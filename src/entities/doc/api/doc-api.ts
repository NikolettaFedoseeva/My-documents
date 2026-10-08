import type {
  DocCategory,
  DocItem,
  CourseCodex,
  DocFeedbackPayload,
  CreateDocDto,
  UpdateDocDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateCourseDto,
  UpdateCourseDto,
} from '../types'
import type { DocRepository } from './doc-repository.interface'
import { DocHttpRepository } from './doc-http-repository'

// Экземпляр репозитория базы знаний:
// Использует реальный REST API бэкенд на порту 5000 с автоматическим fallback на LocalStorage при оффлайне.
const repository: DocRepository = new DocHttpRepository()

export class DocApiService {
  // #region Курсы
  static async getCourses(): Promise<CourseCodex[]> {
    return repository.getCourses()
  }

  static async getCourseById(id: string): Promise<CourseCodex | null> {
    return repository.getCourseById(id)
  }

  static async getCourseBySlug(slug: string): Promise<CourseCodex | null> {
    return repository.getCourseBySlug(slug)
  }

  static async createCourse(dto: CreateCourseDto): Promise<CourseCodex> {
    return repository.createCourse(dto)
  }

  static async updateCourse(id: string, dto: UpdateCourseDto): Promise<CourseCodex> {
    return repository.updateCourse(id, dto)
  }

  static async deleteCourse(id: string): Promise<void> {
    return repository.deleteCourse(id)
  }

  static async importCourse(course: CourseCodex, options?: { overwrite?: boolean }): Promise<CourseCodex> {
    return repository.importCourse(course, options)
  }
  // #endregion Курсы

  // #region Модули и статьи
  static async getCategories(courseId?: string): Promise<DocCategory[]> {
    return repository.getCategories(courseId)
  }

  static async getDocById(id: string, courseId?: string): Promise<DocItem | null> {
    return repository.getDocById(id, courseId)
  }

  static async createCategory(dto: CreateCategoryDto, courseId?: string): Promise<DocCategory> {
    return repository.createCategory(dto, courseId)
  }

  static async updateCategory(id: string, dto: UpdateCategoryDto, courseId?: string): Promise<DocCategory> {
    return repository.updateCategory(id, dto, courseId)
  }

  static async deleteCategory(id: string, courseId?: string): Promise<void> {
    return repository.deleteCategory(id, courseId)
  }

  static async createDoc(dto: CreateDocDto, courseId?: string): Promise<DocItem> {
    return repository.createDoc(dto, courseId)
  }

  static async updateDoc(id: string, dto: UpdateDocDto, courseId?: string): Promise<DocItem> {
    return repository.updateDoc(id, dto, courseId)
  }

  static async deleteDoc(id: string, courseId?: string): Promise<void> {
    return repository.deleteDoc(id, courseId)
  }

  static async resetToDefaults(): Promise<CourseCodex[]> {
    return repository.resetToDefaults()
  }

  static async submitFeedback(payload: DocFeedbackPayload): Promise<{ success: boolean }> {
    return Promise.resolve({ success: true })
  }
  // #endregion Модули и статьи
}

export { repository as docRepository }
