<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DocCategory } from '@/entities/doc'

// #region defineProps
interface Props {
  categories: DocCategory[]
  selectedDocId: string | null
  selectedCategoryId: string
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'selectDoc', docId: string): void
  (e: 'createDoc', categoryId: string): void
  (e: 'createCategory'): void
  (e: 'deleteCategory', categoryId: string): void
  (e: 'resetDefaults'): void
}>()
// #endregion defineEmits

// #region refs
const searchQuery = ref<string>('')
const expandedCategoryIds = ref<Set<string>>(new Set(props.categories.map((c) => c.id)))
// #endregion refs

// #region computed
const filteredCategories = computed<DocCategory[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.categories

  return props.categories
    .map((cat) => {
      const matchingItems = cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.code && item.code.toLowerCase().includes(q))
      )
      const isCatMatch = cat.title.toLowerCase().includes(q) || (cat.code && cat.code.toLowerCase().includes(q))

      if (isCatMatch || matchingItems.length > 0) {
        return {
          ...cat,
          items: isCatMatch ? cat.items : matchingItems,
        }
      }
      return null
    })
    .filter((cat): cat is DocCategory => cat !== null)
})
// #endregion computed

// #region Функции
const toggleCategory = (categoryId: string): void => {
  if (expandedCategoryIds.value.has(categoryId)) {
    expandedCategoryIds.value.delete(categoryId)
  } else {
    expandedCategoryIds.value.add(categoryId)
  }
}

const isExpanded = (categoryId: string): boolean => {
  return expandedCategoryIds.value.has(categoryId)
}

watch(
  () => props.categories,
  (cats) => {
    cats.forEach((c) => expandedCategoryIds.value.add(c.id))
  },
  { immediate: true, deep: true }
)
// #endregion Функции
</script>

