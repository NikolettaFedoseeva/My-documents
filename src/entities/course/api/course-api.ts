import { Course, AssignmentItem, Achievement, UserCabinetStats } from '../types'

const MOCK_COURSES: Course[] = [
  {
    id: 'course-vue3',
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

export class CourseApiService {
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
   * Получение сданных заданий
   */
  static async getAssignments(): Promise<AssignmentItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(MOCK_ASSIGNMENTS)))
      }, 300)
    })
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
