<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { ThemeOption, AppTheme } from '@/shared/lib/theme'

// #region defineProps
interface Props {
  themes: ThemeOption[]
  activeTheme: ThemeOption
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'selectTheme', themeId: AppTheme): void
}>()
// #endregion defineEmits

// #region refs
const isOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)
// #endregion refs

// #region Функции
const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const onSelectTheme = (themeId: AppTheme): void => {
  emit('selectTheme', themeId)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent): void => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}
// #endregion Функции

// #region Хуки жизненного цикла
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
// #endregion Хуки жизненного цикла
</script>

<template>
  <div ref="dropdownRef" class="theme-circle-dropdown">
    <button
      type="button"
      class="theme-circle-btn"
      :title="'Тема: ' + props.activeTheme.name"
      @click="toggleDropdown"
    >
      <span class="theme-circle-btn__icon">{{ props.activeTheme.icon }}</span>
    </button>

    <transition name="dropdown-fade">
      <div v-if="isOpen" class="theme-circle-menu">
        <div class="theme-circle-menu__header">
          <span>Выбор визуала темы</span>
        </div>
        <div class="theme-circle-menu__list">
          <div
            v-for="theme in props.themes"
            :key="theme.id"
            class="theme-circle-menu__item"
            :class="{ 'theme-circle-menu__item--active': props.activeTheme.id === theme.id }"
            @click="onSelectTheme(theme.id)"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
            <span v-if="props.activeTheme.id === theme.id" class="theme-check">✓</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.theme-circle-dropdown {
  position: relative;
}

.theme-circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #ffffff;

  &__icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: #38bdf8;
    transform: scale(1.06);
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
  }
}

.theme-circle-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 260px;
  background: var(--bg-container, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  border-radius: 14px;
  padding: 0.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__header {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #94a3b8);
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    margin-bottom: 0.25rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-muted, #cbd5e1);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;

    .theme-icon {
      font-size: 1.15rem;
      line-height: 1;
    }

    .theme-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-main, #ffffff);
    }

    .theme-check {
      color: var(--primary, #38bdf8);
      font-weight: 800;
      font-size: 0.95rem;
    }

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
      color: var(--text-main, #ffffff);
    }

    &--active {
      background: var(--bg-card-hover, rgba(56, 189, 248, 0.2));
      border: 1px solid var(--primary, #38bdf8);
      color: var(--text-main, #ffffff);
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
