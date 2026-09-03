<script setup lang="ts">
// #region defineProps
interface Props {
  text: string
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
})
// #endregion defineProps
</script>

<template>
  <span :class="['doc-badge', `doc-badge--${props.variant}`]">
    {{ props.text }}
  </span>
</template>

<style scoped lang="scss">
.doc-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  white-space: nowrap;

  &--primary {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  &--secondary {
    background: rgba(255, 255, 255, 0.06);
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  &--accent {
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  &--outline {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }
}
</style>
