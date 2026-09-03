<script setup lang="ts">
import { AppHeader } from '@/widgets/app-header'
</script>

<template>
  <div id="shell-layout">
    <!-- Сквозной премиальный FSD Хедер -->
    <AppHeader />

    <!-- Main Viewport -->
    <main class="shell-content">
      <router-view v-slot="{ Component }">
        <suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <div class="shell-loader">
              <div class="spinner"></div>
              <span>Загрузка страницы...</span>
            </div>
          </template>
        </suspense>
      </router-view>
    </main>
  </div>
</template>

<style lang="scss">
@use './styles/index.scss';
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body, button, input, select, textarea {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

#shell-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #0f172a);
  color: var(--text-main, #ffffff);
}

.shell-header {
  height: 64px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    user-select: none;

    &:hover .shell-header__title {
      color: #38bdf8;
    }
  }

  &__logo {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #ffffff;
    transition: color 0.2s ease;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.nav-item {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm, 8px);
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  &--active {
    color: #38bdf8;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &--highlight {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff !important;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);

    &:hover {
      opacity: 0.92;
    }
  }
}

/* Circle Theme Switcher Styles */
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

  &__icon {
    font-size: 1.25rem;
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
  width: 240px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 0.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
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
    color: #94a3b8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 0.25rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.15s ease;

    .theme-icon {
      font-size: 1.1rem;
    }

    .theme-name {
      flex: 1;
    }

    .theme-check {
      color: #38bdf8;
      font-weight: 800;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    &--active {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #ffffff;
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

.shell-content {
  flex: 1;
}

.shell-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  gap: 1rem;
  color: #94a3b8;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>