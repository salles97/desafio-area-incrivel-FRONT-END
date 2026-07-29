import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../../types/chat'
import type { Source } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
import { SourcesDrawer } from './SourcesDrawer'
import './chat.css'

type MessageListProps = {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [drawerSources, setDrawerSources] = useState<Source[] | null>(null)
  const userScrolledUp = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      userScrolledUp.current = !nearBottom
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <>
      <div className="message-list" ref={containerRef}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onShowSources={
              m.sources?.length
                ? () => setDrawerSources(m.sources!)
                : undefined
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <SourcesDrawer
        sources={drawerSources ?? []}
        open={drawerSources !== null}
        onClose={() => setDrawerSources(null)}
      />
    </>
  )
}
