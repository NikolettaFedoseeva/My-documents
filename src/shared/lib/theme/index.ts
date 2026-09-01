import { ref } from 'vue'

export type AppTheme =
  | 'codex-navy'
  | 'codex-burgundy'
  | 'mindful-sage'
  | 'futuristic-light'
  | 'pastel-clay'
  | 'aura-holographic'
  | 'dark-cyber'

export interface ThemeOption {
  id: AppTheme
  name: string
  icon: string
  description: string
}

export const THEMES: ThemeOption[] = [
  {
    id: 'codex-navy',
    name: 'Codex Navy (Справочник Синий)',
    icon: '🧭',
    description: 'Морской синий фон шапки & светлый пергамент',
  },
  {
    id: 'codex-burgundy',
    name: 'Codex Burgundy (Справочник Бордо)',
    icon: '🍷',
    description: 'Бордово-виноградный фон шапки & теплый крем',
  },
  {
    id: 'mindful-sage',
    name: 'Mindful Sage',
    icon: '🧘‍♀️',
    description: 'Матовое шалфейное стекло Mindora',
  },
  {
    id: 'futuristic-light',
    name: 'Futuristic Light',
    icon: '⚡',
    description: 'Светлый Sci-Fi макет Zenith',
  },
  {
    id: 'pastel-clay',
    name: 'Pastel Clay',
    icon: '🎨',
    description: 'Мягкий пастельный 3D-стиль (Claymorphism)',
  },
  {
    id: 'aura-holographic',
    name: 'Aura Holographic',
    icon: '🌈',
    description: 'Перламутровое стекло с радужным свечением',
  },
  {
    id: 'dark-cyber',
    name: 'Dark Cyber',
    icon: '🌌',
    description: 'Строгий тёмно-синий неоновый High-Tech UI',
  },
]

const currentTheme = ref<AppTheme>('codex-navy')

export const useTheme = () => {
  const initTheme = () => {
    const saved = localStorage.getItem('lern_theme') as AppTheme | null
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved)
    } else {
      setTheme('codex-navy')
    }
  }

  const setTheme = (theme: AppTheme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('lern_theme', theme)
  }

  return {
    currentTheme,
    themes: THEMES,
    initTheme,
    setTheme,
  }
}
