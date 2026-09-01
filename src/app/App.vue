<script lang="ts" setup>
import { onMounted } from 'vue'
import { useTheme, type AppTheme } from 'lern-ui-kit'

const { currentTheme, themes, setTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div id="shell-layout">
    <!-- Global Shell Navigation Header -->
    <header class="shell-header">
      <div class="shell-header__container">
        <!-- Logo -->
        <router-link to="/workspace" class="shell-logo">
          <span class="shell-logo__icon">📖</span>
          <span class="shell-logo__text">Lern Codex Shell</span>
        </router-link>

        <!-- Microfrontend Micro-Navigation Links -->
        <nav class="shell-nav">
          <router-link to="/landing" class="shell-nav__link" active-class="shell-nav__link--active">
            <span>🌐 Промо</span>
          </router-link>
          <router-link to="/workspace" class="shell-nav__link" active-class="shell-nav__link--active">
            <span>📚 Кабинет</span>
          </router-link>
          <router-link to="/admin" class="shell-nav__link" active-class="shell-nav__link--active">
            <span>🛠 Админка</span>
          </router-link>
          <router-link to="/auth" class="shell-nav__link" active-class="shell-nav__link--active">
            <span>🔐 Вход</span>
          </router-link>
          <router-link to="/ui-kit" class="shell-nav__link" active-class="shell-nav__link--active">
            <span>🎨 UI Kit</span>
          </router-link>
        </nav>

        <!-- Dynamic Theme Selector -->
        <div class="shell-theme-selector">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="shell-theme-btn"
            :class="{ 'shell-theme-btn--active': currentTheme === theme.id }"
            :title="theme.name"
            @click="setTheme(theme.id as AppTheme)"
          >
            {{ theme.icon }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Viewport for Microfrontends -->
    <main class="shell-content">
      <RouterView #default="{ Component }">
        <Suspense :timeout="0">
          <template v-if="Component">
            <component :is="Component" />
          </template>
          <template #fallback>
            <div class="shell-loading">
              <div class="shell-loading__spinner"></div>
              <span>Загрузка микрофронтенда...</span>
            </div>
          </template>
        </Suspense>
      </RouterView>
    </main>
  </div>
</template>

<style lang="scss">
@use './styles/index.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#shell-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  color: var(--text-main);
}

.shell-header {
  position: sticky;
  top: 0;
  z-index: 500;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: var(--card-blur);
  padding: 0.75rem 1.5rem;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
}

.shell-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;

  &__icon {
    font-size: 1.5rem;
  }

  &__text {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.01em;
  }
}

.shell-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__link {
    display: inline-flex;
    align-items: center;
    padding: 0.55rem 0.95rem;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-weight: 700;
    font-size: 0.88rem;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-main);
      background: var(--bg-card-hover);
    }

    &--active {
      background: var(--primary-gradient);
      color: var(--text-inverse);
      box-shadow: var(--shadow-glow);
    }
  }
}

.shell-theme-selector {
  display: flex;
  gap: 0.35rem;
}

.shell-theme-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-card-hover);
  }

  &--active {
    background: var(--primary-gradient);
    border-color: transparent;
  }
}

.shell-content {
  flex: 1;
}

.shell-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 50vh;
  color: var(--text-muted);
  font-weight: 600;

  &__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>