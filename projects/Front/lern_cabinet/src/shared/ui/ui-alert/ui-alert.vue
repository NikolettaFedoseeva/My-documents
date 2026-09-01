<script setup lang="ts">
import { computed } from 'vue'
import type { AlertVariant } from './types'

// #region Props & Emits
interface Props {
  variant?: AlertVariant
  title?: string
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
  closable: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()
// #endregion Props & Emits

// #region Computed
const defaultIcon = computed(() => {
  switch (props.variant) {
    case 'success': return '✅'
    case 'warning': return '⚠️'
    case 'danger': return '🚨'
    case 'info':
    default: return '💡'
  }
})
// #endregion Computed

const onClose = () => {
  emit('close')
}
</script>

<template>
  <div class="ui-alert" :class="[`ui-alert--${props.variant}`]">
    <div class="ui-alert__icon">
      <slot name="icon">{{ defaultIcon }}</slot>
    </div>

    <div class="ui-alert__content">
      <div v-if="props.title || $slots.title" class="ui-alert__title">
        <slot name="title">{{ props.title }}</slot>
      </div>
      <div class="ui-alert__message">
        <slot></slot>
      </div>
    </div>

    <button v-if="props.closable" class="ui-alert__close" @click="onClose">✕</button>
  </div>
</template>

<style scoped lang="scss">
.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  backdrop-filter: var(--card-blur);
  width: 100%;

  &--info {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.12);
  }

  &--success {
    border-color: var(--success);
    background: rgba(16, 185, 129, 0.12);
  }

  &--warning {
    border-color: var(--warning);
    background: rgba(245, 158, 11, 0.12);
  }

  &--danger {
    border-color: var(--danger);
    background: rgba(239, 68, 68, 0.12);
  }

  &__icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-main);
  }

  &__message {
    font-size: 0.9rem;
    color: var(--text-main);
    line-height: 1.45;
  }

  &__close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.2rem;

    &:hover {
      color: var(--text-main);
    }
  }
}
</style>
