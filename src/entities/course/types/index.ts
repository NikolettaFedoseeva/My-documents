export interface Course {
  id: string
  slug?: string
  title: string
  category: string
  icon: string
  description: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastLessonTitle: string
  updatedAt: string
}

export interface AssignmentItem {
  id: string
  title: string
  courseTitle: string
  submittedAt: string
  status: 'passed' | 'review' | 'rejected'
  score?: number
  maxScore: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  isUnlocked: boolean
}

export interface UserCabinetStats {
  completedCoursesCount: number
  totalCoursesCount: number
  completedLessonsCount: number
  learningHours: number
  streakDays: number
  averageScore: number
}
