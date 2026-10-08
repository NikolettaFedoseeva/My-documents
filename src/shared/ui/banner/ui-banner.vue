<script setup lang="ts">
interface Props {
  title: string
  description?: string
  variant?: 'info' | 'success' | 'warning' | 'gradient'
  icon?: string
  closable?: boolean
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  variant: 'gradient',
  icon: '💡',
  closable: true,
  actionText: '',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'action'): void
}>()
</script>

<template>
  <div class="ui-banner" :class="`ui-banner--${props.variant}`">
    <div class="ui-banner__content">
      <span class="ui-banner__icon">{{ props.icon }}</span>
      <div class="ui-banner__text">
        <h4 class="ui-banner__title">{{ props.title }}</h4>
        <p v-if="props.description" class="ui-banner__desc">{{ props.description }}</p>
        <slot />
      </div>
    </div>

    <div class="ui-banner__actions">
      <button
        v-if="props.actionText"
        type="button"
        class="ui-banner__action-btn"
        @click="emit('action')"
      >
        {{ props.actionText }}
      </button>

      <button
        v-if="props.closable"
        type="button"
        class="ui-banner__close-btn"
        title="Закрыть"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-radius: 14px;
  gap: 1.25rem;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &--gradient {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
    border: 1px solid rgba(168, 85, 247, 0.35);
    color: #ffffff;
  }

  &--info {
    background: rgba(14, 165, 233, 0.15);
    border: 1px solid rgba(14, 165, 233, 0.35);
    color: #f0f9ff;
  }

  &--success {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #ecfdf5;
  }

  &--warning {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.35);
    color: #fffbeb;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
  }

  &__icon {
    font-size: 1.6rem;
    flex-shrink: 0;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }

  &__desc {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.85;
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  &__action-btn {
    background: #ffffff;
    color: #0f172a;
    border: none;
    padding: 0.45rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;

    &:hover {
      transform: translateY(-1px);
      opacity: 0.95;
    }
  }

  &__close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: inherit;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
