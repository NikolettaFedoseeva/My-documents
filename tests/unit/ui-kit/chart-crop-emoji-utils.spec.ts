import {
  buildDonutSlices,
  buildLinePoints,
  buildTicks,
  niceMax,
  pickColor,
  scaleLinear,
  toPolylinePath,
  DEFAULT_PALETTE,
} from '../../../../lern_ui_kit/src/ui/ui-chart/chart-utils'
import {
  clampOffset,
  computeCoverScale,
  computeCropRect,
  computeOutputSize,
} from '../../../../lern_ui_kit/src/ui/ui-cropper/crop-utils'
import { buildParticles } from '../../../../lern_ui_kit/src/ui/ui-emoji-animation/emoji-utils'

describe('UiChart: chart-utils', () => {
  describe('niceMax', () => {
    test.each([
      [0, 1],
      [-5, 1],
      [7, 10],
      [23, 25],
      [120, 200],
      [0.3, 0.5],
      [100, 100],
    ])('niceMax(%p) = %p', (input, expected) => {
      expect(niceMax(input)).toBeCloseTo(expected)
    })

    test('NaN и Infinity не ломают шкалу', () => {
      expect(niceMax(NaN)).toBe(1)
      expect(niceMax(Infinity)).toBe(1)
    })

    test('результат всегда ≥ входа', () => {
      for (const v of [1, 1.1, 3, 9.9, 42, 777, 12345]) {
        expect(niceMax(v)).toBeGreaterThanOrEqual(v)
      }
    })
  })

  test('buildTicks делит ось поровну', () => {
    expect(buildTicks(100, 4)).toEqual([0, 25, 50, 75, 100])
    expect(buildTicks(10, 0)).toEqual([0, 10])
  })

  test('scaleLinear ограничивает значения и безопасен при max=0', () => {
    expect(scaleLinear(50, 100, 200)).toBe(100)
    expect(scaleLinear(500, 100, 200)).toBe(200)
    expect(scaleLinear(-5, 100, 200)).toBe(0)
    expect(scaleLinear(5, 0, 200)).toBe(0)
  })

  describe('buildLinePoints', () => {
    const padding = { top: 10, right: 10, bottom: 10, left: 10 }

    test('крайние точки лежат на границах области, ось Y инвертирована', () => {
      const pts = buildLinePoints([0, 100], 100, 110, 110, padding)
      expect(pts[0]).toEqual({ x: 10, y: 100 }) // значение 0 — внизу
      expect(pts[1]).toEqual({ x: 100, y: 10 }) // максимум — вверху
    })

    test('одна точка центрируется по X', () => {
      expect(buildLinePoints([50], 100, 110, 110, padding)[0].x).toBe(55)
    })

    test('пустой массив → нет точек', () => {
      expect(buildLinePoints([], 100, 100, 100, padding)).toEqual([])
    })
  })

  test('toPolylinePath строит путь M…L…', () => {
    expect(toPolylinePath([{ x: 1, y: 2 }, { x: 3, y: 4 }])).toBe('M1.00,2.00 L3.00,4.00')
    expect(toPolylinePath([])).toBe('')
  })

  describe('buildDonutSlices', () => {
    test('доли в сумме дают 1', () => {
      const slices = buildDonutSlices([1, 2, 3, 4], 100, 100, 90, 50)
      expect(slices.reduce((s, x) => s + x.fraction, 0)).toBeCloseTo(1)
    })

    test('нулевые и отрицательные значения пропускаются, индексы сохраняются', () => {
      const slices = buildDonutSlices([5, 0, -3, 5], 100, 100, 90, 50)
      expect(slices.map((s) => s.index)).toEqual([0, 3])
      expect(slices[0].fraction).toBeCloseTo(0.5)
    })

    test('все нули → пусто', () => {
      expect(buildDonutSlices([0, 0], 100, 100, 90, 50)).toEqual([])
    })

    test('единственный сектор рисуется полным кольцом (две полудуги внешнего радиуса)', () => {
      const [slice] = buildDonutSlices([10], 100, 100, 90, 50)
      expect(slice.fraction).toBe(1)
      expect((slice.path.match(/A90,90/g) || []).length).toBe(2)
    })

    test('сектор больше 180° использует флаг large-arc', () => {
      const [first] = buildDonutSlices([3, 1], 100, 100, 90, 50)
      expect(first.path).toContain('A90,90 0 1 1')
    })
  })

  test('pickColor: свой цвет приоритетнее палитры, палитра зациклена', () => {
    expect(pickColor({ label: 'a', value: 1, color: '#fff' }, 0)).toBe('#fff')
    expect(pickColor({ label: 'a', value: 1 }, 0)).toBe(DEFAULT_PALETTE[0])
    expect(pickColor({ label: 'a', value: 1 }, DEFAULT_PALETTE.length)).toBe(DEFAULT_PALETTE[0])
  })
})

