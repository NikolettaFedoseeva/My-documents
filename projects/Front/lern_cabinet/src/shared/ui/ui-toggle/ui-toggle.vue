<script setup lang="ts">
// #region Props & Emits
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()
// #endregion Props & Emits

// #region Functions
const onToggle = () => {
  if (props.disabled) return
  const nextVal = !props.modelValue
  emit('update:modelValue', nextVal)
  emit('change', nextVal)
}
// #endregion Functions
</script>

<template>
  <label
    class="ui-toggle"
    :class="[
      `ui-toggle--${props.size}`,
      { 'ui-toggle--checked': props.modelValue, 'ui-toggle--disabled': props.disabled }
    ]"
    @click.prevent="onToggle"
  >
    <div class="ui-toggle__switch">
      <div class="ui-toggle__thumb"></div>
    </div>
    <span v-if="props.label" class="ui-toggle__label">{{ props.label }}</span>
  </label>
</template>

<style scoped lang="scss">
.ui-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__switch {
    position: relative;
    border-radius: 999px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease;
  }

  &--checked &__switch {
    background: var(--btn-primary-bg, var(--primary-gradient));
    border-color: transparent;
    box-shadow: var(--shadow-glow);
  }

  &--checked &__thumb {
    background: var(--text-inverse);
  }

  /* Sizes */
  &--sm &__switch { width: 34px; height: 20px; }
  &--sm &__thumb { width: 14px; height: 14px; }
  &--sm.ui-toggle--checked &__thumb { transform: translateX(14px); }

  &--md &__switch { width: 44px; height: 24px; }
  &--md &__thumb { width: 18px; height: 18px; }
  &--md.ui-toggle--checked &__thumb { transform: translateX(20px); }

  &--lg &__switch { width: 54px; height: 30px; }
  &--lg &__thumb { width: 24px; height: 24px; }
  &--lg.ui-toggle--checked &__thumb { transform: translateX(24px); }

  &__label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main);
  }
}
</style>
