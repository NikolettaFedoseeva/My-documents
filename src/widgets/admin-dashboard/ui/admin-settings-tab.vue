<script setup lang="ts">
import { SystemSettings } from '../model/use-admin-dashboard'

// #region defineProps
interface Props {
  settings: SystemSettings
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'save'): void
  (e: 'reset-demo'): void
}>()
// #endregion defineEmits

const confirmReset = (): void => {
  if (
    window.confirm(
      'Внимание! Будут сброшены все добавленные вами курсы, отредактированные статьи и прогресс обучения. Восстановить начальные демо-данные?'
    )
  ) {
    emit('reset-demo')
  }
}
</script>

<template>
  <div class="admin-settings-tab">
    <div class="settings-card">
      <h3 class="settings-title">⚙️ Основные параметры платформы</h3>

      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">Открытая регистрация</span>
            <span class="setting-desc">Разрешить новым пользователям регистрироваться самостоятельно</span>
          </div>
          <label class="switch">
            <input
              v-model="props.settings.registrationEnabled"
              type="checkbox"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">Роль по умолчанию</span>
            <span class="setting-desc">Присваивается автоматически при успешной регистрации</span>
          </div>
          <select
            v-model="props.settings.defaultRole"
            class="setting-select"
          >
            <option value="student">🎓 Студент</option>
            <option value="guest">👤 Гость</option>
            <option value="author">✍️ Автор</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">Обязательная верификация Email</span>
            <span class="setting-desc">Требовать подтверждение почты перед доступом к тестам</span>
          </div>
          <label class="switch">
            <input
              v-model="props.settings.requireEmailVerification"
              type="checkbox"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">Режим технического обслуживания</span>
            <span class="setting-desc">Ограничивает доступ для студентов на время обновлений</span>
          </div>
          <label class="switch">
            <input
              v-model="props.settings.maintenanceMode"
              type="checkbox"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">Лимит размера файлов (МБ)</span>
            <span class="setting-desc">Максимальный объем иллюстраций и медиа в статьях</span>
          </div>
          <input
            v-model.number="props.settings.maxUploadSizeMb"
            type="number"
            class="setting-input-number"
            min="1"
            max="100"
          />
        </div>
      </div>

      <div class="settings-actions">
        <button
          type="button"
          class="btn-save"
          @click="emit('save')"
        >
          💾 Сохранить настройки
        </button>
      </div>
    </div>

    <!-- Зона сброса данных -->
    <div class="settings-card settings-card--danger">
      <h3 class="danger-title">⚠️ Опасная зона: Сброс демо-данных</h3>
      <p class="danger-desc">
        Очищает локальные изменения курсов, созданные в конструкторе автора, и восстанавливает начальные статьи Bookish Codex и базу пользователей.
      </p>

      <button
        type="button"
        class="btn-reset"
        @click="confirmReset"
      >
        🔄 Сбросить LocalStorage до заводских настроек
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-settings-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &--danger {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.04);
  }
}

.settings-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.setting-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
}

.setting-desc {
  font-size: 0.8rem;
  color: #94a3b8;
}

.setting-select,
.setting-input-number {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
}

.setting-input-number {
  width: 90px;
  text-align: center;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-save {
  background: #6366f1;
  color: #ffffff;
  border: none;
  padding: 0.7rem 1.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

  &:hover {
    background: #4f46e5;
    transform: translateY(-2px);
  }
}

.danger-title {
  color: #f87171;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

.danger-desc {
  font-size: 0.85rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.5;
}

.btn-reset {
  align-self: flex-start;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.65rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ef4444;
    color: #ffffff;
  }
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
}

input:checked + .slider {
  background-color: #6366f1;
}

input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
