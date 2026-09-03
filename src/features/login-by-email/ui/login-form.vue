<script setup lang="ts">
import { ref } from 'vue'
import { LoginPayload } from '@/entities/auth'

// #region defineProps
interface Props {
  isSubmitting?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  errorMessage: '',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'submit', payload: LoginPayload): void
  (e: 'forgot-password'): void
}>()
// #endregion defineEmits

// #region refs
const email = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(true)
const showPassword = ref<boolean>(false)
// #endregion refs

// #region Функции
const toggleShowPassword = (): void => {
  showPassword.value = !showPassword.value
}

const onSubmit = (): void => {
  if (props.isSubmitting) return
  emit('submit', {
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value,
  })
}
// #endregion Функции
</script>

<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <div v-if="props.errorMessage" class="login-form__error">
      <span>⚠️ {{ props.errorMessage }}</span>
    </div>

    <!-- Поле Email -->
    <div class="login-form__field">
      <label class="login-form__label">Email / Логин</label>
      <div class="login-form__input-wrapper">
        <span class="login-form__input-icon">✉️</span>
        <input
          v-model="email"
          type="email"
          required
          class="login-form__input"
          placeholder="name@example.com"
        />
      </div>
    </div>

    <!-- Поле Пароль -->
    <div class="login-form__field">
      <div class="login-form__label-row">
        <label class="login-form__label">Пароль</label>
        <button
          type="button"
          class="login-form__forgot-btn"
          @click="emit('forgot-password')"
        >
          Забыли пароль?
        </button>
      </div>

      <div class="login-form__input-wrapper">
        <span class="login-form__input-icon">🔒</span>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="login-form__input"
          placeholder="••••••••"
        />
        <button
          type="button"
          class="login-form__eye-btn"
          title="Показать / Скрыть пароль"
          @click="toggleShowPassword"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>
    </div>

    <!-- Запомнить меня -->
    <div class="login-form__remember">
      <label class="login-form__checkbox-label">
        <input v-model="rememberMe" type="checkbox" class="login-form__checkbox" />
        <span>Запомнить меня</span>
      </label>
    </div>

    <!-- Кнопка Входа -->
    <button
      type="submit"
      class="login-form__submit-btn"
      :disabled="props.isSubmitting"
    >
      <span v-if="props.isSubmitting" class="login-form__spinner"></span>
      <span>{{ props.isSubmitting ? 'Вход в аккаунт...' : 'Войти' }}</span>
    </button>
  </form>
</template>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    font-size: 0.85rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 0.825rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  &__forgot-btn {
    background: transparent;
    border: none;
    color: #818cf8;
    font-size: 0.775rem;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #a5b4fc;
      text-decoration: underline;
    }
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 0 0.75rem;
    transition: all 0.2s ease;
    overflow: hidden;

    &:focus-within {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
    }
  }

  &__input-icon {
    font-size: 0.9rem;
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  &__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f8fafc;
    padding: 0.65rem 0;
    font-size: 0.875rem;

    &::placeholder {
      color: #64748b;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
      -webkit-text-fill-color: #f8fafc !important;
      background-color: #0f172a !important;
    }
  }

  &__eye-btn {
    background: transparent;
    border: none;
    font-size: 0.95rem;
    cursor: pointer;
    padding: 0.2rem;
    opacity: 0.8;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__remember {
    display: flex;
    align-items: center;
  }

  &__checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.825rem;
    color: #94a3b8;
    cursor: pointer;
  }

  &__checkbox {
    accent-color: #6366f1;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  &__submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    color: #ffffff;
    padding: 0.75rem;
    font-size: 0.925rem;
    font-weight: 700;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    transition: all 0.25s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
