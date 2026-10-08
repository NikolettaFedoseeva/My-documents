<script setup lang="ts">
import { computed } from 'vue'
import {
  useDocProgressStore,
  type DocCategory,
  type DocItem,
  type CourseCodex,
} from '@/entities/doc'

// #region defineProps
interface Props {
  categories: DocCategory[]
  activeDocId: string
  searchQuery: string
  isExpanded: (categoryId: string) => boolean
  courses?: CourseCodex[]
  activeCourse?: CourseCodex | null
  isCourseDropdownOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  courses: () => [],
  activeCourse: null,
  isCourseDropdownOpen: false,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'selectDoc', docId: string): void
  (e: 'toggleCategory', categoryId: string): void
  (e: 'update:searchQuery', query: string): void
  (e: 'selectCourse', courseId: string): void
  (e: 'toggleCourseDropdown'): void
  (e: 'openDeckTrainer'): void
}>()
// #endregion defineEmits

const progressStore = useDocProgressStore()

// #region computed
const allItems = computed<DocItem[]>(() => {
  return props.categories.flatMap((cat) => cat.items)
})

const totalItemsCount = computed<number>(() => {
  return allItems.value.length
})

const completedItemsCount = computed<number>(() => {
  return allItems.value.filter((item) => progressStore.isCompleted(item.id)).length
})

const overallProgressPercent = computed<number>(() => {
  if (totalItemsCount.value === 0) return 0
  return Math.round((completedItemsCount.value / totalItemsCount.value) * 100)
})

const getCategoryPercent = (category: DocCategory): number => {
  const ids = category.items.map((i) => i.id)
  return progressStore.getCategoryProgress(ids)
}

const isDocDone = (item: DocItem): boolean => {
  return progressStore.isCompleted(item.id) || item.status === 'completed'
}
// #endregion computed

// #region Функции
const onInputSearch = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}
// #endregion Функции
</script>

