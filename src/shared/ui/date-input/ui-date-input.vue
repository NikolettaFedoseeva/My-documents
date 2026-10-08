<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  min?: string
  max?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Выберите дату',
  min: '',
  max: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="ui-date-input" :class="{ 'ui-date-input--disabled': props.disabled }">
    <label v-if="props.label" class="ui-date-input__label">{{ props.label }}</label>
    <div class="ui-date-input__wrapper">
      <span class="ui-date-input__calendar-icon">📅</span>
      <input
        type="date"
        class="ui-date-input__field"
        :value="props.modelValue"
        :min="props.min"
        :max="props.max"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        @input="onInput"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-date-input {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted, #94a3b8);
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0 0.75rem;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: #818cf8;
      box-shadow: 0 0 12px rgba(129, 140, 248, 0.25);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &__calendar-icon {
    font-size: 1rem;
    opacity: 0.75;
    margin-right: 0.5rem;
  }

  &__field {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.65rem 0;
    color: #ffffff;
    font-family: inherit;
    font-size: 0.9rem;
    color-scheme: dark;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      filter: invert(1);

      &:hover {
        opacity: 1;
      }
    }
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
