<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DocItem,
  DocBadge,
  DocCodeBlock,
  DocAdapter,
  CourseCodex,
  useDocProgressStore,
  useDocNotesStore,
} from '@/entities/doc'
import { RateDocWidget } from '@/features/rate-doc'
import { useCodePlayground } from '@/features/code-playground'
import { useNotificationStore } from '@/entities/notification'
import DocsStudyDeck from './docs-study-deck.vue'

// #region defineProps
interface Props {
  doc: DocItem | null
  course?: CourseCodex | null
  showInlineStudyDeck?: boolean
  prevDoc?: DocItem | null
  nextDoc?: DocItem | null
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
  showInlineStudyDeck: false,
  prevDoc: null,
  nextDoc: null,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'rated', payload: { usefulCount: number; notUsefulCount: number }): void
  (e: 'selectDoc', docId: string): void
}>()
// #endregion defineEmits

const progressStore = useDocProgressStore()
const notesStore = useDocNotesStore()
const playground = useCodePlayground()
const notificationStore = useNotificationStore()

// #region notes and bookmarks
const isBookmarked = computed<boolean>(() => {
  if (!props.doc) return false
  return notesStore.isBookmarked(props.doc.id)
})

const docNotes = computed(() => {
  if (!props.doc) return []
  return notesStore.getDocNotes(props.doc.id)
})

const isAddingNote = ref<boolean>(false)
const newNoteText = ref<string>('')
const selectedColor = ref<'amber' | 'cyan' | 'emerald' | 'purple'>('amber')

const onToggleBookmark = (): void => {
  if (!props.doc) return
  const wasBookmarked = isBookmarked.value
  const courseInfo = props.course || { id: 'all', slug: 'all', title: 'Курс LERN' }
  notesStore.toggleBookmark(
    { id: props.doc.id, title: props.doc.title, code: props.doc.code },
    courseInfo
  )

  if (!wasBookmarked) {
    notificationStore.addToast({
      title: 'Закладка сохранена 🔖',
      message: `Глава «${props.doc.title}» добавлена в ваши сохраненные материалы`,
      type: 'info',
    })
  }
}

const onSaveNote = (): void => {
  if (!props.doc || !newNoteText.value.trim()) return
  notesStore.addMarginNote({
    docId: props.doc.id,
    noteText: newNoteText.value.trim(),
    color: selectedColor.value,
  })
  newNoteText.value = ''
  isAddingNote.value = false

  notificationStore.addToast({
    title: 'Заметка зафиксирована ✍️',
    message: 'Заметка на полях книги сохранена',
    type: 'success',
  })
}
// #endregion notes and bookmarks

// #region computed
const isCompleted = computed<boolean>(() => {
  if (!props.doc) return false
  return progressStore.isCompleted(props.doc.id)
})
// #endregion computed

// #region Функции
const onToggleComplete = (): void => {
  if (!props.doc) return
  const wasCompleted = isCompleted.value
  progressStore.toggleCompleteDoc(props.doc.id)

  if (!wasCompleted) {
    notificationStore.addNotification({
      title: 'Глава завершена! 🎓',
      message: `Вы успешно завершили главу «${props.doc.title}». +50 XP начислено!`,
      type: 'achievement',
      link: '/cabinet',
    })
  }
}
// #endregion Функции
</script>

