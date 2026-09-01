<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UiButton,
  UiInput,
  UiCard,
  UiTabs,
  UiToggle,
  UiAlert,
  type TabItem,
} from 'lern-ui-kit'

const router = useRouter()

const activeTab = ref<'login' | 'register'>('login')
const authTabs: TabItem[] = [
  { id: 'login', label: 'Вход в аккаунт', icon: '🔑' },
  { id: 'register', label: 'Регистрация', icon: '✨' },
]

const email = ref<string>('')
const password = ref<string>('')
const name = ref<string>('')

// Multi-role selection state
const isRoleStudent = ref<boolean>(true)
const isRoleAdmin = ref<boolean>(false)

// State for multi-role user login selection
const showRoleSelection = ref<boolean>(false)

const onLogin = () => {
  if (!email.value || !password.value) {
    alert('Пожалуйста, введите email и пароль')
    return
  }

  // If user has multiple roles (e.g. both Student and Admin)
  if (isRoleStudent.value && isRoleAdmin.value) {
    showRoleSelection.value = true
  } else if (isRoleAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/cabinet')
  }
}

const onRegister = () => {
  if (!email.value || !password.value) {
    alert('Заполните обязательные поля')
    return
  }
  // Redirect to role selection or cabinet
  if (isRoleStudent.value && isRoleAdmin.value) {
    showRoleSelection.value = true
  } else if (isRoleAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/cabinet')
  }
}

const selectRoleCabinet = (target: 'cabinet' | 'admin') => {
  if (target === 'admin') {
    router.push('/admin')
  } else {
    router.push('/cabinet')
  }
}

const goToPublicDocs = () => {
  router.push('/docs')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <UiCard variant="glass" padding="lg">
        <div class="auth-header">
          <h2>🔐 Авторизация Lern Codex</h2>
          <p>Личный кабинет с сохранением прогресса в Supabase</p>
        </div>

        <UiTabs
          v-if="!showRoleSelection"
          v-model="activeTab"
          :items="authTabs"
          full-width
          style="margin-bottom: 1.5rem"
        />

        <!-- Role Selection Modal / Screen for Multi-Role Users -->
        <div v-if="showRoleSelection" class="role-selection-box">
          <UiAlert variant="info" title="Выбор кабинета входа">
            У вашего аккаунта несколько активных ролей. Выберите кабинет для текущей сессии:
          </UiAlert>

          <div class="role-buttons">
            <UiButton
              variant="primary"
              size="lg"
              style="width: 100%"
              @click="selectRoleCabinet('cabinet')"
            >
              🎓 Войти в Учебный Кабинет
            </UiButton>

            <UiButton
              variant="secondary"
              size="lg"
              style="width: 100%"
              @click="selectRoleCabinet('admin')"
            >
              🛠 Войти в Панель Администратора
            </UiButton>
          </div>
        </div>

        <!-- Standard Login / Register Form -->
        <form
          v-else
          @submit.prevent="activeTab === 'login' ? onLogin() : onRegister()"
          class="auth-form"
        >
          <UiInput
            v-if="activeTab === 'register'"
            v-model="name"
            label="Ваше имя"
            placeholder="Анна Смирнова"
          >
            <template #icon-left>👤</template>
          </UiInput>

          <UiInput
            v-model="email"
            label="Электронная почта"
            placeholder="name@example.com"
          >
            <template #icon-left>✉️</template>
          </UiInput>

          <UiInput
            v-model="password"
            label="Пароль"
            type="password"
            placeholder="••••••••"
          >
            <template #icon-left>🔒</template>
          </UiInput>

          <!-- Roles selection section -->
          <div class="role-select-section">
            <label class="role-select-label">Назначение ролей профиля:</label>
            <div class="role-toggles">
              <UiToggle v-model="isRoleStudent" label="🎓 Студент" />
              <UiToggle v-model="isRoleAdmin" label="🛠 Администратор / Преподаватель" />
            </div>
          </div>

          <UiButton variant="primary" size="lg" style="width: 100%">
            {{ activeTab === 'login' ? 'Войти в кабинет →' : 'Зарегистрироваться →' }}
          </UiButton>
        </form>

        <div class="auth-footer">
          <button class="public-docs-link" @click="goToPublicDocs">
            📖 Читать публичную документацию без авторизации
          </button>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
}

.auth-box {
  width: 100%;
  max-width: 460px;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-main);
  }

  p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.role-select-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-card-hover);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.role-select-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}

.role-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.role-selection-box {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.role-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.public-docs-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
}
</style>