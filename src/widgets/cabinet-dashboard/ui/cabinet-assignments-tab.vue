<script setup lang="ts">
import { AssignmentItem } from '@/entities/course'

// #region defineProps
interface Props {
  assignments: AssignmentItem[]
}

const props = defineProps<Props>()
// #endregion defineProps
</script>

<template>
  <div class="cabinet-assignments-tab">
    <h3 class="cabinet-assignments-tab__title">История сданных работ и тестов</h3>

    <div class="cabinet-assignments-tab__list">
      <div
        v-for="item in props.assignments"
        :key="item.id"
        class="cabinet-assignments-tab__item"
      >
        <div class="cabinet-assignments-tab__info">
          <span class="cabinet-assignments-tab__course">{{ item.courseTitle }}</span>
          <h4 class="cabinet-assignments-tab__item-title">{{ item.title }}</h4>
          <span class="cabinet-assignments-tab__date">Сдано: {{ item.submittedAt }}</span>
        </div>

        <div class="cabinet-assignments-tab__status-box">
          <span
            v-if="item.status === 'passed'"
            class="cabinet-assignments-tab__badge cabinet-assignments-tab__badge--passed"
          >
            ✓ Проверено ({{ item.score }}/{{ item.maxScore }})
          </span>

          <span
            v-else-if="item.status === 'review'"
            class="cabinet-assignments-tab__badge cabinet-assignments-tab__badge--review"
          >
            ⏳ На проверке
          </span>

          <span
            v-else
            class="cabinet-assignments-tab__badge cabinet-assignments-tab__badge--rejected"
          >
            ✕ На доработке
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-assignments-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem 1.25rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__course {
    font-size: 0.75rem;
    font-weight: 600;
    color: #818cf8;
  }

  &__item-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  &__date {
    font-size: 0.75rem;
    color: #64748b;
  }

  &__badge {
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;

    &--passed {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    &--review {
      background: rgba(245, 158, 11, 0.15);
      color: #fde68a;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    &--rejected {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  }
}
</style>
