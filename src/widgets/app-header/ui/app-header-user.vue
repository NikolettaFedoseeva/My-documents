<script setup lang="ts">
import { User } from '@/entities/user'
import { UserMenuDropdown } from '@/features/user-menu'
import { NotificationsTrigger } from '@/features/notifications'

// #region defineProps
interface Props {
  user: User | null
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="app-header-user">
    <template v-if="props.user">
      <NotificationsTrigger
        :count="props.user.unreadNotificationsCount"
        @click="emit('navigate', '/cabinet')"
      />

      <UserMenuDropdown
        :user="props.user"
        @navigate="emit('navigate', $event)"
        @logout="emit('logout')"
      />
    </template>

    <template v-else>
      <button
        type="button"
        class="app-header-user__btn app-header-user__btn--login"
        @click="emit('navigate', '/auth')"
      >
        Войти
      </button>

      <button
        type="button"
        class="app-header-user__btn app-header-user__btn--register"
        @click="emit('navigate', '/auth')"
      >
        Регистрация
      </button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.app-header-user {
  display: flex;
  align-items: center;
  gap: 0.85rem;

  &__btn {
    padding: 0.45rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &--login {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }
    }

    &--register {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: none;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
      }
    }
  }
}
</style>
