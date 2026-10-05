<script setup lang="ts">
import { useDocsViewer } from '../model/use-docs-viewer'
import DocsSidebar from './docs-sidebar.vue'
import DocsContentViewer from './docs-content-viewer.vue'
import DocsStudyDeck from './docs-study-deck.vue'
import DocsSkeleton from './docs-skeleton.vue'

// #region composable
const {
  courses,
  activeCourseId,
  activeCourse,
  isCourseDropdownOpen,
  selectCourse,
  toggleCourseDropdown,
  closeCourseDropdown,
  filteredCategories,
  activeDocId,
  activeDoc,
  prevDoc,
  nextDoc,
  searchQuery,
  isLoading,
  isError,
  isTreeDrawerOpen,
  loadDocs,
  selectDoc,
  toggleCategory,
  isCategoryExpanded,
  toggleTreeDrawer,
  closeTreeDrawer,
} = useDocsViewer()
// #endregion composable
</script>

<template>
  <div class="docs-workspace">
    <!-- Мобильная плашка с кнопкой вызова Дерева Знаний -->
    <div class="docs-mobile-bar">
      <button
        type="button"
        class="docs-mobile-bar__btn"
        @click="toggleTreeDrawer"
      >
        <span>🌳</span>
        <span>Дерево Знаний ({{ activeCourse?.title || 'Оглавление' }})</span>
        <span class="badge">Каскад</span>
      </button>

      <span v-if="activeDoc?.code" class="docs-mobile-bar__current">
        Глава {{ activeDoc.code }}
      </span>
    </div>

    <!-- Мобильная выездная шторка с Деревом Знаний -->
    <div v-if="isTreeDrawerOpen" class="docs-tree-drawer">
      <div class="docs-tree-drawer__backdrop" @click="closeTreeDrawer"></div>
      <div class="docs-tree-drawer__body">
        <div class="docs-tree-drawer__header">
          <span>🌳 {{ activeCourse?.icon || '📚' }} {{ activeCourse?.title || 'Карта Знаний' }}</span>
          <button type="button" class="docs-tree-drawer__close" @click="closeTreeDrawer">✕</button>
        </div>
        <DocsSidebar
          :categories="filteredCategories"
          :active-doc-id="activeDocId"
          :search-query="searchQuery"
          :is-expanded="isCategoryExpanded"
          :courses="courses"
          :active-course="activeCourse"
          :is-course-dropdown-open="isCourseDropdownOpen"
          @select-doc="selectDoc"
          @toggle-category="toggleCategory"
          @update:search-query="searchQuery = $event"
          @select-course="selectCourse"
          @toggle-course-dropdown="toggleCourseDropdown"
        />
      </div>
    </div>

    <!-- Состояние загрузки -->
    <DocsSkeleton v-if="isLoading" />

    <!-- Состояние ошибки -->
    <div v-else-if="isError" class="docs-workspace__error">
      <span class="docs-workspace__error-icon">⚠️</span>
      <h3 class="docs-workspace__error-title">Не удалось загрузить книгу знаний</h3>
      <p class="docs-workspace__error-text">Проверьте соединение или повторите попытку.</p>
      <button type="button" class="docs-workspace__error-btn" @click="loadDocs">
        🔄 Повторить попытку
      </button>
    </div>

    <!-- 3-колоночный рабочий стол Bookish Codex -->
    <div v-else class="docs-workspace__grid">
      <!-- 1. Левая колонка: Каскадное Дерево Знаний (Десктоп & Планшет) -->
      <aside class="docs-workspace__sidebar-col">
        <DocsSidebar
          :categories="filteredCategories"
          :active-doc-id="activeDocId"
          :search-query="searchQuery"
          :is-expanded="isCategoryExpanded"
          :courses="courses"
          :active-course="activeCourse"
          :is-course-dropdown-open="isCourseDropdownOpen"
          @select-doc="selectDoc"
          @toggle-category="toggleCategory"
          @update:search-query="searchQuery = $event"
          @select-course="selectCourse"
          @toggle-course-dropdown="toggleCourseDropdown"
        />
      </aside>


      <!-- 2. Центральная колонка: Пергаментный Лист Статьи (Codex Sheet) -->
      <div class="docs-workspace__content-col">
        <DocsContentViewer
          :doc="activeDoc"
          :prev-doc="prevDoc"
          :next-doc="nextDoc"
          :show-inline-study-deck="true"
          class="docs-workspace__content-viewer"
          @select-doc="selectDoc"
        />
      </div>

      <!-- 3. Правая колонка: Study Deck (Тренажёр Active Recall на Десктопе) -->
      <aside class="docs-workspace__deck-col">
        <div class="docs-workspace__deck-sticky">
          <DocsStudyDeck :doc="activeDoc" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.docs-workspace {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* Мобильная полоса */
  .docs-mobile-bar {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background: var(--bg-container, #1c2d47);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: var(--radius-sm, 10px);

    @media (max-width: 900px) {
      display: flex;
    }

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card, rgba(255, 255, 255, 0.08));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      color: var(--text-main, #ffffff);
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;

      .badge {
        font-size: 0.65rem;
        background: rgba(99, 102, 241, 0.2);
        color: var(--primary, #818cf8);
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
      }
    }

    &__current {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
    }
  }

  /* 3-колоночная сетка */
  &__grid {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    width: 100%;
    min-height: calc(100vh - 120px);
  }

  /* 1. Левая колонка (Дерево знаний) */
  &__sidebar-col {
    width: 290px;
    flex-shrink: 0;
    position: sticky;
    top: 80px;
    max-height: calc(100vh - 100px);
    overflow: hidden;
    border-radius: var(--radius-md, 14px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    box-shadow: var(--shadow-main, 0 10px 25px rgba(0, 0, 0, 0.15));

    @media (max-width: 900px) {
      display: none;
    }
  }

  /* 2. Центральная колонка (Статья) */
  &__content-col {
    flex: 1;
    min-width: 0;
  }

  /* 3. Правая колонка (Study Deck на широком десктопе) */
  &__deck-col {
    width: 330px;
    flex-shrink: 0;

    @media (max-width: 1200px) {
      display: none; /* На планшетах и мобилках переносится вниз статьи */
    }
  }

  &__deck-sticky {
    position: sticky;
    top: 80px;
  }

  /* Ошибка */
  &__error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    text-align: center;
  }

  &__error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &__error-title {
    font-size: 1.3rem;
    color: var(--text-main, #ffffff);
    margin: 0 0 0.5rem;
  }

  &__error-text {
    font-size: 0.9rem;
    color: var(--text-muted, #94a3b8);
    margin: 0 0 1.5rem;
  }

  &__error-btn {
    background: var(--primary, #6366f1);
    color: #ffffff;
    border: none;
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
  }
}

/* Мобильная шторка Дерева Знаний */
.docs-tree-drawer {
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

  &__body {
    position: relative;
    width: 320px;
    max-width: 85vw;
    height: 100%;
    background: var(--bg-container, #1c2d47);
    border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    display: flex;
    flex-direction: column;
    z-index: 1001;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
  }

  &__close {
    background: transparent;
    border: none;
    color: var(--text-muted, #94a3b8);
    font-size: 1.2rem;
    cursor: pointer;
  }
}

/* На экранах > 1200px скрываем встроенный в статью StudyDeck, так как он виден в правой колонке */
@media (min-width: 1201px) {
  :deep(.codex-sheet__inline-deck) {
    display: none !important;
  }
}
</style>
