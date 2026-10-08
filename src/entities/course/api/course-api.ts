import { Course, AssignmentItem, Achievement, UserCabinetStats } from '../types'

const MOCK_COURSES: Course[] = [
  {
    id: 'course-vue3',
    slug: 'vue3-mastery',
    title: 'Vue 3 & TypeScript Pro',
    category: 'Frontend',
    icon: '⚡',
    description: 'Продвинутый курс по Vue 3 Composition API, TypeScript и Vite.',
    progress: 75,
    totalLessons: 32,
    completedLessons: 24,
    lastLessonTitle: 'Кастомные директивы и Composables',
    updatedAt: '2026-09-02',
  },
  {
    id: 'course-fsd',
    slug: 'lern-architecture',
    title: 'Feature-Sliced Design в реальных проектах',
    category: 'Архитектура',
    icon: '🏗️',
    description: 'Масштабируемая фронтенд архитектура от слоев до публичных API.',
    progress: 40,
    totalLessons: 20,
    completedLessons: 8,
    lastLessonTitle: 'Слой Entities и Адаптеры данных',
    updatedAt: '2026-09-01',
  },
  {
    id: 'course-nestjs',
    slug: 'postgres-db',
    title: 'NestJS & Supabase Microservices',
    category: 'Backend',
    icon: '🚀',
    description: 'Разработка микросервисов, JWT авторизация и облачный PostgreSQL.',
    progress: 10,
    totalLessons: 28,
    completedLessons: 3,
    lastLessonTitle: 'Подключение Supabase JS Client',
    updatedAt: '2026-08-29',
  },
]

const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'assign-1',
    title: 'Лабораторная №4: Реактивность в Vue 3',
    courseTitle: 'Vue 3 & TypeScript Pro',
    submittedAt: 'Вчера, 18:40',
    status: 'passed',
    score: 98,
    maxScore: 100,
  },
  {
    id: 'assign-2',
    title: 'Лабораторная №2: Проектирование Entities',
    courseTitle: 'Feature-Sliced Design',
    submittedAt: '2 дня назад',
    status: 'review',
    maxScore: 100,
  },
  {
    id: 'assign-3',
    title: 'Тест №1: Основы TypeScript',
    courseTitle: 'Vue 3 & TypeScript Pro',
    submittedAt: '3 дня назад',
    status: 'passed',
    score: 100,
    maxScore: 100,
  },
]

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Первый Код 💻',
    description: 'Успешно отправлена первая лабораторная работа.',
    icon: '🎯',
    unlockedAt: '2026-08-15',
    isUnlocked: true,
  },
  {
    id: 'ach-2',
    title: 'Серия 7 Дней 🔥',
    description: 'Занимался на платформе 7 дней подряд без перерывов.',
    icon: '🔥',
    unlockedAt: '2026-08-28',
    isUnlocked: true,
  },
  {
    id: 'ach-3',
    title: 'Мастер Vue 3 ⚡',
    description: 'Завершил 20+ практических уроков по Vue 3.',
    icon: '🏆',
    unlockedAt: '2026-09-02',
    isUnlocked: true,
  },
  {
    id: 'ach-4',
    title: 'Архитектор FSD 🏛️',
    description: 'Полностью прошел курс по Feature-Sliced Design.',
    icon: '👑',
    isUnlocked: false,
  },
]

const MOCK_STATS: UserCabinetStats = {
  completedCoursesCount: 2,
  totalCoursesCount: 5,
  completedLessonsCount: 35,
  learningHours: 28.5,
  streakDays: 7,
  averageScore: 96,
}

import { API_BASE_URL, getAuthHeaders } from '@/shared/api'

const STORAGE_KEY_ASSIGNMENTS = 'lern_user_assignments_v1'

export class CourseApiService {
  private static getHeaders(): HeadersInit {
    return getAuthHeaders()
  }

