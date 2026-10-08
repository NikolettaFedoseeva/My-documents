<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCodeRunner } from '../model/use-code-runner'

// #region defineProps
interface Props {
  modelValue: boolean
  initialCode?: string
  filename?: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialCode: '// Введите ваш код здесь\nconsole.log("Hello LERN Playground!");',
  filename: 'playground.ts',
  language: 'typescript',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()
// #endregion defineEmits

// #region composables
const {
  code,
  isRunning,
  logs,
  executionTimeMs,
  error,
  runCode,
  clearLogs,
  resetCode,
  setCode,
} = useCodeRunner(props.initialCode)
// #endregion composables

// #region refs
const editorRef = ref<HTMLTextAreaElement | null>(null)
// #endregion refs

// #region watch
watch(
  () => props.initialCode,
  (newVal) => {
    if (newVal) {
      setCode(newVal)
    }
  },
  { immediate: true }
)
// #endregion watch

// #region computed
const lineNumbers = computed<number[]>(() => {
  const lineCount = (code.value.match(/\n/g) || []).length + 1
  return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1)
})
// #endregion computed

// #region Функции
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleKeydown = (e: KeyboardEvent) => {
  // Закрытие по Escape
  if (e.key === 'Escape' && props.modelValue) {
    close()
    return
  }

  // Запуск по Ctrl+Enter или Cmd+Enter
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && props.modelValue) {
    e.preventDefault()
    runCode()
  }
}

const handleEditorKeydown = (e: KeyboardEvent) => {
  // Поддержка табуляции (вставка 2 пробелов)
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = editorRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const val = textarea.value

    textarea.value = val.substring(0, start) + '  ' + val.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 2
    code.value = textarea.value
  }
}
// #endregion Функции

// #region Хуки жизненного цикла
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// #endregion Хуки жизненного цикла
</script>

<template>
  <Teleport to="body">
    <Transition name="playground-fade">
      <div v-if="props.modelValue" class="playground-overlay" @click.self="close">
        <div class="playground-modal">
          <!-- Шапка песочницы -->
          <div class="playground-modal__header">
            <div class="playground-modal__meta">
              <div class="playground-modal__icon">💻</div>
              <div>
                <h3 class="playground-modal__title">Песочница кода LERN</h3>
                <div class="playground-modal__submeta">
                  <span class="playground-modal__file">{{ props.filename }}</span>
                  <span class="playground-modal__badge">{{ props.language }}</span>
                  <span v-if="executionTimeMs !== null" class="playground-modal__timing">
                    ⏱ {{ executionTimeMs }} ms
                  </span>
                </div>
              </div>
            </div>

            <div class="playground-modal__actions">
              <button
                type="button"
                class="playground-modal__btn playground-modal__btn--reset"
                title="Сбросить код к исходному"
                @click="resetCode"
              >
                ⟲ Сброс
              </button>

              <button
                type="button"
                class="playground-modal__btn playground-modal__btn--run"
                :disabled="isRunning"
                @click="() => runCode()"
              >
                <span v-if="isRunning" class="spinner">⏳</span>
                <span v-else>▶ Запустить</span>
                <span class="playground-modal__hotkey">Ctrl+↵</span>
              </button>

              <button
                type="button"
                class="playground-modal__btn-close"
                title="Закрыть (Esc)"
                @click="close"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Основное рабочее пространство (Сплит) -->
          <div class="playground-modal__body">
            <!-- Редактор кода -->
            <div class="playground-editor">
              <div class="playground-editor__toolbar">
                <span class="playground-editor__title">📝 Редактор</span>
                <span class="playground-editor__hint">Поддерживает JavaScript & TypeScript синтаксис</span>
              </div>

              <div class="playground-editor__canvas">
                <!-- Номера строк -->
                <div class="playground-editor__gutters">
                  <span
                    v-for="line in lineNumbers"
                    :key="line"
                    class="playground-editor__line-number"
                  >
                    {{ line }}
                  </span>
                </div>

                <!-- Поле ввода кода -->
                <textarea
                  ref="editorRef"
                  v-model="code"
                  class="playground-editor__textarea"
                  spellcheck="false"
                  placeholder="// Напишите код..."
                  @keydown="handleEditorKeydown"
                ></textarea>
              </div>
            </div>

            <!-- Консоль вывода -->
            <div class="playground-console">
              <div class="playground-console__toolbar">
                <div class="playground-console__title-group">
                  <span class="playground-console__title">🖥️ Терминал вывода</span>
                  <span v-if="logs.length > 0" class="playground-console__count">
                    {{ logs.length }} {{ logs.length === 1 ? 'запись' : 'записей' }}
                  </span>
                </div>

                <button
                  type="button"
                  class="playground-console__btn-clear"
                  :disabled="logs.length === 0"
                  @click="clearLogs"
                >
                  🧹 Очистить
                </button>
              </div>

              <div class="playground-console__output">
                <div v-if="logs.length === 0 && !isRunning" class="playground-console__empty">
                  <div class="playground-console__empty-icon">⚡</div>
                  <p>Нажмите <strong>«▶ Запустить»</strong> или нажмите <code>Ctrl + Enter</code> для выполнения кода.</p>
                </div>

                <div
                  v-for="item in logs"
                  :key="item.id"
                  class="playground-console__item"
                  :class="`playground-console__item--${item.type}`"
                >
                  <span class="playground-console__time">{{ item.timestamp }}</span>
                  <span class="playground-console__type-badge">{{ item.type }}</span>
                  <pre class="playground-console__msg">{{ item.message }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.playground-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.playground-modal {
  width: 100%;
  max-width: 1200px;
  height: 85vh;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__icon {
    font-size: 1.8rem;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }

  &__submeta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.2rem;
  }

  &__file {
    font-size: 0.8rem;
    font-family: monospace;
    color: #94a3b8;
  }

  &__badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
    padding: 0.1rem 0.5rem;
    border-radius: 9999px;
  }

  &__timing {
    font-size: 0.75rem;
    color: #34d399;
    font-family: monospace;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &--reset {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
      }
    }

    &--run {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(79, 70, 229, 0.6);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__hotkey {
    font-size: 0.7rem;
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.25);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &__body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 0;
  }
}

