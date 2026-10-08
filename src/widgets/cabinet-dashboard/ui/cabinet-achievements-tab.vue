<script setup lang="ts">
import { ref, computed } from 'vue'
import { Achievement } from '@/entities/course'
import { useDocProgressStore, useDocNotesStore } from '@/entities/doc'

// #region defineProps
interface Props {
  achievements: Achievement[]
}

const props = defineProps<Props>()
// #endregion defineProps

const progressStore = useDocProgressStore()
const notesStore = useDocNotesStore()

const activeFilter = ref<'all' | 'unlocked' | 'locked'>('all')

interface EnrichedAchievement extends Achievement {
  currentProgress?: number
  targetProgress?: number
  progressPercent?: number
}

// Вычисление динамических наград на основе реального опыта и действий студента
const dynamicAchievements = computed<EnrichedAchievement[]>(() => {
  const list: EnrichedAchievement[] = [
    {
      id: 'ach-first-step',
      title: 'Первый Шаг 👣',
      description: 'Изучите и отметьте прочитанной хотя бы одну главу.',
      icon: '🌱',
      currentProgress: Math.min(1, progressStore.completedChaptersCount),
      targetProgress: 1,
      progressPercent: progressStore.completedChaptersCount >= 1 ? 100 : 0,
      isUnlocked: progressStore.completedChaptersCount >= 1,
      unlockedAt: progressStore.completedChaptersCount >= 1 ? 'Получено' : undefined,
    },
    {
      id: 'ach-flashcards-master',
      title: 'Память Чемпиона 🧠',
      description: 'Освойте 5 флешкарт в 3D-тренажёре Active Recall.',
      icon: '🃏',
      currentProgress: Math.min(5, progressStore.masteredFlashcardsCount),
      targetProgress: 5,
      progressPercent: Math.min(100, Math.round((progressStore.masteredFlashcardsCount / 5) * 100)),
      isUnlocked: progressStore.masteredFlashcardsCount >= 5,
      unlockedAt: progressStore.masteredFlashcardsCount >= 5 ? 'Получено' : undefined,
    },
    {
      id: 'ach-quiz-pro',
      title: 'Магистр Тестов 🎯',
      description: 'Успешно пройдите 3 проверочных экспресс-теста.',
      icon: '⚡',
      currentProgress: Math.min(3, progressStore.completedQuizzesCount),
      targetProgress: 3,
      progressPercent: Math.min(100, Math.round((progressStore.completedQuizzesCount / 3) * 100)),
      isUnlocked: progressStore.completedQuizzesCount >= 3,
      unlockedAt: progressStore.completedQuizzesCount >= 3 ? 'Получено' : undefined,
    },
    {
      id: 'ach-streak-fire',
      title: 'Огненный Стрик 🔥',
      description: 'Удерживайте стрик регулярных занятий не менее 3 дней.',
      icon: '🔥',
      currentProgress: Math.min(3, progressStore.streakDays),
      targetProgress: 3,
      progressPercent: Math.min(100, Math.round((progressStore.streakDays / 3) * 100)),
      isUnlocked: progressStore.streakDays >= 3,
      unlockedAt: progressStore.streakDays >= 3 ? 'Получено' : undefined,
    },
    {
      id: 'ach-xp-500',
      title: 'Охотник за Опытом 💎',
      description: 'Наберите суммарно 500+ XP за изучение уроков и комбо.',
      icon: '💎',
      currentProgress: Math.min(500, progressStore.totalXp),
      targetProgress: 500,
      progressPercent: Math.min(100, Math.round((progressStore.totalXp / 500) * 100)),
      isUnlocked: progressStore.totalXp >= 500,
      unlockedAt: progressStore.totalXp >= 500 ? 'Получено' : undefined,
    },
    {
      id: 'ach-notes-keeper',
      title: 'Академический Чтец 🔖',
      description: 'Сохраните главу в закладки или оставьте заметку на полях.',
      icon: '📑',
      currentProgress: notesStore.totalBookmarksCount + notesStore.totalNotesCount >= 1 ? 1 : 0,
      targetProgress: 1,
      progressPercent: notesStore.totalBookmarksCount + notesStore.totalNotesCount >= 1 ? 100 : 0,
      isUnlocked: notesStore.totalBookmarksCount + notesStore.totalNotesCount >= 1,
      unlockedAt: notesStore.totalBookmarksCount + notesStore.totalNotesCount >= 1 ? 'Получено' : undefined,
    },
    {
      id: 'ach-fsd-master',
      title: 'Архитектор FSD 🏛️',
      description: 'Освойте методологию Feature-Sliced Design и сдайте курсовой проект.',
      icon: '👑',
      currentProgress: 0,
      targetProgress: 1,
      progressPercent: 0,
      isUnlocked: false,
    },
  ]

  return list
})

const totalUnlockedCount = computed(() => {
  return dynamicAchievements.value.filter((a) => a.isUnlocked).length
})

const overallPercent = computed(() => {
  if (dynamicAchievements.value.length === 0) return 0
  return Math.round((totalUnlockedCount.value / dynamicAchievements.value.length) * 100)
})

