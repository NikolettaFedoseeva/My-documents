import {
  parseAndValidateCourseJson,
  exportSingleCourse,
  exportAllCoursesBackup,
} from '@/widgets/author-studio/model/course-transfer'
import type { CourseCodex } from '@/entities/doc'

describe('Course Transfer Adapter (JSON Import & Export)', () => {
  const mockExistingCourse: CourseCodex = {
    id: 'vue3-core',
    slug: 'vue-3',
    title: 'Vue 3 & Composition API',
    description: 'Основы реактивности',
    icon: '⚡',
    category: 'Frontend',
    level: 'beginner',
    totalChapters: 3,
    estimatedHours: 6,
    modules: [],
  }

  test('успешно парсит валидный JSON отдельного курса', () => {
    const validJson = JSON.stringify({
      title: 'TypeScript Advanced',
      slug: 'ts-adv',
      description: 'Продвинутый TypeScript',
      icon: '📘',
      category: 'Frontend',
      level: 'intermediate',
      modules: [
        {
          title: 'Модуль 1',
          items: [
            {
              title: 'Глава 1: Дженерики',
              description: 'Параметризованные типы',
            },
          ],
        },
      ],
    })

    const result = parseAndValidateCourseJson(validJson, [mockExistingCourse])

    expect(result.success).toBe(true)
    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].course.title).toBe('TypeScript Advanced')
    expect(result.courses[0].isConflict).toBe(false)
    expect(result.courses[0].modulesCount).toBe(1)
    expect(result.courses[0].chaptersCount).toBe(1)
  })

  test('корректно обнаруживает коллизию по id или slug с существующим курсом', () => {
    const conflictJson = JSON.stringify({
      course: {
        id: 'vue3-core',
        title: 'Новая версия Vue 3',
        modules: [],
      },
    })

    const result = parseAndValidateCourseJson(conflictJson, [mockExistingCourse])

    expect(result.success).toBe(true)
    expect(result.courses[0].isConflict).toBe(true)
    expect(result.courses[0].existingCourseTitle).toBe('Vue 3 & Composition API')
  })

  test('возвращает ошибку при невалидном синтаксисе JSON', () => {
    const invalidJson = '{ title: "сломанный json без кавычек" '

    const result = parseAndValidateCourseJson(invalidJson, [])

    expect(result.success).toBe(false)
    expect(result.errorMessage).toContain('Синтаксическая ошибка')
  })

  test('возвращает ошибку, если у курса отсутствует обязательное поле title', () => {
    const noTitleJson = JSON.stringify({
      description: 'Курс без названия',
      modules: [],
    })

    const result = parseAndValidateCourseJson(noTitleJson, [])

    expect(result.success).toBe(false)
    expect(result.errorMessage).toContain('отсутствует обязательное поле "title"')
  })

  test('успешно парсит пакетный бэкап нескольких курсов (backup-v1)', () => {
    const batchJson = JSON.stringify({
      platform: 'LERN Knowledge Platform',
      coursesCount: 2,
      courses: [
        { title: 'Курс А', modules: [] },
        { title: 'Курс Б', modules: [] },
      ],
    })

    const result = parseAndValidateCourseJson(batchJson, [])

    expect(result.success).toBe(true)
    expect(result.isBatch).toBe(true)
    expect(result.courses).toHaveLength(2)
  })
})