/* Редактор */
.playground-editor {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 0;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: rgba(15, 23, 42, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
  }

  &__hint {
    font-size: 0.75rem;
    color: #64748b;
  }

  &__canvas {
    flex: 1;
    display: flex;
    background: #050811;
    min-height: 0;
    position: relative;
  }

  &__gutters {
    width: 48px;
    padding: 1rem 0;
    background: rgba(15, 23, 42, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.04);
    user-select: none;
    text-align: right;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__line-number {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #475569;
    padding-right: 0.75rem;
  }

  &__textarea {
    flex: 1;
    padding: 1rem;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    color: #e2e8f0;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre;
    overflow: auto;
    tab-size: 2;

    &::placeholder {
      color: #475569;
    }
  }
}

/* Консоль */
.playground-console {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #020617;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: rgba(15, 23, 42, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
  }

  &__count {
    font-size: 0.7rem;
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
  }

  &__btn-clear {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.2s;

    &:hover:not(:disabled) {
      color: #f8fafc;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__output {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #64748b;
    text-align: center;
    gap: 0.5rem;

    &-icon {
      font-size: 2.5rem;
      opacity: 0.6;
    }

    code {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #a5b4fc;
    }
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 0.825rem;
    line-height: 1.5;
    background: rgba(15, 23, 42, 0.5);
    border-left: 3px solid transparent;

    &--log {
      border-left-color: #64748b;
      color: #e2e8f0;
    }

    &--info {
      border-left-color: #38bdf8;
      background: rgba(56, 189, 248, 0.06);
      color: #bae6fd;
    }

    &--warn {
      border-left-color: #f59e0b;
      background: rgba(245, 158, 11, 0.08);
      color: #fef3c7;
    }

    &--error {
      border-left-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      color: #fecaca;
    }

    &--return {
      border-left-color: #10b981;
      background: rgba(16, 185, 129, 0.08);
      color: #a7f3d0;
    }
  }

  &__time {
    font-size: 0.7rem;
    color: #475569;
    user-select: none;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  &__type-badge {
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0.05rem 0.35rem;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  &__msg {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    flex: 1;
    font-family: inherit;
  }
}

/* Анимация */
.playground-fade-enter-active,
.playground-fade-leave-active {
  transition: opacity 0.25s ease;
}

.playground-fade-enter-from,
.playground-fade-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .playground-modal {
    height: 95vh;

    &__body {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }

  .playground-editor {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
