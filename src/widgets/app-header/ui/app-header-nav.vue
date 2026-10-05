<script setup lang="ts">
import type { NavLink } from '../model/types'

// #region defineProps
interface Props {
  links: NavLink[]
  currentPath: string
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'navigate', path: string): void
}>()
// #endregion defineEmits

// #region Функции
const isLinkActive = (linkPath: string): boolean => {
  if (linkPath === '/') {
    return props.currentPath === '/'
  }
  return props.currentPath.startsWith(linkPath)
}
// #endregion Функции
</script>

<template>
  <nav class="app-header-nav">
    <ul class="app-header-nav__list">
      <li
        v-for="link in props.links"
        :key="link.path"
        class="app-header-nav__item"
      >
        <button
          type="button"
          class="app-header-nav__btn"
          :class="{
            'app-header-nav__btn--active': isLinkActive(link.path),
            'app-header-nav__btn--highlight': link.isHighlight,
          }"
          @click="emit('navigate', link.path)"
        >
          <span v-if="link.icon" class="app-header-nav__icon">{{ link.icon }}</span>
          <span>{{ link.title }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.app-header-nav {
  display: flex;
  align-items: center;

  &__list {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    &--active {
      color: #38bdf8 !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
      font-weight: 700;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
    }

    &--highlight {
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%) !important;
      color: #ffffff !important;
      border-color: transparent !important;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.35);

      &:hover {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45);
      }
    }
  }

  &__icon {
    font-size: 1rem;
    line-height: 1;
  }
}
</style>
