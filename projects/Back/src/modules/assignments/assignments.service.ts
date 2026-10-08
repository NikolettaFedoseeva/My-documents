import { supabaseAdmin } from '../../config/supabase'

export interface AssignmentRecord {
  id: string
  title: string
  courseTitle: string
  courseSlug: string
  type: 'lab' | 'quiz' | 'project'
  description: string
  requirements: string[]
  maxScore: number
  xpReward: number
  status: 'pending' | 'review' | 'passed' | 'rejected'
  score?: number
  submittedAt?: string
  submission?: {
    code?: string
    repoUrl?: string
    notes?: string
    submittedAt: string
  }
  mentorFeedback?: {
    comment: string
    reviewerName: string
    reviewedAt: string
  }
}

const DEFAULT_ASSIGNMENTS: AssignmentRecord[] = [
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

// Кэш заданий в памяти сервиса с синхронизацией
const assignmentsMemory: Map<string, AssignmentRecord[]> = new Map()

export class AssignmentsService {
  static async getUserAssignments(userId: string): Promise<AssignmentRecord[]> {
    if (!assignmentsMemory.has(userId)) {
      assignmentsMemory.set(userId, JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS)))
    }
    return assignmentsMemory.get(userId) || DEFAULT_ASSIGNMENTS
  }

  static async submitAssignment(
    userId: string,
    assignmentId: string,
    payload: { repoUrl?: string; code?: string; notes?: string }
  ): Promise<AssignmentRecord> {
    const list = await this.getUserAssignments(userId)
    const target = list.find((a) => a.id === assignmentId)

    if (!target) {
      throw new Error('Задание не найдено')
    }

    const now = new Date().toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    target.status = 'review'
    target.submittedAt = `Сегодня, ${now.split(',')[1]?.trim() || 'сейчас'}`
    target.submission = {
      repoUrl: payload.repoUrl,
      code: payload.code,
      notes: payload.notes,
      submittedAt: target.submittedAt,
    }

    return target
  }

  static async gradeAssignment(
    userId: string,
    assignmentId: string,
    payload: { status: 'passed' | 'rejected'; score: number; comment: string; reviewerName?: string }
  ): Promise<AssignmentRecord> {
    const list = await this.getUserAssignments(userId)
    const target = list.find((a) => a.id === assignmentId)

    if (!target) {
      throw new Error('Задание не найдено')
    }

    target.status = payload.status
    target.score = payload.score
    target.mentorFeedback = {
      reviewerName: payload.reviewerName || 'Елена (Преподаватель)',
      comment: payload.comment,
      reviewedAt: 'Только что',
    }

    // Если задание принято — начисляем пользователю бонусный XP в базу данных Supabase
    if (payload.status === 'passed' && target.xpReward > 0) {
      try {
        const { data: user } = await supabaseAdmin.from('users').select('xp, level').eq('id', userId).single()
        if (user) {
          const newXp = (user.xp || 0) + target.xpReward
          const newLevel = Math.max(1, Math.floor(newXp / 500) + 1)
          await supabaseAdmin.from('users').update({ xp: newXp, level: newLevel }).eq('id', userId)
        }
      } catch (err) {
        console.warn('[AssignmentsService] Ошибка начисления XP в Supabase:', err)
      }
    }

    return target
  }
}
