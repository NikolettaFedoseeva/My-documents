<script setup lang="ts">
import { ref } from 'vue'

// #region defineProps
interface Props {
  code: string
  language?: string
  filename?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
  filename: '',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'run', code: string): void
}>()
// #endregion defineEmits

// #region refs
const isCopied = ref<boolean>(false)
// #endregion refs

// #region Функции
const copyCode = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Ошибка копирования в буфер обмена:', err)
  }
}

const openPlayground = (): void => {
  emit('run', props.code)
}
// #endregion Функции
</script>

<template>
  <div class="doc-code-block">
    <div class="doc-code-block__header">
      <div class="doc-code-block__meta">
        <span class="doc-code-block__lang">{{ props.language }}</span>
        <span v-if="props.filename" class="doc-code-block__file">{{ props.filename }}</span>
      </div>

      <div class="doc-code-block__actions">
        <button
          type="button"
          class="doc-code-block__run-btn"
          title="Запустить и протестировать в интерактивной песочнице"
          @click="openPlayground"
        >
          <span>▶ Песочница</span>
        </button>

        <button
          type="button"
          class="doc-code-block__copy-btn"
          :class="{ 'doc-code-block__copy-btn--copied': isCopied }"
          @click="copyCode"
        >
          <span v-if="isCopied">✓ Скопировано</span>
          <span v-else>📋 Копировать</span>
        </button>
      </div>
    </div>

    <pre class="doc-code-block__content"><code>{{ props.code }}</code></pre>
  </div>
</template>

<style scoped lang="scss">
.doc-code-block {
  margin: 1.25rem 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 1rem;
    background: rgba(30, 41, 59, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__lang {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #818cf8;
    letter-spacing: 0.05em;
  }

  &__file {
    font-size: 0.8rem;
    color: #94a3b8;
    font-family: monospace;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__run-btn {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #a5b4fc;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
      background: rgba(99, 102, 241, 0.25);
      border-color: rgba(99, 102, 241, 0.6);
      color: #ffffff;
      transform: translateY(-1px);
    }
  }

  &__copy-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    font-size: 0.75rem;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    &--copied {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }
  }

  &__content {
    margin: 0;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e2e8f0;
  }
}
</style>
