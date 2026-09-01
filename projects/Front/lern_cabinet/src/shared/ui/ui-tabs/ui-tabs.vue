<script setup lang="ts">
import type { TabItem } from './types'

// #region Props & Emits
interface Props {
  modelValue: string
  items: TabItem[]
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullWidth: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()
// #endregion Props & Emits

// #region Functions
const onSelect = (tab: TabItem) => {
  if (tab.disabled || tab.id === props.modelValue) return
  emit('update:modelValue', tab.id)
  emit('change', tab.id)
}
// #endregion Functions
</script>

<template>
  <div
    class="ui-tabs"
    :class="[
      `ui-tabs--${props.size}`,
      { 'ui-tabs--full-width': props.fullWidth }
    ]"
  >
    <button
      v-for="tab in props.items"
      :key="tab.id"
      class="ui-tabs__item"
      :class="{
        'ui-tabs__item--active': props.modelValue === tab.id,
        'ui-tabs__item--disabled': tab.disabled
      }"
      :disabled="tab.disabled"
      @click="onSelect(tab)"
    >
      <span v-if="tab.icon" class="ui-tabs__icon">{{ tab.icon }}</span>
      <span class="ui-tabs__label">{{ tab.label }}</span>
      <span v-if="tab.badge !== undefined" class="ui-tabs__badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.ui-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  backdrop-filter: var(--card-blur);

  &--full-width {
    display: flex;
    width: 100%;

    .ui-tabs__item {
      flex: 1;
      justify-content: center;
    }
  }

  &--sm {
    padding: 0.25rem;
    .ui-tabs__item {
      padding: 0.4rem 0.85rem;
      font-size: 0.85rem;
    }
  }

  &--md {
    .ui-tabs__item {
      padding: 0.6rem 1.15rem;
      font-size: 0.9rem;
    }
  }

  &--lg {
    padding: 0.5rem;
    .ui-tabs__item {
      padding: 0.85rem 1.5rem;
      font-size: 1rem;
    }
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: var(--radius-sm);
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover:not(&--disabled) {
      color: var(--text-main);
      background: var(--bg-card-hover);
    }

    &--active {
      background: var(--primary-gradient);
      color: var(--text-inverse);
      box-shadow: var(--shadow-glow);

      .ui-tabs__badge {
        background: rgba(255, 255, 255, 0.25);
        color: var(--text-inverse);
      }
    }

    &--disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--secondary);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-main);
  }
}
</style>
