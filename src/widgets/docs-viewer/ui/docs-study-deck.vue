<script setup lang="ts">
import { ref, watch } from 'vue'
import { InteractiveFlashcard, UiQuestion } from 'lern-ui-kit'
import type { DocItem } from '@/entities/doc'

// #region defineProps
interface Props {
  doc: DocItem | null
}

const props = defineProps<Props>()
// #endregion defineProps

// #region refs
const selectedAnswerId = ref<string | null>(null)
const isSubmitted = ref<boolean>(false)
const isCardMastered = ref<boolean>(false)
// #endregion refs

// #region watch
watch(
  () => props.doc?.id,
  () => {
    selectedAnswerId.value = null
    isSubmitted.value = false
    isCardMastered.value = false
  }
)
// #endregion watch

// #region Функции
const onSelectAnswer = (optionId: string): void => {
  selectedAnswerId.value = optionId
  isSubmitted.value = true
}

const onRateFlashcard = (payload: { id: string | number; rating: 'know' | 'doubt' | 'repeat' }): void => {
  if (payload.rating === 'know') {
    isCardMastered.value = true
  }
}
// #endregion Функции
</script>

<template>
  <aside v-if="props.doc" class="docs-study-deck">
    <div class="docs-study-deck__header">
      <div class="docs-study-deck__title-wrap">
        <span class="docs-study-deck__icon">🃏</span>
        <div>
          <h3 class="docs-study-deck__title">Study Deck</h3>
          <p class="docs-study-deck__subtitle">Тренажёр самопроверки</p>
        </div>
      </div>
      <span v-if="isCardMastered" class="docs-study-deck__badge docs-study-deck__badge--success">
        ✓ Запомнил (+50 XP)
      </span>
      <span v-else class="docs-study-deck__badge">
        Active Recall
      </span>
    </div>

    <!-- 1. 3D-Флешкарта -->
    <div v-if="props.doc.flashcard" class="docs-study-deck__card-section">
      <div class="section-label">
        <span>3D-Флешкарта главы</span>
        <span class="hint-text">Клик для оборота</span>
      </div>
      <InteractiveFlashcard
        :data="props.doc.flashcard"
        @rate="onRateFlashcard"
      />
    </div>

    <!-- 2. Экспресс-тест с вариантами A/B/C -->
    <div v-if="props.doc.quiz" class="docs-study-deck__quiz-section">
      <div class="section-label">
        <span>Экспресс-проверка</span>
        <span v-if="isSubmitted && selectedAnswerId === props.doc.quiz.correctId" class="correct-tag">
          Верно! 🎉
        </span>
        <span v-else-if="isSubmitted" class="incorrect-tag">
          Попробуй ещё 💡
        </span>
      </div>

      <div class="quiz-box">
        <p class="quiz-question">{{ props.doc.quiz.question }}</p>

        <UiQuestion
          :model-value="selectedAnswerId"
          :options="props.doc.quiz.options"
          :correct-id="props.doc.quiz.correctId"
          :is-submitted="isSubmitted"
          @select="onSelectAnswer"
        />

        <p v-if="isSubmitted && props.doc.quiz.explanation" class="quiz-explanation">
          💡 {{ props.doc.quiz.explanation }}
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.docs-study-deck {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-card, #1c2d47);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 16px);
  box-shadow: var(--shadow-main, 0 10px 30px rgba(0, 0, 0, 0.25));

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  &__icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
    margin: 0;
  }

  &__subtitle {
    font-size: 0.75rem;
    color: var(--text-muted, #94a3b8);
    margin: 0;
  }

  &__badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    background: rgba(99, 102, 241, 0.15);
    color: var(--primary, #818cf8);
    border: 1px solid rgba(99, 102, 241, 0.3);

    &--success {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.35);
    }
  }

  &__card-section,
  &__quiz-section {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #94a3b8);
  }

  .hint-text {
    font-size: 0.72rem;
    text-transform: none;
    font-weight: 500;
    opacity: 0.75;
  }

  .correct-tag {
    color: #34d399;
    font-size: 0.78rem;
  }

  .incorrect-tag {
    color: #f59e0b;
    font-size: 0.78rem;
  }

  /* Стилизация и подгонка 3D-флешкарты внутри Study Deck */
  :deep(.flashcard-container) {
    min-height: 410px;
    height: 410px;
    max-width: 100%;
  }

  :deep(.flashcard) {
    min-height: 410px;
    height: 100%;
  }

  :deep(.flashcard__side) {
    min-height: 410px;
    height: 100%;
    padding: 1.25rem 1.15rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  :deep(.flashcard__content) {
    flex: 1;
    min-height: 0;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;
  }

  :deep(.flashcard__answer-text) {
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--text-main, #ffffff);
  }

  :deep(.flashcard__question-text) {
    font-size: 1.05rem;
    line-height: 1.4;
    color: var(--text-main, #ffffff);
  }

  :deep(.flashcard__rating-section) {
    flex-shrink: 0;
    padding-top: 0.65rem;
    margin-top: auto;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    gap: 0.5rem;
    width: 100%;
  }

  :deep(.flashcard__rating-title) {
    font-size: 0.78rem;
  }

  :deep(.flashcard__rating-buttons) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.35rem;
    width: 100%;

    .ui-button,
    .flashcard__rate-btn {
      width: 100%;
      min-width: 0;
      padding: 0.35rem 0.25rem;
      font-size: 0.74rem;
      justify-content: center;
      gap: 0.35rem;

      .ui-button__content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .quiz-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .quiz-question {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-main, #ffffff);
    margin: 0;
  }

  .quiz-explanation {
    font-size: 0.82rem;
    line-height: 1.4;
    color: var(--text-muted, #94a3b8);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    margin: 0;
  }
}
</style>
