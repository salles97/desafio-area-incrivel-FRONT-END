export type ContractStatus = 'indexing' | 'ready' | 'failed'

export type Contract = {
  id: string
  code: string
  chunkCount: number
  status: ContractStatus
  errorMessage?: string
  createdAt: string
}
