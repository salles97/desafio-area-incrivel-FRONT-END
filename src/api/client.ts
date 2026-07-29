export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? ''
  return base.replace(/\/$/, '')
}

export function isMockMode(): boolean {
  return useMock
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path}`

  const response = await fetch(url, init)

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { message?: string; detail?: string }
      message = body.message ?? body.detail ?? message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status)
  }

  return response
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init)
  return response.json() as Promise<T>
}
