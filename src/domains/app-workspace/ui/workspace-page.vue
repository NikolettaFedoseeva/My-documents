<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type AppTheme } from 'lern-ui-kit'
import { useStudyWorkspace } from '../model/use-study-workspace'
import {
  UiButton,
  UiBadge,
  UiCard,
  UiInput,
  UiProgressBar,
  UiToggle,
  UiAvatar,
  UiAlert,
  UiQuestion,
  InteractiveFlashcard,
  type QuestionData,
  type QuestionOption,
} from 'lern-ui-kit'

// #region Hooks & Setup
const { currentTheme, themes, setTheme } = useTheme()
const {
  topics,
  filteredTopics,
  currentTopic,
  currentView,
  isFocusMode,
  searchQuery,
  overallProgress,
  selectTopic,
  setView,
  toggleFocus,
  updateProgress,
} = useStudyWorkspace()

// Quiz State
const quizOptions: QuestionOption[] = [
  {
    id: 'opt-a',
    label: 'A',
    text: 'РљРѕРіРґР° РЅСѓР¶РЅРѕ РѕС‚СЃР»РµРґРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РёСЃС‚РѕС‡РЅРёРєР° Рё РїРѕР»СѓС‡РёС‚СЊ СЃС‚Р°СЂРѕРµ Рё РЅРѕРІРѕРµ Р·РЅР°С‡РµРЅРёСЏ.',
  },
  {
    id: 'opt-b',
    label: 'B',
    text: 'РљРѕРіРґР° Р·Р°РІРёСЃРёРјРѕСЃС‚Рё Р·Р°СЂР°РЅРµРµ РЅРµРёР·РІРµСЃС‚РЅС‹, РёР»Рё РёС… РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РІРЅСѓС‚СЂРё РєРѕР»Р±СЌРєР° РјРѕР¶РµС‚ РјРµРЅСЏС‚СЊСЃСЏ.',
  },
  {
    id: 'opt-c',
    label: 'C',
    text: 'РљРѕРіРґР° РЅСѓР¶РЅРѕ РѕС‚СЃР»РµР¶РёРІР°С‚СЊ С‚РѕР»СЊРєРѕ РЅРµСЃРєРѕР»СЊРєРѕ С„РёРєСЃРёСЂРѕРІР°РЅРЅС‹С… РїРѕР»РµР№ РѕР±СЉРµРєС‚Р°.',
  },
]

const selectedQuizOption = ref<string>('opt-b')
const isQuizSubmitted = ref<boolean>(false)
const quizRatingResult = ref<string | null>(null)

const flashcardData: QuestionData = {
  id: 'q-flash-1',
  category: 'Vue 3',
  section: 'Composition API',
  difficulty: 'medium',
  question: 'Р’ С‡С‘Рј СЂР°Р·РЅРёС†Р° РјРµР¶РґСѓ ref() Рё reactive()?',
  answer:
    'ref() РѕР±РѕСЂР°С‡РёРІР°РµС‚ Р»СЋР±РѕР№ С‚РёРї РґР°РЅРЅС‹С… РІ РѕР±СЉРµРєС‚ СЃ РїРѕР»РµРј .value.\nreactive() СЂР°Р±РѕС‚Р°РµС‚ РўРћР›Р¬РљРћ СЃ РѕР±СЉРµРєС‚Р°РјРё Рё СЃРѕР·РґР°РµС‚ РіР»СѓР±РѕРєСѓСЋ РїСЂРѕРєСЃРё-РѕР±РµСЂС‚РєСѓ.',
}

const onSubmitQuiz = () => {
  isQuizSubmitted.value = true
  updateProgress(currentTopic.value.id, 100)
}

const onResetQuiz = () => {
  isQuizSubmitted.value = false
}

const onRateFlashcard = (payload: { rating: string }) => {
  quizRatingResult.value = `РћС‚РІРµС‚ СЃРѕС…СЂР°РЅС‘РЅ: ${payload.rating === 'know' ? 'Р—РЅР°СЋ рџџў' : 'РџРѕРІС‚РѕСЂРёС‚СЊ рџ”ґ'}`
}
// #endregion Hooks & Setup
</script>

