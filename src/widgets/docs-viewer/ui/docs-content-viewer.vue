<script setup lang="ts">
import { DocItem, DocBadge, DocCodeBlock, DocAdapter } from '@/entities/doc'
import { RateDocWidget } from '@/features/rate-doc'

// #region defineProps
interface Props {
  doc: DocItem | null
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'rated', payload: { usefulCount: number; notUsefulCount: number }): void
}>()
// #endregion defineEmits
</script>

<template>
  <main v-if="props.doc" class="docs-content-viewer">
    <!-- Шапка статьи -->
    <header class="docs-content-viewer__header">
      <div class="docs-content-viewer__tags">
        <DocBadge
          v-for="tag in props.doc.tags"
          :key="tag"
          :text="tag"
          variant="primary"
        />
      </div>

      <h1 class="docs-content-viewer__title">{{ props.doc.title }}</h1>
      <p class="docs-content-viewer__desc">{{ props.doc.description }}</p>

      <div class="docs-content-viewer__meta">
        <div class="docs-content-viewer__author">
          <img
            :src="props.doc.author.avatar"
            :alt="props.doc.author.name"
            class="docs-content-viewer__avatar"
          />
          <div class="docs-content-viewer__author-info">
            <span class="docs-content-viewer__author-name">{{ props.doc.author.name }}</span>
            <span class="docs-content-viewer__author-role">{{ props.doc.author.role }}</span>
          </div>
        </div>

        <div class="docs-content-viewer__stats">
          <span>📅 {{ DocAdapter.formatDate(props.doc.updatedAt) }}</span>
          <span>⏱️ {{ props.doc.readTimeMinutes }} мин чтения</span>
        </div>
      </div>
    </header>

    <!-- Секции контента -->
    <article class="docs-content-viewer__body">
      <div
        v-for="section in props.doc.sections"
        :key="section.id"
        :id="section.id"
        class="docs-content-viewer__section"
      >
        <h2 v-if="section.level === 2" class="docs-content-viewer__h2">
          {{ section.title }}
        </h2>
        <h3 v-else-if="section.level === 3" class="docs-content-viewer__h3">
          {{ section.title }}
        </h3>

        <p class="docs-content-viewer__paragraph">{{ section.text }}</p>

        <!-- Callout block -->
        <div
          v-if="section.callout"
          :class="['docs-content-viewer__callout', `docs-content-viewer__callout--${section.callout.type}`]"
        >
          <span class="docs-content-viewer__callout-icon">
            {{ section.callout.type === 'tip' ? '💡' : section.callout.type === 'warning' ? '⚠️' : 'ℹ️' }}
          </span>
          <span class="docs-content-viewer__callout-text">{{ section.callout.message }}</span>
        </div>

        <!-- Code Snippet -->
        <DocCodeBlock
          v-if="section.codeSnippet"
          :code="section.codeSnippet.code"
          :language="section.codeSnippet.language"
          :filename="section.codeSnippet.filename"
        />
      </div>
    </article>

    <!-- Виджет оценки -->
    <RateDocWidget
      :doc-id="props.doc.id"
      :useful-count="props.doc.usefulCount"
      :not-useful-count="props.doc.notUsefulCount"
      @rated="emit('rated', $event)"
    />
  </main>

  <div v-else class="docs-content-viewer__empty">
    <span>Выберите статью из списка слева 📖</span>
  </div>
</template>

<style scoped lang="scss">
.docs-content-viewer {
  flex: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
  color: #f1f5f9;

  &__header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__tags {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  &__desc {
    font-size: 1.1rem;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(99, 102, 241, 0.4);
  }

  &__author-info {
    display: flex;
    flex-direction: column;
  }

  &__author-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  &__author-role {
    font-size: 0.75rem;
    color: #64748b;
  }

  &__stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__section {
    scroll-margin-top: 2rem;
  }

  &__h2 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.75rem;
  }

  &__h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #cbd5e1;
    margin-bottom: 0.5rem;
  }

  &__paragraph {
    font-size: 0.975rem;
    line-height: 1.7;
    color: #cbd5e1;
  }

  &__callout {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    margin: 1rem 0;
    font-size: 0.9rem;
    line-height: 1.5;

    &--tip {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #a7f3d0;
    }

    &--warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fde68a;
    }

    &--info {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: #c7d2fe;
    }
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #64748b;
  }
}
</style>
