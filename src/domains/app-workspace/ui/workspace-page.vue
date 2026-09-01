<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UiButton,
  UiBadge,
  UiCard,
  UiInput,
  UiProgressBar,
  UiQuestion,
  UiAlert,
  InteractiveFlashcard,
  type QuestionData,
  type QuestionOption,
} from 'lern-ui-kit'

const router = useRouter()

// User Session State (Guest vs Logged In)
const isLoggedIn = ref<boolean>(false)
const userStreak = ref<number>(5)

// Navigation Tabs in Bookish Codex
const activeTab = ref<'search' | 'nav' | 'article' | 'quiz'>('search')

// Search & Filtering
const searchQuery = ref<string>('')

// Sample Demo Topics
const topics = ref([
  { id: '1', title: 'watch и watchEffect', section: 'Composition API', category: 'Vue 3', progress: 62, completed: false },
  { id: '2', title: 'Введение в Composition API', section: 'Composition API', category: 'Vue 3', progress: 100, completed: true },
  { id: '3', title: 'Глубокое наблюдение (deep)', section: 'Reactivity', category: 'Vue 3', progress: 25, completed: false },
  { id: '4', title: 'Остановка наблюдателей (stop)', section: 'Reactivity', category: 'Vue 3', progress: 0, completed: false },
])

// Sample Active Recall Flashcard
const activeQuestion: QuestionData = {
  id: 'q-201',
  title: 'Composition API: watch & watchEffect',
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

const selectedQuizOption = ref<string | null>(null)
const isQuizSubmitted = ref<boolean>(false)
const ratingResult = ref<string | null>(null)

const onRateQuestion = (payload: { id: string | number; rating: string }) => {
  if (!isLoggedIn.value) {
    ratingResult.value = 'Оценка зафиксирована локально! Войдите в Кабинет, чтобы сохранить её в профиле Supabase 🟢'
    return
  }
  ratingResult.value = 'Ваша оценка сохранёна в Кабинете: ' + (payload.rating === 'know' ? 'Знаю 🟢' : payload.rating === 'doubt' ? 'Сомневаюсь 🟡' : 'Повторить 🔴')
}

const onSubmitQuiz = () => {
  if (selectedQuizOption.value) {
    isQuizSubmitted.value = true
  }
}

const goToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <div class="workspace-page">
    <!-- Guest / Public Notice Banner -->
    <div v-if="!isLoggedIn" class="guest-banner">
      <UiAlert variant="info" title="🌐 Публичный доступ к документации" closable>
        <div class="guest-banner__content">
          <span>Вся база знаний и справочники открыты <strong>бесплатно без авторизации</strong>! Войдите в аккаунт, чтобы автоматически сохранять ваш прогресс прочтения, оценки Active Recall и Ударный Режим (Streak).</span>
          <UiButton variant="primary" size="sm" @click="goToAuth">
            🔑 Войти в Кабинет
          </UiButton>
        </div>
      </UiAlert>
    </div>

    <!-- Authorized Member Header Banner -->
    <div v-else class="member-header-banner">
      <UiCard variant="glow" padding="md">
        <div class="member-info">
          <div class="member-info__title">
            <span>👋 С возвращением в Кабинет!</span>
            <UiBadge variant="success">Ударный режим: {{ userStreak }} дней 🔥</UiBadge>
          </div>
          <p>Ваш прогресс прочтения и ответы синхронизируются с базой данных Supabase.</p>
        </div>
      </UiCard>
    </div>

    <!-- Navigation Tabs: Bookish Codex (01 Search, 02 Knowledge Map, 03 Reader, 04 Quiz) -->
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

    <!-- SCREEN 01: Search & Categories -->
    <main class="codex-main">
      <section v-if="activeTab === 'search'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="codex-header-banner">
            <div class="codex-header-banner__symbol">🧭</div>
            <h2 class="codex-header-banner__title">Справочник & Открытая Документация</h2>
            <p class="codex-header-banner__sub">Изучайте любые материалы без ограничений</p>
          </div>

          <div class="codex-search-box">
            <UiInput v-model="searchQuery" placeholder="Поиск по статьям, темам и коду..." clearable>
              <template #icon-left>🔍</template>
              <template #hint>Нажмите ⌘K для быстрого поиска</template>
            </UiInput>
          </div>

          <div class="codex-dashboard-grid">
            <div class="codex-continue-card">
              <div class="codex-continue-card__badge">Текущая тема:</div>
              <h4 class="codex-continue-card__title">watch и watchEffect</h4>
              <UiProgressBar :value="62" label="Прогресс изученного материала" show-label animated />
              <div style="margin-top: 1rem">
                <UiButton variant="primary" size="sm" @click="activeTab = 'article'">
                  Продолжить чтение →
                </UiButton>
              </div>
            </div>

            <div class="codex-categories-list">
              <h3>Разделы Дисциплин</h3>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">💻</span>
                <span class="codex-cat-item__name">Frontend Разработка (Vue 3, React)</span>
                <span class="codex-cat-item__count">1 284 темы &gt;</span>
              </div>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">⚙️</span>
                <span class="codex-cat-item__name">Backend & Базы Данных (Node.js, Supabase)</span>
                <span class="codex-cat-item__count">842 темы &gt;</span>
              </div>
              <div class="codex-cat-item">
                <span class="codex-cat-item__icon">🎨</span>
                <span class="codex-cat-item__name">UI/UX Дизайн & FSD Архитектура</span>
                <span class="codex-cat-item__count">658 тем &gt;</span>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- SCREEN 02: Knowledge Map -->
      <section v-if="activeTab === 'nav'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="codex-map-header">
            <UiBadge variant="primary">КАРТА ЗНАНИЙ ★</UiBadge>
          </div>

          <div class="bookmark-cards-stack">
            <div class="bookmark-card bookmark-card--lvl1">01 Программирование</div>
            <div class="bookmark-card bookmark-card--lvl2">02 Frontend</div>
            <div class="bookmark-card bookmark-card--lvl3">03 Vue 3</div>
            <div class="bookmark-card bookmark-card--lvl4">04 Composition API</div>
            <div class="bookmark-card bookmark-card--lvl5">05 watch и watchEffect</div>
          </div>

          <div class="codex-topics-list">
            <div
              v-for="item in topics"
              :key="item.id"
              class="codex-topic-row"
              :class="{ 'codex-topic-row--completed': item.completed, 'codex-topic-row--active': item.id === '1' }"
            >
              <span>📄 {{ item.title }}</span>
              <div style="display: flex; align-items: center; gap: 0.75rem">
                <UiProgressBar :value="item.progress" size="sm" style="width: 80px" />
                <span class="codex-topic-row__badge">{{ item.progress }}%</span>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- SCREEN 03: Article Reader -->
      <section v-if="activeTab === 'article'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="article-header">
            <UiBadge variant="secondary">ГЛАВА 05</UiBadge>
            <div class="article-breadcrumbs">
              Frontend &gt; Vue 3 &gt; Composition API &gt; watch и watchEffect
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

            <div class="code-block">
              <div class="code-block__header">Пример: watch</div>
              <pre><code>1 | import { ref, watch } from 'vue'
2 | const count = ref(0)
3 | watch(count, (newVal) => console.log('Count изменился'))</code></pre>
            </div>
          </div>

          <div class="article-footer">
            <UiButton variant="secondary" @click="activeTab = 'nav'">← К карте знаний</UiButton>
            <UiButton variant="primary" @click="activeTab = 'quiz'">Пройти тест по статье →</UiButton>
          </div>
        </UiCard>
      </section>

      <!-- SCREEN 04: Self-Quiz & Active Recall -->
      <section v-if="activeTab === 'quiz'" class="codex-screen">
        <UiCard variant="glass" padding="lg">
          <div class="quiz-header">
            <UiBadge variant="primary">ПРОВЕРКА ЗНАНИЙ</UiBadge>
            <h2 class="quiz-title">Проверка понимания: watchEffect</h2>
            <p class="quiz-meta">Доступно для всех • результаты сохраняются в Кабинете</p>
          </div>

          <div class="quiz-step-bar">
            <UiProgressBar :value="50" size="sm" />
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
          </div>

          <div class="quiz-flashcard-wrapper">
            <h3 class="quiz-flashcard-title">🃏 Тренaжёр Active Recall (3D Flip)</h3>
            <InteractiveFlashcard :data="activeQuestion" @rate="onRateQuestion" />
            <div v-if="ratingResult" class="ui-kit-demo-result">
              <UiAlert variant="info" title="Статус оценки">
                {{ ratingResult }}
              </UiAlert>
            </div>
          </div>
        </UiCard>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.workspace-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.guest-banner {
  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;

    span {
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.4;
    }
  }
}

