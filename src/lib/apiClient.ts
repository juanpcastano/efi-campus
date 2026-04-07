import { refreshTokens } from '#/lib/cognito'
import { useAuthStore } from '#/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { tokens, setSession, clearSession } = useAuthStore.getState()

  if (!tokens) {
    throw new Error('No hay sesión activa')
  }

  const execute = async (idToken: string): Promise<Response> => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  }

  let response = await execute(tokens.idToken)

  if (response.status === 401) {
    try {
      const newTokens = await refreshTokens(tokens.refreshToken)
      setSession(newTokens)
      response = await execute(newTokens.idToken)
    } catch {
      clearSession()
      throw new Error('Sesión expirada, por favor inicia sesión nuevamente')
    }
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(endpoint, { ...options, method: 'DELETE' }),
}
