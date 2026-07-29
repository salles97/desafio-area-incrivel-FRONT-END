import type { ChatMessage } from '../../types/chat'
import { ChatComposer } from './ChatComposer'
import { MessageList } from './MessageList'
import './chat.css'

type ChatPanelProps = {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  onSend: (text: string) => void
  onClearError: () => void
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  onSend,
  onClearError,
}: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <header className="chat-panel__header">
        <h1>Assistente de Contratos</h1>
        <p>Tire dúvidas sobre contratos de compra e venda</p>
      </header>

      {error && (
        <div className="chat-panel__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onClearError}>
            Fechar
          </button>
        </div>
      )}

      <MessageList messages={messages} />

      <ChatComposer disabled={isStreaming} onSend={onSend} />
    </div>
  )
}

export default ChatPanel
