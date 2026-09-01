import { ref, computed } from 'vue'
import type { TopicItem, WorkspaceViewMode } from '../types'

// #region State
const topics = ref<TopicItem[]>([
  {
    id: 'topic-1',
    title: 'watch и watchEffect',
    category: 'Программирование',
    section: 'Vue 3 & Composition API',
    readTime: '7 мин',
    progress: 62,
    isCompleted: false,
    content: `В Composition API для реакции на изменения реактивных данных используются функции watch и watchEffect.\n\nwatch позволяет явно указать источник изменений и получить старое и новое значения.\n\nwatchEffect автоматически отслеживает используемые реактивные зависимости внутри колбэка и запускается сразу, а затем — при любом их изменении.`,
    codeSnippet: `import { ref, watch, watchEffect } from 'vue'\n\nconst count = ref(0)\n\nwatch(count, (newVal, oldVal) => {\n  console.log(\`count: \${oldVal} => \${newVal}\`)\n})\n\nwatchEffect(() => {\n  console.log(\`Текущий count: \${count.value}\`)\n})`,
    quizCount: 3,
  },
  {
    id: 'topic-2',
    title: 'Введение в Composition API',
    category: 'Программирование',
    section: 'Vue 3 & Composition API',
    readTime: '5 мин',
    progress: 100,
    isCompleted: true,
    content: `Composition API — это набор API, который позволяет описывать логику компонентов с помощью импортируемых функций вместо параметров объекта.`,
    codeSnippet: `import { ref } from 'vue'\n\nexport default {\n  setup() {\n    const count = ref(0)\n    return { count }\n  }\n}`,
    quizCount: 2,
  },
  {
    id: 'topic-3',
    title: 'Глубокое наблюдение (Deep Watchers)',
    category: 'Программирование',
    section: 'Vue 3 & Composition API',
    readTime: '8 мин',
    progress: 25,
    isCompleted: false,
    content: `При вызове watch() непосредственно для вложенного объекта автоматически создаётся глубокий наблюдатель — колбэк будет вызываться при любых изменениях свойств.`,
    quizCount: 4,
  },
  {
    id: 'topic-4',
    title: 'Остановка наблюдателей (Stopping Watchers)',
    category: 'Программирование',
    section: 'Vue 3 & Composition API',
    readTime: '4 мин',
    progress: 0,
    isCompleted: false,
    content: `Наблюдатели, созданные внутри setup() или <script setup>, привязаны к циклу жизни компонента и автоматически останавливаются при его размонтировании.`,
    quizCount: 2,
  },
])

const currentTopicId = ref<string>('topic-1')
const currentView = ref<WorkspaceViewMode>('reader')
const isFocusMode = ref<boolean>(false)
const searchQuery = ref<string>('')
// #endregion State

export function useStudyWorkspace() {
  // #region Computed
  const currentTopic = computed(() => {
    return topics.value.find((t) => t.id === currentTopicId.value) || topics.value[0]
  })

  const filteredTopics = computed(() => {
    if (!searchQuery.value.trim()) return topics.value
    const query = searchQuery.value.toLowerCase()
    return topics.value.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.section.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    )
  })

  const overallProgress = computed(() => {
    if (!topics.value.length) return 0
    const total = topics.value.reduce((acc, curr) => acc + curr.progress, 0)
    return Math.round(total / topics.value.length)
  })
  // #endregion Computed

  // #region Functions
  const selectTopic = (topicId: string, viewMode: WorkspaceViewMode = 'reader') => {
    currentTopicId.value = topicId
    currentView.value = viewMode
  }

  const setView = (mode: WorkspaceViewMode) => {
    currentView.value = mode
  }

  const toggleFocus = () => {
    isFocusMode.value = !isFocusMode.value
  }

  const updateProgress = (topicId: string, newProgress: number) => {
    const topic = topics.value.find((t) => t.id === topicId)
    if (topic) {
      topic.progress = Math.min(100, Math.max(0, newProgress))
      if (topic.progress === 100) {
        topic.isCompleted = true
      }
    }
  }
  // #endregion Functions

  return {
    topics,
    filteredTopics,
    currentTopic,
    currentTopicId,
    currentView,
    isFocusMode,
    searchQuery,
    overallProgress,
    selectTopic,
    setView,
    toggleFocus,
    updateProgress,
  }
}
