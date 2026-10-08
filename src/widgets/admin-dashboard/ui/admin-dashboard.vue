<script setup lang="ts">
import { useAdminDashboard } from '../model/use-admin-dashboard'
import AdminUsersTab from './admin-users-tab.vue'
import AdminCoursesTab from './admin-courses-tab.vue'
import AdminAnalyticsTab from './admin-analytics-tab.vue'
import AdminSettingsTab from './admin-settings-tab.vue'

// #region composable
const {
  activeTab,
  isLoading,
  notificationText,
  userSearch,
  userRoleFilter,
  filteredUsers,
  courseSearch,
  courseStatusFilter,
  filteredCourses,
  settings,
  totalUsersCount,
  studentsCount,
  authorsCount,
  adminsCount,
  totalCoursesCount,
  publishedCoursesCount,
  totalChaptersCount,
  completedChaptersCount,
  masteredFlashcards,
  changeUserRole,
  toggleUserBan,
  toggleCoursePublish,
  deleteCourse,
  saveSettings,
  resetAllDemoData,
} = useAdminDashboard()
// #endregion composable
</script>

<template>
  <div class="admin-dashboard">
    <!-- Всплывающий тост об операциях -->
    <transition name="toast">
      <div v-if="notificationText" class="admin-toast">
        <span class="toast-icon">✨</span>
        <span class="toast-msg">{{ notificationText }}</span>
      </div>
    </transition>

    <!-- Спиннер загрузки -->
    <div v-if="isLoading" class="admin-dashboard__loading">
      <div class="spinner"></div>
      <span>Загрузка данных панели администратора...</span>
    </div>

    <div v-else class="admin-dashboard__container">
      <!-- Навигация по вкладкам -->
      <nav class="admin-dashboard__tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          <span>👥 Пользователи & Роли</span>
          <span class="tab-badge">{{ totalUsersCount }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'courses' }"
          @click="activeTab = 'courses'"
        >
          <span>📚 Модерация курсов</span>
          <span class="tab-badge">{{ totalCoursesCount }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'analytics' }"
          @click="activeTab = 'analytics'"
        >
          <span>📊 Аналитика & KPI</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          <span>⚙️ Настройки платформы</span>
        </button>
      </nav>

      <!-- Содержимое активной вкладки -->
      <main class="admin-dashboard__content">
        <AdminUsersTab
          v-if="activeTab === 'users'"
          :users="filteredUsers"
          :search-query="userSearch"
          :role-filter="userRoleFilter"
          @update:search-query="userSearch = $event"
          @update:role-filter="userRoleFilter = $event"
          @change-role="changeUserRole"
          @toggle-ban="toggleUserBan"
        />

        <AdminCoursesTab
          v-else-if="activeTab === 'courses'"
          :courses="filteredCourses"
          :search-query="courseSearch"
          :status-filter="courseStatusFilter"
          @update:search-query="courseSearch = $event"
          @update:status-filter="courseStatusFilter = $event"
          @toggle-publish="toggleCoursePublish"
          @delete-course="deleteCourse"
        />

        <AdminAnalyticsTab
          v-else-if="activeTab === 'analytics'"
          :total-users="totalUsersCount"
          :students-count="studentsCount"
          :authors-count="authorsCount"
          :admins-count="adminsCount"
          :total-courses="totalCoursesCount"
          :published-courses="publishedCoursesCount"
          :total-chapters="totalChaptersCount"
          :completed-chapters="completedChaptersCount"
          :mastered-flashcards="masteredFlashcards"
        />

        <AdminSettingsTab
          v-else-if="activeTab === 'settings'"
          :settings="settings"
          @save="saveSettings"
          @reset-demo="resetAllDemoData"
        />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-dashboard {
  width: 100%;
  position: relative;

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 1rem;
    gap: 1rem;
    color: #94a3b8;
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

  &__content {
    width: 100%;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.tab-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
}

.admin-toast {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #1e1b4b;
  border: 1px solid rgba(129, 140, 248, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.3);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
