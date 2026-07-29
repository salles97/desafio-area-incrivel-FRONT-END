import { useRef } from 'react'
import './sidebar.css'

type AddPdfControlProps = {
  disabled?: boolean
  onSelect: (file: File) => void
}

export function AddPdfControl({ disabled, onSelect }: AddPdfControlProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        className="sidebar-add-pdf"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        + Adicionar PDF
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
          e.target.value = ''
        }}
      />
    </>
  )
}
