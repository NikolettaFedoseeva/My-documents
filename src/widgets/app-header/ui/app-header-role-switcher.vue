<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserSessionStore, type UserRole, type RoleInfo } from '@/entities/user'

const router = useRouter()
const route = useRoute()
const sessionStore = useUserSessionStore()

// #region refs
const isOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)
// #endregion refs

// #region Функции
const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (): void => {
  isOpen.value = false
}

const onSelectRole = (role: UserRole): void => {
  sessionStore.switchRole(role)
  isOpen.value = false

  // Если текущий маршрут требует прав, проверяем его заново через роутер
  if (route.meta?.roles) {
    const allowed = route.meta.roles as string[]
    if (!sessionStore.hasRole(allowed)) {
      router.push({
        path: '/forbidden',
        query: { required: allowed.join(','), redirect: route.fullPath },
      })
    }
  }
}

const handleClickOutside = (e: MouseEvent): void => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}
// #endregion Функции

// #region Хуки жизненного цикла
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
// #endregion Хуки жизненного цикла
</script>

<template>
  <div ref="dropdownRef" class="role-switcher">
    <!-- Кнопка-триггер с текущей ролью -->
    <button
      type="button"
      class="role-switcher__btn"
      :class="`role-switcher__btn--${sessionStore.currentRole}`"
      :title="`Текущая роль: ${sessionStore.currentRoleInfo.name}`"
      @click="toggleDropdown"
    >
      <span class="role-icon">{{ sessionStore.currentRoleInfo.icon }}</span>
      <span class="role-name">{{ sessionStore.currentRoleInfo.name }}</span>
      <span class="role-chevron" :class="{ 'role-chevron--open': isOpen }">▾</span>
    </button>

    <!-- Выпадающее меню выбора роли -->
    <transition name="role-dropdown-fade">
      <div v-if="isOpen" class="role-switcher__menu">
        <div class="menu-header">
          <span class="menu-title">🛡️ Переключатель ролей (RBAC)</span>
          <span class="menu-hint">Кликните для быстрой проверки прав доступа</span>
        </div>

        <div class="menu-list">
          <div
            v-for="roleItem in sessionStore.rolesList"
            :key="roleItem.role"
            class="menu-item"
            :class="{ 'menu-item--active': sessionStore.currentRole === roleItem.role }"
            @click="onSelectRole(roleItem.role)"
          >
            <div class="item-icon-wrap">
              <span class="item-icon">{{ roleItem.icon }}</span>
            </div>

            <div class="item-body">
              <div class="item-top">
                <span class="item-title">{{ roleItem.name }}</span>
                <span v-if="sessionStore.currentRole === roleItem.role" class="item-badge">Активна</span>
              </div>
              <span class="item-desc">{{ roleItem.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.role-switcher {
  position: relative;
  display: inline-flex;

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.4rem 0.75rem;
    border-radius: 9999px;
    background: var(--bg-card, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    color: var(--text-main, #f8fafc);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.12));
      border-color: var(--border-color-glow, rgba(99, 102, 241, 0.4));
    }

    /* Цвета ролей */
    &--guest {
      border-color: rgba(148, 163, 184, 0.3);
      color: var(--text-muted, #94a3b8);
    }

    &--student {
      border-color: rgba(99, 102, 241, 0.4);
      color: #818cf8;
      background: rgba(99, 102, 241, 0.1);
    }

    &--author {
      border-color: rgba(168, 85, 247, 0.4);
      color: #c084fc;
      background: rgba(168, 85, 247, 0.1);
    }

    &--admin {
      border-color: rgba(239, 68, 68, 0.4);
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.role-icon {
  font-size: 1rem;
  line-height: 1;
}

.role-name {
  white-space: nowrap;
}

.role-chevron {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: var(--text-muted, #94a3b8);

  &--open {
    transform: rotate(180deg);
  }
}

.role-switcher__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: var(--bg-container, #111827);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  border-radius: var(--radius-md, 14px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: 2000;
  overflow: hidden;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 0.65rem 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  margin-bottom: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.menu-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main, #f8fafc);
}

.menu-hint {
  font-size: 0.68rem;
  color: var(--text-muted, #94a3b8);
  line-height: 1.35;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.6rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &--active {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);

    .item-title {
      color: #818cf8;
      font-weight: 700;
    }
  }
}

.item-icon-wrap {
  font-size: 1.25rem;
  padding: 0.1rem;
}

.item-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.15rem;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main, #f8fafc);
}

.item-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: var(--primary, #6366f1);
  color: #ffffff;
}

.item-desc {
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  line-height: 1.35;
}

/* Анимация дропдауна */
.role-dropdown-fade-enter-active,
.role-dropdown-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.role-dropdown-fade-enter-from,
.role-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