  /**
   * Получение списка всех курсов пользователя
   */
  static async getUserCourses(): Promise<Course[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(MOCK_COURSES)))
      }, 350)
    })
  }

  /**
   * Получение списка практических заданий и лабораторных работ
   */
  static async getAssignments(): Promise<AssignmentItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        headers: this.getHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(data))
          return data
        }
      }
    } catch (e) {
      // Fallback
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      // Ignored
    }

    const defaultItems: AssignmentItem[] = [
      {
        id: 'assign-vue-reactive',
        title: 'Лабораторная №1: Реактивная система на Proxy и Custom Ref',
        courseTitle: 'Vue 3 & Composition API',
        courseSlug: 'vue3-mastery',
        type: 'lab',
        description: 'Разработать собственный мини-движок реактивности с поддержкой track, trigger и customRef для кеширования тяжелых вычислений.',
        requirements: [
          'Реализация функции reactive() через ES6 Proxy',
          'Механизм сбора зависимостей в effect()',
          'Поддержка отслеживания изменений во вложенных объектах',
        ],
        maxScore: 100,
        xpReward: 150,
        status: 'passed',
        score: 95,
        submittedAt: 'Вчера, 18:30',
        submission: {
          repoUrl: 'https://github.com/student/vue3-proxy-lab',
          notes: 'Выполнил все требования + добавил поддержку ShallowRef.',
          submittedAt: 'Вчера, 18:30',
        },
        mentorFeedback: {
          reviewerName: 'Елена (Преподаватель)',
          comment: 'Великолепная работа! Чистый код, отличная реализация WeakMap для связывания зависимостей.',
          reviewedAt: 'Сегодня, 10:15',
        },
      },
      {
        id: 'assign-ts-generics',
        title: 'Лабораторная №2: Типизация библиотеки валидации с Infer и Generics',
        courseTitle: 'TypeScript Pro: Продвинутая Типизация',
        courseSlug: 'ts-pro',
        type: 'lab',
        description: 'Спроектировать строго типизированную библиотеку схем валидации (аналог Zod) с выводом типов через infer.',
        requirements: [
          'Условный тип InferType<Schema>',
          'Строгая проверка типов полей в рантайме и дизайн-тайме',
          'Запрет лишних свойств через Record<string, unknown>',
        ],
        maxScore: 100,
        xpReward: 200,
        status: 'review',
        submittedAt: '2 дня назад, 14:20',
        submission: {
          repoUrl: 'https://github.com/student/ts-schema-validator',
          notes: 'Реализовал базовые типы: string, number, object, array.',
          submittedAt: '2 дня назад, 14:20',
        },
      },
      {
        id: 'assign-fsd-layers',
        title: 'Практическая работа №3: Декомпозиция фичи и слоёв по методологии FSD',
        courseTitle: 'Feature-Sliced Design: Архитектура',
        courseSlug: 'fsd-arch',
        type: 'project',
        description: 'Произвести рефакторинг спагетти-компонента корзины интернет-магазина в строгую архитектуру FSD.',
        requirements: [
          'Выделение Entities (cart, product), Features (add-to-cart), Widgets (cart-modal)',
          'Соблюдение правил однонаправленного потока импортов',
          'Оформление публичных API через index.ts',
        ],
        maxScore: 100,
        xpReward: 180,
        status: 'pending',
      },
      {
        id: 'assign-pg-btree',
        title: 'Лабораторная №4: Оптимизация сложных запросов и анализ EXPLAIN ANALYZE',
        courseTitle: 'PostgreSQL: От индексов до оптимизации',
        courseSlug: 'postgres-db',
        type: 'lab',
        description: 'Настроить составные B-Tree и GIN индексы для ускорения поиска по 1 000 000 строк таблицы заказов.',
        requirements: [
          'Ускорение запроса фильтрации с 850ms до < 10ms',
          'Анализ Buffer Hits и устранение Seq Scan',
          'Отчёт с логами EXPLAIN (ANALYZE, BUFFERS)',
        ],
        maxScore: 100,
        xpReward: 150,
        status: 'pending',
      },
    ]

    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(defaultItems))
    return defaultItems
  }

  /**
   * Сдача решения практической работы (код / репозиторий)
   */
  static async submitAssignment(
    id: string,
    payload: { repoUrl?: string; code?: string; notes?: string }
  ): Promise<AssignmentItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.assignment) {
          await this.syncLocalAssignment(data.assignment)
          return data.assignment
        }
      }
    } catch (e) {
      // Fallback
    }

    const items = await this.getAssignments()
    const target = items.find((a) => a.id === id)
    if (!target) throw new Error('Задание не найдено')

    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    target.status = 'review'
    target.submittedAt = `Сегодня, ${now}`
    target.submission = {
      repoUrl: payload.repoUrl,
      code: payload.code,
      notes: payload.notes,
      submittedAt: target.submittedAt,
    }

    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(items))
    return target
  }

  /**
   * Оценка работы ментором (для админки и тестирования)
   */
  static async gradeAssignment(
    id: string,
    payload: { status: 'passed' | 'rejected'; score: number; comment: string; reviewerName?: string }
  ): Promise<AssignmentItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/grade`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.assignment) {
          await this.syncLocalAssignment(data.assignment)
          return data.assignment
        }
      }
    } catch (e) {
      // Fallback
    }

    const items = await this.getAssignments()
    const target = items.find((a) => a.id === id)
    if (!target) throw new Error('Задание не найдено')

    target.status = payload.status
    target.score = payload.score
    target.mentorFeedback = {
      reviewerName: payload.reviewerName || 'Елена (Преподаватель)',
      comment: payload.comment,
      reviewedAt: 'Только что',
    }

    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(items))
    return target
  }

  private static async syncLocalAssignment(updated: AssignmentItem): Promise<void> {
    try {
      const items = await this.getAssignments()
      const index = items.findIndex((a) => a.id === updated.id)
      if (index !== -1) {
        items[index] = updated
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(items))
      }
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Получение наград и бейджей
   */
  static async getAchievements(): Promise<Achievement[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(MOCK_ACHIEVEMENTS)))
      }, 250)
    })
  }

  /**
   * Получение общей статистики кабинета
   */
  static async getCabinetStats(): Promise<UserCabinetStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_STATS })
      }, 200)
    })
  }
}