<template>
  <aside class="author-sidebar">
    <div class="author-sidebar__header">
      <div class="author-sidebar__title-wrap">
        <span class="author-sidebar__icon">✍️</span>
        <div>
          <h3 class="author-sidebar__title">Дерево курса</h3>
          <p class="author-sidebar__subtitle">Управление модулями и главами</p>
        </div>
      </div>

      <button
        type="button"
        class="create-cat-btn"
        title="Создать новый модуль"
        @click="emit('createCategory')"
      >
        <span>+ Модуль</span>
      </button>
    </div>

    <!-- Поиск по структуре -->
    <div class="author-sidebar__search">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по главам..."
        class="search-input"
      />
    </div>

    <!-- Дерево модулей -->
    <nav class="author-sidebar__nav">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="cat-node"
      >
        <div class="cat-node__header">
          <button
            type="button"
            class="cat-node__toggle"
            @click="toggleCategory(cat.id)"
          >
            <span class="cat-code">{{ cat.code || '00' }}</span>
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-title">{{ cat.title }}</span>
            <span class="cat-arrow" :class="{ 'cat-arrow--open': isExpanded(cat.id) }">▾</span>
          </button>

          <div class="cat-node__actions">
            <button
              type="button"
              class="add-doc-btn"
              title="Добавить главу в этот модуль"
              @click.stop="emit('createDoc', cat.id)"
            >
              + Глава
            </button>
            <button
              type="button"
              class="del-cat-btn"
              title="Удалить модуль"
              @click.stop="emit('deleteCategory', cat.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <ul v-if="isExpanded(cat.id)" class="doc-list">
          <li
            v-for="doc in cat.items"
            :key="doc.id"
            class="doc-item"
          >
            <button
              type="button"
              class="doc-item__btn"
              :class="{ 'doc-item__btn--active': props.selectedDocId === doc.id }"
              @click="emit('selectDoc', doc.id)"
            >
              <span class="doc-code">{{ doc.code }}</span>
              <span class="doc-title">{{ doc.title }}</span>
              <span v-if="doc.flashcard" class="doc-tag-badge" title="Есть 3D-флешкарта">🃏</span>
              <span v-if="doc.quiz" class="doc-tag-badge" title="Есть тест">❓</span>
            </button>
          </li>

          <li v-if="cat.items.length === 0" class="doc-empty">
            <span>В этом модуле пока нет глав</span>
          </li>
        </ul>
      </div>

      <div v-if="filteredCategories.length === 0" class="sidebar-empty">
        <p>Ничего не найдено</p>
      </div>
    </nav>

    <!-- Нижняя панель действий -->
    <div class="author-sidebar__footer">
      <button
        type="button"
        class="reset-btn"
        @click="emit('resetDefaults')"
      >
        <span>🔄 Сбросить к демо-статьям</span>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.author-sidebar {
  width: 320px;
  min-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-container, #162032);
  border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  box-sizing: border-box;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.15rem 1rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    gap: 0.5rem;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__icon {
    font-size: 1.35rem;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
    margin: 0;
  }

  &__subtitle {
    font-size: 0.7rem;
    color: var(--text-muted, #94a3b8);
    margin: 0;
  }

  .create-cat-btn {
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    color: var(--primary, #818cf8);
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background: var(--primary, #6366f1);
      color: #ffffff;
    }
  }

  &__search {
    position: relative;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));

    .search-icon {
      position: absolute;
      left: 1.6rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      opacity: 0.6;
    }

    .search-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
      padding: 0.45rem 0.75rem 0.45rem 2rem;
      color: var(--text-main, #ffffff);
      font-size: 0.78rem;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: var(--primary, #6366f1);
      }
    }
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cat-node {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
    overflow: hidden;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.65rem;
      background: rgba(255, 255, 255, 0.03);
    }

    &__toggle {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: transparent;
      border: none;
      color: var(--text-main, #ffffff);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      flex: 1;
      text-align: left;
      padding: 0;
      min-width: 0;

      .cat-code {
        font-size: 0.68rem;
        background: rgba(255, 255, 255, 0.08);
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
        color: var(--text-muted, #94a3b8);
      }

      .cat-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cat-arrow {
        font-size: 0.7rem;
        color: var(--text-muted, #94a3b8);
        transition: transform 0.2s ease;

        &--open {
          transform: rotate(180deg);
        }
      }
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .add-doc-btn {
      padding: 0.2rem 0.45rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.65rem;
      font-weight: 700;
      cursor: pointer;

      &:hover {
        background: #10b981;
        color: #ffffff;
      }
    }

    .del-cat-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 0.68rem;
      cursor: pointer;
      padding: 0.2rem;
      opacity: 0.6;

      &:hover {
        opacity: 1;
        color: #ef4444;
      }
    }
  }

  .doc-list {
    list-style: none;
    padding: 0.35rem 0.5rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .doc-item {
    &__btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      width: 100%;
      padding: 0.45rem 0.65rem;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted, #94a3b8);
      font-size: 0.78rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main, #ffffff);
      }

      &--active {
        background: rgba(99, 102, 241, 0.2) !important;
        border-color: var(--primary, #6366f1) !important;
        color: var(--text-main, #ffffff) !important;
        font-weight: 700;
      }

      .doc-code {
        font-size: 0.68rem;
        opacity: 0.75;
      }

      .doc-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .doc-tag-badge {
        font-size: 0.68rem;
      }
    }
  }

  .doc-empty {
    padding: 0.6rem 0.5rem;
    font-size: 0.72rem;
    color: var(--text-muted, #64748b);
    text-align: center;
    font-style: italic;
  }

  .sidebar-empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--text-muted, #64748b);
    font-size: 0.8rem;
  }

  &__footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    display: flex;
    justify-content: center;

    .reset-btn {
      background: transparent;
      border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 6px;
      color: var(--text-muted, #94a3b8);
      font-size: 0.72rem;
      padding: 0.35rem 0.65rem;
      cursor: pointer;

      &:hover {
        color: var(--text-main, #ffffff);
        border-color: var(--text-muted, #94a3b8);
      }
    }
  }
}
</style>
