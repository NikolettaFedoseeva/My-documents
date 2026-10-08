<script setup lang="ts">
import { ref, computed } from 'vue'
import { UiTag, UiLoader } from 'lern-ui-kit'
import type { CourseCodex } from '@/entities/doc'
import {
  parseAndValidateCourseJson,
  type ParseImportPayloadResult,
  type ParsedImportCourse,
} from '../model/course-transfer'

// #region defineProps
interface Props {
  existingCourses: CourseCodex[]
  isOpen: boolean
}

const props = withDefaults(defineProps<Props>(), {
  existingCourses: () => [],
  isOpen: false,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-confirmed', payload: { courses: CourseCodex[]; overwrite: boolean }): void
}>()
// #endregion defineEmits

// #region refs
type TabMode = 'file' | 'text'
const activeTab = ref<TabMode>('file')

// Файл
const isDragging = ref<boolean>(false)
const selectedFileName = ref<string>('')
const selectedFileSize = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// Текст
const rawJsonText = ref<string>('')

// Состояние парсинга и валидации
const parseResult = ref<ParseImportPayloadResult | null>(null)
const overwriteExisting = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
// #endregion refs

// #region computed
const hasValidCourses = computed<boolean>(() => {
  return Boolean(parseResult.value?.success && parseResult.value.courses.length > 0)
})

const hasConflict = computed<boolean>(() => {
  return Boolean(parseResult.value?.courses.some((c) => c.isConflict))
})

const totalChaptersToImport = computed<number>(() => {
  if (!parseResult.value) return 0
  return parseResult.value.courses.reduce((sum, c) => sum + c.chaptersCount, 0)
})

const totalModulesToImport = computed<number>(() => {
  if (!parseResult.value) return 0
  return parseResult.value.courses.reduce((sum, c) => sum + c.modulesCount, 0)
})
// #endregion computed

// #region Функции
const getLevelText = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'Начинающий'
    case 'advanced':
      return 'Продвинутый'
    default:
      return 'Средний'
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const processJsonContent = (content: string, fileName?: string, fileSize?: number) => {
  if (fileName) selectedFileName.value = fileName
  if (fileSize !== undefined) selectedFileSize.value = formatBytes(fileSize)

  const result = parseAndValidateCourseJson(content, props.existingCourses)
  parseResult.value = result

  // По умолчанию не перезаписываем, если есть конфликт
  overwriteExisting.value = false
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = (e.target?.result as string) || ''
    processJsonContent(text, file.name, file.size)
  }
  reader.readAsText(file)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onDropFile = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  if (!file.name.endsWith('.json')) {
    parseResult.value = {
      success: false,
      errorMessage: 'Поддерживаются только файлы с расширением .json',
      isBatch: false,
      courses: [],
    }
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = (e.target?.result as string) || ''
    processJsonContent(text, file.name, file.size)
  }
  reader.readAsText(file)
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onAnalyzeTextJson = () => {
  processJsonContent(rawJsonText.value, 'Введённый JSON фрагмент', rawJsonText.value.length)
}

const resetForm = () => {
  selectedFileName.value = ''
  selectedFileSize.value = ''
  rawJsonText.value = ''
  parseResult.value = null
  overwriteExisting.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const onClose = () => {
  resetForm()
  emit('close')
}

const onConfirmImport = () => {
  if (!hasValidCourses.value || !parseResult.value) return

  isSubmitting.value = true
  const coursesToImport = parseResult.value.courses.map((c) => c.course)
  emit('import-confirmed', {
    courses: coursesToImport,
    overwrite: overwriteExisting.value,
  })
}
// #endregion Функции
</script>

<template>
  <div v-if="isOpen" class="import-modal-backdrop" @click="onClose">
    <div class="import-modal-card" @click.stop>
      <!-- Шапка модалки -->
      <div class="import-modal-card__header">
        <div class="header-info">
          <span class="header-icon">📤</span>
          <div>
            <h3 class="header-title">Импорт курса или архива в JSON</h3>
            <p class="header-desc">
              Загрузите файл экспорта для добавления курса или восстановления базы знаний
            </p>
          </div>
        </div>
        <button type="button" class="btn-close" title="Закрыть" @click="onClose">✕</button>
      </div>

      <!-- Вкладки источника ввода -->
      <div class="import-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'file' }"
          @click="activeTab = 'file'"
        >
          <span>📁 Загрузить файл .json</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'text' }"
          @click="activeTab = 'text'"
        >
          <span>📝 Вставить JSON текст</span>
        </button>
      </div>

      <!-- Содержимое вкладок -->
      <div class="import-body">
        <!-- 1. Вкладка Файл (Drag-and-Drop) -->
        <div v-if="activeTab === 'file'" class="file-tab">
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden-file-input"
            @change="onFileSelect"
          />

          <div
            class="dropzone"
            :class="{ 'dropzone--dragging': isDragging, 'dropzone--has-file': Boolean(selectedFileName) }"
            @click="triggerFileInput"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDropFile"
          >
            <div class="dropzone__icon">
              <span v-if="selectedFileName">📄</span>
              <span v-else-if="isDragging">📥</span>
              <span v-else>📁</span>
            </div>

            <div v-if="selectedFileName" class="dropzone__file-meta">
              <span class="file-name">{{ selectedFileName }}</span>
              <span class="file-size">{{ selectedFileSize }}</span>
              <span class="file-change-hint">Нажмите или перетащите другой файл для замены</span>
            </div>

            <div v-else class="dropzone__prompt">
              <p class="prompt-main">
                Перетащите <strong>.json</strong> файл сюда или <span class="highlight">выберите на компьютере</span>
              </p>
              <p class="prompt-sub">
                Поддерживаются экспортированные курсы LERN и полные архивы базы знаний
              </p>
            </div>
          </div>
        </div>

        <!-- 2. Вкладка Ручной ввод JSON -->
        <div v-else class="text-tab">
          <label class="text-label" for="json-textarea">
            <span>Вставьте сырой JSON курса:</span>
          </label>
          <textarea
            id="json-textarea"
            v-model="rawJsonText"
            class="json-textarea"
            placeholder='{ "title": "Мой интерактивный курс", "category": "Frontend", "modules": [ ... ] }'
            rows="7"
          ></textarea>
          <div class="text-tab__actions">
            <button
              type="button"
              class="btn-analyze"
              :disabled="!rawJsonText.trim()"
              @click="onAnalyzeTextJson"
            >
              <span>🔍 Проверить и разобрать JSON</span>
            </button>
          </div>
        </div>

        <!-- Блок сообщения об ошибке валидации -->
        <div v-if="parseResult && !parseResult.success" class="error-banner">
          <span class="error-icon">⚠️</span>
          <div class="error-content">
            <span class="error-title">Ошибка формата данных</span>
            <span class="error-text">{{ parseResult.errorMessage }}</span>
          </div>
        </div>

        <!-- Блок предпросмотра структуры курса перед импортом -->
        <div v-if="hasValidCourses && parseResult" class="preview-section">
          <div class="preview-header">
            <span class="preview-title">
              {{ parseResult.isBatch ? '📦 Обнаружен архив из нескольких курсов:' : '📋 Предпросмотр курса:' }}
            </span>
            <span class="preview-summary">
              Всего модулей: {{ totalModulesToImport }} • Всего глав: {{ totalChaptersToImport }}
            </span>
          </div>

          <!-- Список карточек распознанных курсов -->
          <div class="courses-preview-list">
            <div
              v-for="item in parseResult.courses"
              :key="item.course.id"
              class="course-preview-card"
              :class="{ 'course-preview-card--conflict': item.isConflict }"
            >
              <div class="card-icon-col">
                <span class="course-emoji">{{ item.course.icon || '📚' }}</span>
              </div>

              <div class="card-info-col">
                <div class="card-badges">
                  <span class="category-chip">{{ item.course.category }}</span>
                  <span class="level-chip">{{ getLevelText(item.course.level) }}</span>
                  <span v-if="item.isConflict" class="conflict-chip">
                    ⚠️ Совпадение slug
                  </span>
                </div>

                <h4 class="card-title">{{ item.course.title }}</h4>
                <p v-if="item.course.description" class="card-desc">{{ item.course.description }}</p>

                <div class="card-meta">
                  <span class="meta-item">📁 {{ item.modulesCount }} модулей</span>
                  <span class="meta-item">📜 {{ item.chaptersCount }} глав</span>
                  <span class="meta-item">🏷️ {{ (item.course.tags || []).slice(0, 3).join(', ') }}</span>
                </div>

                <!-- Предупреждение о конфликте с существующим курсом -->
                <div v-if="item.isConflict" class="conflict-notice">
                  Курс с идентификатором <code>{{ item.course.slug }}</code> уже есть в системе: «{{ item.existingCourseTitle }}».
                </div>
              </div>
            </div>
          </div>

          <!-- Переключатель разрешения конфликтов при наличии совпадений -->
          <div v-if="hasConflict" class="conflict-resolver">
            <span class="resolver-label">Стратегия при совпадении с существующим курсом:</span>
            <div class="resolver-options">
              <label class="resolver-option" :class="{ 'resolver-option--selected': !overwriteExisting }">
                <input
                  v-model="overwriteExisting"
                  type="radio"
                  :value="false"
                  name="conflict-resolution"
                />
                <div class="option-text">
                  <span class="option-title">Создать как копию (Рекомендуется)</span>
                  <span class="option-hint">Присвоит курсу новый уникальный идентификатор и пометку «(Копия)»</span>
                </div>
              </label>

              <label class="resolver-option" :class="{ 'resolver-option--selected': overwriteExisting }">
                <input
                  v-model="overwriteExisting"
                  type="radio"
                  :value="true"
                  name="conflict-resolution"
                />
                <div class="option-text">
                  <span class="option-title">Перезаписать существующий курс</span>
                  <span class="option-hint">Заменит все модули и главы существующего курса новыми данными</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Подвал модалки -->
      <div class="import-modal-card__footer">
        <button
          type="button"
          class="btn-cancel"
          :disabled="isSubmitting"
          @click="onClose"
        >
          <span>Отмена</span>
        </button>

        <button
          v-if="selectedFileName || rawJsonText"
          type="button"
          class="btn-reset"
          :disabled="isSubmitting"
          @click="resetForm"
        >
          <span>Сбросить</span>
        </button>

        <button
          type="button"
          class="btn-confirm"
          :disabled="!hasValidCourses || isSubmitting"
          @click="onConfirmImport"
        >
          <span v-if="isSubmitting" class="spinner-small"></span>
          <span v-else>📥 Импортировать {{ parseResult?.courses.length || 0 }} {{ parseResult?.courses.length === 1 ? 'курс' : 'курса(ов)' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.import-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.import-modal-card {
  background: #1e2538;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  width: 100%;
  max-width: 740px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08);
  animation: modal-scale 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem 1.75rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    .header-info {
      display: flex;
      gap: 1rem;
      align-items: center;

      .header-icon {
        font-size: 2rem;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
      }

      .header-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 0.25rem;
      }

      .header-desc {
        font-size: 0.875rem;
        color: #94a3b8;
        margin: 0;
      }
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #191f30;
  }
}

// Вкладки
.import-tabs {
  display: flex;
  padding: 0.75rem 1.75rem 0;
  gap: 0.5rem;
  background: #191f30;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .tab-btn {
    background: transparent;
    border: none;
    padding: 0.65rem 1.1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s ease;

    &:hover {
      color: #f1f5f9;
    }

    &--active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }
  }
}

