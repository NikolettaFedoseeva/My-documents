<template>
  <div class="docs-skeleton">
    <div class="docs-skeleton__sidebar">
      <div class="docs-skeleton__box docs-skeleton__box--search"></div>
      <div class="docs-skeleton__box docs-skeleton__box--item" v-for="i in 5" :key="i"></div>
    </div>

    <div class="docs-skeleton__content">
      <div class="docs-skeleton__box docs-skeleton__box--title"></div>
      <div class="docs-skeleton__box docs-skeleton__box--text"></div>
      <div class="docs-skeleton__box docs-skeleton__box--text docs-skeleton__box--short"></div>
      <div class="docs-skeleton__box docs-skeleton__box--code"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.docs-skeleton {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: rgba(15, 23, 42, 0.4);

  &__sidebar {
    width: 280px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__content {
    flex: 1;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__box {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 25%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-pulse 1.6s infinite ease-in-out;
    border-radius: 8px;

    &--search {
      height: 40px;
      width: 100%;
    }

    &--item {
      height: 32px;
      width: 100%;
    }

    &--title {
      height: 44px;
      width: 60%;
    }

    &--text {
      height: 20px;
      width: 90%;
    }

    &--short {
      width: 40%;
    }

    &--code {
      height: 160px;
      width: 100%;
    }
  }
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
