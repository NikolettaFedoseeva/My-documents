<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore, type AppNotification } from '@/entities/notification'

// #region defineProps
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()
// #endregion defineEmits

// #region router & store
const router = useRouter()
const notificationStore = useNotificationStore()
// #endregion router & store

// #region refs
const activeFilter = ref<'all' | 'unread'>('all')
// #endregion refs

// #region computed
const filteredNotifications = computed<AppNotification[]>(() => {
  if (activeFilter.value === 'unread') {
    return notificationStore.notifications.filter((n) => !n.isRead)
  }
  return notificationStore.notifications
})
// #endregion computed

// #region Функции
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const getBadgeIcon = (type: string): string => {
  switch (type) {
    case 'achievement':
      return '🏆'
    case 'assignment':
      return '📝'
    case 'warning':
      return '🔥'
    case 'success':
      return '✓'
    case 'error':
      return '⚠️'
    case 'info':
    default:
      return 'ℹ️'
  }
}

const handleClickItem = (item: AppNotification) => {
  notificationStore.markAsRead(item.id)
  if (item.link) {
    router.push(item.link)
    close()
  }
}
// #endregion Функции
</script>

<template>
  <div v-if="props.modelValue" class="notif-popover-wrapper">
    <!-- Click outside backdrop (невидимый) -->
    <div class="notif-backdrop" @click="close"></div>

    <div class="notif-popover">
      <!-- Шапка панели уведомлений -->
      <div class="notif-popover__header">
        <div class="notif-popover__header-title">
          <span class="notif-popover__bell-icon">🔔</span>
          <h4>Уведомления</h4>
          <span
            v-if="notificationStore.unreadCount > 0"
            class="notif-popover__unread-badge"
          >
            {{ notificationStore.unreadCount }} новых
          </span>
        </div>

        <div class="notif-popover__header-actions">
          <button
            v-if="notificationStore.unreadCount > 0"
            type="button"
            class="notif-popover__btn-action"
            title="Отметить все как прочитанные"
            @click="notificationStore.markAllAsRead"
          >
            ✓ Все прочитаны
          </button>
          <button
            type="button"
            class="notif-popover__btn-close"
            title="Закрыть"
            @click="close"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Вкладки фильтрации -->
      <div class="notif-popover__tabs">
        <button
          type="button"
          class="notif-popover__tab"
          :class="{ 'notif-popover__tab--active': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          Все ({{ notificationStore.notifications.length }})
        </button>
        <button
          type="button"
          class="notif-popover__tab"
          :class="{ 'notif-popover__tab--active': activeFilter === 'unread' }"
          @click="activeFilter = 'unread'"
        >
          Непрочитанные ({{ notificationStore.unreadCount }})
        </button>
      </div>

      <!-- Список уведомлений -->
      <div class="notif-popover__list">
        <div v-if="filteredNotifications.length === 0" class="notif-popover__empty">
          <span class="notif-popover__empty-icon">🔕</span>
          <p>Нет {{ activeFilter === 'unread' ? 'непрочитанных' : '' }} уведомлений</p>
        </div>

        <div
          v-for="item in filteredNotifications"
          :key="item.id"
          class="notif-item"
          :class="{ 'notif-item--unread': !item.isRead }"
          @click="handleClickItem(item)"
        >
          <div class="notif-item__badge" :class="`notif-item__badge--${item.type}`">
            {{ getBadgeIcon(item.type) }}
          </div>

          <div class="notif-item__body">
            <div class="notif-item__title-row">
              <span class="notif-item__title">{{ item.title }}</span>
              <span v-if="!item.isRead" class="notif-item__dot"></span>
            </div>
            <p class="notif-item__message">{{ item.message }}</p>
            <span class="notif-item__time">{{ item.timestamp }}</span>
          </div>

          <button
            type="button"
            class="notif-item__del-btn"
            title="Удалить уведомление"
            @click.stop="notificationStore.removeNotification(item.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Футер панели -->
      <div v-if="notificationStore.notifications.length > 0" class="notif-popover__footer">
        <button
          type="button"
          class="notif-popover__clear-btn"
          @click="notificationStore.clearAllNotifications"
        >
          Очистить все уведомления
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notif-popover-wrapper {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  z-index: 2000;
}

.notif-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
}

.notif-popover {
  position: relative;
  z-index: 2;
  width: 380px;
  max-width: calc(100vw - 32px);
  background: #0b1120;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popover-drop 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.1rem;
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    &-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #f8fafc;
      }
    }
  }

  &__bell-icon {
    font-size: 1.1rem;
  }

  &__unread-badge {
    font-size: 0.7rem;
    font-weight: 700;
    background: #6366f1;
    color: #ffffff;
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__btn-action {
    background: transparent;
    border: none;
    color: #818cf8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
    }
  }

  &__btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: color 0.15s;

    &:hover {
      color: #f8fafc;
    }
  }

  &__tabs {
    display: flex;
    padding: 0.4rem 0.6rem;
    background: rgba(15, 23, 42, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 0.4rem;
  }

  &__tab {
    flex: 1;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;

    &--active {
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    &:hover:not(&--active) {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.04);
    }
  }

  &__list {
    max-height: 380px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  &__empty {
    padding: 2.5rem 1rem;
    text-align: center;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    &-icon {
      font-size: 2.2rem;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
    }
  }

  &__footer {
    padding: 0.6rem;
    background: rgba(15, 23, 42, 0.7);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    text-align: center;
  }

  &__clear-btn {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: #ef4444;
    }
  }
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &--unread {
    background: rgba(99, 102, 241, 0.07);

    &:hover {
      background: rgba(99, 102, 241, 0.12);
    }
  }

  &__badge {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);

    &--achievement {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    &--assignment {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    &--warning {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    &--success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    &--info {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  &__dot {
    width: 7px;
    height: 7px;
    background: #6366f1;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 8px #6366f1;
  }

  &__message {
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #94a3b8;
    word-break: break-word;
  }

  &__time {
    display: inline-block;
    margin-top: 0.3rem;
    font-size: 0.7rem;
    color: #475569;
  }

  &__del-btn {
    opacity: 0;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.2rem;
    transition: opacity 0.15s, color 0.15s;

    &:hover {
      color: #ef4444;
    }
  }

  &:hover &__del-btn {
    opacity: 1;
  }
}

@keyframes popover-drop {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