<template>
  <div class="workspace-page" :class="{ 'workspace-page--focus': isFocusMode }">
    <!-- Top Header Navigation (Hidden in Focus Mode) -->
    <header v-if="!isFocusMode" class="workspace-header">
      <div class="workspace-header__left">
        <div class="workspace-header__brand">
          <span class="workspace-header__icon">рџ“–</span>
          <span class="workspace-header__title">Lern Codex Workspace</span>
        </div>
        <UiBadge variant="primary" dot>Р’Р•Р РЎРРЇ 1.0</UiBadge>
      </div>

      <div class="workspace-header__center">
        <div class="workspace-header__user">
          <UiAvatar name="РђРЅРЅР° РЎРјРёСЂРЅРѕРІР°" status="online" size="md" />
          <div class="workspace-header__user-info">
            <span class="workspace-header__user-name">РђРЅРЅР° РЎРјРёСЂРЅРѕРІР°</span>
            <span class="workspace-header__user-role">РСЃСЃР»РµРґРѕРІР°С‚РµР»СЊ вЂў РЈСЂРѕРІРµРЅСЊ 4</span>
          </div>
        </div>
      </div>

      <div class="workspace-header__right">
        <!-- Focus Toggle -->
        <UiToggle :model-value="isFocusMode" label="Focus Mode" @change="toggleFocus" />

        <!-- Theme Switcher -->
        <div class="theme-menu">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-mini-btn"
            :class="{ 'theme-mini-btn--active': currentTheme === theme.id }"
            :title="theme.name"
            @click="setTheme(theme.id as AppTheme)"
          >
            {{ theme.icon }}
          </button>
        </div>
      </div>
    </header>

    <!-- Overall Course Progress Bar (Hidden in Focus Mode) -->
    <div v-if="!isFocusMode" class="workspace-progress-strip">
      <UiProgressBar
        :value="overallProgress"
        variant="primary"
        :label="`РћР±С‰РёР№ РїСЂРѕРіСЂРµСЃСЃ РїСЂРѕС…РѕР¶РґРµРЅРёСЏ РєСѓСЂСЃР°: ${overallProgress}%`"
        show-label
        animated
      />
    </div>

    <!-- Main Navigation Tabs for 4 Screens -->
    <nav v-if="!isFocusMode" class="workspace-nav-tabs">
      <button
        class="workspace-tab-btn"
        :class="{ 'workspace-tab-btn--active': currentView === 'search' }"
        @click="setView('search')"
      >
        <span class="workspace-tab-btn__num">01</span>
        <span>рџ”Ќ РџРѕРёСЃРє & Р Р°Р·РґРµР»С‹</span>
      </button>

      <button
        class="workspace-tab-btn"
        :class="{ 'workspace-tab-btn--active': currentView === 'tree' }"
        @click="setView('tree')"
      >
        <span class="workspace-tab-btn__num">02</span>
        <span>рџ—є РљР°СЂС‚Р° Р—РЅР°РЅРёР№</span>
      </button>

      <button
        class="workspace-tab-btn"
        :class="{ 'workspace-tab-btn--active': currentView === 'reader' }"
        @click="setView('reader')"
      >
        <span class="workspace-tab-btn__num">03</span>
        <span>рџ“– Р§С‚РµРЅРёРµ РЎС‚Р°С‚СЊРё</span>
      </button>

      <button
        class="workspace-tab-btn"
        :class="{ 'workspace-tab-btn--active': currentView === 'quiz' }"
        @click="setView('quiz')"
      >
        <span class="workspace-tab-btn__num">04</span>
        <span>рџЋЇ РЎР°РјРѕРїСЂРѕРІРµСЂРєР°</span>
      </button>
    </nav>

    <!-- Floating Focus Un-toggle Button when Focus Mode active -->
    <div v-else class="focus-exit-bar">
      <span>вњЁ Р РµР¶РёРј РїРѕР»РЅРѕР№ РєРѕРЅС†РµРЅС‚СЂР°С†РёРё (Focus Mode)</span>
      <UiButton variant="ghost" size="sm" @click="toggleFocus">Р’С‹Р№С‚Рё РёР· Focus Mode вњ•</UiButton>
    </div>

    <!-- Main Content Container -->
    <main class="workspace-main">
      <!-- 01. SEARCH & SECTIONS -->
      <section v-if="currentView === 'search'" class="workspace-view">
        <UiCard variant="glass" padding="lg">
          <div class="workspace-search-header">
            <h2>рџ§­ РЎРїСЂР°РІРѕС‡РЅС‹Р№ РљР°С‚Р°Р»РѕРі Р—РЅР°РЅРёР№</h2>
            <p>Р’С‹Р±РµСЂРёС‚Рµ С‚РµРјСѓ РёР»Рё РІРѕСЃРїРѕР»СЊР·СѓР№С‚РµСЃСЊ Р¶РёРІС‹Рј РїРѕРёСЃРєРѕРј</p>
          </div>

          <div class="workspace-search-input">
            <UiInput v-model="searchQuery" placeholder="РџРѕРёСЃРє РїРѕ С‚РµРјР°Рј Рё СЂР°Р·РґРµР»Р°Рј..." clearable>
              <template #icon-left>рџ”Ќ</template>
            </UiInput>
          </div>

          <div class="workspace-topics-grid">
            <div
              v-for="item in filteredTopics"
              :key="item.id"
              class="workspace-topic-card"
              :class="{ 'workspace-topic-card--active': currentTopic.id === item.id }"
              @click="selectTopic(item.id, 'reader')"
            >
              <div class="workspace-topic-card__header">
                <UiBadge :variant="item.isCompleted ? 'success' : 'primary'">
                  {{ item.section }}
                </UiBadge>
                <span class="workspace-topic-card__time">вЏ± {{ item.readTime }}</span>
              </div>
              <h3 class="workspace-topic-card__title">{{ item.title }}</h3>
              <UiProgressBar :value="item.progress" size="sm" animated />
              <div class="workspace-topic-card__footer">
                <span>РџСЂРѕРіСЂРµСЃСЃ: {{ item.progress }}%</span>
                <UiButton variant="secondary" size="sm">Р§РёС‚Р°С‚СЊ в†’</UiButton>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- 02. KNOWLEDGE MAP (TREE & STACKED BOOKMARKS) -->
      <section v-if="currentView === 'tree'" class="workspace-view">
        <UiCard variant="glass" padding="lg">
          <div class="workspace-tree-header">
            <h2>рџ—є РРµСЂР°СЂС…РёС‡РµСЃРєР°СЏ РљР°СЂС‚Р° Р—РЅР°РЅРёР№</h2>
            <p>РќР°Р¶РјРёС‚Рµ РЅР° Р»СЋР±СѓСЋ С‚РµРјСѓ РґР»СЏ РїРµСЂРµС…РѕРґР° Рє РµС‘ РёР·СѓС‡РµРЅРёСЋ</p>
          </div>

          <!-- Cascading Bookmarks -->
          <div class="stacked-bookmarks">
            <div class="bookmark-card bookmark-card--lvl1">01 РџСЂРѕРіСЂР°РјРјРёСЂРѕРІР°РЅРёРµ</div>
            <div class="bookmark-card bookmark-card--lvl2">02 Frontend</div>
            <div class="bookmark-card bookmark-card--lvl3">03 Vue 3</div>
            <div class="bookmark-card bookmark-card--lvl4">04 Composition API</div>
          </div>

          <!-- Topics List -->
          <div class="workspace-tree-list">
            <div
              v-for="topicItem in topics"
              :key="topicItem.id"
              class="tree-row"
              :class="{
                'tree-row--active': topicItem.id === currentTopic.id,
                'tree-row--completed': topicItem.isCompleted
              }"
              @click="selectTopic(topicItem.id, 'reader')"
            >
              <div class="tree-row__title">
                <span class="tree-row__icon">{{ topicItem.isCompleted ? 'вњ“' : 'рџ“„' }}</span>
                <span>{{ topicItem.title }}</span>
              </div>
              <div class="tree-row__right">
                <UiProgressBar :value="topicItem.progress" size="sm" style="width: 100px" />
                <span class="tree-row__pct">{{ topicItem.progress }}%</span>
                <UiButton variant="secondary" size="sm">РћС‚РєСЂС‹С‚СЊ</UiButton>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- 03. ARTICLE READER -->
      <section v-if="currentView === 'reader'" class="workspace-view">
        <UiCard variant="parchment" padding="lg">
          <div class="reader-header">
            <div class="reader-breadcrumbs">
              {{ currentTopic.category }} &gt; {{ currentTopic.section }} &gt; {{ currentTopic.title }}
            </div>
            <h1 class="reader-title">{{ currentTopic.title }}</h1>
            <div class="reader-meta">
              <UiBadge variant="secondary">вЏ± {{ currentTopic.readTime }}</UiBadge>
              <UiProgressBar :value="currentTopic.progress" size="sm" style="width: 140px" />
              <span>РћСЃРІРѕРµРЅРѕ {{ currentTopic.progress }}%</span>
            </div>
          </div>

          <div class="reader-body">
            <p v-for="(paragraph, idx) in currentTopic.content.split('\n\n')" :key="idx">
              {{ paragraph }}
            </p>

            <div v-if="currentTopic.codeSnippet" class="code-box">
              <div class="code-box__header">Р¤СЂР°РіРјРµРЅС‚ РєРѕРґР°</div>
              <pre><code>{{ currentTopic.codeSnippet }}</code></pre>
            </div>
          </div>

          <div class="reader-footer">
            <UiButton variant="secondary" @click="setView('tree')">в†ђ РќР°Р·Р°Рґ Рє РєР°СЂС‚Рµ</UiButton>
            <UiButton variant="primary" @click="setView('quiz')">РџРµСЂРµР№С‚Рё Рє СЃР°РјРѕРїСЂРѕРІРµСЂРєРµ рџЋЇ в†’</UiButton>
          </div>
        </UiCard>
      </section>

      <!-- 04. QUIZ & ACTIVE RECALL -->
      <section v-if="currentView === 'quiz'" class="workspace-view">
        <UiCard variant="glass" padding="lg">
          <div class="quiz-header">
            <h2>рџЋЇ РЎР°РјРѕРїСЂРѕРІРµСЂРєР°: {{ currentTopic.title }}</h2>
            <p>РћС‚РІРµС‚СЊС‚Рµ РЅР° РІРѕРїСЂРѕСЃС‹ Рё РїСЂРѕРІРµСЂСЊС‚Рµ РїР°РјСЏС‚СЊ</p>
          </div>

          <UiAlert v-if="currentTopic.isCompleted" variant="success" style="margin-bottom: 1.5rem">
            РўРµРјР° СѓР¶Рµ РѕСЃРІРѕРµРЅР° РЅР° 100%! Р’С‹ РјРѕР¶РµС‚Рµ РїСЂРѕР№С‚Рё РїСЂРѕРІРµСЂРєСѓ РїРѕРІС‚РѕСЂРЅРѕ РґР»СЏ Р·Р°РєСЂРµРїР»РµРЅРёСЏ.
          </UiAlert>

          <UiQuestion
            v-model="selectedQuizOption"
            question="РљРѕРіРґР° СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РїСЂРёРјРµРЅСЏС‚СЊ РґР°РЅРЅС‹Р№ РјРµС…Р°РЅРёР·Рј?"
            :options="quizOptions"
            correct-id="opt-b"
            :is-submitted="isQuizSubmitted"
          />

          <div class="quiz-footer-actions">
            <UiButton v-if="!isQuizSubmitted" variant="primary" size="lg" @click="onSubmitQuiz">
              РџРѕРґС‚РІРµСЂРґРёС‚СЊ РѕС‚РІРµС‚
            </UiButton>
            <UiButton v-else variant="secondary" size="lg" @click="onResetQuiz">
              РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°
            </UiButton>
          </div>

          <!-- Active Recall Flashcard Section -->
          <div class="flashcard-section">
            <h3>рџѓЏ Active Recall РўСЂРµРЅР°Р¶С‘СЂ</h3>
            <InteractiveFlashcard :data="flashcardData" @rate="onRateFlashcard" />
            <div v-if="quizRatingResult" class="ui-kit-demo-result">
              {{ quizRatingResult }}
            </div>
          </div>
        </UiCard>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.workspace-page {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;

  &--focus {
    max-width: 900px;
    padding-top: 1.5rem;
  }
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;

  &__left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--text-main);
  }

  &__center {
    display: flex;
    align-items: center;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__user-info {
    display: flex;
    flex-direction: column;
  }

  &__user-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-main);
  }

  &__user-role {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
}

