<script setup lang="ts">
import { useNotificationStore } from '@/entities/notification'

const notificationStore = useNotificationStore()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'warning':
      return '⚠️'
    case 'error':
      return '✕'
    case 'info':
    default:
      return 'ℹ️'
  }
}
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in notificationStore.toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-item--${toast.type}`"
      >
        <div class="toast-item__icon">
          {{ getIcon(toast.type) }}
        </div>

        <div class="toast-item__content">
          <div class="toast-item__title">{{ toast.title }}</div>
          <div class="toast-item__message">{{ toast.message }}</div>
        </div>

        <button
          type="button"
          class="toast-item__close"
          title="Закрыть"
          @click="notificationStore.removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 76px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
  max-width: 420px;
  width: calc(100% - 40px);
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15);
  color: #f8fafc;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &--success {
    border-left: 4px solid #10b981;
    .toast-item__icon {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
  }

  &--info {
    border-left: 4px solid #6366f1;
    .toast-item__icon {
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
  }

  &--warning {
    border-left: 4px solid #f59e0b;
    .toast-item__icon {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
  }

  &--error {
    border-left: 4px solid #ef4444;
    .toast-item__icon {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;
    margin-bottom: 0.2rem;
  }

  &__message {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.4;
    word-break: break-word;
  }

  &__close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0.2rem;
    line-height: 1;
    transition: color 0.15s;

    &:hover {
      color: #f8fafc;
    }
  }
}

/* Анимации тостов */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
