<script setup lang="ts">
import { UiTextarea, UiTooltip } from 'lern-ui-kit'
import type { DocCategory } from '@/entities/doc'
import type { EditorTab } from '../model/use-author-studio'

// #region defineProps
interface Props {
  draft: any
  categories: DocCategory[]
  activeTab: EditorTab
  isEditingExisting: boolean
  isSaving: boolean
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:activeTab', tab: EditorTab): void
  (e: 'save'): void
  (e: 'delete'): void
  (e: 'addSection', type: 'text' | 'code' | 'callout'): void
  (e: 'removeSection', index: number): void
  (e: 'moveSection', index: number, direction: 'up' | 'down'): void
  (e: 'addQuizOption'): void
  (e: 'removeQuizOption', index: number): void
  (e: 'setCorrectQuizOption', optId: string): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="author-editor">
    <!-- Шапка редактора: Заголовок и главные действия -->
    <div class="author-editor__header">
      <div class="author-editor__title-input-wrap">
        <span class="status-indicator">{{ props.isEditingExisting ? '✏️ Редактирование' : '✨ Новая глава' }}</span>
        <input
          v-model="props.draft.title"
          type="text"
          placeholder="Введите название главы..."
          class="chapter-title-input"
        />
      </div>

      <div class="author-editor__actions">
        <button
          v-if="props.isEditingExisting"
          type="button"
          class="btn-delete"
          title="Удалить эту главу"
          @click="emit('delete')"
        >
          🗑️
        </button>

        <button
          type="button"
          class="btn-save"
          :disabled="props.isSaving"
          @click="emit('save')"
        >
          <span v-if="props.isSaving" class="spinner"></span>
          <span v-else>💾</span>
          <span>{{ props.isSaving ? 'Сохранение...' : 'Сохранить главу' }}</span>
        </button>
      </div>
    </div>

    <!-- Вкладки редактора -->
    <nav class="editor-tabs">
      <button
        type="button"
        class="editor-tab-btn"
        :class="{ 'editor-tab-btn--active': props.activeTab === 'meta' }"
        @click="emit('update:activeTab', 'meta')"
      >
        <span>📌 Метаданные</span>
      </button>

      <button
        type="button"
        class="editor-tab-btn"
        :class="{ 'editor-tab-btn--active': props.activeTab === 'content' }"
        @click="emit('update:activeTab', 'content')"
      >
        <span>📝 Контент статьи ({{ props.draft.sections?.length || 0 }})</span>
      </button>

      <button
        type="button"
        class="editor-tab-btn"
        :class="{ 'editor-tab-btn--active': props.activeTab === 'flashcard' }"
        @click="emit('update:activeTab', 'flashcard')"
      >
        <span>🃏 3D-Флешкарта</span>
      </button>

      <button
        type="button"
        class="editor-tab-btn"
        :class="{ 'editor-tab-btn--active': props.activeTab === 'quiz' }"
        @click="emit('update:activeTab', 'quiz')"
      >
        <span>❓ Экспресс-тест ({{ props.draft.quiz?.options?.length || 0 }})</span>
      </button>
    </nav>

