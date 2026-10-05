import { ref, computed, onMounted } from 'vue'
import {
  DocApiService,
  type DocCategory,
  type DocItem,
  type DocSectionContent,
  type DocFlashcardData,
  type DocQuiz,
  type DocQuizOption,
  type CreateDocDto,
  type UpdateDocDto,
  type CreateCategoryDto,
} from '@/entities/doc'

export type EditorTab = 'meta' | 'content' | 'flashcard' | 'quiz'
export type PreviewMode = 'split' | 'editor' | 'preview'

/**
 * Создание пустой заготовки для формы главы
 */
function createEmptyDocDraft(categoryId: string = ''): CreateDocDto & { id?: string; tagsString: string } {
  return {
    categoryId,
    code: '',
    title: '',
    description: '',
    readTimeMinutes: 4,
    tags: ['Архитектура'],
    tagsString: 'Архитектура',
    sections: [
      {
        id: 'sec-1',
        title: 'Введение в тему',
        level: 2,
        text: 'Опишите ключевую концепцию и цели изучения данной темы...',
        callout: {
          type: 'info',
          message: 'Полезная подсказка для студентов перед началом изучения.',
        },
      },
    ],
    flashcard: {
      id: `fc-${Date.now()}`,
      category: 'База знаний',
      section: 'Основное',
      difficulty: 'medium',
      question: 'Сформулируйте ключевой контрольный вопрос главы...',
      answer: 'Развёрнутый и понятный правильный ответ для самопроверки...',
      hint: 'Краткая подсказка, наводящая на мысль.',
    },
    quiz: {
      question: 'Контрольный тестовый вопрос по материалу главы?',
      correctId: 'opt-1',
      explanation: 'Пояснение, почему именно этот вариант является верным.',
      options: [
        { id: 'opt-1', label: 'A', text: 'Правильный вариант ответа' },
        { id: 'opt-2', label: 'B', text: 'Неверный вариант ответа' },
        { id: 'opt-3', label: 'C', text: 'Альтернативный отвлекающий вариант' },
      ],
    },
  }
}

