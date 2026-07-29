export type Source = {
  contractId: string
  contractCode: string
  chunkIndex: number
  excerpt: string
  relevance?: number
}

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  sources?: Source[]
  isNotFound?: boolean
  isStreaming?: boolean
}

export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: Source[] }
  | { type: 'done'; conversationId?: string }
  | { type: 'not_found'; message: string }
  | { type: 'error'; message: string }
