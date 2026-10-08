<script setup lang="ts">
// #region defineProps
interface Props {
  courseTitle: string
  lessonTitle: string
  progress: number
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'resume'): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="quick-continue-widget" @click="emit('resume')">
    <div class="quick-continue-widget__info">
      <span class="quick-continue-widget__badge">🔥 Продолжить обучение</span>
      <h4 class="quick-continue-widget__course">{{ props.courseTitle }}</h4>
      <p class="quick-continue-widget__lesson">Урок: {{ props.lessonTitle }}</p>
    </div>

    <button
      type="button"
      class="quick-continue-widget__btn"
      @click.stop="emit('resume')"
    >
      <span>К уроку</span>
      <span>▶</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.quick-continue-widget {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 14px;
  padding: 1.1rem 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: #a5b4fc;
    letter-spacing: 0.05em;
  }

  &__course {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__lesson {
    font-size: 0.85rem;
    color: #cbd5e1;
    margin: 0;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #6366f1;
    color: #ffffff;
    border: none;
    padding: 0.55rem 1.1rem;
    font-size: 0.875rem;
    font-weight: 700;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;

    &:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.55);
    }
  }
}
</style>
