<script setup lang="ts">
import { Achievement } from '@/entities/course'

// #region defineProps
interface Props {
  achievements: Achievement[]
}

const props = defineProps<Props>()
// #endregion defineProps
</script>

<template>
  <div class="cabinet-achievements-tab">
    <h3 class="cabinet-achievements-tab__title">Достижения и Бейджи</h3>

    <div class="cabinet-achievements-tab__grid">
      <div
        v-for="item in props.achievements"
        :key="item.id"
        :class="['cabinet-achievements-tab__card', { 'cabinet-achievements-tab__card--locked': !item.isUnlocked }]"
      >
        <span class="cabinet-achievements-tab__icon">{{ item.icon }}</span>
        <div class="cabinet-achievements-tab__meta">
          <h4 class="cabinet-achievements-tab__name">{{ item.title }}</h4>
          <p class="cabinet-achievements-tab__desc">{{ item.description }}</p>
          <span v-if="item.isUnlocked" class="cabinet-achievements-tab__unlocked">
            Получено: {{ item.unlockedAt }}
          </span>
          <span v-else class="cabinet-achievements-tab__locked-text">
            🔒 Заблокировано
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-achievements-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 14px;
    padding: 1.1rem;

    &--locked {
      border-color: rgba(255, 255, 255, 0.08);
      opacity: 0.5;
      filter: grayscale(80%);
    }
  }

  &__icon {
    font-size: 2.2rem;
  }

  &__meta {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.2rem 0;
  }

  &__desc {
    font-size: 0.775rem;
    color: #94a3b8;
    margin: 0 0 0.35rem 0;
    line-height: 1.3;
  }

  &__unlocked {
    font-size: 0.7rem;
    color: #c084fc;
    font-weight: 600;
  }

  &__locked-text {
    font-size: 0.7rem;
    color: #64748b;
  }
}
</style>
