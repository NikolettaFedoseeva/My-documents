<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCabinetDashboard } from '../model/use-cabinet-dashboard'
import CabinetProfileHeader from './cabinet-profile-header.vue'
import CabinetCoursesTab from './cabinet-courses-tab.vue'
import CabinetAssignmentsTab from './cabinet-assignments-tab.vue'
import CabinetAchievementsTab from './cabinet-achievements-tab.vue'
import CabinetSettingsTab from './cabinet-settings-tab.vue'

// #region defineEmits
const emit = defineEmits<{
  (e: 'continue-course', courseId: string): void
}>()
// #endregion defineEmits

const router = useRouter()

// #region composable
const {
  activeTab,
  user,
  stats,
  courses,
  assignments,
  achievements,
  isLoading,
  setTab,
} = useCabinetDashboard()
// #endregion composable

// #region Функции
const onContinueCourse = (courseId: string): void => {
  emit('continue-course', courseId)
  const found = courses.value.find((c) => c.id === courseId || c.slug === courseId)
  const target = found?.slug || found?.id || courseId
  router.push({ path: '/docs', query: { course: target } })
}
// #endregion Функции
</script>

<template>
  <div class="cabinet-dashboard">
    <div v-if="isLoading" class="cabinet-dashboard__loading">
      <div class="cabinet-dashboard__spinner"></div>
      <span>Загрузка данных личного кабинета...</span>
    </div>

    <div v-else class="cabinet-dashboard__container">
      <!-- Баннер профиля -->
      <CabinetProfileHeader :user="user" :stats="stats" />

      <!-- Панель навигации по закладкам -->
      <nav class="cabinet-dashboard__tabs">
        <button
          type="button"
          class="cabinet-dashboard__tab-btn"
          :class="{ 'cabinet-dashboard__tab-btn--active': activeTab === 'courses' }"
          @click="setTab('courses')"
        >
          <span>📚 Мои курсы ({{ courses.length }})</span>
        </button>

        <button
          type="button"
          class="cabinet-dashboard__tab-btn"
          :class="{ 'cabinet-dashboard__tab-btn--active': activeTab === 'assignments' }"
          @click="setTab('assignments')"
        >
          <span>📝 Задания и тесты ({{ assignments.length }})</span>
        </button>

        <button
          type="button"
          class="cabinet-dashboard__tab-btn"
          :class="{ 'cabinet-dashboard__tab-btn--active': activeTab === 'achievements' }"
          @click="setTab('achievements')"
        >
          <span>🏆 Достижения ({{ achievements.length }})</span>
        </button>

        <button
          type="button"
          class="cabinet-dashboard__tab-btn"
          :class="{ 'cabinet-dashboard__tab-btn--active': activeTab === 'settings' }"
          @click="setTab('settings')"
        >
          <span>⚙️ Настройки</span>
        </button>
      </nav>

      <!-- Содержимое закладок -->
      <main class="cabinet-dashboard__body">
        <CabinetCoursesTab
          v-if="activeTab === 'courses'"
          :courses="courses"
          @continue-course="onContinueCourse"
        />

        <CabinetAssignmentsTab
          v-else-if="activeTab === 'assignments'"
          :assignments="assignments"
        />

        <CabinetAchievementsTab
          v-else-if="activeTab === 'achievements'"
          :achievements="achievements"
        />

        <CabinetSettingsTab
          v-else-if="activeTab === 'settings'"
          :user="user"
        />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-dashboard {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 1rem;
    gap: 1rem;
    color: #94a3b8;
  }

  &__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__tabs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__tab-btn {
    background: transparent;
    border: none;
    padding: 0.65rem 1.1rem;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }

    &--active {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
  }

  &__body {
    padding-top: 0.5rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
