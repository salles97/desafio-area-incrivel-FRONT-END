# Assistente de Contratos — Frontend

Interface web (React + Vite) para upload de PDFs, listagem de contratos indexados e chat com respostas em streaming e citação de fontes.

Este repositório é consumido pelo monorepo de orquestração (`desafio-tecnico-AI`), que sobe backend, frontend, Ollama e Qdrant via Docker Compose.


## Desenvolvimento

```bash
npm install
npm run dev
```

Com `.env.development`, `VITE_USE_MOCK=true` ativa dados e chat simulados (sem backend).

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_USE_MOCK` | `true` — mock local; `false` — chama a API real |
| `VITE_API_URL` | Base da API (vazio em dev usa proxy `/api`) |
| `VITE_API_PROXY_TARGET` | Alvo do proxy Vite (padrão `http://localhost:8000`) |

## Integração com a API

Contratos:

- `GET /api/contracts`
- `POST /api/contracts` — `multipart/form-data`, campo `file`
- `GET /api/contracts/{id}/status` — poll enquanto `indexing`
- `DELETE /api/contracts/{id}`

Chat (SSE):

- `POST /api/chat/stream` — corpo `{ "message", "conversationId?" }`
- Eventos: `delta`, `sources`, `done`, `not_found`, `error`

## Docker

Build da imagem estática + nginx (proxy `/api` → serviço `backend:8000` no compose do projeto principal):
 