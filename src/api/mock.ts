import type { Contract } from '../types/contract'
import type { ChatStreamEvent } from '../types/chat'
import type { Source } from '../types/chat'

const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    code: 'CVV-2023-0147',
    chunkCount: 12,
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'CVV-2023-0201',
    chunkCount: 15,
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: 'CVV-2021-0089',
    chunkCount: 9,
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    code: 'CVV-2024-0312',
    chunkCount: 11,
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    code: 'CVV-2024-0445',
    chunkCount: 8,
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
]

let contracts = [...MOCK_CONTRACTS]

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function extractCodeFromFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, '')
  const match = base.match(/CVV-\d{4}-\d{4}/i)
  return match ? match[0].toUpperCase() : base.slice(0, 24) || 'CONTRATO-NOVO'
}

export async function listContracts(): Promise<Contract[]> {
  await delay(200)
  return [...contracts]
}

export async function uploadContract(file: File): Promise<Contract> {
  await delay(400)
  const id = crypto.randomUUID()
  const code = extractCodeFromFilename(file.name)
  const contract: Contract = {
    id,
    code,
    chunkCount: 0,
    status: 'indexing',
    createdAt: new Date().toISOString(),
  }
  contracts = [contract, ...contracts]

  void (async () => {
    await delay(2500)
    const idx = contracts.findIndex((c) => c.id === id)
    if (idx === -1) return
    contracts[idx] = {
      ...contracts[idx],
      status: 'ready',
      chunkCount: 8 + Math.floor(Math.random() * 10),
    }
  })()

  return contract
}

export async function getContractStatus(id: string): Promise<Contract> {
  await delay(150)
  const found = contracts.find((c) => c.id === id)
  if (!found) throw new Error('Contrato não encontrado')
  return { ...found }
}

export function deleteContract(id: string): void {
  contracts = contracts.filter((c) => c.id !== id)
}

const MOCK_SOURCES: Source[] = [
  {
    contractId: '2',
    contractCode: 'CVV-2023-0201',
    chunkIndex: 4,
    excerpt:
      'Compradora: Maria Fernanda Santos. Cláusula 7 — DO DISTRATO: em caso de desistência imotivada pela compradora...',
  },
  {
    contractId: '2',
    contractCode: 'CVV-2023-0201',
    chunkIndex: 2,
    excerpt:
      'Multa compensatória de 15% (quinze por cento) sobre o valor total do contrato, paga pela parte que der causa ao distrato...',
  },
]

async function streamText(text: string, onDelta: (chunk: string) => void, signal?: AbortSignal) {
  const words = text.split(/(\s+)/)
  for (const w of words) {
    if (signal?.aborted) return
    onDelta(w)
    await delay(25 + Math.random() * 35)
  }
}

export async function streamChat(
  message: string,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  await delay(300)
  const lower = message.toLowerCase()

  if (lower.includes('não existe') || lower.includes('inventado') || lower.includes('xyz-9999')) {
    onEvent({
      type: 'not_found',
      message:
        'Não encontrei essa informação nos contratos indexados. Tente reformular ou verifique se o PDF correto foi enviado.',
    })
    onEvent({ type: 'done' })
    return
  }

  if (lower.includes('maria') || lower.includes('distrato') || lower.includes('multa')) {
    const answer = `Com base no contrato **CVV-2023-0201** da compradora Maria Fernanda Santos (Trecho 4), a multa por distrato está na **Cláusula 7 — DO DISTRATO** (Trecho 2):

- **15%** sobre o valor total do contrato, se a desistência for imotivada pela compradora;
- **7%** em hipóteses específicas previstas no contrato, conforme o trecho citado.`

    await streamText(answer, (text) => onEvent({ type: 'delta', text }), signal)
    if (signal?.aborted) return
    onEvent({ type: 'sources', sources: MOCK_SOURCES })
    onEvent({ type: 'done', conversationId: 'mock-conversation' })
    return
  }

  const generic =
    'Com base nos contratos indexados, posso ajudar com cláusulas, multas e partes envolvidas. No modo demonstração, tente perguntar sobre **multa por distrato** da **Maria Fernanda**.'

  await streamText(generic, (text) => onEvent({ type: 'delta', text }), signal)
  if (signal?.aborted) return
  onEvent({ type: 'done', conversationId: 'mock-conversation' })
}
