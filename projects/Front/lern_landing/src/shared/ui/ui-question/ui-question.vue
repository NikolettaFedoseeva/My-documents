<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionOption } from './types'

// #region Props & Emits
interface Props {
  modelValue?: string | null
  question?: string
  options: QuestionOption[]
  correctId?: string
  isSubmitted?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  question: '',
  correctId: '',
  isSubmitted: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', optionId: string): void
}>()
// #endregion Props & Emits

// #region Functions
const onSelect = (optionId: string) => {
  if (props.disabled || props.isSubmitted) return
  emit('update:modelValue', optionId)
  emit('select', optionId)
}

const getOptionStateClass = (optionId: string) => {
  const isSelected = props.modelValue === optionId
  if (!props.isSubmitted) {
    return isSelected ? 'ui-question__option--selected' : ''
  }
  if (props.correctId && optionId === props.correctId) {
    return 'ui-question__option--correct'
  }
  if (isSelected && props.correctId && optionId !== props.correctId) {
    return 'ui-question__option--wrong'
  }
  return ''
}
// #endregion Functions
</script>

<template>
  <div class="ui-question">
    <h3 v-if="props.question" class="ui-question__title">
      {{ props.question }}
    </h3>

    <div class="ui-question__options">
      <div
        v-for="opt in props.options"
        :key="opt.id"
        class="ui-question__option"
        :class="[getOptionStateClass(opt.id), { 'ui-question__option--disabled': props.disabled }]"
        @click="onSelect(opt.id)"
      >
        <div class="ui-question__badge">
          {{ opt.label }}
        </div>
        <div class="ui-question__text">
          {{ opt.text }}
        </div>
        <div class="ui-question__icon">
          <span v-if="props.isSubmitted && props.correctId === opt.id">✓</span>
          <span v-else-if="props.isSubmitted && props.modelValue === opt.id && props.correctId !== opt.id">✕</span>
          <span v-else-if="props.modelValue === opt.id" class="ui-question__radio-dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-question {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.4;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: var(--card-blur);

    &:hover:not(&--disabled) {
      background: var(--bg-card-hover);
      border-color: var(--border-color-glow);
      transform: translateY(-1px);
    }

    &--selected {
      background: rgba(99, 102, 241, 0.12);
      border-color: var(--primary);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
      
      .ui-question__badge {
        background: var(--primary);
        color: var(--text-inverse);
      }
    }

    &--correct {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--success);
      color: var(--text-main);

      .ui-question__badge {
        background: var(--success);
        color: #ffffff;
      }

      .ui-question__icon {
        color: var(--success);
        font-weight: bold;
      }
    }

    &--wrong {
      background: rgba(239, 68, 68, 0.15);
      border-color: var(--danger);

      .ui-question__badge {
        background: var(--danger);
        color: #ffffff;
      }

      .ui-question__icon {
        color: var(--danger);
        font-weight: bold;
      }
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  &__text {
    flex: 1;
    font-size: 0.95rem;
    color: var(--text-main);
    line-height: 1.45;
  }

  &__icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  &__radio-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
  }
}
</style>
