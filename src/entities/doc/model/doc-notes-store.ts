import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocBookmark, DocMarginNote } from '../types'

const STORAGE_KEY_BOOKMARKS = 'lern_doc_bookmarks_v1'
const STORAGE_KEY_NOTES = 'lern_doc_margin_notes_v1'

export const useDocNotesStore = defineStore('doc-notes', () => {
  // #region State
  const bookmarks = ref<DocBookmark[]>([])
  const marginNotes = ref<DocMarginNote[]>([])
  const isHydrated = ref(false)
  // #endregion State

  // #region Getters
  const isBookmarked = computed(() => {
    return (docId: string): boolean => {
      hydrate()
      return bookmarks.value.some((b) => b.docId === docId)
    }
  })

  const getDocNotes = computed(() => {
    return (docId: string): DocMarginNote[] => {
      hydrate()
      return marginNotes.value.filter((n) => n.docId === docId)
    }
  })

  const totalBookmarksCount = computed(() => bookmarks.value.length)
  const totalNotesCount = computed(() => marginNotes.value.length)
  // #endregion Getters

  // #region Hydrate / Persist
  const hydrate = () => {
    if (isHydrated.value) return

    try {
      const rawBm = localStorage.getItem(STORAGE_KEY_BOOKMARKS)
      if (rawBm) {
        bookmarks.value = JSON.parse(rawBm)
      }

      const rawNotes = localStorage.getItem(STORAGE_KEY_NOTES)
      if (rawNotes) {
        marginNotes.value = JSON.parse(rawNotes)
      }
    } catch (e) {
      console.warn('[DocNotesStore] Ошибка гидрации заметок:', e)
    } finally {
      isHydrated.value = true
    }
  }

  const persistBookmarks = () => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks.value))
    } catch (e) {
      console.warn(e)
    }
  }

  const persistNotes = () => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(marginNotes.value))
    } catch (e) {
      console.warn(e)
    }
  }
  // #endregion Hydrate / Persist

  // #region Actions
  const toggleBookmark = (
    doc: { id: string; title: string; code?: string },
    course: { slug?: string; id?: string; title: string }
  ): boolean => {
    hydrate()
    const index = bookmarks.value.findIndex((b) => b.docId === doc.id)

    if (index !== -1) {
      // Удаляем закладку
      bookmarks.value.splice(index, 1)
      persistBookmarks()
      return false
    } else {
      // Добавляем закладку
      bookmarks.value.unshift({
        id: `bm-${Date.now()}`,
        docId: doc.id,
        docTitle: doc.title,
        courseSlug: course.slug || course.id || 'all',
        courseTitle: course.title,
        chapterCode: doc.code,
        createdAt: new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
        }),
      })
      persistBookmarks()
      return true
    }
  }

  const addMarginNote = (
    payload: Omit<DocMarginNote, 'id' | 'createdAt'>
  ): DocMarginNote => {
    hydrate()
    const newNote: DocMarginNote = {
      ...payload,
      id: `note-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    marginNotes.value.unshift(newNote)
    persistNotes()
    return newNote
  }

  const deleteMarginNote = (noteId: string): void => {
    hydrate()
    const index = marginNotes.value.findIndex((n) => n.id === noteId)
    if (index !== -1) {
      marginNotes.value.splice(index, 1)
      persistNotes()
    }
  }

  const clearNotesForDoc = (docId: string): void => {
    hydrate()
    marginNotes.value = marginNotes.value.filter((n) => n.docId !== docId)
    persistNotes()
  }
  // #endregion Actions

  // Авто-гидрация при создании стора
  hydrate()

  return {
    bookmarks,
    marginNotes,
    isBookmarked,
    getDocNotes,
    totalBookmarksCount,
    totalNotesCount,
    toggleBookmark,
    addMarginNote,
    deleteMarginNote,
    clearNotesForDoc,
  }
})
