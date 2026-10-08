<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthorStudio } from '../model/use-author-studio'
import AuthorCoursesBoard from './author-courses-board.vue'
import AuthorSidebar from './author-sidebar.vue'
import AuthorEditor from './author-editor.vue'
import AuthorPreview from './author-preview.vue'
import AuthorImportModal from './author-import-modal.vue'

const router = useRouter()

// #region composable
const {
  // Курсы
  courses,
  selectedCourseId,
  activeCourse,
  isCourseBoardView,
  isCourseModalOpen,
  newCourseForm,
  selectCourse,
  openCreateCourseModal,
  closeCreateCourseModal,
  submitCreateCourse,
  deleteCourse,

  // Экспорт и Импорт
  isImportModalOpen,
  openImportModal,
  closeImportModal,
  exportCourse,
  exportAllCourses,
  handleImportConfirmed,

  // Модули и статьи
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

// Доступные иконки для быстрого выбора
const availableIcons = ['🎓', '⚡', '🗄️', '🚀', '🧠', '🎨', '💡', '🛠️', '🌐', '🛡️', '📦', '🔬']

const onOpenReader = () => {
  if (selectedCourseId.value) {
    router.push({ path: '/docs', query: { course: selectedCourseId.value } })
  } else {
    router.push('/docs')
  }
}
</script>

<template>
  <div class="author-studio">
    <!-- Режим 1: Витрина курсов автора -->
    <div v-if="isCourseBoardView" class="author-studio__board-view">
      <!-- Всплывающее уведомление об успехе -->
      <transition name="toast-fade">
        <div v-if="saveSuccessMessage" class="toast-success toast-success--fixed">
          <span>✓</span>
          <span>{{ saveSuccessMessage }}</span>
        </div>
      </transition>

      <AuthorCoursesBoard
        :courses="courses"
        :is-loading="isLoading"
        @select-course="selectCourse"
        @create-course="openCreateCourseModal"
        @delete-course="deleteCourse"
        @reset-defaults="resetAllToDefaults"
        @export-course="exportCourse"
        @export-all-courses="exportAllCourses"
        @open-import-modal="openImportModal"
      />
    </div>

    <!-- Режим 2: Конструктор выбранного курса -->
    <div v-else class="author-studio__course-editor">
      <!-- Верхняя панель управления и навигации -->
      <header class="author-studio__top-controls">
        <div class="top-controls__left">
          <button
            type="button"
            class="back-to-courses-btn"
            title="Вернуться к реестру курсов"
            @click="selectCourse(null)"
          >
            <span>← Все курсы</span>
          </button>

          <div class="active-course-pill">
            <span class="active-course-icon">{{ activeCourse?.icon || '📚' }}</span>
            <div class="active-course-meta">
              <span class="active-course-title">{{ activeCourse?.title || 'Курс' }}</span>
              <span class="active-course-category">{{ activeCourse?.category }}</span>
            </div>
          </div>
        </div>

        <!-- Всплывающее уведомление об успешном сохранении -->
        <transition name="toast-fade">
          <div v-if="saveSuccessMessage" class="toast-success">
            <span>✓</span>
            <span>{{ saveSuccessMessage }}</span>
          </div>
        </transition>

        <div class="top-controls__right">
          <!-- Кнопка экспорта текущего курса в JSON -->
          <button
            type="button"
            class="btn-export-link"
            title="Экспортировать текущий курс со всеми модулями и главами в JSON"
            @click="exportCourse(activeCourse?.id)"
          >
            <span>📥 Экспорт JSON</span>
          </button>

          <!-- Кнопка перехода в читалку студента -->
          <button
            type="button"
            class="btn-reader-link"
            title="Открыть текущий курс в читалке"
            @click="onOpenReader"
          >
            <span>👁️ Читать курс</span>
          </button>

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
        </div>
      </header>

      <!-- Основное рабочее пространство студии (3 колонки) -->
      <div v-if="isLoading" class="author-studio__loading">
        <div class="spinner-large"></div>
        <p>Загрузка структуры курса...</p>
      </div>

      <div v-else class="author-studio__layout">
        <!-- 1. Левый сайдбар дерева модулей курса -->
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
    </div>

    <!-- Модальное окно создания нового курса -->
    <div v-if="isCourseModalOpen" class="cat-modal-backdrop" @click="closeCreateCourseModal">
      <div class="cat-modal-card cat-modal-card--wide" @click.stop>
        <div class="cat-modal-card__header">
          <h3>📚 Создать новый курс & Базу знаний</h3>
          <button type="button" class="btn-close" @click="closeCreateCourseModal">✕</button>
        </div>

        <div class="cat-modal-card__body">
          <label class="form-field">
            <span class="field-label">Название курса *</span>
            <input
              v-model="newCourseForm.title"
              type="text"
              class="field-input"
              placeholder="Например: Архитектура микросервисов на Go"
            />
          </label>

          <div class="form-row-2">
            <label class="form-field">
              <span class="field-label">Категория дисциплины</span>
              <input
                v-model="newCourseForm.category"
                type="text"
                class="field-input"
                placeholder="Frontend, Backend, DevOps, Data Science"
              />
            </label>

            <label class="form-field">
              <span class="field-label">Сложность</span>
              <select v-model="newCourseForm.level" class="field-input">
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </label>
          </div>

          <div class="form-field">
            <span class="field-label">Иконка курса</span>
            <div class="icons-selector">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                class="icon-opt-btn"
                :class="{ 'icon-opt-btn--active': newCourseForm.icon === icon }"
                @click="newCourseForm.icon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <label class="form-field">
            <span class="field-label">Описание курса</span>
            <textarea
              v-model="newCourseForm.description"
              class="field-input field-textarea"
              rows="3"
              placeholder="Кратко расскажите студентам, какие навыки и знания они освоят..."
            ></textarea>
          </label>

          <label class="form-field">
            <span class="field-label">Теги (через запятую)</span>
            <input
              type="text"
              class="field-input"
              placeholder="Vue 3, TypeScript, State Management"
              :value="newCourseForm.tags?.join(', ')"
              @input="newCourseForm.tags = ($event.target as HTMLInputElement).value.split(',').map(t => t.trim()).filter(Boolean)"
            />
          </label>
        </div>

        <div class="cat-modal-card__footer">
          <button type="button" class="btn-cancel" @click="closeCreateCourseModal">Отмена</button>
          <button type="button" class="btn-submit" @click="submitCreateCourse">Создать курс</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания нового модуля (категории) -->
    <div v-if="isCategoryModalOpen" class="cat-modal-backdrop" @click="closeCreateCategoryModal">
      <div class="cat-modal-card" @click.stop>
        <div class="cat-modal-card__header">
          <h3>📁 Новый модуль курса</h3>
          <button type="button" class="btn-close" @click="closeCreateCategoryModal">✕</button>
        </div>

        <div class="cat-modal-card__body">
          <label class="form-field">
            <span class="field-label">Название модуля *</span>
            <input
              v-model="newCategoryForm.title"
              type="text"
              class="field-input"
              placeholder="Например: Основы реактивности"
            />
          </label>

          <div class="form-row-2">
            <label class="form-field">
              <span class="field-label">Код (01, 02...)</span>
              <input
                v-model="newCategoryForm.code"
                type="text"
                class="field-input"
                placeholder="01"
              />
            </label>

            <label class="form-field">
              <span class="field-label">Иконка</span>
              <input
                v-model="newCategoryForm.icon"
                type="text"
                class="field-input"
                placeholder="📁, ⚡, 🚀, 🔬"
              />
            </label>
          </div>

          <label class="form-field">
            <span class="field-label">Описание модуля</span>
            <textarea
              v-model="newCategoryForm.description"
              class="field-input field-textarea"
              rows="2"
              placeholder="О чём пойдёт речь в этом разделе..."
            ></textarea>
          </label>
        </div>

        <div class="cat-modal-card__footer">
          <button type="button" class="btn-cancel" @click="closeCreateCategoryModal">Отмена</button>
          <button type="button" class="btn-submit" @click="submitCreateCategory">Создать модуль</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно импорта курса / архива -->
    <AuthorImportModal
      :is-open="isImportModalOpen"
      :existing-courses="courses"
      @close="closeImportModal"
      @import-confirmed="handleImportConfirmed"
    />
  </div>
</template>

<style scoped lang="scss">
.author-studio {
  min-height: calc(100vh - 64px);
  background: var(--color-bg, #f8fafc);
  display: flex;
  flex-direction: column;

  &__board-view {
    flex: 1;
    position: relative;
  }

  &__course-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 1.5rem;
    background: var(--color-surface, #ffffff);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
    position: sticky;
    top: 64px;
    z-index: 50;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
    color: var(--color-text-muted, #64748b);
  }

  &__layout {
    flex: 1;
    display: grid;
    grid-template-columns: 320px 1fr 1fr;
    min-height: calc(100vh - 120px);

    @media (max-width: 1400px) {
      grid-template-columns: 280px 1fr 1fr;
    }

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }
}

.top-controls__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.top-controls__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-to-courses-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main, #334155);
  background: var(--color-bg-alt, #f1f5f9);
  border: 1px solid var(--color-border, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

.active-course-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.85rem;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}

.active-course-icon {
  font-size: 1.25rem;
}

.active-course-meta {
  display: flex;
  flex-direction: column;
}

.active-course-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text-main, #0f172a);
}

.active-course-category {
  font-size: 0.72rem;
  color: #6366f1;
  font-weight: 600;
}

.btn-reader-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #6366f1;
    color: #ffffff;
  }
}

.btn-export-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main, #334155);
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #cbd5e1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-alt, #f8fafc);
    color: #6366f1;
    border-color: #a5b4fc;
  }
}

