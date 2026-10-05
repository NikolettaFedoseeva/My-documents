<script setup lang="ts">
import { useAuthorStudio } from '../model/use-author-studio'
import AuthorSidebar from './author-sidebar.vue'
import AuthorEditor from './author-editor.vue'
import AuthorPreview from './author-preview.vue'

// #region composable
const {
  categories,
  selectedDocId,
  selectedCategoryId,
  docDraft,
  previewDoc,
  activeTab,
  previewMode,
  isLoading,
  isSaving,
  isEditingExisting,
  saveSuccessMessage,
  isCategoryModalOpen,
  newCategoryForm,
  selectDoc,
  startCreateNewDoc,
  saveDoc,
  deleteCurrentDoc,
  openCreateCategoryModal,
  closeCreateCategoryModal,
  submitCreateCategory,
  deleteCategory,
  addSection,
  removeSection,
  moveSection,
  addQuizOption,
  removeQuizOption,
  setCorrectQuizOption,
  resetAllToDefaults,
} = useAuthorStudio()
// #endregion composable
</script>

<template>
  <div class="author-studio">
    <!-- Верхняя панель режимов рабочего стола -->
    <header class="author-studio__top-controls">
      <div class="top-controls__left">
        <span class="studio-logo">🛠️</span>
        <h2 class="studio-title">Author Studio</h2>
        <span class="studio-tag">Конструктор Знаний</span>
      </div>

      <!-- Всплывающее уведомление об успешном сохранении -->
      <transition name="toast-fade">
        <div v-if="saveSuccessMessage" class="toast-success">
          <span>✓</span>
          <span>{{ saveSuccessMessage }}</span>
        </div>
      </transition>

      <!-- Переключатель режима отображения: Сплит / Редактор / Предпросмотр -->
      <div class="view-mode-toggle">
        <button
          type="button"
          class="mode-btn"
          :class="{ 'mode-btn--active': previewMode === 'split' }"
          title="Редактор и предпросмотр параллельно"
          @click="previewMode = 'split'"
        >
          <span>⚖️ Сплит-экран</span>
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ 'mode-btn--active': previewMode === 'editor' }"
          title="Только форма редактирования"
          @click="previewMode = 'editor'"
        >
          <span>📝 Редактор</span>
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ 'mode-btn--active': previewMode === 'preview' }"
          title="Только предпросмотр статьи"
          @click="previewMode = 'preview'"
        >
          <span>👁️ Предпросмотр</span>
        </button>
      </div>
    </header>

    <!-- Основное рабочее пространство студии -->
    <div v-if="isLoading" class="author-studio__loading">
      <div class="spinner-large"></div>
      <p>Загрузка структуры базы знаний...</p>
    </div>

    <div v-else class="author-studio__layout">
      <!-- 1. Левый сайдбар дерева модулей -->
      <AuthorSidebar
        :categories="categories"
        :selected-doc-id="selectedDocId"
        :selected-category-id="selectedCategoryId"
        @select-doc="selectDoc"
        @create-doc="startCreateNewDoc"
        @create-category="openCreateCategoryModal"
        @delete-category="deleteCategory"
        @reset-defaults="resetAllToDefaults"
      />

      <!-- 2. Центральный конструктор главы -->
      <AuthorEditor
        v-if="previewMode === 'split' || previewMode === 'editor'"
        :draft="docDraft"
        :categories="categories"
        :active-tab="activeTab"
        :is-editing-existing="isEditingExisting"
        :is-saving="isSaving"
        @update:active-tab="activeTab = $event"
        @save="saveDoc"
        @delete="deleteCurrentDoc"
        @add-section="addSection"
        @remove-section="removeSection"
        @move-section="moveSection"
        @add-quiz-option="addQuizOption"
        @remove-quiz-option="removeQuizOption"
        @set-correct-quiz-option="setCorrectQuizOption"
      />

      <!-- 3. Правый живой предпросмотр -->
      <AuthorPreview
        v-if="previewMode === 'split' || previewMode === 'preview'"
        :doc="previewDoc"
      />
    </div>

    <!-- Модальное окно создания нового модуля (категории) -->
    <div v-if="isCategoryModalOpen" class="cat-modal-backdrop" @click="closeCreateCategoryModal">
      <div class="cat-modal-card" @click.stop>
        <div class="cat-modal-card__header">
          <h3>📁 Новый модуль базы знаний</h3>
          <button type="button" class="close-btn" @click="closeCreateCategoryModal">✕</button>
        </div>

        <form class="cat-modal-card__body" @submit.prevent="submitCreateCategory">
          <div class="form-group">
            <label class="form-label">Название модуля</label>
            <input
              v-model="newCategoryForm.title"
              type="text"
              placeholder="например: Тестирование и Jest"
              required
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Код модуля</label>
              <input
                v-model="newCategoryForm.code"
                type="text"
                placeholder="04"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Иконка (эмодзи)</label>
              <input
                v-model="newCategoryForm.icon"
                type="text"
                placeholder="🧪"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Описание модуля</label>
            <textarea
              v-model="newCategoryForm.description"
              rows="3"
              placeholder="Краткое описание тем, входящих в данный модуль..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeCreateCategoryModal">Отмена</button>
            <button type="submit" class="btn-create">Создать модуль</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.author-studio {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  width: 100%;
  background: var(--bg-body, #0a0f1d);
  overflow: hidden;
  box-sizing: border-box;

  &__top-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 1.5rem;
    background: var(--bg-container, #131c2e);
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    z-index: 10;
    gap: 1rem;
  }

  .top-controls__left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .studio-logo {
    font-size: 1.35rem;
  }

  .studio-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--text-main, #ffffff);
    margin: 0;
  }

  .studio-tag {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary, #818cf8);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .toast-success {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.4rem 0.85rem;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    font-size: 0.78rem;
    font-weight: 700;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
  }

  .toast-fade-enter-active,
  .toast-fade-leave-active {
    transition: all 0.3s ease;
  }
  .toast-fade-enter-from,
  .toast-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  .view-mode-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.25rem;
    border-radius: 8px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    gap: 0.25rem;

    .mode-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-main, #ffffff);
      }

      &--active {
        background: var(--primary, #6366f1);
        color: #ffffff;
      }
    }
  }

  &__loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted, #94a3b8);
    gap: 1rem;
    font-size: 0.95rem;

    .spinner-large {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--primary, #6366f1);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }

  &__layout {
    flex: 1;
    display: flex;
    height: calc(100% - 50px);
    overflow: hidden;
  }

  /* Модальное окно */
  .cat-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
  }

  .cat-modal-card {
    background: var(--bg-card, #1c2738);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.15rem 1.5rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));

      h3 {
        margin: 0;
        font-size: 1.05rem;
        color: var(--text-main, #ffffff);
      }

      .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        font-size: 1.1rem;

        &:hover {
          color: #ffffff;
        }
      }
    }

    &__body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      padding: 0.55rem 0.85rem;
      color: var(--text-main, #ffffff);
      font-size: 0.88rem;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: var(--primary, #6366f1);
      }
    }

    .form-textarea {
      resize: vertical;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .btn-cancel {
      padding: 0.55rem 1rem;
      border-radius: 8px;
      background: transparent;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.82rem;

      &:hover {
        color: #ffffff;
      }
    }

    .btn-create {
      padding: 0.55rem 1.25rem;
      border-radius: 8px;
      background: var(--primary, #6366f1);
      color: #ffffff;
      border: none;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);

      &:hover {
        filter: brightness(1.15);
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
