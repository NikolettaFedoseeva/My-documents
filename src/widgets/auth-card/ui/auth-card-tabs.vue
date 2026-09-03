<script setup lang="ts">
import { AuthMode } from '@/entities/auth'

// #region defineProps
interface Props {
  activeMode: AuthMode
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'change-mode', mode: AuthMode): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="auth-card-tabs">
    <button
      type="button"
      class="auth-card-tabs__btn"
      :class="{ 'auth-card-tabs__btn--active': props.activeMode === 'login' }"
      @click="emit('change-mode', 'login')"
    >
      Вход
    </button>
    <button
      type="button"
      class="auth-card-tabs__btn"
      :class="{ 'auth-card-tabs__btn--active': props.activeMode === 'register' }"
      @click="emit('change-mode', 'register')"
    >
      Регистрация
    </button>
  </div>
</template>

<style scoped lang="scss">
.auth-card-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(15, 23, 42, 0.6);
  padding: 0.3rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &__btn {
    background: transparent;
    border: none;
    padding: 0.6rem;
    border-radius: 9px;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      color: #f8fafc;
    }

    &--active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.35);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }
  }
}
</style>
