<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiInput, UiCard, UiTabs, type TabItem } from 'lern-ui-kit'

const activeTab = ref<'login' | 'register'>('login')
const authTabs: TabItem[] = [
  { id: 'login', label: 'Вход в аккаунт', icon: '🔑' },
  { id: 'register', label: 'Регистрация', icon: '✨' },
]

const email = ref('')
const password = ref('')
const name = ref('')

const onSubmit = () => {
  alert('Успешный вход: ' + email.value)
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <UiCard variant="glass" padding="lg">
        <div class="auth-header">
          <h2>🔐 Авторизация Lern Codex</h2>
          <p>Войдите, чтобы сохранить ваш прогресс и ударный режим</p>
        </div>

        <UiTabs v-model="activeTab" :items="authTabs" full-width style="margin-bottom: 1.5rem" />

        <form @submit.prevent="onSubmit" class="auth-form">
          <UiInput v-if="activeTab === 'register'" v-model="name" label="Ваше имя" placeholder="Анна Смирнова">
            <template #icon-left>👤</template>
          </UiInput>

          <UiInput v-model="email" label="Электронная почта" placeholder="name@example.com">
            <template #icon-left>✉️</template>
          </UiInput>

          <UiInput v-model="password" label="Пароль" type="password" placeholder="••••••••">
            <template #icon-left>🔒</template>
          </UiInput>

          <UiButton variant="primary" size="lg" style="width: 100%">
            {{ activeTab === 'login' ? 'Войти в кабинет →' : 'Создать аккаунт →' }}
          </UiButton>
        </form>
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
  padding: 2rem 1rem;
}
.auth-box {
  width: 100%;
  max-width: 440px;
}
.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
  h2 { font-size: 1.6rem; font-weight: 800; color: var(--text-main); }
  p { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem; }
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>