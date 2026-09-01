<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type AppTheme } from '@/shared/lib/theme'
import {
  UiButton,
  UiBadge,
  UiCard,
  UiInput,
  UiQuestion,
  UiTabs,
  UiProgressBar,
  UiToggle,
  UiDropdown,
  UiModal,
  UiAvatar,
  UiAlert,
  UiTable,
  UiCarousel,
  InteractiveFlashcard,
  type QuestionData,
  type QuestionOption,
  type TabItem,
  type DropdownOption,
  type TableColumn,
} from '@/shared/ui'

// #region Theme Management
const { currentTheme, themes, setTheme } = useTheme()
// #endregion Theme Management

// #region Active Tab for Codex Showcase
const activeTab = ref<'search' | 'nav' | 'article' | 'quiz'>('article')
// #endregion Active Tab

// #region Component States Demo
const selectedDemoTab = ref<string>('vue3')
const demoTabs: TabItem[] = [
  { id: 'js', label: 'JavaScript', icon: '⚡', badge: '12' },
  { id: 'vue3', label: 'Vue 3 API', icon: '🖖', badge: '24' },
  { id: 'ts', label: 'TypeScript', icon: '📘', badge: '8' },
  { id: 'react', label: 'React Core', icon: '⚛️', disabled: true },
]

const toggleFocusMode = ref<boolean>(true)
const toggleAutoCheck = ref<boolean>(false)

const selectedCategory = ref<string>('frontend')
const categoryOptions: DropdownOption[] = [
  { id: 'frontend', label: 'Frontend Разработка', icon: '💻' },
  { id: 'backend', label: 'Backend & Базы Данных', icon: '⚙️' },
  { id: 'design', label: 'UI/UX Дизайн & Figma', icon: '🎨' },
  { id: 'devops', label: 'DevOps & CI/CD', icon: '🚀', disabled: true },
]

const isModalOpen = ref<boolean>(false)

// Table Demo
const tableColumns: TableColumn[] = [
  { key: 'topic', label: 'Тема курса', sortable: true },
  { key: 'category', label: 'Дисциплина' },
  { key: 'progress', label: 'Прогресс', sortable: true },
  { key: 'status', label: 'Статус' },
]

const tableData = [
  { topic: 'watch и watchEffect', category: 'Vue 3', progress: '62%', status: 'В процессе' },
  { topic: 'Компоненты & Props', category: 'Vue 3', progress: '100%', status: 'Завершено' },
  { topic: 'Строгая типизация', category: 'TypeScript', progress: '85%', status: 'В процессе' },
  { topic: 'Pinia & State', category: 'Vue 3', progress: '0%', status: 'Не начато' },
]
// #endregion Component States Demo

// #region Demo Data
const demoQuestion: QuestionData = {
  id: 'q-1',
  category: 'Frontend',
  section: 'Vue 3 & Reactivity',
  difficulty: 'medium',
  question: 'В чём главное различие между ref() и reactive() в Vue 3 Composition API?',
  answer:
    'ref() оборачивает любой тип данных (примитивы и объекты) в объект с полем .value и отслеживает изменения через get/set прокси.\n\nreactive() работает ТОЛЬКО с объектами/массивами и создает глубокую прокси-обертку самого объекта без необходимости использовать .value.',
  hint: 'Вспомните, как работают примитивные типы данных (number, string, boolean) и свойства .value.',
}

const quizOptions: QuestionOption[] = [
  {
    id: 'opt-a',
    label: 'A',
    text: 'Когда нужно отследить изменения конкретного источника и получить старое и новое значения.',
  },
  {
    id: 'opt-b',
    label: 'B',
    text: 'Когда зависимости заранее неизвестны, или их использование внутри колбэка может меняться.',
  },
  {
    id: 'opt-c',
    label: 'C',
    text: 'Когда нужно отслеживать только несколько фиксированных полей объекта.',
  },
]

const selectedQuizOption = ref<string>('opt-b')
const isQuizSubmitted = ref<boolean>(false)
const sampleRatingResult = ref<string | null>(null)
const sampleInputValue = ref<string>('')
const sampleErrorValue = ref<string>('Некорректный формат E-mail')

const onRateQuestion = (payload: { id: string | number; rating: string }) => {
  sampleRatingResult.value = `Вы оценили вопрос как: "${
    payload.rating === 'know' ? 'Знаю 🟢' : payload.rating === 'doubt' ? 'Сомневаюсь 🟡' : 'Повторить 🔴'
  }"`
}

const onSubmitQuiz = () => {
  isQuizSubmitted.value = true
}

