import { ref, computed, onMounted } from 'vue'
import {
  DocApiService,
  type DocCategory,
  type DocItem,
  type DocSectionContent,
  type DocFlashcardData,
  type DocQuiz,
  type DocQuizOption,
  type CourseCodex,
  type CreateDocDto,
  type UpdateDocDto,
  type CreateCategoryDto,
  type CreateCourseDto,
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
  // Курсы
  const courses = ref<CourseCodex[]>([])
  const selectedCourseId = ref<string | null>(null)
  const isCourseModalOpen = ref<boolean>(false)
  const newCourseForm = ref<CreateCourseDto>({
    title: '',
    slug: '',
    description: '',
    category: 'Frontend',
    icon: '🎓',
    level: 'intermediate',
    tags: ['Vue 3'],
  })

  // Модули и текущая глава
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
  const isCourseBoardView = computed<boolean>(() => {
    return selectedCourseId.value === null
  })

  const activeCourse = computed<CourseCodex | null>(() => {
    if (!selectedCourseId.value) return null
    return courses.value.find((c) => c.id === selectedCourseId.value) || null
  })

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
        name: activeCourse.value?.author.name || 'Автор курса',
        role: activeCourse.value?.author.role || 'Преподаватель',
        avatar: activeCourse.value?.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
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
  const loadCourses = async (): Promise<void> => {
    isLoading.value = true
    try {
      const data = await DocApiService.getCourses()
      courses.value = data

      // Если уже выбран курс, обновим его данные
      if (selectedCourseId.value) {
        const found = data.find((c) => c.id === selectedCourseId.value)
        if (found) {
          categories.value = found.modules
        } else {
          selectedCourseId.value = null
        }
      }
    } catch (err) {
      console.error('[useAuthorStudio] Ошибка загрузки курсов:', err)
    } finally {
      isLoading.value = false
    }
  }

  const selectCourse = async (courseId: string | null): Promise<void> => {
    selectedCourseId.value = courseId
    selectedDocId.value = null

    if (!courseId) {
      categories.value = []
      return
    }

    isLoading.value = true
    try {
      const course = await DocApiService.getCourseById(courseId)
      if (course) {
        categories.value = course.modules
        if (course.modules.length > 0) {
          selectedCategoryId.value = course.modules[0].id
          if (course.modules[0].items.length > 0) {
            selectDoc(course.modules[0].items[0].id)
          } else {
            startCreateNewDoc(course.modules[0].id)
          }
        }
      }
    } catch (err) {
      console.error('[useAuthorStudio] Ошибка выбора курса:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadCategories = async (): Promise<void> => {
    if (!selectedCourseId.value) return
    try {
      const data = await DocApiService.getCategories(selectedCourseId.value)
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

  // #region Управление курсами
  const openCreateCourseModal = (): void => {
    newCourseForm.value = {
      title: '',
      slug: '',
      description: '',
      category: 'Frontend',
      icon: '🎓',
      level: 'intermediate',
      tags: ['Новый курс'],
    }
    isCourseModalOpen.value = true
  }

  const closeCreateCourseModal = (): void => {
    isCourseModalOpen.value = false
  }

  const submitCreateCourse = async (): Promise<void> => {
    if (!newCourseForm.value.title.trim()) {
      alert('Укажите название курса')
      return
    }

    try {
      const created = await DocApiService.createCourse(newCourseForm.value)
      await loadCourses()
      closeCreateCourseModal()
      showToast(`Курс "${created.title}" успешно создан!`)
      // Сразу переходим в редактор созданного курса
      await selectCourse(created.id)
    } catch (err) {
      console.error('Ошибка создания курса:', err)
      alert('Не удалось создать курс')
    }
  }

  const deleteCourse = async (courseId: string): Promise<void> => {
    const target = courses.value.find((c) => c.id === courseId)
    const title = target?.title || 'этот курс'
    if (!confirm(`Вы действительно хотите удалить курс "${title}" со всеми модулями и главами?`)) {
      return
    }

    try {
      await DocApiService.deleteCourse(courseId)
      if (selectedCourseId.value === courseId) {
        selectedCourseId.value = null
      }
      await loadCourses()
      showToast(`Курс "${title}" удалён`)
    } catch (err) {
      console.error('Ошибка удаления курса:', err)
      alert('Не удалось удалить курс')
    }
  }
  // #endregion Управление курсами

  // #region Сохранение и удаление глав
  const saveDoc = async (): Promise<boolean> => {
    if (!selectedCourseId.value) {
      alert('Не выбран курс для сохранения')
      return false
    }

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
        saved = await DocApiService.updateDoc(selectedDocId.value, payload as UpdateDocDto, selectedCourseId.value)
      } else {
        saved = await DocApiService.createDoc(payload, selectedCourseId.value)
        selectedDocId.value = saved.id
      }

      await loadCategories()
      selectDoc(saved.id)
      await loadCourses() // актуализируем счётчики глав

      showToast(`Глава «${saved.title}» сохранена!`)
      return true
    } catch (err) {
      console.error('Ошибка сохранения главы:', err)
      alert('Не удалось сохранить главу')
      return false
    } finally {
      isSaving.value = false
    }
  }

  const deleteCurrentDoc = async (): Promise<void> => {
    if (!selectedDocId.value || !selectedCourseId.value) return
    const targetTitle = docDraft.value.title || 'эту главу'
    if (!confirm(`Вы действительно хотите удалить ${targetTitle}?`)) return

    try {
      await DocApiService.deleteDoc(selectedDocId.value, selectedCourseId.value)
      selectedDocId.value = null
      await loadCategories()
      await loadCourses()
      showToast(`Глава удалена`)
    } catch (err) {
      console.error('Ошибка удаления главы:', err)
      alert('Не удалось удалить главу')
    }
  }
  // #endregion Сохранение и удаление глав

  // #region Управление категориями (модулями)
  const openCreateCategoryModal = (): void => {
    const nextIndex = categories.value.length + 1
    newCategoryForm.value = {
      title: '',
      code: nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`,
      icon: '📁',
      description: '',
    }
    isCategoryModalOpen.value = true
  }

  const closeCreateCategoryModal = (): void => {
    isCategoryModalOpen.value = false
  }

  const submitCreateCategory = async (): Promise<void> => {
    if (!selectedCourseId.value) return
    if (!newCategoryForm.value.title.trim()) {
      alert('Укажите название модуля')
      return
    }

    try {
      const created = await DocApiService.createCategory(newCategoryForm.value, selectedCourseId.value)
      await loadCategories()
      await loadCourses()
      closeCreateCategoryModal()
      selectedCategoryId.value = created.id
      startCreateNewDoc(created.id)
      showToast(`Модуль «${created.title}» создан!`)
    } catch (err) {
      console.error('Ошибка создания модуля:', err)
      alert('Не удалось создать модуль')
    }
  }

  const deleteCategory = async (categoryId: string): Promise<void> => {
    if (!selectedCourseId.value) return
    const cat = categories.value.find((c) => c.id === categoryId)
    const title = cat?.title || 'этот модуль'
    if (!confirm(`Удалить модуль «${title}» и все его статьи?`)) return

    try {
      await DocApiService.deleteCategory(categoryId, selectedCourseId.value)
      if (selectedCategoryId.value === categoryId) {
        selectedCategoryId.value = ''
        selectedDocId.value = null
      }
      await loadCategories()
      await loadCourses()
      showToast(`Модуль удален`)
    } catch (err) {
      console.error('Ошибка удаления модуля:', err)
      alert('Не удалось удалить модуль')
    }
  }
  // #endregion Управление категориями

  // #region Управление секциями контента
  const addSection = (type: 'text' | 'code' | 'callout'): void => {
    const newId = `sec-${Date.now().toString(36)}`
    const count = docDraft.value.sections.length + 1

    const newSec: DocSectionContent = {
      id: newId,
      title: `Секция ${count}`,
      level: 2,
      text: type === 'text' ? 'Новый абзац с описанием концепции или алгоритма...' : '',
    }

    if (type === 'code') {
      newSec.codeSnippet = {
        language: 'typescript',
        filename: 'example.ts',
        code: '// Введите пример кода на TypeScript или Vue\nconst greeting = "Hello LERN!"\nconsole.log(greeting)',
      }
    }

    if (type === 'callout') {
      newSec.callout = {
        type: 'tip',
        message: 'Важное пояснение или рекомендация по лучшим практикам.',
      }
    }

    docDraft.value.sections.push(newSec)
  }

  const removeSection = (index: number): void => {
    docDraft.value.sections.splice(index, 1)
  }

  const moveSection = (index: number, direction: 'up' | 'down'): void => {
    const sections = docDraft.value.sections
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return
    const temp = sections[index]
    sections[index] = sections[targetIndex]
    sections[targetIndex] = temp
  }
  // #endregion Управление секциями контента

  // #region Управление экспресс-тестом
  const addQuizOption = (): void => {
    if (!docDraft.value.quiz) return
    const options = docDraft.value.quiz.options
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const nextLabel = labels[options.length] || 'X'
    const newId = `opt-${Date.now().toString(36)}`

    options.push({
      id: newId,
      label: nextLabel,
      text: `Новый вариант ответа ${nextLabel}`,
    })
  }

  const removeQuizOption = (index: number): void => {
    if (!docDraft.value.quiz) return
    const options = docDraft.value.quiz.options
    if (options.length <= 2) {
      alert('В тесте должно быть минимум 2 варианта ответа')
      return
    }
    const removed = options.splice(index, 1)[0]
    if (docDraft.value.quiz.correctId === removed.id && options.length > 0) {
      docDraft.value.quiz.correctId = options[0].id
    }
  }

  const setCorrectQuizOption = (optionId: string): void => {
    if (docDraft.value.quiz) {
      docDraft.value.quiz.correctId = optionId
    }
  }
  // #endregion Управление экспресс-тестом

  // #region Сброс к дефолту
  const resetAllToDefaults = async (): Promise<void> => {
    if (!confirm('Внимание: это сбросит все добавленные вами курсы и восстановит начальные демонстрационные материалы платформы. Продолжить?')) {
      return
    }

    isLoading.value = true
    try {
      const defaultCourses = await DocApiService.resetToDefaults()
      courses.value = defaultCourses
      selectedCourseId.value = null
      categories.value = []
      showToast('База знаний сброшена к исходным эталонам')
    } catch (err) {
      console.error('Ошибка сброса к дефолту:', err)
      alert('Не удалось сбросить данные')
    } finally {
      isLoading.value = false
    }
  }
  // #endregion Сброс к дефолту

  const showToast = (message: string): void => {
    saveSuccessMessage.value = message
    setTimeout(() => {
      if (saveSuccessMessage.value === message) {
        saveSuccessMessage.value = null
      }
    }, 3500)
  }

  onMounted(() => {
    loadCourses()
  })

  return {
    // Курсы
    courses,
    selectedCourseId,
    activeCourse,
    isCourseBoardView,
    isCourseModalOpen,
    newCourseForm,
    loadCourses,
    selectCourse,
    openCreateCourseModal,
    closeCreateCourseModal,
    submitCreateCourse,
    deleteCourse,

    // Модули и статьи
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
