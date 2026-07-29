import type { Source } from '../../types/chat'
import './sources-drawer.css'

type SourcesDrawerProps = {
  sources: Source[]
  open: boolean
  onClose: () => void
}

export function SourcesDrawer({ sources, open, onClose }: SourcesDrawerProps) {
  if (!open) return null

  return (
    <div className="sources-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="sources-drawer"
        role="dialog"
        aria-label="Fontes citadas"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sources-drawer__header">
          <h2>Fontes ({sources.length})</h2>
          <button type="button" className="sources-drawer__close" onClick={onClose}>
            ×
          </button>
        </header>
        <ul className="sources-drawer__list">
          {sources.map((s, i) => (
            <li key={`${s.contractId}-${s.chunkIndex}-${i}`} className="sources-drawer__item">
              <div className="sources-drawer__title">
                {s.contractCode} · Trecho {s.chunkIndex}
              </div>
              <blockquote className="sources-drawer__excerpt">{s.excerpt}</blockquote>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
