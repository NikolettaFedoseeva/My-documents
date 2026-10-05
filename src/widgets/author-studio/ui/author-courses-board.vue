<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { CourseCodex } from '@/entities/doc'

// #region defineProps
interface Props {
  courses: CourseCodex[]
  isLoading: boolean
}

const props = withDefaults(defineProps<Props>(), {
  courses: () => [],
  isLoading: false,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'select-course', courseId: string): void
  (e: 'create-course'): void
  (e: 'delete-course', courseId: string): void
  (e: 'reset-defaults'): void
}>()
// #endregion defineEmits

const router = useRouter()

// #region refs
const searchQuery = ref<string>('')
const selectedCategoryFilter = ref<string>('all')
// #endregion refs

// #region computed
const uniqueCategories = computed<string[]>(() => {
  const cats = new Set(props.courses.map((c) => c.category))
  return Array.from(cats).filter(Boolean)
})

const filteredCourses = computed<CourseCodex[]>(() => {
  let list = props.courses

  if (selectedCategoryFilter.value !== 'all') {
    list = list.filter((c) => c.category === selectedCategoryFilter.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  return list
})

const totalChaptersCount = computed<number>(() => {
  return props.courses.reduce((sum, c) => sum + (c.totalChapters || 0), 0)
})

const publishedCount = computed<number>(() => {
  return props.courses.filter((c) => c.isPublished).length
})

const getLevelText = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'Начинающий'
    case 'advanced':
      return 'Продвинутый'
    default:
      return 'Средний'
  }
}
// #endregion computed

// #region Функции
const onOpenReader = (course: CourseCodex) => {
  router.push({ path: '/docs', query: { course: course.id } })
}
// #endregion Функции
</script>

