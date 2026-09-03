<script setup lang="ts">
import { useDocsViewer } from '../model/use-docs-viewer'
import DocsSidebar from './docs-sidebar.vue'
import DocsContentViewer from './docs-content-viewer.vue'
import DocsToc from './docs-toc.vue'
import DocsSkeleton from './docs-skeleton.vue'

// #region composable
const {
  filteredCategories,
  activeDocId,
  activeDoc,
  searchQuery,
  isLoading,
  isError,
  tocItems,
  activeTocId,
  loadDocs,
  selectDoc,
  toggleCategory,
  isCategoryExpanded,
  setActiveToc,
} = useDocsViewer()
// #endregion composable
</script>

<template>
  <div class="docs-viewer">
    <!-- Состояние загрузки -->
    <DocsSkeleton v-if="isLoading" />

    <!-- Состояние ошибки -->
    <div v-else-if="isError" class="docs-viewer__error">
      <span class="docs-viewer__error-icon">⚠️</span>
      <h3 class="docs-viewer__error-title">Не удалось загрузить документацию</h3>
      <p class="docs-viewer__error-text">Проверьте соединение с сетью или повторите попытку позже.</p>
      <button type="button" class="docs-viewer__error-btn" @click="loadDocs">
        🔄 Повторить попытку
      </button>
    </div>

    <!-- Основной контент виджета -->
    <div v-else class="docs-viewer__container">
      <DocsSidebar
        :categories="filteredCategories"
        :active-doc-id="activeDocId"
        :search-query="searchQuery"
        :is-expanded="isCategoryExpanded"
        @select-doc="selectDoc"
        @toggle-category="toggleCategory"
        @update:search-query="searchQuery = $event"
      />

      <DocsContentViewer
        :doc="activeDoc"
      />

      <DocsToc
        :items="tocItems"
        :active-id="activeTocId"
        @select="setActiveToc"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.docs-viewer {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 80px);
  background: radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);

  &__container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  &__error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }

  &__error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &__error-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.5rem;
  }

  &__error-text {
    font-size: 0.95rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  &__error-btn {
    background: #6366f1;
    color: #ffffff;
    border: none;
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
  }
}
</style>
