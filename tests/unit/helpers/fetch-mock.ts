/**
 * Хелперы для мока глобального fetch в unit-тестах сервисов
 */

export interface MockResponseInit {
  ok?: boolean
  status?: number
  json?: unknown
}

/** Создаёт объект, похожий на Response, для подстановки в fetch */
export const makeResponse = ({ ok = true, status = 200, json = {} }: MockResponseInit = {}): Response => {
  return {
    ok,
    status,
    headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null) },
    json: async () => json,
    text: async () => JSON.stringify(json),
  } as unknown as Response
}

/** Подменяет global.fetch и возвращает jest-мок */
export const mockFetch = (): jest.Mock => {
  const fn = jest.fn()
  ;(global as unknown as { fetch: jest.Mock }).fetch = fn
  return fn
}

/** fetch, имитирующий недоступный сервер */
export const mockNetworkDown = (): jest.Mock => {
  const fn = mockFetch()
  fn.mockRejectedValue(new TypeError('Failed to fetch'))
  return fn
}
