import {
  formatFileSize,
  matchesAccept,
  validateFiles,
} from '../../../../lern_ui_kit/src/ui/ui-file-input/file-utils'
import {
  computeProgress,
  computeTimerValue,
  formatDuration,
} from '../../../../lern_ui_kit/src/ui/ui-counter/counter-utils'

const makeFile = (name: string, type: string, sizeBytes: number): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

describe('UiFileInput: file-utils', () => {
  test('formatFileSize', () => {
    expect(formatFileSize(500)).toBe('500 Б')
    expect(formatFileSize(2048)).toBe('2 КБ')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 МБ')
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2 МБ')
  })

  describe('matchesAccept', () => {
    test('пустая маска разрешает всё', () => {
      expect(matchesAccept({ name: 'a.exe', type: 'application/x-msdownload' }, '')).toBe(true)
    })

    test('маска по группе MIME', () => {
      expect(matchesAccept({ name: 'a.png', type: 'image/png' }, 'image/*')).toBe(true)
      expect(matchesAccept({ name: 'a.pdf', type: 'application/pdf' }, 'image/*')).toBe(false)
    })

    test('точный MIME и расширение, регистр не важен', () => {
      expect(matchesAccept({ name: 'a.pdf', type: 'application/pdf' }, 'application/pdf')).toBe(true)
      expect(matchesAccept({ name: 'REPORT.PDF', type: '' }, '.pdf')).toBe(true)
      expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, '.pdf, image/png')).toBe(false)
    })
  })

  describe('validateFiles', () => {
    test('принимает подходящие файлы', () => {
      const { accepted, rejected } = validateFiles([makeFile('a.png', 'image/png', 1000)], { accept: 'image/*' })
      expect(accepted).toHaveLength(1)
      expect(rejected).toHaveLength(0)
    })

    test('отклоняет по типу', () => {
      const { rejected } = validateFiles([makeFile('a.pdf', 'application/pdf', 10)], { accept: 'image/*' })
      expect(rejected[0].reason).toBe('type')
    })

    test('отклоняет по размеру', () => {
      const { rejected } = validateFiles([makeFile('big.png', 'image/png', 6 * 1024 * 1024)], { maxSizeMb: 5 })
      expect(rejected[0].reason).toBe('size')
      expect(rejected[0].message).toContain('5 МБ')
    })

    test('лимит количества учитывает уже выбранные файлы', () => {
      const files = [makeFile('1.png', 'image/png', 1), makeFile('2.png', 'image/png', 1), makeFile('3.png', 'image/png', 1)]
      const { accepted, rejected } = validateFiles(files, { maxFiles: 3, currentCount: 1 })
      expect(accepted).toHaveLength(2)
      expect(rejected).toHaveLength(1)
      expect(rejected[0].reason).toBe('limit')
    })

    test('смешанный набор разделяется корректно', () => {
      const { accepted, rejected } = validateFiles(
        [makeFile('ok.png', 'image/png', 10), makeFile('bad.txt', 'text/plain', 10)],
        { accept: 'image/*' },
      )
      expect(accepted.map((f) => f.name)).toEqual(['ok.png'])
      expect(rejected.map((r) => r.file.name)).toEqual(['bad.txt'])
    })
  })
})

describe('UiCounter: counter-utils', () => {
  test('formatDuration', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(3599)).toBe('59:59')
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  test('formatDuration: отрицательные и дробные значения', () => {
    expect(formatDuration(-5)).toBe('00:00')
    expect(formatDuration(59.9)).toBe('00:59')
  })

  describe('computeTimerValue', () => {
    test('обратный отсчёт не уходит в минус', () => {
      expect(computeTimerValue(60, 10_000, 'down')).toBe(50)
      expect(computeTimerValue(60, 60_000, 'down')).toBe(0)
      expect(computeTimerValue(60, 999_000, 'down')).toBe(0)
    })

    test('прямой счёт добавляет прошедшее время к начальному', () => {
      expect(computeTimerValue(30, 5_400, 'up')).toBe(35)
    })

    test('считает от реального времени: долгая пауза в фоне не теряет секунды', () => {
      expect(computeTimerValue(300, 125_000, 'down')).toBe(175)
    })

    test('отрицательное прошедшее время игнорируется', () => {
      expect(computeTimerValue(10, -500, 'down')).toBe(10)
    })
  })

  test('computeProgress ограничен диапазоном 0..1', () => {
    expect(computeProgress(3, 10)).toBeCloseTo(0.3)
    expect(computeProgress(12, 10)).toBe(1)
    expect(computeProgress(-1, 10)).toBe(0)
    expect(computeProgress(1, 0)).toBe(0)
  })
})