const onResetQuiz = () => {
  isQuizSubmitted.value = false
}
// #endregion Demo Data
</script>

<template>
  <div class="ui-kit-page">
    <!-- Header with Theme Selector -->
    <header class="ui-kit-header">
      <div class="ui-kit-header__title-group">
        <h1 class="ui-kit-header__title">📖 Справочник & Карта Знаний (Bookish Codex)</h1>
        <p class="ui-kit-header__subtitle">
          Интерактивная демонстрация 4 разделов платформы и 7 динамических стилей
        </p>
      </div>

      <!-- Theme Switcher Selector -->
      <div class="ui-kit-theme-switcher">
        <label class="ui-kit-theme-switcher__label">Выбор визуального стиля:</label>
        <div class="ui-kit-theme-switcher__options">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="ui-kit-theme-btn"
            :class="{ 'ui-kit-theme-btn--active': currentTheme === theme.id }"
            @click="setTheme(theme.id as AppTheme)"
          >
            <span class="ui-kit-theme-btn__icon">{{ theme.icon }}</span>
            <span class="ui-kit-theme-btn__name">{{ theme.name }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Navigation Tabs for 4 Codex Pages -->
    <nav class="codex-nav-tabs">
      <button
        class="codex-nav-tab"
        :class="{ 'codex-nav-tab--active': activeTab === 'search' }"
        @click="activeTab = 'search'"
      >
        <span class="codex-nav-tab__num">01</span>
        <span class="codex-nav-tab__icon">🔍</span>
        <span class="codex-nav-tab__text">Поиск & Разделы</span>
      </button>

      <button
        class="codex-nav-tab"
        :class="{ 'codex-nav-tab--active': activeTab === 'nav' }"
        @click="activeTab = 'nav'"
      >
        <span class="codex-nav-tab__num">02</span>
        <span class="codex-nav-tab__icon">🗺</span>
        <span class="codex-nav-tab__text">Карта Знаний</span>
      </button>

      <button
        class="codex-nav-tab"
        :class="{ 'codex-nav-tab--active': activeTab === 'article' }"
        @click="activeTab = 'article'"
      >
        <span class="codex-nav-tab__num">03</span>
        <span class="codex-nav-tab__icon">📖</span>
        <span class="codex-nav-tab__text">Чтение Статьи</span>
      </button>

      <button
        class="codex-nav-tab"
        :class="{ 'codex-nav-tab--active': activeTab === 'quiz' }"
        @click="activeTab = 'quiz'"
      >
        <span class="codex-nav-tab__num">04</span>
        <span class="codex-nav-tab__icon">🎯</span>
        <span class="codex-nav-tab__text">Самопроверка</span>
      </button>
    </nav>

    <main class="ui-kit-content">
      <!-- TAB 1: SEARCH & SECTIONS -->
      <section v-if="activeTab === 'search'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="codex-header-banner">
            <div class="codex-header-banner__symbol">🧭</div>
            <h2 class="codex-header-banner__title">Справочник</h2>
            <p class="codex-header-banner__sub">Куда отправимся сегодня?</p>
          </div>

          <div class="codex-search-box">
            <UiInput placeholder="Что хотите изучить?" clearable>
              <template #icon-left>🔍</template>
              <template #hint>Нажмите ⌘K для быстрого поиска</template>
            </UiInput>
          </div>

          <div class="codex-section-grid">
            <div class="codex-continue-card">
              <div class="codex-continue-card__badge">Продолжить:</div>
              <h4 class="codex-continue-card__title">watch и watchEffect</h4>
              <UiProgressBar :value="62" label="Прогресс прочтения" show-label animated />
            </div>

            <div class="codex-categories-list">
              <h3>Разделы дисциплин</h3>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">📁</span>
                <span class="codex-cat-item__name">Программирование</span>
                <span class="codex-cat-item__count">1 284 &gt;</span>
              </div>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">📖</span>
                <span class="codex-cat-item__name">История</span>
                <span class="codex-cat-item__count">842 &gt;</span>
              </div>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">🌿</span>
                <span class="codex-cat-item__name">Естественные науки</span>
                <span class="codex-cat-item__count">658 &gt;</span>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- TAB 2: KNOWLEDGE MAP (STACKED BOOKMARKS) -->
      <section v-if="activeTab === 'nav'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="codex-map-header">
            <UiBadge variant="primary">КАРТА ЗНАНИЙ ★</UiBadge>
          </div>

          <!-- Stacked Bookmark Cards (01 -> 02 -> 03 -> 04 -> 05) -->
          <div class="stacked-bookmarks">
            <div class="bookmark-card bookmark-card--lvl1">01 Программирование</div>
            <div class="bookmark-card bookmark-card--lvl2">02 Frontend</div>
            <div class="bookmark-card bookmark-card--lvl3">03 Vue 3</div>
            <div class="bookmark-card bookmark-card--lvl4">04 Composition API</div>
            <div class="bookmark-card bookmark-card--lvl5">05 watch и watchEffect</div>
          </div>

          <div class="codex-topics-list">
            <div class="codex-topic-row codex-topic-row--completed">
              <span>📄 Введение в Composition API</span>
              <span class="codex-topic-row__badge">100% ✓</span>
            </div>
            <div class="codex-topic-row codex-topic-row--active">
              <span>📄 watch и watchEffect</span>
              <span class="codex-topic-row__badge">62% ◔</span>
            </div>
            <div class="codex-topic-row">
              <span>📄 Глубокое наблюдение</span>
              <span class="codex-topic-row__badge">25% ◔</span>
            </div>
            <div class="codex-topic-row">
              <span>📄 Остановка наблюдателей</span>
              <span class="codex-topic-row__badge">0% ○</span>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- TAB 3: ARTICLE READER -->
      <section v-if="activeTab === 'article'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="article-header">
            <UiBadge variant="secondary">ГЛАВА 05</UiBadge>
            <div class="article-breadcrumbs">
              Программирование &gt; Frontend &gt; Vue 3 &gt; Composition API &gt; watch и watchEffect
            </div>
            <h1 class="article-title">watch и watchEffect</h1>
            <div class="article-meta">
              <span>⏱ 7 мин чтение</span>
              <UiProgressBar :value="62" size="sm" style="width: 120px" />
              <span>62% прочитано</span>
            </div>
          </div>

          <div class="article-body">
            <p>
              В Composition API для реакции на изменения реактивных данных используются функции
              <strong>watch</strong> и <strong>watchEffect</strong>.
            </p>

            <p>
              <strong>watch</strong> позволяет явно указать источник изменений и получить старое и новое значения.
            </p>

            <p>
              <strong>watchEffect</strong> автоматически отслеживает используемые реактивные зависимости внутри колбэка и запускается сразу, а затем — при любом их изменении.
            </p>

            <!-- Code Box -->
            <div class="code-block">
              <div class="code-block__header">Пример: watch</div>
              <pre><code><span class="code-num">1</span> import { ref, watch } from 'vue'
<span class="code-num">2</span> 
<span class="code-num">3</span> const count = ref(0)
<span class="code-num">4</span> 
<span class="code-num">5</span> watch(count, (newValue, oldValue) => {
<span class="code-num">6</span>   console.log(`count: ${oldValue} => ${newValue}`)
<span class="code-num">7</span> })</code></pre>
            </div>
          </div>

          <div class="article-footer">
            <UiButton variant="secondary">← Назад</UiButton>
            <UiButton variant="ghost">≡ Содержание</UiButton>
            <UiButton variant="primary">Далее →</UiButton>
          </div>
        </UiCard>
      </section>

      <!-- TAB 4: QUIZ & ACTIVE RECALL -->
      <section v-if="activeTab === 'quiz'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="quiz-header">
            <UiBadge variant="primary">ПРОВЕРКА</UiBadge>
            <h2 class="quiz-title">Проверка понимания</h2>
            <p class="quiz-meta">3 вопроса • около 2 минут</p>
          </div>

          <div class="quiz-step-bar">
            <span class="quiz-step-num">01 / 03</span>
            <UiProgressBar :value="33" size="sm" style="flex: 1" />
          </div>

          <UiQuestion
            v-model="selectedQuizOption"
            question="Когда лучше использовать watchEffect?"
            :options="quizOptions"
            correct-id="opt-b"
            :is-submitted="isQuizSubmitted"
          />

          <div class="quiz-actions">
            <UiButton
              v-if="!isQuizSubmitted"
              variant="primary"
              size="lg"
              @click="onSubmitQuiz"
            >
              Проверить ответ
            </UiButton>
            <UiButton
              v-else
              variant="secondary"
              size="lg"
              @click="onResetQuiz"
            >
              Сбросить и попробовать снова
            </UiButton>
          </div>

          <!-- Active Recall 3D Flip Flashcard -->
          <div class="quiz-flashcard-wrapper">
            <h3 class="quiz-flashcard-title">🃏 Тренaжёр Active Recall (3D Flip)</h3>
            <InteractiveFlashcard :data="demoQuestion" @rate="onRateQuestion" />
            <div v-if="sampleRatingResult" class="ui-kit-demo-result">
              {{ sampleRatingResult }}
            </div>
          </div>
        </UiCard>
      </section>

      <!-- GENERAL UI KIT COMPONENTS SHOWCASE -->
      <section class="ui-kit-section">
        <div class="ui-kit-section__header">
          <h2 class="ui-kit-section__title">🧩 Набор базовых элементов (UI Kit Components)</h2>
          <p class="ui-kit-section__desc">Полная коллекция FSD-компонентов интерфейса</p>
        </div>

        <UiCard variant="glass">
          <div class="ui-kit-grid">
            <!-- 1. Tabs & Toggles -->
            <div class="ui-kit-group">
              <h3>Переключатель Вкладок (UiTabs)</h3>
              <UiTabs v-model="selectedDemoTab" :items="demoTabs" />
            </div>

            <!-- 2. Avatars -->
            <div class="ui-kit-group">
              <h3>Аватары Пользователей (UiAvatar)</h3>
              <div class="ui-kit-row">
                <UiAvatar name="Анна Смирнова" status="online" size="lg" />
                <UiAvatar name="Денис Игнатьев" status="busy" size="md" />
                <UiAvatar name="Катерина Волкова" status="away" size="sm" />
                <UiAvatar name="Мария К" status="online" square size="lg" />
              </div>
            </div>

            <!-- 3. Alerts -->
            <div class="ui-kit-group">
              <h3>Системные Уведомления (UiAlert)</h3>
              <div class="ui-kit-grid">
                <UiAlert variant="info" title="Информационный совет" closable>
                  В режиме Focus Mode все отвлекающие элементы управления автоматически скрываются.
                </UiAlert>
                <UiAlert variant="success" title="Успешная самопроверка">
                  Вы ответили верно на 10 из 10 вопросов в теме watchEffect!
                </UiAlert>
                <UiAlert variant="warning" title="Внимание">
                  Ударный режим (Streak) сбросится, если не пройти 1 урок сегодня.
                </UiAlert>
              </div>
            </div>

            <!-- 4. Progress Bars -->
            <div class="ui-kit-group">
              <h3>Индикаторы Прогресса (UiProgressBar)</h3>
              <div class="ui-kit-grid">
                <UiProgressBar :value="85" variant="primary" label="Освоение темы Vue 3" show-label animated />
                <UiProgressBar :value="100" variant="success" label="Выполнено 10 из 10 вопросов" show-label />
                <UiProgressBar :value="40" variant="warning" label="Текущий уровень памяти" show-label />
              </div>
            </div>

            <!-- 5. Toggles -->
            <div class="ui-kit-group">
              <h3>Тумблеры-Переключатели (UiToggle)</h3>
              <div class="ui-kit-row">
                <UiToggle v-model="toggleFocusMode" label="Focus Mode (Режим концентрации)" />
                <UiToggle v-model="toggleAutoCheck" label="Автопроверка ответов" />
              </div>
            </div>

            <!-- 6. Dropdowns -->
            <div class="ui-kit-group">
              <h3>Выпадающий список (UiDropdown)</h3>
              <div style="max-width: 320px">
                <UiDropdown v-model="selectedCategory" label="Выбор дисциплины" :options="categoryOptions" />
              </div>
            </div>

            <!-- 7. Tables -->
            <div class="ui-kit-group">
              <h3>Таблица Данных (UiTable)</h3>
              <UiTable :columns="tableColumns" :data="tableData">
                <template #cell-status="{ value }">
                  <UiBadge :variant="value === 'Завершено' ? 'success' : value === 'В процессе' ? 'warning' : 'secondary'">
                    {{ value }}
                  </UiBadge>
                </template>
              </UiTable>
            </div>

            <!-- 8. Carousel -->
            <div class="ui-kit-group">
              <h3>Карусель / Слайдер (UiCarousel)</h3>
              <UiCarousel :items-count="3">
                <div style="padding: 1.5rem; background: var(--bg-card-hover); border-radius: var(--radius-md); text-align: center; width: 100%;">
                  <h4>🚀 Слайд 1: Модуль Vue 3 Composition API</h4>
                  <p>Освойте паттерны ref, reactive, computed и watch в интерактивном формате.</p>
                </div>
                <div style="padding: 1.5rem; background: var(--bg-card-hover); border-radius: var(--radius-md); text-align: center; width: 100%;">
                  <h4>🎯 Слайд 2: Механики Active Recall</h4>
                  <p>Проверяйте память с 3D-флешкартами и интервальным повторением.</p>
                </div>
                <div style="padding: 1.5rem; background: var(--bg-card-hover); border-radius: var(--radius-md); text-align: center; width: 100%;">
                  <h4>🏆 Слайд 3: Система Достижений и Streaks</h4>
                  <p>Сохраняйте ежедневный прогресс и поднимайтесь на уровни кодекса!</p>
                </div>
              </UiCarousel>
            </div>

            <!-- 9. Modals -->
            <div class="ui-kit-group">
              <h3>Модальные окна (UiModal)</h3>
              <div>
                <UiButton variant="primary" @click="isModalOpen = true">
                  <template #icon-left>💡</template>
                  Открыть подсказку урока
                </UiButton>

                <UiModal v-model="isModalOpen" title="Подсказка к заданию">
                  <p>
                    Функция <code>watchEffect</code> выполняет переданный колбэк <strong>немедленно</strong> при вызове, автоматически отслеживая все реактивные переменные, используемые внутри него.
                  </p>
                  <template #footer>
                    <UiButton variant="secondary" @click="isModalOpen = false">Закрыть</UiButton>
                    <UiButton variant="primary" @click="isModalOpen = false">Понятно!</UiButton>
                  </template>
                </UiModal>
              </div>
            </div>
          </div>
        </UiCard>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.ui-kit-page {
  min-height: 100vh;
  padding: 2.5rem 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.ui-kit-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--border-color);

  &__title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }
}

