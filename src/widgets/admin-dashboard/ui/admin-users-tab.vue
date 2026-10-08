<script setup lang="ts">
import { User, UserRole } from '@/entities/user'

// #region defineProps
interface Props {
  users: User[]
  searchQuery: string
  roleFilter: string
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:roleFilter', val: string): void
  (e: 'change-role', userId: string, newRole: UserRole): void
  (e: 'toggle-ban', userId: string): void
}>()
// #endregion defineEmits

// #region Функции
const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '👑 Администратор'
    case 'author':
      return '✍️ Автор курсов'
    case 'teacher':
      return '🎓 Преподаватель'
    case 'student':
      return '🎒 Студент'
    case 'guest':
      return '👤 Гость'
    default:
      return role
  }
}
// #endregion Функции
</script>

<template>
  <div class="admin-users-tab">
    <!-- Панель фильтров и поиска -->
    <div class="admin-users-tab__toolbar">
      <div class="admin-users-tab__search-box">
        <span class="search-icon">🔍</span>
        <input
          :value="props.searchQuery"
          type="text"
          class="admin-users-tab__search-input"
          placeholder="Поиск по имени, email или роли..."
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="admin-users-tab__filters">
        <select
          :value="props.roleFilter"
          class="admin-users-tab__select"
          @change="emit('update:roleFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="all">Все роли</option>
          <option value="student">Только студенты</option>
          <option value="author">Только авторы</option>
          <option value="teacher">Преподаватели</option>
          <option value="admin">Администраторы</option>
          <option value="guest">Гости</option>
        </select>
      </div>
    </div>

    <!-- Список пользователей -->
    <div class="admin-users-tab__table-card">
      <table class="admin-users-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль в системе</th>
            <th>Уровень & XP</th>
            <th>Статус</th>
            <th class="text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in props.users"
            :key="u.id"
            :class="{ 'user-row--banned': u.isBanned }"
          >
            <td>
              <div class="user-cell">
                <img :src="u.avatar" :alt="u.name" class="user-avatar" />
                <div class="user-info">
                  <span class="user-name">{{ u.name }}</span>
                  <span class="user-id">ID: {{ u.id }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="user-email">{{ u.email }}</span>
            </td>
            <td>
              <div class="role-selector-wrap">
                <select
                  :value="u.role"
                  class="role-select"
                  :class="`role-select--${u.role}`"
                  :disabled="u.isBanned"
                  @change="emit('change-role', u.id, ($event.target as HTMLSelectElement).value as UserRole)"
                >
                  <option value="student">🎓 Студент</option>
                  <option value="author">✍️ Автор</option>
                  <option value="teacher">👨‍🏫 Преподаватель</option>
                  <option value="admin">👑 Администратор</option>
                  <option value="guest">👤 Гость</option>
                </select>
              </div>
            </td>
            <td>
              <div class="xp-cell">
                <span class="level-badge">Lvl {{ u.level || 1 }}</span>
                <span class="xp-val">{{ u.xp || 0 }} XP</span>
              </div>
            </td>
            <td>
              <span
                v-if="u.isBanned"
                class="status-pill status-pill--banned"
              >
                🚫 Заблокирован
              </span>
              <span
                v-else
                class="status-pill"
                :class="u.status === 'online' ? 'status-pill--online' : 'status-pill--offline'"
              >
                {{ u.status === 'online' ? '🟢 В сети' : '⚪ Не в сети' }}
              </span>
            </td>
            <td class="text-right">
              <button
                type="button"
                class="btn-ban"
                :class="u.isBanned ? 'btn-ban--unban' : 'btn-ban--ban'"
                @click="emit('toggle-ban', u.id)"
              >
                {{ u.isBanned ? 'Разблокировать' : 'Заблокировать' }}
              </button>
            </td>
          </tr>

          <tr v-if="props.users.length === 0">
            <td colspan="6" class="empty-cell">
              Пользователи по заданному фильтру не найдены.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-users-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__search-box {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.6rem 1rem;
    flex: 1;
    min-width: 260px;
  }

  &__search-input {
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 0.9rem;
    width: 100%;

    &::placeholder {
      color: #64748b;
    }
  }

  &__select {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e2e8f0;
    padding: 0.65rem 1rem;
    border-radius: 12px;
    outline: none;
    font-size: 0.875rem;
    cursor: pointer;
  }

  &__table-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow-x: auto;
  }
}

.admin-users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;

  th {
    padding: 1rem 1.25rem;
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
    vertical-align: middle;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
}

.user-row--banned {
  opacity: 0.55;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #ffffff;
}

.user-id {
  font-size: 0.75rem;
  color: #64748b;
}

.user-email {
  color: #cbd5e1;
}

.role-select {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  outline: none;

  &--admin {
    border-color: rgba(234, 179, 8, 0.5);
    color: #fef08a;
  }

  &--author {
    border-color: rgba(168, 85, 247, 0.5);
    color: #e9d5ff;
  }

  &--teacher {
    border-color: rgba(59, 130, 246, 0.5);
    color: #bfdbfe;
  }

  &--student {
    border-color: rgba(16, 185, 129, 0.5);
    color: #a7f3d0;
  }
}

.xp-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-badge {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.xp-val {
  font-size: 0.8rem;
  color: #94a3b8;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;

  &--online {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }

  &--offline {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
  }

  &--banned {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }
}

.btn-ban {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &--ban {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover {
      background: #ef4444;
      color: #ffffff;
    }
  }

  &--unban {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);

    &:hover {
      background: #10b981;
      color: #ffffff;
    }
  }
}

.text-right {
  text-align: right;
}

.empty-cell {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}
</style>
