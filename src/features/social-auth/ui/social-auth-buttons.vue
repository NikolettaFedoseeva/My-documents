<script setup lang="ts">
// #region defineEmits
const emit = defineEmits<{
  (e: 'select-provider', provider: 'github' | 'google' | 'yandex'): void
}>()
// #endregion defineEmits
</script>

<template>
  <div class="social-auth-buttons">
    <div class="social-auth-buttons__divider">
      <span>Или войдите через</span>
    </div>

    <div class="social-auth-buttons__grid">
      <button
        type="button"
        class="social-auth-buttons__btn social-auth-buttons__btn--github"
        title="Войти через GitHub"
        @click="emit('select-provider', 'github')"
      >
        <span class="social-auth-buttons__icon">🐙</span>
        <span>GitHub</span>
      </button>

      <button
        type="button"
        class="social-auth-buttons__btn social-auth-buttons__btn--google"
        title="Войти через Google"
        @click="emit('select-provider', 'google')"
      >
        <span class="social-auth-buttons__icon">🌐</span>
        <span>Google</span>
      </button>

      <button
        type="button"
        class="social-auth-buttons__btn social-auth-buttons__btn--yandex"
        title="Войти через Yandex"
        @click="emit('select-provider', 'yandex')"
      >
        <span class="social-auth-buttons__icon">🔴</span>
        <span>Yandex</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.social-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.25rem;

  &__divider {
    position: relative;
    text-align: center;
    font-size: 0.75rem;
    color: #64748b;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 0.5rem;
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      transform: translateY(-1px);
    }
  }

  &__icon {
    font-size: 0.95rem;
  }
}
</style>
