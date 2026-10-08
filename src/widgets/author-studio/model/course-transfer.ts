import type { CourseCodex, DocCategory, DocItem } from '@/entities/doc'

/**
 * Скачать объект данных в виде форматированного JSON-файла
 */
export function downloadJsonFile(filename: string, data: unknown): void {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Экспорт одного курса в формате JSON
 */
export function exportSingleCourse(course: CourseCodex): void {
  const exportPayload = {
    $schema: 'https://lern.dev/schemas/course-v1.json',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    course,
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  const safeSlug = (course.slug || course.id || 'course').replace(/[^a-z0-9_-]/gi, '_')
  const filename = `lern-course-${safeSlug}-${dateStr}.json`

  downloadJsonFile(filename, exportPayload)
}

/**
 * Экспорт полной резервной копии всех курсов платформы
 */
export function exportAllCoursesBackup(courses: CourseCodex[]): void {
  const exportPayload = {
    $schema: 'https://lern.dev/schemas/backup-v1.json',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    platform: 'LERN Knowledge Platform',
    coursesCount: courses.length,
    courses,
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `lern-courses-backup-${dateStr}.json`

  downloadJsonFile(filename, exportPayload)
}

export interface ParsedImportCourse {
  course: CourseCodex
  isConflict: boolean
  existingCourseTitle?: string
  modulesCount: number
  chaptersCount: number
}

export interface ParseImportPayloadResult {
  success: boolean
  errorMessage?: string
  isBatch: boolean
  courses: ParsedImportCourse[]
}

/**
 * Нормализация и валидация входящей структуры курса
 */
function normalizeCourseItem(raw: any, index: number): CourseCodex {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Элемент #${index + 1} не является корректным объектом курса`)
  }

  if (!raw.title || typeof raw.title !== 'string' || !raw.title.trim()) {
    throw new Error(`У курса #${index + 1} отсутствует обязательное поле "title"`)
  }

  const rawModules: any[] = Array.isArray(raw.modules) ? raw.modules : []
  const normalizedModules: DocCategory[] = rawModules.map((m, mIdx) => {
    const rawItems: any[] = Array.isArray(m?.items) ? m.items : []
    const normalizedItems: DocItem[] = rawItems.map((item, dIdx) => ({
      id: item?.id || `doc-import-${Date.now()}-${mIdx}-${dIdx}`,
      categoryId: item?.categoryId || m?.id || `cat-${mIdx}`,
      code: item?.code || `${String(mIdx + 1).padStart(2, '0')}.${dIdx + 1}`,
      title: item?.title || `Глава ${dIdx + 1}`,
      description: item?.description || '',
      author: item?.author || {
        name: 'Автор LERN',
        role: 'Преподаватель',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      updatedAt: item?.updatedAt || new Date().toISOString().split('T')[0],
      readTimeMinutes: Number(item?.readTimeMinutes) || 4,
      tags: Array.isArray(item?.tags) ? item.tags : ['Импорт'],
      usefulCount: Number(item?.usefulCount) || 0,
      notUsefulCount: Number(item?.notUsefulCount) || 0,
      sections: Array.isArray(item?.sections) ? item.sections : (Array.isArray(item?.content) ? item.content : []),
      flashcard: item?.flashcard || item?.interactiveFlashcards || undefined,
      quiz: item?.quiz || item?.quizQuestions || undefined,
    }))

    return {
      id: m?.id || `cat-import-${Date.now()}-${mIdx}`,
      code: m?.code || String(mIdx + 1).padStart(2, '0'),
      title: m?.title || `Модуль ${mIdx + 1}`,
      icon: m?.icon || '📁',
      description: m?.description || '',
      items: normalizedItems,
      progressPercent: 0,
    }
  })

  const totalChapters = normalizedModules.reduce((sum, m) => sum + m.items.length, 0)

  return {
    id: raw.id || `course-import-${Date.now()}-${index}`,
    slug: raw.slug || `course-${Date.now()}-${index}`,
    title: raw.title.trim(),
    description: raw.description || '',
    category: raw.category || 'Общие знания',
    icon: raw.icon || '📚',
    level: ['beginner', 'intermediate', 'advanced'].includes(raw.level) ? raw.level : 'intermediate',
    author: raw.author || {
      name: 'Автор LERN',
      role: 'Преподаватель',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : ['Импортировано'],
    isPublished: raw.isPublished !== undefined ? Boolean(raw.isPublished) : true,
    modules: normalizedModules,
    totalChapters,
    estimatedHours: Number(raw.estimatedHours) || Math.max(1, Math.round(totalChapters * 0.5)),
    createdAt: raw.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  }
}

/**
 * Валидация и разбор входящего JSON для импорта
 */
export function parseAndValidateCourseJson(
  rawJson: string,
  existingCourses: CourseCodex[]
): ParseImportPayloadResult {
  const trimmed = rawJson.trim()
  if (!trimmed) {
    return {
      success: false,
      errorMessage: 'Строка JSON пуста. Пожалуйста, выберите файл или вставьте содержимое.',
      isBatch: false,
      courses: [],
    }
  }

  let parsed: any
  try {
    parsed = JSON.parse(trimmed)
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `Синтаксическая ошибка в JSON: ${err?.message || 'некорректный синтаксис'}`,
      isBatch: false,
      courses: [],
    }
  }

  // Определение формата: одиночный курс, массив или объект резервной копии
  let rawList: any[] = []
  let isBatch = false

  if (Array.isArray(parsed)) {
    rawList = parsed
    isBatch = rawList.length > 1
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.courses)) {
      rawList = parsed.courses
      isBatch = rawList.length > 1
    } else if (parsed.course && typeof parsed.course === 'object') {
      rawList = [parsed.course]
      isBatch = false
    } else {
      rawList = [parsed]
      isBatch = false
    }
  }

  if (rawList.length === 0) {
    return {
      success: false,
      errorMessage: 'В переданном JSON не обнаружено данных курсов для импорта.',
      isBatch: false,
      courses: [],
    }
  }

  const resultCourses: ParsedImportCourse[] = []

  for (let i = 0; i < rawList.length; i++) {
    try {
      const normalized = normalizeCourseItem(rawList[i], i)
      const existing = existingCourses.find((c) => c.id === normalized.id || c.slug === normalized.slug)

      const chaptersCount = normalized.modules.reduce((sum, m) => sum + m.items.length, 0)

      resultCourses.push({
        course: normalized,
        isConflict: Boolean(existing),
        existingCourseTitle: existing?.title,
        modulesCount: normalized.modules.length,
        chaptersCount,
      })
    } catch (valErr: any) {
      return {
        success: false,
        errorMessage: valErr?.message || `Ошибка валидации курса #${i + 1}`,
        isBatch,
        courses: [],
      }
    }
  }

  return {
    success: true,
    isBatch,
    courses: resultCourses,
  }
}
