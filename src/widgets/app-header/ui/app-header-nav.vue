<script setup lang="ts">
import { NavLink } from '../model/use-app-header'

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
          :class="{ 'app-header-nav__btn--active': props.currentPath === link.path }"
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
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: none;
    padding: 0.5rem 0.85rem;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.06);
    }

    &--active {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.15);
      font-weight: 600;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    }
  }

  &__icon {
    font-size: 0.9rem;
  }
}
</style>
