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

export interface AssignmentSubmission {
  code?: string
  repoUrl?: string
  notes?: string
  submittedAt: string
}

export interface AssignmentMentorFeedback {
  comment: string
  reviewerName: string
  reviewedAt: string
}

export interface AssignmentItem {
  id: string
  title: string
  courseTitle: string
  courseSlug?: string
  type?: 'lab' | 'quiz' | 'project'
  description?: string
  requirements?: string[]
  submittedAt?: string
  status: 'pending' | 'review' | 'passed' | 'rejected'
  score?: number
  maxScore: number
  xpReward?: number
  submission?: AssignmentSubmission
  mentorFeedback?: AssignmentMentorFeedback
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
