<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserSessionStore } from '@/entities/user'
import { UiButton, UiCard, UiBadge } from 'lern-ui-kit'

const route = useRoute()
const router = useRouter()
const sessionStore = useUserSessionStore()

// #region computed
const requiredRole = computed<string>(() => {
  return (route.query.required as string) || 'author,admin'
})

const requiredRoleLabel = computed<string>(() => {
  if (requiredRole.value.includes('author')) return 'Автор курсов или Администратор'
  if (requiredRole.value.includes('admin')) return 'Администратор платформы'
  return 'Авторизованный пользователь'
})
// #endregion computed

// #region Функции
const goBack = (): void => {
  router.push('/courses')
}

const switchToAuthor = (): void => {
  sessionStore.switchRole('author')
  const redirect = (route.query.redirect as string) || '/author'
  router.push(redirect)
}

const switchToAdmin = (): void => {
  sessionStore.switchRole('admin')
  const redirect = (route.query.redirect as string) || '/admin'
  router.push(redirect)
}
// #endregion Функции
</script>

<template>
  <div class="forbidden-page">
    <UiCard variant="glass" padding="lg" class="forbidden-card">
      <div class="forbidden-icon">🛡️</div>
      <div class="forbidden-badge">
        <UiBadge variant="warning">403 • ОГРАНИЧЕНИЕ ДОСТУПА</UiBadge>
      </div>

      <h1 class="forbidden-title">Недостаточно прав для доступа</h1>
      <p class="forbidden-desc">
        Раздел, к которому вы обратились, требует расширенных привилегий.
        Ваша текущая роль:
        <strong>{{ sessionStore.currentRoleInfo.name }}</strong> ({{ sessionStore.currentRole }}).
      </p>

      <div class="forbidden-info-box">
        <div class="info-row">
          <span class="info-label">Требуемая роль:</span>
          <span class="info-val">{{ requiredRoleLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Текущий профиль:</span>
          <span class="info-val">{{ sessionStore.currentUser.name }} ({{ sessionStore.currentUser.email }})</span>
        </div>
      </div>

      <div class="forbidden-actions">
        <UiButton variant="secondary" size="md" @click="goBack">
          <span>← Вернуться к курсам</span>
        </UiButton>

        <UiButton
          v-if="requiredRole.includes('author')"
          variant="primary"
          size="md"
          @click="switchToAuthor"
        >
          <span>✍️ Переключиться на Автора</span>
        </UiButton>

        <UiButton
          v-if="requiredRole.includes('admin')"
          variant="danger"
          size="md"
          @click="switchToAdmin"
        >
          <span>👑 Переключиться на Админа</span>
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<style scoped lang="scss">
.forbidden-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
}

.forbidden-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--radius-lg, 24px);
  box-shadow: var(--shadow-main, 0 16px 40px rgba(0, 0, 0, 0.25));
}

.forbidden-icon {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  animation: bounce 2s infinite ease-in-out;
}

.forbidden-badge {
  margin-bottom: 1rem;
}

.forbidden-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main, #f8fafc);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.forbidden-desc {
  font-size: 0.95rem;
  color: var(--text-muted, #94a3b8);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  max-width: 480px;

  strong {
    color: var(--primary, #6366f1);
  }
}

.forbidden-info-box {
  width: 100%;
  background: var(--bg-card, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-sm, 10px);
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  gap: 1rem;
}

.info-label {
  color: var(--text-muted, #94a3b8);
}

.info-val {
  font-weight: 600;
  color: var(--text-main, #f8fafc);
}

.forbidden-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
