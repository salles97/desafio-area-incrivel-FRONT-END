import type { Contract } from '../../types/contract'
import './sidebar.css'

type ContractListItemProps = {
  contract: Contract
  onDelete: (id: string) => void
}

function statusLabel(contract: Contract): string {
  if (contract.status === 'indexing') return 'Indexando…'
  if (contract.status === 'failed') {
    return contract.errorMessage ?? 'Falha na indexação'
  }
  return `${contract.chunkCount} trechos`
}

export function ContractListItem({ contract, onDelete }: ContractListItemProps) {
  const handleDelete = () => {
    const ok = window.confirm(`Excluir o contrato ${contract.code}?`)
    if (ok) onDelete(contract.id)
  }

  return (
    <div
      className={`contract-item${contract.status === 'failed' ? ' contract-item--failed' : ''}`}
    >
      <div className="contract-item__body">
        <span className="contract-item__code">{contract.code}</span>
        <span className="contract-item__meta">{statusLabel(contract)}</span>
      </div>
      <button
        type="button"
        className="contract-item__delete"
        aria-label={`Excluir ${contract.code}`}
        onClick={handleDelete}
      >
        ×
      </button>
    </div>
  )
}
