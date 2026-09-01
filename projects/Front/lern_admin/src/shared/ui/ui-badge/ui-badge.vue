<script setup lang="ts">
import { computed } from 'vue'
import type { BadgeVariant, BadgeSize } from './types'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}


const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  dot: false,
})

const badgeClasses = computed(() => [
  'ui-badge',
  `ui-badge--${props.variant}`,
  `ui-badge--${props.size}`,
])
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="dot" class="ui-badge__dot" />
    <slot />
  </span>
</template>

<style scoped lang="scss">
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  line-height: 1;
  white-space: nowrap;
  backdrop-filter: var(--card-blur);

  &--sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.72rem;
  }

  &--md {
    padding: 0.3rem 0.75rem;
    font-size: 0.82rem;
  }

  &--primary {
    background: var(--btn-primary-bg, rgba(0, 163, 255, 0.18));
    color: var(--btn-primary-text, var(--primary));
    border: 1px solid var(--border-color-glow);
  }

  &--secondary {
    background: var(--secondary);
    color: var(--text-main);
    border: 1px solid var(--border-color);
  }

  &--success {
    background: var(--btn-success-bg, rgba(16, 185, 129, 0.18));
    color: var(--btn-success-text, var(--success));
    border: 1px solid var(--btn-success-border, rgba(16, 185, 129, 0.35));
  }

  &--warning {
    background: rgba(245, 158, 11, 0.18);
    color: var(--warning);
    border: 1px solid rgba(245, 158, 11, 0.35);
  }

  &--danger {
    background: var(--btn-danger-bg, rgba(239, 68, 68, 0.18));
    color: var(--btn-danger-text, var(--danger));
    border: 1px solid var(--btn-danger-border, rgba(239, 68, 68, 0.35));
  }

  &--info {
    background: rgba(99, 102, 241, 0.18);
    color: #6366f1;
    border: 1px solid rgba(99, 102, 241, 0.35);
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
}
</style>