.member-header-banner {
  .member-info {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    &__title {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--text-main);
    }

    p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
  }
}

.codex-nav-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.codex-nav-tab {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &__num {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  &__icon {
    font-size: 1.1rem;
  }

  &:hover {
    background: var(--bg-card-hover);
    color: var(--text-main);
  }

  &--active {
    background: var(--primary-gradient);
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-glow);
  }
}

.codex-main {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.codex-header-banner {
  text-align: center;
  margin-bottom: 2rem;

  &__symbol {
    font-size: 2.5rem;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 800;
  }

  &__sub {
    color: var(--text-muted);
  }
}

.codex-search-box {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.codex-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.codex-continue-card {
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);

  &__badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 800;
    margin: 0.5rem 0 1rem;
  }
}

.codex-categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
}

.codex-cat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);

  &__name {
    flex: 1;
    font-weight: 600;
  }

  &__count {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
}

.bookmark-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.bookmark-card {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  font-weight: 700;

  &--lvl1 { margin-left: 0px; }
  &--lvl2 { margin-left: 15px; }
  &--lvl3 { margin-left: 30px; }
  &--lvl4 { margin-left: 45px; }
  &--lvl5 { margin-left: 60px; color: var(--primary); border-color: var(--primary); }
}

.codex-topics-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.codex-topic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  font-weight: 600;

  &--completed { color: var(--success); }
  &--active { border-color: var(--primary); font-weight: 800; }
}

.article-header {
  margin-bottom: 1.5rem;
}

.article-breadcrumbs {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.5rem 0;
}

.article-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.article-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  line-height: 1.7;
  font-size: 1.05rem;
}

.code-block {
  border-radius: var(--radius-md);
  background: #1e1e2e;
  color: #cdd6f4;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &__header {
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    font-weight: 700;
    color: #a6adc8;
  }

  pre {
    padding: 1rem;
    margin: 0;
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.article-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.quiz-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.quiz-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0.5rem 0;
}

.quiz-meta {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.quiz-step-bar {
  margin-bottom: 2rem;
}

.quiz-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.quiz-flashcard-wrapper {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.quiz-flashcard-title {
  font-size: 1.2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.5rem;
}

.ui-kit-demo-result {
  margin-top: 1.5rem;
}
</style>