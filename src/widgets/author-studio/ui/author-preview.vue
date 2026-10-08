<script setup lang="ts">
import { ref } from 'vue'
import { InteractiveFlashcard, UiQuestion } from 'lern-ui-kit'
import { DocCodeBlock, DocBadge, type DocItem } from '@/entities/doc'
import { useCodePlayground } from '@/features/code-playground'

// #region defineProps
interface Props {
  doc: DocItem
}

const props = defineProps<Props>()
// #endregion defineProps

const playground = useCodePlayground()

// #region refs
const previewQuizAnswer = ref<string | null>(null)
const isQuizSubmitted = ref<boolean>(false)
// #endregion refs

// #region Функции
const onSelectQuizOption = (optId: string): void => {
  previewQuizAnswer.value = optId
  isQuizSubmitted.value = true
}

const onRateFlashcard = (): void => {
  // Демонстрационная обработка переворота в режиме предпросмотра
}
// #endregion Функции
</script>

<template>
  <div class="author-preview">
    <div class="author-preview__top-bar">
      <span class="preview-badge">👁️ Живой предпросмотр (Live Preview)</span>
      <span class="preview-hint">Так главу увидят студенты</span>
    </div>

    <div class="author-preview__scrollable">
      <!-- Пергаментный лист статьи -->
      <article class="codex-sheet">
        <header class="codex-sheet__header">
          <div class="codex-sheet__meta">
            <span v-if="props.doc.code" class="chapter-code">ГЛАВА {{ props.doc.code }}</span>
            <div class="tags-list">
              <DocBadge
                v-for="tag in props.doc.tags"
                :key="tag"
                :text="tag"
                variant="primary"
              />
            </div>
            <span class="read-time">⏱️ {{ props.doc.readTimeMinutes }} мин</span>
          </div>

          <h1 class="codex-sheet__title">{{ props.doc.title }}</h1>
          <p class="codex-sheet__desc">{{ props.doc.description }}</p>

          <div class="author-row">
            <img
              :src="props.doc.author.avatar"
              :alt="props.doc.author.name"
              class="author-avatar"
            />
            <div class="author-info">
              <span class="author-name">{{ props.doc.author.name }}</span>
              <span class="author-role">{{ props.doc.author.role }}</span>
            </div>
          </div>
        </header>

        <div class="codex-sheet__divider"></div>

        <!-- Секции контента -->
        <div class="codex-sheet__content">
          <section
            v-for="sec in props.doc.sections"
            :key="sec.id"
            class="content-section"
          >
            <h2 class="section-title">{{ sec.title }}</h2>
            <p class="section-text">{{ sec.text }}</p>

            <!-- Блок кода -->
            <div v-if="sec.codeSnippet" class="code-wrap">
              <DocCodeBlock
                :code="sec.codeSnippet.code"
                :language="sec.codeSnippet.language"
                :filename="sec.codeSnippet.filename"
                @run="() => playground.open({
                  code: sec.codeSnippet!.code,
                  filename: sec.codeSnippet?.filename,
                  language: sec.codeSnippet?.language,
                })"
              />
            </div>

            <!-- Врезка Callout -->
            <div
              v-if="sec.callout"
              class="callout-box"
              :class="`callout-box--${sec.callout.type}`"
            >
              <span class="callout-icon">
                {{ sec.callout.type === 'tip' ? '⭐' : sec.callout.type === 'warning' ? '⚠️' : 'ℹ️' }}
              </span>
              <p class="callout-message">{{ sec.callout.message }}</p>
            </div>
          </section>
        </div>

        <div class="codex-sheet__divider"></div>

        <!-- Study Deck (3D-Флешкарта + Тест) -->
        <div class="preview-deck">
          <div class="deck-header">
            <span class="deck-icon">🃏</span>
            <div>
              <h3 class="deck-title">Study Deck (Active Recall)</h3>
              <p class="deck-subtitle">Тренажёр самопроверки к этой главе</p>
            </div>
          </div>

          <!-- 3D-флешкарта -->
          <div v-if="props.doc.flashcard" class="deck-card-wrap">
            <InteractiveFlashcard
              :data="props.doc.flashcard"
              @rate="onRateFlashcard"
            />
          </div>

          <!-- Экспресс-тест -->
          <div v-if="props.doc.quiz" class="deck-quiz-wrap">
            <div class="quiz-label">
              <span>ЭКСПРЕСС-ПРОВЕРКА</span>
              <span v-if="isQuizSubmitted && previewQuizAnswer === props.doc.quiz.correctId" class="tag-correct">
                Верно! 🎉
              </span>
              <span v-else-if="isQuizSubmitted" class="tag-incorrect">
                Неверно 💡
              </span>
            </div>

            <p class="quiz-question-text">{{ props.doc.quiz.question }}</p>

            <UiQuestion
              :model-value="previewQuizAnswer"
              :options="props.doc.quiz.options"
              :correct-id="props.doc.quiz.correctId"
              :is-submitted="isQuizSubmitted"
              @select="onSelectQuizOption"
            />

            <p v-if="isQuizSubmitted && props.doc.quiz.explanation" class="quiz-expl">
              💡 {{ props.doc.quiz.explanation }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.author-preview {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-body, #0b1120);
  border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  box-sizing: border-box;

  &__top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.5rem;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  }

  .preview-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: #38bdf8;
    letter-spacing: 0.04em;
  }

  .preview-hint {
    font-size: 0.72rem;
    color: var(--text-muted, #94a3b8);
  }

  &__scrollable {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1.5rem;
    box-sizing: border-box;
  }

  .codex-sheet {
    background: var(--bg-card, #f9f6f0);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: 16px;
    padding: 2.25rem 2.5rem;
    color: var(--text-main, #1e293b);
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    &__meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .chapter-code {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary, #6366f1);
      letter-spacing: 0.05em;
    }

    .tags-list {
      display: flex;
      gap: 0.35rem;
    }

    .read-time {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      margin-left: auto;
    }

    &__title {
      font-size: 1.85rem;
      font-weight: 800;
      line-height: 1.25;
      margin: 0 0 0.5rem;
      color: var(--text-main, #0f172a);
    }

    &__desc {
      font-size: 1rem;
      color: var(--text-muted, #475569);
      line-height: 1.5;
      margin: 0 0 1rem;
    }

    .author-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .author-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main, #0f172a);
    }

    .author-role {
      font-size: 0.7rem;
      color: var(--text-muted, #64748b);
    }

    &__divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.08);
      width: 100%;
    }

    .content-section {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main, #0f172a);
      margin: 0;
    }

    .section-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-main, #334155);
      margin: 0;
      white-space: pre-wrap;
    }

    .callout-box {
      display: flex;
      gap: 0.75rem;
      padding: 0.85rem 1.15rem;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.1);
      border-left: 4px solid #38bdf8;
      align-items: flex-start;

      &--warning {
        background: rgba(245, 158, 11, 0.1);
        border-left-color: #f59e0b;
      }

      &--tip {
        background: rgba(16, 185, 129, 0.1);
        border-left-color: #10b981;
      }

      .callout-icon {
        font-size: 1.15rem;
        line-height: 1;
      }

      .callout-message {
        font-size: 0.88rem;
        line-height: 1.4;
        margin: 0;
        color: var(--text-main, #1e293b);
      }
    }
  }

  /* Study Deck in Preview */
  .preview-deck {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-top: 1rem;
    border-top: 2px dashed rgba(0, 0, 0, 0.1);

    .deck-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .deck-icon {
        font-size: 1.5rem;
      }

      .deck-title {
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-main, #0f172a);
      }

      .deck-subtitle {
        font-size: 0.75rem;
        color: var(--text-muted, #64748b);
        margin: 0;
      }
    }

    .deck-quiz-wrap {
      background: var(--bg-container, #162032);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .quiz-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
      }

      .tag-correct {
        color: #34d399;
      }

      .tag-incorrect {
        color: #f59e0b;
      }

      .quiz-question-text {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-main, #ffffff);
        margin: 0;
      }

      .quiz-expl {
        font-size: 0.82rem;
        color: var(--text-muted, #94a3b8);
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        margin: 0;
      }
    }
  }
}
</style>