.ui-kit-theme-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--primary);
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

.ui-kit-theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-color-glow);
  }

  &--active {
    background: var(--primary-gradient);
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-glow);
  }
}

/* Navigation Tabs for 4 Codex Pages */
.codex-nav-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.codex-nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.4rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &__num {
    opacity: 0.6;
    font-size: 0.8rem;
  }

  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-color-glow);
  }

  &--active {
    background: var(--primary-gradient);
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-glow);

    .codex-nav-tab__num {
      opacity: 0.9;
    }
  }
}

.ui-kit-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Codex Screens */
.codex-header-banner {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;

  &__symbol {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
  }

  &__sub {
    font-size: 1rem;
    color: var(--text-muted);
    font-style: italic;
  }
}

.codex-search-box {
  margin-bottom: 2rem;
}

.codex-section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.codex-continue-card {
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color-glow);

  &__badge {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 1rem;
  }
}

.codex-categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }
}

.codex-cat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);

  &__name {
    flex: 1;
    font-weight: 600;
    color: var(--text-main);
  }

  &__count {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
}

/* Stacked Bookmarks */
.stacked-bookmarks {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 1.5rem 0;
}

.bookmark-card {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-main);

  &--lvl1 { margin-left: 0; }
  &--lvl2 { margin-left: 1rem; }
  &--lvl3 { margin-left: 2rem; }
  &--lvl4 { margin-left: 3rem; }
  &--lvl5 {
    margin-left: 4rem;
    background: var(--primary-gradient);
    color: var(--text-inverse);
    border-color: transparent;
  }
}

