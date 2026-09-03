<script setup lang="ts">
import { UserStatus } from '../../types'

// #region defineProps
interface Props {
  src: string
  name: string
  status?: UserStatus
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'online',
  size: 'md',
})
// #endregion defineProps
</script>

<template>
  <div :class="['user-avatar', `user-avatar--${props.size}`]">
    <img :src="props.src" :alt="props.name" class="user-avatar__img" />
    <span
      v-if="props.status"
      :class="['user-avatar__status', `user-avatar__status--${props.status}`]"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.user-avatar {
  position: relative;
  display: inline-flex;
  border-radius: 50%;

  &--sm {
    width: 32px;
    height: 32px;

    .user-avatar__status {
      width: 8px;
      height: 8px;
      border-width: 1.5px;
    }
  }

  &--md {
    width: 40px;
    height: 40px;

    .user-avatar__status {
      width: 10px;
      height: 10px;
      border-width: 2px;
    }
  }

  &--lg {
    width: 48px;
    height: 48px;

    .user-avatar__status {
      width: 12px;
      height: 12px;
      border-width: 2px;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(99, 102, 241, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

  &__status {
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    border-style: solid;
    border-color: #0f172a;

    &--online {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    &--busy {
      background: #f59e0b;
      box-shadow: 0 0 6px #f59e0b;
    }

    &--offline {
      background: #64748b;
    }
  }
}
</style>