export function useAuthorStudio() {
  // #region refs
  const categories = ref<DocCategory[]>([])
  const selectedDocId = ref<string | null>(null)
  const selectedCategoryId = ref<string>('')
  const activeTab = ref<EditorTab>('meta')
  const previewMode = ref<PreviewMode>('split')
  const isLoading = ref<boolean>(true)
  const isSaving = ref<boolean>(false)
  const saveSuccessMessage = ref<string | null>(null)

  // Модалка создания категории
  const isCategoryModalOpen = ref<boolean>(false)
  const newCategoryForm = ref<CreateCategoryDto>({
    title: '',
    code: '',
    icon: '📁',
    description: '',
  })

  // Черновик редактируемой главы
  const docDraft = ref<ReturnType<typeof createEmptyDocDraft>>(createEmptyDocDraft())
  // #endregion refs

  // #region computed
  const allDocs = computed<DocItem[]>(() => {
    return categories.value.flatMap((c) => c.items)
  })

  const isEditingExisting = computed<boolean>(() => {
    return Boolean(selectedDocId.value)
  })

  const currentCategory = computed<DocCategory | null>(() => {
    return categories.value.find((c) => c.id === docDraft.value.categoryId) || null
  })

  /**
   * Сформированный объект главы для живого предпросмотра
   */
  const previewDoc = computed<DocItem>(() => {
    const draft = docDraft.value
    return {
      id: draft.id || 'preview-doc',
      categoryId: draft.categoryId,
      code: draft.code || '01.1',
      title: draft.title || 'Новая глава без названия',
      description: draft.description || 'Краткое описание главы будет отображаться здесь...',
      author: {
        name: 'Автор курса',
        role: 'Преподаватель',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      updatedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: Number(draft.readTimeMinutes) || 3,
      tags: draft.tagsString
        ? draft.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Новое'],
      usefulCount: 0,
      notUsefulCount: 0,
      sections: draft.sections,
      flashcard: draft.flashcard,
      quiz: draft.quiz,
    }
  })
  // #endregion computed

  // #region Функции загрузки
  const loadCategories = async (): Promise<void> => {
    isLoading.value = true
    try {
      const data = await DocApiService.getCategories()
      categories.value = data

      if (data.length > 0) {
        if (!selectedCategoryId.value) {
          selectedCategoryId.value = data[0].id
        }

        // Если выбрана глава — загрузим её, иначе выберем первую доступную
        if (selectedDocId.value) {
          const found = data.flatMap((c) => c.items).find((i) => i.id === selectedDocId.value)
          if (found) {
            populateDraftFromDoc(found)
          } else {
            startCreateNewDoc(data[0].id)
          }
        } else if (data[0].items.length > 0) {
          selectDoc(data[0].items[0].id)
        } else {
          startCreateNewDoc(data[0].id)
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий в Author Studio:', err)
    } finally {
      isLoading.value = false
    }
  }

  const populateDraftFromDoc = (doc: DocItem): void => {
    selectedDocId.value = doc.id
    selectedCategoryId.value = doc.categoryId
    docDraft.value = {
      id: doc.id,
      categoryId: doc.categoryId,
      code: doc.code || '',
      title: doc.title,
      description: doc.description,
      readTimeMinutes: doc.readTimeMinutes,
      tags: doc.tags,
      tagsString: doc.tags.join(', '),
      sections: JSON.parse(JSON.stringify(doc.sections || [])),
      flashcard: doc.flashcard
        ? JSON.parse(JSON.stringify(doc.flashcard))
        : createEmptyDocDraft().flashcard,
      quiz: doc.quiz
        ? JSON.parse(JSON.stringify(doc.quiz))
        : createEmptyDocDraft().quiz,
    }
  }

  const selectDoc = (docId: string): void => {
    const doc = allDocs.value.find((d) => d.id === docId)
    if (doc) {
      populateDraftFromDoc(doc)
    }
  }

  const startCreateNewDoc = (categoryId?: string): void => {
    const targetCatId = categoryId || selectedCategoryId.value || (categories.value[0]?.id || '')
    selectedDocId.value = null
    selectedCategoryId.value = targetCatId

    const category = categories.value.find((c) => c.id === targetCatId)
    const nextItemIdx = (category?.items.length || 0) + 1
    const suggestedCode = `${category?.code || '01'}.${nextItemIdx}`

    const fresh = createEmptyDocDraft(targetCatId)
    fresh.code = suggestedCode
    docDraft.value = fresh
  }
  // #endregion Функции загрузки

  // #region Сохранение и удаление глав
  const saveDoc = async (): Promise<boolean> => {
    if (!docDraft.value.title.trim()) {
      alert('Пожалуйста, укажите название главы')
      activeTab.value = 'meta'
      return false
    }

    if (!docDraft.value.categoryId) {
      alert('Пожалуйста, выберите модуль для главы')
      activeTab.value = 'meta'
      return false
    }

    isSaving.value = true
    try {
      const tags = docDraft.value.tagsString
        ? docDraft.value.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Статья']

      const payload: CreateDocDto = {
        categoryId: docDraft.value.categoryId,
        code: docDraft.value.code.trim(),
        title: docDraft.value.title.trim(),
        description: docDraft.value.description.trim(),
        readTimeMinutes: Number(docDraft.value.readTimeMinutes) || 3,
        tags,
        sections: docDraft.value.sections,
        flashcard: docDraft.value.flashcard,
        quiz: docDraft.value.quiz,
      }

      let saved: DocItem
      if (selectedDocId.value) {
        saved = await DocApiService.updateDoc(selectedDocId.value, payload as UpdateDocDto)
      } else {
        saved = await DocApiService.createDoc(payload)
        selectedDocId.value = saved.id
      }

      await loadCategories()
      selectDoc(saved.id)

      saveSuccessMessage.value = 'Глава успешно сохранена и доступна в базе знаний!'
      setTimeout(() => {
        saveSuccessMessage.value = null
      }, 3500)
      return true
    } catch (err) {
      console.error('Ошибка сохранения главы:', err)
      alert('Ошибка при сохранении главы')
      return false
    } finally {
      isSaving.value = false
    }
  }

  const deleteCurrentDoc = async (): Promise<void> => {
    if (!selectedDocId.value) return
    const confirmed = confirm(`Вы уверены, что хотите удалить главу "${docDraft.value.title}"?`)
    if (!confirmed) return

    try {
      await DocApiService.deleteDoc(selectedDocId.value)
      selectedDocId.value = null
      await loadCategories()
    } catch (err) {
      console.error('Ошибка удаления главы:', err)
    }
  }
  // #endregion Сохранение и удаление глав

  // #region Управление категориями
  const openCreateCategoryModal = (): void => {
    const nextIdx = categories.value.length + 1
    newCategoryForm.value = {
      title: '',
      code: nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`,
      icon: '📁',
      description: '',
    }
    isCategoryModalOpen.value = true
  }

  const closeCreateCategoryModal = (): void => {
    isCategoryModalOpen.value = false
  }

  const submitCreateCategory = async (): Promise<void> => {
    if (!newCategoryForm.value.title.trim()) {
      alert('Введите название модуля')
      return
    }

    try {
      const created = await DocApiService.createCategory(newCategoryForm.value)
      await loadCategories()
      selectedCategoryId.value = created.id
      startCreateNewDoc(created.id)
      isCategoryModalOpen.value = false
    } catch (err) {
      console.error('Ошибка создания модуля:', err)
    }
  }

  const deleteCategory = async (catId: string): Promise<void> => {
    const cat = categories.value.find((c) => c.id === catId)
    const confirmed = confirm(`Удалить модуль "${cat?.title}" и все входящие в него главы?`)
    if (!confirmed) return

    try {
      await DocApiService.deleteCategory(catId)
      await loadCategories()
    } catch (err) {
      console.error('Ошибка удаления модуля:', err)
    }
  }
  // #endregion Управление категориями

  // #region Управление секциями контента
  const addSection = (type: 'text' | 'code' | 'callout'): void => {
    const idx = docDraft.value.sections.length + 1
    const newSec: DocSectionContent = {
      id: `sec-${Date.now()}`,
      title: `Новый раздел ${idx}`,
      level: 2,
      text: 'Введите текст абзаца...',
    }

    if (type === 'code') {
      newSec.codeSnippet = {
        language: 'typescript',
        filename: 'example.ts',
        code: `// Пример исходного кода\nconst greeting: string = "Hello LERN";`,
      }
    } else if (type === 'callout') {
      newSec.callout = {
        type: 'tip',
        message: 'Важное пояснение или полезный совет для читателя.',
      }
    }

    docDraft.value.sections.push(newSec)
  }

  const removeSection = (index: number): void => {
    docDraft.value.sections.splice(index, 1)
  }

  const moveSection = (index: number, direction: 'up' | 'down'): void => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= docDraft.value.sections.length) return
    const temp = docDraft.value.sections[index]
    docDraft.value.sections[index] = docDraft.value.sections[targetIdx]
    docDraft.value.sections[targetIdx] = temp
  }
  // #endregion Управление секциями контента

  // #region Управление тестом (Quiz)
  const addQuizOption = (): void => {
    if (!docDraft.value.quiz) {
      docDraft.value.quiz = createEmptyDocDraft().quiz!
    }
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const nextIdx = docDraft.value.quiz.options.length
    const label = labels[nextIdx] || `${nextIdx + 1}`
    const optId = `opt-${Date.now()}`

    docDraft.value.quiz.options.push({
      id: optId,
      label,
      text: 'Новый вариант ответа',
    })
  }

  const removeQuizOption = (index: number): void => {
    if (!docDraft.value.quiz || docDraft.value.quiz.options.length <= 2) {
      alert('В тесте должно оставаться минимум 2 варианта ответа')
      return
    }
    const removed = docDraft.value.quiz.options.splice(index, 1)[0]
    // Если удалили правильный вариант — сбрасываем правильный на первый доступный
    if (docDraft.value.quiz.correctId === removed.id && docDraft.value.quiz.options.length > 0) {
      docDraft.value.quiz.correctId = docDraft.value.quiz.options[0].id
    }
  }

  const setCorrectQuizOption = (optId: string): void => {
    if (docDraft.value.quiz) {
      docDraft.value.quiz.correctId = optId
    }
  }
  // #endregion Управление тестом (Quiz)

  // #region Сброс к исходным
  const resetAllToDefaults = async (): Promise<void> => {
    const confirmed = confirm('Сбросить базу данных к исходным демонстрационным главам? Ваши созданные статьи будут удалены.')
    if (!confirmed) return

    isLoading.value = true
    try {
      await DocApiService.resetToDefaults()
      selectedDocId.value = null
      await loadCategories()
    } finally {
      isLoading.value = false
    }
  }
  // #endregion Сброс к исходным

  onMounted(() => {
    loadCategories()
  })

  return {
    categories,
    selectedDocId,
    selectedCategoryId,
    currentCategory,
    docDraft,
    previewDoc,
    activeTab,
    previewMode,
    isLoading,
    isSaving,
    isEditingExisting,
    saveSuccessMessage,
    isCategoryModalOpen,
    newCategoryForm,
    loadCategories,
    selectDoc,
    startCreateNewDoc,
    saveDoc,
    deleteCurrentDoc,
    openCreateCategoryModal,
    closeCreateCategoryModal,
    submitCreateCategory,
    deleteCategory,
    addSection,
    removeSection,
    moveSection,
    addQuizOption,
    removeQuizOption,
    setCorrectQuizOption,
    resetAllToDefaults,
  }
}
