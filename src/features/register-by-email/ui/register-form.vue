<script setup lang="ts">
import { ref, computed } from 'vue'
import { RegisterPayload } from '@/entities/auth'

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
  (e: 'submit', payload: RegisterPayload): void
}>()
// #endregion defineEmits

// #region refs
const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
const role = ref<'student' | 'author'>('student')
const showPassword = ref<boolean>(false)
// #endregion refs

// #region computed (Индикатор сложности пароля)
const passwordStrength = computed<'weak' | 'medium' | 'strong' | ''>(() => {
  const p = password.value
  if (!p) return ''
  if (p.length < 6) return 'weak'
  if (p.length >= 6 && (/\d/.test(p) || /[A-Z]/.test(p))) return 'strong'
  return 'medium'
})

const passwordStrengthText = computed<string>(() => {
  switch (passwordStrength.value) {
    case 'weak':
      return 'Слабый пароль'
    case 'medium':
      return 'Средняя сложность'
    case 'strong':
      return 'Надёжный пароль 💪'
    default:
      return ''
  }
})
// #endregion computed

// #region Функции
const toggleShowPassword = (): void => {
  showPassword.value = !showPassword.value
}

const onSubmit = (): void => {
  if (props.isSubmitting) return
  emit('submit', {
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    role: role.value,
  })
}
// #endregion Функции
</script>

<template>
  <form class="register-form" @submit.prevent="onSubmit">
    <div v-if="props.errorMessage" class="register-form__error">
      <span>⚠️ {{ props.errorMessage }}</span>
    </div>

    <!-- Выбор роли -->
    <div class="register-form__role-selector">
      <button
        type="button"
        class="register-form__role-btn"
        :class="{ 'register-form__role-btn--active': role === 'student' }"
        @click="role = 'student'"
      >
        <span>👨‍🎓 Студент</span>
      </button>
      <button
        type="button"
        class="register-form__role-btn"
        :class="{ 'register-form__role-btn--active': role === 'author' }"
        @click="role = 'author'"
      >
        <span>✍️ Автор курсов</span>
      </button>
    </div>

    <!-- Поле Имя -->
    <div class="register-form__field">
      <label class="register-form__label">Полное имя</label>
      <div class="register-form__input-wrapper">
        <span class="register-form__input-icon">👤</span>
        <input
          v-model="name"
          type="text"
          required
          class="register-form__input"
          placeholder="Иван Иванов"
        />
      </div>
    </div>

    <!-- Поле Email -->
    <div class="register-form__field">
      <label class="register-form__label">Email</label>
      <div class="register-form__input-wrapper">
        <span class="register-form__input-icon">✉️</span>
        <input
          v-model="email"
          type="email"
          required
          class="register-form__input"
          placeholder="name@example.com"
        />
      </div>
    </div>

    <!-- Поле Пароль -->
    <div class="register-form__field">
      <label class="register-form__label">Пароль</label>
      <div class="register-form__input-wrapper">
        <span class="register-form__input-icon">🔒</span>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="register-form__input"
          placeholder="Минимум 6 символов"
        />
        <button
          type="button"
          class="register-form__eye-btn"
          @click="toggleShowPassword"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>

      <!-- Индикатор сложности -->
      <div v-if="passwordStrength" class="register-form__strength">
        <div :class="['register-form__strength-bar', `register-form__strength-bar--${passwordStrength}`]"></div>
        <span class="register-form__strength-text">{{ passwordStrengthText }}</span>
      </div>
    </div>

    <!-- Поле Подтверждение пароля -->
    <div class="register-form__field">
      <label class="register-form__label">Подтверждение пароля</label>
      <div class="register-form__input-wrapper">
        <span class="register-form__input-icon">🔑</span>
        <input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          required
          class="register-form__input"
          placeholder="Повторите пароль"
        />
        <button
          type="button"
          class="register-form__eye-btn"
          title="Показать / Скрыть пароль"
          @click="toggleShowPassword"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>
    </div>

    <!-- Кнопка Регистрации -->
    <button
      type="submit"
      class="register-form__submit-btn"
      :disabled="props.isSubmitting"
    >
      <span v-if="props.isSubmitting" class="register-form__spinner"></span>
      <span>{{ props.isSubmitting ? 'Создание аккаунта...' : 'Зарегистрироваться' }}</span>
    </button>
  </form>
</template>

<style scoped lang="scss">
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  &__error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    font-size: 0.85rem;
  }

  &__role-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    padding: 0.25rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__role-btn {
    background: transparent;
    border: none;
    padding: 0.45rem;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #cbd5e1;
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
    padding: 0.6rem 0;
    font-size: 0.85rem;

    &::placeholder {
      color: #64748b;
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

  &__eye-btn {
    background: transparent;
    border: none;
    font-size: 0.95rem;
    cursor: pointer;
  }

  &__strength {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.2rem;
  }

  &__strength-bar {
    height: 4px;
    flex: 1;
    border-radius: 2px;

    &--weak {
      background: #ef4444;
    }

    &--medium {
      background: #f59e0b;
    }

    &--strong {
      background: #10b981;
    }
  }

  &__strength-text {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  &__submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: #ffffff;
    padding: 0.75rem;
    font-size: 0.925rem;
    font-weight: 700;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    transition: all 0.25s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
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
