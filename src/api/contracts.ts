import type { Contract } from '../types/contract'
import { apiFetch, apiJson, isMockMode } from './client'
import * as mock from './mock'

const INDEX_POLL_MS = 2000
const INDEX_POLL_MAX_ATTEMPTS = 60

export async function listContracts(): Promise<Contract[]> {
  if (isMockMode()) return mock.listContracts()
  return apiJson<Contract[]>('/api/contracts')
}

export async function uploadContract(file: File): Promise<Contract> {
  if (isMockMode()) return mock.uploadContract(file)

  const form = new FormData()
  form.append('file', file)
  const response = await apiFetch('/api/contracts', {
    method: 'POST',
    body: form,
  })
  return response.json() as Promise<Contract>
}

export async function getContractStatus(id: string): Promise<Contract> {
  if (isMockMode()) return mock.getContractStatus(id)
  return apiJson<Contract>(`/api/contracts/${id}/status`)
}

export async function deleteContract(id: string): Promise<void> {
  if (isMockMode()) {
    mock.deleteContract(id)
    return
  }
  await apiFetch(`/api/contracts/${id}`, { method: 'DELETE' })
}

export async function pollUntilIndexed(
  id: string,
  onUpdate: (contract: Contract) => void,
): Promise<Contract> {
  let attempts = 0
  let current = await getContractStatus(id)
  onUpdate(current)

  while (current.status === 'indexing' && attempts < INDEX_POLL_MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, INDEX_POLL_MS))
    current = await getContractStatus(id)
    onUpdate(current)
    attempts++
  }

  return current
}

export const MAX_PDF_BYTES = 20 * 1024 * 1024

export function validatePdfFile(file: File): string | null {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Selecione um arquivo PDF.'
  }
  if (file.size > MAX_PDF_BYTES) {
    return 'O PDF deve ter no máximo 20 MB.'
  }
  return null
}
