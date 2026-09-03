<script setup lang="ts">
import { User } from '@/entities/user'
import { NavLink } from '../model/use-app-header'

// #region defineProps
interface Props {
  isOpen: boolean
  links: NavLink[]
  currentPath: string
  user: User | null
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
// #endregion defineEmits
</script>

<template>
  <div v-if="props.isOpen" class="app-header-mobile">
    <div class="app-header-mobile__backdrop" @click="emit('close')"></div>

    <div class="app-header-mobile__drawer">
      <div class="app-header-mobile__header">
        <div class="app-header-mobile__brand">
          <span class="app-header-mobile__logo">🎓</span>
          <span class="app-header-mobile__title">LERN</span>
        </div>
        <button type="button" class="app-header-mobile__close-btn" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="app-header-mobile__content">
        <nav class="app-header-mobile__nav">
          <button
            v-for="link in props.links"
            :key="link.path"
            type="button"
            class="app-header-mobile__nav-btn"
            :class="{ 'app-header-mobile__nav-btn--active': props.currentPath === link.path }"
            @click="emit('navigate', link.path)"
          >
            <span v-if="link.icon">{{ link.icon }}</span>
            <span>{{ link.title }}</span>
          </button>
        </nav>

        <div class="app-header-mobile__divider"></div>

        <div v-if="props.user" class="app-header-mobile__user-info">
          <div class="app-header-mobile__profile">
            <img :src="props.user.avatar" :alt="props.user.name" class="app-header-mobile__avatar" />
            <div class="app-header-mobile__meta">
              <span class="app-header-mobile__name">{{ props.user.name }}</span>
              <span class="app-header-mobile__email">{{ props.user.email }}</span>
            </div>
          </div>
          <button
            type="button"
            class="app-header-mobile__logout-btn"
            @click="emit('logout')"
          >
            🚪 Выйти из аккаунта
          </button>
        </div>

        <div v-else class="app-header-mobile__guest-actions">
          <button
            type="button"
            class="app-header-mobile__action-btn app-header-mobile__action-btn--login"
            @click="emit('navigate', '/auth')"
          >
            Войти
          </button>
          <button
            type="button"
            class="app-header-mobile__action-btn app-header-mobile__action-btn--register"
            @click="emit('navigate', '/auth')"
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-header-mobile {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }

  &__drawer {
    position: relative;
    width: 280px;
    height: 100%;
    background: #0f172a;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
    z-index: 1001;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__logo {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #ffffff;
  }

  &__close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.2rem;
    cursor: pointer;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1.25rem;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__nav-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    color: #cbd5e1;
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;

    &--active {
      background: rgba(99, 102, 241, 0.18);
      color: #818cf8;
      font-weight: 600;
    }
  }

  &__divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  &__user-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__meta {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
  }

  &__email {
    font-size: 0.75rem;
    color: #64748b;
  }

  &__logout-btn {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.25);
    padding: 0.55rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  &__guest-actions {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  &__action-btn {
    width: 100%;
    padding: 0.65rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;

    &--login {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    &--register {
      background: #6366f1;
      border: none;
      color: #ffffff;
    }
  }
}
</style>
