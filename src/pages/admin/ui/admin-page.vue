<script setup lang="ts">
import { AdminDashboard } from '@/widgets/admin-dashboard'
import { useUserSessionStore } from '@/entities/user'

const sessionStore = useUserSessionStore()
</script>

<template>
  <div class="admin-page">
    <div class="admin-page__container">
      <!-- Заголовок страницы -->
      <header class="admin-page__hero">
        <div class="hero-left">
          <div class="hero-badge">
            <span class="badge-icon">🛡️</span>
            <span>СИСТЕМА УПРАВЛЕНИЯ ПЛАТФОРМОЙ LERN</span>
          </div>
          <h1 class="hero-title">Панель Администратора & Модерация</h1>
          <p class="hero-subtitle">
            Управление ролями и доступами пользователей, модерация курсов авторов, системная аналитика и глобальные параметры.
          </p>
        </div>

        <div class="hero-right">
          <div class="session-card">
            <div class="session-user">
              <img
                :src="sessionStore.currentUser.avatar"
                :alt="sessionStore.currentUser.name"
                class="session-avatar"
              />
              <div class="session-meta">
                <span class="session-name">{{ sessionStore.currentUser.name }}</span>
                <span class="session-role">👑 Главный Администратор</span>
              </div>
            </div>
            <div class="session-indicator">
              <span class="pulse-dot"></span>
              <span>Полный доступ (Root)</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Виджет админки -->
      <main class="admin-page__content">
        <AdminDashboard />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-page {
  min-height: calc(100vh - 64px);
  background: #090d16;
  color: #f8fafc;
  padding: 2rem 1.5rem 4rem;
  box-sizing: border-box;

  &__container {
    max-width: 1320px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.45) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 20px;
    padding: 2rem 2.5rem;
    backdrop-filter: blur(16px);
  }

  &__content {
    width: 100%;
  }
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: 0.05em;
  width: fit-content;
}

.badge-icon {
  font-size: 0.9rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.hero-right {
  display: flex;
  align-items: center;
}

.session-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 1.25rem;
  border-radius: 14px;
}

.session-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.session-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #818cf8;
}

.session-meta {
  display: flex;
  flex-direction: column;
}

.session-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.session-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fbbf24;
}

.session-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #34d399;
  font-weight: 600;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@media (max-width: 900px) {
  .admin-page__hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>