    <!-- Тело редактора по вкладкам -->
    <div class="author-editor__body">
      <!-- ВКЛАДКА 1: МЕТАДАННЫЕ -->
      <section v-if="props.activeTab === 'meta'" class="tab-pane meta-pane">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Модуль курса</label>
            <select v-model="props.draft.categoryId" class="form-select">
              <option v-for="cat in props.categories" :key="cat.id" :value="cat.id">
                {{ cat.code ? `${cat.code}. ` : '' }}{{ cat.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Код главы (номер)</label>
            <input
              v-model="props.draft.code"
              type="text"
              placeholder="например: 01.3"
              class="form-input"
            />
          </div>

          <div class="form-group form-group--full">
            <UiTextarea
              v-model="props.draft.description"
              label="Краткое описание (лид статьи)"
              :rows="3"
              placeholder="Кратко опишите, о чем эта глава и что освоит студент..."
              hint="Отображается в карточке главы и в начале пергаментного листа"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Теги (через запятую)</label>
            <input
              v-model="props.draft.tagsString"
              type="text"
              placeholder="FSD, Архитектура, TypeScript"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Время чтения (в минутах)</label>
            <input
              v-model.number="props.draft.readTimeMinutes"
              type="number"
              min="1"
              max="60"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <!-- ВКЛАДКА 2: КОНТЕНТ СТАТЬИ -->
      <section v-else-if="props.activeTab === 'content'" class="tab-pane content-pane">
        <div class="pane-toolbar">
          <span class="toolbar-title">Секции пергаментного листа</span>
          <div class="toolbar-buttons">
            <button
              type="button"
              class="add-sec-btn add-sec-btn--text"
              @click="emit('addSection', 'text')"
            >
              + 📝 Текст
            </button>
            <button
              type="button"
              class="add-sec-btn add-sec-btn--code"
              @click="emit('addSection', 'code')"
            >
              + 💻 Блок кода
            </button>
            <button
              type="button"
              class="add-sec-btn add-sec-btn--callout"
              @click="emit('addSection', 'callout')"
            >
              + 📌 Врезка Callout
            </button>
          </div>
        </div>

        <div class="sections-list">
          <div
            v-for="(sec, idx) in props.draft.sections"
            :key="sec.id"
            class="section-card"
          >
            <div class="section-card__header">
              <div class="section-card__title-wrap">
                <span class="sec-number">#{{ idx + 1 }}</span>
                <input
                  v-model="sec.title"
                  type="text"
                  placeholder="Заголовок секции..."
                  class="sec-title-input"
                />
              </div>

              <div class="section-card__actions">
                <button
                  type="button"
                  class="card-action-btn"
                  title="Поднять выше"
                  :disabled="idx === 0"
                  @click="emit('moveSection', idx, 'up')"
                >
                  ▲
                </button>
                <button
                  type="button"
                  class="card-action-btn"
                  title="Опустить ниже"
                  :disabled="idx === props.draft.sections.length - 1"
                  @click="emit('moveSection', idx, 'down')"
                >
                  ▼
                </button>
                <button
                  type="button"
                  class="card-action-btn card-action-btn--delete"
                  title="Удалить секцию"
                  @click="emit('removeSection', idx)"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Поле основного текста -->
            <div class="section-card__body">
              <textarea
                v-model="sec.text"
                rows="4"
                placeholder="Содержимое секции..."
                class="form-textarea"
              ></textarea>

              <!-- Если есть блок кода -->
              <div v-if="sec.codeSnippet" class="code-editor-block">
                <div class="code-editor-block__header">
                  <span class="code-label">💻 Исходный код:</span>
                  <div class="code-fields">
                    <input
                      v-model="sec.codeSnippet.filename"
                      type="text"
                      placeholder="имя-файла.ts"
                      class="code-filename-input"
                    />
                    <select v-model="sec.codeSnippet.language" class="code-lang-select">
                      <option value="typescript">TypeScript</option>
                      <option value="vue">Vue SFC</option>
                      <option value="scss">SCSS / CSS</option>
                      <option value="bash">Bash / Shell</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                <textarea
                  v-model="sec.codeSnippet.code"
                  rows="6"
                  class="code-textarea"
                  placeholder="// Напишите пример кода..."
                ></textarea>
              </div>

              <!-- Если есть врезка Callout -->
              <div v-if="sec.callout" class="callout-editor-block" :class="`callout-editor-block--${sec.callout.type}`">
                <div class="callout-header">
                  <span class="callout-title">📌 Врезка (Callout):</span>
                  <select v-model="sec.callout.type" class="callout-type-select">
                    <option value="info">Инфо ℹ️</option>
                    <option value="tip">Совет ⭐</option>
                    <option value="warning">Предупреждение ⚠️</option>
                    <option value="note">Заметка 📝</option>
                  </select>
                </div>
                <input
                  v-model="sec.callout.message"
                  type="text"
                  placeholder="Текст пояснения или предупреждения..."
                  class="callout-msg-input"
                />
              </div>
            </div>
          </div>

          <div v-if="props.draft.sections?.length === 0" class="sections-empty">
            <p>В этой главе пока нет секций контента. Нажмите кнопку выше, чтобы добавить текст или блок кода.</p>
          </div>
        </div>
      </section>

      <!-- ВКЛАДКА 3: 3D-ФЛЕШКАРТА -->
      <section v-else-if="props.activeTab === 'flashcard'" class="tab-pane flashcard-pane">
        <div class="flashcard-form">
          <div class="card-side-box front-box">
            <div class="side-badge">Лицевая сторона (Вопрос)</div>
            <div class="form-group">
              <label class="form-label">Сложность вопроса</label>
              <select v-model="props.draft.flashcard.difficulty" class="form-select">
                <option value="easy">Легкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Контрольный вопрос</label>
              <textarea
                v-model="props.draft.flashcard.question"
                rows="3"
                placeholder="Сформулируйте вопрос, заставляющий извлечь ответ из памяти..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Подсказка (Hint)</label>
              <input
                v-model="props.draft.flashcard.hint"
                type="text"
                placeholder="Необязательная подсказка при затруднении..."
                class="form-input"
              />
            </div>
          </div>

          <div class="card-side-box back-box">
            <div class="side-badge">Оборотная сторона (Ответ)</div>
            <div class="form-group">
              <label class="form-label">Правильный эталонный ответ</label>
              <textarea
                v-model="props.draft.flashcard.answer"
                rows="5"
                placeholder="Чёткий и структурированный ответ, который студент увидит при перевороте..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- ВКЛАДКА 4: ЭКСПРЕСС-ТЕСТ -->
      <section v-else-if="props.activeTab === 'quiz'" class="tab-pane quiz-pane">
        <div class="quiz-form">
          <div class="form-group">
            <label class="form-label">Вопрос экспресс-теста</label>
            <textarea
              v-model="props.draft.quiz.question"
              rows="3"
              placeholder="Формулировка вопроса с вариантами выбора..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="options-group">
            <div class="options-header">
              <span class="options-title">Варианты ответа (отметьте верный радио-кнопкой):</span>
              <button
                type="button"
                class="add-opt-btn"
                @click="emit('addQuizOption')"
              >
                + Вариант
              </button>
            </div>

            <div class="options-list">
              <div
                v-for="(opt, idx) in props.draft.quiz?.options"
                :key="opt.id"
                class="option-row"
                :class="{ 'option-row--correct': props.draft.quiz.correctId === opt.id }"
              >
                <label class="option-radio-wrap" title="Сделать этот вариант правильным">
                  <input
                    type="radio"
                    name="correct-option"
                    :checked="props.draft.quiz.correctId === opt.id"
                    @change="emit('setCorrectQuizOption', opt.id)"
                  />
                  <span class="opt-label">{{ opt.label }}</span>
                </label>

                <input
                  v-model="opt.text"
                  type="text"
                  placeholder="Текст варианта ответа..."
                  class="option-input"
                />

                <button
                  type="button"
                  class="del-opt-btn"
                  title="Удалить вариант"
                  @click="emit('removeQuizOption', idx)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Пояснение к результату теста (Explanation)</label>
            <textarea
              v-model="props.draft.quiz.explanation"
              rows="2"
              placeholder="Почему именно этот ответ верный? Студент увидит это после прохождения теста..."
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.author-editor {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #1c2738);
  box-sizing: border-box;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.15rem 1.75rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    background: rgba(0, 0, 0, 0.15);
  }

  &__title-input-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .status-indicator {
    font-size: 0.72rem;
    color: var(--primary, #818cf8);
    font-weight: 700;
  }

  .chapter-title-input {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
    outline: none;
    box-sizing: border-box;

    &::placeholder {
      color: var(--text-muted, #64748b);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .btn-save {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.15rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .btn-delete {
    padding: 0.55rem 0.75rem;
    border-radius: 9999px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    cursor: pointer;
    font-size: 0.85rem;

    &:hover {
      background: #ef4444;
      color: #ffffff;
    }
  }

  .editor-tabs {
    display: flex;
    padding: 0 1.75rem;
    background: rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    gap: 0.5rem;
    overflow-x: auto;
  }

  .editor-tab-btn {
    padding: 0.85rem 1rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted, #94a3b8);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-main, #ffffff);
    }

    &--active {
      color: var(--primary, #818cf8);
      border-bottom-color: var(--primary, #818cf8);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1.75rem;
    box-sizing: border-box;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    &--full {
      grid-column: 1 / -1;
    }
  }

  .form-label {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--text-muted, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    color: var(--text-main, #ffffff);
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;

    &:focus {
      border-color: var(--primary, #6366f1);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.25);
    }
  }

  .form-textarea {
    resize: vertical;
    line-height: 1.5;
  }

  /* Toolbar */
  .pane-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    gap: 1rem;
    flex-wrap: wrap;

    .toolbar-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
    }

    .toolbar-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .add-sec-btn {
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;

      &--text {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
        border-color: rgba(99, 102, 241, 0.3);
      }

      &--code {
        background: rgba(16, 185, 129, 0.15);
        color: #6ee7b7;
        border-color: rgba(16, 185, 129, 0.3);
      }

      &--callout {
        background: rgba(245, 158, 11, 0.15);
        color: #fcd34d;
        border-color: rgba(245, 158, 11, 0.3);
      }

      &:hover {
        filter: brightness(1.2);
        transform: translateY(-1px);
      }
    }
  }

  .sections-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    &__title-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;

      .sec-number {
        font-size: 0.72rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.08);
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        color: var(--text-muted, #94a3b8);
      }

      .sec-title-input {
        flex: 1;
        background: transparent;
        border: none;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
        color: var(--text-main, #ffffff);
        font-size: 0.95rem;
        font-weight: 700;
        outline: none;
        padding: 0.2rem 0;

        &:focus {
          border-bottom-color: var(--primary, #6366f1);
        }
      }
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;

      .card-action-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted, #94a3b8);
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        &--delete:hover {
          background: #ef4444;
          color: #ffffff;
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  .code-editor-block {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .code-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #34d399;
    }

    .code-fields {
      display: flex;
      gap: 0.5rem;
    }

    .code-filename-input {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      outline: none;
    }

    .code-lang-select {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
      outline: none;
    }

    .code-textarea {
      width: 100%;
      background: transparent;
      border: none;
      color: #38bdf8;
      font-family: 'Fira Code', monospace, Consolas;
      font-size: 0.82rem;
      line-height: 1.5;
      outline: none;
      resize: vertical;
      box-sizing: border-box;
    }
  }

  .callout-editor-block {
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);

    .callout-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .callout-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fbbf24;
    }

    .callout-type-select {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      color: #ffffff;
      font-size: 0.72rem;
      padding: 0.15rem 0.35rem;
    }

    .callout-msg-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.45rem 0.65rem;
      color: var(--text-main, #ffffff);
      font-size: 0.82rem;
      outline: none;
    }
  }

  /* Flashcard Form */
  .flashcard-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .card-side-box {
      border-radius: 12px;
      padding: 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .side-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary, #818cf8);
      width: fit-content;
    }
  }

  /* Quiz Form */
  .quiz-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .options-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .options-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .options-title {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
    }

    .add-opt-btn {
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;

      &:hover {
        background: #10b981;
        color: #ffffff;
      }
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.4rem 0.65rem;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);

      &--correct {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.06);
      }
    }

    .option-radio-wrap {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;

      .opt-label {
        font-weight: 800;
        font-size: 0.78rem;
        color: #a5b4fc;
      }
    }

    .option-input {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-main, #ffffff);
      font-size: 0.85rem;
      outline: none;
    }

    .del-opt-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.75rem;

      &:hover {
        color: #ef4444;
      }
    }
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