describe('UiCropper: crop-utils', () => {
  const image = { width: 2000, height: 1000 }
  const box = { width: 300, height: 300 }

  test('computeCoverScale покрывает рамку по меньшей стороне', () => {
    expect(computeCoverScale(image, box)).toBeCloseTo(0.3) // 300/1000
    expect(computeCoverScale({ width: 100, height: 400 }, box)).toBe(3) // 300/100
  })

  test('computeCoverScale: нулевой размер изображения не даёт деления на ноль', () => {
    expect(computeCoverScale({ width: 0, height: 0 }, box)).toBe(1)
  })

  test('clampOffset не даёт выйти за изображение', () => {
    // изображение на экране 600px, рамка 300 → максимум ±150
    expect(clampOffset(500, 600, 300)).toBe(150)
    expect(clampOffset(-500, 600, 300)).toBe(-150)
    expect(clampOffset(40, 600, 300)).toBe(40)
  })

  test('clampOffset: изображение не больше рамки → сдвиг невозможен', () => {
    expect(clampOffset(50, 300, 300)).toBe(0)
  })

  describe('computeCropRect', () => {
    test('без сдвига — центральная область', () => {
      const scale = computeCoverScale(image, box) // 0.3
      const rect = computeCropRect(image, box, scale, 0, 0)
      expect(rect.sw).toBeCloseTo(1000)
      expect(rect.sh).toBeCloseTo(1000)
      expect(rect.sx).toBeCloseTo(500)
      expect(rect.sy).toBeCloseTo(0)
    })

    test('сдвиг изображения вправо смещает область влево в исходнике', () => {
      const scale = computeCoverScale(image, box)
      const rect = computeCropRect(image, box, scale, 150, 0) // 150px на экране = 500px исходника
      expect(rect.sx).toBeCloseTo(0)
    })

    test('при зуме ×2 область вдвое меньше', () => {
      const scale = computeCoverScale(image, box) * 2
      const rect = computeCropRect(image, box, scale, 0, 0)
      expect(rect.sw).toBeCloseTo(500)
      expect(rect.sh).toBeCloseTo(500)
    })

    test('область никогда не выходит за границы изображения', () => {
      const scale = computeCoverScale(image, box)
      const rect = computeCropRect(image, box, scale, 99999, -99999)
      expect(rect.sx).toBeGreaterThanOrEqual(0)
      expect(rect.sy).toBeGreaterThanOrEqual(0)
      expect(rect.sx + rect.sw).toBeLessThanOrEqual(image.width + 1e-6)
      expect(rect.sy + rect.sh).toBeLessThanOrEqual(image.height + 1e-6)
    })
  })

  test('computeOutputSize сохраняет пропорции и ограничивает длинную сторону', () => {
    expect(computeOutputSize(1, 512)).toEqual({ width: 512, height: 512 })
    expect(computeOutputSize(2, 400)).toEqual({ width: 400, height: 200 })
    expect(computeOutputSize(0.5, 400)).toEqual({ width: 200, height: 400 })
    expect(computeOutputSize(0, 100)).toEqual({ width: 100, height: 100 })
  })
})

describe('UiEmojiAnimation: emoji-utils', () => {
  const seeded = (): (() => number) => {
    let seed = 7
    return () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
  }

  const base = { emojis: ['🎉', '✨'], distance: 100, duration: 1000 }

  test('создаёт запрошенное число частиц, но не больше 60', () => {
    expect(buildParticles({ ...base, count: 10, mode: 'burst', random: seeded() })).toHaveLength(10)
    expect(buildParticles({ ...base, count: 500, mode: 'burst', random: seeded() })).toHaveLength(60)
  })

  test('пустые эмодзи или count ≤ 0 → нет частиц', () => {
    expect(buildParticles({ ...base, emojis: [], count: 5, mode: 'burst' })).toEqual([])
    expect(buildParticles({ ...base, count: 0, mode: 'burst' })).toEqual([])
  })

  test('burst: частицы разлетаются не дальше distance', () => {
    const particles = buildParticles({ ...base, count: 20, mode: 'burst', random: seeded() })
    for (const p of particles) {
      expect(Math.hypot(p.dx, p.dy)).toBeLessThanOrEqual(base.distance + 1)
    }
  })

  test('rise: частицы летят вверх (dy < 0)', () => {
    const particles = buildParticles({ ...base, count: 20, mode: 'rise', random: seeded() })
    expect(particles.every((p) => p.dy < 0)).toBe(true)
  })

  test('rain: частицы падают вниз (dy > 0)', () => {
    const particles = buildParticles({ ...base, count: 20, mode: 'rain', random: seeded() })
    expect(particles.every((p) => p.dy > 0)).toBe(true)
  })

  test('эмодзи берутся только из переданного набора', () => {
    const particles = buildParticles({ ...base, count: 30, mode: 'burst', random: seeded() })
    expect(particles.every((p) => base.emojis.includes(p.emoji))).toBe(true)
  })

  test('даже при random() = 0.999… индекс эмодзи не выходит за массив', () => {
    const particles = buildParticles({ ...base, count: 5, mode: 'burst', random: () => 0.9999999 })
    expect(particles.every((p) => base.emojis.includes(p.emoji))).toBe(true)
  })

  test('длительность и задержка неотрицательны', () => {
    const particles = buildParticles({ ...base, count: 20, mode: 'rain', random: seeded() })
    expect(particles.every((p) => p.delay >= 0 && p.duration > 0)).toBe(true)
  })
})
