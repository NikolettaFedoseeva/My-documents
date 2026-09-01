<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  type: 'text',
  error: '',
  hint: '',
  disabled: false,
  readonly: false,
  clearable: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
}>()

const onInput = (event: Event) => {
  const val = (event.target as HTMLInputElement).value
  emit('update:modelValue', val)
}

const onClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const containerClasses = computed(() => [
  'ui-input-wrapper',
  {
    'ui-input-wrapper--error': Boolean(props.error),
    'ui-input-wrapper--disabled': props.disabled,
  },
])
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" class="ui-input__label">
      {{ label }}
    </label>

    <div class="ui-input__container">
      <span v-if="$slots['icon-left']" class="ui-input__icon-left">
        <slot name="icon-left" />
      </span>

      <input
        class="ui-input__control"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="onInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="ui-input__clear"
        @click="onClear"
      >
        ✕
      </button>

      <span v-if="$slots['icon-right']" class="ui-input__icon-right">
        <slot name="icon-right" />
      </span>
    </div>

    <span v-if="error" class="ui-input__error-text">{{ error }}</span>
    <span v-else-if="hint" class="ui-input__hint-text">{{ hint }}</span>
  </div>
</template>

<style scoped lang="scss">
.ui-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.ui-input {
  &__label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
  }

  &__container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    backdrop-filter: var(--card-blur);
    transition: all 0.2s ease;

    &:focus-within {
      border-color: var(--border-color-glow);
      box-shadow: var(--shadow-glow);
      background: var(--bg-card-hover);
    }
  }

  &__control {
    flex-grow: 1;
    color: var(--text-main);
    font-size: 0.95rem;

    &::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }
  }

  &__icon-left,
  &__icon-right {
    display: flex;
    align-items: center;
    color: var(--text-muted);
  }

  &__clear {
    font-size: 0.8rem;
    color: var(--text-muted);
    padding: 0.2rem;
    line-height: 1;

    &:hover {
      color: var(--text-main);
    }
  }

  &__error-text {
    font-size: 0.78rem;
    color: var(--danger);
    font-weight: 500;
  }

  &__hint-text {
    font-size: 0.78rem;
    color: var(--text-muted);
  }
}

.ui-input-wrapper--error .ui-input__container {
  border-color: var(--danger);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.25);
}
</style>
