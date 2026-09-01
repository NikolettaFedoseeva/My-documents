<script setup lang="ts">
import { ref } from 'vue'
import UiBadge from '../ui-badge'
import UiButton from '../ui-button'
import type { QuestionData } from './types'

interface Props {
  data: QuestionData
}


const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'rate', payload: { id: string | number; rating: 'know' | 'doubt' | 'repeat' }): void
}>()
// #endregion Interfaces & Props

// #region State
const isFlipped = ref<boolean>(false)
const showHint = ref<boolean>(false)
// #endregion State

// #region Functions
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const toggleHint = () => {
  showHint.value = !showHint.value
}

const handleRate = (rating: 'know' | 'doubt' | 'repeat') => {
  emit('rate', { id: props.data.id, rating })
  // Плавный сброс переворота при следующей карточке
  setTimeout(() => {
    isFlipped.value = false
    showHint.value = false
  }, 250)
}
// #endregion Functions
</script>

<template>
  <div class="flashcard-container">
    <div
      class="flashcard"
      :class="{ 'flashcard--flipped': isFlipped }"
      @click="toggleFlip"
    >
      <!-- FRONT SIDE (Question) -->
      <div class="flashcard__side flashcard__front">
        <div class="flashcard__header">
          <div class="flashcard__meta">
            <UiBadge variant="primary" size="sm">{{ data.category }}</UiBadge>
            <UiBadge variant="secondary" size="sm">{{ data.section }}</UiBadge>
          </div>
          <UiBadge
            :variant="data.difficulty === 'easy' ? 'success' : data.difficulty === 'medium' ? 'warning' : 'danger'"
            size="sm"
            dot
          >
            {{ data.difficulty === 'easy' ? 'Легкий' : data.difficulty === 'medium' ? 'Средний' : 'Сложный' }}
          </UiBadge>
        </div>

        <div class="flashcard__content">
          <span class="flashcard__label">ВОПРОС:</span>
          <h3 class="flashcard__question-text">{{ data.question }}</h3>
        </div>

        <!-- Hint Section -->
        <div v-if="data.hint" class="flashcard__hint-container" @click.stop>
          <UiButton
            variant="ghost"
            size="sm"
            @click="toggleHint"
          >
            <template #icon-left>💡</template>
            {{ showHint ? 'Скрыть подсказку' : 'Показать подсказку' }}
          </UiButton>
          <p v-if="showHint" class="flashcard__hint-text">
            {{ data.hint }}
          </p>
        </div>

        <div class="flashcard__footer">
          <span class="flashcard__flip-notice">
            <span>🔄</span> Кликните, чтобы открыть ответ
          </span>
        </div>
      </div>

      <!-- BACK SIDE (Answer & Self-Rating) -->
      <div class="flashcard__side flashcard__back">
        <div class="flashcard__header">
          <UiBadge variant="success" size="sm">ОТВЕТ</UiBadge>

          <UiButton
            variant="ghost"
            size="sm"
            icon-only
            @click.stop="toggleFlip"
          >
            ✕
          </UiButton>
        </div>

        <div class="flashcard__content">
          <p class="flashcard__answer-text">{{ data.answer }}</p>
        </div>

        <div class="flashcard__rating-section" @click.stop>
          <span class="flashcard__rating-title">Как оцените своё знание?</span>
          <div class="flashcard__rating-buttons">
            <UiButton
              variant="danger"
              size="sm"
              @click="handleRate('repeat')"
            >
              <template #icon-left>🔴</template>
              Повторить
            </UiButton>

            <UiButton
              variant="warning"
              size="sm"
              @click="handleRate('doubt')"
            >
              <template #icon-left>🟡</template>
              Сомневаюсь
            </UiButton>

            <UiButton
              variant="success"
              size="sm"
              @click="handleRate('know')"
            >
              <template #icon-left>🟢</template>
              Знаю
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flashcard-container {
  perspective: 1200px;
  width: 100%;
  max-width: 640px;
  min-height: 380px;
  margin: 0 auto;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 380px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &--flipped {
    transform: rotateY(180deg);
  }

  &__side {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    min-height: 380px;
    backface-visibility: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    box-shadow: var(--shadow-main);
    backdrop-filter: var(--card-blur);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      border-color: var(--border-color-glow);
      box-shadow: var(--shadow-glow);
    }
  }

  &__front {
    z-index: 2;
  }

  &__back {
    transform: rotateY(180deg);
    background: var(--bg-card-hover);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1.5rem 0;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  &__question-text {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.4;
  }

  &__answer-text {
    font-size: 1.1rem;
    color: var(--text-main);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  &__hint-container {
    margin-top: 0.5rem;
  }

  &__hint-text {
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    background: rgba(245, 158, 11, 0.1);
    border: 1px dashed rgba(245, 158, 11, 0.4);
    color: var(--text-main);
    font-size: 0.9rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
  }

  &__flip-notice {
    font-size: 0.85rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__rating-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  &__rating-title {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  &__rating-buttons {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    justify-content: center;
  }
}
</style>
