import { useCallback, useRef, useState } from 'react'
import type { ChatMessage } from '../types/chat'
import type { Source } from '../types/chat'
import { streamChat } from '../api/chat'

function newId() {
  return crypto.randomUUID()
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage: ChatMessage = {
      id: newId(),
      role: 'user',
      content: trimmed,
    }

    const assistantId = newId()
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      },
    ])
    setIsStreaming(true)

    let content = ''
    let sources: Source[] | undefined
    let isNotFound = false

    const patchAssistant = (patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      )
    }

    try {
      await streamChat(trimmed, conversationIdRef.current, {
        signal: controller.signal,
        onEvent: (event) => {
          switch (event.type) {
            case 'delta':
              content += event.text
              patchAssistant({ content, isStreaming: true })
              break
            case 'sources':
              sources = event.sources
              patchAssistant({ sources })
              break
            case 'not_found':
              isNotFound = true
              content = event.message
              patchAssistant({ content, isNotFound: true, isStreaming: true })
              break
            case 'done':
              if (event.conversationId) {
                conversationIdRef.current = event.conversationId
              }
              patchAssistant({
                content,
                sources,
                isNotFound,
                isStreaming: false,
              })
              setIsStreaming(false)
              break
            case 'error':
              setError(event.message)
              patchAssistant({
                content: content || event.message,
                isStreaming: false,
              })
              setIsStreaming(false)
              break
            default:
              break
          }
        },
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.isStreaming
            ? { ...m, content, sources, isNotFound, isStreaming: false }
            : m,
        ),
      )
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError('Falha ao enviar mensagem.')
      patchAssistant({ content: 'Não foi possível obter resposta.', isStreaming: false })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming])

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
    clearError: () => setError(null),
  }
}
