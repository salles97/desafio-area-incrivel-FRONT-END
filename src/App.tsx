import { AppShell } from './components/layout/AppShell'
import Sidebar from './components/sidebar/Sidebar'
import ChatPanel from './components/chat/ChatPanel'
import { useContracts } from './hooks/useContracts'
import { useChatStream } from './hooks/useChatStream'

function App() {
  const {
    contracts,
    readyCount,
    loading,
    uploading,
    error,
    refresh,
    upload,
    remove,
    clearError,
  } = useContracts()

  const { messages, isStreaming, error: chatError, sendMessage, clearError: clearChatError } =
    useChatStream()

  return (
    <AppShell
      sidebar={
        <Sidebar
          contracts={contracts}
          readyCount={readyCount}
          loading={loading}
          uploading={uploading}
          error={error}
          onUpload={upload}
          onDelete={remove}
          onRetry={() => {
            clearError()
            void refresh()
          }}
        />
      }
      main={
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          error={chatError}
          onSend={sendMessage}
          onClearError={clearChatError}
        />
      }
    />
  )
}

export default App
