<script setup lang="ts">
import type { NavLink } from '../model/types'
import type { ThemeOption, AppTheme } from '@/shared/lib/theme'

// #region defineProps
interface Props {
  isOpen: boolean
  links: NavLink[]
  currentPath: string
  themes: ThemeOption[]
  activeTheme: ThemeOption
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', path: string): void
  (e: 'selectTheme', themeId: AppTheme): void
}>()
// #endregion defineEmits

// #region Функции
const isLinkActive = (linkPath: string): boolean => {
  if (linkPath === '/') {
    return props.currentPath === '/'
  }
  return props.currentPath.startsWith(linkPath)
}
// #endregion Функции
</script>

<template>
  <div v-if="props.isOpen" class="app-header-mobile">
    <div class="app-header-mobile__backdrop" @click="emit('close')"></div>

    <div class="app-header-mobile__drawer">
      <div class="app-header-mobile__header">
        <div class="app-header-mobile__brand" @click="emit('navigate', '/')">
          <span class="app-header-mobile__logo">🎓</span>
          <span class="app-header-mobile__title">LERN</span>
          <span class="app-header-mobile__badge">PRO</span>
        </div>
        <button type="button" class="app-header-mobile__close-btn" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="app-header-mobile__content">
        <!-- Навигационные ссылки -->
        <nav class="app-header-mobile__nav">
          <button
            v-for="link in props.links"
            :key="link.path"
            type="button"
            class="app-header-mobile__nav-btn"
            :class="{
              'app-header-mobile__nav-btn--active': isLinkActive(link.path),
              'app-header-mobile__nav-btn--highlight': link.isHighlight,
            }"
            @click="emit('navigate', link.path)"
          >
            <span v-if="link.icon">{{ link.icon }}</span>
            <span>{{ link.title }}</span>
          </button>
        </nav>

        <div class="app-header-mobile__divider"></div>

        <!-- Выбор темы -->
        <div class="app-header-mobile__themes-section">
          <span class="app-header-mobile__section-title">Тема оформления</span>
          <div class="app-header-mobile__themes-list">
            <button
              v-for="theme in props.themes"
              :key="theme.id"
              type="button"
              class="app-header-mobile__theme-btn"
              :class="{ 'app-header-mobile__theme-btn--active': props.activeTheme.id === theme.id }"
              @click="emit('selectTheme', theme.id)"
            >
              <span>{{ theme.icon }}</span>
              <span>{{ theme.name }}</span>
            </button>
          </div>
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
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
  }

  &__drawer {
    position: relative;
    width: 300px;
    height: 100%;
    background: var(--bg-card, #0f172a);
    border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
    z-index: 1001;
    overflow-y: auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  &__logo {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main, #ffffff);
  }

  &__badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0.12rem 0.4rem;
    border-radius: 6px;
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.35);
  }

  &__close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted, #94a3b8);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.4rem;
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
    gap: 0.5rem;
  }

  &__nav-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    color: var(--text-muted, #cbd5e1);
    font-size: 0.95rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-main, #ffffff);
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
    }

    &--active {
      background: var(--bg-card-hover, rgba(56, 189, 248, 0.15));
      border-color: var(--primary, #38bdf8);
      color: var(--text-main, #ffffff);
    }

    &--highlight {
      background: var(--primary-gradient, linear-gradient(135deg, #38bdf8 0%, #818cf8 100%));
      color: #ffffff !important;
      border-color: transparent;
      box-shadow: var(--shadow-glow, 0 4px 15px rgba(56, 189, 248, 0.3));
    }
  }

  &__divider {
    height: 1px;
    background: var(--border-color, rgba(255, 255, 255, 0.08));
  }

  &__themes-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__section-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #94a3b8);
  }

  &__themes-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__theme-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted, #cbd5e1);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
      color: var(--text-main, #ffffff);
    }

    &--active {
      background: var(--bg-card-hover, rgba(56, 189, 248, 0.15));
      border-color: var(--primary, #38bdf8);
      color: var(--text-main, #ffffff);
      font-weight: 600;
    }
  }
}
</style>
