<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { User, UserAvatar } from '@/entities/user'

// #region defineProps
interface Props {
  user: User
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
// #endregion defineEmits

// #region refs
const isOpen = ref<boolean>(false)
const menuRef = ref<HTMLElement | null>(null)
// #endregion refs

// #region Функции
const toggleMenu = (): void => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (e: MouseEvent): void => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

const onSelect = (path: string): void => {
  isOpen.value = false
  emit('navigate', path)
}

const onLogout = (): void => {
  isOpen.value = false
  emit('logout')
}
// #endregion Функции

// #region Хуки жизненного цикла
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
// #endregion Хуки жизненного цикла
</script>

<template>
  <div ref="menuRef" class="user-menu-dropdown">
    <button
      type="button"
      class="user-menu-dropdown__trigger"
      @click="toggleMenu"
    >
      <UserAvatar
        :src="props.user.avatar"
        :name="props.user.name"
        :status="props.user.status"
        size="md"
      />
      <span class="user-menu-dropdown__name">{{ props.user.name }}</span>
      <span class="user-menu-dropdown__arrow" :class="{ 'user-menu-dropdown__arrow--open': isOpen }">▾</span>
    </button>

    <transition name="dropdown-fade">
      <div v-if="isOpen" class="user-menu-dropdown__menu">
        <div class="user-menu-dropdown__header">
          <span class="user-menu-dropdown__email">{{ props.user.email }}</span>
          <span class="user-menu-dropdown__role">Роль: {{ props.user.role.toUpperCase() }}</span>
        </div>

        <div class="user-menu-dropdown__divider"></div>

        <ul class="user-menu-dropdown__list">
          <li>
            <button
              type="button"
              class="user-menu-dropdown__item"
              @click="onSelect('/cabinet')"
            >
              <span>👤 Личный кабинет</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              class="user-menu-dropdown__item"
              @click="onSelect('/docs')"
            >
              <span>📚 Документация</span>
            </button>
          </li>
          <li v-if="props.user.role === 'admin'">
            <button
              type="button"
              class="user-menu-dropdown__item user-menu-dropdown__item--admin"
              @click="onSelect('/admin')"
            >
              <span>⚙️ Панель администратора</span>
            </button>
          </li>
        </ul>

        <div class="user-menu-dropdown__divider"></div>

        <button
          type="button"
          class="user-menu-dropdown__item user-menu-dropdown__item--logout"
          @click="onLogout"
        >
          <span>🚪 Выйти из аккаунта</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.user-menu-dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: transparent;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  &__arrow {
    font-size: 0.8rem;
    color: #94a3b8;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 0.6rem);
    right: 0;
    width: 240px;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    padding: 0.75rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.35rem 0.5rem;
  }

  &__email {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  &__role {
    font-size: 0.7rem;
    font-weight: 700;
    color: #818cf8;
    letter-spacing: 0.05em;
  }

  &__divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.5rem 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__item {
    display: flex;
    align-items: center;
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(99, 102, 241, 0.12);
      color: #ffffff;
    }

    &--admin {
      color: #c084fc;

      &:hover {
        background: rgba(192, 132, 252, 0.15);
      }
    }

    &--logout {
      color: #fca5a5;

      &:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
