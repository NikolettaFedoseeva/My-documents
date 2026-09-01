<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressBarVariant, ProgressBarSize } from './types'

// #region Props & Emits
interface Props {
  value: number
  max?: number
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  variant: 'primary',
  size: 'md',
  showLabel: false,
  label: '',
  animated: true,
})

// #region Computed
const percentage = computed(() => {
  if (props.max <= 0) return 0
  const pct = Math.round((props.value / props.max) * 100)
  return Math.min(100, Math.max(0, pct))
})
// #endregion Computed
</script>

<template>
  <div class="ui-progress-bar" :class="[`ui-progress-bar--${props.size}`]">
    <div v-if="props.showLabel || props.label" class="ui-progress-bar__header">
      <span class="ui-progress-bar__title">{{ props.label }}</span>
      <span class="ui-progress-bar__percentage">{{ percentage }}%</span>
    </div>

    <div class="ui-progress-bar__track">
      <div
        class="ui-progress-bar__fill"
        :class="[
          `ui-progress-bar__fill--${props.variant}`,
          { 'ui-progress-bar__fill--animated': props.animated }
        ]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-progress-bar {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  &__percentage {
    color: var(--primary);
    font-weight: 700;
  }

  &__track {
    width: 100%;
    border-radius: 999px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    overflow: hidden;
    position: relative;
  }

  &--sm &__track { height: 6px; }
  &--md &__track { height: 10px; }
  &--lg &__track { height: 16px; }

  &__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &--primary { background: var(--btn-primary-bg, var(--primary-gradient)); }
    &--success { background: var(--btn-success-bg, var(--success)); }
    &--warning { background: var(--warning); }
    &--danger { background: var(--btn-danger-bg, var(--danger)); }

    &--animated {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
        animation: progress-shimmer 2s infinite;
      }
    }
  }
}

@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
