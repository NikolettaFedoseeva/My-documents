import {
  buildMonthGrid,
  daysInMonth,
  formatDisplay,
  isOutOfRange,
  parseIso,
  shiftMonth,
  toIso,
  todayIso,
} from '../../../../lern_ui_kit/src/ui/ui-date-picker/date-utils'
import {
  buildRange,
  formatTime,
  isHourOutOfRange,
  isTimeOutOfRange,
  parseTime,
  snapMinutes,
} from '../../../../lern_ui_kit/src/ui/ui-time-picker/time-utils'

describe('UiDatePicker: date-utils', () => {
  test('parseIso разбирает корректную дату', () => {
    expect(parseIso('2026-11-02')).toEqual({ year: 2026, month: 10, day: 2 })
  })

  test.each(['', null, undefined, '2026-2-3', '02.11.2026', '2026-02-31', '2026-13-01', '2025-02-29'])(
    'parseIso отклоняет некорректное значение %p',
    (value) => {
      expect(parseIso(value as string)).toBeNull()
    },
  )

  test('parseIso принимает 29 февраля только в високосный год', () => {
    expect(parseIso('2028-02-29')).not.toBeNull()
    expect(parseIso('2026-02-29')).toBeNull()
  })

  test('toIso дополняет нулями', () => {
    expect(toIso(2026, 0, 5)).toBe('2026-01-05')
  })

  test('todayIso использует локальную дату, а не UTC', () => {
    expect(todayIso(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31')
  })

  test('daysInMonth учитывает високосный год', () => {
    expect(daysInMonth(2028, 1)).toBe(29)
    expect(daysInMonth(2026, 1)).toBe(28)
    expect(daysInMonth(2026, 3)).toBe(30)
  })

  describe('buildMonthGrid', () => {
    test('сетка кратна 7 и содержит все дни месяца', () => {
      const grid = buildMonthGrid(2026, 10) // ноябрь 2026
      expect(grid.length % 7).toBe(0)
      expect(grid.filter((c) => c.inMonth)).toHaveLength(30)
    })

    test('неделя начинается с понедельника: 1 ноября 2026 — воскресенье → 6 дней октября перед ним', () => {
      const grid = buildMonthGrid(2026, 10)
      expect(grid[6].iso).toBe('2026-11-01')
      expect(grid[0].iso).toBe('2026-10-26')
      expect(grid[0].inMonth).toBe(false)
    })

    test('месяц, начинающийся с понедельника, не имеет дней предыдущего месяца', () => {
      // 1 июня 2026 — понедельник
      expect(buildMonthGrid(2026, 5)[0]).toMatchObject({ iso: '2026-06-01', inMonth: true })
    })

    test('переход через границу года: декабрь заканчивается днями января', () => {
      const grid = buildMonthGrid(2026, 11)
      const last = grid[grid.length - 1]
      expect(last.inMonth).toBe(false)
      expect(last.iso.startsWith('2027-01')).toBe(true)
    })

    test('даты в сетке уникальны и идут по порядку', () => {
      const isos = buildMonthGrid(2026, 1).map((c) => c.iso)
      expect(new Set(isos).size).toBe(isos.length)
      expect([...isos].sort()).toEqual(isos)
    })
  })

  test('shiftMonth переходит через год в обе стороны', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 })
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
    expect(shiftMonth(2026, 5, 14)).toEqual({ year: 2027, month: 7 })
  })

  test('isOutOfRange учитывает min и max включительно', () => {
    expect(isOutOfRange('2026-05-10', '2026-05-10', '2026-05-20')).toBe(false)
    expect(isOutOfRange('2026-05-20', '2026-05-10', '2026-05-20')).toBe(false)
    expect(isOutOfRange('2026-05-09', '2026-05-10', '2026-05-20')).toBe(true)
    expect(isOutOfRange('2026-05-21', '2026-05-10', '2026-05-20')).toBe(true)
    expect(isOutOfRange('2030-01-01')).toBe(false)
  })

  test('formatDisplay → ДД.ММ.ГГГГ, для мусора — пустая строка', () => {
    expect(formatDisplay('2026-11-02')).toBe('02.11.2026')
    expect(formatDisplay('abc')).toBe('')
    expect(formatDisplay(null)).toBe('')
  })
})

describe('UiTimePicker: time-utils', () => {
  test('parseTime разбирает и отклоняет значения', () => {
    expect(parseTime('09:05')).toEqual({ hours: 9, minutes: 5 })
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 })
    for (const bad of ['24:00', '12:60', '9:05', '', null, 'ab:cd']) {
      expect(parseTime(bad as string)).toBeNull()
    }
  })

  test('formatTime дополняет нулями', () => {
    expect(formatTime(7, 3)).toBe('07:03')
  })

  test('buildRange учитывает шаг и защищён от шага < 1', () => {
    expect(buildRange(60, 15)).toEqual([0, 15, 30, 45])
    expect(buildRange(24)).toHaveLength(24)
    expect(buildRange(5, 0)).toEqual([0, 1, 2, 3, 4])
  })

  test('isTimeOutOfRange', () => {
    expect(isTimeOutOfRange('09:00', '09:00', '18:00')).toBe(false)
    expect(isTimeOutOfRange('08:59', '09:00', '18:00')).toBe(true)
    expect(isTimeOutOfRange('18:01', '09:00', '18:00')).toBe(true)
  })

  test('isHourOutOfRange: час доступен, если хоть одна минута в диапазоне', () => {
    expect(isHourOutOfRange(8, '09:00', '18:00')).toBe(true)
    expect(isHourOutOfRange(9, '09:30', '18:00')).toBe(false) // 09:30..09:59 допустимы
    expect(isHourOutOfRange(18, '09:00', '18:00')).toBe(false) // 18:00 допустимо
    expect(isHourOutOfRange(19, '09:00', '18:00')).toBe(true)
  })

  test('snapMinutes округляет к шагу и не выходит за 59', () => {
    expect(snapMinutes(7, 5)).toBe(5)
    expect(snapMinutes(8, 5)).toBe(10)
    expect(snapMinutes(58, 15)).toBe(45)
    expect(snapMinutes(59, 5)).toBe(55)
    expect(snapMinutes(30, 1)).toBe(30)
  })
})
