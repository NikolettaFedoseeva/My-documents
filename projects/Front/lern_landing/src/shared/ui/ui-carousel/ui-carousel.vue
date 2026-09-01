<script setup lang="ts">
import { ref, computed } from 'vue'

// #region Props & Emits
interface Props {
  itemsCount: number
  visibleCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  visibleCount: 1,
})

const currentIndex = ref(0)

const maxIndex = computed(() => {
  return Math.max(0, props.itemsCount - props.visibleCount)
})

const next = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = maxIndex.value
  }
}

const goTo = (index: number) => {
  currentIndex.value = Math.min(maxIndex.value, Math.max(0, index))
}
// #endregion Functions
</script>

<template>
  <div class="ui-carousel">
    <button class="ui-carousel__nav ui-carousel__nav--prev" @click="prev">‹</button>

    <div class="ui-carousel__viewport">
      <div
        class="ui-carousel__track"
        :style="{ transform: `translateX(-${currentIndex * (100 / props.visibleCount)}%)` }"
      >
        <slot></slot>
      </div>
    </div>

    <button class="ui-carousel__nav ui-carousel__nav--next" @click="next">›</button>

    <div v-if="props.itemsCount > 1" class="ui-carousel__dots">
      <button
        v-for="idx in props.itemsCount"
        :key="idx"
        class="ui-carousel__dot"
        :class="{ 'ui-carousel__dot--active': currentIndex === idx - 1 }"
        @click="goTo(idx - 1)"
      ></button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-carousel {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__viewport {
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-md);
  }

  &__track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
  }

  &__nav {
    position: absolute;
    top: 40%;
    transform: translateY(-50%);
    z-index: 10;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: var(--card-blur);
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-card-hover);
      border-color: var(--primary);
    }

    &--prev { left: -18px; }
    &--next { right: -18px; }
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-color);
    border: none;
    cursor: pointer;
    transition: all 0.25s ease;

    &--active {
      width: 24px;
      border-radius: 999px;
      background: var(--primary);
    }
  }
}
</style>