// Тело
.import-body {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

// Дропзона
.dropzone {
  border: 2px dashed rgba(99, 102, 241, 0.4);
  border-radius: 14px;
  padding: 2.25rem 1.5rem;
  text-align: center;
  background: rgba(99, 102, 241, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &:hover,
  &--dragging {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.12);
    transform: translateY(-1px);
  }

  &--has-file {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.06);
  }

  &__icon {
    font-size: 2.5rem;
  }

  &__prompt {
    .prompt-main {
      font-size: 1rem;
      color: #e2e8f0;
      margin: 0 0 0.35rem;

      .highlight {
        color: #818cf8;
        text-decoration: underline;
      }
    }

    .prompt-sub {
      font-size: 0.8125rem;
      color: #94a3b8;
      margin: 0;
    }
  }

  &__file-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    .file-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #4ade80;
    }

    .file-size {
      font-size: 0.8125rem;
      color: #94a3b8;
    }

    .file-change-hint {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.35rem;
    }
  }
}

.hidden-file-input {
  display: none;
}

// Текстовая вкладка
.text-tab {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .text-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .json-textarea {
    width: 100%;
    background: #131826;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 0.85rem;
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 0.8125rem;
    color: #e2e8f0;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    .btn-analyze {
      background: #312e81;
      color: #e0e7ff;
      border: 1px solid rgba(99, 102, 241, 0.4);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background: #4338ca;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

// Баннер ошибки
.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  .error-icon {
    font-size: 1.25rem;
  }

  .error-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    .error-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #f87171;
    }

    .error-text {
      font-size: 0.8125rem;
      color: #fca5a5;
    }
  }
}

