<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  AuthMode,
  LoginPayload,
  RegisterPayload,
  AuthApiService,
} from '@/entities/auth'
import { useUserSessionStore, UserRole } from '@/entities/user'
import AuthCardTabs from './auth-card-tabs.vue'
import { LoginForm } from '@/features/login-by-email'
import { RegisterForm } from '@/features/register-by-email'
import { SocialAuthButtons } from '@/features/social-auth'

const router = useRouter()
const route = useRoute()
const sessionStore = useUserSessionStore()

// #region refs
const activeMode = ref<AuthMode>('login')
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const forgotEmail = ref<string>('')
// #endregion refs

// #region computed (Редирект и подсказки)
const redirectUrl = computed<string>(() => (route.query.redirect as string) || '')

const redirectNotice = computed<string>(() => {
  if (!redirectUrl.value) return ''
  if (redirectUrl.value.includes('/author')) {
    return '✍️ Для доступа к Студии автора войдите в аккаунт автора или зарегистрируйтесь'
  }
  if (redirectUrl.value.includes('/admin')) {
    return '👑 Для входа в Панель администратора требуется учетная запись администратора'
  }
  if (redirectUrl.value.includes('/cabinet')) {
    return '🎓 Для просмотра Личного кабинета и прогресса войдите в аккаунт'
  }
  return '🔒 Для перехода к запрашиваемой странице требуется авторизация'
})
// #endregion computed

// #region Функции
const changeMode = (mode: AuthMode): void => {
  activeMode.value = mode
  errorMessage.value = ''
  successMessage.value = ''
}

const resolveRedirectTarget = (role: UserRole): string => {
  if (redirectUrl.value) {
    return redirectUrl.value
  }
  if (role === 'author' || role === 'teacher') return '/author'
  if (role === 'admin') return '/admin'
  return '/cabinet'
}

const handleLogin = async (payload: LoginPayload): Promise<void> => {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const res = await AuthApiService.login(payload)
    if (res.success && res.user) {
      sessionStore.loginAs({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar:
          res.user.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        status: 'online',
        unreadNotificationsCount: 1,
        xp: res.user.xp || 100,
        level: res.user.level || 1,
      })

      const target = resolveRedirectTarget(res.user.role)
      successMessage.value = `Успешный вход (${res.user.name})! Перенаправление...`
      setTimeout(() => {
        router.push(target)
      }, 700)
    } else {
      errorMessage.value = res.errorMessage || 'Ошибка входа'
    }
  } catch (err) {
    errorMessage.value = 'Сетевая ошибка'
  } finally {
    isSubmitting.value = false
  }
}

const handleRegister = async (payload: RegisterPayload): Promise<void> => {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const res = await AuthApiService.register(payload)
    if (res.success && res.user) {
      sessionStore.loginAs({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar:
          res.user.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        status: 'online',
        unreadNotificationsCount: 1,
        xp: res.user.xp || 100,
        level: res.user.level || 1,
      })

      const target = resolveRedirectTarget(res.user.role)
      successMessage.value = `Добро пожаловать в LERN, ${res.user.name}! Перенаправление...`
      setTimeout(() => {
        router.push(target)
      }, 800)
    } else {
      errorMessage.value = res.errorMessage || 'Ошибка регистрации'
    }
  } catch (err) {
    errorMessage.value = 'Сетевая ошибка'
  } finally {
    isSubmitting.value = false
  }
}

const handleQuickDemoLogin = (role: UserRole): void => {
  sessionStore.switchRole(role)
  const target = resolveRedirectTarget(role)
  successMessage.value = `Вход под ролью «${sessionStore.currentRoleInfo.name}»...`
  setTimeout(() => {
    router.push(target)
  }, 600)
}

const handleForgotPassword = async (): Promise<void> => {
  if (!forgotEmail.value) {
    errorMessage.value = 'Укажите Ваш email'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await AuthApiService.resetPassword({ email: forgotEmail.value })
    successMessage.value = 'Ссылка для восстановления отправлена на ваш email!'
  } finally {
    isSubmitting.value = false
  }
}

const handleSocialAuth = (provider: string): void => {
  const mockUserRole: UserRole = redirectUrl.value.includes('/author') ? 'author' : 'student'
  sessionStore.loginAs({
    id: `usr-soc-${Date.now()}`,
    name: `${provider.toUpperCase()} Пользователь`,
    email: `user@${provider}.com`,
    role: mockUserRole,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    status: 'online',
    unreadNotificationsCount: 0,
    xp: 200,
    level: 2,
  })

  const target = resolveRedirectTarget(mockUserRole)
  successMessage.value = `Вход через ${provider.toUpperCase()} успешен!`
  setTimeout(() => {
    router.push(target)
  }, 600)
}
// #endregion Функции
</script>

