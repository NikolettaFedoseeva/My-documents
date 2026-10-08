<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CourseCodex } from '@/entities/doc'

// #region defineProps
interface Props {
  courses: CourseCodex[]
  searchQuery: string
  statusFilter: string
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:statusFilter', val: string): void
  (e: 'toggle-publish', courseId: string): void
  (e: 'delete-course', courseId: string): void
}>()
// #endregion defineEmits

const router = useRouter()

// #region Функции
const openCourseInViewer = (course: CourseCodex): void => {
  router.push({ path: '/docs', query: { course: course.slug || course.id } })
}

const confirmDelete = (course: CourseCodex): void => {
  if (window.confirm(`Вы уверены, что хотите удалить курс «${course.title}» со всеми модулями и главами?`)) {
    emit('delete-course', course.id)
  }
}
// #endregion Функции
</script>

<template>
  <div class="admin-courses-tab">
    <!-- Тулбар -->
    <div class="admin-courses-tab__toolbar">
      <div class="admin-courses-tab__search-box">
        <span class="search-icon">🔍</span>
        <input
          :value="props.searchQuery"
          type="text"
          class="admin-courses-tab__search-input"
          placeholder="Поиск по курсу, дисциплине или автору..."
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="admin-courses-tab__filters">
        <select
          :value="props.statusFilter"
          class="admin-courses-tab__select"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="all">Все статусы</option>
          <option value="published">Опубликованные</option>
          <option value="draft">Черновики / Скрытые</option>
        </select>
      </div>
    </div>

    <!-- Таблица курсов -->
    <div class="admin-courses-tab__table-card">
      <table class="admin-courses-table">
        <thead>
          <tr>
            <th>Курс / Дисциплина</th>
            <th>Автор</th>
            <th>Категория</th>
            <th>Структура</th>
            <th>Статус публикации</th>
            <th class="text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in props.courses" :key="course.id">
            <td>
              <div class="course-cell">
                <span class="course-icon">{{ course.icon || '📚' }}</span>
                <div class="course-meta">
                  <span class="course-title">{{ course.title }}</span>
                  <span class="course-slug">/docs?course={{ course.slug }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="author-cell">
                <img :src="course.author.avatar" :alt="course.author.name" class="author-avatar" />
                <span class="author-name">{{ course.author.name }}</span>
              </div>
            </td>
            <td>
              <span class="category-pill">{{ course.category }}</span>
            </td>
            <td>
              <div class="structure-cell">
                <span>{{ course.modules?.length || 0 }} мод.</span>
                <span class="text-muted">/ {{ course.totalChapters || 0 }} глав</span>
              </div>
            </td>
            <td>
              <button
                type="button"
                class="status-toggle-btn"
                :class="course.isPublished ? 'status-toggle-btn--published' : 'status-toggle-btn--draft'"
                @click="emit('toggle-publish', course.id)"
              >
                <span>{{ course.isPublished ? '✓ Опубликован' : '👁️ Скрыт' }}</span>
              </button>
            </td>
            <td class="text-right">
              <div class="actions-group">
                <button
                  type="button"
                  class="btn-action btn-action--view"
                  title="Открыть в читалке"
                  @click="openCourseInViewer(course)"
                >
                  📖 Просмотр
                </button>
                <button
                  type="button"
                  class="btn-action btn-action--delete"
                  title="Удалить курс"
                  @click="confirmDelete(course)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="props.courses.length === 0">
            <td colspan="6" class="empty-cell">
              Курсы по заданному запросу не найдены.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-courses-tab {
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

.admin-courses-table {
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

.course-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.course-icon {
  font-size: 1.5rem;
}

.course-meta {
  display: flex;
  flex-direction: column;
}

.course-title {
  font-weight: 700;
  color: #ffffff;
}

.course-slug {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.category-pill {
  display: inline-block;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
}

.structure-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.text-muted {
  color: #64748b;
  font-weight: normal;
}

.status-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &--published {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.3);

    &:hover {
      background: rgba(16, 185, 129, 0.25);
    }
  }

  &--draft {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border-color: rgba(148, 163, 184, 0.2);

    &:hover {
      background: rgba(148, 163, 184, 0.2);
      color: #e2e8f0;
    }
  }
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &--view {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);

    &:hover {
      background: #6366f1;
      color: #ffffff;
    }
  }

  &--delete {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);

    &:hover {
      background: #ef4444;
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
