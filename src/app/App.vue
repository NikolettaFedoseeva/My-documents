<script setup lang="ts">
import { AppHeader } from '@/widgets/app-header'
</script>

<template>
  <div id="shell-layout">
    <!-- Сквозной FSD Хедер платформы LERN -->
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

.shell-content {
  flex: 1;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
}

.shell-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  gap: 1rem;
  color: var(--text-muted, #94a3b8);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color, rgba(255, 255, 255, 0.15));
  border-top-color: var(--primary, #38bdf8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>