.view-mode-toggle {
  display: inline-flex;
  background: var(--color-bg-alt, #f1f5f9);
  padding: 0.25rem;
  border-radius: 10px;
  gap: 0.25rem;
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    color: var(--color-text-main, #0f172a);
  }

  &--active {
    background: var(--color-surface, #ffffff);
    color: #6366f1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.toast-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #059669;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;

  &--fixed {
    position: fixed;
    top: 80px;
    right: 2rem;
    z-index: 100;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }
}

// Модальное окно
.cat-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.cat-modal-card {
  width: 100%;
  max-width: 480px;
  background: var(--color-surface, #ffffff);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border, #e2e8f0);
  overflow: hidden;

  &--wide {
    max-width: 580px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border, #e2e8f0);

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text-main, #0f172a);
    }
  }

  &__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: var(--color-bg-alt, #f8fafc);
    border-top: 1px solid var(--color-border, #e2e8f0);
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
}

.field-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-border, #cbd5e1);
  background: var(--color-surface, #ffffff);
  font-size: 0.9rem;
  color: var(--color-text-main, #0f172a);

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
}

.field-textarea {
  resize: vertical;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.icons-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-opt-btn {
  font-size: 1.3rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-surface, #ffffff);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #6366f1;
    transform: scale(1.1);
  }

  &--active {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.12);
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-text-muted, #64748b);
  cursor: pointer;

  &:hover {
    color: var(--color-text-main, #0f172a);
  }
}

.btn-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #cbd5e1);
  background: var(--color-surface, #ffffff);
  color: var(--color-text-muted, #64748b);
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: var(--color-text-main, #0f172a);
  }
}

.btn-submit {
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  background: var(--btn-primary-bg, var(--primary, #6366f1));
  color: var(--btn-primary-text, #ffffff);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
}


.spinner-large {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
