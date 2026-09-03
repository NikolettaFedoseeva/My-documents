<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// #region defineEmits
const emit = defineEmits<{
  (e: 'trigger'): void
}>()
// #endregion defineEmits

// #region Обработка hotkey Ctrl+K / Cmd+K
const handleKeyDown = (e: KeyboardEvent): void => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('trigger')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
// #endregion Обработка hotkey
</script>

<template>
  <button
    type="button"
    class="global-search-trigger"
    title="Глобальный поиск (Ctrl+K)"
    @click="emit('trigger')"
  >
    <span class="global-search-trigger__icon">🔍</span>
    <span class="global-search-trigger__text">Быстрый поиск...</span>
    <kbd class="global-search-trigger__kbd">Ctrl K</kbd>
  </button>
</template>

<style scoped lang="scss">
.global-search-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.45rem 0.85rem;
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(99, 102, 241, 0.4);
    color: #f8fafc;
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
  }

  &__icon {
    font-size: 0.85rem;
  }

  &__text {
    font-size: 0.825rem;
    color: #64748b;
  }

  &__kbd {
    font-family: monospace;
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: #cbd5e1;
    margin-left: 0.5rem;
  }
}
</style>
