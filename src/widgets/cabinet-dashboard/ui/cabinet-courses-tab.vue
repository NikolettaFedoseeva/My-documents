<script setup lang="ts">
import { ref } from 'vue'
import { Course, CourseCard } from '@/entities/course'
import { QuickContinueWidget } from '@/features/track-progress'
import { DeckTrainerModal } from '@/features/train-deck'

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

const isDeckTrainerOpen = ref<boolean>(false)
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
      <div class="cabinet-courses-tab__title-group">
        <h3 class="cabinet-courses-tab__title">Ваши курсы</h3>
        <span class="cabinet-courses-tab__count">Всего: {{ props.courses.length }}</span>
      </div>

      <button
        type="button"
        class="btn-train-recall"
        @click="isDeckTrainerOpen = true"
      >
        <span class="btn-train-icon">🧠</span>
        <span class="btn-train-text">Тренировка памяти Active Recall</span>
        <span class="btn-train-badge">3D Focus</span>
      </button>
    </div>

    <div class="cabinet-courses-tab__grid">
      <CourseCard
        v-for="course in props.courses"
        :key="course.id"
        :course="course"
        @continue="emit('continue-course', $event)"
      />
    </div>

    <!-- Полноэкранный тренажер колоды карточек Active Recall -->
    <DeckTrainerModal
      v-if="isDeckTrainerOpen"
      @close="isDeckTrainerOpen = false"
    />
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

  &__title-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
}

.btn-train-recall {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%);
  border: 1px solid rgba(168, 85, 247, 0.5);
  color: #ffffff;
  padding: 0.6rem 1.1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
  }
}

.btn-train-icon {
  font-size: 1.1rem;
}

.btn-train-badge {
  background: rgba(255, 255, 255, 0.15);
  color: #fef08a;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}
</style>