<template>
  <div class="auth-card">
    <header class="auth-card__header">
      <div class="auth-card__brand">
        <span class="auth-card__logo">🎓</span>
        <span class="auth-card__title">LERN</span>
      </div>
      <p class="auth-card__subtitle">
        {{
          activeMode === 'login'
            ? 'Войдите в свою учетную запись'
            : activeMode === 'register'
            ? 'Создайте новый аккаунт на платформе'
            : 'Восстановление доступа к аккаунту'
        }}
      </p>
    </header>

    <!-- Предупреждение о необходимости входа для доступа к странице (Redirect Notice) -->
    <div v-if="redirectNotice" class="auth-card__redirect-notice">
      <span>{{ redirectNotice }}</span>
    </div>

    <!-- Быстрый демо-вход для мгновенного тестирования -->
    <div v-if="activeMode !== 'forgot'" class="auth-card__quick-box">
      <span class="auth-card__quick-title">⚡ Быстрый вход для тестирования ролей:</span>
      <div class="auth-card__quick-buttons">
        <button
          type="button"
          class="btn-quick btn-quick--student"
          title="Войти как Студент"
          @click="handleQuickDemoLogin('student')"
        >
          <span>🎓 Студент</span>
        </button>
        <button
          type="button"
          class="btn-quick btn-quick--author"
          title="Войти как Автор"
          @click="handleQuickDemoLogin('author')"
        >
          <span>✍️ Автор</span>
        </button>
        <button
          type="button"
          class="btn-quick btn-quick--admin"
          title="Войти как Администратор"
          @click="handleQuickDemoLogin('admin')"
        >
          <span>👑 Админ</span>
        </button>
      </div>
    </div>

    <!-- Табы Login / Register -->
    <AuthCardTabs
      v-if="activeMode !== 'forgot'"
      :active-mode="activeMode"
      @change-mode="changeMode"
    />

    <!-- Сообщение об успехе -->
    <div v-if="successMessage" class="auth-card__success">
      <span>🎉 {{ successMessage }}</span>
    </div>

    <!-- Форма Входа -->
    <LoginForm
      v-if="activeMode === 'login'"
      :is-submitting="isSubmitting"
      :error-message="errorMessage"
      @submit="handleLogin"
      @forgot-password="changeMode('forgot')"
    />

    <!-- Форма Регистрации -->
    <RegisterForm
      v-else-if="activeMode === 'register'"
      :is-submitting="isSubmitting"
      :error-message="errorMessage"
      @submit="handleRegister"
    />

    <!-- Форма Сброса Пароля -->
    <div v-else-if="activeMode === 'forgot'" class="auth-card__forgot">
      <div v-if="errorMessage" class="auth-card__error">
        <span>⚠️ {{ errorMessage }}</span>
      </div>

      <div class="auth-card__field">
        <label class="auth-card__label">Ваш Email</label>
        <input
          v-model="forgotEmail"
          type="email"
          class="auth-card__input"
          placeholder="name@example.com"
        />
      </div>

      <button
        type="button"
        class="auth-card__submit-btn"
        :disabled="isSubmitting"
        @click="handleForgotPassword"
      >
        <span>Отправить инструкцию</span>
      </button>

      <button
        type="button"
        class="auth-card__back-btn"
        @click="changeMode('login')"
      >
        ← Вернуться ко входу
      </button>
    </div>

    <!-- Социальные сети -->
    <SocialAuthButtons
      v-if="activeMode !== 'forgot'"
      @select-provider="handleSocialAuth"
    />
  </div>
</template>

<style scoped lang="scss">
.auth-card {
  width: 100%;
  max-width: 460px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: #f8fafc;

  &__header {
    text-align: center;
  }

  &__brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
  }

  &__logo {
    font-size: 2rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  &__redirect-notice {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #c7d2fe;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    line-height: 1.4;
  }

  &__quick-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    padding: 0.75rem 0.85rem;
    border-radius: 12px;
  }

  &__quick-title {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
  }

  &__quick-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }

  &__success {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #6ee7b7;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }

  &__forgot {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  &__error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 0.65rem;
    border-radius: 10px;
    font-size: 0.85rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__label {
    font-size: 0.825rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  &__input {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 0.65rem 0.85rem;
    color: #ffffff;
    font-size: 0.875rem;
    outline: none;

    &:focus {
      border-color: #6366f1;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
      -webkit-text-fill-color: #f8fafc !important;
      border-radius: 8px;
    }
  }

  &__submit-btn {
    background: #6366f1;
    color: #ffffff;
    border: none;
    padding: 0.75rem;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: #4f46e5;
    }
  }

  &__back-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.8rem;
    cursor: pointer;
    text-align: center;

    &:hover {
      color: #ffffff;
    }
  }
}

.btn-quick {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }

  &--student:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    color: #6ee7b7;
  }

  &--author:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    color: #e9d5ff;
  }

  &--admin:hover {
    background: rgba(234, 179, 8, 0.2);
    border-color: rgba(234, 179, 8, 0.4);
    color: #fef08a;
  }
}
</style>
