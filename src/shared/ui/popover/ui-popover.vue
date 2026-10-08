<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  triggerText?: string
  position?: 'bottom' | 'top' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: 'Контекстное меню',
  position: 'bottom',
})

const isOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (e: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="popoverRef" class="ui-popover">
    <div class="ui-popover__trigger" @click.stop="toggle">
      <slot name="trigger">
        <button type="button" class="ui-popover__default-trigger">
          <span>{{ props.triggerText }}</span>
          <span class="trigger-chevron">▾</span>
        </button>
      </slot>
    </div>

    <Transition name="popover-fade">
      <div
        v-if="isOpen"
        class="ui-popover__content"
        :class="`ui-popover__content--${props.position}`"
      >
        <slot :close="() => (isOpen = false)" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.ui-popover {
  position: relative;
  display: inline-block;

  &__default-trigger {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .trigger-chevron {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }

  &__content {
    position: absolute;
    z-index: 1000;
    min-width: 200px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.75rem;
    box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.5);

    &--bottom {
      top: calc(100% + 8px);
      left: 0;
    }

    &--top {
      bottom: calc(100% + 8px);
      left: 0;
    }

    &--left {
      right: calc(100% + 8px);
      top: 0;
    }

    &--right {
      left: calc(100% + 8px);
      top: 0;
    }
  }
}

.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
