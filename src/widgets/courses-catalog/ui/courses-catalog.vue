<script setup lang="ts">
import { useCoursesCatalog } from '../model/use-courses-catalog'

const {
  courses,
  searchQuery,
  selectedCategory,
  selectedLevel,
  isLoading,
  categoriesList,
  filteredCourses,
  totalChapters,
  openCourse,
  openAuthorStudio,
  getLevelLabel,
} = useCoursesCatalog()
</script>

<template>
  <div class="courses-catalog">
    <!-- Hero Секция Каталога -->
    <header class="catalog-hero">
      <div class="catalog-hero__container">
        <div class="hero-badge">
          <span class="badge-icon">🎓</span>
          <span>ОБРАЗОВАТЕЛЬНЫЙ ХАБ LERN</span>
        </div>
        <h1 class="hero-title">Каталог курсов & Баз знаний</h1>
        <p class="hero-subtitle">
          Изучайте современные дисциплины с академическими книгами Bookish Codex, интерактивными 3D-тренажёрами памяти Active Recall и практической системой геймификации.
        </p>

        <div class="hero-actions">
          <button type="button" class="btn-author" @click="openAuthorStudio">
            <span>✍️ Кабинет автора & Конструктор курсов</span>
          </button>
        </div>

        <!-- Лента метрик платформы -->
        <div class="hero-ribbon">
          <div class="ribbon-item">
            <span class="ribbon-num">{{ courses.length }}</span>
            <span class="ribbon-text">Дисциплин в каталоге</span>
          </div>
          <div class="ribbon-divider"></div>
          <div class="ribbon-item">
            <span class="ribbon-num">{{ totalChapters }}+</span>
            <span class="ribbon-text">Академических глав</span>
          </div>
          <div class="ribbon-divider"></div>
          <div class="ribbon-item">
            <span class="ribbon-num">3D</span>
            <span class="ribbon-text">Active Recall карточки</span>
          </div>
          <div class="ribbon-divider"></div>
          <div class="ribbon-item">
            <span class="ribbon-num">⚡ XP</span>
            <span class="ribbon-text">Система уровней и стриков</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент каталога -->
    <main class="catalog-main">
      <!-- Панель поиска и фильтров -->
      <div class="catalog-controls">
        <div class="search-field">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск дисциплин по названию, технологиям или тегам..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <!-- Фильтры по категориям и уровням -->
        <div class="filters-row">
          <div class="category-filters">
            <button
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              Все направления
            </button>
            <button
              v-for="cat in categoriesList"
              :key="cat"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div class="level-filters">
            <button
              type="button"
              class="level-pill"
              :class="{ 'level-pill--active': selectedLevel === 'all' }"
              @click="selectedLevel = 'all'"
            >
              Все уровни
            </button>
            <button
              type="button"
              class="level-pill"
              :class="{ 'level-pill--active': selectedLevel === 'beginner' }"
              @click="selectedLevel = 'beginner'"
            >
              Начинающий
            </button>
            <button
              type="button"
              class="level-pill"
              :class="{ 'level-pill--active': selectedLevel === 'intermediate' }"
              @click="selectedLevel = 'intermediate'"
            >
              Средний
            </button>
            <button
              type="button"
              class="level-pill"
              :class="{ 'level-pill--active': selectedLevel === 'advanced' }"
              @click="selectedLevel = 'advanced'"
            >
              Продвинутый
            </button>
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="catalog-loading">
        <div class="spinner-large"></div>
        <p>Загрузка каталога дисциплин...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="filteredCourses.length === 0" class="catalog-empty">
        <span class="empty-icon">📂</span>
        <h2>Дисциплины не найдены</h2>
        <p>По вашему запросу не найдено подходящих курсов. Попробуйте сбросить фильтры.</p>
        <button
          type="button"
          class="btn-reset"
          @click="searchQuery = ''; selectedCategory = 'all'; selectedLevel = 'all'"
        >
          Сбросить фильтры
        </button>
      </div>

      <!-- Сетка карточек курсов -->
      <div v-else class="courses-grid">
        <article
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
          @click="openCourse(course.id)"
        >
          <div class="course-card__header">
            <span class="course-icon">{{ course.icon || '📚' }}</span>
            <div class="course-pills">
              <span class="pill-category">{{ course.category }}</span>
              <span class="pill-level" :class="`pill-level--${course.level}`">
                {{ getLevelLabel(course.level) }}
              </span>
            </div>
          </div>

          <div class="course-card__body">
            <h2 class="course-title">{{ course.title }}</h2>
            <p class="course-desc">{{ course.description }}</p>

            <div class="course-author">
              <img
                :src="course.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'"
                :alt="course.author.name"
                class="author-avatar"
              />
              <div class="author-info">
                <span class="author-name">{{ course.author.name }}</span>
                <span class="author-role">{{ course.author.role || 'Автор курса' }}</span>
              </div>
            </div>

            <div class="course-meta">
              <span class="meta-item">
                <span class="meta-icon">📁</span>
                <span>{{ course.modules.length }} модулей</span>
              </span>
              <span class="meta-item">
                <span class="meta-icon">📜</span>
                <span>{{ course.totalChapters || course.modules.reduce((s, m) => s + m.items.length, 0) }} глав</span>
              </span>
              <span class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span>~{{ course.estimatedHours || 3 }} ч.</span>
              </span>
            </div>

            <div v-if="course.tags && course.tags.length > 0" class="course-tags">
              <span v-for="tag in course.tags" :key="tag" class="tag-badge">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div class="course-card__footer">
            <button
              type="button"
              class="btn-start"
              @click.stop="openCourse(course.id)"
            >
              <span>🚀 Начать изучение</span>
              <span class="arrow">➔</span>
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.courses-catalog {
  min-height: calc(100vh - 64px);
  background: var(--color-bg, #0b0f17);
  color: var(--color-text-main, #f8fafc);
  display: flex;
  flex-direction: column;
}

// Hero секция
.catalog-hero {
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.95), var(--color-bg, #0b0f17));
  border-bottom: 1px solid var(--color-border, rgba(148, 163, 184, 0.15));
  padding: 3.5rem 1.5rem 2.5rem;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-muted, #94a3b8);
  max-width: 720px;
  margin: 0 0 1.75rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.btn-author {
  padding: 0.65rem 1.4rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #6366f1;
    color: #ffffff;
    transform: translateY(-2px);
  }
}

.hero-ribbon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 1rem 2rem;
  flex-wrap: wrap;
}

.ribbon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ribbon-num {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
}

.ribbon-text {
  font-size: 0.78rem;
  color: var(--color-text-muted, #94a3b8);
}

.ribbon-divider {
  width: 1px;
  height: 32px;
  background: rgba(148, 163, 184, 0.2);
}

// Контент
.catalog-main {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  width: 100%;
}

.catalog-controls {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.search-field {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 3.25rem;
  border-radius: 14px;
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.2));
  background: var(--color-surface, rgba(30, 41, 59, 0.6));
  font-size: 1rem;
  color: #f8fafc;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }
}

.search-clear {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-filters,
.level-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill,
.level-pill {
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    color: #ffffff;
    border-color: rgba(99, 102, 241, 0.5);
  }

  &--active {
    background: #6366f1;
    color: #ffffff;
    border-color: #6366f1;
  }
}

// Сетка курсов
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.75rem;
}

