import { useState, type FormEvent, type KeyboardEvent } from 'react'
import './chat.css'

type ChatComposerProps = {
  disabled?: boolean
  onSend: (text: string) => void
}

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <textarea
        className="chat-composer__input"
        placeholder="Ex: Qual a multa por distrato do contrato da Maria Fernanda?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={2}
      />
      <button type="submit" className="chat-composer__send" disabled={disabled || !value.trim()}>
        Enviar
      </button>
    </form>
  )
}
