/**
 * Конфигурация подключения к REST API бэкенда LERN Platform
 */

export const API_BASE_URL =
  process.env.VUE_APP_API_URL || 'http://localhost:5000/api'

/**
 * Получение стандартных заголовков авторизации с Bearer-токеном
 */
export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  let token = ''
  try {
    token = localStorage.getItem('lern_token') || ''
  } catch (e) {
    // В случае строгих политик безопасности LocalStorage
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Обертка над fetch с таймаутом и безопасной обработкой ошибок для отказоустойчивости UI
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
      },
      signal: controller.signal,
    })

    clearTimeout(timer)

    let parsedData: any = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      parsedData = await response.json()
    } else {
      const text = await response.text()
      parsedData = text ? { message: text } : null
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: parsedData?.errorMessage || parsedData?.message || `HTTP ${response.status}`,
      }
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData as T,
    }
  } catch (err: any) {
    clearTimeout(timer)
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.name === 'AbortError' ? 'Таймаут соединения с API' : err.message || 'Ошибка сети',
    }
  }
}
