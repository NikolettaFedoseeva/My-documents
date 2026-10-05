<script setup lang="ts">
import { Course, CourseCard } from '@/entities/course'
import { QuickContinueWidget } from '@/features/track-progress'

// #region defineProps
interface Props {
  courses: Course[]
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'continue-course', courseId: string): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="cabinet-courses-tab">
    <!-- Быстрое продолжение активного урока -->
    <QuickContinueWidget
      v-if="props.courses.length > 0"
      :course-title="props.courses[0].title"
      :lesson-title="props.courses[0].lastLessonTitle"
      :progress="props.courses[0].progress"
      @resume="emit('continue-course', props.courses[0].id)"
    />

    <div class="cabinet-courses-tab__header">
      <h3 class="cabinet-courses-tab__title">Ваши курсы</h3>
      <span class="cabinet-courses-tab__count">Всего: {{ props.courses.length }}</span>
    </div>

    <div class="cabinet-courses-tab__grid">
      <CourseCard
        v-for="course in props.courses"
        :key="course.id"
        :course="course"
        @continue="emit('continue-course', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-courses-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__count {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
}
</style>
