<script setup lang="ts">
import { computed } from 'vue'
import { InteractiveFlashcard, UiQuestion } from 'lern-ui-kit'
import { useDocProgressStore, type DocItem } from '@/entities/doc'

// #region defineProps
interface Props {
  doc: DocItem | null
}

const props = defineProps<Props>()
// #endregion defineProps

const progressStore = useDocProgressStore()

// #region computed
const isCardMastered = computed<boolean>(() => {
  if (!props.doc) return false
  return progressStore.isFlashcardMastered(props.doc.id)
})

const selectedAnswerId = computed<string | null>(() => {
  if (!props.doc) return null
  return progressStore.getQuizAnswer(props.doc.id)
})

const isSubmitted = computed<boolean>(() => {
  return selectedAnswerId.value !== null
})

const isDocCompleted = computed<boolean>(() => {
  if (!props.doc) return false
  return progressStore.isCompleted(props.doc.id)
})
// #endregion computed

// #region Функции
const onSelectAnswer = (optionId: string): void => {
  if (!props.doc?.quiz) return
  const isCorrect = optionId === props.doc.quiz.correctId
  progressStore.submitQuiz(props.doc.id, optionId, isCorrect)
}

const onRateFlashcard = (payload: { id: string | number; rating: 'know' | 'doubt' | 'repeat' }): void => {
  if (!props.doc) return
  progressStore.rateFlashcard(props.doc.id, payload.rating)
}

const onToggleComplete = (): void => {
  if (!props.doc) return
  progressStore.toggleCompleteDoc(props.doc.id)
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

      <div class="docs-study-deck__xp-badge" title="Заработанный опыт">
        <span class="xp-icon">⚡</span>
        <span class="xp-value">{{ progressStore.totalXp }} XP</span>
      </div>
    </div>

    <!-- Индикатор статуса главы -->
    <div
      class="chapter-status-bar"
      :class="{ 'chapter-status-bar--completed': isDocCompleted }"
      @click="onToggleComplete"
    >
      <div class="chapter-status-bar__left">
        <span class="status-icon">{{ isDocCompleted ? '✓' : '📖' }}</span>
        <span class="status-text">
          {{ isDocCompleted ? 'Глава изучена (+50 XP)' : 'В процессе изучения' }}
        </span>
      </div>
      <button type="button" class="status-toggle-btn">
        {{ isDocCompleted ? 'Снять отметку' : 'Отметить ✓' }}
      </button>
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

  &__xp-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%);
    border: 1px solid rgba(234, 179, 8, 0.4);
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);

    .xp-icon {
      font-size: 0.85rem;
      animation: pulse 2s infinite ease-in-out;
    }

    .xp-value {
      font-size: 0.78rem;
      font-weight: 800;
      color: #facc15;
      letter-spacing: 0.02em;
    }
  }

  .chapter-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    border-radius: var(--radius-sm, 10px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.12));
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: var(--primary, #6366f1);
    }

    &--completed {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);

      .status-icon {
        color: #34d399;
      }

      .status-text {
        color: #34d399;
        font-weight: 600;
      }
    }

    &__left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-icon {
      font-size: 0.9rem;
    }

    .status-text {
      font-size: 0.8rem;
      color: var(--text-main, #ffffff);
    }

    .status-toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 0.72rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;

      &:hover {
        color: var(--text-main, #ffffff);
      }
    }
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