.theme-menu {
  display: flex;
  gap: 0.35rem;
}

.theme-mini-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-card-hover);
  }

  &--active {
    background: var(--primary-gradient);
    border-color: transparent;
  }
}

.workspace-progress-strip {
  margin-bottom: 1.75rem;
}

.workspace-nav-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.workspace-tab-btn {
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
    font-size: 0.85rem;
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
  }
}

.focus-exit-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color-glow);
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.workspace-search-header {
  margin-bottom: 1.5rem;
  h2 { font-size: 1.75rem; font-weight: 800; color: var(--text-main); }
  p { color: var(--text-muted); }
}

.workspace-search-input {
  margin-bottom: 2rem;
}

.workspace-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.workspace-topic-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: var(--bg-card-hover);
    border-color: var(--border-color-glow);
  }

  &--active {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-main);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
  }
}

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
  &--lvl4 { margin-left: 3rem; background: var(--primary-gradient); color: var(--text-inverse); }
}

.workspace-tree-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tree-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;

  &:hover {
    background: var(--bg-card-hover);
  }

  &--active {
    border-color: var(--primary);
    font-weight: 700;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    color: var(--text-main);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__pct {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--primary);
  }
}

/* Reader */
.reader-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.reader-breadcrumbs {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.reader-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.reader-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.reader-body {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.code-box {
  margin: 1.5rem 0;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  overflow: hidden;

  &__header {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-muted);
  }

  pre {
    margin: 0;
    padding: 1.25rem;
    font-family: monospace;
  }
}

.reader-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.quiz-footer-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.flashcard-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-color);

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 1.25rem;
  }
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
