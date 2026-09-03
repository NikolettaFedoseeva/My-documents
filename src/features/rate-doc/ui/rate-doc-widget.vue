<script setup lang="ts">
import { ref } from 'vue'
import { DocApiService } from '@/entities/doc'

// #region defineProps
interface Props {
  docId: string
  usefulCount: number
  notUsefulCount: number
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'rated', payload: { usefulCount: number; notUsefulCount: number }): void
}>()
// #endregion defineEmits

// #region refs
const hasVoted = ref<boolean>(false)
const userChoice = ref<boolean | null>(null)
const currentUseful = ref<number>(props.usefulCount)
const currentNotUseful = ref<number>(props.notUsefulCount)
const isSubmitting = ref<boolean>(false)
// #endregion refs

// #region Функции
const vote = async (isUseful: boolean): Promise<void> => {
  if (hasVoted.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await DocApiService.rateDoc({
      docId: props.docId,
      isUseful,
    })

    if (result.success) {
      hasVoted.value = true
      userChoice.value = isUseful
      currentUseful.value = result.usefulCount
      currentNotUseful.value = result.notUsefulCount
      emit('rated', { usefulCount: result.usefulCount, notUsefulCount: result.notUsefulCount })
    }
  } catch (err) {
    console.error('Ошибка отправки оценки:', err)
  } finally {
    isSubmitting.value = false
  }
}
// #endregion Функции
</script>

<template>
  <div class="rate-doc-widget">
    <div v-if="!hasVoted" class="rate-doc-widget__prompt">
      <span class="rate-doc-widget__title">Была ли эта статья полезна?</span>

      <div class="rate-doc-widget__actions">
        <button
          type="button"
          class="rate-doc-widget__btn rate-doc-widget__btn--yes"
          :disabled="isSubmitting"
          @click="vote(true)"
        >
          👍 Да ({{ currentUseful }})
        </button>

        <button
          type="button"
          class="rate-doc-widget__btn rate-doc-widget__btn--no"
          :disabled="isSubmitting"
          @click="vote(false)"
        >
          👎 Нет ({{ currentNotUseful }})
        </button>
      </div>
    </div>

    <div v-else class="rate-doc-widget__thank-you">
      <span class="rate-doc-widget__icon">🎉</span>
      <span class="rate-doc-widget__text">
        Спасибо за ваш отзыв! Вы выбрали: {{ userChoice ? '👍 Да' : '👎 Нет' }}.
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rate-doc-widget {
  margin-top: 2.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &__prompt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 500;
    color: #e2e8f0;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.9rem;
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &--yes:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
    }

    &--no:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__thank-you {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #34d399;
    font-size: 0.9rem;
    font-weight: 500;
  }

  &__icon {
    font-size: 1.1rem;
  }
}
</style>
