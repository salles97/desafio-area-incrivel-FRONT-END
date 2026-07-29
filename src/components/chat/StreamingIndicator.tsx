import './chat.css'

type StreamingIndicatorProps = {
  inline?: boolean
}

export function StreamingIndicator({ inline }: StreamingIndicatorProps) {
  return (
    <span className={`streaming-indicator${inline ? ' streaming-indicator--inline' : ''}`}>
      <span className="streaming-indicator__dot" />
      <span className="streaming-indicator__dot" />
      <span className="streaming-indicator__dot" />
    </span>
  )
}