<template>
  <div class="author-courses-board">
    <!-- Верхний баннер и статистика -->
    <header class="board-header">
      <div class="board-header__info">
        <div class="header-badge">
          <span class="badge-icon">📚</span>
          <span>Мультикурсовая платформа LERN</span>
        </div>
        <h1 class="header-title">Реестр курсов & Баз знаний</h1>
        <p class="header-subtitle">
          Создавайте и публикуйте интерактивные курсы на любые темы: от веб-разработки до баз данных.
          Каждый курс получает своё Дерево Знаний, 3D-тренажёры и проверочные тесты.
        </p>
      </div>

      <div class="board-header__actions">
        <button
          type="button"
          class="btn-primary"
          @click="emit('create-course')"
        >
          <span class="btn-icon">+</span>
          <span>Создать новый курс</span>
        </button>

        <button
          type="button"
          class="btn-secondary"
          title="Сбросить все курсы к эталонам"
          @click="emit('reset-defaults')"
        >
          <span>↺ Сбросить к эталонам</span>
        </button>
      </div>
    </header>

    <!-- Информационные метрики -->
    <div class="board-metrics">
      <div class="metric-card">
        <span class="metric-icon">🎓</span>
        <div class="metric-info">
          <span class="metric-value">{{ courses.length }}</span>
          <span class="metric-label">Всего курсов</span>
        </div>
      </div>

      <div class="metric-card">
        <span class="metric-icon">📜</span>
        <div class="metric-info">
          <span class="metric-value">{{ totalChaptersCount }}</span>
          <span class="metric-label">Опубликовано глав</span>
        </div>
      </div>

      <div class="metric-card">
        <span class="metric-icon">🌟</span>
        <div class="metric-info">
          <span class="metric-value">{{ publishedCount }}</span>
          <span class="metric-label">Активных дисциплин</span>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="board-toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по курсам, авторам, тегам..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-btn"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>

      <div class="category-pills">
        <button
          type="button"
          class="pill-btn"
          :class="{ 'pill-btn--active': selectedCategoryFilter === 'all' }"
          @click="selectedCategoryFilter = 'all'"
        >
          Все категории
        </button>
        <button
          v-for="cat in uniqueCategories"
          :key="cat"
          type="button"
          class="pill-btn"
          :class="{ 'pill-btn--active': selectedCategoryFilter === cat }"
          @click="selectedCategoryFilter = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Список курсов -->
    <div v-if="filteredCourses.length === 0" class="empty-state">
      <span class="empty-icon">📂</span>
      <h3>Курсы не найдены</h3>
      <p>Попробуйте изменить поисковый запрос или создайте свой первый курс</p>
      <button type="button" class="btn-primary" @click="emit('create-course')">
        + Создать курс
      </button>
    </div>

    <div v-else class="courses-grid">
      <article
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card"
      >
        <div class="course-card__banner">
          <span class="course-icon">{{ course.icon || '📚' }}</span>
          <div class="course-badges">
            <span class="category-badge">{{ course.category }}</span>
            <span class="level-badge" :class="`level-badge--${course.level}`">
              {{ getLevelText(course.level) }}
            </span>
          </div>
        </div>

        <div class="course-card__body">
          <h2 class="course-title">{{ course.title }}</h2>
          <p class="course-desc">{{ course.description }}</p>

          <div class="course-stats">
            <span class="stat-item">
              <span class="stat-icon">📁</span>
              <span>{{ course.modules.length }} модулей</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">📜</span>
              <span>{{ course.totalChapters || course.modules.reduce((s, m) => s + m.items.length, 0) }} глав</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">⏱️</span>
              <span>~{{ course.estimatedHours || 3 }} ч.</span>
            </span>
          </div>

          <div v-if="course.tags && course.tags.length > 0" class="course-tags">
            <span v-for="tag in course.tags" :key="tag" class="tag-chip">
              #{{ tag }}
            </span>
          </div>
        </div>

        <div class="course-card__footer">
          <button
            type="button"
            class="action-btn action-btn--edit"
            @click="emit('select-course', course.id)"
          >
            <span>✏️ Редактировать курс</span>
          </button>

          <button
            type="button"
            class="action-btn action-btn--view"
            title="Открыть в режиме чтения"
            @click="onOpenReader(course)"
          >
            <span>👁️ Читать</span>
          </button>

          <button
            type="button"
            class="action-btn action-btn--delete"
            title="Удалить курс"
            @click="emit('delete-course', course.id)"
          >
            <span>🗑️</span>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.author-courses-board {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

// Шапка
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;

  &__info {
    max-width: 720px;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary, #6366f1);
  border: 1px solid var(--border-color-glow, rgba(99, 102, 241, 0.25));
  margin-bottom: 0.75rem;
}

.header-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text-main, #0f172a);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 0.98rem;
  line-height: 1.55;
  color: var(--color-text-muted, #64748b);
  margin: 0;
}

// Кнопки действий
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--btn-primary-text, #ffffff);
  background: var(--btn-primary-bg, var(--primary, #6366f1));
  border: none;
  cursor: pointer;
  box-shadow: var(--btn-primary-shadow, 0 4px 14px rgba(99, 102, 241, 0.35));
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .btn-icon {
    font-size: 1.2rem;
    line-height: 1;
  }
}


.btn-secondary {
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-alt, #f8fafc);
    color: var(--color-text-main, #0f172a);
    border-color: #cbd5e1;
  }
}

// Метрики
.board-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface, #ffffff);
  border-radius: 14px;
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.metric-icon {
  font-size: 2.2rem;
  line-height: 1;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text-main, #0f172a);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748b);
  font-weight: 500;
}

// Тулбар
.board-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-text-muted, #94a3b8);
}

.search-input {
  width: 100%;
  padding: 0.85rem 2.5rem 0.85rem 2.75rem;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-text-main, #0f172a);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted, #94a3b8);
  cursor: pointer;
  font-size: 0.9rem;
}

.category-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pill-btn {
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    color: var(--color-text-main, #0f172a);
  }

  &--active {
    background: #6366f1;
    color: #ffffff;
    border-color: #6366f1;

    &:hover {
      background: #4f46e5;
      border-color: #4f46e5;
      color: #ffffff;
    }
  }
}

// Сетка курсов
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: var(--color-surface, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    border-color: rgba(99, 102, 241, 0.35);
  }

  &__banner {
    padding: 1.5rem 1.5rem 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__body {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__footer {
    padding: 1rem 1.5rem;
    background: var(--color-bg-alt, #f8fafc);
    border-top: 1px solid var(--color-border, #f1f5f9);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
}

.course-icon {
  font-size: 2.5rem;
  line-height: 1;
  display: inline-block;
  padding: 0.5rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 14px;
}

.course-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--color-text-main, #1e293b);
}

.level-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;

  &--beginner {
    background: rgba(16, 185, 129, 0.12);
    color: #10b981;
  }
  &--intermediate {
    background: rgba(245, 158, 11, 0.12);
    color: #d97706;
  }
  &--advanced {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
}

.course-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-main, #0f172a);
  margin: 0.75rem 0 0.5rem;
  line-height: 1.35;
}

.course-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted, #64748b);
  line-height: 1.5;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.course-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px dashed var(--color-border, #e2e8f0);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.course-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag-chip {
  font-size: 0.75rem;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.action-btn {
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &--edit {
    flex: 1;
    padding: 0.6rem 1rem;
    background: #6366f1;
    color: #ffffff;
    &:hover {
      background: #4f46e5;
    }
  }

  &--view {
    padding: 0.6rem 0.9rem;
    background: var(--color-surface, #ffffff);
    border-color: var(--color-border, #cbd5e1);
    color: var(--color-text-main, #334155);
    &:hover {
      background: var(--color-bg-alt, #f1f5f9);
    }
  }

  &--delete {
    padding: 0.6rem 0.75rem;
    background: transparent;
    color: #ef4444;
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface, #ffffff);
  border-radius: 16px;
  border: 2px dashed var(--color-border, #cbd5e1);

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
    color: var(--color-text-main, #0f172a);
  }

  p {
    color: var(--color-text-muted, #64748b);
    margin: 0 0 1.5rem;
  }
}
</style>
