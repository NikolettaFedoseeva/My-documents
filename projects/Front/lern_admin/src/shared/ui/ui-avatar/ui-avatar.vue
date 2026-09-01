<script setup lang="ts">
import { computed } from 'vue'
import type { AvatarSize, AvatarStatus } from './types'

// #region Props
interface Props {
  src?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  square?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  name: '',
  size: 'md',
  square: false,
})

// #region Computed
const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.substring(0, 2).toUpperCase()
})
// #endregion Computed
</script>

<template>
  <div
    class="ui-avatar"
    :class="[
      `ui-avatar--${props.size}`,
      { 'ui-avatar--square': props.square }
    ]"
  >
    <img v-if="props.src" :src="props.src" :alt="props.name" class="ui-avatar__img" />
    <span v-else class="ui-avatar__initials">{{ initials }}</span>

    <span
      v-if="props.status"
      class="ui-avatar__status"
      :class="[`ui-avatar__status--${props.status}`]"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.ui-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: var(--text-inverse);
  font-weight: 700;
  border: 2px solid var(--border-color);
  user-select: none;
  flex-shrink: 0;

  &--square {
    border-radius: var(--radius-md);
  }

  /* Sizes */
  &--sm { width: 32px; height: 32px; font-size: 0.8rem; }
  &--md { width: 44px; height: 44px; font-size: 0.95rem; }
  &--lg { width: 60px; height: 60px; font-size: 1.2rem; }
  &--xl { width: 80px; height: 80px; font-size: 1.6rem; }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  &__initials {
    line-height: 1;
  }

  &__status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--bg-container);

    &--online { background: #10b981; }
    &--offline { background: #64748b; }
    &--busy { background: #ef4444; }
    &--away { background: #f59e0b; }
  }

  &--sm &__status { width: 8px; height: 8px; }
  &--lg &__status { width: 14px; height: 14px; }
  &--xl &__status { width: 18px; height: 18px; }
}
</style>