<template>
  <aside class="docs-sidebar">
    <!-- Селектор активного курса (мультикурсовая платформа) -->
    <div v-if="props.courses && props.courses.length > 0" class="docs-sidebar__course-picker">
      <div class="course-picker-head">
        <span class="picker-label">КУРС / ДИСЦИПЛИНА</span>
        <span class="picker-badge">{{ props.courses.length }}</span>
      </div>

      <div
        class="course-picker-trigger"
        :class="{ 'course-picker-trigger--open': props.isCourseDropdownOpen }"
        @click="emit('toggleCourseDropdown')"
      >
        <span class="trigger-icon">{{ props.activeCourse?.icon || '📚' }}</span>
        <div class="trigger-meta">
          <span class="trigger-title">{{ props.activeCourse?.title || 'Выберите курс' }}</span>
          <span class="trigger-category">{{ props.activeCourse?.category || 'База знаний' }}</span>
        </div>
        <span class="trigger-chevron">▾</span>
      </div>

      <!-- Выпадающий список курсов -->
      <transition name="dropdown-fade">
        <div v-if="props.isCourseDropdownOpen" class="course-picker-menu">
          <div
            v-for="c in props.courses"
            :key="c.id"
            class="picker-menu-item"
            :class="{ 'picker-menu-item--active': props.activeCourse?.id === c.id }"
            @click="emit('selectCourse', c.id)"
          >
            <span class="item-icon">{{ c.icon || '📚' }}</span>
            <div class="item-info">
              <span class="item-title">{{ c.title }}</span>
              <span class="item-cat">{{ c.modules.length }} мод. • {{ c.totalChapters || c.modules.reduce((s, m) => s + m.items.length, 0) }} глав</span>
            </div>
            <span v-if="props.activeCourse?.id === c.id" class="item-check">✓</span>
          </div>

          <router-link
            to="/courses"
            class="picker-create-link"
            @click="emit('toggleCourseDropdown')"
          >
            <span>📚 Каталог всех курсов и дисциплин →</span>
          </router-link>
        </div>
      </transition>
    </div>


    <!-- Поиск по Карте Знаний -->
    <div class="docs-sidebar__search">
      <span class="docs-sidebar__search-icon">🔍</span>
      <input
        type="text"
        :value="props.searchQuery"
        placeholder="Поиск по Карте Знаний..."
        class="docs-sidebar__search-input"
        @input="onInputSearch"
      />
    </div>


    <!-- Академический прогресс-виджет курса -->
    <div class="docs-sidebar__progress-summary">
      <div class="progress-meta">
        <span class="progress-label">ПРОГРЕСС ИЗУЧЕНИЯ</span>
        <span class="progress-digits">{{ completedItemsCount }} / {{ totalItemsCount }} ({{ overallProgressPercent }}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-bar" :style="{ width: overallProgressPercent + '%' }"></div>
      </div>
      <div class="progress-chips">
        <span class="progress-chip xp-chip" title="Общий накопленный опыт">⚡ {{ progressStore.totalXp }} XP</span>
        <span class="progress-chip level-chip" title="Текущий уровень">⭐ Ур. {{ progressStore.userLevel }}</span>
        <span class="progress-chip streak-chip" title="Дней активности подряд">🔥 {{ progressStore.streakDays }} дн.</span>
      </div>
    </div>

    <!-- Кнопка тренировки колоды карточек курса -->
    <button
      type="button"
      class="docs-sidebar__train-deck-btn"
      title="Запустить тренировку 3D-флешкарт курса"
      @click="emit('openDeckTrainer')"
    >
      <span class="train-icon">🧠</span>
      <div class="train-label-wrap">
        <span class="train-label">Тренировать колоду курса</span>
        <span class="train-sub">3D Active Recall • Focus</span>
      </div>
      <span class="train-arrow">▶</span>
    </button>

    <!-- Заголовок карты знаний -->
    <div class="docs-sidebar__title-bar">
      <span class="docs-sidebar__title-text">🌳 КАРТА ЗНАНИЙ (CODEX)</span>
      <span class="docs-sidebar__count">{{ props.categories.length }} модулей</span>
    </div>

    <!-- Каскадное дерево знаний -->
    <nav class="docs-sidebar__nav">
      <div
        v-for="category in props.categories"
        :key="category.id"
        class="tree-node"
      >
        <!-- Шапка модуля (Каскадный блок) -->
        <button
          type="button"
          class="tree-node__header"
          @click="emit('toggleCategory', category.id)"
        >
          <div class="tree-node__header-left">
            <span v-if="category.code" class="tree-node__code">{{ category.code }}</span>
            <span class="tree-node__icon">{{ category.icon }}</span>
            <span class="tree-node__title">{{ category.title }}</span>
          </div>

          <div class="tree-node__header-right">
            <span v-if="getCategoryPercent(category) === 100" class="status-badge status-badge--done">✓</span>
            <span v-else-if="getCategoryPercent(category) > 0" class="status-badge status-badge--progress">
              {{ getCategoryPercent(category) }}%
            </span>
            <span
              class="tree-node__arrow"
              :class="{ 'tree-node__arrow--open': props.isExpanded(category.id) }"
            >
              ▾
            </span>
          </div>
        </button>

        <!-- Ветка уроков / статей -->
        <transition name="tree-expand">
          <ul
            v-if="props.isExpanded(category.id)"
            class="tree-branch"
          >
            <li
              v-for="item in category.items"
              :key="item.id"
              class="tree-leaf"
            >
              <button
                type="button"
                class="tree-leaf__btn"
                :class="{
                  'tree-leaf__btn--active': props.activeDocId === item.id,
                  'tree-leaf__btn--completed': isDocDone(item),
                  'tree-leaf__btn--locked': item.status === 'locked',
                }"
                @click="emit('selectDoc', item.id)"
              >
                <!-- Соединительная линия ветки -->
                <span class="tree-leaf__connector"></span>

                <!-- Код урока: 01.1, 01.2 -->
                <span v-if="item.code" class="tree-leaf__code">{{ item.code }}</span>

                <span class="tree-leaf__title">{{ item.title }}</span>

                <span class="tree-leaf__status-icon">
                  <span v-if="isDocDone(item)" class="status-icon--done" title="Изучено">✓</span>
                  <span v-else-if="props.activeDocId === item.id" title="Текущий урок">🔥</span>
                  <span v-else-if="item.status === 'locked'" title="Заблокировано">🔒</span>
                </span>
              </button>
            </li>
          </ul>
        </transition>
      </div>
    </nav>
  </aside>
</template>