<template>
  <main v-if="props.doc" class="docs-content-viewer">
    <!-- Пергаментный лист статьи (Codex Sheet) -->
    <article class="codex-sheet">
      <!-- Шапка статьи -->
      <header class="codex-sheet__header">
        <div class="codex-sheet__top-meta">
          <div class="codex-sheet__tags">
            <span v-if="props.doc.code" class="codex-chapter-code">ГЛАВА {{ props.doc.code }}</span>
            <DocBadge
              v-for="tag in props.doc.tags"
              :key="tag"
              :text="tag"
              variant="primary"
            />
          </div>

          <div class="codex-sheet__top-meta-right">
            <div class="codex-sheet__read-stats">
              <span>⏱️ {{ props.doc.readTimeMinutes }} мин чтения</span>
              <span>📅 {{ DocAdapter.formatDate(props.doc.updatedAt) }}</span>
            </div>

            <!-- Интерактивная закладка страницы -->
            <button
              type="button"
              class="btn-bookmark"
              :class="{ 'btn-bookmark--active': isBookmarked }"
              :title="isBookmarked ? 'Удалить главу из закладок' : 'Сохранить главу в закладки'"
              @click="onToggleBookmark"
            >
              <span class="bookmark-icon">{{ isBookmarked ? '🔖' : '📑' }}</span>
              <span class="bookmark-text">{{ isBookmarked ? 'В закладках' : 'В закладки' }}</span>
            </button>
          </div>
        </div>

        <h1 class="codex-sheet__title">{{ props.doc.title }}</h1>
        <p class="codex-sheet__desc">{{ props.doc.description }}</p>

        <div class="codex-sheet__author-row">
          <div class="codex-sheet__author">
            <img
              :src="props.doc.author.avatar"
              :alt="props.doc.author.name"
              class="codex-sheet__avatar"
            />
            <div class="codex-sheet__author-info">
              <span class="codex-sheet__author-name">{{ props.doc.author.name }}</span>
              <span class="codex-sheet__author-role">{{ props.doc.author.role }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="codex-sheet__divider"></div>

      <!-- Основной текст статьи -->
      <div class="codex-sheet__body">
        <section
          v-for="section in props.doc.sections"
          :key="section.id"
          :id="section.id"
          class="codex-sheet__section"
        >
          <h2 v-if="section.level === 2" class="codex-sheet__h2">
            {{ section.title }}
          </h2>
          <h3 v-else-if="section.level === 3" class="codex-sheet__h3">
            {{ section.title }}
          </h3>

          <p class="codex-sheet__paragraph">{{ section.text }}</p>

          <!-- Callout цитата / подсказка -->
          <div
            v-if="section.callout"
            :class="['codex-callout', `codex-callout--${section.callout.type}`]"
          >
            <span class="codex-callout__icon">
              {{ section.callout.type === 'tip' ? '💡' : section.callout.type === 'warning' ? '⚠️' : 'ℹ️' }}
            </span>
            <span class="codex-callout__text">{{ section.callout.message }}</span>
          </div>

          <!-- Блок кода -->
          <DocCodeBlock
            v-if="section.codeSnippet"
            :code="section.codeSnippet.code"
            :language="section.codeSnippet.language"
            :filename="section.codeSnippet.filename"
            @run="() => playground.open({
              code: section.codeSnippet!.code,
              filename: section.codeSnippet?.filename,
              language: section.codeSnippet?.language,
            })"
          />
        </section>
      </div>

      <!-- Встроенный тренажер самопроверки для мобилок и планшетов (под текстом) -->
      <div v-if="props.showInlineStudyDeck" class="codex-sheet__inline-deck">
        <DocsStudyDeck :doc="props.doc" />
      </div>

      <!-- Пергаментные заметки на полях (Margin Notes) -->
      <section class="codex-margin-notes">
        <div class="codex-margin-notes__header">
          <div class="codex-margin-notes__title-row">
            <span class="notes-icon">✏️</span>
            <h3 class="codex-margin-notes__title">Заметки на полях ({{ docNotes.length }})</h3>
          </div>
          <button
            type="button"
            class="btn-add-note"
            @click="isAddingNote = !isAddingNote"
          >
            <span>{{ isAddingNote ? '✕ Отмена' : '+ Заметка на полях' }}</span>
          </button>
        </div>

        <!-- Форма создания заметки -->
        <div v-if="isAddingNote" class="codex-margin-notes__form">
          <textarea
            v-model="newNoteText"
            class="note-textarea"
            placeholder="Напишите ключевую мысль, инсайт или заметку по этой главе..."
            rows="3"
          ></textarea>
          <div class="note-form-footer">
            <div class="color-picker">
              <span class="picker-label">Маркер:</span>
              <button
                v-for="color in (['amber', 'cyan', 'emerald', 'purple'] as const)"
                :key="color"
                type="button"
                class="color-dot"
                :class="[`color-dot--${color}`, { 'color-dot--active': selectedColor === color }]"
                @click="selectedColor = color"
              ></button>
            </div>
            <button
              type="button"
              class="btn-save-note"
              :disabled="!newNoteText.trim()"
              @click="onSaveNote"
            >
              Сохранить на полях
            </button>
          </div>
        </div>

        <!-- Список заметок к главе -->
        <div v-if="docNotes.length > 0" class="codex-margin-notes__grid">
          <div
            v-for="note in docNotes"
            :key="note.id"
            class="margin-note-card"
            :class="`margin-note-card--${note.color}`"
          >
            <div class="margin-note-card__header">
              <span class="margin-note-card__time">⏱ {{ note.createdAt }}</span>
              <button
                type="button"
                class="btn-delete-note"
                title="Удалить заметку"
                @click="notesStore.deleteMarginNote(note.id)"
              >
                ✕
              </button>
            </div>
            <p class="margin-note-card__text">{{ note.noteText }}</p>
          </div>
        </div>
      </section>

      <!-- Интерактивное подтверждение завершения главы -->
      <div class="codex-complete-action">
        <div class="codex-complete-action__info">
          <span class="codex-complete-action__icon">{{ isCompleted ? '🏆' : '📖' }}</span>
          <div>
            <h4 class="codex-complete-action__title">
              {{ isCompleted ? 'Глава отмечена как изученная!' : 'Завершили чтение этой главы?' }}
            </h4>
            <p class="codex-complete-action__subtitle">
              {{ isCompleted ? 'Вы закрепили материал и получили +50 XP в Карту Знаний' : 'Зафиксируйте прогресс изучения и пополните копилку опыта на +50 XP' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="codex-complete-btn"
          :class="{ 'codex-complete-btn--completed': isCompleted }"
          @click="onToggleComplete"
        >
          <span class="btn-check-icon">{{ isCompleted ? '✓' : '○' }}</span>
          <span>{{ isCompleted ? 'Изучено (+50 XP)' : 'Отметить изученной (+50 XP)' }}</span>
        </button>
      </div>

      <!-- Навигация: Предыдущая / Следующая глава -->
      <nav class="codex-nav-footer">
        <button
          v-if="props.prevDoc"
          type="button"
          class="codex-nav-btn codex-nav-btn--prev"
          @click="emit('selectDoc', props.prevDoc.id)"
        >
          <span class="nav-sub">← Назад</span>
          <span class="nav-title">{{ props.prevDoc.title }}</span>
        </button>
        <div v-else class="codex-nav-spacer"></div>

        <button
          v-if="props.nextDoc"
          type="button"
          class="codex-nav-btn codex-nav-btn--next"
          @click="emit('selectDoc', props.nextDoc.id)"
        >
          <span class="nav-sub">Далее →</span>
          <span class="nav-title">{{ props.nextDoc.title }}</span>
        </button>
      </nav>

      <!-- Оценка полезности -->
      <footer class="codex-sheet__footer">
        <RateDocWidget
          :doc-id="props.doc.id"
          :useful-count="props.doc.usefulCount"
          :not-useful-count="props.doc.notUsefulCount"
          @rated="emit('rated', $event)"
        />
      </footer>
    </article>
  </main>

  <div v-else class="docs-empty">
    <span class="docs-empty__icon">📖</span>
    <p>Выберите главу из Дерева Знаний для чтения</p>
  </div>
</template>

<style scoped lang="scss">
.docs-content-viewer {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0;
  }
}

.codex-sheet {
  background: var(--bg-card, #f9f6f0);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-md, 16px);
  padding: 2.5rem 3rem;
  box-shadow: var(--shadow-main, 0 10px 30px rgba(0, 0, 0, 0.15));
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--text-main, #1e293b);
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 12px;
  }

  &__top-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .codex-chapter-code {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    background: var(--bg-container, #1e3a8a);
    color: var(--text-inverse, #ffffff);
  }

  &__read-stats {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--text-muted, #64748b);
  }

  &__title {
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.85rem;

    @media (max-width: 768px) {
      font-size: 1.6rem;
    }
  }

  &__desc {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-muted, #475569);
    margin: 0 0 1.5rem;
  }

  &__author-row {
    display: flex;
    align-items: center;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color, #e2d9cc);
  }

  &__author-info {
    display: flex;
    flex-direction: column;
  }

  &__author-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
  }

  &__author-role {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
  }

  &__divider {
    height: 1px;
    background: var(--border-color, rgba(0, 0, 0, 0.08));
    margin: 0.5rem 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  &__section {
    scroll-margin-top: 2rem;
  }

  &__h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.85rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  }

  &__h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.6rem;
  }

  &__paragraph {
    font-size: 1.025rem;
    line-height: 1.75;
    color: var(--text-main, #334155);
    margin: 0;
  }

  &__inline-deck {
    margin-top: 1.5rem;
  }
}

/* Callout block */
.codex-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-radius: 12px;
  margin: 1.25rem 0;
  font-size: 0.92rem;
  line-height: 1.6;

  &__icon {
    font-size: 1.2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  &--tip {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #065f46;
  }

  &--warning {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #92400e;
  }

  &--info {
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #075985;
  }
}

/* Completion Action Banner */
.codex-complete-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-md, 14px);
  background: var(--bg-card-hover, rgba(0, 0, 0, 0.04));
  border: 1px dashed var(--border-color, rgba(0, 0, 0, 0.15));
  margin: 1rem 0;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__icon {
    font-size: 2rem;
    line-height: 1;
  }

  &__title {
    font-size: 1.02rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
    color: var(--text-main, #1e293b);
  }

  &__subtitle {
    font-size: 0.82rem;
    color: var(--text-muted, #64748b);
    margin: 0;
  }

  .codex-complete-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.4rem;
    border-radius: 9999px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--primary, #6366f1);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
    }

    &--completed {
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: none;

      &:hover {
        background: rgba(16, 185, 129, 0.25);
        color: #047857;
      }
    }

    .btn-check-icon {
      font-size: 1rem;
      font-weight: 800;
    }
  }
}

