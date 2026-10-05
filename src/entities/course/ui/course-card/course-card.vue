<script setup lang="ts">
import { Course } from '../../types'

// #region defineProps
interface Props {
  course: Course
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'continue', courseId: string): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="course-card">
    <div class="course-card__header">
      <div class="course-card__badge">
        <span class="course-card__icon">{{ props.course.icon }}</span>
        <span class="course-card__category">{{ props.course.category }}</span>
      </div>

      <span class="course-card__percent">{{ props.course.progress }}%</span>
    </div>

    <div class="course-card__body">
      <h3 class="course-card__title">{{ props.course.title }}</h3>
      <p class="course-card__desc">{{ props.course.description }}</p>

      <div class="course-card__progress-bar">
        <div
          class="course-card__progress-fill"
          :style="{ width: `${props.course.progress}%` }"
        ></div>
      </div>

      <div class="course-card__meta">
        <span>📖 {{ props.course.completedLessons }} из {{ props.course.totalLessons }} уроков</span>
        <span>Обновлено {{ props.course.updatedAt }}</span>
      </div>
    </div>

    <div class="course-card__footer">
      <div class="course-card__last-lesson">
        <span class="course-card__last-label">Текущий урок:</span>
        <span class="course-card__last-title">{{ props.course.lastLessonTitle }}</span>
      </div>

      <button
        type="button"
        class="course-card__btn"
        @click="emit('continue', props.course.id)"
      >
        <span>Продолжить</span>
        <span>→</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.course-card {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.35rem;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.15);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.25rem 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__icon {
    font-size: 1rem;
  }

  &__category {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
  }

  &__percent {
    font-size: 0.875rem;
    font-weight: 700;
    color: #818cf8;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;
    margin: 0;
  }

  &__desc {
    font-size: 0.85rem;
    color: #94a3b8;
    line-height: 1.4;
    margin: 0;
  }

  &__progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 0.4rem;
  }

  &__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
    border-radius: 9999px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #64748b;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    gap: 1rem;
  }

  &__last-lesson {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__last-label {
    font-size: 0.7rem;
    color: #64748b;
  }

  &__last-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #cbd5e1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
    padding: 0.45rem 0.85rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background: #6366f1;
      color: #ffffff;
      transform: translateX(2px);
    }
  }
}
</style>
