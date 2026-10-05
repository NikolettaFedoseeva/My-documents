import { ref, computed, onMounted } from 'vue'
import { DocCategory, DocItem, DocApiService, DocAdapter, DocTocItem, useDocProgressStore } from '@/entities/doc'

export function useDocsViewer() {
  const progressStore = useDocProgressStore()

  // #region refs
  const categories = ref<DocCategory[]>([])
  const activeDocId = ref<string>('')
  const searchQuery = ref<string>('')
  const expandedCategoryIds = ref<Set<string>>(new Set())
  const isLoading = ref<boolean>(true)
  const isError = ref<boolean>(false)
  const activeTocId = ref<string>('')
  const isTreeDrawerOpen = ref<boolean>(false)
  // #endregion refs

  // #region computed
  const allDocs = computed<DocItem[]>(() => {
    return categories.value.flatMap((cat) => cat.items)
  })

  const activeDoc = computed<DocItem | null>(() => {
    if (!activeDocId.value && allDocs.value.length > 0) {
      return allDocs.value[0]
    }
    return allDocs.value.find((doc) => doc.id === activeDocId.value) || null
  })

  const currentDocIndex = computed<number>(() => {
    if (!activeDoc.value) return -1
    return allDocs.value.findIndex((d) => d.id === activeDoc.value?.id)
  })

  const prevDoc = computed<DocItem | null>(() => {
    if (currentDocIndex.value > 0) {
      return allDocs.value[currentDocIndex.value - 1]
    }
    return null
  })

  const nextDoc = computed<DocItem | null>(() => {
    if (currentDocIndex.value >= 0 && currentDocIndex.value < allDocs.value.length - 1) {
      return allDocs.value[currentDocIndex.value + 1]
    }
    return null
  })

  const tocItems = computed<DocTocItem[]>(() => {
    if (!activeDoc.value) return []
    return DocAdapter.extractToc(activeDoc.value)
  })

  const filteredCategories = computed<DocCategory[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return categories.value

    return categories.value
      .map((cat) => {
        const matchingItems = cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.tags.some((tag) => tag.toLowerCase().includes(q))
        )
        const isCatMatch = cat.title.toLowerCase().includes(q)

        if (isCatMatch || matchingItems.length > 0) {
          return {
            ...cat,
            items: isCatMatch ? cat.items : matchingItems,
          }
        }
        return null
      })
      .filter((cat): cat is DocCategory => cat !== null)
  })
  // #endregion computed

  // #region Функции
  const loadDocs = async (): Promise<void> => {
    isLoading.value = true
    isError.value = false
    try {
      const data = await DocApiService.getCategories()
      categories.value = data

      // По умолчанию раскрываем все категории
      data.forEach((cat) => expandedCategoryIds.value.add(cat.id))

      // Восстанавливаем последний активный документ из сохраненного прогресса
      const savedLastDocId = progressStore.lastActiveDocId
      const allItems = data.flatMap((c) => c.items)
      if (savedLastDocId && allItems.some((d) => d.id === savedLastDocId)) {
        activeDocId.value = savedLastDocId
      } else if (data.length > 0 && data[0].items.length > 0) {
        activeDocId.value = data[0].items[0].id
      }

      if (activeDocId.value) {
        progressStore.visitDoc(activeDocId.value)
      }
    } catch (err) {
      console.error('Ошибка загрузки документации:', err)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const selectDoc = (docId: string): void => {
    activeDocId.value = docId
    progressStore.visitDoc(docId)
    isTreeDrawerOpen.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCategory = (categoryId: string): void => {
    if (expandedCategoryIds.value.has(categoryId)) {
      expandedCategoryIds.value.delete(categoryId)
    } else {
      expandedCategoryIds.value.add(categoryId)
    }
  }

  const isCategoryExpanded = (categoryId: string): boolean => {
    return expandedCategoryIds.value.has(categoryId)
  }

  const setActiveToc = (tocId: string): void => {
    activeTocId.value = tocId
  }

  const toggleTreeDrawer = (): void => {
    isTreeDrawerOpen.value = !isTreeDrawerOpen.value
  }

  const closeTreeDrawer = (): void => {
    isTreeDrawerOpen.value = false
  }
  // #endregion Функции

  // #region Хуки жизненного цикла
  onMounted(() => {
    loadDocs()
  })
  // #endregion Хуки жизненного цикла

  return {
    categories,
    filteredCategories,
    activeDocId,
    activeDoc,
    prevDoc,
    nextDoc,
    searchQuery,
    isLoading,
    isError,
    tocItems,
    activeTocId,
    isTreeDrawerOpen,
    loadDocs,
    selectDoc,
    toggleCategory,
    isCategoryExpanded,
    setActiveToc,
    toggleTreeDrawer,
    closeTreeDrawer,
    progressStore,
  }
}