/* Nav Footer */
.codex-nav-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.codex-nav-spacer {
  flex: 1;
}

.codex-nav-btn {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  background: var(--bg-card-hover, rgba(0, 0, 0, 0.04));
  color: var(--text-main, #1e293b);
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 45%;

  &:hover {
    border-color: var(--primary, #38bdf8);
    background: var(--bg-card, #ffffff);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .nav-sub {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted, #64748b);
    text-transform: uppercase;
  }

  .nav-title {
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &--next {
    text-align: right;
    margin-left: auto;
  }
}

.docs-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted, #94a3b8);
  gap: 1rem;

  &__icon {
    font-size: 3rem;
  }
}
.codex-sheet__top-meta-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.btn-bookmark {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-main, #1e293b);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.4);
    transform: translateY(-1px);
  }

  &--active {
    background: rgba(245, 158, 11, 0.2);
    border-color: #f59e0b;
    color: #b45309;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
  }

  .bookmark-icon {
    font-size: 0.95rem;
    line-height: 1;
  }
}

/* Заметки на полях */
.codex-margin-notes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
  }

  .btn-add-note {
    background: transparent;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--text-main, #1e293b);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(99, 102, 241, 0.12);
      border-color: #818cf8;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-card, #ffffff);
    border-radius: 10px;
    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));

    .note-textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      padding: 0.65rem;
      font-family: inherit;
      font-size: 0.85rem;
      background: transparent;
      color: inherit;
      resize: vertical;
      outline: none;

      &:focus {
        border-color: #818cf8;
      }
    }

    .note-form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .picker-label {
        font-size: 0.75rem;
        color: var(--text-muted, #64748b);
      }
    }

    .color-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;

      &--amber { background: #f59e0b; }
      &--cyan { background: #06b6d4; }
      &--emerald { background: #10b981; }
      &--purple { background: #a855f7; }

      &--active {
        transform: scale(1.25);
        border-color: #ffffff;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
      }
    }

    .btn-save-note {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.85rem;
  }
}

.margin-note-card {
  padding: 0.85rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &--amber {
    background: rgba(245, 158, 11, 0.12);
    border-left: 4px solid #f59e0b;
  }

  &--cyan {
    background: rgba(6, 182, 212, 0.12);
    border-left: 4px solid #06b6d4;
  }

  &--emerald {
    background: rgba(16, 185, 129, 0.12);
    border-left: 4px solid #10b981;
  }

  &--purple {
    background: rgba(168, 85, 247, 0.12);
    border-left: 4px solid #a855f7;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__time {
    font-size: 0.72rem;
    color: var(--text-muted, #64748b);
  }

  .btn-delete-note {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted, #64748b);
    font-size: 0.75rem;

    &:hover {
      color: #ef4444;
    }
  }

  &__text {
    margin: 0;
    line-height: 1.45;
  }
}
</style>
