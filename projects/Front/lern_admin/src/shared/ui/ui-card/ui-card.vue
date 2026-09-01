<script setup lang="ts">
import { computed } from 'vue'
import type { CardVariant } from './types'

interface Props {
  variant?: CardVariant
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}


const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  hoverable: true,
  padding: 'md',
})

const cardClasses = computed(() => [
  'ui-card',
  `ui-card--${props.variant}`,
  `ui-card--padding-${props.padding}`,
  {
    'ui-card--hoverable': props.hoverable,
  },
])
</script>

<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="ui-card__header">
      <slot name="header" />
    </div>

    <div class="ui-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-main);
  backdrop-filter: var(--card-blur);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Paddings */
  &--padding-none {
    padding: 0;
  }
  &--padding-sm {
    padding: 0.875rem;
  }
  &--padding-md {
    padding: 1.5rem;
  }
  &--padding-lg {
    padding: 2.25rem;
  }

  /* Variants */
  &--glass {
    background: var(--bg-card);
    backdrop-filter: var(--card-blur);
  }

  &--solid {
    background: var(--bg-container);
    backdrop-filter: none;
  }

  &--glow {
    background: var(--bg-card);
    border-color: var(--border-color-glow);
    box-shadow: var(--shadow-glow);
  }

  &--clay {
    background: var(--bg-card);
    box-shadow: var(--shadow-main);
    border: none;
  }

  /* Hover state */
  &--hoverable:hover {
    transform: translateY(-3px);
    background: var(--bg-card-hover);
    border-color: var(--border-color-glow);
    box-shadow: var(--shadow-glow);
  }

  &__header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  &__footer {
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>
