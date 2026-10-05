<script setup lang="ts">
import { DocItem, DocBadge, DocCodeBlock, DocAdapter } from '@/entities/doc'
import { RateDocWidget } from '@/features/rate-doc'
import DocsStudyDeck from './docs-study-deck.vue'

// #region defineProps
interface Props {
  doc: DocItem | null
  showInlineStudyDeck?: boolean
  prevDoc?: DocItem | null
  nextDoc?: DocItem | null
}

const props = withDefaults(defineProps<Props>(), {
  showInlineStudyDeck: false,
  prevDoc: null,
  nextDoc: null,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'rated', payload: { usefulCount: number; notUsefulCount: number }): void
  (e: 'selectDoc', docId: string): void
}>()
// #endregion defineEmits
</script>

<template>
  <main v-if="props.doc" class="docs-content-viewer">
    <!-- Пергаментный лист статьи (Codex Sheet) -->
    <article class="codex-sheet">
      <!-- Шапка статьи -->
      <header class="codex-sheet__header">
        <div class="codex-sheet__top-meta">
          <div class="codex-sheet__tags">
            <span v-if="props.doc.code" class="codex-chapter-code">ГЛАВА {{ props.doc.code }}</span>
            <DocBadge
              v-for="tag in props.doc.tags"
              :key="tag"
              :text="tag"
              variant="primary"
            />
          </div>

          <div class="codex-sheet__read-stats">
            <span>⏱️ {{ props.doc.readTimeMinutes }} мин чтения</span>
            <span>📅 {{ DocAdapter.formatDate(props.doc.updatedAt) }}</span>
          </div>
        </div>

        <h1 class="codex-sheet__title">{{ props.doc.title }}</h1>
        <p class="codex-sheet__desc">{{ props.doc.description }}</p>

        <div class="codex-sheet__author-row">
          <div class="codex-sheet__author">
            <img
              :src="props.doc.author.avatar"
              :alt="props.doc.author.name"
              class="codex-sheet__avatar"
            />
            <div class="codex-sheet__author-info">
              <span class="codex-sheet__author-name">{{ props.doc.author.name }}</span>
              <span class="codex-sheet__author-role">{{ props.doc.author.role }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="codex-sheet__divider"></div>

      <!-- Основной текст статьи -->
      <div class="codex-sheet__body">
        <section
          v-for="section in props.doc.sections"
          :key="section.id"
          :id="section.id"
          class="codex-sheet__section"
        >
          <h2 v-if="section.level === 2" class="codex-sheet__h2">
            {{ section.title }}
          </h2>
          <h3 v-else-if="section.level === 3" class="codex-sheet__h3">
            {{ section.title }}
          </h3>

          <p class="codex-sheet__paragraph">{{ section.text }}</p>

          <!-- Callout цитата / подсказка -->
          <div
            v-if="section.callout"
            :class="['codex-callout', `codex-callout--${section.callout.type}`]"
          >
            <span class="codex-callout__icon">
              {{ section.callout.type === 'tip' ? '💡' : section.callout.type === 'warning' ? '⚠️' : 'ℹ️' }}
            </span>
            <span class="codex-callout__text">{{ section.callout.message }}</span>
          </div>

          <!-- Блок кода -->
          <DocCodeBlock
            v-if="section.codeSnippet"
            :code="section.codeSnippet.code"
            :language="section.codeSnippet.language"
            :filename="section.codeSnippet.filename"
          />
        </section>
      </div>

      <!-- Встроенный тренажер самопроверки для мобилок и планшетов (под текстом) -->
      <div v-if="props.showInlineStudyDeck" class="codex-sheet__inline-deck">
        <DocsStudyDeck :doc="props.doc" />
      </div>

      <!-- Навигация: Предыдущая / Следующая глава -->
      <nav class="codex-nav-footer">
        <button
          v-if="props.prevDoc"
          type="button"
          class="codex-nav-btn codex-nav-btn--prev"
          @click="emit('selectDoc', props.prevDoc.id)"
        >
          <span class="nav-sub">← Назад</span>
          <span class="nav-title">{{ props.prevDoc.title }}</span>
        </button>
        <div v-else class="codex-nav-spacer"></div>

        <button
          v-if="props.nextDoc"
          type="button"
          class="codex-nav-btn codex-nav-btn--next"
          @click="emit('selectDoc', props.nextDoc.id)"
        >
          <span class="nav-sub">Далее →</span>
          <span class="nav-title">{{ props.nextDoc.title }}</span>
        </button>
      </nav>

      <!-- Оценка полезности -->
      <footer class="codex-sheet__footer">
        <RateDocWidget
          :doc-id="props.doc.id"
          :useful-count="props.doc.usefulCount"
          :not-useful-count="props.doc.notUsefulCount"
          @rated="emit('rated', $event)"
        />
      </footer>
    </article>
  </main>

  <div v-else class="docs-empty">
    <span class="docs-empty__icon">📖</span>
    <p>Выберите главу из Дерева Знаний для чтения</p>
  </div>
</template>

<style scoped lang="scss">
.docs-content-viewer {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0;
  }
}

.codex-sheet {
  background: var(--bg-card, #f9f6f0);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-md, 16px);
  padding: 2.5rem 3rem;
  box-shadow: var(--shadow-main, 0 10px 30px rgba(0, 0, 0, 0.15));
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--text-main, #1e293b);
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 12px;
  }

  &__top-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .codex-chapter-code {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    background: var(--bg-container, #1e3a8a);
    color: var(--text-inverse, #ffffff);
  }

  &__read-stats {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--text-muted, #64748b);
  }

  &__title {
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.85rem;

    @media (max-width: 768px) {
      font-size: 1.6rem;
    }
  }

  &__desc {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-muted, #475569);
    margin: 0 0 1.5rem;
  }

  &__author-row {
    display: flex;
    align-items: center;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color, #e2d9cc);
  }

  &__author-info {
    display: flex;
    flex-direction: column;
  }

  &__author-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
  }

  &__author-role {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
  }

  &__divider {
    height: 1px;
    background: var(--border-color, rgba(0, 0, 0, 0.08));
    margin: 0.5rem 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  &__section {
    scroll-margin-top: 2rem;
  }

  &__h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.85rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  }

  &__h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main, #1e293b);
    margin: 0 0 0.6rem;
  }

  &__paragraph {
    font-size: 1.025rem;
    line-height: 1.75;
    color: var(--text-main, #334155);
    margin: 0;
  }

  &__inline-deck {
    margin-top: 1.5rem;
  }
}

/* Callout block */
.codex-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-radius: 12px;
  margin: 1.25rem 0;
  font-size: 0.92rem;
  line-height: 1.6;

  &__icon {
    font-size: 1.2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  &--tip {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #065f46;
  }

  &--warning {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #92400e;
  }

  &--info {
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #075985;
  }
}

/* Nav Footer */
.codex-nav-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.codex-nav-spacer {
  flex: 1;
}

.codex-nav-btn {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  background: var(--bg-card-hover, rgba(0, 0, 0, 0.04));
  color: var(--text-main, #1e293b);
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 45%;

  &:hover {
    border-color: var(--primary, #38bdf8);
    background: var(--bg-card, #ffffff);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .nav-sub {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted, #64748b);
    text-transform: uppercase;
  }

  .nav-title {
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &--next {
    text-align: right;
    margin-left: auto;
  }
}

.docs-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted, #94a3b8);
  gap: 1rem;

  &__icon {
    font-size: 3rem;
  }
}
</style>
