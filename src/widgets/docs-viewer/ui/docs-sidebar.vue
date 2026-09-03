<script setup lang="ts">
import { DocCategory } from '@/entities/doc'
import { SearchDocsInput } from '@/features/search-docs'

// #region defineProps
interface Props {
  categories: DocCategory[]
  activeDocId: string
  searchQuery: string
  isExpanded: (categoryId: string) => boolean
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'select-doc', id: string): void
  (e: 'toggle-category', id: string): void
  (e: 'update:searchQuery', val: string): void
}>()
// #endregion defineEmits
</script>

<template>
  <aside class="docs-sidebar">
    <div class="docs-sidebar__search">
      <SearchDocsInput
        :model-value="props.searchQuery"
        placeholder="Поиск по документам..."
        @update:model-value="emit('update:searchQuery', $event)"
      />
    </div>

    <nav class="docs-sidebar__nav">
      <div
        v-for="category in props.categories"
        :key="category.id"
        class="docs-sidebar__category"
      >
        <button
          type="button"
          class="docs-sidebar__category-header"
          @click="emit('toggle-category', category.id)"
        >
          <div class="docs-sidebar__category-meta">
            <span class="docs-sidebar__category-icon">{{ category.icon }}</span>
            <span class="docs-sidebar__category-title">{{ category.title }}</span>
          </div>

          <div class="docs-sidebar__category-controls">
            <span class="docs-sidebar__count">{{ category.items.length }}</span>
            <span
              class="docs-sidebar__arrow"
              :class="{ 'docs-sidebar__arrow--expanded': props.isExpanded(category.id) }"
            >
              ▾
            </span>
          </div>
        </button>

        <ul
          v-if="props.isExpanded(category.id)"
          class="docs-sidebar__items"
        >
          <li
            v-for="item in category.items"
            :key="item.id"
            class="docs-sidebar__item"
          >
            <button
              type="button"
              class="docs-sidebar__item-btn"
              :class="{ 'docs-sidebar__item-btn--active': item.id === props.activeDocId }"
              @click="emit('select-doc', item.id)"
            >
              <span class="docs-sidebar__item-dot"></span>
              <span class="docs-sidebar__item-title">{{ item.title }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="props.categories.length === 0" class="docs-sidebar__empty">
        <span>Ничего не найдено 🔍</span>
      </div>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.docs-sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  gap: 1.25rem;

  &__search {
    width: 100%;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  &__category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }
  }

  &__category-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__category-icon {
    font-size: 1rem;
  }

  &__category-title {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__category-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__count {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    color: #64748b;
  }

  &__arrow {
    font-size: 0.8rem;
    transition: transform 0.2s ease;

    &--expanded {
      transform: rotate(180deg);
    }
  }

  &__items {
    list-style: none;
    margin: 0.25rem 0 0 1.25rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__item-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.45rem 0.75rem;
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 0.825rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.08);
    }

    &--active {
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.18);
      font-weight: 600;

      .docs-sidebar__item-dot {
        background: #818cf8;
        box-shadow: 0 0 8px #818cf8;
      }
    }
  }

  &__item-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transition: all 0.2s ease;
  }

  &__item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__empty {
    padding: 1.5rem 0.5rem;
    text-align: center;
    font-size: 0.85rem;
    color: #64748b;
  }
}
</style>
