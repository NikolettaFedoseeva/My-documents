import { ref } from 'vue'

export type LogType = 'log' | 'info' | 'warn' | 'error' | 'return'

export interface LogEntry {
  id: string
  type: LogType
  message: string
  timestamp: string
}

/**
 * Простой стриппер типов TypeScript для выполнения в браузере
 * Удаляет базовые аннотации типов (например `: string`, `: number[]`, `interface ...`, `type ...`)
 */
export const stripTsTypes = (code: string): string => {
  return code
    // Удаляем интерфейсы и type алиасы
    .replace(/interface\s+\w+(\s*<[^>]+>)?\s*\{[\s\S]*?\}/g, '')
    .replace(/type\s+\w+(\s*<[^>]+>)?\s*=\s*[^;]+;/g, '')
    // Удаляем аннотации типов переменных: const x: number = 10 -> const x = 10
    .replace(/(let|const|var)\s+([a-zA-Z0-9_$]+)\s*:\s*[a-zA-Z0-9_$<>[\]|&,\s]+\s*=/g, '$1 $2 =')
    // Удаляем дженерики в вызовах: ref<string>('hello') -> ref('hello')
    .replace(/<[a-zA-Z0-9_$|&,[\]\s]+>\s*\(/g, '(')
    // Удаляем возвращаемые типы функций: ): void => -> ) =>
    .replace(/\)\s*:\s*[a-zA-Z0-9_$<>[\]|&,\s]+\s*=>/g, ') =>')
    .replace(/\)\s*:\s*[a-zA-Z0-9_$<>[\]|&,\s]+\s*\{/g, ') {')
}

export const useCodeRunner = (initialCode = '') => {
  const code = ref<string>(initialCode)
  const defaultCode = ref<string>(initialCode)
  const isRunning = ref<boolean>(false)
  const logs = ref<LogEntry[]>([])
  const executionTimeMs = ref<number | null>(null)
  const error = ref<string | null>(null)

  const formatArg = (arg: unknown): string => {
    if (arg === undefined) return 'undefined'
    if (arg === null) return 'null'
    if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`
    if (typeof arg === 'symbol') return arg.toString()
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        return String(arg)
      }
    }
    return String(arg)
  }

  const addLog = (type: LogType, ...args: unknown[]) => {
    const message = args.map(formatArg).join(' ')
    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`

    logs.value.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      message,
      timestamp,
    })
  }

  const clearLogs = () => {
    logs.value = []
    error.value = null
    executionTimeMs.value = null
  }

  const resetCode = () => {
    code.value = defaultCode.value
    clearLogs()
  }

  const setCode = (newCode: string) => {
    code.value = newCode
    defaultCode.value = newCode
    clearLogs()
  }

  const runCode = async (customCode?: string): Promise<boolean> => {
    const sourceToRun = customCode !== undefined ? customCode : code.value
    clearLogs()
    isRunning.value = true

    const startTime = performance.now()

    // Пользовательский sandbox-консоль
    const sandboxConsole = {
      log: (...args: unknown[]) => addLog('log', ...args),
      info: (...args: unknown[]) => addLog('info', ...args),
      warn: (...args: unknown[]) => addLog('warn', ...args),
      error: (...args: unknown[]) => addLog('error', ...args),
    }

    try {
      const cleanJs = stripTsTypes(sourceToRun)

      // Оборачиваем в асинхронную функцию с изолированной консолью
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const executor = new AsyncFunction('console', cleanJs)

      const result = await executor(sandboxConsole)

      if (result !== undefined) {
        addLog('return', '← Возвращено:', result)
      }

      const endTime = performance.now()
      executionTimeMs.value = Math.round((endTime - startTime) * 100) / 100

      if (logs.value.length === 0) {
        addLog('info', 'ℹ️ Код выполнен без вывода в консоль.')
      }

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      addLog('error', `⛔ Ошибка выполнения: ${message}`)
      const endTime = performance.now()
      executionTimeMs.value = Math.round((endTime - startTime) * 100) / 100
      return false
    } finally {
      isRunning.value = false
    }
  }

  return {
    code,
    defaultCode,
    isRunning,
    logs,
    executionTimeMs,
    error,
    runCode,
    clearLogs,
    resetCode,
    setCode,
  }
}

// Глобальное состояние для управления модальным окном из виджетов
const isPlaygroundModalOpen = ref<boolean>(false)
const playgroundModalCode = ref<string>('')
const playgroundModalFilename = ref<string>('snippet.ts')
const playgroundModalLanguage = ref<string>('typescript')

export const useCodePlayground = () => {
  const open = (options: { code: string; filename?: string; language?: string }) => {
    playgroundModalCode.value = options.code
    playgroundModalFilename.value = options.filename || 'snippet.ts'
    playgroundModalLanguage.value = options.language || 'typescript'
    isPlaygroundModalOpen.value = true
  }

  const close = () => {
    isPlaygroundModalOpen.value = false
  }

  return {
    isOpen: isPlaygroundModalOpen,
    code: playgroundModalCode,
    filename: playgroundModalFilename,
    language: playgroundModalLanguage,
    open,
    close,
  }
}

