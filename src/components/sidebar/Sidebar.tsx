import type { Contract } from '../../types/contract'
import { AddPdfControl } from './AddPdfControl'
import { ContractListItem } from './ContractListItem'
import './sidebar.css'

type SidebarProps = {
  contracts: Contract[]
  readyCount: number
  loading: boolean
  uploading: boolean
  error: string | null
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  onRetry: () => void
}

export function Sidebar({
  contracts,
  readyCount,
  loading,
  uploading,
  error,
  onUpload,
  onDelete,
  onRetry,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>CONTRATOS</h1>
        <div className="sidebar-header-counter" aria-label={`${readyCount} contratos prontos`}>
          {readyCount}
        </div>
      </div>

      <div className="sidebar-content">
        <AddPdfControl disabled={uploading} onSelect={onUpload} />
        {uploading && <p className="sidebar-hint">Enviando PDF…</p>}

        {error && (
          <div className="sidebar-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={onRetry}>
              Tentar de novo
            </button>
          </div>
        )}

        {loading ? (
          <p className="sidebar-hint">Carregando…</p>
        ) : contracts.length === 0 ? (
          <p className="sidebar-empty">Nenhum contrato — adicione um PDF.</p>
        ) : (
          <div className="contract-list">
            {contracts.map((c) => (
              <ContractListItem key={c.id} contract={c} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
