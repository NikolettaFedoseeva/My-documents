<script setup lang="ts">
import { ref } from 'vue'

// #region defineProps
interface Props {
  initialName?: string
  initialEmail?: string
  initialAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialName: 'Николай Админ',
  initialEmail: 'admin@lern.dev',
  initialAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
})
// #endregion defineProps

// #region refs
const name = ref<string>(props.initialName)
const email = ref<string>(props.initialEmail)
const avatar = ref<string>(props.initialAvatar)
const currentPassword = ref<string>('')
const newPassword = ref<string>('')
const isSaved = ref<boolean>(false)
// #endregion refs

// #region Функции
const onSave = (): void => {
  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 2500)
}
// #endregion Функции
</script>

<template>
  <form class="edit-profile-form" @submit.prevent="onSave">
    <div v-if="isSaved" class="edit-profile-form__success">
      <span>✓ Изменения профиля успешно сохранены!</span>
    </div>

    <!-- Аватар -->
    <div class="edit-profile-form__avatar-section">
      <img :src="avatar" :alt="name" class="edit-profile-form__avatar-preview" />
      <div class="edit-profile-form__avatar-meta">
        <span class="edit-profile-form__avatar-title">Фото профиля</span>
        <span class="edit-profile-form__avatar-hint">Рекомендуемый размер: 200x200px</span>
      </div>
    </div>

    <!-- Поле Имя -->
    <div class="edit-profile-form__field">
      <label class="edit-profile-form__label">Полное имя</label>
      <input v-model="name" type="text" class="edit-profile-form__input" />
    </div>

    <!-- Поле Email -->
    <div class="edit-profile-form__field">
      <label class="edit-profile-form__label">Email</label>
      <input v-model="email" type="email" class="edit-profile-form__input" />
    </div>

    <div class="edit-profile-form__divider"></div>

    <h4 class="edit-profile-form__subtitle">Безопасность</h4>

    <!-- Текущий пароль -->
    <div class="edit-profile-form__field">
      <label class="edit-profile-form__label">Текущий пароль</label>
      <input v-model="currentPassword" type="password" class="edit-profile-form__input" placeholder="••••••••" />
    </div>

    <!-- Новый пароль -->
    <div class="edit-profile-form__field">
      <label class="edit-profile-form__label">Новый пароль</label>
      <input v-model="newPassword" type="password" class="edit-profile-form__input" placeholder="Введите новый пароль" />
    </div>

    <button type="submit" class="edit-profile-form__btn">
      Сохранить изменения
    </button>
  </form>
</template>

<style scoped lang="scss">
.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 520px;

  &__success {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #6ee7b7;
    padding: 0.65rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__avatar-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 0.5rem;
  }

  &__avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #6366f1;
  }

  &__avatar-meta {
    display: flex;
    flex-direction: column;
  }

  &__avatar-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
  }

  &__avatar-hint {
    font-size: 0.75rem;
    color: #64748b;
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
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 0.65rem 0.85rem;
    color: #ffffff;
    font-size: 0.875rem;
    outline: none;

    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
    }
  }

  &__divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.5rem 0;
  }

  &__subtitle {
    font-size: 1rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
  }

  &__btn {
    align-self: flex-start;
    background: #6366f1;
    color: #ffffff;
    border: none;
    padding: 0.65rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.5rem;

    &:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
  }
}
</style>