const filteredList = computed(() => {
  if (activeFilter.value === 'unlocked') {
    return dynamicAchievements.value.filter((a) => a.isUnlocked)
  }
  if (activeFilter.value === 'locked') {
    return dynamicAchievements.value.filter((a) => !a.isUnlocked)
  }
  return dynamicAchievements.value
})
</script>

<template>
  <div class="cabinet-achievements-tab">
    <!-- Сводная панель прогресса наград -->
    <div class="achievements-summary-card">
      <div class="achievements-summary-card__left">
        <span class="trophy-badge">🏆</span>
        <div class="achievements-summary-card__info">
          <h3 class="achievements-summary-card__title">
            Зал Достижений и Трофеев
          </h3>
          <p class="achievements-summary-card__desc">
            Разблокировано {{ totalUnlockedCount }} из {{ dynamicAchievements.length }} наград ({{ overallPercent }}%)
          </p>
        </div>
      </div>

      <div class="achievements-summary-card__track-col">
        <div class="achievements-progress-track">
          <div
            class="achievements-progress-fill"
            :style="{ width: `${overallPercent}%` }"
          ></div>
        </div>
        <span class="progress-percent-lbl">{{ overallPercent }}% Пройдено</span>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="achievements-filters">
      <button
        type="button"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Все ({{ dynamicAchievements.length }})
      </button>
      <button
        type="button"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === 'unlocked' }"
        @click="activeFilter = 'unlocked'"
      >
        ⭐ Полученные ({{ totalUnlockedCount }})
      </button>
      <button
        type="button"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === 'locked' }"
        @click="activeFilter = 'locked'"
      >
        🔒 В процессе ({{ dynamicAchievements.length - totalUnlockedCount }})
      </button>
    </div>

    <!-- Сетка достижений -->
    <div class="cabinet-achievements-tab__grid">
      <div
        v-for="item in filteredList"
        :key="item.id"
        :class="[
          'cabinet-achievements-tab__card',
          { 'cabinet-achievements-tab__card--locked': !item.isUnlocked },
          { 'cabinet-achievements-tab__card--unlocked': item.isUnlocked }
        ]"
      >
        <div class="card-icon-wrap">
          <span class="cabinet-achievements-tab__icon">{{ item.icon }}</span>
          <span v-if="item.isUnlocked" class="check-ribbon">✓</span>
        </div>

        <div class="cabinet-achievements-tab__meta">
          <h4 class="cabinet-achievements-tab__name">{{ item.title }}</h4>
          <p class="cabinet-achievements-tab__desc">{{ item.description }}</p>

          <!-- Индикатор локального прогресса -->
          <div v-if="item.targetProgress && item.targetProgress > 1" class="mini-progress-row">
            <div class="mini-track">
              <div
                class="mini-fill"
                :style="{ width: `${item.progressPercent || 0}%` }"
              ></div>
            </div>
            <span class="mini-lbl">{{ item.currentProgress }} / {{ item.targetProgress }}</span>
          </div>

          <div class="card-status-row">
            <span v-if="item.isUnlocked" class="cabinet-achievements-tab__unlocked">
              ⭐ Разблокировано
            </span>
            <span v-else class="cabinet-achievements-tab__locked-text">
              🔒 В процессе
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-achievements-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Сводная карточка */
.achievements-summary-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);

  &__left {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .trophy-badge {
    font-size: 2.4rem;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: #ffffff;
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: #94a3b8;
  }

  &__track-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.45rem;
    min-width: 220px;
  }

  .achievements-progress-track {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
  }

  .achievements-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #10b981);
    border-radius: 9999px;
    transition: width 0.5s ease;
  }

  .progress-percent-lbl {
    font-size: 0.8rem;
    font-weight: 700;
    color: #10b981;
  }
}

/* Фильтры */
.achievements-filters {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;

  .filter-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    padding: 0.45rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    &--active {
      background: rgba(99, 102, 241, 0.2);
      border-color: #818cf8;
      color: #ffffff;
    }
  }
}

/* Сетка карточек */
.cabinet-achievements-tab__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.cabinet-achievements-tab__card {
  display: flex;
  align-items: flex-start;
  gap: 1.15rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.35rem;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  }

  &--unlocked {
    border-color: rgba(245, 158, 11, 0.35);
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(245, 158, 11, 0.05) 100%);
  }

  &--locked {
    opacity: 0.65;
    border-color: rgba(255, 255, 255, 0.06);

    &:hover {
      opacity: 0.9;
    }
  }
}

.card-icon-wrap {
  position: relative;
  flex-shrink: 0;

  .cabinet-achievements-tab__icon {
    font-size: 2.2rem;
    width: 52px;
    height: 52px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .check-ribbon {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: #10b981;
    color: #ffffff;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  }
}

.cabinet-achievements-tab__meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.cabinet-achievements-tab__name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.cabinet-achievements-tab__desc {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.mini-progress-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.35rem;

  .mini-track {
    flex: 1;
    height: 5px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
  }

  .mini-fill {
    height: 100%;
    background: #818cf8;
    border-radius: 9999px;
  }

  .mini-lbl {
    font-size: 0.72rem;
    color: #cbd5e1;
    font-weight: 600;
    white-space: nowrap;
  }
}

.card-status-row {
  margin-top: 0.25rem;
}

.cabinet-achievements-tab__unlocked {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 700;
}

.cabinet-achievements-tab__locked-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}
</style>
