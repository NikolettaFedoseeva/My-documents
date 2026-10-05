<script setup lang="ts">
import { DocsViewer } from '@/widgets/docs-viewer'
</script>

<template>
  <div class="docs-page">
    <main class="docs-page__main">
      <DocsViewer />
    </main>
  </div>
</template>

<style scoped lang="scss">
.docs-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  background: var(--bg-app, #090d16);
  color: var(--text-main, #f8fafc);
  padding: 1.25rem 2rem 2.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0.75rem 0.75rem 2rem;
  }

  &__main {
    flex: 1;
    display: flex;
    width: 100%;
  }
}
</style>
