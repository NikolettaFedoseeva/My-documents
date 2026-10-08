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
import { DocLocalRepository } from './doc-local-repository'

const API_BASE_URL = 'http://localhost:5000/api/courses'

/**
 * Реализация DocRepository через REST API бэкенда (Node.js + Express + Prisma / SQLite)
 * с автоматическим отказоустойчивым fallback на DocLocalRepository при недоступности сервера.
 */
export class DocHttpRepository implements DocRepository {
  private fallbackRepo: DocLocalRepository = new DocLocalRepository()

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('lern_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  // #region Методы работы с курсами
  async getCourses(): Promise<CourseCodex[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        return data as CourseCodex[]
      }
    } catch (e) {
      // Сервер бэкенда недоступен — используем локальный fallback
    }
    return this.fallbackRepo.getCourses()
  }

  async getCourseById(id: string): Promise<CourseCodex | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        return (await response.json()) as CourseCodex
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.getCourseById(id)
  }

  async getCourseBySlug(slug: string): Promise<CourseCodex | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${slug}`, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        return (await response.json()) as CourseCodex
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.getCourseBySlug(slug)
  }

  async createCourse(dto: CreateCourseDto): Promise<CourseCodex> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      })
      if (response.ok) {
        const data = await response.json()
        return data.course as CourseCodex
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.createCourse(dto)
  }

  async updateCourse(id: string, dto: UpdateCourseDto): Promise<CourseCodex> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      })
      if (response.ok) {
        const data = await response.json()
        return data.course as CourseCodex
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.updateCourse(id, dto)
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) return
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.deleteCourse(id)
  }

  async importCourse(course: CourseCodex, options: { overwrite?: boolean } = {}): Promise<CourseCodex> {
    try {
      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ course, overwrite: options?.overwrite }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.course) {
          // Синхронизируем с локальным хранилищем для мгновенной доступности офлайн
          await this.fallbackRepo.importCourse(data.course, options)
          return data.course as CourseCodex
        }
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.importCourse(course, options)
  }
  // #endregion Методы работы с курсами

  // #region Методы работы с модулями и главами
  async getCategories(courseId?: string): Promise<DocCategory[]> {
    try {
      const url = courseId ? `${API_BASE_URL}/categories?courseId=${courseId}` : `${API_BASE_URL}/categories`
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        return (await response.json()) as DocCategory[]
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.getCategories(courseId)
  }

  async getDocById(id: string, courseId?: string): Promise<DocItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        return (await response.json()) as DocItem
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.getDocById(id, courseId)
  }

  async createCategory(dto: CreateCategoryDto, courseId?: string): Promise<DocCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ...dto, courseId }),
      })
      if (response.ok) {
        const data = await response.json()
        return data.category as DocCategory
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.createCategory(dto, courseId)
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, courseId?: string): Promise<DocCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      })
      if (response.ok) {
        const data = await response.json()
        return data.category as DocCategory
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.updateCategory(id, dto, courseId)
  }

  async deleteCategory(id: string, courseId?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) return
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.deleteCategory(id, courseId)
  }

  async createDoc(dto: CreateDocDto, courseId?: string): Promise<DocItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/docs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      })
      if (response.ok) {
        const data = await response.json()
        return data.doc as DocItem
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.createDoc(dto, courseId)
  }

  async updateDoc(id: string, dto: UpdateDocDto, courseId?: string): Promise<DocItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      })
      if (response.ok) {
        const data = await response.json()
        return data.doc as DocItem
      }
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.updateDoc(id, dto, courseId)
  }

  async deleteDoc(id: string, courseId?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) return
    } catch (e) {
      // Fallback
    }
    return this.fallbackRepo.deleteDoc(id, courseId)
  }

  async resetToDefaults(): Promise<CourseCodex[]> {
    return this.fallbackRepo.resetToDefaults()
  }
  // #endregion Методы работы с модулями и главами
}