.course-card {
  background: rgba(30, 41, 59, 0.55);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(99, 102, 241, 0.45);
    box-shadow: 0 16px 40px rgba(99, 102, 241, 0.18);

    .arrow {
      transform: translateX(4px);
    }
  }

  &__header {
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
    background: rgba(15, 23, 42, 0.6);
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }
}

.course-icon {
  font-size: 2.75rem;
  line-height: 1;
  padding: 0.5rem;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 14px;
}

.course-pills {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.pill-category {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.pill-level {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;

  &--beginner {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }
  &--intermediate {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }
  &--advanced {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }
}

.course-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0.85rem 0 0.5rem;
  line-height: 1.35;
}

.course-desc {
  font-size: 0.92rem;
  color: var(--color-text-muted, #94a3b8);
  line-height: 1.55;
  margin: 0 0 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.course-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.18);
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f1f5f9;
}

.author-role {
  font-size: 0.72rem;
  color: #64748b;
}

.course-meta {
  display: flex;
  gap: 1.1rem;
  font-size: 0.82rem;
  color: #94a3b8;
  margin-bottom: 0.85rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.course-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.btn-start {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  }

  .arrow {
    transition: transform 0.2s ease;
  }
}

.catalog-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 0;
  gap: 1rem;
  color: #94a3b8;
}

.catalog-empty {
  text-align: center;
  padding: 5rem 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 20px;
  border: 2px dashed rgba(148, 163, 184, 0.2);

  .empty-icon {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }

  p {
    color: #94a3b8;
    margin: 0 0 1.5rem;
  }
}

.btn-reset {
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  background: #6366f1;
  border: none;
  cursor: pointer;
}

.spinner-large {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
