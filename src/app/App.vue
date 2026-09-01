<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme, type AppTheme, UiDropdown, type DropdownOption } from 'lern-ui-kit'

const router = useRouter()
const route = useRoute()
const { currentTheme, themes, setTheme } = useTheme()

const themeOptions: DropdownOption[] = themes.map((t) => ({
  id: t.id,
  label: t.icon + ' ' + t.name,
}))

const selectedTheme = computed({
  get: () => currentTheme.value,
  set: (val: string) => setTheme(val as AppTheme),
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div id="shell-layout">
    <!-- Clean Top Header Nav -->
    <header class="shell-header">
      <div class="shell-header__brand" @click="navigateTo('/')">
        <span class="shell-header__logo">📖</span>
        <span class="shell-header__title">Lern Codex</span>
      </div>

      <nav class="shell-header__nav">
        <button
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/' }"
          @click="navigateTo('/')"
        >
          Главная
        </button>

        <button
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/docs' }"
          @click="navigateTo('/docs')"
        >
          📖 Документация
        </button>

        <button
          class="nav-item nav-item--highlight"
          :class="{ 'nav-item--active': route.path === '/auth' || route.path === '/cabinet' }"
          @click="navigateTo('/auth')"
        >
          🔑 Войти в Кабинет
        </button>
      </nav>

      <!-- Theme Switcher via Dropdown -->
      <div class="shell-header__theme-switcher">
        <UiDropdown
          v-model="selectedTheme"
          :options="themeOptions"
          placeholder="Выбор темы"
        />
      </div>
    </header>

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

#shell-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  color: var(--text-main);
}

.shell-header {
  height: 64px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
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
      color: var(--primary);
    }
  }

  &__logo {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__theme-switcher {
    width: 200px;
  }
}

.nav-item {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-main);
    background: var(--bg-card-hover);
  }

  &--active {
    color: var(--primary);
    background: var(--bg-card-hover);
    border-color: var(--border-color);
  }

  &--highlight {
    background: var(--primary-gradient);
    color: #fff !important;
    border-color: transparent;
    box-shadow: var(--shadow-glow);

    &:hover {
      opacity: 0.95;
    }
  }
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
  color: var(--text-muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>