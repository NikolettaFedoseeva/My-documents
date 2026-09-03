<script setup lang="ts">
import { ref, watch } from 'vue'

// #region defineProps
interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Быстрый поиск по документации...',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
  (e: 'clear'): void
}>()
// #endregion defineEmits

// #region refs
const searchQuery = ref<string>(props.modelValue)
// #endregion refs

// #region watch
watch(
  () => props.modelValue,
  (val) => {
    if (val !== searchQuery.value) {
      searchQuery.value = val
    }
  }
)
// #endregion watch

// #region Функции
const onInput = (e: Event): void => {
  const value = (e.target as HTMLInputElement).value
  searchQuery.value = value
  emit('update:modelValue', value)
  emit('search', value)
}

const clearSearch = (): void => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

const onKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    clearSearch()
  }
}
// #endregion Функции
</script>

<template>
  <div class="search-docs-input">
    <span class="search-docs-input__icon">🔍</span>
    <input
      :value="searchQuery"
      type="text"
      class="search-docs-input__field"
      :placeholder="props.placeholder"
      @input="onInput"
      @keydown="onKeyDown"
    />
    <button
      v-if="searchQuery"
      type="button"
      class="search-docs-input__clear"
      title="Очистить (Esc)"
      @click="clearSearch"
    >
      ✕
    </button>
  </div>
</template>

<style scoped lang="scss">
.search-docs-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.5rem 0.85rem;
  transition: all 0.25s ease;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
    background: rgba(15, 23, 42, 0.85);
  }

  &__icon {
    font-size: 0.9rem;
    margin-right: 0.6rem;
    opacity: 0.7;
  }

  &__field {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f8fafc;
    font-size: 0.875rem;

    &::placeholder {
      color: #64748b;
    }
  }

  &__clear {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
