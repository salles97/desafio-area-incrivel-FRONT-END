import { useCallback, useEffect, useRef, useState } from 'react'
import type { Contract } from '../types/contract'
import {
  deleteContract as apiDelete,
  listContracts,
  pollUntilIndexed,
  uploadContract,
  validatePdfFile,
} from '../api/contracts'
import { ApiError } from '../api/client'

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollingIds = useRef(new Set<string>())

  const startPolling = useCallback((id: string) => {
    if (pollingIds.current.has(id)) return
    pollingIds.current.add(id)

    void pollUntilIndexed(id, (updated) => {
      setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }).finally(() => {
      pollingIds.current.delete(id)
    })
  }, [])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const data = await listContracts()
      setContracts(data)
      data.filter((c) => c.status === 'indexing').forEach((c) => startPolling(c.id))
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível carregar os contratos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [startPolling])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const data = await listContracts()
        if (!active) return
        setContracts(data)
        data.filter((c) => c.status === 'indexing').forEach((c) => startPolling(c.id))
      } catch (e) {
        if (!active) return
        const msg = e instanceof ApiError ? e.message : 'Não foi possível carregar os contratos.'
        setError(msg)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [startPolling])

  const upload = useCallback(
    async (file: File) => {
      const validation = validatePdfFile(file)
      if (validation) {
        setError(validation)
        return
      }

      setUploading(true)
      setError(null)
      try {
        const created = await uploadContract(file)
        setContracts((prev) => [created, ...prev.filter((c) => c.id !== created.id)])
        if (created.status === 'indexing') {
          startPolling(created.id)
        }
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Falha ao enviar o PDF.'
        setError(msg)
      } finally {
        setUploading(false)
      }
    },
    [startPolling],
  )

  const remove = useCallback(async (id: string) => {
    let previous: Contract[] = []
    setContracts((prev) => {
      previous = prev
      return prev.filter((c) => c.id !== id)
    })
    setError(null)
    try {
      await apiDelete(id)
    } catch (e) {
      setContracts(previous)
      const msg = e instanceof ApiError ? e.message : 'Não foi possível excluir o contrato.'
      setError(msg)
    }
  }, [])

  const readyCount = contracts.filter((c) => c.status === 'ready').length

  return {
    contracts,
    readyCount,
    loading,
    uploading,
    error,
    refresh,
    upload,
    remove,
    clearError: () => setError(null),
  }
}
