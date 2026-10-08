import { stripTsTypes, useCodeRunner } from '@/features/code-playground/model/use-code-runner'

describe('Code Runner Service & TypeScript Stripper', () => {
  describe('stripTsTypes', () => {
    test('удаляет интерфейсы и type алиасы', () => {
      const code = `
interface User {
  id: string;
  name: string;
}
type Status = 'active' | 'inactive';
const x = 10;
`
      const result = stripTsTypes(code)
      expect(result).not.toContain('interface User')
      expect(result).not.toContain('type Status')
      expect(result).toContain('const x = 10;')
    })

    test('удаляет аннотации типов переменных', () => {
      const code = 'const count: number = 42;'
      const result = stripTsTypes(code)
      expect(result).toBe('const count = 42;')
    })

    test('удаляет возвращаемые типы функций', () => {
      const code = 'const add = (a, b): number => a + b;'
      const result = stripTsTypes(code)
      expect(result).toBe('const add = (a, b) => a + b;')
    })
  })

  describe('useCodeRunner execution', () => {
    test('выполняет базовый код и перехватывает console.log', async () => {
      const runner = useCodeRunner('console.log("Тест вывода в консоль", 123);')
      const success = await runner.runCode()

      expect(success).toBe(true)
      expect(runner.logs.value.length).toBeGreaterThan(0)
      const log = runner.logs.value.find((l) => l.type === 'log')
      expect(log).toBeDefined()
      expect(log?.message).toContain('Тест вывода в консоль 123')
      expect(runner.error.value).toBeNull()
    })

    test('возвращает результат вычисленного выражения', async () => {
      const runner = useCodeRunner('return [1, 2, 3].map(n => n * 2);')
      const success = await runner.runCode()

      expect(success).toBe(true)
      const returnLog = runner.logs.value.find((l) => l.type === 'return')
      expect(returnLog).toBeDefined()
      expect(returnLog?.message).toContain('2')
      expect(returnLog?.message).toContain('4')
      expect(returnLog?.message).toContain('6')
    })

    test('корректно перехватывает ошибки времени выполнения (Runtime Error)', async () => {
      const runner = useCodeRunner('const obj = null; obj.someMethod();')
      const success = await runner.runCode()

      expect(success).toBe(false)
      expect(runner.error.value).toBeTruthy()
      const errorLog = runner.logs.value.find((l) => l.type === 'error')
      expect(errorLog).toBeDefined()
      expect(errorLog?.message).toContain('Ошибка выполнения')
    })

    test('очищает логи по вызову clearLogs()', async () => {
      const runner = useCodeRunner('console.log("Hello");')
      await runner.runCode()
      expect(runner.logs.value.length).toBeGreaterThan(0)

      runner.clearLogs()
      expect(runner.logs.value.length).toBe(0)
      expect(runner.executionTimeMs.value).toBeNull()
    })
  })
})
