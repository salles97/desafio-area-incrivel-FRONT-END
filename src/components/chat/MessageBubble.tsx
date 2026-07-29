import Markdown from 'react-markdown'
import type { ChatMessage } from '../../types/chat'
import { StreamingIndicator } from './StreamingIndicator'
import './chat.css'

type MessageBubbleProps = {
  message: ChatMessage
  onShowSources?: () => void
}

export function MessageBubble({ message, onShowSources }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const showSourcesButton =
    !isUser &&
    message.sources &&
    message.sources.length > 0 &&
    !message.isStreaming

  return (
    <div
      className={`message-row message-row--${message.role}${message.isNotFound ? ' message-row--not-found' : ''}`}
    >
      <div className={`message-bubble message-bubble--${message.role}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            {message.isNotFound && (
              <span className="message-bubble__badge">Fora dos contratos</span>
            )}
            {message.content ? (
              <div className="message-bubble__markdown">
                <Markdown
                  allowedElements={['p', 'strong', 'ul', 'ol', 'li', 'em']}
                  unwrapDisallowed
                >
                  {message.content}
                </Markdown>
              </div>
            ) : message.isStreaming ? (
              <StreamingIndicator />
            ) : null}
            {message.isStreaming && message.content ? <StreamingIndicator inline /> : null}
          </>
        )}
      </div>
      {showSourcesButton && (
        <button type="button" className="message-sources-btn" onClick={onShowSources}>
          Ver {message.sources!.length} fontes
        </button>
      )}
    </div>
  )
}
