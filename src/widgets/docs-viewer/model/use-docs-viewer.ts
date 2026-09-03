import { ref, computed, onMounted } from 'vue'
import { DocCategory, DocItem, DocApiService, DocAdapter, DocTocItem } from '@/entities/doc'

export function useDocsViewer() {
  // #region refs
  const categories = ref<DocCategory[]>([])
  const activeDocId = ref<string>('')
  const searchQuery = ref<string>('')
  const expandedCategoryIds = ref<Set<string>>(new Set())
  const isLoading = ref<boolean>(true)
  const isError = ref<boolean>(false)
  const activeTocId = ref<string>('')
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

      // По умолчанию раскрываем все категории и выбираем первую статью
      data.forEach((cat) => expandedCategoryIds.value.add(cat.id))
      if (data.length > 0 && data[0].items.length > 0) {
        activeDocId.value = data[0].items[0].id
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
    searchQuery,
    isLoading,
    isError,
    tocItems,
    activeTocId,
    loadDocs,
    selectDoc,
    toggleCategory,
    isCategoryExpanded,
    setActiveToc,
  }
}
