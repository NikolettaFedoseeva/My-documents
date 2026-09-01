<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, ButtonSize } from './types'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

// #endregion Types & Interfaces

// #region defineProps
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  disabled: false,
  loading: false,
  type: 'button',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
// #endregion defineEmits

// #region computed
const buttonClasses = computed(() => {
  return [
    'ui-button',
    `ui-button--${props.variant}`,
    `ui-button--${props.size}`,
    {
      'ui-button--icon-only': props.iconOnly,
      'ui-button--loading': props.loading,
      'ui-button--disabled': props.disabled,
    },
  ]
})
// #endregion computed

// #region Functions
const onClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
// #endregion Functions
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <!-- Spinner Loader -->
    <span v-if="loading" class="ui-button__spinner">
      <svg class="ui-button__spinner-icon" viewBox="0 0 24 24" fill="none">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- Icon Left Slot -->
    <span v-if="$slots['icon-left'] && !loading" class="ui-button__icon-left">
      <slot name="icon-left" />
    </span>

    <!-- Main Content Slot -->
    <span v-if="$slots.default" class="ui-button__content">
      <slot />
    </span>

    <!-- Icon Right Slot -->
    <span v-if="$slots['icon-right'] && !loading" class="ui-button__icon-right">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<style scoped lang="scss">
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  /* Sizes */
  &--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.84rem;
    min-height: 32px;
  }

  &--md {
    padding: 0.5rem 1.125rem;
    font-size: 0.95rem;
    min-height: 42px;
  }

  &--lg {
    padding: 0.75rem 1.6rem;
    font-size: 1.05rem;
    min-height: 50px;
  }

  &--icon-only {
    padding: 0;
    aspect-ratio: 1 / 1;
    border-radius: var(--radius-md);

    &.ui-button--sm {
      width: 32px;
      height: 32px;
    }
    &.ui-button--md {
      width: 42px;
      height: 42px;
    }
    &.ui-button--lg {
      width: 50px;
      height: 50px;
    }
  }

  /* Variants */
  &--primary {
    background: var(--btn-primary-bg, var(--primary-gradient));
    color: var(--btn-primary-text, var(--text-inverse));
    border: 1px solid var(--btn-primary-border, transparent);
    backdrop-filter: var(--card-blur);
    box-shadow: var(--btn-primary-shadow, var(--shadow-glow));

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.08);
      box-shadow: var(--btn-primary-shadow, var(--shadow-glow));
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
      filter: brightness(0.95);
    }
  }

  &--secondary {
    background: var(--secondary);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    backdrop-filter: var(--card-blur);

    &:hover:not(:disabled) {
      background: var(--bg-card-hover);
      border-color: var(--border-color-glow);
      color: var(--text-main);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-main);

    &:hover:not(:disabled) {
      background: var(--secondary);
    }
  }

  &--success {
    background: var(--btn-success-bg, var(--success));
    color: var(--btn-success-text, #ffffff);
    border: 1px solid var(--btn-success-border, transparent);
    backdrop-filter: var(--card-blur);
    box-shadow: var(--btn-success-shadow, inset 0 0 10px rgba(255, 255, 255, 0.3));

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &--warning {
    background: var(--btn-warning-bg, rgba(245, 158, 11, 0.2));
    color: var(--btn-warning-text, #f59e0b);
    border: 1px solid var(--btn-warning-border, rgba(245, 158, 11, 0.4));
    backdrop-filter: var(--card-blur);
    box-shadow: var(--btn-warning-shadow, inset 0 0 10px rgba(255, 255, 255, 0.3));

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &--danger {
    background: var(--btn-danger-bg, var(--danger));
    color: var(--btn-danger-text, #ffffff);
    border: 1px solid var(--btn-danger-border, transparent);
    backdrop-filter: var(--card-blur);
    box-shadow: var(--btn-danger-shadow, inset 0 0 10px rgba(255, 255, 255, 0.3));

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  /* Disabled State */
  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Spinner */
  &__spinner-icon {
    width: 1.25rem;
    height: 1.25rem;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