.codex-topics-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.codex-topic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);

  &--completed {
    border-color: var(--success);
    .codex-topic-row__badge { color: var(--success); }
  }

  &--active {
    border-color: var(--primary);
    font-weight: 700;
    .codex-topic-row__badge { color: var(--primary); }
  }

  &__badge {
    font-weight: 700;
    font-size: 0.85rem;
  }
}

/* Article Reader */
.article-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.article-breadcrumbs {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.article-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.article-body {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  p { margin: 0; }
}

.code-block {
  margin: 1.5rem 0;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  overflow: hidden;

  &__header {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-muted);
  }

  pre {
    margin: 0;
    padding: 1.25rem;
    overflow-x: auto;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  .code-num {
    display: inline-block;
    width: 25px;
    opacity: 0.4;
    user-select: none;
  }
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Quiz Screen */
.quiz-header {
  margin-bottom: 1.5rem;
}

.quiz-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 0.5rem;
}

.quiz-meta {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.quiz-step-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  .quiz-step-num {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--primary);
  }
}

.quiz-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.quiz-flashcard-wrapper {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-color);

  .quiz-flashcard-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 1.25rem;
  }
}

/* Showcase Grid */
.ui-kit-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main);
  }

  &__desc {
    font-size: 0.95rem;
    color: var(--text-muted);
  }
}

.ui-kit-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.ui-kit-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
  }
}

.ui-kit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.ui-kit-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ui-kit-demo-result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: var(--success);
  text-align: center;
  font-weight: 600;
}
</style>
