<script setup lang="ts">
import { DocsViewer } from '@/widgets/docs-viewer'
</script>

<template>
  <div class="docs-page">
    <header class="docs-page__topbar">
      <div class="docs-page__brand">
        <span class="docs-page__logo">📚</span>
        <span class="docs-page__title">LERN Documentation</span>
      </div>
      <div class="docs-page__badges">
        <span class="docs-page__version">v2.4.0</span>
      </div>
    </header>

    <main class="docs-page__main">
      <DocsViewer />
    </main>
  </div>
</template>

<style scoped lang="scss">
.docs-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #090d16;
  color: #f8fafc;
  padding: 1.5rem 2rem;
  box-sizing: border-box;

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__logo {
    font-size: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__version {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  &__main {
    flex: 1;
    display: flex;
  }
}
</style>
