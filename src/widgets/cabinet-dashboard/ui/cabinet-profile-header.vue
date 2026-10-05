<script setup lang="ts">
import { User, UserAvatar } from '@/entities/user'
import { UserCabinetStats } from '@/entities/course'

// #region defineProps
interface Props {
  user: User | null
  stats: UserCabinetStats | null
}

const props = defineProps<Props>()
// #endregion defineProps
</script>

<template>
  <div v-if="props.user && props.stats" class="cabinet-profile-header">
    <div class="cabinet-profile-header__user-info">
      <UserAvatar
        :src="props.user.avatar"
        :name="props.user.name"
        :status="props.user.status"
        size="lg"
      />

      <div class="cabinet-profile-header__meta">
        <div class="cabinet-profile-header__name-row">
          <h2 class="cabinet-profile-header__name">{{ props.user.name }}</h2>
          <span class="cabinet-profile-header__rank">Level 5 · Senior Learner</span>
        </div>
        <p class="cabinet-profile-header__email">{{ props.user.email }}</p>
      </div>

      <div class="cabinet-profile-header__streak">
        <span class="cabinet-profile-header__streak-fire">🔥</span>
        <div class="cabinet-profile-header__streak-meta">
          <span class="cabinet-profile-header__streak-count">{{ props.stats.streakDays }} дней</span>
          <span class="cabinet-profile-header__streak-label">Серия подряд</span>
        </div>
      </div>
    </div>

    <!-- 4 KPI карточки статистики -->
    <div class="cabinet-profile-header__kpi-grid">
      <div class="cabinet-profile-header__kpi">
        <span class="cabinet-profile-header__kpi-icon">📚</span>
        <div class="cabinet-profile-header__kpi-data">
          <span class="cabinet-profile-header__kpi-value">
            {{ props.stats.completedCoursesCount }} / {{ props.stats.totalCoursesCount }}
          </span>
          <span class="cabinet-profile-header__kpi-label">Курсов завершено</span>
        </div>
      </div>

      <div class="cabinet-profile-header__kpi">
        <span class="cabinet-profile-header__kpi-icon">✅</span>
        <div class="cabinet-profile-header__kpi-data">
          <span class="cabinet-profile-header__kpi-value">{{ props.stats.completedLessonsCount }}</span>
          <span class="cabinet-profile-header__kpi-label">Уроков пройдено</span>
        </div>
      </div>

      <div class="cabinet-profile-header__kpi">
        <span class="cabinet-profile-header__kpi-icon">⏱️</span>
        <div class="cabinet-profile-header__kpi-data">
          <span class="cabinet-profile-header__kpi-value">{{ props.stats.learningHours }} ч</span>
          <span class="cabinet-profile-header__kpi-label">Часов практики</span>
        </div>
      </div>

      <div class="cabinet-profile-header__kpi">
        <span class="cabinet-profile-header__kpi-icon">🎯</span>
        <div class="cabinet-profile-header__kpi-data">
          <span class="cabinet-profile-header__kpi-value">{{ props.stats.averageScore }}%</span>
          <span class="cabinet-profile-header__kpi-label">Средний балл</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-profile-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.75rem;

  &__user-info {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__name {
    font-size: 1.4rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0;
  }

  &__rank {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.35);
  }

  &__email {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0;
  }

  &__streak {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 12px;
  }

  &__streak-fire {
    font-size: 1.3rem;
  }

  &__streak-meta {
    display: flex;
    flex-direction: column;
  }

  &__streak-count {
    font-size: 0.9rem;
    font-weight: 800;
    color: #fbbf24;
  }

  &__streak-label {
    font-size: 0.7rem;
    color: #cbd5e1;
  }

  &__kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__kpi {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.85rem 1rem;
    border-radius: 12px;
  }

  &__kpi-icon {
    font-size: 1.4rem;
  }

  &__kpi-data {
    display: flex;
    flex-direction: column;
  }

  &__kpi-value {
    font-size: 1.1rem;
    font-weight: 800;
    color: #ffffff;
  }

  &__kpi-label {
    font-size: 0.75rem;
    color: #64748b;
  }
}
</style>
