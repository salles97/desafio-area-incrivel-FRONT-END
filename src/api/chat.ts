import type { ChatStreamEvent } from '../types/chat'
import type { Source } from '../types/chat'
import { getApiBaseUrl, isMockMode } from './client'
import * as mock from './mock'

export type ChatStreamHandlers = {
  onEvent: (event: ChatStreamEvent) => void
  signal?: AbortSignal
}

export async function streamChat(
  message: string,
  conversationId: string | undefined,
  handlers: ChatStreamHandlers,
): Promise<void> {
  if (isMockMode()) {
    await mock.streamChat(message, handlers.onEvent, handlers.signal)
    return
  }

  const base = getApiBaseUrl()
  const response = await fetch(`${base}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ message, conversationId }),
    signal: handlers.signal,
  })

  if (!response.ok) {
    let errMsg = response.statusText
    try {
      const body = (await response.json()) as { message?: string }
      errMsg = body.message ?? errMsg
    } catch {
      /* ignore */
    }
    handlers.onEvent({ type: 'error', message: errMsg })
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    handlers.onEvent({ type: 'error', message: 'Resposta sem stream.' })
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  const dispatch = (rawEvent: string, rawData: string) => {
    if (!rawData) return
    let payload: unknown
    try {
      payload = JSON.parse(rawData)
    } catch {
      return
    }

    switch (rawEvent) {
      case 'delta': {
        const text = (payload as { text?: string }).text ?? ''
        if (text) handlers.onEvent({ type: 'delta', text })
        break
      }
      case 'sources': {
        const sources = (payload as { sources?: Source[] }).sources ?? []
        handlers.onEvent({ type: 'sources', sources })
        break
      }
      case 'done': {
        const conversationId = (payload as { conversationId?: string }).conversationId
        handlers.onEvent({ type: 'done', conversationId })
        break
      }
      case 'not_found': {
        const message = (payload as { message?: string }).message ?? 'Informação não encontrada nos contratos.'
        handlers.onEvent({ type: 'not_found', message })
        break
      }
      case 'error': {
        const message = (payload as { message?: string }).message ?? 'Erro no chat.'
        handlers.onEvent({ type: 'error', message })
        break
      }
      default:
        break
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const block of parts) {
      const lines = block.split('\n')
      let eventName = 'message'
      const dataLines: string[] = []
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim())
        }
      }
      dispatch(eventName, dataLines.join('\n'))
    }
  }
}
