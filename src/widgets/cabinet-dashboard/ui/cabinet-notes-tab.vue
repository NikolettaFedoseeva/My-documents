<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDocNotesStore } from '@/entities/doc'

const router = useRouter()
const notesStore = useDocNotesStore()

const openDoc = (courseSlug: string, docId: string) => {
  router.push({
    path: '/docs',
    query: {
      course: courseSlug,
      doc: docId,
    },
  })
}
</script>

<template>
  <div class="cabinet-notes-tab">
    <!-- Секция 1: Закладки глав -->
    <section class="notes-section">
      <div class="notes-section__header">
        <div class="notes-section__title-row">
          <span class="section-icon">🔖</span>
          <h3 class="notes-section__title">Сохранённые закладки ({{ notesStore.bookmarks.length }})</h3>
        </div>
        <p class="notes-section__desc">Быстрый доступ к важным главам и теоретическим материалам</p>
      </div>

      <div v-if="notesStore.bookmarks.length > 0" class="bookmarks-grid">
        <div
          v-for="bm in notesStore.bookmarks"
          :key="bm.id"
          class="bookmark-card"
          @click="openDoc(bm.courseSlug, bm.docId)"
        >
          <div class="bookmark-card__top">
            <span v-if="bm.chapterCode" class="bookmark-code">Глава {{ bm.chapterCode }}</span>
            <span class="bookmark-date">{{ bm.createdAt }}</span>
          </div>

          <h4 class="bookmark-card__title">{{ bm.docTitle }}</h4>
          <span class="bookmark-card__course">{{ bm.courseTitle }}</span>

          <div class="bookmark-card__footer">
            <span class="btn-read-link">Читать →</span>
            <button
              type="button"
              class="btn-remove"
              title="Удалить из закладок"
              @click.stop="notesStore.toggleBookmark({ id: bm.docId, title: bm.docTitle, code: bm.chapterCode }, { slug: bm.courseSlug, title: bm.courseTitle })"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-else class="notes-empty">
        <span class="empty-icon">📑</span>
        <p class="empty-text">Закладок пока нет</p>
        <span class="empty-sub">Нажимайте «🔖 В закладки» в шапке любой статьи в Справочнике, чтобы не потерять нужные темы.</span>
      </div>
    </section>

    <!-- Секция 2: Заметки на полях -->
    <section class="notes-section">
      <div class="notes-section__header">
        <div class="notes-section__title-row">
          <span class="section-icon">✏️</span>
          <h3 class="notes-section__title">Заметки на полях книги ({{ notesStore.marginNotes.length }})</h3>
        </div>
        <p class="notes-section__desc">Ваши личные инсайты, шпаргалки и мысли, оставленные во время изучения</p>
      </div>

      <div v-if="notesStore.marginNotes.length > 0" class="margin-notes-grid">
        <div
          v-for="note in notesStore.marginNotes"
          :key="note.id"
          class="user-margin-note"
          :class="`user-margin-note--${note.color}`"
        >
          <div class="user-margin-note__top">
            <span class="note-time">⏱ {{ note.createdAt }}</span>
            <button
              type="button"
              class="btn-delete-note"
              title="Удалить заметку"
              @click="notesStore.deleteMarginNote(note.id)"
            >
              ✕
            </button>
          </div>
          <p class="user-margin-note__text">{{ note.noteText }}</p>
        </div>
      </div>

      <div v-else class="notes-empty">
        <span class="empty-icon">📝</span>
        <p class="empty-text">Заметок пока нет</p>
        <span class="empty-sub">Вы можете оставлять заметки с цветными маркерами прямо на пергаментных листах при чтении уроков.</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.cabinet-notes-tab {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .section-icon {
    font-size: 1.4rem;
  }

  &__title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text-main, #ffffff);
    letter-spacing: -0.01em;
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-muted, #94a3b8);
  }
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.bookmark-card {
  background: var(--bg-card, rgba(30, 41, 59, 0.7));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.15);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bookmark-code {
    font-size: 0.75rem;
    font-weight: 700;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
    padding: 0.15rem 0.5rem;
    border-radius: 6px;
  }

  .bookmark-date {
    font-size: 0.75rem;
    color: var(--text-muted, #94a3b8);
  }

  &__title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
    line-height: 1.35;
  }

  &__course {
    font-size: 0.85rem;
    color: var(--text-muted, #94a3b8);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);

    .btn-read-link {
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.25rem 0.4rem;
      border-radius: 4px;

      &:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
      }
    }
  }
}

.margin-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.user-margin-note {
  padding: 1.2rem;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

  &--amber {
    background: rgba(245, 158, 11, 0.12);
    border-left: 4px solid #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-left-width: 4px;
  }

  &--cyan {
    background: rgba(6, 182, 212, 0.12);
    border-left: 4px solid #06b6d4;
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-left-width: 4px;
  }

  &--emerald {
    background: rgba(16, 185, 129, 0.12);
    border-left: 4px solid #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-left-width: 4px;
  }

  &--purple {
    background: rgba(168, 85, 247, 0.12);
    border-left: 4px solid #a855f7;
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-left-width: 4px;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .note-time {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .btn-delete-note {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        color: #ef4444;
      }
    }
  }

  &__text {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--text-main, #ffffff);
  }
}

.notes-empty {
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;

  .empty-icon {
    font-size: 2.2rem;
    opacity: 0.6;
  }

  .empty-text {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main, #ffffff);
  }

  .empty-sub {
    font-size: 0.85rem;
    color: var(--text-muted, #94a3b8);
    max-width: 480px;
  }
}
</style>
