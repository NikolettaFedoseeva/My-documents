<script setup lang="ts">
import type { DocCategory } from '@/entities/doc'

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
  (e: 'selectDoc', docId: string): void
  (e: 'toggleCategory', categoryId: string): void
  (e: 'update:searchQuery', query: string): void
}>()
// #endregion defineEmits

// #region Функции
const onInputSearch = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}
// #endregion Функции
</script>

<template>
  <aside class="docs-sidebar">
    <!-- Поиск по Карте Знаний -->
    <div class="docs-sidebar__search">
      <span class="docs-sidebar__search-icon">🔍</span>
      <input
        type="text"
        :value="props.searchQuery"
        placeholder="Поиск по Карте Знаний..."
        class="docs-sidebar__search-input"
        @input="onInputSearch"
      />
    </div>

    <!-- Заголовок карты знаний -->
    <div class="docs-sidebar__title-bar">
      <span class="docs-sidebar__title-text">🌳 КАРТА ЗНАНИЙ (CODEX)</span>
      <span class="docs-sidebar__count">{{ props.categories.length }} модулей</span>
    </div>

    <!-- Каскадное дерево знаний -->
    <nav class="docs-sidebar__nav">
      <div
        v-for="category in props.categories"
        :key="category.id"
        class="tree-node"
      >
        <!-- Шапка модуля (Каскадный блок) -->
        <button
          type="button"
          class="tree-node__header"
          @click="emit('toggleCategory', category.id)"
        >
          <div class="tree-node__header-left">
            <span v-if="category.code" class="tree-node__code">{{ category.code }}</span>
            <span class="tree-node__icon">{{ category.icon }}</span>
            <span class="tree-node__title">{{ category.title }}</span>
          </div>

          <div class="tree-node__header-right">
            <span v-if="category.progressPercent === 100" class="status-badge status-badge--done">✓</span>
            <span v-else-if="category.progressPercent && category.progressPercent > 0" class="status-badge status-badge--progress">
              {{ category.progressPercent }}%
            </span>
            <span
              class="tree-node__arrow"
              :class="{ 'tree-node__arrow--open': props.isExpanded(category.id) }"
            >
              ▾
            </span>
          </div>
        </button>

        <!-- Ветка уроков / статей -->
        <transition name="tree-expand">
          <ul
            v-if="props.isExpanded(category.id)"
            class="tree-branch"
          >
            <li
              v-for="item in category.items"
              :key="item.id"
              class="tree-leaf"
            >
              <button
                type="button"
                class="tree-leaf__btn"
                :class="{
                  'tree-leaf__btn--active': props.activeDocId === item.id,
                  'tree-leaf__btn--completed': item.status === 'completed',
                  'tree-leaf__btn--locked': item.status === 'locked',
                }"
                @click="emit('selectDoc', item.id)"
              >
                <!-- Соединительная линия ветки -->
                <span class="tree-leaf__connector"></span>

                <!-- Код урока: 01.1, 01.2 -->
                <span v-if="item.code" class="tree-leaf__code">{{ item.code }}</span>

                <span class="tree-leaf__title">{{ item.title }}</span>

                <span class="tree-leaf__status-icon">
                  <span v-if="item.status === 'completed'" title="Изучено">✓</span>
                  <span v-else-if="props.activeDocId === item.id" title="Текущий урок">🔥</span>
                  <span v-else-if="item.status === 'locked'" title="Заблокировано">🔒</span>
                </span>
              </button>
            </li>
          </ul>
        </transition>
      </div>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.docs-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-container, #1c2d47);
  border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding: 1.25rem 1rem;
  box-sizing: border-box;
  overflow-y: auto;

  &__search {
    position: relative;
    margin-bottom: 1rem;
  }

  &__search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    opacity: 0.6;
    pointer-events: none;
  }

  &__search-input {
    width: 100%;
    background: var(--bg-card, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--radius-sm, 10px);
    padding: 0.6rem 0.85rem 0.6rem 2.2rem;
    color: var(--text-main, #ffffff);
    font-size: 0.85rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: var(--primary, #38bdf8);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
    }

    &::placeholder {
      color: var(--text-muted, #94a3b8);
      font-size: 0.82rem;
    }
  }

  &__title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.4rem 0.8rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    margin-bottom: 0.75rem;
  }

  &__title-text {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--text-muted, #94a3b8);
  }

  &__count {
    font-size: 0.7rem;
    color: var(--text-muted, #94a3b8);
    opacity: 0.8;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
}

/* Tree Nodes */
.tree-node {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--bg-card, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-sm, 10px);
    color: var(--text-main, #ffffff);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
      border-color: var(--primary, #38bdf8);
    }
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary, #818cf8);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  &__icon {
    font-size: 1rem;
    line-height: 1;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__arrow {
    font-size: 0.8rem;
    color: var(--text-muted, #94a3b8);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 9999px;

  &--done {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }

  &--progress {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
}

/* Tree Leaves (Уроки) */
.tree-branch {
  list-style: none;
  padding: 0.35rem 0 0.35rem 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  border-left: 2px dashed var(--border-color, rgba(255, 255, 255, 0.12));
  margin-left: 1rem;
}

.tree-leaf {
  &__btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted, #94a3b8);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
      color: var(--text-main, #ffffff);
    }

    &--active {
      background: var(--bg-card-hover, rgba(56, 189, 248, 0.15)) !important;
      border-color: var(--primary, #38bdf8) !important;
      color: var(--text-main, #ffffff) !important;
      font-weight: 700;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }

    &--completed {
      color: var(--text-main, #e2e8f0);
    }

    &--locked {
      opacity: 0.6;
    }
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-muted, #94a3b8);
    opacity: 0.8;
  }

  &__title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__status-icon {
    font-size: 0.8rem;
    margin-left: auto;
  }
}

.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