// Предпросмотр
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  .preview-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .preview-summary {
    font-size: 0.8125rem;
    color: #94a3b8;
  }
}

.courses-preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
}

.course-preview-card {
  display: flex;
  gap: 1rem;
  background: #161b2a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  align-items: flex-start;

  &--conflict {
    border-color: rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.04);
  }

  .card-icon-col {
    .course-emoji {
      font-size: 2rem;
      background: rgba(255, 255, 255, 0.06);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }
  }

  .card-info-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    .card-badges {
      display: flex;
      gap: 0.4rem;
      align-items: center;

      .category-chip {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
      }

      .level-chip {
        font-size: 0.7rem;
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
      }

      .conflict-chip {
        font-size: 0.7rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
      }
    }

    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .card-desc {
      font-size: 0.8125rem;
      color: #94a3b8;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .conflict-notice {
      margin-top: 0.4rem;
      font-size: 0.75rem;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      padding: 0.35rem 0.6rem;
      border-radius: 6px;

      code {
        font-family: monospace;
        font-weight: 700;
      }
    }
  }
}

// Стратегия разрешения конфликтов
.conflict-resolver {
  background: #141926;
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;

  .resolver-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .resolver-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .resolver-option {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    transition: all 0.15s ease;

    input[type='radio'] {
      margin-top: 0.2rem;
      accent-color: #6366f1;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;

      .option-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #f1f5f9;
      }

      .option-hint {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }

    &--selected {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.4);
    }
  }
}

// Кнопки
.btn-cancel {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
}

.btn-reset {
  background: transparent;
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
  }
}

.btn-confirm {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modal-scale {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
