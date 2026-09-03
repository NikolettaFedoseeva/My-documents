import { DocCategory, DocItem, DocFeedbackPayload } from "../types";

const MOCK_CATEGORIES: DocCategory[] = [
  {
    id: "getting-started",
    title: "Быстрый старт",
    icon: "🚀",
    description: "Основная информация о платформе LERN и начале обучения",
    items: [
      {
        id: "welcome",
        categoryId: "getting-started",
        title: "Добро пожаловать в LERN",
        description:
          "Вводная статья о возможностях интерактивной учебной платформы",
        author: {
          name: "Алексей Смирнов",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          role: "Lead Architect",
        },
        updatedAt: "2026-08-30",
        readTimeMinutes: 3,
        tags: ["Обзор", "Старт", "LERN"],
        usefulCount: 42,
        notUsefulCount: 1,
        sections: [
          {
            id: "about-platform",
            title: "Что такое LERN?",
            level: 2,
            text: "LERN — это современная микрофронтенд-платформа интерактивного обучения с подсистемами тренажеров, личным кабинетом ученика и преподавательской аналитикой.",
            callout: {
              type: "tip",
              message:
                "Рекомендуется изучить раздел Архитектуры перед началом разработки своих модулей.",
            },
          },
          {
            id: "key-features",
            title: "Ключевые возможности",
            level: 2,
            text: "Платформа предоставляет готовые виджеты для отображения курсов, прохождения интерактивных тестов и проверки кода в реальном времени.",
          },
          {
            id: "quick-example",
            title: "Пример структуры модуля",
            level: 3,
            text: "Вот как выглядит базовый шаблон интеграции с экосистемой LERN:",
            codeSnippet: {
              language: "typescript",
              filename: "src/app/init.ts",
              code: `import { createLernApp } from '@lern/core'

export const app = createLernApp({
  theme: 'dark-glassmorphism',
  features: ['analytics', 'interactive-labs']
})`,
            },
          },
        ],
      },
      {
        id: "navigation-guide",
        title: "Навигация по платформе",
        categoryId: "getting-started",
        description:
          "Как быстро переключаться между кабинетом, тренажерами и курсами",
        author: {
          name: "Елена Васильева",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
          role: "UX Designer",
        },
        updatedAt: "2026-08-28",
        readTimeMinutes: 4,
        tags: ["UX", "Навигация"],
        usefulCount: 29,
        notUsefulCount: 0,
        sections: [
          {
            id: "sidebar-navigation",
            title: "Боковое меню и горячие клавиши",
            level: 2,
            text: "Вы можете использовать комбинированные клавиши Ctrl+K для вызова быстрого поиска по всем разделам платформы.",
            callout: {
              type: "info",
              message:
                "Поиск работает с умным ранжированием по совпадениям ключевых слов.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "Архитектура и FSD",
    icon: "🏗️",
    description: "Стандарты разработки, Feature-Sliced Design и TypeScript",
    items: [
      {
        id: "fsd-standards",
        categoryId: "architecture",
        title: "Стандарты Feature-Sliced Design",
        description:
          "Правила взаимодействия между слоями app, pages, widgets, features, entities, shared",
        author: {
          name: "Михаил Ковалев",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          role: "Tech Lead",
        },
        updatedAt: "2026-09-01",
        readTimeMinutes: 6,
        tags: ["FSD", "Архитектура", "Vue3", "TypeScript"],
        usefulCount: 88,
        notUsefulCount: 2,
        sections: [
          {
            id: "fsd-layers",
            title: "Слои и их ответственность",
            level: 2,
            text: "Каждый слой имеет строгую зону ответственности. Запрещены импорты снизу вверх (например, из shared в features или из entities в widgets).",
            callout: {
              type: "warning",
              message:
                "Импорты между соседними слайсами одного слоя допускаются только через публичный API.",
            },
          },
          {
            id: "script-setup-rules",
            title: "Правила написания Vue компонентов",
            level: 2,
            text: 'Все Vue 3 компоненты пишутся строго с <script setup lang="ts"> и явной типизацией props/emits.',
            codeSnippet: {
              language: "vue",
              filename: "src/entities/doc/ui/my-component.vue",
              code: `<script setup lang="ts">
interface Props {
  title: string
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
</script>`,
            },
          },
        ],
      },
    ],
  },
];

export class DocApiService {
  /**
   * Получение всех категорий и статей
   */
  static async getCategories(): Promise<DocCategory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(MOCK_CATEGORIES)));
      }, 400);
    });
  }

  /**
   * Отправка оценки полезности статьи
   */
  static async rateDoc(payload: DocFeedbackPayload): Promise<{
    success: boolean;
    usefulCount: number;
    notUsefulCount: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        for (const cat of MOCK_CATEGORIES) {
          const doc = cat.items.find((item) => item.id === payload.docId);
          if (doc) {
            if (payload.isUseful) {
              doc.usefulCount += 1;
            } else {
              doc.notUsefulCount += 1;
            }
            return resolve({
              success: true,
              usefulCount: doc.usefulCount,
              notUsefulCount: doc.notUsefulCount,
            });
          }
        }
        resolve({ success: false, usefulCount: 0, notUsefulCount: 0 });
      }, 250);
    });
  }
}