<style scoped lang="scss">
.docs-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-container, #1c2d47);
  border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding: 1.25rem 1rem;
  box-sizing: border-box;
  overflow-y: auto;

  &__search {
    position: relative;
    margin-bottom: 1rem;
  }

  &__search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    opacity: 0.6;
    pointer-events: none;
  }

  &__search-input {
    width: 100%;
    background: var(--bg-card, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--radius-sm, 10px);
    padding: 0.6rem 0.85rem 0.6rem 2.2rem;
    color: var(--text-main, #ffffff);
    font-size: 0.85rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: var(--primary, #38bdf8);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
    }

    &::placeholder {
      color: var(--text-muted, #94a3b8);
      font-size: 0.82rem;
    }
  }

  &__progress-summary {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--radius-sm, 12px);
    padding: 0.85rem 0.95rem;
    margin-bottom: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    .progress-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .progress-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
    }

    .progress-digits {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary, #818cf8);
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #34d399 100%);
      border-radius: 9999px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-chips {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem;
      padding-top: 0.25rem;
    }

    .progress-chip {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.45rem;
      border-radius: 6px;
      white-space: nowrap;

      &.xp-chip {
        background: rgba(234, 179, 8, 0.15);
        color: #facc15;
        border: 1px solid rgba(234, 179, 8, 0.3);
      }

      &.level-chip {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      &.streak-chip {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }
  }

  &__train-deck-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%);
    border: 1px solid rgba(168, 85, 247, 0.4);
    padding: 0.75rem 0.9rem;
    border-radius: var(--radius-sm, 12px);
    margin-bottom: 1.1rem;
    cursor: pointer;
    color: #ffffff;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(168, 85, 247, 0.4) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
      border-color: rgba(168, 85, 247, 0.6);
    }

    .train-icon {
      font-size: 1.25rem;
    }

    .train-label-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .train-label {
      font-size: 0.825rem;
      font-weight: 700;
      color: #ffffff;
    }

    .train-sub {
      font-size: 0.68rem;
      color: #c7d2fe;
    }

    .train-arrow {
      font-size: 0.75rem;
      color: #a855f7;
    }
  }

  &__title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.4rem 0.8rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    margin-bottom: 0.75rem;
  }

  &__title-text {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--text-muted, #94a3b8);
  }

  &__count {
    font-size: 0.7rem;
    color: var(--text-muted, #94a3b8);
    opacity: 0.8;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
}

/* Tree Nodes */
.tree-node {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--bg-card, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-sm, 10px);
    color: var(--text-main, #ffffff);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
      border-color: var(--primary, #38bdf8);
    }
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary, #818cf8);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  &__icon {
    font-size: 1rem;
    line-height: 1;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__arrow {
    font-size: 0.8rem;
    color: var(--text-muted, #94a3b8);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 9999px;

  &--done {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }

  &--progress {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
}

/* Tree Leaves (Уроки) */
.tree-branch {
  list-style: none;
  padding: 0.35rem 0 0.35rem 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  border-left: 2px dashed var(--border-color, rgba(255, 255, 255, 0.12));
  margin-left: 1rem;
}

.tree-leaf {
  &__btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted, #94a3b8);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover {
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
      color: var(--text-main, #ffffff);
    }

    &--active {
      background: var(--bg-card-hover, rgba(56, 189, 248, 0.15)) !important;
      border-color: var(--primary, #38bdf8) !important;
      color: var(--text-main, #ffffff) !important;
      font-weight: 700;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }

    &--completed {
      color: var(--text-main, #e2e8f0);
    }

    &--locked {
      opacity: 0.6;
    }
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-muted, #94a3b8);
    opacity: 0.8;
  }

  &__title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__status-icon {
    font-size: 0.8rem;
    margin-left: auto;

    .status-icon--done {
      color: #34d399;
      font-weight: 800;
      text-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
    }
  }
}

.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// Селектор активного курса
.docs-sidebar__course-picker {
  margin-bottom: 0.85rem;
  position: relative;
}

.course-picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.picker-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
}

.picker-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.course-picker-trigger {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: var(--bg-card, rgba(30, 41, 59, 0.45));
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.08);
  }

  &--open {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);

    .trigger-chevron {
      transform: rotate(180deg);
    }
  }
}

.trigger-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.trigger-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.trigger-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main, #f8fafc);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-category {
  font-size: 0.7rem;
  color: #818cf8;
  font-weight: 600;
}

.trigger-chevron {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  transition: transform 0.2s ease;
}

// Выпадающее меню выбора курса
.course-picker-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.45rem;
  background: var(--bg-container, #111827);
  border: 1px solid var(--border-color, rgba(99, 102, 241, 0.35));
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border-color, rgba(255, 255, 255, 0.08));
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0.45rem;
}


.picker-menu-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }

  &--active {
    background: rgba(99, 102, 241, 0.22);

    .item-title {
      color: #818cf8;
      font-weight: 700;
    }
  }
}

.item-icon {
  font-size: 1.25rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main, #f8fafc);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-cat {
  font-size: 0.68rem;
  color: var(--text-muted, #94a3b8);
}

.item-check {
  font-size: 0.85rem;
  color: #34d399;
  font-weight: 700;
}

.picker-create-link {
  display: block;
  text-align: center;
  padding: 0.5rem;
  margin-top: 0.25rem;
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
  font-size: 0.78rem;
  font-weight: 600;
  color: #818cf8;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.18s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

