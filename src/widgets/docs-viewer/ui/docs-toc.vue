<script setup lang="ts">
import { DocTocItem } from '@/entities/doc'

// #region defineProps
interface Props {
  items: DocTocItem[]
  activeId?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeId: '',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
// #endregion defineEmits

// #region Функции
const scrollToSection = (id: string): void => {
  emit('select', id)
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
// #endregion Функции
</script>

<template>
  <aside class="docs-toc">
    <div class="docs-toc__header">
      <span class="docs-toc__title">На этой странице</span>
    </div>

    <ul v-if="props.items.length > 0" class="docs-toc__list">
      <li
        v-for="item in props.items"
        :key="item.id"
        :class="['docs-toc__item', `docs-toc__item--level-${item.level}`]"
      >
        <button
          type="button"
          class="docs-toc__btn"
          :class="{ 'docs-toc__btn--active': item.id === props.activeId }"
          @click="scrollToSection(item.id)"
        >
          {{ item.title }}
        </button>
      </li>
    </ul>

    <div v-else class="docs-toc__empty">
      <span>Разделы отсутствуют</span>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.docs-toc {
  width: 220px;
  min-width: 220px;
  padding: 1.5rem 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(12px);

  &__header {
    margin-bottom: 0.85rem;
  }

  &__title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.05em;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__item {
    &--level-3 {
      padding-left: 0.75rem;
    }
  }

  &__btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    line-height: 1.4;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
    padding-left: 0.5rem;

    &:hover {
      color: #f8fafc;
    }

    &--active {
      color: #818cf8;
      font-weight: 600;
      border-left-color: #818cf8;
    }
  }

  &__empty {
    font-size: 0.8rem;
    color: #475569;
  }
}
</style>
